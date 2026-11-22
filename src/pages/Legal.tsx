import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Logo } from '../components/Logo'
import { BRAND } from '../config/brand'

function Shell({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-page px-5 py-8 text-ink sm:px-8">
      <article className="mx-auto flex max-w-2xl flex-col gap-4 leading-relaxed">
        <Link to="/" aria-label="Volver al inicio" className="w-fit">
          <Logo />
        </Link>
        <h1 className="mt-4 font-display text-3xl font-extrabold">{title}</h1>
        <p className="text-sm text-ink-3">Última actualización: {updated}</p>
        {children}
        <p className="mt-6 text-sm text-ink-3">{BRAND.disclaimer}</p>
      </article>
    </div>
  )
}

const H = ({ children }: { children: ReactNode }) => <h2 className="mt-4 text-lg font-bold">{children}</h2>

export function Privacidad() {
  return (
    <Shell title="Privacidad y tratamiento de datos" updated="22 de noviembre de 2026">
      <p>
        Seivin es una herramienta gratuita para organizar tus finanzas personales y aprender. Esta política explica qué datos guardamos, para qué y qué control tienes. Se basa en la Ley 1581 de 2012 de Colombia sobre protección de datos personales.
      </p>
      <H>Qué datos guardamos</H>
      <ul className="list-disc pl-6">
        <li>Tu correo y tu nombre, para crear y proteger tu cuenta.</li>
        <li>Lo que tú registras: balances mensuales, categorías, metas, respaldo, presupuestos, hábitos de salidas y comentarios.</li>
        <li>Preferencias como tema, modo de experiencia y cápsulas leídas.</li>
      </ul>
      <H>Qué no pedimos nunca</H>
      <p>No pedimos contraseñas de bancos, números de tarjeta ni de cuenta, ni documentos de identidad. Seivin no se conecta a tus bancos ni mueve dinero.</p>
      <H>Para qué los usamos</H>
      <p>Solo para mostrarte tu información, hacer los cálculos (balances, metas, respaldo, estadísticas) y mejorar la herramienta con tus comentarios. No vendemos ni compartimos tus datos con terceros para publicidad.</p>
      <H>Dónde se guardan y cómo se protegen</H>
      <p>
        Los datos se guardan en Supabase (base de datos PostgreSQL) y la aplicación se sirve desde Cloudflare. Toda la comunicación va cifrada (HTTPS). Cada fila de la base está protegida con reglas que impiden que otra cuenta la lea o la modifique. Las contraseñas las gestiona el servicio de autenticación y nunca se guardan en texto plano.
      </p>
      <H>Tus derechos</H>
      <p>
        Puedes conocer, actualizar y rectificar tus datos desde la app; descargar una copia completa desde Cuenta → Tus datos; y eliminar tu cuenta y todos tus datos en cualquier momento desde Cuenta → Eliminar tu cuenta. La eliminación es inmediata y definitiva.
      </p>
      <H>Modo exploración</H>
      <p>Si exploras sin cuenta, los datos de ejemplo y tus cambios viven solo en tu navegador y se borran al cerrar la pestaña.</p>
      <H>Contacto</H>
      <p>Para preguntas sobre tus datos, usa el botón Comentarios dentro de la app.</p>
    </Shell>
  )
}

export function Terminos() {
  return (
    <Shell title="Términos de uso" updated="22 de noviembre de 2026">
      <p>Al usar Seivin aceptas estos términos. Son cortos a propósito.</p>
      <H>Qué es Seivin</H>
      <p>Una herramienta gratuita y educativa para organizar tus finanzas. No es un banco, no maneja dinero y no da asesoría financiera, legal ni tributaria personalizada.</p>
      <H>Tu responsabilidad</H>
      <p>Los cálculos dependen de los datos que registras. Úsalos como guía para tomar tus propias decisiones. Para decisiones importantes, consulta a un profesional.</p>
      <H>Tu cuenta</H>
      <p>Mantén tu contraseña segura. Puedes dejar de usar Seivin y eliminar tu cuenta cuando quieras.</p>
      <H>Disponibilidad</H>
      <p>Seivin está en desarrollo y se ofrece tal como está. Haremos lo posible por mantenerlo disponible y avisar los cambios importantes.</p>
      <H>Cambios</H>
      <p>Si cambiamos estos términos, actualizaremos la fecha de arriba.</p>
    </Shell>
  )
}
