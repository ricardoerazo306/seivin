import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronRight, Tags } from 'lucide-react'
import { Button, Card, Chip, Notice } from '../../components/ui'
import { money, signedMoney } from '../../lib/money'
import { useBalances, useStartBalance } from './api'
import { monthName, periodOf, periodSlug, periodTitle } from './logic'

export function OrganizaPage() {
  const navigate = useNavigate()
  const balances = useBalances()
  const start = useStartBalance()
  const [error, setError] = useState<string | null>(null)
  const [current] = useState(() => periodOf(new Date()))
  const list = balances.data ?? []
  const thisMonth = list.find((b) => b.period === current)
  const before = list.find((b) => b.period < current)

  const open = (period: string) => {
    setError(null)
    start.mutate(period, {
      onSuccess: () => navigate(`/app/organiza/${periodSlug(period)}`),
      onError: () => setError('No pudimos abrir el balance. Intenta de nuevo en un momento.'),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Organiza</h1>
        <p className="mt-1 max-w-prose text-ink-2">Tu balance mes a mes: lo que entró, lo que salió y lo que te quedó.</p>
      </header>

      {error && <Notice tone="warn">{error}</Notice>}

      <Card className="bg-petroleo text-blanco-calido">
        {balances.isPending ? (
          <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
        ) : thisMonth ? (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-[#C9D6D1]">
                {thisMonth.status === 'cerrado' ? `Cerraste ${monthName(current)}` : `Tu balance de ${monthName(current)} está en borrador`}
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">{money(thisMonth.left_total)}</p>
              <p className="text-sm text-[#C9D6D1]">te quedaron este mes</p>
            </div>
            <Link
              to={`/app/organiza/${periodSlug(current)}`}
              className="inline-flex h-12 items-center rounded-2xl bg-menta px-5 font-semibold text-petroleo"
            >
              {thisMonth.status === 'cerrado' ? 'Ver el balance' : 'Seguir con el balance'}
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-2xl font-extrabold">Haz el balance de {monthName(current)}</h2>
            <p className="mt-1 max-w-prose text-[#C9D6D1]">
              {before
                ? `Copiamos los valores de ${monthName(before.period)}: solo cambias lo que fue distinto.`
                : 'Escribe lo que entró y lo que salió. Toma unos cinco minutos y no necesitas ser exacto.'}
            </p>
            <button
              type="button"
              disabled={start.isPending}
              onClick={() => open(current)}
              className="mt-4 inline-flex h-12 items-center rounded-2xl bg-menta px-5 font-semibold text-petroleo disabled:opacity-60"
            >
              {start.isPending ? 'Abriendo…' : `Empezar ${monthName(current)}`}
            </button>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Tus balances</h2>
        {balances.isError && <div className="mt-3"><Notice tone="warn">No pudimos cargar tus balances. Recarga la página.</Notice></div>}
        {!balances.isPending && list.length === 0 && (
          <p className="mt-2 text-sm text-ink-2">Aquí verás cada mes que registres y cómo se compara con el anterior.</p>
        )}
        <ul className="mt-2 divide-y divide-line">
          {list.map((b, i) => {
            const prev = list[i + 1]
            return (
              <li key={b.balance_id}>
                <Link to={`/app/organiza/${periodSlug(b.period)}`} className="flex items-center gap-3 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{periodTitle(b.period)}</span>
                      {b.status === 'borrador' && <Chip>Borrador</Chip>}
                    </span>
                    <span className="block text-sm text-ink-2">
                      Entró {money(b.income_total)} · Salió {money(b.expense_total)}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-semibold tabular-nums">{money(b.left_total)}</span>
                    {prev && <span className="block text-xs text-ink-3 tabular-nums">{signedMoney(b.left_total - prev.left_total)}</span>}
                  </span>
                  <ChevronRight size={18} aria-hidden="true" className="text-ink-3" />
                </Link>
              </li>
            )
          })}
        </ul>
        <PastMonth onOpen={open} loading={start.isPending} existing={new Set(list.map((b) => b.period))} />
      </Card>

      <Link to="/app/organiza/categorias" className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-5">
        <Tags size={22} aria-hidden="true" className="text-verde-profundo" />
        <span className="flex-1">
          <span className="block font-semibold">Categorías</span>
          <span className="block text-sm text-ink-2">Crea las tuyas, marca cuáles son esenciales y archiva las que no uses.</span>
        </span>
        <ChevronRight size={18} aria-hidden="true" className="text-ink-3" />
      </Link>
    </div>
  )
}

function PastMonth({ onOpen, loading, existing }: { onOpen: (p: string) => void; loading: boolean; existing: Set<string> }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [max] = useState(() => periodSlug(periodOf(new Date())))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\d{4}-\d{2}$/.test(value)) return setError('Elige un mes.')
    if (value > max) return setError('Elige este mes o uno anterior.')
    setError(null)
    onOpen(`${value}-01`)
  }
  return (
    <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
      <label htmlFor="mes-anterior" className="text-sm font-semibold">
        ¿Quieres registrar un mes anterior para tener con qué comparar?
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="mes-anterior"
          type="month"
          max={max}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-12 rounded-xl border border-line-strong bg-surface px-3 text-base text-ink"
        />
        <Button type="submit" variant="secondary" loading={loading}>
          {value && existing.has(`${value}-01`) ? 'Ver ese mes' : 'Abrir'}
        </Button>
      </div>
      {error && <p role="alert" className="text-sm font-medium text-amarillo-texto">{error}</p>}
    </form>
  )
}
