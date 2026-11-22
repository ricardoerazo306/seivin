import { describe, expect, it } from 'vitest'
import { authErrorMessage, validateEmail, validateName, validatePassword } from './authMessages'

describe('validación de cuenta', () => {
  it('valida correos', () => {
    expect(validateEmail('')).toMatch(/Escribe/)
    expect(validateEmail('ana@')).toMatch(/no parece válido/)
    expect(validateEmail(' ana@correo.co ')).toBeNull()
  })
  it('exige contraseñas de 8+ caracteres con letras y números', () => {
    expect(validatePassword('abc1')).toMatch(/al menos 8/)
    expect(validatePassword('abcdefgh')).toMatch(/letras y números/)
    expect(validatePassword('12345678')).toMatch(/letras y números/)
    expect(validatePassword('ahorro2026')).toBeNull()
  })
  it('valida el nombre', () => {
    expect(validateName('  ')).toMatch(/Escribe/)
    expect(validateName('a'.repeat(81))).toMatch(/80/)
    expect(validateName('Ana')).toBeNull()
  })
})

describe('mensajes de error', () => {
  it('traduce los códigos de Supabase a mensajes claros', () => {
    expect(authErrorMessage({ code: 'invalid_credentials' })).toMatch(/no coinciden/)
    expect(authErrorMessage({ code: 'email_not_confirmed' })).toMatch(/confirmas tu correo/)
    expect(authErrorMessage({ code: 'user_already_exists' })).toMatch(/Ya existe/)
    expect(authErrorMessage({ status: 429 })).toMatch(/Espera unos minutos/)
    expect(authErrorMessage({ code: 'email_address_not_authorized' })).toMatch(/configurar el envío/)
    expect(authErrorMessage({ message: 'Failed to fetch' })).toMatch(/conexión/)
    expect(authErrorMessage({ code: 'otro' })).toMatch(/Algo no salió bien/)
  })
})
