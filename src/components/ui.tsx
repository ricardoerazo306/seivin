import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'

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
    ghost: 'text-verde-profundo hover:bg-menta-suave',
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
    info: { cls: 'bg-menta-suave text-[#1e3d33]', Icon: Info },
    good: { cls: 'bg-menta-suave text-[#1e3d33]', Icon: CheckCircle2 },
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
  return <section className={`rounded-3xl border border-line bg-surface p-5 sm:p-6 ${className}`}>{children}</section>
}
