/**
 * Datos de marca en un solo lugar. "Seivin" es el nombre de trabajo
 * mientras se valida el definitivo: cambiarlo aquí lo cambia en toda la app.
 */
export const BRAND = {
  name: 'Seivin',
  slogan: 'Una mejor relación con tu dinero comienza aquí.',
  welcome:
    'No importa cuánto tengas hoy. Vamos a entender tu dinero y encontrar un primer paso que tenga sentido para ti.',
  disclaimer: 'Seivin te ayuda a organizarte y aprender. No es un banco ni un asesor financiero.',
} as const

/** Configuración regional inicial (Colombia). Preparada para otros países. */
export const LOCALE = {
  country: 'CO',
  language: 'es-CO',
  currency: 'COP',
} as const
