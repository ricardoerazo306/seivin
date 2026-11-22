import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Button, Field, MoneyInput, Notice } from '../../components/ui'
import { money } from '../../lib/money'

export type MovementInput = { kind: 'aporte' | 'retiro'; amount: number; movement_date: string; note: string | null; reason?: string | null }

/** Formulario para registrar un aporte o un retiro. `requireReason`: el retiro pide motivo (respaldo). */
export function MovementForm({
  onSubmit,
  loading,
  requireReason,
  max,
}: {
  onSubmit: (m: MovementInput, reset: () => void, fail: () => void) => void
  loading: boolean
  requireReason?: boolean
  max?: number
}) {
  const [kind, setKind] = useState<'aporte' | 'retiro'>('aporte')
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (amount <= 0) return setError('Escribe un valor mayor que cero.')
    if (kind === 'retiro' && max !== undefined && amount > max) return setError(`Solo tienes ${money(max)} guardados.`)
    if (kind === 'retiro' && requireReason && !text.trim()) return setError('Cuéntanos el motivo del retiro: te ayuda a ver para qué lo usaste.')
    setError(null)
    const t = text.trim().slice(0, 200) || null
    onSubmit(
      { kind, amount, movement_date: date, note: requireReason ? null : t, ...(requireReason ? { reason: kind === 'retiro' ? t : null, note: kind === 'aporte' ? t : null } : {}) },
      () => {
        setAmount(0)
        setText('')
      },
      () => setError('No se guardó. Revisa tu conexión.'),
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Tipo de movimiento" className="inline-flex w-fit rounded-2xl border border-line-strong bg-page p-1">
        {(['aporte', 'retiro'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={`h-10 rounded-xl px-4 text-sm font-semibold ${kind === k ? 'bg-surface text-ink shadow-sm' : 'text-ink-2'}`}
          >
            {k === 'aporte' ? 'Aporte' : 'Retiro'}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MoneyInput label="Valor" value={amount} onValue={setAmount} />
        <Field label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Field
          label={kind === 'retiro' && requireReason ? 'Motivo' : 'Nota (opcional)'}
          placeholder={kind === 'retiro' && requireReason ? 'Arreglo de la moto' : ''}
          value={text}
          maxLength={200}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      {error && <Notice tone="warn">{error}</Notice>}
      <Button type="submit" variant="secondary" loading={loading} className="w-fit">
        Registrar {kind}
      </Button>
    </form>
  )
}

export function MovementList({
  items,
  onRemove,
}: {
  items: { id: string; kind: 'aporte' | 'retiro'; amount: number; movement_date: string; note: string | null; reason?: string | null }[]
  onRemove: (id: string) => void
}) {
  if (items.length === 0) return <p className="text-sm text-ink-2">Aún no hay movimientos.</p>
  return (
    <ul className="divide-y divide-line">
      {items.map((m) => (
        <li key={m.id} className="flex items-center gap-3 py-2.5">
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{m.kind === 'aporte' ? 'Aporte' : 'Retiro'}</span>
            <span className="block text-sm text-ink-3">
              {new Date(m.movement_date + 'T12:00:00').toLocaleDateString('es-CO', { dateStyle: 'medium' })}
              {(m.reason || m.note) && ` · ${m.reason ?? m.note}`}
            </span>
          </span>
          <span className="font-semibold tabular-nums">
            {m.kind === 'aporte' ? '+' : '−'}
            {money(m.amount)}
          </span>
          <button type="button" aria-label="Borrar movimiento" onClick={() => onRemove(m.id)} className="flex size-10 items-center justify-center rounded-xl text-ink-3 hover:bg-page hover:text-ink">
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )
}
