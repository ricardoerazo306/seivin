import { BRAND } from '../config/brand'

/** Símbolo provisional: una trayectoria que sube, sin monedas ni alcancías. */
export function LogoMark({ size = 34, tone = 'dark' }: { size?: number; tone?: 'dark' | 'light' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="10" fill={tone === 'dark' ? '#142C36' : '#285B4A'} />
      <path d="M8 24c5 0 6-9 11-9s5-5 8-6" fill="none" stroke="#A8DCC5" strokeWidth="3" strokeLinecap="round" />
      <circle cx="27" cy="9" r="2.4" fill="#F2F0E8" />
    </svg>
  )
}

export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark tone={tone} />
      <span className={`font-display text-xl font-extrabold ${tone === 'light' ? 'text-blanco-calido' : 'text-ink'}`}>
        {BRAND.name}
      </span>
    </span>
  )
}
