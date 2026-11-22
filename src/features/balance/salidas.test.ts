import { describe, expect, it } from 'vitest'
import { activeBudgets, budgetStatus, outingCost, scenarioSavings } from './salidas'

const h = { per_month: 6, transport: 18000, food: 35000, drinks: 22000, other: 0 }

describe('salidas', () => {
  it('calcula costo por salida, al mes y al año', () => {
    expect(outingCost(h)).toEqual({ each: 75000, monthly: 450000, yearly: 5400000 })
  })
  it('estima el ahorro de salir menos o gastar menos', () => {
    const s = scenarioSavings(h, { fewer: 2, cheaperPct: 20 })
    expect(s.outings).toBe(4)
    expect(s.monthly).toBe(240000)
    expect(s.savedMonthly).toBe(210000)
    expect(s.savedYearly).toBe(2520000)
    expect(scenarioSavings(h, { fewer: 10, cheaperPct: 0 }).monthly).toBe(0)
  })
})

describe('presupuestos', () => {
  it('filtra los vigentes del mes', () => {
    const b = [
      { id: 1, month_from: '2026-10-01', month_to: null },
      { id: 2, month_from: '2026-12-01', month_to: null },
      { id: 3, month_from: '2026-01-01', month_to: '2026-09-01' },
    ]
    expect(activeBudgets(b, '2026-11-01').map((x) => x.id)).toEqual([1])
  })
  it('clasifica el avance', () => {
    expect(budgetStatus(100, 300)).toBe('bien')
    expect(budgetStatus(270, 300)).toBe('cerca')
    expect(budgetStatus(380, 300)).toBe('pasado')
  })
})
