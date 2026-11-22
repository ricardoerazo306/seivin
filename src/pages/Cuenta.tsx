import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Download, LogOut, Trash2 } from 'lucide-react'
import { Button, Card, Field, Notice } from '../components/ui'
import { requireClient, useAuth } from '../lib/auth'
import { authErrorMessage, validateName } from '../lib/authMessages'
import { applyTheme, useProfile, useUpdateProfile } from '../lib/profile'
import { EXPORT_TABLES, type ExperienceMode, type Theme } from '../lib/types'

const MODES: { id: ExperienceMode; label: string; text: string }[] = [
  { id: 'inicial', label: 'Inicial', text: 'Paso a paso, con explicaciones.' },
  { id: 'intermedio', label: 'Intermedio', text: 'Más libertad para organizar y comparar.' },
  { id: 'avanzado', label: 'Avanzado', text: 'Todos los filtros y escenarios a la vista.' },
]
const THEMES: { id: Theme; label: string }[] = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
  { id: 'system', label: 'Automático' },
]

export function Cuenta() {
  const auth = useAuth()
  const navigate = useNavigate()
  const profile = useProfile()
  const update = useUpdateProfile()
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const loadedName = profile.data?.display_name ?? null
  const [syncedName, setSyncedName] = useState<string | null>(null)
  if (loadedName !== null && loadedName !== syncedName) {
    setSyncedName(loadedName)
    setName(loadedName)
  }

  if (auth.status !== 'signed-in') return null
  const email = auth.session.user.email

  const saveName = async (e: FormEvent) => {
    e.preventDefault()
    const err = validateName(name)
    setNameError(err)
    if (err) return
    await update.mutateAsync({ display_name: name.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const setTheme = (theme: Theme) => {
    applyTheme(theme)
    update.mutate({ theme })
  }

  const exportData = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const client = requireClient()
      const entries = await Promise.all(
        EXPORT_TABLES.map(async (t) => {
          const { data, error } = await client.from(t).select('*')
          if (error) throw error
          return [t, data] as const
        }),
      )
      const payload = { exportado: new Date().toISOString(), correo: email, datos: Object.fromEntries(entries) }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `seivin-mis-datos-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setExportError('No pudimos preparar el archivo. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setExporting(false)
    }
  }

  const signOut = async () => {
    await requireClient().auth.signOut()
    navigate('/', { replace: true })
  }

  const deleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    const client = requireClient()
    const { error } = await client.rpc('delete_my_account')
    if (error) {
      setDeleting(false)
      return setDeleteError(authErrorMessage(error))
    }
    await client.auth.signOut({ scope: 'local' })
    navigate('/', { replace: true })
  }

  const created = profile.data ? new Date(profile.data.created_at).toLocaleDateString('es-CO', { dateStyle: 'long' }) : ''

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Tu cuenta</h1>
        <p className="mt-1 text-ink-2">
          {email}
          {created && ` · Con Seivin desde el ${created}`}
        </p>
      </header>

      {profile.isError && <Notice tone="warn">No pudimos cargar tu perfil. Recarga la página.</Notice>}

      <Card>
        <h2 className="text-lg font-bold">Perfil</h2>
        <form onSubmit={saveName} noValidate className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="¿Cómo te llamamos?" value={name} error={nameError} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" variant="secondary" loading={update.isPending}>
            {saved ? 'Guardado' : 'Guardar'}
          </Button>
        </form>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-3">País</dt>
            <dd className="font-semibold">Colombia</dd>
          </div>
          <div>
            <dt className="text-ink-3">Moneda principal</dt>
            <dd className="font-semibold">Peso colombiano (COP)</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Cómo quieres ver Seivin</h2>
        <p className="mt-1 text-sm text-ink-2">Cambia cuánto se muestra, no lo que puedes hacer.</p>
        <div role="radiogroup" aria-label="Modo de experiencia" className="mt-4 grid gap-3 sm:grid-cols-3">
          {MODES.map((m) => {
            const on = profile.data?.experience_mode === m.id
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => update.mutate({ experience_mode: m.id })}
                className={`rounded-2xl p-4 text-left transition ${on ? 'border-2 border-verde-profundo bg-menta-suave' : 'border border-line-strong bg-surface hover:bg-page'}`}
              >
                <span className="block font-bold">{m.label}</span>
                <span className="mt-1 block text-sm text-ink-2">{m.text}</span>
              </button>
            )
          })}
        </div>
        <h3 className="mt-6 text-sm font-semibold">Apariencia</h3>
        <div role="radiogroup" aria-label="Apariencia" className="mt-2 inline-flex rounded-2xl border border-line-strong bg-page p-1">
          {THEMES.map((t) => {
            const on = (profile.data?.theme ?? 'system') === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTheme(t.id)}
                className={`h-10 rounded-xl px-4 text-sm font-semibold ${on ? 'bg-surface text-ink shadow-sm' : 'text-ink-2'}`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Tus datos</h2>
        <p className="mt-1 text-sm text-ink-2">Descarga una copia de toda tu información en un archivo JSON.</p>
        {exportError && <div className="mt-3"><Notice tone="warn">{exportError}</Notice></div>}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={exportData} loading={exporting}>
            <Download size={18} aria-hidden="true" /> Descargar mis datos
          </Button>
          <Button variant="ghost" onClick={signOut}>
            <LogOut size={18} aria-hidden="true" /> Cerrar sesión
          </Button>
        </div>
      </Card>

      <Card className="border-[#e4c9c9]">
        <h2 className="text-lg font-bold">Eliminar tu cuenta</h2>
        <p className="mt-1 text-sm text-ink-2">
          Se borran tu cuenta y todos tus datos: balances, metas, respaldo, presupuestos y comentarios. No se puede deshacer.
          Si quieres conservar una copia, descárgala primero.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label='Escribe "ELIMINAR" para confirmar' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
          </div>
          <Button variant="danger" disabled={confirmText.trim() !== 'ELIMINAR'} loading={deleting} onClick={deleteAccount}>
            <Trash2 size={18} aria-hidden="true" /> Eliminar mi cuenta
          </Button>
        </div>
        {deleteError && <div className="mt-3"><Notice tone="warn">{deleteError}</Notice></div>}
      </Card>
    </div>
  )
}
