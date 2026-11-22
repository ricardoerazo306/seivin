import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Download, FileText } from 'lucide-react'
import { BarChart, HBarList } from '../../components/charts'
import { Button, Card, Notice, PageHeader, Select } from '../../components/ui'
import { BRAND } from '../../config/brand'
import { requireClient } from '../../lib/auth'
import { money, percent } from '../../lib/money'
import { useBalances, useCategories, useLines } from '../balance/api'
import { monthName, periodLabel } from '../balance/logic'

const RANGES = [3, 6, 12] as const

export function EntiendePage() {
  const balances = useBalances()
  const categories = useCategories()
  const [range, setRange] = useState<(typeof RANGES)[number]>(6)
  const data = balances.data
  const all = data ?? []
  const shown = useMemo(() => (data ?? []).slice(0, range).reverse(), [data, range])
  const [selected, setSelected] = useState<string | null>(null)
  const month = shown.find((b) => b.balance_id === selected) ?? shown[shown.length - 1] ?? null
  const lines = useLines(month?.balance_id)
  const reportRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<'png' | 'pdf' | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (balances.isPending) return <div className="h-60 animate-pulse rounded-3xl bg-line" role="status" aria-label="Cargando" />

  if (all.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Entiende" text="Cómo se mueve tu plata mes a mes." />
        <Card>
          <h2 className="text-lg font-bold">Tus estadísticas aparecen con tu primer balance</h2>
          <p className="mt-1 text-ink-2">Con dos o más meses verás tendencias y comparaciones.</p>
          <Link to="/app/organiza" className="mt-4 inline-flex h-12 items-center rounded-2xl bg-verde-profundo px-5 font-semibold text-white">
            Hacer mi balance
          </Link>
        </Card>
      </div>
    )
  }

  const n = shown.length
  const avgLeft = shown.reduce((s, b) => s + b.left_total, 0) / n
  const withIncome = shown.filter((b) => b.income_total > 0)
  const avgRate = withIncome.length ? withIncome.reduce((s, b) => s + b.left_total / b.income_total, 0) / withIncome.length : null
  const avgEssential = withIncome.length ? withIncome.reduce((s, b) => s + b.essential_total / b.income_total, 0) / withIncome.length : null
  const best = shown.reduce((a, b) => (b.left_total > a.left_total ? b : a), shown[0]!)
  const labels = shown.map((b) => monthName(b.period).slice(0, 3))
  const from = shown[0]!.period
  const to = shown[n - 1]!.period

  const byCat = new Map<string, number>()
  for (const l of lines.data ?? []) if (l.kind === 'gasto') byCat.set(l.category_id, (byCat.get(l.category_id) ?? 0) + l.amount)
  const expenseTotal = [...byCat.values()].reduce((s, v) => s + v, 0)
  const catItems = [...byCat.entries()]
    .map(([id, value]) => ({ label: categories.data?.find((c) => c.id === id)?.name ?? 'Sin categoría', value, note: expenseTotal ? `· ${percent((value / expenseTotal) * 100, 0)}` : undefined }))
    .sort((a, b) => b.value - a.value)

  const download = async (kind: 'png' | 'pdf') => {
    if (!reportRef.current) return
    setBusy(kind)
    setError(null)
    try {
      const { toPng } = await import('html-to-image')
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#ffffff'
      const dataUrl = await toPng(reportRef.current, { pixelRatio: 2, backgroundColor: bg, cacheBust: true })
      const name = `seivin-reporte-${from.slice(0, 7)}-a-${to.slice(0, 7)}`
      if (kind === 'png') {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `${name}.png`
        a.click()
      } else {
        const { jsPDF } = await import('jspdf')
        const img = new Image()
        img.src = dataUrl
        await img.decode()
        const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
        const ratio = img.height / img.width
        let w = 190
        let h = w * ratio
        if (h > 277) {
          h = 277
          w = h / ratio
        }
        pdf.addImage(dataUrl, 'PNG', (210 - w) / 2, 10, w, h)
        pdf.setProperties({ title: `Reporte Seivin ${periodLabel(from)} – ${periodLabel(to)}`, creator: 'Seivin' })
        pdf.save(`${name}.pdf`)
      }
      void requireClient().from('reports').insert({ kind, section: 'entiende', period_from: from, period_to: to })
    } catch {
      setError('No pudimos generar el archivo. Intenta de nuevo.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Entiende" text="Cómo se mueve tu plata mes a mes.">
        <div className="flex gap-2">
          <Button variant="secondary" loading={busy === 'png'} disabled={!!busy} onClick={() => download('png')}>
            <Download size={18} aria-hidden="true" /> PNG
          </Button>
          <Button variant="secondary" loading={busy === 'pdf'} disabled={!!busy} onClick={() => download('pdf')}>
            <FileText size={18} aria-hidden="true" /> PDF
          </Button>
        </div>
      </PageHeader>

      <div role="radiogroup" aria-label="Período" className="inline-flex w-fit rounded-2xl border border-line-strong bg-surface p-1">
        {RANGES.map((r) => (
          <button key={r} type="button" role="radio" aria-checked={range === r} onClick={() => setRange(r)} className={`h-10 rounded-xl px-4 text-sm font-semibold ${range === r ? 'bg-petroleo text-blanco-calido' : 'text-ink-2'}`}>
            {r} meses
          </button>
        ))}
      </div>
      {error && <Notice tone="warn">{error}</Notice>}

      <div ref={reportRef} className="flex flex-col gap-6 rounded-3xl bg-page">
        <p className="sr-only">
          {BRAND.name} · {periodLabel(from)} a {periodLabel(to)}
        </p>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumen del período">
          <Stat label="Te quedó en promedio" value={money(avgLeft)} sub="al mes" />
          <Stat label="Parte de lo que entró que quedó" value={avgRate !== null ? percent(avgRate * 100, 0) : '—'} sub="en promedio" />
          <Stat label="Lo esencial pesó" value={avgEssential !== null ? percent(avgEssential * 100, 0) : '—'} sub="de lo que entró" />
          <Stat label="Tu mejor mes" value={monthName(best.period)} sub={`quedaron ${money(best.left_total)}`} />
        </section>

        <Card>
          <h2 className="text-lg font-bold">Lo que entró y lo que salió</h2>
          <div className="mt-3">
            <BarChart
              title="Ingresos y gastos por mes"
              labels={labels}
              series={[
                { name: 'Entró', values: shown.map((b) => b.income_total), color: 'var(--dv-1)' },
                { name: 'Salió', values: shown.map((b) => b.expense_total), color: 'var(--dv-2)' },
              ]}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Lo que te quedó</h2>
          <div className="mt-3">
            <BarChart
              title="Lo que quedó cada mes"
              labels={labels}
              height={170}
              series={[{ name: 'Te quedó', values: shown.map((b) => b.left_total), color: 'var(--dv-1)', negativeColor: 'var(--dv-2)' }]}
            />
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-bold">En qué se fue la plata</h2>
            <Select label="Mes" hideLabel value={month?.balance_id ?? ''} onChange={(e) => setSelected(e.target.value)} className="w-48">
              {shown
                .slice()
                .reverse()
                .map((b) => (
                  <option key={b.balance_id} value={b.balance_id}>
                    {periodLabel(b.period)}
                  </option>
                ))}
            </Select>
          </div>
          <div className="mt-4">{catItems.length ? <HBarList items={catItems} /> : <p className="text-sm text-ink-2">Este mes no tiene gastos registrados.</p>}</div>
        </Card>
        <p className="px-1 text-xs text-ink-3">
          {BRAND.name} · {periodLabel(from)} a {periodLabel(to)} · {BRAND.disclaimer}
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
      <p className="text-sm text-ink-2">{label}</p>
      <p className="mt-1 font-display text-xl font-extrabold capitalize tabular-nums sm:text-2xl">{value}</p>
      {sub && <p className="text-sm text-ink-3">{sub}</p>}
    </div>
  )
}
