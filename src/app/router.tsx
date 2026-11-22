import { createBrowserRouter } from 'react-router'
import { AppLayout } from '../layouts/AppLayout'
import { RequireAuth } from './RequireAuth'
import { Entrar } from '../pages/auth/Entrar'
import { NuevaContrasena } from '../pages/auth/NuevaContrasena'
import { Recuperar } from '../pages/auth/Recuperar'
import { Registro } from '../pages/auth/Registro'
import { AreaPage, MorePage } from '../pages/AreaPage'
import { Landing } from '../pages/Landing'
import { NotFound } from '../pages/NotFound'

export const routes = [
  { path: '/', element: <Landing /> },
  // Carga diferida: el cliente de Supabase solo se descarga cuando hace falta.
  { path: '/estado', lazy: () => import('../pages/Estado').then((m) => ({ Component: m.Estado })) },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AreaPage areaId="inicio" /> },
      { path: 'organiza', lazy: () => import('../features/balance/OrganizaPage').then((m) => ({ Component: m.OrganizaPage })) },
      {
        path: 'organiza/categorias',
        lazy: () => import('../features/balance/CategoriasPage').then((m) => ({ Component: m.CategoriasPage })),
      },
      { path: 'organiza/:mes', lazy: () => import('../features/balance/BalancePage').then((m) => ({ Component: m.BalancePage })) },
      { path: 'construye', element: <AreaPage areaId="construye" /> },
      { path: 'entiende', element: <AreaPage areaId="entiende" /> },
      { path: 'aprende', element: <AreaPage areaId="aprende" /> },
      { path: 'cuenta', lazy: () => import('../pages/Cuenta').then((m) => ({ Component: m.Cuenta })) },
      { path: 'mas', element: <MorePage /> },
    ],
  },
  { path: '/registro', element: <Registro /> },
  { path: '/entrar', element: <Entrar /> },
  { path: '/recuperar', element: <Recuperar /> },
  { path: '/nueva-contrasena', element: <NuevaContrasena /> },
  { path: '*', element: <NotFound /> },
]

export const router = createBrowserRouter(routes)
