# Registro de etapas

| Etapa | Estado | Fecha |
| --- | --- | --- |
| 0. Prototipo navegable | Completa | 22 nov 2026 |
| 1. Configuración | Completa | 22 nov 2026 |
| 2. Base de datos y seguridad | Completa | 22 nov 2026 |
| 3. Cuentas | Completa · URLs configuradas; falta correo propio y Google | 22 nov 2026 |
| 4. Balance mensual y categorías | Completa | 22 nov 2026 |
| 5. Inicio y primer ingreso | Completa | 22 nov 2026 |
| 6. Metas de ahorro | Completa | 22 nov 2026 |
| 7. Fondo de emergencia | Completa | 22 nov 2026 |
| 8. Salidas y presupuestos | Completa | 22 nov 2026 |
| 9. Estadísticas y reportes | Completa | 22 nov 2026 |
| 10. Aprende, privacidad y lanzamiento | Completa · falta prueba con cuenta real | 22 nov 2026 |

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

**Verificación final**

- La versión publicada conecta con Supabase (página `/estado`: variables y conexión correctas).
- Las direcciones internas se pueden abrir y recargar directamente.
- Encabezados de seguridad activos (CSP, X-Frame-Options: DENY).
- Los tres servicios están en plan gratuito: Supabase Free, Cloudflare Workers Free sin medio de pago, GitHub Free.

**Servicios conectados (planes gratuitos)**

- Supabase: proyecto `seivin` (región us-east-1), valores públicos en `.env.production`.
- GitHub: repositorio `ricardoerazo306/seivin`.
- Cloudflare Pages: proyecto `seivin`, publicado en https://seivin.pages.dev (compila con `npm run build`, salida `dist`).

## Etapa 2 · Base de datos y seguridad

**Qué se desarrolló** (`supabase/migrations/`)

- 13 tablas: perfiles, categorías, balances mensuales y sus líneas, compromisos fijos, metas y sus
  aportes, fondo de emergencia y sus movimientos, presupuestos, hábitos de salida, reportes y comentarios.
- RLS activo en todas: cada operación solo sobre filas propias. Sin sesión no se puede leer nada.
- Llaves compuestas `(id, user_id)`: nadie puede enlazar sus datos a balances, categorías o metas ajenas.
- Permisos explícitos solo para usuarios con sesión; el perfil solo deja editar preferencias (no el plan).
- Restricciones: valores mayores que cero, retiros del fondo con motivo obligatorio, un balance por mes.
- Al registrarse: perfil, 16 categorías (4 de ingreso y 12 de gasto, las esenciales marcadas), fondo y hábitos.
- Vista `balance_summaries` (respeta RLS) con ingresos, gastos, esenciales y lo que queda por balance.
- Función `delete_my_account()`: borra la cuenta y, en cascada, todos sus datos. Sin claves secretas.

**Pruebas**

- `supabase/tests/aislamiento_rls.sql`: 16 de 16 correctas, sin dejar datos.
- Asesores de Supabase: el único aviso de seguridad es `delete_my_account` ejecutable con sesión, que es
  intencional (solo borra la cuenta de quien la llama). Índices sugeridos agregados.

## Etapa 3 · Cuentas

**Qué se desarrolló**

- Registro con nombre, correo y contraseña (8+ caracteres con letras y números), con aviso de "revisa tu correo".
- Inicio y cierre de sesión, recuperación de contraseña por correo y página para crear la nueva.
- Rutas privadas: `/app/*` exige sesión y devuelve a la página que pedías después de entrar.
- Cuenta: nombre, modo de experiencia (inicial, intermedio, avanzado), apariencia (claro, oscuro, automático),
  descarga de todos los datos en JSON, cierre de sesión y eliminación de la cuenta con confirmación.
- Mensajes de error claros y sin culpa para los códigos de Supabase Auth.
- Botón de Google listo pero apagado (`src/config/features.ts`) hasta crear las credenciales.

**Pruebas**: validaciones y mensajes (4), rutas protegidas y validación del registro (5).

**Pendiente**: en Supabase → Authentication → URL Configuration, poner `https://seivin.pages.dev` como Site URL
y agregar `https://seivin.pages.dev/**` a las Redirect URLs; decidir la confirmación por correo (ver plan).

## Etapa 4 · Balance mensual y categorías

**Qué se desarrolló**

- Organiza: tarjeta del mes actual (empezar, seguir o ver), historial de balances con lo que quedó y la diferencia
  frente al mes anterior, y opción de registrar un mes anterior para tener con qué comparar.
- Balance del mes: se abre copiando las líneas del balance anterior (o los movimientos fijos si es el primero),
  así la persona solo ajusta lo que cambió. Cada línea muestra cuánto fue el mes anterior o si es nueva.
- Edición en línea con guardado al salir del campo, actualización optimista y campo de pesos con separador de miles.
- Resumen: entró, salió, te quedó (y diferencia con el mes anterior) y peso de los gastos esenciales.
- Cerrar el balance: mensaje sin culpa y lista de "qué cambió" por categoría, ordenada por su efecto en lo que quedó.
  Se puede reabrir o borrar.
- Categorías: crear, renombrar, marcar como esencial, archivar, restaurar y borrar (si no tiene movimientos).
- Tipo de gasto (fijo, variable, ocasional) visible en los modos intermedio y avanzado.
- Base de datos: función `start_balance(period)` con `SECURITY INVOKER` (respeta RLS), idempotente y atómica.
- Seguridad: al cerrar sesión se borra la caché local de datos.

**Pruebas**

- Lógica (8): períodos, totales, comparación (la suma de cambios cuadra con la diferencia), copia, mensajes y formato de pesos.
- SQL `supabase/tests/iniciar_balance.sql` (8/8): desde fijos, copia sin archivadas, idempotencia, validaciones,
  aislamiento entre cuentas y bloqueo sin sesión.
- Recorrido completo en navegador (celular y computador) con Supabase simulado (`qa/`): sin errores de consola.

**Pendiente para después**: pantalla para administrar movimientos fijos (la base ya los soporta).

## Etapa 5 · Inicio, primer ingreso y comentarios

- **Modo exploración** (`/explorar`): la app completa con datos de ejemplo, sin cuenta. Imita la API de Supabase
  dentro del navegador (`src/demo/`); nada sale del navegador y se borra al cerrar la pestaña.
- **Primer ingreso guiado** (`/app/bienvenida`): nombre, prioridad, tipo de ingreso, personas a cargo y modo de experiencia.
- **Inicio**: lo que quedó el último mes y su diferencia, un "próximo paso" según tu situación, tendencia de los
  últimos meses, avance de metas y respaldo, cápsula sugerida y acceso al simulador.
- **Comentarios** desde cualquier pantalla (tabla `feedback`; se leen en el editor de tablas de Supabase).

## Etapas 6 y 7 · Metas y respaldo para imprevistos

- Metas con monto, porqué, fecha o fecha flexible, prioridad y aporte mensual; vista previa del plan al crearla.
- Detalle: cuánto apartar al mes para llegar, fecha estimada con el aporte planeado, aviso sin culpa si no alcanza,
  aportes y retiros, marcar cumplida, archivar, borrar.
- Respaldo: gasto esencial promedio de los últimos 3 balances (o el que escribas), meses sugeridos según ingreso,
  personas a cargo y deudas, meta, meses cubiertos, tiempo para llegar, movimientos (el retiro pide motivo).

## Etapa 8 · Salidas y presupuestos

- Simulador: costo por salida, al mes y al año; escenarios de salir menos o gastar menos; efecto en tu primera meta.
- Presupuestos por categoría comparados con el balance del mes (o el más reciente), con propuesta de un 10 % menos.

## Etapa 9 · Estadísticas y reportes

- Período de 3, 6 o 12 meses; promedios; ingresos y gastos por mes; lo que quedó; gastos por categoría de un mes.
- Gráficas propias en SVG (sin librerías), con tooltip, leyenda, tabla accesible y paleta validada para daltonismo.
- Descarga en PNG (`html-to-image`) y PDF (`jsPDF` 4.2.1, sin vulnerabilidades conocidas), cargados solo al usarlos.

## Etapa 10 · Aprende, privacidad y lanzamiento

- 10 cápsulas de 2–3 minutos con acción sugerida y marca de leída; glosario con 16 términos y buscador.
- Páginas públicas de privacidad (Ley 1581 de 2012) y términos, enlazadas desde el registro y la bienvenida.
- Modo oscuro revisado en todas las pantallas.

**Pruebas (etapas 5–10)**: 35 pruebas automáticas + 2 del modo exploración; recorrido completo en navegador
(computador claro, celular claro y oscuro) sin errores de consola ni peticiones a Supabase en modo exploración.
