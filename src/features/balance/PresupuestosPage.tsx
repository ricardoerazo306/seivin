import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Trash2 } from 'lucide-react'
import { Button, Card, Chip, MoneyInput, Notice, PageHeader, Progress, Select, Tabs } from '../../components/ui'
import { useRowMutations, useRows } from '../../lib/data'
import { money } from '../../lib/money'
import { useBalances, useCategories, useLines } from './api'
import { monthName, periodOf } from './logic'
import { activeBudgets, budgetStatus } from './salidas'
import { ORGANIZA_TABS } from './tabs'
import { toast } from '../../lib/toast'

type Budget = { id: string; category_id: string; amount: number; month_from: string; month_to: string | null }

export function PresupuestosPage() {
  const [current] = useState(() => periodOf(new Date()))
  const budgets = useRows<Budget>('budgets', { order: [{ column: 'created_at' }] })
  const m = useRowMutations<Budget>('budgets')
  const categories = useCategories()
  const balances = useBalances()
  // Se compara con el balance del mes actual; si aún no existe, con el más reciente.
  const ref = (balances.data ?? []).find((b) => b.period === current) ?? balances.data?.[0] ?? null
  const lines = useLines(ref?.balance_id)
  const [error, setError] = useState<string | null>(null)

  const active = activeBudgets(budgets.data ?? [], ref?.period ?? current)
  const spentBy = new Map<string, number>()
  for (const l of lines.data ?? []) if (l.kind === 'gasto') spentBy.set(l.category_id, (spentBy.get(l.category_id) ?? 0) + l.amount)
  const expenseCats = (categories.data ?? []).filter((c) => c.kind === 'gasto' && !c.archived)
  const free = expenseCats.filter((c) => !active.some((b) => b.category_id === c.id))
  const catName = (id: string) => categories.data?.find((c) => c.id === id)?.name ?? ''

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Organiza" text="Tu balance mes a mes: lo que entró, lo que salió y lo que te quedó." />
      <Tabs items={ORGANIZA_TABS} />
      <Card>
        <h2 className="text-lg font-bold">Presupuestos</h2>
        <p className="mt-1 text-sm text-ink-2">
          Pon un tope solo a las dos o tres categorías que más se te salen de las manos.{' '}
          {ref ? `Los comparamos con tu balance de ${monthName(ref.period)}.` : <>Cuando hagas tu <Link to="/app/organiza" className="font-semibold underline">primer balance</Link>, verás cómo vas.</>}
        </p>
        {error && <div className="mt-3"><Notice tone="warn">{error}</Notice></div>}
        {active.length === 0 && !budgets.isPending && <p className="mt-4 text-sm text-ink-2">Aún no tienes presupuestos.</p>}
        <ul className="mt-4 flex flex-col gap-5">
          {active.map((b) => {
            const spent = spentBy.get(b.category_id) ?? 0
            const st = budgetStatus(spent, b.amount)
            return (
              <li key={b.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{catName(b.category_id)}</span>
                  <span className="flex items-center gap-2">
                    {st === 'pasado' && <Chip tone="warn">Te pasaste {money(spent - b.amount)}</Chip>}
                    {st === 'cerca' && <Chip tone="warn">Cerca del tope</Chip>}
                    <button type="button" aria-label={`Quitar presupuesto de ${catName(b.category_id)}`} onClick={() => m.remove.mutate(b.id, { onError: () => setError('No pudimos quitarlo.') })} className="flex size-10 items-center justify-center rounded-xl text-ink-3 hover:bg-page hover:text-ink">
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <div className="mt-1.5">
                  <Progress value={b.amount ? spent / b.amount : 0} tone={st === 'bien' ? 'good' : 'warn'} label={`Gasto en ${catName(b.category_id)} frente al tope`} />
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 text-sm text-ink-2">
                  <span className="tabular-nums">
                    {money(spent)} de {money(b.amount)}
                  </span>
                  <EditAmount value={b.amount} onSave={(v) => m.update.mutate({ id: b.id, amount: v }, { onError: () => setError('No se guardó el cambio.') })} label={`Tope de ${catName(b.category_id)}`} />
                </div>
              </li>
            )
          })}
        </ul>
        {free.length > 0 && <NewBudget categories={free} spentBy={spentBy} period={ref?.period ?? current} onCreate={(row, done) => m.insert.mutate(row, { onSuccess: () => (done(), toast('Presupuesto creado')), onError: () => setError('No pudimos crear el presupuesto.') })} loading={m.insert.isPending} />}
      </Card>
    </div>
  )
}

function EditAmount({ value, onSave, label }: { value: number; onSave: (v: number) => void; label: string }) {
  const [v, setV] = useState(value)
  const [synced, setSynced] = useState(value)
  if (synced !== value) {
    setSynced(value)
    setV(value)
  }
  return <MoneyInput label={label} hideLabel value={v} onValue={setV} onBlur={() => v > 0 && v !== value && onSave(v)} className="w-36" />
}

function NewBudget({
  categories,
  spentBy,
  period,
  onCreate,
  loading,
}: {
  categories: { id: string; name: string }[]
  spentBy: Map<string, number>
  period: string
  onCreate: (row: Omit<Budget, 'id'>, done: () => void) => void
  loading: boolean
}) {
  const [cat, setCat] = useState(categories[0]?.id ?? '')
  const [amount, setAmount] = useState(0)
  const [err, setErr] = useState<string | null>(null)
  const spent = spentBy.get(cat) ?? 0
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (amount <= 0) return setErr('Escribe un tope mayor que cero.')
    setErr(null)
    onCreate({ category_id: cat, amount, month_from: period, month_to: null }, () => setAmount(0))
  }
  return (
    <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
      <h3 className="font-semibold">Nuevo presupuesto</h3>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Select label="Categoría" value={cat} onChange={(e) => setCat(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <MoneyInput label="Tope al mes" value={amount} onValue={setAmount} error={err} />
        <Button type="submit" variant="secondary" loading={loading}>
          Crear
        </Button>
      </div>
      {spent > 0 && (
        <p className="text-sm text-ink-3">
          Último mes gastaste {money(spent)} aquí.{' '}
          <button type="button" className="font-semibold text-action" onClick={() => setAmount(Math.round((spent * 0.9) / 1000) * 1000)}>
            Proponer un 10 % menos ({money(Math.round((spent * 0.9) / 1000) * 1000)})
          </button>
        </p>
      )}
    </form>
  )
}
