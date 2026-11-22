import { describe, expect, it } from 'vitest'
import type { BalanceLine } from '../../lib/types'
import { closingMessage, compareByCategory, draftFromPrevious, periodFromSlug, periodLabel, periodOf, previousAmountFor, totals } from './logic'
import { money, parseMoney, signedMoney } from '../../lib/money'

const cats = [
  { id: 'sal', is_essential: false },
  { id: 'extra', is_essential: false },
  { id: 'viv', is_essential: true },
  { id: 'ali', is_essential: true },
  { id: 'sali', is_essential: false },
  { id: 'comp', is_essential: false },
]
const L = (kind: 'ingreso' | 'gasto', category_id: string, amount: number, name = category_id) => ({ kind, category_id, amount, name })

// Datos del prototipo: octubre y noviembre de Ana
const oct = [L('ingreso', 'sal', 2800000), L('ingreso', 'extra', 250000), L('gasto', 'viv', 950000), L('gasto', 'ali', 580000), L('gasto', 'sali', 300000), L('gasto', 'comp', 230000)]
const nov = [L('ingreso', 'sal', 2800000), L('ingreso', 'extra', 400000), L('gasto', 'viv', 950000), L('gasto', 'ali', 620000), L('gasto', 'sali', 380000), L('gasto', 'comp', 160000)]

describe('períodos', () => {
  it('calcula y nombra el mes', () => {
    expect(periodOf(new Date(2026, 10, 22))).toBe('2026-11-01')
    expect(periodLabel('2026-11-01')).toBe('noviembre de 2026')
    expect(periodFromSlug('2026-11')).toBe('2026-11-01')
    expect(periodFromSlug('2026-13')).toBeNull()
    expect(periodFromSlug('abc')).toBeNull()
  })
})

describe('totales', () => {
  it('suma ingresos, gastos, esenciales y lo que queda', () => {
    const t = totals(nov, cats)
    expect(t.income).toBe(3200000)
    expect(t.expense).toBe(2110000)
    expect(t.essential).toBe(1570000)
    expect(t.left).toBe(1090000)
    expect(t.leftPct).toBeCloseTo(34.06, 1)
  })
  it('no divide entre cero sin ingresos', () => {
    expect(totals([L('gasto', 'viv', 100)], cats).leftPct).toBeNull()
  })
})

describe('comparación', () => {
  it('ordena los cambios por su efecto en lo que quedó', () => {
    const ch = compareByCategory(nov, oct)
    expect(ch.map((c) => [c.categoryId, c.effect])).toEqual([
      ['extra', 150000],
      ['sali', -80000],
      ['comp', 70000],
      ['ali', -40000],
    ])
    const sum = ch.reduce((a, c) => a + c.effect, 0)
    expect(sum).toBe(totals(nov, cats).left - totals(oct, cats).left)
  })
  it('encuentra el valor anterior de la misma línea', () => {
    expect(previousAmountFor(L('gasto', 'ali', 1, 'ALI '), oct)).toBe(580000)
    expect(previousAmountFor(L('gasto', 'ali', 1, 'otro'), oct)).toBeNull()
  })
})

describe('nuevo balance', () => {
  it('copia las líneas del anterior, sin categorías archivadas', () => {
    const prev = oct.map((l, i) => ({ ...l, id: String(i), balance_id: 'b0', expense_type: null, line_date: null, description: null, recurring_item_id: null, source: 'manual' })) as BalanceLine[]
    const draft = draftFromPrevious('b1', prev, new Set(['sal', 'viv']))
    expect(draft).toHaveLength(2)
    expect(draft.every((d) => d.balance_id === 'b1')).toBe(true)
  })
})

describe('mensajes y dinero', () => {
  it('describe el cierre sin culpa', () => {
    expect(closingMessage(395000, 300000)).toMatch(/Vas por buen camino.*\$95\.000 más/)
    expect(closingMessage(300000, null)).toMatch(/primer balance/)
    expect(closingMessage(-50000, 300000)).toMatch(/salió más de lo que entró/)
    expect(closingMessage(200000, 300000)).toMatch(/menos que el mes anterior/)
  })
  it('formatea y lee pesos', () => {
    expect(money(1500000)).toBe('$1.500.000')
    expect(money(-70000)).toBe('−$70.000')
    expect(signedMoney(95000)).toBe('+$95.000')
    expect(parseMoney('$ 1.500.000')).toBe(1500000)
    expect(parseMoney('')).toBe(0)
  })
})
