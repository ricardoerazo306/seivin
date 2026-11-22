import type { Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'

type AuthState =
  | { status: 'unconfigured'; session: null }
  | { status: 'loading'; session: null }
  | { status: 'signed-out'; session: null; recovery: boolean }
  | { status: 'signed-in'; session: Session; recovery: boolean }

const AuthContext = createContext<AuthState>({ status: 'loading', session: null })

/** Mantiene la sesión sincronizada con Supabase (renovación automática incluida). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() =>
    supabase ? { status: 'loading', session: null } : { status: 'unconfigured', session: null },
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
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}

/** Cliente garantizado para páginas privadas (solo se usan con sesión). */
// eslint-disable-next-line react-refresh/only-export-components
export function requireClient() {
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}
