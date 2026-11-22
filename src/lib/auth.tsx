import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { demoClient, demoSession, exitDemo, isDemo, onDemoChange } from '../demo/mode'
import { supabase } from './supabase'

type AuthState =
  | { status: 'unconfigured'; session: null }
  | { status: 'loading'; session: null }
  | { status: 'signed-out'; session: null; recovery: boolean }
  | { status: 'signed-in'; session: Session; recovery: boolean; demo?: boolean }

const AuthContext = createContext<AuthState>({ status: 'loading', session: null })

/** Mantiene la sesión sincronizada con Supabase (renovación automática incluida). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [real, setState] = useState<AuthState>(() =>
    supabase ? { status: 'loading', session: null } : { status: 'unconfigured', session: null },
  )
  const [demo, setDemo] = useState(isDemo)
  const qc = useQueryClient()

  useEffect(
    () =>
      onDemoChange(() => {
        qc.clear()
        setDemo(isDemo())
      }),
    [qc],
  )

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setState(
        data.session
          ? { status: 'signed-in', session: data.session, recovery: false }
          : { status: 'signed-out', session: null, recovery: false },
      )
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const recovery = event === 'PASSWORD_RECOVERY'
      // Al salir se borra la caché: nada de una cuenta queda visible para la siguiente.
      if (event === 'SIGNED_OUT') qc.clear()
      setState(
        session
          ? { status: 'signed-in', session, recovery }
          : { status: 'signed-out', session: null, recovery: false },
      )
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [qc])

  const value: AuthState = demo ? { status: 'signed-in', session: demoSession, recovery: false, demo: true } : real
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}

/** Cliente garantizado para páginas privadas (solo se usan con sesión). */
// eslint-disable-next-line react-refresh/only-export-components
export function requireClient() {
  if (isDemo()) return demoClient()
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}

/** Cierra la sesión real o sale del modo exploración. */
// eslint-disable-next-line react-refresh/only-export-components
export async function signOutAll() {
  if (isDemo()) return exitDemo()
  await supabase?.auth.signOut()
}
