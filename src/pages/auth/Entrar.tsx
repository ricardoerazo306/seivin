import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { Button, Field, Notice } from '../../components/ui'
import { FEATURES } from '../../config/features'
import { requireClient, useAuth } from '../../lib/auth'
import { authErrorMessage, validateEmail } from '../../lib/authMessages'
import { AuthShell } from './AuthShell'
import { GoogleButton } from './GoogleButton'

export function Entrar() {
  const auth = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/app'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (auth.status === 'signed-in') return <Navigate to={from} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = { email: validateEmail(email), password: password ? null : 'Escribe tu contraseña.' }
    setErrors(next)
    if (next.email || next.password) return
    setLoading(true)
    setServerError(null)
    const { error } = await requireClient().auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) setServerError(authErrorMessage(error))
  }

  return (
    <AuthShell
      title="Qué bueno verte"
      subtitle="Entra para seguir con tu plan."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-verde-profundo">
            Créala gratis
          </Link>
        </>
      }
    >
      {FEATURES.googleSignIn && <GoogleButton />}
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Correo" type="email" autoComplete="email" inputMode="email" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Contraseña" type="password" autoComplete="current-password" value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />
        {serverError && <Notice tone="warn">{serverError}</Notice>}
        <Button type="submit" loading={loading}>
          Entrar
        </Button>
        <Link to="/recuperar" className="text-center text-sm font-semibold text-verde-profundo">
          Olvidé mi contraseña
        </Link>
      </form>
    </AuthShell>
  )
}
