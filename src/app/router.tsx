import { createBrowserRouter } from 'react-router'
import { AppLayout } from '../layouts/AppLayout'
import { AreaPage, MorePage } from '../pages/AreaPage'
import { Landing } from '../pages/Landing'
import { NotFound } from '../pages/NotFound'

export const routes = [
  { path: '/', element: <Landing /> },
  // Carga diferida: el cliente de Supabase solo se descarga cuando hace falta.
  { path: '/estado', lazy: () => import('../pages/Estado').then((m) => ({ Component: m.Estado })) },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <AreaPage areaId="inicio" /> },
      { path: 'organiza', element: <AreaPage areaId="organiza" /> },
      { path: 'construye', element: <AreaPage areaId="construye" /> },
      { path: 'entiende', element: <AreaPage areaId="entiende" /> },
      { path: 'aprende', element: <AreaPage areaId="aprende" /> },
      { path: 'cuenta', element: <AreaPage areaId="cuenta" /> },
      { path: 'mas', element: <MorePage /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]

export const router = createBrowserRouter(routes)
