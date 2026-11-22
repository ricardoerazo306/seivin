import { useState } from 'react'
import { Link } from 'react-router'
import { Card, MoneyInput, Notice, PageHeader, Tabs } from '../../components/ui'
import { useRowMutations, useRows } from '../../lib/data'
import { money } from '../../lib/money'
import { useGoalMovements, useGoals } from '../construye/api'
import { goalPlan, monthsText } from '../construye/logic'
import { outingCost, scenarioSavings, type Habits, type Scenario } from './salidas'
import { ORGANIZA_TABS } from './tabs'

type OutingRow = Habits & { id: string; scenarios: Partial<Scenario> }

export function SalidasPage() {
  const rows = useRows<OutingRow>('outing_habits')
  const m = useRowMutations<OutingRow>('outing_habits')
  const row = rows.data?.[0]
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Organiza" text="Tu balance mes a mes: lo que entró, lo que salió y lo que te quedó." />
      <Tabs items={ORGANIZA_TABS} />
      {rows.isError && <Notice tone="warn">No pudimos cargar tus datos. Recarga la página.</Notice>}
      {row ? <Simulator key={row.id} row={row} onSave={(patch) => m.update.mutate({ id: row.id, ...patch })} /> : <div className="h-60 animate-pulse rounded-3xl bg-line" role="status" aria-label="Cargando" />}
    </div>
  )
}

function Simulator({ row, onSave }: { row: OutingRow; onSave: (p: Partial<OutingRow>) => void }) {
  const [h, setH] = useState<Habits>({ per_month: row.per_month, transport: row.transport, food: row.food, drinks: row.drinks, other: row.other })
  const [s, setS] = useState<Scenario>({ fewer: row.scenarios?.fewer ?? 1, cheaperPct: row.scenarios?.cheaperPct ?? 0 })
  const goals = useGoals()
  const moves = useGoalMovements()
  const cost = outingCost(h)
  const sim = scenarioSavings(h, s)
  const goal = (goals.data ?? []).find((g) => g.status === 'activa')
  const gp = goal ? goalPlan(goal, (moves.data ?? []).filter((x) => x.goal_id === goal.id)) : null
  const set = (k: keyof Habits, v: number) => setH((x) => ({ ...x, [k]: v }))
  const persist = (next?: Partial<{ h: Habits; s: Scenario }>) => onSave({ ...(next?.h ?? h), scenarios: next?.s ?? s })

  return (
    <>
      <Card>
        <h2 className="text-lg font-bold">¿Cómo son tus salidas?</h2>
        <p className="mt-1 text-sm text-ink-2">Planes con amigos, comidas afuera, rumba. Un promedio aproximado basta.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="per" className="text-sm font-semibold">
              Salidas al mes: <span className="font-display text-base">{h.per_month}</span>
            </label>
            <input id="per" type="range" min={0} max={30} value={h.per_month} onChange={(e) => set('per_month', Number(e.target.value))} onPointerUp={() => persist()} onKeyUp={() => persist()} className="accent-verde-profundo" />
          </div>
          {(
            [
              ['transport', 'Transporte por salida'],
              ['food', 'Comida por salida'],
              ['drinks', 'Bebidas por salida'],
              ['other', 'Otros por salida (entradas, propinas…)'],
            ] as const
          ).map(([k, label]) => (
            <MoneyInput key={k} label={label} value={h[k]} onValue={(v) => set(k, v)} onBlur={() => persist()} />
          ))}
        </div>
      </Card>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Costo de tus salidas">
        <div className="rounded-3xl border border-line bg-surface p-5">
          <p className="text-sm text-ink-2">Cada salida</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{money(cost.each)}</p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5">
          <p className="text-sm text-ink-2">Al mes</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{money(cost.monthly)}</p>
        </div>
        <div className="rounded-3xl bg-petroleo p-5 text-blanco-calido">
          <p className="text-sm text-[#C9D6D1]">En un año</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{money(cost.yearly)}</p>
        </div>
      </section>

      <Card>
        <h2 className="text-lg font-bold">¿Y si cambias un poco?</h2>
        <p className="mt-1 text-sm text-ink-2">No se trata de dejar de salir, sino de ver qué te dan tus salidas y qué podrías lograr.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="fewer" className="text-sm font-semibold">
              Salir {s.fewer} {s.fewer === 1 ? 'vez' : 'veces'} menos al mes
            </label>
            <input id="fewer" type="range" min={0} max={Math.max(1, h.per_month)} value={Math.min(s.fewer, h.per_month)} onChange={(e) => setS((x) => ({ ...x, fewer: Number(e.target.value) }))} onPointerUp={() => persist()} onKeyUp={() => persist()} className="accent-verde-profundo" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="cheaper" className="text-sm font-semibold">
              Gastar {s.cheaperPct} % menos en cada salida
            </label>
            <input id="cheaper" type="range" min={0} max={60} step={5} value={s.cheaperPct} onChange={(e) => setS((x) => ({ ...x, cheaperPct: Number(e.target.value) }))} onPointerUp={() => persist()} onKeyUp={() => persist()} className="accent-verde-profundo" />
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-menta-suave p-5 text-menta-ink" role="status">
          {sim.savedMonthly > 0 ? (
            <>
              <p>
                Liberarías <strong className="font-display text-xl tabular-nums">{money(sim.savedMonthly)}</strong> al mes:{' '}
                <strong className="tabular-nums">{money(sim.savedYearly)}</strong> en un año.
              </p>
              {goal && gp && !gp.done && (
                <p className="mt-2">
                  Con eso, tu meta <strong>{goal.name}</strong> (te faltan {money(gp.remaining)}) estaría lista en unos{' '}
                  <strong>{monthsText(Math.ceil(gp.remaining / sim.savedMonthly))}</strong> solo con este cambio.
                </p>
              )}
              {!goal && (
                <p className="mt-2">
                  <Link to="/app/construye" className="font-semibold underline">Crea una meta</Link> para ver en cuánto tiempo la lograrías.
                </p>
              )}
            </>
          ) : (
            <p>Mueve los controles para ver cuánto liberarías.</p>
          )}
        </div>
      </Card>
    </>
  )
}
