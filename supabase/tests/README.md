# Pruebas de la base de datos

`aislamiento_rls.sql` comprueba en 16 pasos que ninguna cuenta pueda leer, modificar, borrar ni
enlazar datos de otra; que se rechacen valores negativos y retiros sin motivo; que sin sesión no se
pueda leer nada, y que "eliminar mi cuenta" borre todo lo de esa persona y nada más.

Se ejecuta en el editor SQL de Supabase. Termina con un error a propósito
(`RESULTADO: 16 pruebas correctas de 16. Sin fallas.`) para deshacer todo y no dejar datos.

Última ejecución: 22 nov 2026 · 16 de 16 correctas.
