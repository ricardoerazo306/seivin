# Revisión visual con Supabase simulado

Recorre el balance mensual en un navegador real sin crear cuentas: `supabase_simulado.py`
responde a la API de Supabase con datos de ejemplo (los de Ana del prototipo) y guarda todo en memoria.

```bash
npm run build && npx vite preview --port 4174 &
pip install playwright pillow && python3 qa/flujo_balance.py 390 movil   # o 1280 escritorio
```

Las capturas quedan en `qa/capturas/` (ignorada por git).

## Recorrido completo en modo exploración

`recorrido_exploracion.py` recorre todas las áreas usando el modo exploración (sin red ni cuentas):
balance, presupuestos, salidas, metas, respaldo, estadísticas con descarga PNG/PDF, Aprende, Cuenta,
comentarios, privacidad y salida. Falla si aparece un error de consola o una petición a Supabase.

```bash
python3 qa/recorrido_exploracion.py 1280 escritorio        # claro
python3 qa/recorrido_exploracion.py 390 movil dark         # oscuro
```
