import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, CheckCircle2, Search } from 'lucide-react'
import { Button, Chip, Notice, PageHeader } from '../../components/ui'
import { CAPSULES, GLOSSARY } from '../../content/aprende'
import { useProfile, useUpdateProfile } from '../../lib/profile'

export function AprendePage() {
  const profile = useProfile()
  const read = new Set(profile.data?.capsules_read ?? [])
  const [q, setQ] = useState('')
  const terms = GLOSSARY.filter((g) => (g.term + g.meaning).toLowerCase().includes(q.trim().toLowerCase()))
  const done = CAPSULES.filter((c) => read.has(c.id)).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Aprende" text={`Cápsulas de 2 o 3 minutos, sin tecnicismos. Llevas ${done} de ${CAPSULES.length}.`} />
      <ul className="grid gap-4 md:grid-cols-2">
        {CAPSULES.map((c) => (
          <li key={c.id}>
            <Link to={`/app/aprende/${c.id}`} className="flex h-full flex-col gap-2 rounded-3xl border border-line bg-surface p-5 transition hover:border-line-strong">
              <span className="flex items-center justify-between gap-2 text-sm text-ink-3">
                <span>
                  {c.topic} · {c.minutes} min
                </span>
                {read.has(c.id) && (
                  <span className="flex items-center gap-1 font-semibold text-action">
                    <CheckCircle2 size={16} aria-hidden="true" /> Leída
                  </span>
                )}
              </span>
              <span className="text-lg font-bold">{c.title}</span>
              <span className="text-sm text-ink-2">{c.summary}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6" aria-labelledby="glosario">
        <h2 id="glosario" className="text-lg font-bold">
          Glosario
        </h2>
        <div className="relative mt-3">
          <Search size={18} aria-hidden="true" className="absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3" />
          <label htmlFor="q" className="sr-only">
            Buscar un término
          </label>
          <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar un término" className="h-12 w-full rounded-xl border border-line-strong bg-surface pr-3 pl-10 text-base text-ink outline-none focus:border-verde-profundo" />
        </div>
        <dl className="mt-4 divide-y divide-line">
          {terms.map((g) => (
            <div key={g.term} className="py-3">
              <dt className="font-semibold">{g.term}</dt>
              <dd className="mt-0.5 text-sm text-ink-2">{g.meaning}</dd>
            </div>
          ))}
          {terms.length === 0 && <p className="py-3 text-sm text-ink-2">No encontramos ese término. Cuéntanos en Comentarios cuál te gustaría ver.</p>}
        </dl>
      </section>
    </div>
  )
}

export function CapsulaPage() {
  const { id } = useParams()
  const profile = useProfile()
  const update = useUpdateProfile()
  const c = CAPSULES.find((x) => x.id === id)
  if (!c) return <Notice tone="warn">No encontramos esa cápsula. <Link to="/app/aprende" className="font-semibold underline">Ver todas</Link></Notice>
  const read = profile.data?.capsules_read ?? []
  const isRead = read.includes(c.id)
  const idx = CAPSULES.indexOf(c)
  const next = CAPSULES[(idx + 1) % CAPSULES.length]!

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-5">
      <Link to="/app/aprende" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-action">
        <ArrowLeft size={16} aria-hidden="true" /> Aprende
      </Link>
      <div className="flex items-center gap-2">
        <Chip>{c.topic}</Chip>
        <span className="text-sm text-ink-3">{c.minutes} minutos</span>
      </div>
      <h1 className="font-display text-3xl font-extrabold">{c.title}</h1>
      <p className="text-lg text-ink-2">{c.summary}</p>
      {c.body.map((p, i) => (
        <p key={i} className="leading-relaxed text-ink">
          {p}
        </p>
      ))}
      <div className="flex flex-wrap gap-3 border-t border-line pt-5">
        <Link to={c.tryIt.to} className="inline-flex h-12 items-center rounded-2xl bg-verde-profundo px-5 font-semibold text-white">
          {c.tryIt.label}
        </Link>
        {isRead ? (
          <span className="inline-flex h-12 items-center gap-2 px-2 font-semibold text-action">
            <CheckCircle2 size={18} aria-hidden="true" /> Leída
          </span>
        ) : (
          <Button variant="secondary" loading={update.isPending} onClick={() => update.mutate({ capsules_read: [...read, c.id] })}>
            Marcar como leída
          </Button>
        )}
      </div>
      <Link to={`/app/aprende/${next.id}`} className="rounded-3xl border border-line bg-surface p-5">
        <span className="block text-sm text-ink-3">Siguiente</span>
        <span className="block font-semibold">{next.title}</span>
      </Link>
      <p className="text-xs text-ink-3">Contenido educativo general. No es asesoría financiera personalizada.</p>
    </article>
  )
}
