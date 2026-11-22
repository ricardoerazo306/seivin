/**
 * Funciones que dependen de configuración externa. Se activan cuando esa
 * configuración esté lista, sin tocar el resto del código.
 */
export const FEATURES = {
  /** Requiere crear credenciales OAuth en Google Cloud y activarlas en Supabase. */
  googleSignIn: false,
} as const
