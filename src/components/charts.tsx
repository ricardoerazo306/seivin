import { useEffect, useId, useRef, useState } from 'react'
import { money } from '../lib/money'

/**
 * Gráfica de barras en SVG: una o dos series, admite valores negativos.
 * Barras finas con extremo redondeado, eje y cuadrícula discretos, tooltip al pasar
 * el cursor o enfocar con teclado, leyenda cuando hay dos series y tabla para lectores de pantalla.
 */
export type Series = { name: string; values: number[]; color: string; negativeColor?: string }

export function BarChart({
  labels,
  series,
  title,
  height = 200,
  format = money,
}: {
  labels: string[]
  series: Series[]
  title: string
  height?: number
  format?: (n: number) => string
}) {
  const id = useId()
  const [hover, setHover] = useState<number | null>(null)
  // El ancho real del contenedor: así el texto del eje mide lo mismo en celular y computador.
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(640)
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => e && setW(Math.max(260, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const H = height
  const padL = 8
  const padR = 8
  const padT = 14
  const padB = 26
  const all = series.flatMap((s) => s.values)
  const max = Math.max(0, ...all)
  const min = Math.min(0, ...all)
  const span = max - min || 1
  const y = (v: number) => padT + ((max - v) / span) * (H - padT - padB)
  const zero = y(0)
  const groupW = (W - padL - padR) / Math.max(1, labels.length)
  const gap = 2
  const barW = Math.min(36, (groupW * 0.62 - gap * (series.length - 1)) / series.length)
  const groupInner = barW * series.length + gap * (series.length - 1)
  const ticks = niceTicks(min, max)

  return (
    <figure className="m-0">
      <figcaption className="sr-only">{title}</figcaption>
      {series.length > 1 && (
        <ul className="mb-2 flex flex-wrap gap-4 text-sm text-ink-2" aria-hidden="true">
          {series.map((s) => (
            <li key={s.name} className="flex items-center gap-2">
              <span className="size-3 rounded-sm" style={{ background: s.color }} />
              {s.name}
            </li>
          ))}
        </ul>
      )}
      <div className="relative" ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-labelledby={`${id}-t`}>
          <title id={`${id}-t`}>{title}</title>
          {ticks.map((t) => (
            <line key={t} x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={t === 0 ? 1.5 : 1} />
          ))}
          {labels.map((label, i) => {
            const gx = padL + i * groupW + (groupW - groupInner) / 2
            return (
              <g
                key={label + i}
                tabIndex={0}
                role="button"
                aria-label={`${label}: ${series.map((s) => `${s.name} ${format(s.values[i] ?? 0)}`).join(', ')}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="outline-none"
              >
                <rect x={padL + i * groupW} y={0} width={groupW} height={H - padB} fill={hover === i ? 'var(--line)' : 'transparent'} opacity={0.35} />
                {series.map((s, si) => {
                  const v = s.values[i] ?? 0
                  const x = gx + si * (barW + gap)
                  const top = Math.min(y(v), zero)
                  const h = Math.max(v === 0 ? 0 : 1.5, Math.abs(zero - y(v)))
                  return <path key={s.name} d={roundedBar(x, top, barW, h, v >= 0)} fill={v < 0 && s.negativeColor ? s.negativeColor : s.color} />
                })}
                <text x={padL + i * groupW + groupW / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="var(--ink-3)">
                  {label}
                </text>
              </g>
            )
          })}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-xl border border-line bg-surface px-3 py-2 text-sm shadow-lg"
            style={{ left: `${((padL + hover * groupW + groupW / 2) / W) * 100}%` }}
            aria-hidden="true"
          >
            <p className="font-semibold text-ink">{labels[hover]}</p>
            {series.map((s) => (
              <p key={s.name} className="flex items-center gap-2 whitespace-nowrap text-ink-2">
                <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
                {s.name}: <span className="font-semibold text-ink tabular-nums">{format(s.values[hover] ?? 0)}</span>
              </p>
            ))}
          </div>
        )}
      </div>
      <table className="sr-only">
        <thead>
          <tr>
            <th>Mes</th>
            {series.map((s) => (
              <th key={s.name}>{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l + i}>
              <td>{l}</td>
              {series.map((s) => (
                <td key={s.name}>{format(s.values[i] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

/** Barra con las esquinas del extremo de datos redondeadas (4px) y la base recta. */
function roundedBar(x: number, top: number, w: number, h: number, up: boolean) {
  const r = Math.min(4, w / 2, h)
  if (up) {
    return `M${x},${top + h} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${top + h} Z`
  }
  return `M${x},${top} V${top + h - r} Q${x},${top + h} ${x + r},${top + h} H${x + w - r} Q${x + w},${top + h} ${x + w},${top + h - r} V${top} Z`
}

function niceTicks(min: number, max: number): number[] {
  const span = max - min
  if (span <= 0) return [0]
  const raw = span / 3
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const out: number[] = []
  for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step) out.push(Math.round(t))
  if (!out.includes(0)) out.push(0)
  return out
}

/** Lista de barras horizontales para comparar categorías (con valor escrito, sin depender del color). */
export function HBarList({ items, format = money }: { items: { label: string; value: number; note?: string }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul className="flex flex-col gap-3">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium text-ink">{i.label}</span>
            <span className="tabular-nums text-ink">
              {format(i.value)}
              {i.note && <span className="ml-1.5 text-ink-3">{i.note}</span>}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-line" aria-hidden="true">
            <div className="h-full rounded-full " style={{ width: `${(i.value / max) * 100}%`, background: "var(--dv-1)" }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
