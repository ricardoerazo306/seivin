import { useState } from 'react'
import { Link } from 'react-router'
import { Card, MoneyInput, Notice, PageHeader, Progress, Tabs } from '../../components/ui'
import { money } from '../../lib/money'
import { useProfile } from '../../lib/profile'
import { useBalances } from '../balance/api'
import { useFund, useFundMovementMutations, useFundMovements, useFundMutations, type EmergencyFund } from './api'
import { essentialAverage, fundPlan, monthsText, savedFrom, suggestedMonths } from './logic'
import { CONSTRUYE_TABS } from './tabs'
import { MovementForm, MovementList } from './Movements'

export function RespaldoPage() {
  const fund = useFund()
  const moves = useFundMovements()
  const balances = useBalances()
  const profile = useProfile()
  const fm = useFundMutations()
  const mm = useFundMovementMutations()
  const f = fund.data?.[0]
  const avg = essentialAverage(balances.data ?? [])
  const essential = f?.essential_monthly_override ?? avg
  const saved = f ? savedFrom(f.initial_saved, moves.data ?? []) : 0
  const plan = f ? fundPlan(essential, f.target_months, saved, f.planned_monthly) : null
  const suggested = suggestedMonths(profile.data?.income_stability ?? null, profile.data?.dependents ?? 0, f?.has_major_debts ?? false)

  const save = (patch: Partial<EmergencyFund>) => f && fm.update.mutate({ id: f.id, ...patch })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Construye" text="Tus metas de ahorro y tu respaldo para imprevistos." />
      <Tabs items={CONSTRUYE_TABS} />
      {fund.isError && <Notice tone="warn">No pudimos cargar tu respaldo. Recarga la página.</Notice>}
      {fund.isPending || !f ? (
        <div className="h-40 animate-pulse rounded-3xl bg-line" role="status" aria-label="Cargando" />
      ) : (
        <>
          <section className="rounded-3xl bg-petroleo p-5 text-blanco-calido sm:p-6">
            <p className="text-sm text-[#C9D6D1]">Tienes guardado</p>
            <p className="font-display text-4xl font-extrabold tabular-nums">{money(saved)}</p>
            {plan?.target ? (
              <>
                <p className="mt-1 text-sm text-menta">
                  Cubre {monthsText(plan.covered ?? 0)} de tus gastos esenciales
                </p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Avance del respaldo" aria-valuenow={Math.round(plan.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-menta" style={{ width: `${plan.progress * 100}%` }} />
                </div>
                <p className="mt-2 text-sm text-[#C9D6D1]">
                  Meta: {money(plan.target)} ({monthsText(f.target_months)}) · {Math.round(plan.progress * 100)} %
                  {plan.monthsToGoal ? ` · Con ${money(f.planned_monthly ?? 0)} al mes llegas en ${monthsText(plan.monthsToGoal)}` : ''}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-[#C9D6D1]">
                Para calcular tu meta necesitamos tus gastos esenciales. <Link to="/app/organiza" className="font-semibold text-menta underline">Haz tu primer balance</Link> o escríbelos abajo.
              </p>
            )}
          </section>

          <Card>
            <h2 className="text-lg font-bold">Tu meta</h2>
            <p className="mt-1 text-sm text-ink-2">
              {avg
                ? `Según tus últimos balances, tus gastos esenciales son unos ${money(avg)} al mes.`
                : 'Aún no tenemos balances con gastos esenciales.'}{' '}
              Te sugerimos {monthsText(suggested)} de respaldo
              {profile.data?.income_stability === 'variable' ? ' porque tu ingreso varía' : ''}
              {(profile.data?.dependents ?? 0) > 0 ? ' y tienes personas a cargo' : ''}.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <MonthsSlider value={f.target_months} suggested={suggested} onSave={(n) => save({ target_months: n })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={f.has_major_debts} onChange={(e) => save({ has_major_debts: e.target.checked })} className="size-5 accent-verde-profundo" />
                Tengo deudas grandes (suma un mes a la sugerencia)
              </label>
              <Editable label="Gastos esenciales al mes" hint={avg ? `Déjalo vacío para usar el promedio (${money(avg)})` : 'Vivienda, comida, transporte, servicios, salud…'} value={f.essential_monthly_override ?? 0} onSave={(v) => save({ essential_monthly_override: v || null })} />
              <Editable label="¿Cuánto puedes apartar al mes?" value={f.planned_monthly ?? 0} onSave={(v) => save({ planned_monthly: v || null })} />
              <Editable label="¿Con cuánto empezaste?" value={f.initial_saved} onSave={(v) => save({ initial_saved: v })} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold">Registrar un movimiento</h2>
            <p className="mt-1 text-sm text-ink-2">Usar el respaldo en un imprevisto no es fallar: para eso existe. Solo cuéntanos el motivo.</p>
            <div className="mt-3">
              <MovementForm
                requireReason
                max={saved}
                loading={mm.insert.isPending}
                onSubmit={(m, reset, fail) =>
                  mm.insert.mutate({ kind: m.kind, amount: m.amount, movement_date: m.movement_date, reason: m.reason ?? null, note: m.note }, { onSuccess: reset, onError: fail })
                }
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold">Movimientos</h2>
            <div className="mt-2">
              <MovementList items={moves.data ?? []} onRemove={(id) => mm.remove.mutate(id)} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold">¿Dónde guardarlo?</h2>
            <p className="mt-1 text-sm text-ink-2">
              En un lugar separado de tu plata del día a día, que puedas sacar rápido y sin perder valor: una cuenta de ahorros o un bolsillo aparte. Seivin no maneja dinero; solo te ayuda a llevar la cuenta.
            </p>
            {plan && plan.target && plan.progress < 1 && (
              <div className="mt-3">
                <Progress value={plan.progress} label="Avance del respaldo" />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

function Editable({ label, hint, value, onSave }: { label: string; hint?: string; value: number; onSave: (v: number) => void }) {
  const [v, setV] = useState(value)
  const [synced, setSynced] = useState(value)
  if (synced !== value) {
    setSynced(value)
    setV(value)
  }
  return (
    <div>
      <MoneyInput label={label} value={v} onValue={setV} onBlur={() => v !== value && onSave(v)} />
      {hint && <p className="mt-1 text-sm text-ink-3">{hint}</p>}
    </div>
  )
}

function MonthsSlider({ value, suggested, onSave }: { value: number; suggested: number; onSave: (n: number) => void }) {
  const [v, setV] = useState(value)
  const [synced, setSynced] = useState(value)
  if (synced !== value) {
    setSynced(value)
    setV(value)
  }
  const commit = () => v !== value && onSave(v)
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="months" className="text-sm font-semibold">
        ¿Cuántos meses quieres cubrir? <span className="font-display text-base">{monthsText(v)}</span>
      </label>
      <input
        id="months"
        type="range"
        min={1}
        max={12}
        step={1}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        className="accent-verde-profundo"
      />
      {v !== suggested && (
        <button type="button" className="w-fit text-sm font-semibold text-action" onClick={() => onSave(suggested)}>
          Usar la sugerencia ({monthsText(suggested)})
        </button>
      )}
    </div>
  )
}
