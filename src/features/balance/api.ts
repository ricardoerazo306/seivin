import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requireClient, useAuth } from '../../lib/auth'
import type { BalanceLine, Category, Kind, MonthlyBalance } from '../../lib/types'

export type BalanceSummary = {
  balance_id: string
  period: string
  status: MonthlyBalance['status']
  income_total: number
  expense_total: number
  essential_total: number
  left_total: number
}

function useUid() {
  const auth = useAuth()
  return auth.status === 'signed-in' ? auth.session.user.id : null
}

const num = <T extends { amount: number | string }>(r: T) => ({ ...r, amount: Number(r.amount) })

// ---------------------------------------------------------------- categorías

export function useCategories() {
  const uid = useUid()
  return useQuery({
    queryKey: ['categories', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await requireClient()
        .from('categories')
        .select('id, name, kind, is_essential, is_system, archived, sort_order')
        .order('sort_order')
        .order('name')
      if (error) throw error
      return data as Category[]
    },
  })
}

export function useCategoryMutations() {
  const qc = useQueryClient()
  const uid = useUid()
  const done = () => qc.invalidateQueries({ queryKey: ['categories', uid] })
  return {
    create: useMutation({
      mutationFn: async (c: { name: string; kind: Kind; is_essential: boolean }) => {
        const { error } = await requireClient().from('categories').insert({ ...c, name: c.name.trim(), sort_order: 100 })
        if (error) throw error
      },
      onSuccess: done,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...patch }: { id: string } & Partial<Pick<Category, 'name' | 'is_essential' | 'archived'>>) => {
        const { error } = await requireClient().from('categories').update(patch).eq('id', id)
        if (error) throw error
      },
      onSuccess: () => {
        done()
        qc.invalidateQueries({ queryKey: ['balances', uid] })
      },
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await requireClient().from('categories').delete().eq('id', id)
        if (error) throw error
      },
      onSuccess: done,
    }),
  }
}

// ---------------------------------------------------------------- balances

export function useBalances() {
  const uid = useUid()
  return useQuery({
    queryKey: ['balances', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await requireClient()
        .from('balance_summaries')
        .select('balance_id, period, status, income_total, expense_total, essential_total, left_total')
        .order('period', { ascending: false })
      if (error) throw error
      return (data ?? []).map((r) => ({
        ...r,
        income_total: Number(r.income_total),
        expense_total: Number(r.expense_total),
        essential_total: Number(r.essential_total),
        left_total: Number(r.left_total),
      })) as BalanceSummary[]
    },
  })
}

export function useBalance(period: string | null) {
  const uid = useUid()
  return useQuery({
    queryKey: ['balance', uid, period],
    enabled: !!uid && !!period,
    queryFn: async () => {
      const { data, error } = await requireClient()
        .from('monthly_balances')
        .select('id, period, status, closed_at, note')
        .eq('period', period!)
        .maybeSingle()
      if (error) throw error
      return data as MonthlyBalance | null
    },
  })
}

export function useLines(balanceId: string | null | undefined) {
  const uid = useUid()
  return useQuery({
    queryKey: ['lines', uid, balanceId],
    enabled: !!uid && !!balanceId,
    queryFn: async () => {
      const { data, error } = await requireClient()
        .from('balance_lines')
        .select('id, balance_id, kind, category_id, name, amount, expense_type, line_date, description, recurring_item_id, source')
        .eq('balance_id', balanceId!)
        .order('created_at')
      if (error) throw error
      return (data ?? []).map(num) as BalanceLine[]
    },
  })
}

export function useStartBalance() {
  const qc = useQueryClient()
  const uid = useUid()
  return useMutation({
    mutationFn: async (period: string) => {
      const { data, error } = await requireClient().rpc('start_balance', { p_period: period })
      if (error) throw error
      return data as string
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['balances', uid] }),
  })
}

/** Altas, cambios y bajas de líneas con actualización optimista. */
export function useLineMutations(balanceId: string) {
  const qc = useQueryClient()
  const uid = useUid()
  const key = ['lines', uid, balanceId]
  const refresh = () => {
    qc.invalidateQueries({ queryKey: key })
    qc.invalidateQueries({ queryKey: ['balances', uid] })
  }
  const optimistic = async (fn: (old: BalanceLine[]) => BalanceLine[]) => {
    await qc.cancelQueries({ queryKey: key })
    const prev = qc.getQueryData<BalanceLine[]>(key)
    if (prev) qc.setQueryData(key, fn(prev))
    return { prev }
  }
  const rollback = (_e: unknown, _v: unknown, ctx?: { prev?: BalanceLine[] }) => {
    if (ctx?.prev) qc.setQueryData(key, ctx.prev)
  }
  return {
    add: useMutation({
      mutationFn: async (l: Pick<BalanceLine, 'kind' | 'category_id' | 'name' | 'amount' | 'expense_type'>) => {
        const { error } = await requireClient()
          .from('balance_lines')
          .insert({ ...l, name: l.name.trim(), balance_id: balanceId })
        if (error) throw error
      },
      onSettled: refresh,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...patch }: { id: string } & Partial<Pick<BalanceLine, 'category_id' | 'name' | 'amount' | 'expense_type'>>) => {
        const { error } = await requireClient().from('balance_lines').update(patch).eq('id', id)
        if (error) throw error
      },
      onMutate: ({ id, ...patch }) => optimistic((old) => old.map((l) => (l.id === id ? { ...l, ...patch } : l))),
      onError: rollback,
      onSettled: refresh,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await requireClient().from('balance_lines').delete().eq('id', id)
        if (error) throw error
      },
      onMutate: (id) => optimistic((old) => old.filter((l) => l.id !== id)),
      onError: rollback,
      onSettled: refresh,
    }),
  }
}

export function useSetBalanceStatus(period: string) {
  const qc = useQueryClient()
  const uid = useUid()
  return useMutation({
    mutationFn: async ({ id, closed }: { id: string; closed: boolean }) => {
      const { error } = await requireClient()
        .from('monthly_balances')
        .update({ status: closed ? 'cerrado' : 'borrador', closed_at: closed ? new Date().toISOString() : null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['balance', uid, period] })
      qc.invalidateQueries({ queryKey: ['balances', uid] })
    },
  })
}

export function useDeleteBalance() {
  const qc = useQueryClient()
  const uid = useUid()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await requireClient().from('monthly_balances').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['balances', uid] }),
  })
}
