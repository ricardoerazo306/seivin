import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button, Field, Notice } from '../../components/ui'
import { requireClient } from '../../lib/auth'
import { authErrorMessage, validateEmail } from '../../lib/authMessages'
import { AuthShell } from './AuthShell'

export function Recuperar() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const v = validateEmail(email)
    setError(v)
    if (v) return
    setLoading(true)
    setServerError(null)
    const { error } = await requireClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
    })
    setLoading(false)
    if (error) return setServerError(authErrorMessage(error))
    setSent(true)
  }

  return (
    <AuthShell title="Recupera tu contraseña" subtitle="Te enviaremos un enlace para crear una nueva.">
      {sent ? (
        <Notice tone="good">
          Si hay una cuenta con {email.trim()}, te llegará un correo con el enlace. Revisa también la carpeta de spam.
        </Notice>
      ) : (
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Correo" type="email" autoComplete="email" inputMode="email" value={email} error={error} onChange={(e) => setEmail(e.target.value)} />
          {serverError && <Notice tone="warn">{serverError}</Notice>}
          <Button type="submit" loading={loading}>
            Enviar enlace
          </Button>
        </form>
      )}
      <Link to="/entrar" className="text-center text-sm font-semibold text-action">
        Volver a entrar
      </Link>
    </AuthShell>
  )
}
