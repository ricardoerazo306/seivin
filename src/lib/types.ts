/** Tipos de las tablas que usa la app (subconjunto del esquema de Supabase). */
export type Kind = 'ingreso' | 'gasto'
export type ExperienceMode = 'inicial' | 'intermedio' | 'avanzado'
export type Theme = 'light' | 'dark' | 'system'

export type Profile = {
  id: string
  display_name: string | null
  country: string
  currency: string
  locale: string
  theme: Theme
  experience_mode: ExperienceMode
  priority: 'organizar' | 'ahorrar' | 'respaldo' | 'deudas' | null
  income_stability: 'estable' | 'variable' | null
  dependents: number
  capsules_read: string[]
  onboarding_completed: boolean
  plan: string
  created_at: string
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'plan' | 'created_at'>>

export type Category = {
  id: string
  name: string
  kind: Kind
  is_essential: boolean
  is_system: boolean
  archived: boolean
  sort_order: number
}

export type MonthlyBalance = {
  id: string
  period: string
  status: 'borrador' | 'cerrado'
  closed_at: string | null
  note: string | null
}

export type BalanceLine = {
  id: string
  balance_id: string
  kind: Kind
  category_id: string
  name: string
  amount: number
  expense_type: 'fijo' | 'variable' | 'ocasional' | null
  line_date: string | null
  description: string | null
  recurring_item_id: string | null
  source: 'manual' | 'importado'
}

export type RecurringItem = {
  id: string
  kind: Kind
  category_id: string
  name: string
  amount: number
  frequency: 'semanal' | 'quincenal' | 'mensual' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'
  payment_day: number | null
  active: boolean
}

/** Tablas que se incluyen al exportar los datos personales. */
export const EXPORT_TABLES = [
  'profiles',
  'categories',
  'monthly_balances',
  'balance_lines',
  'recurring_items',
  'goals',
  'goal_movements',
  'emergency_funds',
  'emergency_movements',
  'budgets',
  'outing_habits',
  'reports',
  'feedback',
] as const
