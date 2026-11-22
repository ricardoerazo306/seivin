import type { BalanceLine, Category, Kind } from '../../lib/types'

// ---------------------------------------------------------------------------
// Períodos
// ---------------------------------------------------------------------------

/** Primer día del mes en formato 'AAAA-MM-01'. */
export function periodOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

/** 'AAAA-MM' para la URL. */
export function periodSlug(period: string): string {
  return period.slice(0, 7)
}

export function periodFromSlug(slug: string): string | null {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(slug)
  return m ? `${m[1]}-${m[2]}-01` : null
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function monthName(period: string): string {
  return MONTHS[Number(period.slice(5, 7)) - 1] ?? ''
}

export function periodLabel(period: string): string {
  return `${monthName(period)} de ${period.slice(0, 4)}`
}

/** "Octubre de 2026" para encabezados de lista. */
export function periodTitle(period: string): string {
  const s = periodLabel(period)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ---------------------------------------------------------------------------
// Totales
// ---------------------------------------------------------------------------

type LineLike = Pick<BalanceLine, 'kind' | 'category_id' | 'amount' | 'name'>

export type Totals = {
  income: number
  expense: number
  essential: number
  left: number
  /** Porcentaje de lo que entró que quedó (null si no entró nada). */
  leftPct: number | null
}

export function totals(lines: LineLike[], categories: Pick<Category, 'id' | 'is_essential'>[]): Totals {
  const essentialIds = new Set(categories.filter((c) => c.is_essential).map((c) => c.id))
  let income = 0
  let expense = 0
  let essential = 0
  for (const l of lines) {
    const amount = Number(l.amount) || 0
    if (l.kind === 'ingreso') income += amount
    else {
      expense += amount
      if (essentialIds.has(l.category_id)) essential += amount
    }
  }
  const left = income - expense
  return { income, expense, essential, left, leftPct: income > 0 ? (left / income) * 100 : null }
}

// ---------------------------------------------------------------------------
// Comparación con el balance anterior
// ---------------------------------------------------------------------------

export type Change = {
  categoryId: string
  kind: Kind
  before: number
  after: number
  /** after − before */
  delta: number
  /** Efecto sobre lo que quedó: un ingreso que sube suma; un gasto que sube resta. */
  effect: number
}

export function compareByCategory(current: LineLike[], previous: LineLike[]): Change[] {
  const map = new Map<string, Change>()
  const add = (l: LineLike, side: 'before' | 'after') => {
    const key = `${l.kind}:${l.category_id}`
    const c = map.get(key) ?? { categoryId: l.category_id, kind: l.kind, before: 0, after: 0, delta: 0, effect: 0 }
    c[side] += Number(l.amount) || 0
    map.set(key, c)
  }
  previous.forEach((l) => add(l, 'before'))
  current.forEach((l) => add(l, 'after'))
  return [...map.values()]
    .map((c) => {
      const delta = c.after - c.before
      return { ...c, delta, effect: c.kind === 'ingreso' ? delta : -delta }
    })
    .filter((c) => c.delta !== 0)
    .sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect))
}

/** Valor que tenía la misma línea (mismo nombre y categoría) en el balance anterior. */
export function previousAmountFor(line: LineLike, previous: LineLike[]): number | null {
  const name = line.name.trim().toLowerCase()
  const match = previous.find((p) => p.kind === line.kind && p.category_id === line.category_id && p.name.trim().toLowerCase() === name)
  return match ? Number(match.amount) : null
}

// ---------------------------------------------------------------------------
// Nuevo balance a partir del anterior
// ---------------------------------------------------------------------------

export type NewLine = Pick<BalanceLine, 'kind' | 'category_id' | 'name' | 'amount' | 'expense_type' | 'recurring_item_id'> & {
  balance_id: string
}

/** Copia las líneas del balance anterior: la persona solo ajusta lo que cambió. */
export function draftFromPrevious(balanceId: string, previous: BalanceLine[], activeCategoryIds: Set<string>): NewLine[] {
  return previous
    .filter((l) => activeCategoryIds.has(l.category_id))
    .map((l) => ({
      balance_id: balanceId,
      kind: l.kind,
      category_id: l.category_id,
      name: l.name,
      amount: Number(l.amount),
      expense_type: l.expense_type,
      recurring_item_id: l.recurring_item_id,
    }))
}

/** Mensaje amigable y descriptivo sobre el cierre (sin culpa). */
export function closingMessage(left: number, previousLeft: number | null): string {
  const diff = previousLeft === null ? null : left - previousLeft
  if (left < 0) {
    return `Este mes salió más de lo que entró: ${fmt(-left)}. Revisemos juntos qué cambió para ajustar el próximo.`
  }
  if (diff === null) return `Cerraste tu primer balance. Te quedaron ${fmt(left)}.`
  if (diff > 0) return `¡Vas por buen camino! Te quedaron ${fmt(left)}, ${fmt(diff)} más que el mes anterior.`
  if (diff < 0) return `Te quedaron ${fmt(left)}, ${fmt(-diff)} menos que el mes anterior. Mira qué cambió para decidir si ajustar algo.`
  return `Te quedaron ${fmt(left)}, lo mismo que el mes anterior.`
}

function fmt(n: number) {
  return `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.round(n))}`
}
