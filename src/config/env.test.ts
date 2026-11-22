import { describe, expect, it } from 'vitest'
import { readSupabaseEnv } from './env'

const jwt = (payload: object) => `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload))}.firma`

describe('readSupabaseEnv', () => {
  it('acepta una URL de Supabase y una clave publishable', () => {
    const r = readSupabaseEnv({ url: 'https://abc.supabase.co/', key: 'sb_publishable_123' })
    expect(r).toEqual({ ok: true, url: 'https://abc.supabase.co', key: 'sb_publishable_123' })
  })

  it('acepta la clave anon antigua (JWT con rol anon)', () => {
    expect(readSupabaseEnv({ url: 'https://abc.supabase.co', key: jwt({ role: 'anon' }) }).ok).toBe(true)
  })

  it('acepta Supabase local', () => {
    expect(readSupabaseEnv({ url: 'http://127.0.0.1:54321', key: 'sb_publishable_local' }).ok).toBe(true)
  })

  it('pide completar cuando faltan valores', () => {
    const r = readSupabaseEnv({})
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('missing')
  })

  it('rechaza direcciones que no son de Supabase o sin https', () => {
    for (const url of ['https://ejemplo.com', 'http://abc.supabase.co', 'no es url']) {
      const r = readSupabaseEnv({ url, key: 'sb_publishable_1' })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.reason).toBe('invalid-url')
    }
  })

  it('bloquea claves secretas para que nunca lleguen al navegador', () => {
    for (const key of ['sb_secret_abc', jwt({ role: 'service_role' })]) {
      const r = readSupabaseEnv({ url: 'https://abc.supabase.co', key })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.reason).toBe('secret-key')
    }
  })

  it('rechaza claves con formato desconocido', () => {
    const r = readSupabaseEnv({ url: 'https://abc.supabase.co', key: '12345' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-key')
  })
})
