import { useState } from 'react'
import { Button, Notice } from '../../components/ui'
import { requireClient } from '../../lib/auth'
import { authErrorMessage } from '../../lib/authMessages'

export function GoogleButton() {
  const [error, setError] = useState<string | null>(null)
  const go = async () => {
    const { error } = await requireClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    })
    if (error) setError(authErrorMessage(error))
  }
  return (
    <div className="flex flex-col gap-3">
      <Button variant="secondary" onClick={go}>
        Continuar con Google
      </Button>
      {error && <Notice tone="warn">{error}</Notice>}
      <div className="flex items-center gap-3 text-sm text-ink-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" /> o con tu correo <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  )
}
