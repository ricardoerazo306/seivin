import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { BRAND } from '../config/brand'
import { Providers } from './Providers'
import { routes } from './router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  )
}

describe('rutas', () => {
  it('muestra la bienvenida con el eslogan y el aviso de que no es un banco', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: BRAND.slogan })).toBeInTheDocument()
    expect(screen.getByText(BRAND.disclaimer)).toBeInTheDocument()
  })

  it('muestra las 6 áreas del brandbook en la app', () => {
    renderAt('/app')
    expect(screen.getByRole('heading', { level: 1, name: 'Inicio' })).toBeInTheDocument()
    for (const label of ['Organiza', 'Construye', 'Entiende', 'Aprende', 'Cuenta']) {
      expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0)
    }
  })

  it('avisa en la página de estado cuando faltan las variables de Supabase', async () => {
    renderAt('/estado')
    expect(await screen.findByText(/Faltan VITE_SUPABASE_URL/)).toBeInTheDocument()
  })

  it('muestra una página clara para rutas inexistentes', () => {
    renderAt('/no-existe')
    expect(screen.getByRole('heading', { name: 'Esta página no existe' })).toBeInTheDocument()
  })
})
