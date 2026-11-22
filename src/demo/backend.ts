/**
 * Modo exploración: imita la API de Supabase (PostgREST) en memoria del navegador.
 * Permite probar toda la app sin cuenta. Nada sale del navegador; los datos viven
 * en sessionStorage y desaparecen al cerrar la pestaña.
 */
type Row = Record<string, unknown>
type DB = Record<string, Row[]>

export const DEMO_UID = '00000000-0000-4000-8000-00000000d3e0'
const KEY = 'seivin:demo-datos'

const uuid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))

let seq = 0
const stamp = () => new Date(Date.now() + seq++).toISOString()

function monthOffset(n: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

const CATEGORY_SEED: [string, 'ingreso' | 'gasto', boolean][] = [
  ['Salario', 'ingreso', false], ['Negocios', 'ingreso', false], ['Trabajos adicionales', 'ingreso', false], ['Otros ingresos', 'ingreso', false],
  ['Vivienda', 'gasto', true], ['Alimentación', 'gasto', true], ['Transporte', 'gasto', true], ['Servicios', 'gasto', true],
  ['Educación', 'gasto', true], ['Salud', 'gasto', true], ['Deudas', 'gasto', true], ['Compras', 'gasto', false],
  ['Entretenimiento', 'gasto', false], ['Salidas', 'gasto', false], ['Suscripciones', 'gasto', false], ['Otros', 'gasto', false],
]

function base() {
  return { id: uuid(), user_id: DEMO_UID, created_at: stamp(), updated_at: stamp() }
}

export function seed(): DB {
  const categories = CATEGORY_SEED.map(([name, kind, is_essential], i) => ({
    ...base(), name, kind, is_essential, is_system: true, archived: false, sort_order: i, icon: null, color: null,
  }))
  const cat = (n: string) => categories.find((c) => c.name === n)!.id
  const monthly_balances: Row[] = []
  const balance_lines: Row[] = []
  const months: [number, Record<string, number>][] = [
    [-3, { Salario: 2800000, Diseño: 0, Arriendo: 950000, Mercado: 610000, Transporte: 160000, Servicios: 205000, Salidas: 360000, Ropa: 120000, Streaming: 45000 }],
    [-2, { Salario: 2800000, Diseño: 250000, Arriendo: 950000, Mercado: 580000, Transporte: 160000, Servicios: 210000, Salidas: 300000, Ropa: 230000, Streaming: 45000 }],
    [-1, { Salario: 2800000, Diseño: 400000, Arriendo: 950000, Mercado: 620000, Transporte: 160000, Servicios: 210000, Salidas: 380000, Ropa: 160000, Streaming: 45000 }],
  ]
  const meta: Record<string, [string, string, 'ingreso' | 'gasto', string | null]> = {
    Salario: ['Salario', 'Salario', 'ingreso', null],
    Diseño: ['Trabajos adicionales', 'Diseño freelance', 'ingreso', null],
    Arriendo: ['Vivienda', 'Arriendo', 'gasto', 'fijo'],
    Mercado: ['Alimentación', 'Mercado', 'gasto', 'variable'],
    Transporte: ['Transporte', 'Transmilenio', 'gasto', 'fijo'],
    Servicios: ['Servicios', 'Luz, agua e internet', 'gasto', 'fijo'],
    Salidas: ['Salidas', 'Salidas con amigos', 'gasto', 'variable'],
    Ropa: ['Compras', 'Ropa', 'gasto', 'ocasional'],
    Streaming: ['Suscripciones', 'Streaming', 'gasto', 'fijo'],
  }
  for (const [off, values] of months) {
    const b = { ...base(), period: monthOffset(off), status: 'cerrado', closed_at: stamp(), note: null }
    monthly_balances.push(b)
    for (const [k, amount] of Object.entries(values)) {
      if (!amount) continue
      const [c, name, kind, expense_type] = meta[k]!
      balance_lines.push({
        ...base(), balance_id: b.id, kind, category_id: cat(c), name, amount, expense_type,
        line_date: null, description: null, recurring_item_id: null, source: 'manual',
      })
    }
  }
  const goals = [
    { ...base(), name: 'Viaje a Cartagena', reason: 'Vacaciones de mitad de año con mi hermana', target_amount: 2400000, initial_saved: 600000, deadline: monthOffset(7), flexible_date: false, priority: 'alta', planned_monthly: 250000, status: 'activa' },
    { ...base(), name: 'Portátil nuevo', reason: 'Para los trabajos de diseño', target_amount: 3200000, initial_saved: 0, deadline: null, flexible_date: true, priority: 'media', planned_monthly: 150000, status: 'activa' },
  ]
  const goal_movements = [
    { ...base(), goal_id: goals[0]!.id, kind: 'aporte', amount: 300000, movement_date: monthOffset(-2), note: null, balance_id: null },
    { ...base(), goal_id: goals[0]!.id, kind: 'aporte', amount: 250000, movement_date: monthOffset(-1), note: null, balance_id: null },
    { ...base(), goal_id: goals[1]!.id, kind: 'aporte', amount: 150000, movement_date: monthOffset(-1), note: null, balance_id: null },
  ]
  const emergency_funds = [{ ...base(), essential_monthly_override: null, target_months: 3, initial_saved: 1200000, planned_monthly: 200000, has_major_debts: false }]
  const emergency_movements = [
    { ...base(), kind: 'aporte', amount: 200000, movement_date: monthOffset(-1), reason: null, note: null, balance_id: null },
  ]
  const budgets = [
    { ...base(), category_id: cat('Salidas'), amount: 300000, month_from: monthOffset(-1), month_to: null },
    { ...base(), category_id: cat('Alimentación'), amount: 650000, month_from: monthOffset(-1), month_to: null },
    { ...base(), category_id: cat('Compras'), amount: 200000, month_from: monthOffset(-1), month_to: null },
  ]
  const outing_habits = [{ ...base(), per_month: 6, transport: 18000, food: 35000, drinks: 22000, other: 0, scenarios: {} }]
  const profiles = [{
    id: DEMO_UID, display_name: 'Ana', country: 'CO', currency: 'COP', locale: 'es-CO', theme: 'system', experience_mode: 'intermedio',
    priority: 'ahorrar', income_stability: 'variable', dependents: 0, capsules_read: [], onboarding_completed: true, plan: 'gratuito',
    created_at: monthOffset(-3), updated_at: stamp(),
  }]
  return {
    profiles, categories, monthly_balances, balance_lines, recurring_items: [], goals, goal_movements,
    emergency_funds, emergency_movements, budgets, outing_habits, reports: [], feedback: [],
  }
}

let db: DB | null = null

function load(): DB {
  if (db) return db
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return (db = JSON.parse(raw) as DB)
  } catch {
    /* sin almacenamiento: queda en memoria */
  }
  return (db = seed())
}

function save() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* ignorar */
  }
}

export function resetDemo() {
  db = seed()
  save()
}

export function clearDemo() {
  db = null
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignorar */
  }
}

// ---------------------------------------------------------------- consultas

function cmp(a: unknown, b: unknown) {
  if (a === b) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a) < String(b) ? -1 : 1
}

function matches(row: Row, col: string, expr: string): boolean {
  const i = expr.indexOf('.')
  const op = expr.slice(0, i)
  const val = expr.slice(i + 1)
  const v = row[col]
  const s = v === null || v === undefined ? null : String(v)
  switch (op) {
    case 'eq': return s === val
    case 'neq': return s !== val
    case 'lt': return s !== null && cmp(isNum(v) ? Number(v) : s, isNum(v) ? Number(val) : val) < 0
    case 'lte': return s !== null && cmp(isNum(v) ? Number(v) : s, isNum(v) ? Number(val) : val) <= 0
    case 'gt': return s !== null && cmp(isNum(v) ? Number(v) : s, isNum(v) ? Number(val) : val) > 0
    case 'gte': return s !== null && cmp(isNum(v) ? Number(v) : s, isNum(v) ? Number(val) : val) >= 0
    case 'is': return val === 'null' ? v === null || v === undefined : String(v) === val
    case 'in': return val.replace(/^\(|\)$/g, '').split(',').map((x) => x.replace(/^"|"$/g, '')).includes(s ?? '')
    default: return true
  }
}
const isNum = (v: unknown) => typeof v === 'number'

function query(rows: Row[], params: URLSearchParams): Row[] {
  let out = rows.slice()
  for (const [k, v] of params) {
    if (['select', 'order', 'limit', 'offset', 'columns', 'on_conflict'].includes(k)) continue
    out = out.filter((r) => matches(r, k, v))
  }
  const order = params.get('order')
  if (order) {
    const parts = order.split(',').map((p) => p.split('.'))
    out.sort((a, b) => {
      for (const [col, dir] of parts) {
        const c = cmp(a[col!], b[col!])
        if (c) return dir === 'desc' ? -c : c
      }
      return 0
    })
  }
  const limit = params.get('limit')
  if (limit) out = out.slice(0, Number(limit))
  return out
}

function summaries(d: DB): Row[] {
  const essential = new Set(d.categories!.filter((c) => c.is_essential).map((c) => c.id))
  return d.monthly_balances!.map((b) => {
    const ls = d.balance_lines!.filter((l) => l.balance_id === b.id)
    const sum = (f: (l: Row) => boolean) => ls.filter(f).reduce((s, l) => s + Number(l.amount), 0)
    const income = sum((l) => l.kind === 'ingreso')
    const expense = sum((l) => l.kind === 'gasto')
    return {
      balance_id: b.id, user_id: DEMO_UID, period: b.period, status: b.status, income_total: income, expense_total: expense,
      essential_total: sum((l) => l.kind === 'gasto' && essential.has(l.category_id)), left_total: income - expense,
    }
  })
}

const DEFAULTS: Record<string, Row> = {
  monthly_balances: { status: 'borrador', closed_at: null, note: null },
  balance_lines: { expense_type: null, line_date: null, description: null, recurring_item_id: null, source: 'manual' },
  categories: { is_essential: false, is_system: false, archived: false, sort_order: 0, icon: null, color: null },
  goals: { reason: null, initial_saved: 0, deadline: null, flexible_date: false, priority: 'media', planned_monthly: null, status: 'activa' },
  goal_movements: { movement_date: new Date().toISOString().slice(0, 10), note: null, balance_id: null },
  emergency_movements: { movement_date: new Date().toISOString().slice(0, 10), reason: null, note: null, balance_id: null },
  budgets: { month_to: null },
  feedback: { screen: null },
  reports: {},
  recurring_items: { frequency: 'mensual', payment_day: null, active: true },
}

class PgError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

function checkInsert(d: DB, table: string, row: Row) {
  if (table === 'categories') {
    const dup = d.categories!.some((c) => c.id !== row.id && c.kind === row.kind && String(c.name).toLowerCase() === String(row.name).toLowerCase())
    if (dup) throw new PgError(409, '23505', 'duplicate key value violates unique constraint')
  }
  if (table === 'monthly_balances' && d.monthly_balances!.some((b) => b.id !== row.id && b.period === row.period)) {
    throw new PgError(409, '23505', 'duplicate key value violates unique constraint')
  }
  if (table === 'emergency_movements' && row.kind === 'retiro' && !String(row.reason ?? '').trim()) {
    throw new PgError(400, '23514', 'new row violates check constraint')
  }
}

function startBalance(d: DB, period: string): string {
  const existing = d.monthly_balances!.find((b) => b.period === period)
  if (existing) return existing.id as string
  const b = { ...base(), period, ...DEFAULTS.monthly_balances }
  d.monthly_balances!.push(b)
  const prev = d.monthly_balances!.filter((x) => String(x.period) < period).sort((a, z) => cmp(z.period, a.period))[0]
  if (prev) {
    const archived = new Set(d.categories!.filter((c) => c.archived).map((c) => c.id))
    for (const l of d.balance_lines!.filter((l) => l.balance_id === prev.id && !archived.has(l.category_id))) {
      d.balance_lines!.push({ ...l, ...base(), balance_id: b.id })
    }
  }
  return b.id as string
}

function json(data: unknown, status = 200): Response {
  return new Response(data === undefined ? null : JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export async function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const req = new Request(input, init)
  const url = new URL(req.url)
  const d = load()
  if (url.pathname.startsWith('/auth/v1/')) return json({})
  const path = url.pathname.replace(/^\/rest\/v1\//, '')
  const method = req.method.toUpperCase()
  const wantsObject = (req.headers.get('accept') ?? '').includes('vnd.pgrst.object')
  const wantsRows = (req.headers.get('prefer') ?? '').includes('return=representation')
  const body = method === 'GET' || method === 'HEAD' ? null : await req.text()
  const payload = body ? JSON.parse(body) : null
  const reply = (rows: Row[], status = 200) => {
    if (wantsObject) {
      if (rows.length !== 1) return json({ code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' }, 406)
      return json(rows[0], status)
    }
    return json(rows, status)
  }

  try {
    if (path.startsWith('rpc/')) {
      const fn = path.slice(4)
      if (fn === 'start_balance') {
        const id = startBalance(d, payload.p_period)
        save()
        return json(id)
      }
      if (fn === 'delete_my_account') {
        resetDemo()
        return json(null, 204)
      }
      return json({ message: 'Función no disponible en el modo exploración' }, 404)
    }
    if (path === 'balance_summaries') return reply(query(summaries(d), url.searchParams))
    const table = d[path]
    if (!table) return json({ message: `Tabla ${path} no disponible` }, 404)

    if (method === 'GET') return reply(query(table, url.searchParams))

    if (method === 'POST') {
      const items: Row[] = (Array.isArray(payload) ? payload : [payload]).map((p: Row) => ({ ...base(), ...DEFAULTS[path], ...p }))
      items.forEach((it) => checkInsert(d, path, it))
      table.push(...items)
      save()
      return wantsRows ? reply(items, 201) : json(undefined, 201)
    }
    if (method === 'PATCH') {
      const rows = query(table, url.searchParams)
      for (const r of rows) {
        const next = { ...r, ...payload, updated_at: stamp() }
        checkInsert(d, path, next)
        Object.assign(r, next)
      }
      save()
      return wantsRows ? reply(rows) : json(undefined, 204)
    }
    if (method === 'DELETE') {
      const rows = new Set(query(table, url.searchParams))
      if (path === 'categories') {
        const used = [...rows].some((c) => d.balance_lines!.some((l) => l.category_id === c.id))
        if (used) throw new PgError(409, '23503', 'violates foreign key constraint')
        d.budgets = d.budgets!.filter((b) => ![...rows].some((c) => c.id === b.category_id))
      }
      if (path === 'monthly_balances') d.balance_lines = d.balance_lines!.filter((l) => ![...rows].some((b) => b.id === l.balance_id))
      if (path === 'goals') d.goal_movements = d.goal_movements!.filter((m) => ![...rows].some((g) => g.id === m.goal_id))
      d[path] = table.filter((r) => !rows.has(r))
      save()
      return json(undefined, 204)
    }
    return json({ message: 'Método no soportado' }, 405)
  } catch (e) {
    if (e instanceof PgError) return json({ code: e.code, message: e.message, details: null, hint: null }, e.status)
    return json({ message: 'Error en el modo exploración' }, 500)
  }
}
