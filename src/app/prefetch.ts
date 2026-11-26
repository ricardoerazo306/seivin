/** Precarga del código de las pantallas principales para que abrirlas sea inmediato. */
const loaders: Record<string, () => Promise<unknown>> = {
  '/app': () => import('../features/inicio/InicioPage'),
  '/app/organiza': () => import('../features/balance/OrganizaPage'),
  '/app/construye': () => import('../features/construye/MetasPage'),
  '/app/entiende': () => import('../features/entiende/EntiendePage'),
  '/app/aprende': () => import('../features/aprende/AprendePage'),
  '/app/cuenta': () => import('../pages/Cuenta'),
}

const done = new Set<string>()

export function prefetch(path: string) {
  const load = loaders[path]
  if (!load || done.has(path)) return
  done.add(path)
  load().catch(() => done.delete(path))
}

/** Cuando el navegador queda libre, precarga todas las áreas. */
export function prefetchWhenIdle() {
  const run = () => Object.keys(loaders).forEach(prefetch)
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 4000 })
  else setTimeout(run, 2500)
}
