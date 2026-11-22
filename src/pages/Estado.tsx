import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react'
import { Logo } from '../components/Logo'
import { supabaseEnv } from '../config/env'
import { checkSupabaseHealth } from '../lib/supabase'

/** Página de diagnóstico de la etapa 1: confirma variables y conexión con Supabase. */
export function Estado() {
  const health = useQuery({ queryKey: ['supabase-health'], queryFn: () => checkSupabaseHealth(), retry: false })

  return (
    <div className="min-h-dvh bg-page px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <Link to="/" aria-label="Volver al inicio" className="self-start">
          <Logo />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-extrabold">Estado de la conexión</h1>
          <p className="mt-2 text-ink-2">Comprueba que la app está bien configurada antes de seguir con la siguiente etapa.</p>
        </div>

        <ul className="flex flex-col gap-3">
          <Check
            ok={supabaseEnv.ok}
            title="Variables de Supabase"
            detail={supabaseEnv.ok ? `Proyecto: ${new URL(supabaseEnv.url).hostname}` : supabaseEnv.message}
          />
          <Check
            ok={health.isPending ? null : health.data?.ok === true}
            title="Conexión con Supabase"
            detail={
              health.isPending
                ? 'Comprobando…'
                : health.data?.ok
                  ? `Responde en ${health.data.ms} ms.`
                  : (health.data?.message ?? 'Sin respuesta.')
            }
          />
        </ul>

        <p className="text-sm text-ink-3">
          Versión {import.meta.env.MODE === 'production' ? 'publicada' : 'de desarrollo'} · Etapa 1 de 10
        </p>
      </div>
    </div>
  )
}

function Check({ ok, title, detail }: { ok: boolean | null; title: string; detail: string }) {
  const Icon = ok === null ? Loader2 : ok ? CheckCircle2 : CircleAlert
  const tone = ok === null ? 'text-ink-3' : ok ? 'text-action' : 'text-amarillo-texto'
  const bg = ok === false ? 'bg-amarillo-fondo border-amarillo-suave' : 'bg-surface border-line'
  return (
    <li className={`flex gap-3 rounded-2xl border p-4 ${bg}`}>
      <Icon size={22} aria-hidden="true" className={`mt-0.5 shrink-0 ${tone} ${ok === null ? 'animate-spin' : ''}`} />
      <div className="min-w-0">
        <p className="font-semibold">
          {title}: <span className={tone}>{ok === null ? 'comprobando' : ok ? 'correcto' : 'pendiente'}</span>
        </p>
        <p className="mt-0.5 text-sm break-words text-ink-2">{detail}</p>
      </div>
    </li>
  )
}
