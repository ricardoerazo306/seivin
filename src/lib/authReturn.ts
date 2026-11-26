/**
 * Al volver de Google (o de un enlace del correo), Supabase puede traer un error en la
 * dirección (#error_description=... o ?error_description=...). Se guarda un mensaje claro
 * para mostrarlo en "Entrar" y se limpia la dirección.
 */
const KEY = 'seivin:error-entrada'
const METHOD_KEY = 'seivin:metodo'

export function captureAuthReturnError(): void {
  if (typeof window === 'undefined') return
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const query = new URLSearchParams(window.location.search)
  const code = hash.get('error_code') ?? query.get('error_code')
  const description = hash.get('error_description') ?? query.get('error_description')
  const error = hash.get('error') ?? query.get('error')
  if (!error && !description) return
  try {
    sessionStorage.setItem(KEY, friendly(code, description ?? error ?? ''))
  } catch {
    /* sin almacenamiento: se omite el mensaje */
  }
  window.history.replaceState(null, '', window.location.pathname)
}

function friendly(code: string | null, description: string): string {
  const d = description.toLowerCase()
  if (code === 'otp_expired' || d.includes('expired')) return 'El enlace ya venció o ya se usó. Pide uno nuevo.'
  if (d.includes('access_denied') || d.includes('cancel')) return 'Cancelaste el inicio con Google. Puedes intentarlo de nuevo cuando quieras.'
  if (d.includes('oauth') || d.includes('provider')) return 'No pudimos entrar con Google en este momento. Intenta de nuevo o usa tu correo.'
  return 'No pudimos completar el inicio de sesión. Intenta de nuevo.'
}

/** Devuelve y borra el mensaje guardado (se muestra una sola vez). */
export function takeAuthReturnError(): string | null {
  try {
    const v = sessionStorage.getItem(KEY)
    if (v) sessionStorage.removeItem(KEY)
    return v
  } catch {
    return null
  }
}

export function rememberMethod(method: 'google' | 'correo') {
  try {
    localStorage.setItem(METHOD_KEY, method)
  } catch {
    /* ignorar */
  }
}

export function lastMethod(): 'google' | 'correo' | null {
  try {
    const v = localStorage.getItem(METHOD_KEY)
    return v === 'google' || v === 'correo' ? v : null
  } catch {
    return null
  }
}
