import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ChevronRight, Plus } from 'lucide-react'
import { Button, Card, Chip, Field, MoneyInput, Notice, PageHeader, Progress, Select, Tabs } from '../../components/ui'
import { money } from '../../lib/money'
import { useGoalMovements, useGoalMutations, useGoals, type Goal } from './api'
import { goalPlan, monthYear, monthsText } from './logic'
import { CONSTRUYE_TABS } from './tabs'


export function MetasPage() {
  const goals = useGoals()
  const moves = useGoalMovements()
  const [creating, setCreating] = useState(false)
  const all = goals.data ?? []
  const active = all.filter((g) => g.status === 'activa')
  const others = all.filter((g) => g.status !== 'activa')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Construye" text="Tus metas de ahorro y tu respaldo para imprevistos.">
        {!creating && (
          <Button onClick={() => setCreating(true)}>
            <Plus size={18} aria-hidden="true" /> Nueva meta
          </Button>
        )}
      </PageHeader>
      <Tabs items={CONSTRUYE_TABS} />
      {goals.isError && <Notice tone="warn">No pudimos cargar tus metas. Recarga la página.</Notice>}
      {creating && <GoalForm onDone={() => setCreating(false)} />}

      {!goals.isPending && all.length === 0 && !creating && (
        <Card>
          <h2 className="text-lg font-bold">Ponle nombre a lo que quieres lograr</h2>
          <p className="mt-1 text-ink-2">Un viaje, un portátil, la cuota inicial de algo o pagar una deuda. Con el monto y la fecha te decimos cuánto apartar cada mes.</p>
          <Button className="mt-4" onClick={() => setCreating(true)}>
            Crear mi primera meta
          </Button>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {active.map((g) => (
          <GoalCard key={g.id} goal={g} moves={(moves.data ?? []).filter((m) => m.goal_id === g.id)} />
        ))}
      </div>

      {others.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold">Cumplidas y archivadas</h2>
          <ul className="mt-2 divide-y divide-line">
            {others.map((g) => (
              <li key={g.id}>
                <Link to={`/app/construye/metas/${g.id}`} className="flex items-center gap-3 py-3">
                  <span className="flex-1 font-semibold">{g.name}</span>
                  <Chip tone={g.status === 'cumplida' ? 'good' : 'neutral'}>{g.status === 'cumplida' ? 'Cumplida' : 'Archivada'}</Chip>
                  <ChevronRight size={18} aria-hidden="true" className="text-ink-3" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function GoalCard({ goal, moves }: { goal: Goal; moves: { kind: 'aporte' | 'retiro'; amount: number }[] }) {
  const p = goalPlan(goal, moves)
  return (
    <Link to={`/app/construye/metas/${goal.id}`} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 transition hover:border-line-strong">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{goal.name}</h2>
          {goal.reason && <p className="text-sm text-ink-2">{goal.reason}</p>}
        </div>
        {goal.priority === 'alta' && <Chip>Prioridad alta</Chip>}
      </div>
      <div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-display text-xl font-extrabold tabular-nums">{money(p.saved)}</span>
          <span className="text-ink-2">de {money(goal.target_amount)}</span>
        </div>
        <div className="mt-2">
          <Progress value={p.progress} label={`Avance de ${goal.name}`} />
        </div>
      </div>
      <p className="text-sm text-ink-2">
        {p.done
          ? '¡Lo lograste! Puedes marcarla como cumplida.'
          : p.monthlyNeeded !== null
            ? `Para llegar en ${monthYear(new Date(goal.deadline + 'T12:00:00'))}: ${money(p.monthlyNeeded)} al mes.`
            : p.monthsAtPlan !== null && p.etaAtPlan
              ? `Apartando ${money(goal.planned_monthly ?? 0)} al mes, llegas en ${monthsText(p.monthsAtPlan)} (${monthYear(p.etaAtPlan)}).`
              : `Te faltan ${money(p.remaining)}.`}
      </p>
      {p.onTrack === false && <Chip tone="warn">El aporte planeado no alcanza para la fecha</Chip>}
    </Link>
  )
}

export function GoalForm({ goal, onDone }: { goal?: Goal; onDone: () => void }) {
  const m = useGoalMutations()
  const [name, setName] = useState(goal?.name ?? '')
  const [reason, setReason] = useState(goal?.reason ?? '')
  const [target, setTarget] = useState(goal?.target_amount ?? 0)
  const [initial, setInitial] = useState(goal?.initial_saved ?? 0)
  const [hasDate, setHasDate] = useState(goal ? !!goal.deadline : true)
  const [deadline, setDeadline] = useState(goal?.deadline?.slice(0, 7) ?? '')
  const [monthly, setMonthly] = useState(goal?.planned_monthly ?? 0)
  const [priority, setPriority] = useState<Goal['priority']>(goal?.priority ?? 'media')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [minMonth] = useState(() => new Date().toISOString().slice(0, 7))

  const preview = target > 0 ? goalPlan({ target_amount: target, initial_saved: initial, deadline: hasDate && deadline ? `${deadline}-01` : null, planned_monthly: monthly || null }, []) : null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Ponle un nombre a tu meta.'
    if (target <= 0) errs.target = 'Escribe cuánto necesitas.'
    if (hasDate && !deadline) errs.deadline = 'Elige un mes o marca que la fecha es flexible.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    const row = {
      name: name.trim().slice(0, 80),
      reason: reason.trim().slice(0, 300) || null,
      target_amount: target,
      initial_saved: initial,
      deadline: hasDate ? `${deadline}-01` : null,
      flexible_date: !hasDate,
      planned_monthly: monthly || null,
      priority,
    }
    const opts = { onSuccess: onDone, onError: () => setErrors({ form: 'No pudimos guardar la meta. Revisa tu conexión.' }) }
    if (goal) m.update.mutate({ id: goal.id, ...row }, opts)
    else m.insert.mutate(row, opts)
  }

  return (
    <Card>
      <h2 className="text-lg font-bold">{goal ? 'Editar meta' : 'Nueva meta'}</h2>
      <form onSubmit={submit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="¿Qué quieres lograr?" placeholder="Viaje a Cartagena" value={name} maxLength={80} error={errors.name} onChange={(e) => setName(e.target.value)} />
        <Field label="¿Para qué? (opcional)" placeholder="Vacaciones con mi familia" value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} />
        <MoneyInput label="¿Cuánto necesitas?" value={target} onValue={setTarget} error={errors.target} />
        <MoneyInput label="¿Cuánto tienes ya? (opcional)" value={initial} onValue={setInitial} />
        <div className="flex flex-col gap-2">
          <label htmlFor="goal-date" className="text-sm font-semibold">
            ¿Para cuándo?
          </label>
          <input
            id="goal-date"
            type="month"
            min={minMonth}
            disabled={!hasDate}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="h-12 rounded-xl border border-line-strong bg-surface px-3 text-base text-ink disabled:opacity-50"
          />
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" checked={!hasDate} onChange={(e) => setHasDate(!e.target.checked)} className="size-5 accent-verde-profundo" />
            La fecha es flexible
          </label>
          {errors.deadline && <p role="alert" className="text-sm font-medium text-amarillo-texto">{errors.deadline}</p>}
        </div>
        <MoneyInput label="¿Cuánto puedes apartar al mes? (opcional)" value={monthly} onValue={setMonthly} />
        <Select label="Prioridad" value={priority} onChange={(e) => setPriority(e.target.value as Goal['priority'])}>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </Select>
        {preview && !preview.done && (
          <div className="rounded-2xl bg-menta-suave p-4 text-sm text-menta-ink sm:col-span-2" role="status">
            {preview.monthlyNeeded !== null && (
              <p>
                Para llegar a tiempo necesitas apartar <strong>{money(preview.monthlyNeeded)} al mes</strong> durante {monthsText(preview.monthsLeft ?? 0)}.
              </p>
            )}
            {preview.monthsAtPlan !== null && preview.etaAtPlan && (
              <p>
                Con {money(monthly)} al mes llegarías en <strong>{monthsText(preview.monthsAtPlan)}</strong> ({monthYear(preview.etaAtPlan)}).
              </p>
            )}
            {preview.monthlyNeeded === null && preview.monthsAtPlan === null && <p>Agrega una fecha o un aporte mensual y te mostramos el plan.</p>}
          </div>
        )}
        {errors.form && <div className="sm:col-span-2"><Notice tone="warn">{errors.form}</Notice></div>}
        <div className="flex gap-3 sm:col-span-2">
          <Button type="submit" loading={m.insert.isPending || m.update.isPending}>
            {goal ? 'Guardar cambios' : 'Crear meta'}
          </Button>
          <Button variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
