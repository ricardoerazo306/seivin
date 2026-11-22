/** Formato de dinero y fechas en español de Colombia (preparado para otras monedas). */
const nf = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

export function money(n: number): string {
  const v = Math.round(Number.isFinite(n) ? n : 0)
  return `${v < 0 ? '−' : ''}$${nf.format(Math.abs(v))}`
}

/** "+$95.000" / "−$70.000" / "$0" */
export function signedMoney(n: number): string {
  const v = Math.round(n)
  if (v === 0) return '$0'
  return `${v > 0 ? '+' : '−'}$${nf.format(Math.abs(v))}`
}

export function numberText(n: number): string {
  return n ? nf.format(Math.round(n)) : ''
}

/** Lee lo que la persona escribe ("1.500.000", "1500000", "$ 1 500 000"). */
export function parseMoney(text: string): number {
  const digits = String(text).replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

export function percent(n: number, digits = 1): string {
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: digits }).format(n)} %`
}
