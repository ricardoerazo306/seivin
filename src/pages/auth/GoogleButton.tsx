import { useState } from 'react'
import { Notice } from '../../components/ui'
import { requireClient } from '../../lib/auth'
import { authErrorMessage } from '../../lib/authMessages'
import { lastMethod, rememberMethod } from '../../lib/authReturn'

/** Inicio con Google. `next` es la página a la que se vuelve después de entrar. */
export function GoogleButton({ label = 'Continuar con Google', next = '/app' }: { label?: string; next?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usedBefore] = useState(() => lastMethod() === 'google')

  const go = async () => {
    setLoading(true)
    setError(null)
    rememberMethod('google')
    const { error } = await requireClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${next.startsWith('/') ? next : '/app'}` },
    })
    // Si no hay error, el navegador ya se está yendo a Google.
    if (error) {
      setLoading(false)
      setError(authErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className="relative flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-line-strong bg-surface px-4 text-base font-semibold text-ink shadow-sm transition hover:border-ink-3 hover:shadow disabled:opacity-70"
      >
        <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-page font-display text-sm font-extrabold text-ink">
          G
        </span>
        {loading ? 'Abriendo Google…' : label}
        {usedBefore && !loading && (
          <span className="absolute -top-2.5 right-3 rounded-full bg-menta-suave px-2 py-0.5 text-[11px] font-semibold text-menta-ink">Usaste esta opción</span>
        )}
      </button>
      {error && <Notice tone="warn">{error}</Notice>}
      <div className="flex items-center gap-3 text-sm text-ink-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" /> o con tu correo <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  )
}
