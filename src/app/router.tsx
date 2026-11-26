import { createBrowserRouter, type RouteObject } from 'react-router'
import { AppLayout } from '../layouts/AppLayout'
import { RequireAuth } from './RequireAuth'
import { Root, RouteError } from './Root'
import { Entrar } from '../pages/auth/Entrar'
import { NuevaContrasena } from '../pages/auth/NuevaContrasena'
import { Recuperar } from '../pages/auth/Recuperar'
import { Registro } from '../pages/auth/Registro'
import { MorePage } from '../pages/AreaPage'
import { Landing } from '../pages/Landing'
import { NotFound } from '../pages/NotFound'

export const routes: RouteObject[] = [
  {
    element: <Root />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <div className="min-h-dvh bg-page" />,
    children: [
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
      { index: true, lazy: () => import('../features/inicio/InicioPage').then((m) => ({ Component: m.InicioPage })) },
      { path: 'bienvenida', lazy: () => import('../features/inicio/BienvenidaPage').then((m) => ({ Component: m.BienvenidaPage })) },
      { path: 'organiza', lazy: () => import('../features/balance/OrganizaPage').then((m) => ({ Component: m.OrganizaPage })) },
      { path: 'organiza/salidas', lazy: () => import('../features/balance/SalidasPage').then((m) => ({ Component: m.SalidasPage })) },
      { path: 'organiza/presupuestos', lazy: () => import('../features/balance/PresupuestosPage').then((m) => ({ Component: m.PresupuestosPage })) },
      {
        path: 'organiza/categorias',
        lazy: () => import('../features/balance/CategoriasPage').then((m) => ({ Component: m.CategoriasPage })),
      },
      { path: 'organiza/:mes', lazy: () => import('../features/balance/BalancePage').then((m) => ({ Component: m.BalancePage })) },
      { path: 'construye', lazy: () => import('../features/construye/MetasPage').then((m) => ({ Component: m.MetasPage })) },
      { path: 'construye/metas/:id', lazy: () => import('../features/construye/MetaDetalle').then((m) => ({ Component: m.MetaDetalle })) },
      { path: 'construye/respaldo', lazy: () => import('../features/construye/RespaldoPage').then((m) => ({ Component: m.RespaldoPage })) },
      { path: 'entiende', lazy: () => import('../features/entiende/EntiendePage').then((m) => ({ Component: m.EntiendePage })) },
      { path: 'aprende', lazy: () => import('../features/aprende/AprendePage').then((m) => ({ Component: m.AprendePage })) },
      { path: 'aprende/:id', lazy: () => import('../features/aprende/AprendePage').then((m) => ({ Component: m.CapsulaPage })) },
      { path: 'cuenta', lazy: () => import('../pages/Cuenta').then((m) => ({ Component: m.Cuenta })) },
      { path: 'mas', element: <MorePage /> },
    ],
  },
  { path: '/explorar', lazy: () => import('../features/inicio/Explorar').then((m) => ({ Component: m.Explorar })) },
  { path: '/privacidad', lazy: () => import('../pages/Legal').then((m) => ({ Component: m.Privacidad })) },
  { path: '/terminos', lazy: () => import('../pages/Legal').then((m) => ({ Component: m.Terminos })) },
  { path: '/registro', element: <Registro /> },
  { path: '/entrar', element: <Entrar /> },
  { path: '/recuperar', element: <Recuperar /> },
  { path: '/nueva-contrasena', element: <NuevaContrasena /> },
  { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
