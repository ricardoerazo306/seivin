import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, BookOpen, ShieldCheck, Sprout, Wallet } from 'lucide-react'
import { BarChart } from '../../components/charts'
import { Card, Progress } from '../../components/ui'
import { CAPSULES } from '../../content/aprende'
import { money, signedMoney } from '../../lib/money'
import { useProfile } from '../../lib/profile'
import { useBalances, type BalanceSummary } from '../balance/api'
import { monthName, periodOf, periodSlug } from '../balance/logic'
import { useFund, useFundMovements, useGoalMovements, useGoals } from '../construye/api'
import { essentialAverage, fundPlan, goalPlan, monthsText, savedFrom } from '../construye/logic'

type Step = { title: string; text: string; to: string; cta: string }

export function InicioPage() {
  const profile = useProfile()
  const balances = useBalances()
  const goals = useGoals()
  const goalMoves = useGoalMovements()
  const fund = useFund()
  const fundMoves = useFundMovements()
  const [current] = useState(() => periodOf(new Date()))
  const [hour] = useState(() => new Date().getHours())

  const list = balances.data ?? []
  const closed = list.filter((b) => b.status === 'cerrado')
  const latest = closed[0] ?? null
  const before = latest ? (closed.find((b) => b.period < latest.period) ?? null) : null
  const thisMonth = list.find((b) => b.period === current)
  const activeGoals = (goals.data ?? []).filter((g) => g.status === 'activa')
  const f = fund.data?.[0]
  const essential = f?.essential_monthly_override ?? essentialAverage(list)
  const fp = f ? fundPlan(essential, f.target_months, savedFrom(f.initial_saved, fundMoves.data ?? []), f.planned_monthly) : null
  const read = new Set(profile.data?.capsules_read ?? [])
  const capsule = CAPSULES.find((c) => !read.has(c.id)) ?? CAPSULES[0]!

  const step: Step = !thisMonth
    ? {
        title: `Haz el balance de ${monthName(current)}`,
        text: latest ? `Copiamos los valores de ${monthName(latest.period)}: solo cambias lo que fue distinto.` : 'Es el primer paso: cuánto entró y cuánto salió este mes.',
        to: '/app/organiza',
        cta: 'Empezar',
      }
    : thisMonth.status === 'borrador'
      ? { title: `Cierra el balance de ${monthName(current)}`, text: 'Al cerrarlo verás qué cambió frente al mes anterior.', to: `/app/organiza/${periodSlug(current)}`, cta: 'Seguir' }
      : fp && fp.progress < 1 && (profile.data?.priority === 'respaldo' || activeGoals.length > 0)
        ? { title: 'Fortalece tu respaldo', text: fp.target ? `Llevas ${Math.round(fp.progress * 100)} % de tu meta para imprevistos.` : 'Define cuánto necesitas para estar tranquilo ante un imprevisto.', to: '/app/construye/respaldo', cta: 'Ver respaldo' }
        : activeGoals.length === 0
          ? { title: 'Crea tu primera meta', text: 'Un viaje, un portátil o una deuda menos: ponle nombre y monto.', to: '/app/construye', cta: 'Crear meta' }
          : { title: capsule.title, text: capsule.summary, to: `/app/aprende/${capsule.id}`, cta: 'Leer' }

  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const name = profile.data?.display_name?.split(' ')[0]

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">
          {greeting}
          {name ? `, ${name}` : ''}
        </h1>
        <p className="mt-1 text-ink-2">Así va tu plata.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl bg-petroleo p-5 text-blanco-calido sm:p-6">
          {balances.isPending ? (
            <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
          ) : latest ? (
            <>
              <p className="text-sm text-[#C9D6D1]">En {monthName(latest.period)} te quedaron</p>
              <p className="mt-1 font-display text-4xl font-extrabold tabular-nums">{money(latest.left_total)}</p>
              {before && (
                <p className="mt-1 text-sm text-menta">
                  {signedMoney(latest.left_total - before.left_total)} frente a {monthName(before.period)}
                </p>
              )}
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[#C9D6D1]">Entró</dt>
                  <dd className="font-semibold tabular-nums">{money(latest.income_total)}</dd>
                </div>
                <div>
                  <dt className="text-[#C9D6D1]">Salió</dt>
                  <dd className="font-semibold tabular-nums">{money(latest.expense_total)}</dd>
                </div>
              </dl>
            </>
          ) : (
            <>
              <p className="font-display text-2xl font-extrabold">Aquí verás cuánto te queda cada mes</p>
              <p className="mt-2 text-[#C9D6D1]">Cuando cierres tu primer balance, aparecerá el resumen y cómo cambia de un mes a otro.</p>
            </>
          )}
        </section>

        <section className="flex flex-col justify-between gap-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
          <div>
            <p className="text-sm font-semibold text-action">Tu próximo paso</p>
            <h2 className="mt-1 text-xl font-bold">{step.title}</h2>
            <p className="mt-1 text-ink-2">{step.text}</p>
          </div>
          <Link to={step.to} className="inline-flex h-12 w-fit items-center gap-2 rounded-2xl bg-verde-profundo px-5 font-semibold text-white">
            {step.cta} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </div>

      {closed.length >= 2 && <Trend list={closed} />}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <Sprout size={20} aria-hidden="true" className="text-action" />
            <h2 className="text-lg font-bold">Metas</h2>
          </div>
          {activeGoals.length === 0 ? (
            <p className="mt-2 text-sm text-ink-2">Aún no tienes metas activas.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-4">
              {activeGoals.slice(0, 3).map((g) => {
                const p = goalPlan(g, (goalMoves.data ?? []).filter((m) => m.goal_id === g.id))
                return (
                  <li key={g.id}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-semibold">{g.name}</span>
                      <span className="tabular-nums text-ink-2">
                        {money(p.saved)} de {money(g.target_amount)}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <Progress value={p.progress} label={`Avance de ${g.name}`} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <Link to="/app/construye" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-action">
            {activeGoals.length ? 'Ver metas' : 'Crear una meta'} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} aria-hidden="true" className="text-action" />
            <h2 className="text-lg font-bold">Respaldo para imprevistos</h2>
          </div>
          {fp?.target ? (
            <>
              <p className="mt-2 text-sm text-ink-2">
                Tienes {money(fp.saved)}: cubre {monthsText(fp.covered ?? 0)} de gastos esenciales. Tu meta es {money(fp.target)}.
              </p>
              <div className="mt-3">
                <Progress value={fp.progress} label="Avance del respaldo" />
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-2">Con tu primer balance calculamos cuánto necesitas para estar tranquilo ante un imprevisto.</p>
          )}
          <Link to="/app/construye/respaldo" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-action">
            Ver respaldo <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to={`/app/aprende/${capsule.id}`} className="flex gap-3 rounded-3xl border border-line bg-surface p-5">
          <BookOpen size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-action" />
          <span>
            <span className="block text-sm text-ink-3">Cápsula de {capsule.minutes} minutos</span>
            <span className="block font-semibold">{capsule.title}</span>
            <span className="mt-1 block text-sm text-ink-2">{capsule.summary}</span>
          </span>
        </Link>
        <Link to="/app/organiza/salidas" className="flex gap-3 rounded-3xl border border-line bg-surface p-5">
          <Wallet size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-action" />
          <span>
            <span className="block text-sm text-ink-3">Simulador</span>
            <span className="block font-semibold">¿Cuánto te cuestan tus salidas?</span>
            <span className="mt-1 block text-sm text-ink-2">Mira su efecto en un año y qué podrías lograr con un pequeño cambio.</span>
          </span>
        </Link>
      </div>
    </div>
  )
}

function Trend({ list }: { list: BalanceSummary[] }) {
  const last = list.slice(0, 6).reverse()
  return (
    <Card>
      <h2 className="text-lg font-bold">Lo que te quedó cada mes</h2>
      <div className="mt-3">
        <BarChart
          title="Lo que te quedó en los últimos meses"
          labels={last.map((b) => monthName(b.period).slice(0, 3))}
          series={[{ name: 'Te quedó', values: last.map((b) => b.left_total), color: 'var(--dv-1)', negativeColor: 'var(--dv-2)' }]}
          height={170}
        />
      </div>
    </Card>
  )
}
