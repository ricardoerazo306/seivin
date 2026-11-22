import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import { clearDemo, demoFetch, DEMO_UID, resetDemo } from './backend'

const FLAG = 'seivin:demo'
const EVENT = 'seivin:demo-cambio'

export function isDemo(): boolean {
  try {
    return sessionStorage.getItem(FLAG) === '1'
  } catch {
    return false
  }
}

export function enterDemo() {
  try {
    sessionStorage.setItem(FLAG, '1')
  } catch {
    /* ignorar */
  }
  resetDemo()
  window.dispatchEvent(new Event(EVENT))
}

export function exitDemo() {
  try {
    sessionStorage.removeItem(FLAG)
  } catch {
    /* ignorar */
  }
  clearDemo()
  window.dispatchEvent(new Event(EVENT))
}

export function onDemoChange(fn: () => void) {
  window.addEventListener(EVENT, fn)
  return () => window.removeEventListener(EVENT, fn)
}

let client: SupabaseClient | null = null

/** Cliente de Supabase que nunca sale del navegador: todo lo responde demoFetch. */
export function demoClient(): SupabaseClient {
  client ??= createClient('https://demo.supabase.co', 'sb_publishable_modo_exploracion', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: demoFetch },
  })
  return client
}

export const demoSession = {
  access_token: 'demo',
  refresh_token: 'demo',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 4102444800,
  user: {
    id: DEMO_UID,
    email: 'ana@ejemplo.co',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: { full_name: 'Ana' },
    created_at: '2026-01-01T00:00:00Z',
  },
} as unknown as Session
