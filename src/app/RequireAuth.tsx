import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'

/** Protege las rutas privadas. La barrera real son las políticas RLS de la base. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const location = useLocation()
  if (auth.status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-page" role="status" aria-label="Cargando">
        <Loader2 className="animate-spin text-action" size={28} aria-hidden="true" />
      </div>
    )
  }
  if (auth.status === 'unconfigured') return <Navigate to="/estado" replace />
  if (auth.status === 'signed-out') return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  return <>{children}</>
}
