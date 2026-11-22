/** Cálculos de metas de ahorro y del respaldo para imprevistos (sin dependencias de React). */

export type Movement = { kind: 'aporte' | 'retiro'; amount: number }

export function savedFrom(initial: number, movements: Movement[]): number {
  return movements.reduce((s, m) => s + (m.kind === 'aporte' ? m.amount : -m.amount), Number(initial) || 0)
}

/** Meses completos entre el mes de `from` y el de `to` (mínimo 1 si `to` es posterior o igual). */
export function monthsBetween(from: Date, to: Date): number {
  return Math.max(1, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()))
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth() + n, 1)
  return x
}

export type GoalPlan = {
  saved: number
  remaining: number
  progress: number
  /** Cuánto apartar al mes para llegar a la fecha (si hay fecha). */
  monthlyNeeded: number | null
  monthsLeft: number | null
  /** Meses para llegar con el aporte planeado (si hay aporte planeado). */
  monthsAtPlan: number | null
  /** Fecha estimada con el aporte planeado. */
  etaAtPlan: Date | null
  /** ¿El aporte planeado alcanza para la fecha? */
  onTrack: boolean | null
  done: boolean
}

export function goalPlan(
  goal: { target_amount: number; initial_saved: number; deadline: string | null; planned_monthly: number | null },
  movements: Movement[],
  today = new Date(),
): GoalPlan {
  const target = Number(goal.target_amount)
  const saved = savedFrom(goal.initial_saved, movements)
  const remaining = Math.max(0, target - saved)
  const progress = target > 0 ? Math.min(1, Math.max(0, saved / target)) : 0
  const done = remaining === 0
  let monthsLeft: number | null = null
  let monthlyNeeded: number | null = null
  if (goal.deadline && !done) {
    const [y, m] = goal.deadline.split('-').map(Number)
    monthsLeft = monthsBetween(today, new Date(y!, m! - 1, 1))
    monthlyNeeded = Math.ceil(remaining / monthsLeft)
  }
  const planned = Number(goal.planned_monthly) || 0
  const monthsAtPlan = !done && planned > 0 ? Math.ceil(remaining / planned) : done ? 0 : null
  const etaAtPlan = monthsAtPlan !== null ? addMonths(today, monthsAtPlan) : null
  const onTrack = monthlyNeeded !== null && planned > 0 ? planned >= monthlyNeeded : null
  return { saved, remaining, progress, monthlyNeeded, monthsLeft, monthsAtPlan, etaAtPlan, onTrack, done }
}

// ---------------------------------------------------------------- respaldo

/** Promedio de gastos esenciales de los últimos 3 balances con datos. */
export function essentialAverage(summaries: { period: string; essential_total: number }[]): number | null {
  const recent = summaries
    .filter((s) => s.essential_total > 0)
    .sort((a, b) => (a.period < b.period ? 1 : -1))
    .slice(0, 3)
  if (recent.length === 0) return null
  return Math.round(recent.reduce((s, r) => s + r.essential_total, 0) / recent.length)
}

/** Meses sugeridos: 3 si el ingreso es estable, 6 si es variable; +1 con dependientes; +1 con deudas grandes. */
export function suggestedMonths(stability: 'estable' | 'variable' | null, dependents: number, debts: boolean): number {
  let m = stability === 'variable' ? 6 : 3
  if (dependents > 0) m += 1
  if (debts) m += 1
  return Math.min(12, m)
}

export type FundPlan = {
  essential: number | null
  target: number | null
  saved: number
  progress: number
  covered: number | null
  monthsToGoal: number | null
}

export function fundPlan(essential: number | null, targetMonths: number, saved: number, planned: number | null): FundPlan {
  const target = essential ? Math.round((essential * targetMonths) / 1000) * 1000 : null
  const remaining = target !== null ? Math.max(0, target - saved) : null
  return {
    essential,
    target,
    saved,
    progress: target ? Math.min(1, Math.max(0, saved / target)) : 0,
    covered: essential ? saved / essential : null,
    monthsToGoal: remaining === 0 ? 0 : remaining !== null && planned && planned > 0 ? Math.ceil(remaining / planned) : null,
  }
}

export function monthYear(d: Date): string {
  return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}

export function monthsText(n: number): string {
  const v = Math.round(n * 10) / 10
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(v)} ${v === 1 ? 'mes' : 'meses'}`
}
