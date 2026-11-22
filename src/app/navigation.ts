import { BarChart3, BookOpen, Home, Sprout, UserRound, Wallet, type LucideIcon } from 'lucide-react'

/** Las 6 áreas del brandbook. `stage` = etapa del plan en que se construye. */
export type Area = {
  id: string
  label: string
  path: string
  icon: LucideIcon
  description: string
  stage: number
}

export const AREAS: Area[] = [
  { id: 'inicio', label: 'Inicio', path: '/app', icon: Home, description: 'Resumen de tu situación y próximos pasos.', stage: 5 },
  { id: 'organiza', label: 'Organiza', path: '/app/organiza', icon: Wallet, description: 'Balance mensual, categorías, presupuestos y simulador de salidas.', stage: 4 },
  { id: 'construye', label: 'Construye', path: '/app/construye', icon: Sprout, description: 'Metas de ahorro, respaldo para imprevistos y escenarios.', stage: 6 },
  { id: 'entiende', label: 'Entiende', path: '/app/entiende', icon: BarChart3, description: 'Estadísticas y reportes descargables.', stage: 9 },
  { id: 'aprende', label: 'Aprende', path: '/app/aprende', icon: BookOpen, description: 'Cápsulas cortas y glosario.', stage: 10 },
  { id: 'cuenta', label: 'Cuenta', path: '/app/cuenta', icon: UserRound, description: 'Perfil, preferencias, seguridad y tus datos.', stage: 3 },
]
