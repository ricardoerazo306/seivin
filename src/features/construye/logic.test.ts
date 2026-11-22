import { describe, expect, it } from 'vitest'
import { essentialAverage, fundPlan, goalPlan, monthsBetween, monthsText, savedFrom, suggestedMonths } from './logic'

const today = new Date(2026, 10, 22) // 22 nov 2026

describe('metas', () => {
  it('suma aportes y resta retiros', () => {
    expect(savedFrom(600000, [{ kind: 'aporte', amount: 300000 }, { kind: 'retiro', amount: 100000 }])).toBe(800000)
  })
  it('calcula cuánto apartar para llegar a la fecha', () => {
    const p = goalPlan({ target_amount: 2400000, initial_saved: 600000, deadline: '2027-06-01', planned_monthly: 250000 }, [{ kind: 'aporte', amount: 550000 }], today)
    expect(p.saved).toBe(1150000)
    expect(p.remaining).toBe(1250000)
    expect(p.monthsLeft).toBe(7)
    expect(p.monthlyNeeded).toBe(178572)
    expect(p.monthsAtPlan).toBe(5)
    expect(p.onTrack).toBe(true)
    expect(p.progress).toBeCloseTo(0.479, 2)
  })
  it('sin fecha usa el aporte planeado y marca cumplida', () => {
    const p = goalPlan({ target_amount: 1000, initial_saved: 0, deadline: null, planned_monthly: 300 }, [], today)
    expect(p.monthlyNeeded).toBeNull()
    expect(p.monthsAtPlan).toBe(4)
    expect(p.etaAtPlan?.getMonth()).toBe(2) // marzo 2027
    expect(goalPlan({ target_amount: 1000, initial_saved: 1200, deadline: '2027-01-01', planned_monthly: null }, [], today).done).toBe(true)
  })
  it('una fecha pasada cuenta como un mes', () => {
    expect(monthsBetween(today, new Date(2026, 5, 1))).toBe(1)
  })
})

describe('respaldo', () => {
  it('promedia los últimos 3 meses con gastos esenciales', () => {
    expect(essentialAverage([
      { period: '2026-07-01', essential_total: 9 },
      { period: '2026-08-01', essential_total: 1500000 },
      { period: '2026-09-01', essential_total: 1600000 },
      { period: '2026-10-01', essential_total: 1700000 },
      { period: '2026-11-01', essential_total: 0 },
    ])).toBe(1600000)
    expect(essentialAverage([])).toBeNull()
  })
  it('sugiere meses según estabilidad, dependientes y deudas', () => {
    expect(suggestedMonths('estable', 0, false)).toBe(3)
    expect(suggestedMonths('variable', 2, true)).toBe(8)
    expect(suggestedMonths(null, 0, false)).toBe(3)
  })
  it('calcula meta, meses cubiertos y tiempo para llegar', () => {
    const f = fundPlan(1600000, 3, 1400000, 200000)
    expect(f.target).toBe(4800000)
    expect(f.covered).toBeCloseTo(0.875)
    expect(f.monthsToGoal).toBe(17)
    expect(fundPlan(null, 3, 0, 100).target).toBeNull()
    expect(monthsText(1)).toBe('1 mes')
    expect(monthsText(2.46)).toBe('2,5 meses')
  })
})
