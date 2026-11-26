-- Latido diario: una consulta mínima que mantiene activo el proyecto gratuito de Supabase
-- (los proyectos gratuitos se pausan tras 7 días sin actividad). No lee ni escribe datos.
create or replace function public.ping()
returns text
language sql
stable
security invoker
set search_path = ''
as $$ select 'ok'::text $$;

revoke all on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;
