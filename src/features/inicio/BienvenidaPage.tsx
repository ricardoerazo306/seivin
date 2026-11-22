import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Field, Notice } from '../../components/ui'
import { useProfile, useUpdateProfile } from '../../lib/profile'
import type { ExperienceMode, Profile } from '../../lib/types'

type Choice<T> = { id: T; label: string; text?: string }

const PRIORITIES: Choice<NonNullable<Profile['priority']>>[] = [
  { id: 'organizar', label: 'Saber en qué se me va la plata' },
  { id: 'ahorrar', label: 'Ahorrar para algo' },
  { id: 'respaldo', label: 'Tener un respaldo para imprevistos' },
  { id: 'deudas', label: 'Salir de deudas' },
]
const STABILITY: Choice<NonNullable<Profile['income_stability']>>[] = [
  { id: 'estable', label: 'Casi igual cada mes', text: 'Salario fijo, pensión…' },
  { id: 'variable', label: 'Cambia de un mes a otro', text: 'Independiente, ventas, comisiones…' },
]
const MODES: Choice<ExperienceMode>[] = [
  { id: 'inicial', label: 'Estoy empezando', text: 'Te explicamos cada paso.' },
  { id: 'intermedio', label: 'Ya llevo algunas cuentas', text: 'Más opciones a la vista.' },
  { id: 'avanzado', label: 'Me muevo bien con esto', text: 'Todo el detalle.' },
]

export function BienvenidaPage() {
  const navigate = useNavigate()
  const profile = useProfile()
  const update = useUpdateProfile()
  const [step, setStep] = useState(0)
  const [name, setName] = useState<string | null>(null)
  const [priority, setPriority] = useState<Profile['priority']>(null)
  const [stability, setStability] = useState<Profile['income_stability']>(null)
  const [dependents, setDependents] = useState(0)
  const [mode, setMode] = useState<ExperienceMode>('inicial')
  const [error, setError] = useState<string | null>(null)
  const displayName = name ?? profile.data?.display_name ?? ''

  const finish = (to: string) =>
    update.mutate(
      {
        display_name: displayName.trim().slice(0, 80) || null,
        priority,
        income_stability: stability,
        dependents,
        experience_mode: mode,
        onboarding_completed: true,
      },
      { onSuccess: () => navigate(to, { replace: true }), onError: () => setError('No pudimos guardar. Revisa tu conexión e intenta de nuevo.') },
    )

  const steps = [
    {
      title: '¡Hola! Te damos la bienvenida a Seivin',
      body: (
        <>
          <p className="text-ink-2">Son cuatro preguntas rápidas para mostrarte lo que más te sirve. Puedes cambiarlas cuando quieras.</p>
          <div className="mt-5">
            <Field label="¿Cómo te llamamos?" value={displayName} maxLength={80} onChange={(e) => setName(e.target.value)} />
          </div>
        </>
      ),
      ok: true,
    },
    { title: '¿Qué quieres lograr primero?', body: <Options items={PRIORITIES} value={priority} onChange={setPriority} />, ok: !!priority },
    {
      title: '¿Cómo es tu ingreso?',
      body: (
        <>
          <Options items={STABILITY} value={stability} onChange={setStability} />
          <div className="mt-5">
            <label htmlFor="dep" className="text-sm font-semibold">
              ¿Cuántas personas dependen de ti?
            </label>
            <div className="mt-2 flex items-center gap-3">
              <button type="button" aria-label="Menos" onClick={() => setDependents((d) => Math.max(0, d - 1))} className="size-12 rounded-xl border border-line-strong bg-surface text-xl font-bold">
                −
              </button>
              <output id="dep" className="w-10 text-center font-display text-2xl font-extrabold">
                {dependents}
              </output>
              <button type="button" aria-label="Más" onClick={() => setDependents((d) => Math.min(20, d + 1))} className="size-12 rounded-xl border border-line-strong bg-surface text-xl font-bold">
                +
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-ink-3">Lo usamos para sugerirte cuánto guardar para imprevistos.</p>
        </>
      ),
      ok: !!stability,
    },
    { title: '¿Cómo te sientes con tus finanzas?', body: <Options items={MODES} value={mode} onChange={setMode} />, ok: true },
  ]
  const s = steps[step]!
  const last = step === steps.length - 1

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 py-4">
      <div className="flex gap-1.5" aria-label={`Paso ${step + 1} de ${steps.length}`}>
        {steps.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-verde-profundo' : 'bg-line'}`} />
        ))}
      </div>
      <h1 className="font-display text-3xl font-extrabold">{s.title}</h1>
      <div>{s.body}</div>
      {error && <Notice tone="warn">{error}</Notice>}
      {last ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button loading={update.isPending} onClick={() => finish('/app/organiza')}>
            Hacer mi primer balance
          </Button>
          <Button variant="secondary" disabled={update.isPending} onClick={() => finish('/app')}>
            Explorar primero
          </Button>
        </div>
      ) : (
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Atrás
            </Button>
          )}
          <Button disabled={!s.ok} onClick={() => setStep(step + 1)}>
            Continuar
          </Button>
        </div>
      )}
    </div>
  )
}

function Options<T extends string>({ items, value, onChange }: { items: Choice<T>[]; value: T | null; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" className="flex flex-col gap-3">
      {items.map((i) => {
        const on = value === i.id
        return (
          <button
            key={i.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(i.id)}
            className={`rounded-2xl p-4 text-left transition ${on ? 'border-2 border-verde-profundo bg-menta-suave' : 'border border-line-strong bg-surface hover:bg-page'}`}
          >
            <span className="block font-semibold">{i.label}</span>
            {i.text && <span className="mt-0.5 block text-sm text-ink-2">{i.text}</span>}
          </button>
        )
      })}
    </div>
  )
}
