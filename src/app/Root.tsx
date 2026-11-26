import { useEffect, useState } from 'react'
import { isRouteErrorResponse, Link, Outlet, ScrollRestoration, useNavigation, useRouteError } from 'react-router'
import { CheckCircle2, AlertCircle, WifiOff, X } from 'lucide-react'
import { Logo } from '../components/Logo'
import { dismiss, useToasts } from '../lib/toast'

/** Capa común a todas las páginas: scroll al cambiar de página, avisos y estado de conexión. */
export function Root() {
  return (
    <>
      <NavProgress />
      <Outlet />
      <ScrollRestoration />
      <Toaster />
      <OfflineBanner />
    </>
  )
}

function NavProgress() {
  const navigation = useNavigation()
  if (navigation.state === 'idle') return null
  return <div aria-hidden="true" className="nav-progress fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-menta" />
}

function Toaster() {
  const toasts = useToasts()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-petroleo py-2.5 pr-2 pl-4 text-sm font-medium text-blanco-calido shadow-lg"
        >
          {t.tone === 'good' ? <CheckCircle2 size={18} aria-hidden="true" className="text-menta" /> : <AlertCircle size={18} aria-hidden="true" className="text-amarillo-suave" />}
          {t.text}
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Cerrar aviso" className="flex size-7 items-center justify-center rounded-lg hover:bg-white/10">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}

function OfflineBanner() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (online) return null
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amarillo-fondo px-4 py-2 text-sm font-medium text-amarillo-texto">
      <WifiOff size={16} aria-hidden="true" /> Sin conexión. Tus cambios se guardarán cuando vuelva internet.
    </div>
  )
}

const RELOAD_KEY = 'seivin:recarga-por-version'

/** Una pantalla que no cargó suele significar que se publicó una versión nueva. */
function isChunkError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '')
  return /dynamically imported module|Importing a module script failed|Failed to fetch|error loading dynamically/i.test(msg)
}

export function RouteError() {
  const error = useRouteError()
  const chunk = isChunkError(error)

  useEffect(() => {
    if (!chunk) return
    try {
      if (sessionStorage.getItem(RELOAD_KEY)) return
      sessionStorage.setItem(RELOAD_KEY, '1')
    } catch {
      return
    }
    window.location.reload()
  }, [chunk])

  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-page px-6 text-center text-ink">
      <Logo />
      <div className="max-w-md">
        <h1 className="font-display text-3xl font-extrabold">{notFound ? 'Esta página no existe' : chunk ? 'Hay una versión nueva de Seivin' : 'Algo no salió bien'}</h1>
        <p className="mt-2 text-ink-2">
          {chunk
            ? 'Recarga la página para usar la versión más reciente. Tus datos están a salvo.'
            : 'Tus datos están a salvo. Recarga la página o vuelve al inicio; si se repite, cuéntanos en Comentarios.'}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => window.location.reload()} className="h-12 rounded-2xl bg-verde-profundo px-5 font-semibold text-white">
          Recargar
        </button>
        <Link to="/" className="flex h-12 items-center rounded-2xl border border-line-strong bg-surface px-5 font-semibold">
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
