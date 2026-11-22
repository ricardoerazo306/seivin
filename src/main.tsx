import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { Providers } from './app/Providers'
import { router } from './app/router'
import './styles/index.css'
import { applyTheme } from './lib/profile'
import type { Theme } from './lib/types'

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
