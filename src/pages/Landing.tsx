import { Link } from 'react-router'
import { BookOpen, Check, ChevronDown, LineChart, ListChecks, Lock, ShieldCheck, Sprout, Trash2, Wallet } from 'lucide-react'
import { LogoMark } from '../components/Logo'
import { BRAND } from '../config/brand'

const STEPS = [
  {
    title: 'Haz el balance del mes',
    text: 'Cuánto entró, cuánto salió y en qué grandes grupos. Sin anotar cada compra: toma unos cinco minutos.',
  },
  {
    title: 'Compara con el mes anterior',
    text: 'Seivin copia tu último balance para que solo cambies lo distinto y te muestra qué movió lo que te quedó.',
  },
  {
    title: 'Construye con lo que aprendes',
    text: 'Ponle nombre y fecha a tus metas, arma un respaldo para imprevistos y mira tu avance mes a mes.',
  },
]

const AREAS = [
  { icon: Wallet, title: 'Organiza', text: 'Balance mensual, categorías, presupuestos y un simulador de salidas.' },
  { icon: Sprout, title: 'Construye', text: 'Metas con plan mensual y un respaldo calculado con tus gastos esenciales.' },
  { icon: LineChart, title: 'Entiende', text: 'Tendencias, gastos por categoría y reportes en PNG o PDF.' },
  { icon: BookOpen, title: 'Aprende', text: 'Cápsulas de dos minutos y un glosario, sin tecnicismos.' },
]

const FAQ = [
  {
    q: '¿Cuánto cuesta?',
    a: 'Nada. Seivin es gratis y no pide tarjeta. Nuestro objetivo ahora es que más personas tengan una mejor relación con su dinero.',
  },
  {
    q: '¿Tengo que conectar mi banco?',
    a: 'No. Tú escribes los montos del mes. Nunca pedimos claves de bancos, números de tarjeta ni documentos.',
  },
  {
    q: '¿Quién puede ver mis datos?',
    a: 'Solo tú. Cada registro está protegido para que ninguna otra cuenta pueda leerlo, y la conexión siempre va cifrada.',
  },
  {
    q: '¿Puedo irme cuando quiera?',
    a: 'Sí. Desde tu cuenta descargas una copia de todo y eliminas tu cuenta con todos tus datos en un paso.',
  },
  {
    q: '¿Necesito saber de finanzas?',
    a: 'No. Al empezar eliges si estás comenzando o ya llevas cuentas, y Seivin ajusta cuánto te explica.',
  },
]

export function Landing() {
  return (
    <div className="min-h-dvh bg-page text-ink">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 text-blanco-calido">
            <LogoMark tone="light" />
            <span className="font-display text-[22px] font-extrabold">{BRAND.name}</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/entrar" className="flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-blanco-calido hover:bg-white/10">
              Entrar
            </Link>
            <Link to="/registro" className="hidden h-10 items-center rounded-xl bg-menta px-4 text-sm font-semibold text-petroleo sm:flex">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-petroleo text-blanco-calido">
        <svg viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 w-full lg:h-56">
          <path d="M-20 205 C 300 205, 430 130, 700 120 S 1010 45, 1240 25" fill="none" stroke="#285B4A" strokeWidth="44" strokeLinecap="round" />
          <path d="M-20 205 C 300 205, 430 130, 700 120 S 1010 45, 1240 25" fill="none" stroke="#A8DCC5" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pt-28 pb-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-36 lg:pb-28">
          <div>
            <h1 className="font-display text-[40px] leading-[1.06] font-extrabold sm:text-6xl">{BRAND.slogan}</h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#C9D6D1]">
              Seivin te ayuda a ver, mes a mes, cuánto entra, cuánto sale y cuánto te queda. Sin culpas, sin tecnicismos y gratis.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/registro" className="flex h-13 items-center justify-center rounded-2xl bg-menta px-6 text-base font-bold text-petroleo">
                Crear cuenta gratis
              </Link>
              <Link
                to="/explorar"
                className="flex h-13 items-center justify-center rounded-2xl border border-white/25 px-6 text-base font-semibold text-blanco-calido hover:bg-white/10"
              >
                Explorar con datos de ejemplo
              </Link>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#C9D6D1]">
              {['Gratis, sin tarjeta', 'No conectas tu banco', 'Borras tus datos cuando quieras'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check size={16} aria-hidden="true" className="text-menta" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <Preview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8" aria-labelledby="como">
        <h2 id="como" className="font-display text-3xl font-extrabold sm:text-4xl">
          Así funciona
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t-2 border-verde-profundo pt-5">
              <span className="font-display text-sm font-extrabold text-action">Paso {i + 1}</span>
              <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-surface" aria-labelledby="todo">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="todo" className="font-display text-3xl font-extrabold sm:text-4xl">
              Todo lo que necesitas, nada que sobre
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-2">
              Cuatro áreas pensadas para ir de entender tu mes a construir tu tranquilidad, en celular o computador.
            </p>
          </div>
          <ul className="divide-y divide-line">
            {AREAS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-menta-suave text-action">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-lg font-bold">{title}</span>
                  <span className="mt-0.5 block text-ink-2">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8" aria-labelledby="datos">
        <div className="grid gap-10 rounded-[2rem] bg-petroleo p-8 text-blanco-calido sm:p-12 lg:grid-cols-[1fr_1.3fr]">
          <h2 id="datos" className="font-display text-3xl font-extrabold sm:text-4xl">
            Tus datos son tuyos
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Lock, title: 'Solo tú los ves', text: 'Cada registro está protegido por cuenta y la conexión va cifrada.' },
              { icon: ShieldCheck, title: 'Nada de claves', text: 'No pedimos claves de bancos, tarjetas ni documentos.' },
              { icon: Trash2, title: 'Te vas cuando quieras', text: 'Descarga todo o elimina tu cuenta en un paso.' },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon size={22} aria-hidden="true" className="text-menta" />
                <p className="mt-3 font-bold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#C9D6D1]">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20 sm:px-8" aria-labelledby="preguntas">
        <h2 id="preguntas" className="font-display text-3xl font-extrabold sm:text-4xl">
          Preguntas frecuentes
        </h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <ChevronDown size={20} aria-hidden="true" className="shrink-0 text-ink-3 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 leading-relaxed text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-verde-profundo text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-extrabold">Empieza con el balance de este mes</h2>
            <p className="mt-2 text-[#D9EDE3]">Cinco minutos hoy, más claridad cada mes.</p>
          </div>
          <Link to="/registro" className="flex h-13 shrink-0 items-center rounded-2xl bg-blanco-calido px-6 font-bold text-petroleo">
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-ink-3 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-md">{BRAND.disclaimer}</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/privacidad" className="hover:text-ink">
            Privacidad
          </Link>
          <Link to="/terminos" className="hover:text-ink">
            Términos
          </Link>
          <Link to="/explorar" className="hover:text-ink">
            Explorar
          </Link>
          <Link to="/entrar" className="hover:text-ink">
            Entrar
          </Link>
        </nav>
      </footer>
    </div>
  )
}

/** Vista previa del producto con datos de ejemplo (no es una captura: se ajusta a cualquier pantalla). */
function Preview() {
  const bars = [450, 520, 480, 610, 575, 675]
  const max = Math.max(...bars)
  const months = ['may', 'jun', 'jul', 'ago', 'sep', 'oct']
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:mr-0">
      <div className="rounded-[1.75rem] bg-surface p-5 text-ink shadow-2xl ring-1 ring-black/5 sm:p-6">
        <p className="text-sm text-ink-2">En octubre te quedaron</p>
        <p className="mt-1 font-display text-4xl font-extrabold tabular-nums">$675.000</p>
        <p className="mt-1 text-sm font-semibold text-action">+$100.000 frente a septiembre</p>
        <div className="mt-5 flex h-28 items-end gap-2.5">
          {bars.map((b, i) => (
            <div key={months[i]} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="w-full max-w-7 rounded-t-md" style={{ height: `${(b / max) * 92}px`, background: i === bars.length - 1 ? 'var(--dv-1)' : 'var(--line-strong)' }} />
              <span className="text-[11px] text-ink-3">{months[i]}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <ListChecks size={16} className="text-action" /> Qué cambió
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="flex justify-between gap-3">
              <span className="text-ink-2">Trabajos adicionales: entró más</span>
              <span className="font-semibold tabular-nums">+$150.000</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-ink-2">Salidas: gastaste más</span>
              <span className="font-semibold tabular-nums">−$80.000</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="absolute -top-7 -right-3 hidden rounded-2xl bg-surface px-4 py-3 text-ink shadow-xl ring-1 ring-black/5 sm:block">
        <p className="text-xs text-ink-3">Viaje a Cartagena</p>
        <div className="mt-1.5 h-2 w-40 rounded-full bg-line">
          <div className="h-full w-[48%] rounded-full" style={{ background: 'var(--dv-1)' }} />
        </div>
        <p className="mt-1 text-xs font-semibold">48 % de $2.400.000</p>
      </div>
    </div>
  )
}
