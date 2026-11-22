import { Link } from 'react-router'
import { AREAS } from '../app/navigation'

/** Marcador de cada área mientras se construye. Dice en qué etapa llega. */
export function AreaPage({ areaId }: { areaId: string }) {
  const area = AREAS.find((a) => a.id === areaId)
  if (!area) return null
  return (
    <section className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-extrabold">{area.label}</h1>
      <p className="max-w-prose text-ink-2">{area.description}</p>
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-line-strong bg-surface p-5">
        <area.icon size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-verde-profundo" />
        <p className="text-sm text-ink-2">
          Esta sección se construye en la <strong className="text-ink">etapa {area.stage}</strong> del plan.
        </p>
      </div>
    </section>
  )
}

export function MorePage() {
  const rest = AREAS.filter((a) => ['entiende', 'aprende', 'cuenta'].includes(a.id))
  return (
    <section className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-extrabold">Más</h1>
      <ul className="flex flex-col gap-2">
        {rest.map((a) => (
          <li key={a.id}>
            <Link to={a.path} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 font-semibold">
              <a.icon size={20} aria-hidden="true" className="text-verde-profundo" />
              {a.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
