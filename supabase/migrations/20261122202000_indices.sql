-- Seivin · Etapa 2 · Índices sugeridos por el asesor de rendimiento de Supabase
create index on public.balance_lines (user_id);
create index on public.goal_movements (user_id);
