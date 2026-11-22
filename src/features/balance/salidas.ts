/** Simulador de salidas: costo actual y efecto de pequeños cambios. */
export type Habits = { per_month: number; transport: number; food: number; drinks: number; other: number }
export type Scenario = { fewer: number; cheaperPct: number }

export function outingCost(h: Habits) {
  const each = (h.transport || 0) + (h.food || 0) + (h.drinks || 0) + (h.other || 0)
  const monthly = Math.round(each * (h.per_month || 0))
  return { each, monthly, yearly: monthly * 12 }
}

export function scenarioSavings(h: Habits, s: Scenario) {
  const base = outingCost(h)
  const outings = Math.max(0, (h.per_month || 0) - s.fewer)
  const each = base.each * (1 - Math.min(100, Math.max(0, s.cheaperPct)) / 100)
  const monthly = Math.round(each * outings)
  const savedMonthly = base.monthly - monthly
  return { monthly, savedMonthly, savedYearly: savedMonthly * 12, outings }
}

/** Presupuesto vigente en un mes (month_from <= período y sin fin o fin >= período). */
export function activeBudgets<T extends { month_from: string; month_to: string | null }>(budgets: T[], period: string): T[] {
  return budgets.filter((b) => b.month_from <= period && (!b.month_to || b.month_to >= period))
}

export function budgetStatus(spent: number, limit: number): 'bien' | 'cerca' | 'pasado' {
  if (spent > limit) return 'pasado'
  if (spent >= limit * 0.85) return 'cerca'
  return 'bien'
}
