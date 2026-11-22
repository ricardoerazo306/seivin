import { useState, type FormEvent } from 'react'
import { useLocation } from 'react-router'
import { MessageCircle, X } from 'lucide-react'
import { requireClient, useAuth } from '../lib/auth'
import { Button, Notice } from './ui'

/** Botón y panel para dejar comentarios desde cualquier pantalla (se guardan en la tabla feedback). */
export function Feedback({ variant }: { variant: 'sidebar' | 'icon' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {variant === 'sidebar' ? (
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#D5DEDA] hover:bg-white/5 hover:text-white">
          <MessageCircle size={20} aria-hidden="true" /> Comentarios
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} aria-label="Enviar comentarios" className="flex size-11 items-center justify-center rounded-xl text-ink-2 hover:bg-surface">
          <MessageCircle size={22} aria-hidden="true" />
        </button>
      )}
      {open && <Panel onClose={() => setOpen(false)} />}
    </>
  )
}

function Panel({ onClose }: { onClose: () => void }) {
  const auth = useAuth()
  const location = useLocation()
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const demo = auth.status === 'signed-in' && auth.demo

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const text = message.trim()
    if (!text) return
    setState('sending')
    const { error } = await requireClient().from('feedback').insert({ screen: location.pathname.slice(0, 80), message: text.slice(0, 2000) })
    setState(error ? 'error' : 'sent')
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-petroleo/40 p-3 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-title"
        className="w-full max-w-md rounded-3xl bg-surface p-5 text-ink shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <div className="flex items-center justify-between">
          <h2 id="fb-title" className="text-lg font-bold">
            Cuéntanos qué piensas
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex size-10 items-center justify-center rounded-xl hover:bg-page">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {state === 'sent' ? (
          <div className="mt-4 flex flex-col gap-4">
            <Notice tone="good">¡Gracias! Leemos cada comentario para mejorar Seivin.</Notice>
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
            <label htmlFor="fb-msg" className="text-sm text-ink-2">
              ¿Algo confuso, algo que falte o algo que te guste? No incluyas datos personales ni bancarios.
            </label>
            <textarea
              id="fb-msg"
              autoFocus
              rows={5}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-xl border border-line-strong bg-surface p-3 text-base text-ink outline-none focus:border-verde-profundo focus:ring-2 focus:ring-verde-profundo/20"
            />
            {demo && <p className="text-sm text-ink-3">En el modo exploración tu comentario no se envía. Crea una cuenta gratis para enviarlo.</p>}
            {state === 'error' && <Notice tone="warn">No se envió. Revisa tu conexión e intenta de nuevo.</Notice>}
            <Button type="submit" loading={state === 'sending'} disabled={!message.trim()}>
              Enviar
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
