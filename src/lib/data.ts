import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requireClient, useAuth } from './auth'

/** Identificador del usuario actual (real o del modo exploración). */
export function useUid() {
  const auth = useAuth()
  return auth.status === 'signed-in' ? auth.session.user.id : null
}

const NUMERIC = new Set([
  'amount', 'target_amount', 'initial_saved', 'planned_monthly', 'target_months', 'essential_monthly_override',
  'per_month', 'transport', 'food', 'drinks', 'other',
])

/** PostgREST devuelve los numeric como texto: aquí se convierten a número. */
export function numify<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...row }
  for (const k of Object.keys(out)) if (NUMERIC.has(k) && out[k] !== null && out[k] !== undefined) out[k] = Number(out[k])
  return out as T
}

type Order = { column: string; ascending?: boolean }

/** Lectura simple de una tabla propia (RLS filtra por usuario). */
export function useRows<T>(table: string, opts: { order?: Order[]; select?: string; enabled?: boolean } = {}) {
  const uid = useUid()
  return useQuery({
    queryKey: [table, uid],
    enabled: !!uid && opts.enabled !== false,
    queryFn: async () => {
      let q = requireClient().from(table).select(opts.select ?? '*')
      for (const o of opts.order ?? []) q = q.order(o.column, { ascending: o.ascending ?? true })
      const { data, error } = await q
      if (error) throw error
      return ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => numify<T>(r))
    },
  })
}

/** Altas, cambios y bajas que refrescan las tablas indicadas. */
export function useRowMutations<T extends { id: string }>(table: string, alsoRefresh: string[] = []) {
  const qc = useQueryClient()
  const uid = useUid()
  const refresh = () => [table, ...alsoRefresh].forEach((t) => qc.invalidateQueries({ queryKey: [t, uid] }))
  return {
    insert: useMutation({
      mutationFn: async (row: Partial<Omit<T, 'id'>>) => {
        const { data, error } = await requireClient().from(table).insert(row as Record<string, unknown>).select().single()
        if (error) throw error
        return numify<T>(data as Record<string, unknown>)
      },
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...patch }: Partial<T> & { id: string }) => {
        const { error } = await requireClient().from(table).update(patch as Record<string, unknown>).eq('id', id)
        if (error) throw error
      },
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await requireClient().from(table).delete().eq('id', id)
        if (error) throw error
      },
      onSuccess: refresh,
    }),
  }
}
