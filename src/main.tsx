import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { Providers } from './app/Providers'
import { router } from './app/router'
import './styles/index.css'
import { applyTheme } from './lib/profile'
import type { Theme } from './lib/types'
import { captureAuthReturnError } from './lib/authReturn'

captureAuthReturnError()

// Si tras publicar una versión nueva falla la carga de una pantalla, se recarga una sola vez.
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem('seivin:recarga-por-version')) return
    sessionStorage.setItem('seivin:recarga-por-version', '1')
  } catch {
    return
  }
  event.preventDefault()
  window.location.reload()
})
setTimeout(() => {
  try {
    sessionStorage.removeItem('seivin:recarga-por-version')
  } catch {
    /* ignorar */
  }
}, 10_000)

// Aplica el último tema elegido antes de pintar (sin scripts en línea, por la CSP).
try {
  applyTheme((localStorage.getItem('seivin:tema') as Theme | null) ?? 'system')
} catch {
  applyTheme('system')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
)
