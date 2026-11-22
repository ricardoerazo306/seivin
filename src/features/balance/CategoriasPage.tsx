import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Archive, ArchiveRestore, ArrowLeft, Trash2 } from 'lucide-react'
import { Button, Card, Field, Notice } from '../../components/ui'
import type { Category, Kind } from '../../lib/types'
import { useCategories, useCategoryMutations } from './api'

function errorText(e: unknown): string {
  const code = (e as { code?: string } | null)?.code
  if (code === '23505') return 'Ya tienes una categoría con ese nombre.'
  if (code === '23503') return 'Esta categoría ya tiene movimientos. Puedes archivarla para que no aparezca en los próximos balances.'
  return 'No se guardó el cambio. Revisa tu conexión.'
}

export function CategoriasPage() {
  const categories = useCategories()
  const [error, setError] = useState<string | null>(null)
  const list = categories.data ?? []
  return (
    <div className="flex flex-col gap-6">
      <Link to="/app/organiza" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-verde-profundo">
        <ArrowLeft size={16} aria-hidden="true" /> Organiza
      </Link>
      <header>
        <h1 className="font-display text-3xl font-extrabold">Categorías</h1>
        <p className="mt-1 max-w-prose text-ink-2">
          Las esenciales son las que necesitas para vivir: vivienda, comida, transporte. Las usamos para calcular tu respaldo para imprevistos.
        </p>
      </header>
      {error && <Notice tone="warn">{error}</Notice>}
      {categories.isError && <Notice tone="warn">No pudimos cargar tus categorías. Recarga la página.</Notice>}
      <Group kind="ingreso" title="De dónde entra" list={list} onError={setError} />
      <Group kind="gasto" title="En qué sale" list={list} onError={setError} />
    </div>
  )
}

function Group({ kind, title, list, onError }: { kind: Kind; title: string; list: Category[]; onError: (s: string | null) => void }) {
  const m = useCategoryMutations()
  const mine = list.filter((c) => c.kind === kind)
  const active = mine.filter((c) => !c.archived)
  const archived = mine.filter((c) => c.archived)
  const [name, setName] = useState('')
  const [essential, setEssential] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = name.trim()
    if (!v) return setNameError('Escribe un nombre.')
    if (v.length > 60) return setNameError('Máximo 60 caracteres.')
    setNameError(null)
    m.create.mutate(
      { name: v, kind, is_essential: kind === 'gasto' && essential },
      {
        onSuccess: () => {
          setName('')
          setEssential(false)
          onError(null)
        },
        onError: (err) => setNameError(errorText(err)),
      },
    )
  }

  return (
    <Card>
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="mt-3 divide-y divide-line">
        {active.map((c) => (
          <Row key={c.id} c={c} onError={onError} />
        ))}
      </ul>
      {archived.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink-2">Archivadas ({archived.length})</summary>
          <ul className="mt-2 divide-y divide-line">
            {archived.map((c) => (
              <Row key={c.id} c={c} onError={onError} />
            ))}
          </ul>
        </details>
      )}
      <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Field
            label={kind === 'ingreso' ? 'Nueva categoría de ingreso' : 'Nueva categoría de gasto'}
            value={name}
            maxLength={60}
            error={nameError}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {kind === 'gasto' && (
          <label className="flex h-12 items-center gap-2 text-sm font-medium sm:mt-7">
            <input type="checkbox" checked={essential} onChange={(e) => setEssential(e.target.checked)} className="size-5 accent-verde-profundo" />
            Es esencial
          </label>
        )}
        <Button type="submit" variant="secondary" loading={m.create.isPending} className="sm:mt-7">
          Crear
        </Button>
      </form>
    </Card>
  )
}

function Row({ c, onError }: { c: Category; onError: (s: string | null) => void }) {
  const m = useCategoryMutations()
  const [name, setName] = useState(c.name)
  const [synced, setSynced] = useState(c.name)
  if (synced !== c.name) {
    setSynced(c.name)
    setName(c.name)
  }
  const fail = (e: unknown) => onError(errorText(e))
  const save = () => {
    const v = name.trim()
    if (!v || v.length > 60) return setName(c.name)
    if (v !== c.name) m.update.mutate({ id: c.id, name: v }, { onError: (e) => (setName(c.name), fail(e)) })
  }
  return (
    <li className="flex flex-wrap items-center gap-2 py-2">
      <label className="sr-only" htmlFor={`cat-${c.id}`}>
        Nombre de la categoría
      </label>
      <input
        id={`cat-${c.id}`}
        value={name}
        maxLength={60}
        disabled={c.archived}
        onChange={(e) => setName(e.target.value)}
        onBlur={save}
        className="h-11 min-w-0 flex-1 rounded-xl border border-transparent bg-transparent px-2 text-base font-medium text-ink outline-none hover:border-line focus:border-verde-profundo disabled:text-ink-3"
      />
      {c.kind === 'gasto' && !c.archived && (
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input
            type="checkbox"
            checked={c.is_essential}
            onChange={(e) => m.update.mutate({ id: c.id, is_essential: e.target.checked }, { onError: fail })}
            className="size-5 accent-verde-profundo"
          />
          Esencial
        </label>
      )}
      <button
        type="button"
        aria-label={c.archived ? `Restaurar ${c.name}` : `Archivar ${c.name}`}
        title={c.archived ? 'Restaurar' : 'Archivar'}
        onClick={() => m.update.mutate({ id: c.id, archived: !c.archived }, { onError: fail })}
        className="flex size-11 items-center justify-center rounded-xl text-ink-3 hover:bg-page hover:text-ink"
      >
        {c.archived ? <ArchiveRestore size={18} aria-hidden="true" /> : <Archive size={18} aria-hidden="true" />}
      </button>
      {!c.is_system && (
        <button
          type="button"
          aria-label={`Borrar ${c.name}`}
          title="Borrar"
          onClick={() => m.remove.mutate(c.id, { onSuccess: () => onError(null), onError: fail })}
          className="flex size-11 items-center justify-center rounded-xl text-ink-3 hover:bg-page hover:text-ink"
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      )}
    </li>
  )
}
