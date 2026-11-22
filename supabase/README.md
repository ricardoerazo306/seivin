# Supabase de Seivin

- `config.toml`: configuración de Supabase para desarrollo local (contraseñas de mínimo 8 caracteres, redirecciones a `localhost:5173`).
- `migrations/`: cada cambio de la base de datos es un archivo SQL numerado. Se crean desde la etapa 2 (tablas, políticas RLS y funciones).

Comandos (desde la carpeta del proyecto):

| Comando | Qué hace |
| --- | --- |
| `npx supabase login` | Inicia sesión con tu cuenta de Supabase (una vez). |
| `npx supabase link --project-ref <ref>` | Conecta esta carpeta con tu proyecto en la nube. |
| `npx supabase db push` | Aplica las migraciones pendientes en el proyecto conectado. |

La clave secreta de Supabase nunca se guarda en este repositorio.
