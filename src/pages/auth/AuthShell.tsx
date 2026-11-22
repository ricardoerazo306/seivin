import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Logo } from '../../components/Logo'
import { BRAND } from '../../config/brand'

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-page px-5 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-7">
        <Link to="/" aria-label="Volver a la página principal" className="self-start">
          <Logo />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-2">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="text-center text-sm text-ink-2">{footer}</div>}
        <p className="mt-auto pt-6 text-center text-xs text-ink-3">{BRAND.disclaimer}</p>
      </div>
    </div>
  )
}
