import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Field, Notice } from '../../components/ui'
import { requireClient, useAuth } from '../../lib/auth'
import { authErrorMessage, validatePassword } from '../../lib/authMessages'
import { AuthShell } from './AuthShell'

/** Llega aquí desde el enlace del correo de recuperación (sesión temporal). */
export function NuevaContrasena() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string | null; confirm?: string | null }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (auth.status === 'loading') return <AuthShell title="Un momento…">{null}</AuthShell>
  if (auth.status !== 'signed-in') {
    return (
      <AuthShell title="El enlace no es válido" subtitle="Puede que haya vencido o ya se haya usado.">
        <Link to="/recuperar" className="text-center font-semibold text-verde-profundo">
          Pedir un enlace nuevo
        </Link>
      </AuthShell>
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = { password: validatePassword(password), confirm: password === confirm ? null : 'Las contraseñas no coinciden.' }
    setErrors(next)
    if (next.password || next.confirm) return
    setLoading(true)
    setServerError(null)
    const { error } = await requireClient().auth.updateUser({ password })
    setLoading(false)
    if (error) return setServerError(authErrorMessage(error))
    navigate('/app', { replace: true })
  }

  return (
    <AuthShell title="Crea tu nueva contraseña">
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nueva contraseña" type="password" autoComplete="new-password" hint="Mínimo 8 caracteres, con letras y números." value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />
        <Field label="Repítela" type="password" autoComplete="new-password" value={confirm} error={errors.confirm} onChange={(e) => setConfirm(e.target.value)} />
        {serverError && <Notice tone="warn">{serverError}</Notice>}
        <Button type="submit" loading={loading}>
          Guardar contraseña
        </Button>
      </form>
    </AuthShell>
  )
}
