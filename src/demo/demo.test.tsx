import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { Providers } from '../app/Providers'
import { routes } from '../app/router'
import { demoClient, exitDemo } from './mode'
import { resetDemo } from './backend'

afterEach(() => exitDemo())

describe('modo exploración', () => {
  it('entra sin cuenta y muestra el inicio con datos de ejemplo', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/explorar'] })
    render(
      <Providers>
        <RouterProvider router={router} />
      </Providers>,
    )
    expect(await screen.findByRole('heading', { level: 1, name: /, Ana$/ }, { timeout: 5000 })).toBeInTheDocument()
    expect(await screen.findByText('Estás explorando con datos de ejemplo.')).toBeInTheDocument()
    expect(await screen.findByText('Viaje a Cartagena')).toBeInTheDocument()
  })

  it('imita la API: filtra, ordena, inserta, valida y abre el mes copiando el anterior', async () => {
    resetDemo()
    const db = demoClient()
    const { data: cats } = await db.from('categories').select('*').eq('kind', 'ingreso').order('sort_order')
    expect(cats?.map((c) => c.name)).toEqual(['Salario', 'Negocios', 'Trabajos adicionales', 'Otros ingresos'])
    const dup = await db.from('categories').insert({ name: 'salario', kind: 'ingreso' })
    expect(dup.error?.code).toBe('23505')
    const { data: sums } = await db.from('balance_summaries').select('*').order('period', { ascending: false })
    const last = sums![0]!
    const { data: id } = await db.rpc('start_balance', { p_period: '2099-01-01' })
    const { data: copied } = await db.from('balance_lines').select('*').eq('balance_id', id as string)
    const { data: prev } = await db.from('balance_lines').select('*').eq('balance_id', last.balance_id)
    expect(copied?.length).toBe(prev?.length)
    const retiro = await db.from('emergency_movements').insert({ kind: 'retiro', amount: 1 })
    expect(retiro.error?.code).toBe('23514')
  })
})
