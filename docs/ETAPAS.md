# Registro de etapas

| Etapa | Estado | Fecha |
| --- | --- | --- |
| 0. Prototipo navegable | Completa | 22 nov 2026 |
| 1. Configuración | En curso: falta conectar Supabase y publicar | 22 nov 2026 |
| 2. Base de datos y seguridad | Pendiente | |
| 3. Cuentas | Pendiente | |
| 4. Balance mensual y categorías | Pendiente | |
| 5. Inicio y primer ingreso | Pendiente | |
| 6. Metas de ahorro | Pendiente | |
| 7. Fondo de emergencia | Pendiente | |
| 8. Salidas y presupuestos | Pendiente | |
| 9. Estadísticas y reportes | Pendiente | |
| 10. Aprende, privacidad y lanzamiento | Pendiente | |

## Etapa 1 · Configuración

**Qué se desarrolló**

- Proyecto React + TypeScript (modo estricto) con Vite.
- Tokens de color y tipografía del brandbook (Manrope e Inter servidas localmente, sin depender de Google Fonts).
- Rutas: bienvenida (`/`), estado de la conexión (`/estado`), app con las 6 áreas (`/app/...`) y página 404.
- Estructura de la app: menú lateral en computador y barra inferior con botón central en celular.
- Cliente de Supabase que solo se crea con variables válidas; bloquea claves secretas.
- Página de estado que comprueba la conexión real con Supabase.
- Carpeta `supabase/` (CLI 3.2) con contraseñas de mínimo 8 caracteres y redirecciones locales.
- Cloudflare Pages: `_redirects` para la navegación y `_headers` con encabezados de seguridad.
- GitHub Actions: tipos, estilo, pruebas y compilación en cada cambio.

**Pruebas**

- 7 pruebas de validación de variables (incluye bloqueo de claves secretas).
- 4 pruebas de rutas (bienvenida, áreas, estado sin variables, 404).
- Revisión visual en computador y celular.

**Pendiente para cerrar la etapa**

- Crear el proyecto en Supabase y poner sus dos valores en `.env.local` y en Cloudflare.
- Subir el código a GitHub y conectar Cloudflare Pages.
- Confirmar en `/estado` de la versión publicada que la conexión responde.
