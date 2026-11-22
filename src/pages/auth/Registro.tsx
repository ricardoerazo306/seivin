import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { Button, Field, Notice } from '../../components/ui'
import { FEATURES } from '../../config/features'
import { requireClient, useAuth } from '../../lib/auth'
import { authErrorMessage, validateEmail, validateName, validatePassword } from '../../lib/authMessages'
import { AuthShell } from './AuthShell'
import { GoogleButton } from './GoogleButton'

export function Registro() {
  const auth = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  if (auth.status === 'signed-in') return <Navigate to="/app" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = { name: validateName(form.name), email: validateEmail(form.email), password: validatePassword(form.password) }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    setLoading(true)
    setServerError(null)
    const { data, error } = await requireClient().auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.name.trim() }, emailRedirectTo: `${window.location.origin}/app` },
    })
    setLoading(false)
    if (error) return setServerError(authErrorMessage(error))
    if (!data.session) setSent(true)
  }

  if (sent) {
    return (
      <AuthShell title="Revisa tu correo" subtitle={`Te enviamos un enlace a ${form.email.trim()} para confirmar tu cuenta.`}>
        <Notice>Abre el enlace desde este mismo dispositivo. Si no lo ves en unos minutos, revisa la carpeta de spam.</Notice>
        <Link to="/entrar" className="text-center font-semibold text-action">
          Ya confirmé, quiero entrar
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Tus datos son solo tuyos: nadie más puede verlos."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/entrar" className="font-semibold text-action">
            Entra aquí
          </Link>
        </>
      }
    >
      {FEATURES.googleSignIn && <GoogleButton />}
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <Field label="¿Cómo te llamamos?" autoComplete="given-name" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Field label="Correo" type="email" autoComplete="email" inputMode="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres, con letras y números."
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {serverError && <Notice tone="warn">{serverError}</Notice>}
        <Button type="submit" loading={loading}>
          Crear cuenta
        </Button>
        <p className="text-xs leading-relaxed text-ink-3">
          Al crear tu cuenta aceptas los{' '}
          <Link to="/terminos" className="font-semibold underline">términos de uso</Link> y la{' '}
          <Link to="/privacidad" className="font-semibold underline">política de privacidad</Link>. Guardamos tus datos solo para mostrarte tu
          información; puedes descargarlos o eliminarlos cuando quieras desde tu cuenta.
        </p>
      </form>
    </AuthShell>
  )
}
