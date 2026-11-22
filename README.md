# Seivin

Plataforma de bienestar financiero personal. *Una mejor relación con tu dinero comienza aquí.*

> "Seivin" es el nombre de trabajo. Se cambia en un solo lugar: `src/config/brand.ts`.

## Tecnologías

React + TypeScript + Vite · Tailwind CSS · React Router · TanStack Query · Supabase (autenticación, PostgreSQL y RLS) · Vitest · Cloudflare Pages.

Todo es gratuito y de código abierto. El plan completo está en el documento "Plataforma de finanzas personales — Plan del MVP".

## Ejecutar en tu computador

Requisito: [Node.js](https://nodejs.org) versión 20 o superior (la LTS).

```bash
npm install                 # una sola vez
cp .env.example .env.local  # y completa los dos valores de Supabase
npm run dev                 # abre http://localhost:5173
```

En Windows, en lugar de `cp` puedes copiar el archivo `.env.example`, pegarlo y renombrarlo a `.env.local`.

Para comprobar la conexión con Supabase abre **http://localhost:5173/estado**.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Abre la app en modo desarrollo. |
| `npm test` | Ejecuta las pruebas automáticas. |
| `npm run typecheck` | Revisa los tipos de TypeScript. |
| `npm run check` | Tipos, estilo, pruebas y compilación: lo mismo que revisa GitHub en cada cambio. |
| `npm run build` | Genera la versión para publicar en `dist/`. |

## Variables de entorno

| Variable | Dónde se obtiene | ¿Pública? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API | Sí |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys (`sb_publishable_...`) | Sí, por diseño: la seguridad la ponen las políticas RLS |

La app **rechaza** claves secretas (`sb_secret_...` o `service_role`) para que nunca terminen en el navegador. Los archivos `.env*` no se suben al repositorio.

## Publicación (Cloudflare Pages)

- Comando de compilación: `npm run build`
- Carpeta de salida: `dist`
- Variables: las dos de arriba
- `public/_redirects` permite recargar cualquier página de la app.
- `public/_headers` añade encabezados de seguridad (CSP, sin incrustación en otros sitios, sin cámara ni micrófono).

## Estructura

```
src/
  app/          rutas, proveedores y navegación (las 6 áreas del brandbook)
  config/       marca, región y validación de variables de entorno
  lib/          cliente de Supabase y comprobación de conexión
  layouts/      estructura de la app (menú lateral y barra inferior)
  pages/        bienvenida, estado de la conexión, áreas y página 404
  components/   piezas reutilizables (logo)
  styles/       tokens de color y tipografía del brandbook
supabase/       configuración y migraciones de la base de datos
.github/        revisión automática en cada cambio
docs/           registro de etapas
```

## Aviso

Seivin te ayuda a organizarte y aprender. No es un banco ni un asesor financiero.
