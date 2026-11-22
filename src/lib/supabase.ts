import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseEnv } from '../config/env'

/**
 * Cliente único de Supabase para el navegador. Es null si faltan las variables,
 * así la app puede mostrar un aviso claro en lugar de fallar.
 */
export const supabase: SupabaseClient | null = supabaseEnv.ok
  ? createClient(supabaseEnv.url, supabaseEnv.key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

export type HealthResult = { ok: true; ms: number } | { ok: false; message: string }

/** Comprueba que el servicio de autenticación de Supabase responde. */
export async function checkSupabaseHealth(fetchImpl: typeof fetch = fetch): Promise<HealthResult> {
  if (!supabaseEnv.ok) return { ok: false, message: 'Se comprueba cuando las variables estén completas.' }
  const started = performance.now()
  try {
    const res = await fetchImpl(`${supabaseEnv.url}/auth/v1/health`, {
      headers: { apikey: supabaseEnv.key },
    })
    if (!res.ok) return { ok: false, message: `Supabase respondió con el código ${res.status}.` }
    return { ok: true, ms: Math.round(performance.now() - started) }
  } catch {
    return { ok: false, message: 'No se pudo contactar a Supabase. Revisa la dirección y tu conexión.' }
  }
}
