import { useRowMutations, useRows } from '../../lib/data'

export type Goal = {
  id: string
  name: string
  reason: string | null
  target_amount: number
  initial_saved: number
  deadline: string | null
  flexible_date: boolean
  priority: 'alta' | 'media' | 'baja'
  planned_monthly: number | null
  status: 'activa' | 'cumplida' | 'archivada'
  created_at: string
}

export type GoalMovement = {
  id: string
  goal_id: string
  kind: 'aporte' | 'retiro'
  amount: number
  movement_date: string
  note: string | null
}

export type EmergencyFund = {
  id: string
  essential_monthly_override: number | null
  target_months: number
  initial_saved: number
  planned_monthly: number | null
  has_major_debts: boolean
}

export type EmergencyMovement = {
  id: string
  kind: 'aporte' | 'retiro'
  amount: number
  movement_date: string
  reason: string | null
  note: string | null
}

export const useGoals = () => useRows<Goal>('goals', { order: [{ column: 'created_at' }] })
export const useGoalMovements = () => useRows<GoalMovement>('goal_movements', { order: [{ column: 'movement_date', ascending: false }, { column: 'created_at', ascending: false }] })
export const useGoalMutations = () => useRowMutations<Goal>('goals', ['goal_movements'])
export const useGoalMovementMutations = () => useRowMutations<GoalMovement>('goal_movements')

export const useFund = () => useRows<EmergencyFund>('emergency_funds')
export const useFundMutations = () => useRowMutations<EmergencyFund>('emergency_funds')
export const useFundMovements = () => useRows<EmergencyMovement>('emergency_movements', { order: [{ column: 'movement_date', ascending: false }, { column: 'created_at', ascending: false }] })
export const useFundMovementMutations = () => useRowMutations<EmergencyMovement>('emergency_movements')
