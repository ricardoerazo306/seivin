import { Link } from 'react-router'
import { LogoMark } from '../components/Logo'
import { BRAND } from '../config/brand'

export function Landing() {
  return (
    <div className="flex min-h-dvh flex-col bg-page lg:flex-row">
      <section className="relative flex min-h-[calc(5rem+62vw+9.5rem)] flex-col overflow-hidden bg-petroleo px-7 py-7 text-blanco-calido lg:min-h-dvh lg:w-1/2 lg:px-14 lg:py-12">
        <div className="relative flex items-center gap-2.5">
          <LogoMark tone="light" />
          <span className="font-display text-[22px] font-extrabold">{BRAND.name}</span>
        </div>
        <svg viewBox="0 0 420 190" aria-hidden="true" className="absolute top-20 -left-5 w-[115%] max-w-[1100px] lg:top-1/3 lg:max-w-[760px]">
          <path d="M0 170 C 90 170, 110 104, 190 104 S 300 46, 420 30" fill="none" stroke="#285B4A" strokeWidth="34" strokeLinecap="round" />
          <path d="M0 170 C 90 170, 110 104, 190 104 S 300 46, 420 30" fill="none" stroke="#A8DCC5" strokeWidth="4" strokeLinecap="round" />
          <circle cx="190" cy="104" r="7" fill="#F2F0E8" />
        </svg>
        <h1 className="font-display relative z-10 mt-auto max-w-xl text-[34px] leading-[1.12] font-extrabold lg:text-5xl">
          {BRAND.slogan}
        </h1>
      </section>

      <section className="flex flex-1 flex-col justify-center gap-6 px-7 py-8 lg:px-16">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <p className="text-base leading-relaxed text-ink-2 lg:text-lg">{BRAND.welcome}</p>
          <div className="flex flex-col gap-3">
            <Link to="/registro" className="flex h-13 items-center justify-center rounded-2xl bg-verde-profundo text-base font-semibold text-white">
              Crear cuenta gratis
            </Link>
            <Link
              to="/entrar"
              className="flex h-12 items-center justify-center rounded-2xl border border-line-strong bg-surface text-base font-semibold text-ink"
            >
              Ya tengo cuenta
            </Link>
          </div>
          <p className="text-center text-xs leading-relaxed text-ink-3">{BRAND.disclaimer}</p>
        </div>
      </section>
    </div>
  )
}
