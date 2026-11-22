import { Link } from 'react-router'

export function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-page px-6 text-center">
      <h1 className="font-display text-3xl font-extrabold">Esta página no existe</h1>
      <p className="text-ink-2">Puede que el enlace esté incompleto o que la página se haya movido.</p>
      <Link to="/" className="rounded-2xl bg-verde-profundo px-5 py-3 font-semibold text-white">
        Ir al inicio
      </Link>
    </div>
  )
}
