import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { BRAND } from '../config/brand'
import { AppLayout } from '../layouts/AppLayout'
import { AreaPage } from '../pages/AreaPage'
import { Providers } from './Providers'
import { routes } from './router'

function renderRoutes(path: string, list = routes) {
  const router = createMemoryRouter(list, { initialEntries: [path] })
  return render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  )
}

describe('rutas', () => {
  it('muestra la bienvenida con el eslogan, el registro y el aviso de que no es un banco', () => {
    renderRoutes('/')
    expect(screen.getByRole('heading', { level: 1, name: BRAND.slogan })).toBeInTheDocument()
    const crear = screen.getAllByRole('link', { name: 'Crear cuenta gratis' })
    expect(crear.length).toBeGreaterThan(0)
    crear.forEach((l) => expect(l).toHaveAttribute('href', '/registro'))
    expect(screen.getAllByRole('link', { name: 'Entrar' })[0]).toHaveAttribute('href', '/entrar')
    expect(screen.getByRole('link', { name: 'Explorar con datos de ejemplo' })).toHaveAttribute('href', '/explorar')
    expect(screen.getByText(BRAND.disclaimer)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacidad' })).toHaveAttribute('href', '/privacidad')
  })

  it('no deja entrar a la app sin configuración ni sesión', async () => {
    renderRoutes('/app/cuenta')
    expect(await screen.findByRole('heading', { name: 'Estado de la conexión' })).toBeInTheDocument()
  })

  it('valida el registro antes de enviar nada', async () => {
    renderRoutes('/registro')
    screen.getByRole('button', { name: 'Crear cuenta' }).click()
    expect(await screen.findByText('Escribe cómo quieres que te llamemos.')).toBeInTheDocument()
    expect(screen.getByText('Escribe tu correo.')).toBeInTheDocument()
    expect(screen.getByText('Escribe una contraseña.')).toBeInTheDocument()
  })

  it('muestra las 6 áreas del brandbook en la estructura de la app', () => {
    renderRoutes('/app', [{ path: '/app', element: <AppLayout />, children: [{ index: true, element: <AreaPage areaId="inicio" /> }] }])
    expect(screen.getByRole('heading', { level: 1, name: 'Inicio' })).toBeInTheDocument()
    for (const label of ['Organiza', 'Construye', 'Entiende', 'Aprende', 'Cuenta']) {
      expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0)
    }
  })

  it('muestra una página clara para rutas inexistentes', () => {
    renderRoutes('/no-existe')
    expect(screen.getByRole('heading', { name: 'Esta página no existe' })).toBeInTheDocument()
  })
})

describe('errores y retorno de Google', () => {
  it('convierte el error que trae Google en un mensaje claro y limpia la dirección', async () => {
    const { captureAuthReturnError, takeAuthReturnError } = await import('../lib/authReturn')
    window.history.replaceState(null, '', '/entrar#error=access_denied&error_description=access_denied')
    captureAuthReturnError()
    expect(window.location.hash).toBe('')
    expect(takeAuthReturnError()).toMatch(/Cancelaste el inicio con Google/)
    expect(takeAuthReturnError()).toBeNull()
  })

  it('muestra una pantalla amable si una página falla', async () => {
    const { Root, RouteError } = await import('./Root')
    const Boom = () => {
      throw new Error('fallo de prueba')
    }
    const router = createMemoryRouter([{ element: <Root />, errorElement: <RouteError />, children: [{ path: '/', element: <Boom /> }] }])
    render(<RouterProvider router={router} />)
    expect(await screen.findByRole('heading', { name: 'Algo no salió bien' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeInTheDocument()
  })
})
