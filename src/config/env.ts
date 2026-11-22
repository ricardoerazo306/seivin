/**
 * Lee y valida las variables de entorno públicas de Supabase.
 * Rechaza explícitamente las claves secretas para que nunca terminen en el navegador.
 */
export type EnvStatus =
  | { ok: true; url: string; key: string }
  | { ok: false; reason: 'missing' | 'invalid-url' | 'secret-key' | 'invalid-key'; message: string }

export function readSupabaseEnv(raw: { url?: string; key?: string }): EnvStatus {
  const url = raw.url?.trim() ?? ''
  const key = raw.key?.trim() ?? ''

  if (!url || !key) {
    return {
      ok: false,
      reason: 'missing',
      message: 'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY. Copia .env.example como .env.local y complétalo.',
    }
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { ok: false, reason: 'invalid-url', message: 'VITE_SUPABASE_URL no es una dirección válida.' }
  }
  const isHosted = parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co')
  const isLocal = parsed.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(parsed.hostname)
  if (!isHosted && !isLocal) {
    return {
      ok: false,
      reason: 'invalid-url',
      message: 'VITE_SUPABASE_URL debe ser https://<proyecto>.supabase.co (o la dirección local de Supabase).',
    }
  }

  if (key.startsWith('sb_secret_') || looksLikeServiceRole(key)) {
    return {
      ok: false,
      reason: 'secret-key',
      message: 'Esa es una clave SECRETA. Nunca debe ir en el navegador: usa la clave publishable (sb_publishable_...).',
    }
  }
  if (!key.startsWith('sb_publishable_') && !key.startsWith('eyJ')) {
    return { ok: false, reason: 'invalid-key', message: 'La clave no parece una clave publishable de Supabase.' }
  }

  return { ok: true, url: url.replace(/\/+$/, ''), key }
}

/** Las claves antiguas son JWT; la de servicio lleva role "service_role". */
function looksLikeServiceRole(key: string): boolean {
  if (!key.startsWith('eyJ')) return false
  const payload = key.split('.')[1]
  if (!payload) return false
  try {
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return json?.role === 'service_role'
  } catch {
    return false
  }
}

export const supabaseEnv = readSupabaseEnv({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
})
