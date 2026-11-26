import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Archive, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { Button, Card, Chip, Notice } from '../../components/ui'
import { money } from '../../lib/money'
import { useGoalMovementMutations, useGoalMovements, useGoalMutations, useGoals } from './api'
import { goalPlan, monthYear, monthsText } from './logic'
import { GoalForm } from './MetasPage'
import { MovementForm, MovementList } from './Movements'
import { toast } from '../../lib/toast'

export function MetaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const goals = useGoals()
  const moves = useGoalMovements()
  const gm = useGoalMutations()
  const mm = useGoalMovementMutations()
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const goal = goals.data?.find((g) => g.id === id)
  const mine = (moves.data ?? []).filter((m) => m.goal_id === id)

  if (goals.isPending) return <div className="h-40 animate-pulse rounded-3xl bg-line" role="status" aria-label="Cargando" />
  if (!goal) return <Notice tone="warn">No encontramos esa meta. <Link to="/app/construye" className="font-semibold underline">Volver</Link></Notice>
  const p = goalPlan(goal, mine)

  return (
    <div className="flex flex-col gap-6">
      <Link to="/app/construye" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-action">
        <ArrowLeft size={16} aria-hidden="true" /> Metas
      </Link>
      {editing ? (
        <GoalForm goal={goal} onDone={() => setEditing(false)} />
      ) : (
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold">{goal.name}</h1>
            {goal.reason && <p className="mt-1 text-ink-2">{goal.reason}</p>}
          </div>
          <div className="flex items-center gap-2">
            {goal.status !== 'activa' && <Chip tone={goal.status === 'cumplida' ? 'good' : 'neutral'}>{goal.status === 'cumplida' ? 'Cumplida' : 'Archivada'}</Chip>}
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={16} aria-hidden="true" /> Editar
            </Button>
          </div>
        </header>
      )}

      <section className="rounded-3xl bg-petroleo p-5 text-blanco-calido sm:p-6">
        <p className="text-sm text-[#C9D6D1]">Llevas</p>
        <p className="font-display text-4xl font-extrabold tabular-nums">{money(p.saved)}</p>
        <p className="text-sm text-[#C9D6D1]">
          de {money(goal.target_amount)} · {Math.round(p.progress * 100)} %
        </p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Avance" aria-valuenow={Math.round(p.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-menta" style={{ width: `${p.progress * 100}%` }} />
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[#C9D6D1]">Te falta</dt>
            <dd className="font-semibold tabular-nums">{money(p.remaining)}</dd>
          </div>
          {p.monthlyNeeded !== null && (
            <div>
              <dt className="text-[#C9D6D1]">Para {monthYear(new Date(goal.deadline + 'T12:00:00'))}</dt>
              <dd className="font-semibold tabular-nums">{money(p.monthlyNeeded)} al mes</dd>
            </div>
          )}
          {p.monthsAtPlan !== null && p.etaAtPlan && !p.done && (
            <div>
              <dt className="text-[#C9D6D1]">Con {money(goal.planned_monthly ?? 0)} al mes</dt>
              <dd className="font-semibold">
                {monthsText(p.monthsAtPlan)} ({monthYear(p.etaAtPlan)})
              </dd>
            </div>
          )}
        </dl>
      </section>
      {p.onTrack === false && (
        <Notice tone="warn">
          Con {money(goal.planned_monthly ?? 0)} al mes no alcanzas a llegar en la fecha. Puedes subir el aporte a {money(p.monthlyNeeded ?? 0)}, mover la fecha o ajustar el monto. Cualquiera está bien.
        </Notice>
      )}
      {p.done && goal.status === 'activa' && (
        <Notice tone="good">
          ¡Llegaste a tu meta! <button type="button" className="font-semibold underline" onClick={() => gm.update.mutate({ id: goal.id, status: 'cumplida' })}>Marcarla como cumplida</button>
        </Notice>
      )}

      <Card>
        <h2 className="text-lg font-bold">Registrar un movimiento</h2>
        <div className="mt-3">
          <MovementForm
            loading={mm.insert.isPending}
            max={p.saved}
            onSubmit={(m, reset, fail) => mm.insert.mutate({ goal_id: goal.id, kind: m.kind, amount: m.amount, movement_date: m.movement_date, note: m.note }, { onSuccess: () => (reset(), toast(m.kind === 'aporte' ? 'Aporte registrado' : 'Retiro registrado')), onError: fail })}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Movimientos</h2>
        <div className="mt-2">
          <MovementList items={mine} onRemove={(mid) => mm.remove.mutate(mid)} />
        </div>
        {goal.initial_saved > 0 && <p className="mt-2 text-sm text-ink-3">Empezaste con {money(goal.initial_saved)}.</p>}
      </Card>

      {error && <Notice tone="warn">{error}</Notice>}
      <div className="flex flex-wrap gap-3">
        {goal.status === 'activa' ? (
          <>
            <Button variant="ghost" onClick={() => gm.update.mutate({ id: goal.id, status: 'cumplida' }, { onSuccess: () => toast('¡Meta cumplida!') })}>
              <CheckCircle2 size={18} aria-hidden="true" /> Marcar como cumplida
            </Button>
            <Button variant="ghost" onClick={() => gm.update.mutate({ id: goal.id, status: 'archivada' })}>
              <Archive size={18} aria-hidden="true" /> Archivar
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={() => gm.update.mutate({ id: goal.id, status: 'activa' })}>
            Volver a activar
          </Button>
        )}
        {confirm ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-2">¿Borrar la meta y sus movimientos?</span>
            <Button
              variant="danger"
              loading={gm.remove.isPending}
              onClick={() => gm.remove.mutate(goal.id, { onSuccess: () => navigate('/app/construye', { replace: true }), onError: () => setError('No pudimos borrarla.') })}
            >
              Sí, borrar
            </Button>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              No
            </Button>
          </span>
        ) : (
          <Button variant="ghost" onClick={() => setConfirm(true)}>
            <Trash2 size={18} aria-hidden="true" /> Borrar meta
          </Button>
        )}
      </div>
    </div>
  )
}
