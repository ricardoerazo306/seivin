import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Compass, Plus } from 'lucide-react'
import { Feedback } from '../components/Feedback'
import { exitDemo } from '../demo/mode'
import { useAuth } from '../lib/auth'
import { useProfile } from '../lib/profile'
import { AREAS } from '../app/navigation'
import { Logo } from '../components/Logo'
import { BRAND } from '../config/brand'
import { useThemeFromProfile } from '../lib/profile'

/** Estructura de la app privada: menú lateral en computador y barra inferior en celular. */
export function AppLayout() {
  useThemeFromProfile()
  const auth = useAuth()
  const profile = useProfile()
  const location = useLocation()
  const demo = auth.status === 'signed-in' && !!auth.demo
  if (profile.data && !profile.data.onboarding_completed && location.pathname !== '/app/bienvenida') {
    return <Navigate to="/app/bienvenida" replace />
  }
  const mobile = AREAS.filter((a) => ['inicio', 'organiza', 'construye'].includes(a.id))
  return (
    <div className="flex min-h-dvh flex-wrap bg-page">
      <aside className="hidden w-60 shrink-0 flex-col gap-7 bg-petroleo px-4 py-6 text-blanco-calido lg:flex">
        <div className="px-2">
          <Logo tone="light" />
        </div>
        <nav aria-label="Principal" className="flex flex-col gap-1">
          {AREAS.map((a) => (
            <NavLink
              key={a.id}
              to={a.path}
              end={a.path === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
                  isActive ? 'bg-verde-profundo text-white' : 'text-[#D5DEDA] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <a.icon size={20} aria-hidden="true" className={isActive ? 'text-menta' : ''} />
                  {a.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <Feedback variant="sidebar" />
          <p className="px-2 text-xs leading-relaxed text-[#AFC0BA]">{BRAND.disclaimer}</p>
        </div>
      </aside>

      <main className="min-w-0 flex-[999_1_560px] px-5 pt-6 pb-28 sm:px-8 lg:px-12 lg:pt-10 lg:pb-12">
        <div className="mx-auto max-w-5xl">
          {demo && <DemoBanner />}
          <div className="-mt-2 mb-2 flex justify-end lg:hidden">
            <Feedback variant="icon" />
          </div>
          <Outlet />
        </div>
      </main>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-20 grid h-20 grid-cols-5 items-center border-t border-line bg-surface px-2 pb-2 lg:hidden"
      >
        {mobile.slice(0, 2).map((a) => (
          <MobileItem key={a.id} to={a.path} label={a.label} Icon={a.icon} end={a.path === '/app'} />
        ))}
        <NavLink
          to="/app/organiza"
          aria-label="Abrir el balance del mes"
          className="-mt-5 flex size-14 items-center justify-center justify-self-center rounded-2xl bg-verde-profundo text-white shadow-lg"
        >
          <Plus size={26} aria-hidden="true" />
        </NavLink>
        <MobileItem to={mobile[2]!.path} label={mobile[2]!.label} Icon={mobile[2]!.icon} />
        <MobileItem to="/app/mas" label="Más" Icon={MoreIcon} />
      </nav>
    </div>
  )
}

function DemoBanner() {
  const navigate = useNavigate()
  // Primero sale de la zona privada y luego apaga el modo, para no pasar por "Entrar".
  const leave = (to: string) => {
    navigate(to, { replace: true })
    setTimeout(exitDemo, 0)
  }
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-amarillo-fondo p-4 text-sm text-amarillo-texto">
      <Compass size={20} aria-hidden="true" className="shrink-0" />
      <p className="min-w-48 flex-1">
        <strong>Estás explorando con datos de ejemplo.</strong> Puedes cambiar todo; nada sale de este navegador y se borra al cerrar la pestaña.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => leave('/registro')}
          className="inline-flex h-10 items-center rounded-xl bg-verde-profundo px-4 font-semibold text-white"
        >
          Crear mi cuenta
        </button>
        <button
          type="button"
          onClick={() => leave('/')}
          className="h-10 rounded-xl px-3 font-semibold hover:bg-white/40"
        >
          Salir
        </button>
      </div>
    </div>
  )
}

function MoreIcon(props: { size?: number; className?: string }) {
  return (
    <svg width={props.size ?? 22} height={props.size ?? 22} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={props.className}>
      <path d="M5 12h.01M12 12h.01M19 12h.01" />
    </svg>
  )
}

function MobileItem({
  to,
  label,
  Icon,
  end,
}: {
  to: string
  label: string
  Icon: (p: { size?: number; className?: string }) => React.ReactNode
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-11 flex-col items-center justify-center gap-1 text-[11px] ${isActive ? 'font-bold text-ink' : 'font-medium text-ink-3'}`
      }
    >
      <Icon size={22} />
      {label}
    </NavLink>
  )
}
