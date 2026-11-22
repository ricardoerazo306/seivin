import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { NavLink } from 'react-router'

export function Field({
  label,
  hint,
  error,
  ...rest
}: { label: string; hint?: string; error?: string | null } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`h-12 rounded-xl border bg-surface px-3.5 text-base text-ink outline-none transition-colors focus:border-verde-profundo focus:ring-2 focus:ring-verde-profundo/20 ${
          error ? 'border-amarillo-suave' : 'border-line-strong'
        }`}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-amarillo-texto">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function Button({
  variant = 'primary',
  loading,
  children,
  className = '',
  ...rest
}: { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; loading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: 'bg-verde-profundo text-white hover:brightness-110',
    secondary: 'border border-line-strong bg-surface text-ink hover:bg-page',
    ghost: 'text-action hover:bg-menta-suave',
    danger: 'bg-[#8a2f2f] text-white hover:brightness-110',
  }[variant]
  return (
    <button
      type="button"
      disabled={loading || rest.disabled}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'good' | 'warn'; children: ReactNode }) {
  const map = {
    info: { cls: 'bg-menta-suave text-menta-ink', Icon: Info },
    good: { cls: 'bg-menta-suave text-menta-ink', Icon: CheckCircle2 },
    warn: { cls: 'bg-amarillo-fondo text-amarillo-texto', Icon: AlertCircle },
  }[tone]
  return (
    <div role={tone === 'warn' ? 'alert' : 'status'} className={`flex gap-3 rounded-2xl p-4 text-sm leading-relaxed ${map.cls}`}>
      <map.Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  // Los colores por defecto solo se aplican si quien llama no trae los suyos (evita clases que chocan).
  const bg = /(^|\s)bg-/.test(className) ? '' : 'bg-surface'
  const border = /(^|\s)border-(?!\d)/.test(className) ? '' : 'border-line'
  return <section className={`rounded-3xl border p-5 sm:p-6 ${border} ${bg} ${className}`}>{children}</section>
}

export function Select({
  label,
  hideLabel,
  children,
  className = '',
  ...rest
}: { label: string; hideLabel?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-sm font-semibold text-ink'}>
        {label}
      </label>
      <select
        id={id}
        className="h-12 min-w-0 rounded-xl border border-line-strong bg-surface px-3 text-base text-ink outline-none focus:border-verde-profundo focus:ring-2 focus:ring-verde-profundo/20 disabled:opacity-60"
        {...rest}
      >
        {children}
      </select>
    </div>
  )
}

/** Campo de pesos: muestra separadores de miles mientras se escribe y entrega un número. */
export function MoneyInput({
  label,
  hideLabel,
  value,
  onValue,
  error,
  className = '',
  ...rest
}: {
  label: string
  hideLabel?: boolean
  value: number
  onValue: (n: number) => void
  error?: string | null
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const id = useId()
  const text = value ? new Intl.NumberFormat('es-CO').format(value) : ''
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-sm font-semibold text-ink'}>
        {label}
      </label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3">
          $
        </span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={!!error}
          value={text}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 13)
            onValue(digits ? Number(digits) : 0)
          }}
          className={`h-12 w-full rounded-xl border bg-surface pr-3 pl-7 text-right text-base text-ink tabular-nums outline-none focus:border-verde-profundo focus:ring-2 focus:ring-verde-profundo/20 disabled:opacity-60 ${
            error ? 'border-amarillo-suave' : 'border-line-strong'
          }`}
          {...rest}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-amarillo-texto">
          {error}
        </p>
      )}
    </div>
  )
}

export function Chip({ tone = 'neutral', children }: { tone?: 'neutral' | 'good' | 'warn'; children: ReactNode }) {
  const cls = { neutral: 'bg-page text-ink-2 border border-line', good: 'bg-menta-suave text-menta-ink', warn: 'bg-amarillo-fondo text-amarillo-texto' }[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>
}

export function Progress({ value, label, tone = 'good' }: { value: number; label: string; tone?: 'good' | 'warn' }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="h-2.5 w-full overflow-hidden rounded-full bg-line"
    >
      <div className={`h-full rounded-full ${tone === 'warn' ? 'bg-amarillo-suave' : 'bg-[var(--dv-1)]'}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function PageHeader({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-extrabold">{title}</h1>
        {text && <p className="mt-1 max-w-prose text-ink-2">{text}</p>}
      </div>
      {children}
    </header>
  )
}

export function Tabs({ items }: { items: { to: string; label: string; end?: boolean }[] }) {
  return (
    <nav aria-label="Secciones" className="-mx-1 flex gap-1 overflow-x-auto">
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.end}
          className={({ isActive }) =>
            `shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${isActive ? 'bg-petroleo text-blanco-calido' : 'text-ink-2 hover:bg-surface'}`
          }
        >
          {i.label}
        </NavLink>
      ))}
    </nav>
  )
}
