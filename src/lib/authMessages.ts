/** Validación de formularios de cuenta y traducción de errores de Supabase Auth. */

export const PASSWORD_MIN = 8

export function validateEmail(email: string): string | null {
  const v = email.trim()
  if (!v) return 'Escribe tu correo.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ese correo no parece válido. Revisa que tenga @ y un dominio.'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Escribe una contraseña.'
  if (password.length < PASSWORD_MIN) return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`
  if (!/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(password) || !/\d/.test(password))
    return 'Usa letras y números para que sea más segura.'
  return null
}

export function validateName(name: string): string | null {
  const v = name.trim()
  if (!v) return 'Escribe cómo quieres que te llamemos.'
  if (v.length > 80) return 'Usa máximo 80 caracteres.'
  return null
}

type AuthErrorLike = { code?: string; message?: string; status?: number } | null | undefined

/** Mensajes claros y sin culpa para los errores más comunes. */
export function authErrorMessage(error: AuthErrorLike): string {
  const code = error?.code ?? ''
  const msg = (error?.message ?? '').toLowerCase()
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials'))
    return 'El correo o la contraseña no coinciden. Revisa e intenta de nuevo.'
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed'))
    return 'Aún no confirmas tu correo. Busca el mensaje de confirmación en tu bandeja (y en spam).'
  if (code === 'user_already_exists' || msg.includes('already registered'))
    return 'Ya existe una cuenta con ese correo. Prueba entrar o recuperar tu contraseña.'
  if (code === 'weak_password') return 'Esa contraseña es muy fácil de adivinar. Prueba una más larga, con letras y números.'
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || error?.status === 429)
    return 'Hicimos demasiados envíos en poco tiempo. Espera unos minutos e intenta de nuevo.'
  if (code === 'email_address_not_authorized')
    return 'Por ahora no podemos enviar correos a esa dirección. Estamos terminando de configurar el envío; intenta más tarde.'
  if (code === 'same_password') return 'La nueva contraseña debe ser distinta de la anterior.'
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'No hay conexión. Revisa tu internet e intenta de nuevo.'
  return 'Algo no salió bien. Intenta de nuevo en un momento.'
}
