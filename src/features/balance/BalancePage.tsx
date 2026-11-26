import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Lock, Plus, Trash2, Unlock } from 'lucide-react'
import { Button, Card, Chip, Field, MoneyInput, Notice, Select } from '../../components/ui'
import { useProfile } from '../../lib/profile'
import { money, percent, signedMoney } from '../../lib/money'
import type { BalanceLine, Category, Kind } from '../../lib/types'
import {
  useBalance,
  useBalances,
  useCategories,
  useDeleteBalance,
  useLineMutations,
  useLines,
  useSetBalanceStatus,
  useStartBalance,
} from './api'
import { closingMessage, compareByCategory, monthName, periodFromSlug, periodLabel, previousAmountFor, totals } from './logic'
import { toast } from '../../lib/toast'

const EXPENSE_TYPES = [
  { id: 'fijo', label: 'Fijo' },
  { id: 'variable', label: 'Variable' },
  { id: 'ocasional', label: 'Ocasional' },
] as const

export function BalancePage() {
  const { mes = '' } = useParams()
  const period = periodFromSlug(mes)
  const balance = useBalance(period)
  const balances = useBalances()
  const categories = useCategories()
  const lines = useLines(balance.data?.id)
  const previous = balances.data?.find((b) => period && b.period < period) ?? null
  const prevLines = useLines(previous?.balance_id)
  const profile = useProfile()

  if (!period) {
    return (
      <Notice tone="warn">
        Esa dirección no corresponde a un mes. <Link to="/app/organiza" className="font-semibold underline">Volver a Organiza</Link>
      </Notice>
    )
  }
  if (balance.isPending || categories.isPending) return <Loading />
  if (balance.isError || categories.isError) {
    return <Notice tone="warn">No pudimos cargar el balance. Revisa tu conexión y recarga la página.</Notice>
  }
  if (!balance.data) return <NotStarted period={period} previousPeriod={previous?.period ?? null} />

  return (
    <Editor
      key={balance.data.id}
      period={period}
      balanceId={balance.data.id}
      closed={balance.data.status === 'cerrado'}
      lines={lines.data ?? []}
      linesLoading={lines.isPending}
      prevLines={prevLines.data ?? []}
      previousPeriod={previous?.period ?? null}
      categories={categories.data}
      showTypes={(profile.data?.experience_mode ?? 'inicial') !== 'inicial'}
    />
  )
}

function Loading() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <div className="h-9 w-64 animate-pulse rounded-xl bg-line" />
      <div className="h-28 animate-pulse rounded-3xl bg-line" />
      <span className="sr-only">Cargando balance…</span>
    </div>
  )
}

function Back() {
  return (
    <Link to="/app/organiza" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-action">
      <ArrowLeft size={16} aria-hidden="true" /> Organiza
    </Link>
  )
}

function NotStarted({ period, previousPeriod }: { period: string; previousPeriod: string | null }) {
  const start = useStartBalance()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-5">
      <Back />
      <h1 className="font-display text-3xl font-extrabold">Balance de {periodLabel(period)}</h1>
      <Card>
        <p className="text-ink-2">
          {previousPeriod
            ? `Copiamos los valores de ${monthName(previousPeriod)} para que solo cambies lo que fue distinto.`
            : 'Escribe lo que entró y lo que salió este mes. Toma unos cinco minutos.'}
        </p>
        <Button
          className="mt-4"
          loading={start.isPending}
          onClick={() =>
            start.mutate(period, { onError: () => setError('No pudimos abrir el balance. Intenta de nuevo en un momento.') })
          }
        >
          Empezar el balance
        </Button>
        {error && <div className="mt-3"><Notice tone="warn">{error}</Notice></div>}
      </Card>
    </div>
  )
}

type EditorProps = {
  period: string
  balanceId: string
  closed: boolean
  lines: BalanceLine[]
  linesLoading: boolean
  prevLines: BalanceLine[]
  previousPeriod: string | null
  categories: Category[]
  showTypes: boolean
}

function Editor({ period, balanceId, closed, lines, linesLoading, prevLines, previousPeriod, categories, showTypes }: EditorProps) {
  const navigate = useNavigate()
  const status = useSetBalanceStatus(period)
  const remove = useDeleteBalance()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = useMemo(() => totals(lines, categories), [lines, categories])
  const prevT = useMemo(() => (previousPeriod ? totals(prevLines, categories) : null), [previousPeriod, prevLines, categories])
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Sin categoría'
  const prevMonth = previousPeriod ? monthName(previousPeriod) : null

  const setClosed = (value: boolean) =>
    status.mutate(
      { id: balanceId, closed: value },
      { onSuccess: () => toast(value ? 'Balance cerrado' : 'Balance reabierto'), onError: () => setError('No pudimos guardar el cambio. Intenta de nuevo.') },
    )

  return (
    <div className="flex flex-col gap-6">
      <Back />
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-extrabold">
          Balance de <span className="whitespace-nowrap">{periodLabel(period)}</span>
        </h1>
        {closed ? <Chip tone="good">Cerrado</Chip> : <Chip>Borrador</Chip>}
      </header>

      <section aria-label="Resumen del mes" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile label="Entró" value={money(t.income)} />
        <Tile label="Salió" value={money(t.expense)} />
        <Tile
          wide
          label="Te quedó"
          value={money(t.left)}
          strong
          sub={
            prevT && prevMonth
              ? `${signedMoney(t.left - prevT.left)} frente a ${prevMonth}`
              : t.leftPct !== null
                ? `${percent(t.leftPct, 0)} de lo que entró`
                : undefined
          }
        />
      </section>
      {t.income > 0 && t.essential > 0 && (
        <p className="-mt-2 text-sm text-ink-2">
          Lo esencial (vivienda, comida, transporte, servicios, salud, educación y deudas) fue {money(t.essential)}:{' '}
          {percent((t.essential / t.income) * 100, 0)} de lo que entró.
        </p>
      )}

      {error && <Notice tone="warn">{error}</Notice>}

      {closed && (
        <Card className="border-verde-profundo/30">
          <h2 className="text-lg font-bold">Así cerró {monthName(period)}</h2>
          <p className="mt-1 text-ink-2">{closingMessage(t.left, prevT?.left ?? null)}</p>
          {prevMonth && <Changes current={lines} previous={prevLines} catName={catName} prevMonth={prevMonth} />}
          <Button variant="secondary" className="mt-5" loading={status.isPending} onClick={() => setClosed(false)}>
            <Unlock size={18} aria-hidden="true" /> Reabrir para editar
          </Button>
        </Card>
      )}

      {linesLoading ? (
        <Loading />
      ) : (
        <>
          <Section
            kind="ingreso"
            title="Lo que entró"
            empty="Empieza por lo que entró este mes: salario, ventas, trabajos extra."
            {...{ balanceId, closed, lines, prevLines, categories, showTypes, prevMonth }}
          />
          <Section
            kind="gasto"
            title="Lo que salió"
            empty="Agrega tus gastos: arriendo, mercado, transporte, salidas…"
            {...{ balanceId, closed, lines, prevLines, categories, showTypes, prevMonth }}
          />
        </>
      )}

      {!closed && (
        <Card>
          <h2 className="text-lg font-bold">¿Ya está todo?</h2>
          <p className="mt-1 text-sm text-ink-2">
            Al cerrar el balance verás qué cambió {prevMonth ? `frente a ${prevMonth}` : 'y quedará listo para compararlo el próximo mes'}.
            Puedes reabrirlo cuando quieras.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button loading={status.isPending} disabled={lines.length === 0} onClick={() => setClosed(true)}>
              <Lock size={18} aria-hidden="true" /> Cerrar el balance
            </Button>
            {confirmDelete ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-ink-2">¿Borrar este balance y sus líneas?</span>
                <Button
                  variant="danger"
                  loading={remove.isPending}
                  onClick={() =>
                    remove.mutate(balanceId, {
                      onSuccess: () => navigate('/app/organiza', { replace: true }),
                      onError: () => setError('No pudimos borrar el balance.'),
                    })
                  }
                >
                  Sí, borrar
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  No
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={18} aria-hidden="true" /> Borrar balance
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

function Tile({ label, value, sub, strong, wide }: { label: string; value: string; sub?: string; strong?: boolean; wide?: boolean }) {
  return (
    <div className={`rounded-3xl p-4 sm:p-5 ${wide ? 'col-span-2 sm:col-span-1' : ''} ${strong ? 'bg-petroleo text-blanco-calido' : 'border border-line bg-surface'}`}>
      <p className={`text-sm ${strong ? 'text-[#C9D6D1]' : 'text-ink-2'}`}>{label}</p>
      <p className="mt-1 font-display text-xl font-extrabold tabular-nums sm:text-2xl">{value}</p>
      {sub && <p className={`mt-1 text-sm ${strong ? 'text-menta' : 'text-ink-2'}`}>{sub}</p>}
    </div>
  )
}

function Changes({
  current,
  previous,
  catName,
  prevMonth,
}: {
  current: BalanceLine[]
  previous: BalanceLine[]
  catName: (id: string) => string
  prevMonth: string
}) {
  const changes = compareByCategory(current, previous).slice(0, 6)
  if (changes.length === 0) return <p className="mt-4 text-sm text-ink-2">Todo quedó igual que en {prevMonth}.</p>
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold">Qué cambió frente a {prevMonth}</h3>
      <ul className="mt-2 divide-y divide-line">
        {changes.map((c) => {
          const up = c.effect > 0
          const Icon = up ? ArrowUpRight : ArrowDownRight
          const verb =
            c.kind === 'ingreso' ? (c.delta > 0 ? 'entró más' : 'entró menos') : c.delta > 0 ? 'gastaste más' : 'gastaste menos'
          return (
            <li key={`${c.kind}-${c.categoryId}`} className="flex items-center gap-3 py-2.5">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${up ? 'bg-menta-suave text-action' : 'bg-amarillo-fondo text-amarillo-texto'}`}
              >
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{catName(c.categoryId)}</span>
                <span className="block text-sm text-ink-2">
                  {verb}: {money(c.before)} → {money(c.after)}
                </span>
              </span>
              <span className="font-semibold tabular-nums">{signedMoney(c.effect)}</span>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-xs text-ink-3">El número de la derecha es cómo afectó lo que te quedó.</p>
    </div>
  )
}

type SectionProps = {
  kind: Kind
  title: string
  empty: string
  balanceId: string
  closed: boolean
  lines: BalanceLine[]
  prevLines: BalanceLine[]
  categories: Category[]
  showTypes: boolean
  prevMonth: string | null
}

function Section({ kind, title, empty, balanceId, closed, lines, prevLines, categories, showTypes, prevMonth }: SectionProps) {
  const mine = lines.filter((l) => l.kind === kind)
  const order = new Map(categories.map((c, i) => [c.id, i]))
  mine.sort((a, b) => (order.get(a.category_id) ?? 999) - (order.get(b.category_id) ?? 999))
  const total = mine.reduce((s, l) => s + l.amount, 0)
  const options = categories.filter((c) => c.kind === kind)
  const [adding, setAdding] = useState(false)

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="font-display text-lg font-extrabold tabular-nums">{money(total)}</span>
      </div>
      {mine.length === 0 && !adding && <p className="mt-3 text-sm text-ink-2">{empty}</p>}
      <ul className="mt-3 flex flex-col divide-y divide-line">
        {mine.map((l) => (
          <LineRow
            key={l.id}
            line={l}
            balanceId={balanceId}
            closed={closed}
            categories={options}
            showTypes={showTypes && kind === 'gasto'}
            before={previousAmountFor(l, prevLines)}
            prevMonth={prevMonth}
          />
        ))}
      </ul>
      {!closed &&
        (adding ? (
          <NewLine kind={kind} balanceId={balanceId} categories={options} showTypes={showTypes && kind === 'gasto'} onDone={() => setAdding(false)} />
        ) : (
          <Button variant="ghost" className="mt-2 -ml-2" onClick={() => setAdding(true)}>
            <Plus size={18} aria-hidden="true" /> {kind === 'ingreso' ? 'Agregar ingreso' : 'Agregar gasto'}
          </Button>
        ))}
    </Card>
  )
}

function categoryOptions(categories: Category[], currentId?: string) {
  return categories
    .filter((c) => !c.archived || c.id === currentId)
    .map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
        {c.archived ? ' (archivada)' : ''}
      </option>
    ))
}

function LineRow({
  line,
  balanceId,
  closed,
  categories,
  showTypes,
  before,
  prevMonth,
}: {
  line: BalanceLine
  balanceId: string
  closed: boolean
  categories: Category[]
  showTypes: boolean
  before: number | null
  prevMonth: string | null
}) {
  const m = useLineMutations(balanceId)
  const [name, setName] = useState(line.name)
  const [amount, setAmount] = useState(line.amount)
  const [error, setError] = useState<string | null>(null)
  // Si el valor cambia en el servidor, se refleja aquí (patrón de "ajustar estado al cambiar props").
  const [synced, setSynced] = useState({ name: line.name, amount: line.amount })
  if (synced.name !== line.name || synced.amount !== line.amount) {
    setSynced({ name: line.name, amount: line.amount })
    setName(line.name)
    setAmount(line.amount)
  }
  const catName = categories.find((c) => c.id === line.category_id)?.name ?? ''

  const fail = () => setError('No se guardó el cambio. Revisa tu conexión.')
  const saveName = () => {
    const v = name.trim()
    if (!v) return setName(line.name)
    if (v !== line.name) m.update.mutate({ id: line.id, name: v.slice(0, 80) }, { onError: fail })
  }
  const saveAmount = () => {
    if (amount <= 0) return setError('Escribe un valor mayor que cero o borra la línea.')
    setError(null)
    if (amount !== line.amount) m.update.mutate({ id: line.id, amount }, { onError: fail })
  }

  const hint =
    before !== null && prevMonth
      ? before === line.amount
        ? `Igual que en ${prevMonth}`
        : `En ${prevMonth}: ${money(before)}`
      : prevMonth
        ? 'Nuevo este mes'
        : null

  if (closed) {
    return (
      <li className="flex items-center justify-between gap-3 py-3">
        <span className="min-w-0">
          <span className="block font-medium">{line.name}</span>
          <span className="block text-sm text-ink-3">
            {catName}
            {hint && ` · ${hint}`}
          </span>
        </span>
        <span className="font-semibold tabular-nums">{money(line.amount)}</span>
      </li>
    )
  }

  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-2 py-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_10rem_auto] sm:items-start">
      <div className="col-span-2 sm:col-span-1">
        <label className="sr-only" htmlFor={`n-${line.id}`}>
          Nombre
        </label>
        <input
          id={`n-${line.id}`}
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          className="h-12 w-full rounded-xl border border-transparent bg-transparent px-2 text-base font-medium text-ink outline-none hover:border-line focus:border-verde-profundo focus:bg-surface"
        />
        {hint && <p className="px-2 text-xs text-ink-3">{hint}</p>}
      </div>
      <div className="col-span-2 flex gap-2 sm:col-span-1">
        <Select
          label="Categoría"
          hideLabel
          className="flex-1"
          value={line.category_id}
          onChange={(e) => m.update.mutate({ id: line.id, category_id: e.target.value }, { onError: fail })}
        >
          {categoryOptions(categories, line.category_id)}
        </Select>
        {showTypes && (
          <Select
            label="Tipo de gasto"
            hideLabel
            value={line.expense_type ?? ''}
            onChange={(e) =>
              m.update.mutate({ id: line.id, expense_type: (e.target.value || null) as BalanceLine['expense_type'] }, { onError: fail })
            }
          >
            <option value="">Tipo</option>
            {EXPENSE_TYPES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </Select>
        )}
      </div>
      <MoneyInput label={`Valor de ${line.name}`} hideLabel value={amount} onValue={setAmount} onBlur={saveAmount} />
      <button
        type="button"
        aria-label={`Borrar ${line.name}`}
        onClick={() => m.remove.mutate(line.id, { onError: fail })}
        className="flex size-12 items-center justify-center rounded-xl text-ink-3 hover:bg-page hover:text-ink"
      >
        <Trash2 size={18} aria-hidden="true" />
      </button>
      {error && (
        <p role="alert" className="col-span-full text-sm font-medium text-amarillo-texto">
          {error}
        </p>
      )}
    </li>
  )
}

function NewLine({
  kind,
  balanceId,
  categories,
  showTypes,
  onDone,
}: {
  kind: Kind
  balanceId: string
  categories: Category[]
  showTypes: boolean
  onDone: () => void
}) {
  const m = useLineMutations(balanceId)
  const active = categories.filter((c) => !c.archived)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState(active[0]?.id ?? '')
  const [amount, setAmount] = useState(0)
  const [type, setType] = useState<BalanceLine['expense_type']>(null)
  const [errors, setErrors] = useState<{ name?: string; amount?: string; form?: string }>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    const cat = active.find((c) => c.id === categoryId)
    const finalName = name.trim() || cat?.name || ''
    if (!finalName) next.name = 'Escribe un nombre.'
    if (amount <= 0) next.amount = 'Escribe un valor mayor que cero.'
    setErrors(next)
    if (Object.keys(next).length || !categoryId) return
    m.add.mutate(
      { kind, category_id: categoryId, name: finalName.slice(0, 80), amount, expense_type: kind === 'gasto' ? type : null },
      {
        onSuccess: () => {
          setName('')
          setAmount(0)
          toast('Agregado')
        },
        onError: () => setErrors({ form: 'No pudimos agregarlo. Revisa tu conexión.' }),
      },
    )
  }

  return (
    <form onSubmit={submit} noValidate className="mt-3 flex flex-col gap-3 rounded-2xl bg-page p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label="Categoría" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categoryOptions(active)}
        </Select>
        <Field
          label="Nombre (opcional)"
          placeholder={active.find((c) => c.id === categoryId)?.name}
          value={name}
          maxLength={80}
          error={errors.name}
          onChange={(e) => setName(e.target.value)}
        />
        <MoneyInput label="Valor" value={amount} onValue={setAmount} error={errors.amount} />
      </div>
      {showTypes && (
        <Select label="Tipo de gasto" value={type ?? ''} onChange={(e) => setType((e.target.value || null) as BalanceLine['expense_type'])}>
          <option value="">Sin definir</option>
          {EXPENSE_TYPES.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}
            </option>
          ))}
        </Select>
      )}
      {errors.form && <Notice tone="warn">{errors.form}</Notice>}
      <div className="flex gap-2">
        <Button type="submit" loading={m.add.isPending}>
          Agregar
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Listo
        </Button>
      </div>
    </form>
  )
}
