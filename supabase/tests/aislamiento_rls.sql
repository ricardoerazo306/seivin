-- Prueba de aislamiento entre cuentas (etapa 2).
-- Crea dos usuarios, actúa como cada uno con el rol "authenticated" y verifica
-- que ninguno pueda leer, modificar, borrar ni enlazar datos del otro.
-- Al final lanza una excepción a propósito para deshacer TODO: no deja datos.
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  bal_a uuid;
  cat_a uuid;
  cat_b uuid;
  goal_a uuid;
  n int;
  ok int := 0;
  fallas text := '';

  procedure_dummy int;
begin
  -- 1. Alta de usuarios: el disparador crea perfil, categorías, fondo y hábitos
  insert into auth.users (id, email, raw_user_meta_data, aud, role)
  values (a, 'prueba-a@seivin.test', '{"full_name":"Ana Prueba"}', 'authenticated', 'authenticated'),
         (b, 'prueba-b@seivin.test', '{}', 'authenticated', 'authenticated');

  select count(*) into n from public.categories where user_id = a;
  if n = 16 then ok := ok + 1; else fallas := fallas || ' [categorias=' || n || ']'; end if;
  select count(*) into n from public.profiles where id = a and display_name = 'Ana Prueba';
  if n = 1 then ok := ok + 1; else fallas := fallas || ' [perfil]'; end if;
  select count(*) into n from public.emergency_funds where user_id = a;
  select n + count(*) into n from public.outing_habits where user_id = a;
  if n = 2 then ok := ok + 1; else fallas := fallas || ' [fondo/salidas]'; end if;

  select id into cat_a from public.categories where user_id = a and name = 'Vivienda';
  select id into cat_b from public.categories where user_id = b and name = 'Vivienda';

  -- 2. Como A: crear balance, línea, meta y comentario propios
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  insert into public.monthly_balances (period) values ('2026-11-01') returning id into bal_a;
  insert into public.balance_lines (balance_id, kind, category_id, name, amount, expense_type)
    values (bal_a, 'gasto', cat_a, 'Arriendo', 950000, 'fijo');
  insert into public.goals (name, target_amount) values ('Viaje', 2400000) returning id into goal_a;
  insert into public.feedback (screen, message) values ('inicio', 'Me gusta');
  select count(*) into n from public.balance_summaries where balance_id = bal_a and expense_total = 950000 and essential_total = 950000;
  if n = 1 then ok := ok + 1; else fallas := fallas || ' [resumen]'; end if;
  -- A no puede cambiar su propio plan desde la app
  begin
    update public.profiles set plan = 'gratuito' where id = a;
    fallas := fallas || ' [A cambió su plan]';
  exception when insufficient_privilege then ok := ok + 1;
  end;

  -- 3. Como B: no ve nada de A
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  select count(*) into n from public.monthly_balances where user_id = a;
  select n + count(*) into n from public.balance_lines where user_id = a;
  select n + count(*) into n from public.goals where user_id = a;
  select n + count(*) into n from public.feedback where user_id = a;
  select n + count(*) into n from public.profiles where id = a;
  select n + count(*) into n from public.categories where user_id = a;
  select n + count(*) into n from public.balance_summaries where user_id = a;
  if n = 0 then ok := ok + 1; else fallas := fallas || ' [B ve ' || n || ' filas de A]'; end if;

  -- B no puede modificar ni borrar lo de A (0 filas afectadas)
  update public.monthly_balances set note = 'hackeado' where id = bal_a;
  get diagnostics n = row_count;
  delete from public.goals where id = goal_a;
  get diagnostics procedure_dummy = row_count;
  n := n + procedure_dummy;
  update public.profiles set display_name = 'hackeado' where id = a;
  get diagnostics procedure_dummy = row_count;
  n := n + procedure_dummy;
  if n = 0 then ok := ok + 1; else fallas := fallas || ' [B modificó ' || n || ' filas de A]'; end if;

  -- B no puede escribir filas a nombre de A
  begin
    insert into public.goals (user_id, name, target_amount) values (a, 'Falsa', 1);
    fallas := fallas || ' [B insertó a nombre de A]';
  exception when insufficient_privilege then ok := ok + 1;
  end;

  -- B no puede enlazar su línea al balance de A (llave compuesta)
  begin
    insert into public.balance_lines (balance_id, kind, category_id, name, amount)
      values (bal_a, 'gasto', cat_b, 'Intruso', 1);
    fallas := fallas || ' [B enlazó línea al balance de A]';
  exception when foreign_key_violation then ok := ok + 1;
  end;

  -- B no puede usar categorías de A
  begin
    insert into public.monthly_balances (period) values ('2026-11-01');
    insert into public.balance_lines (balance_id, kind, category_id, name, amount)
      select id, 'gasto', cat_a, 'Intruso', 1 from public.monthly_balances where user_id = b;
    fallas := fallas || ' [B usó categoría de A]';
  exception when foreign_key_violation then ok := ok + 1;
  end;

  -- 4. Restricciones: valores negativos y retiro sin motivo
  begin
    insert into public.goals (name, target_amount) values ('Negativa', -5);
    fallas := fallas || ' [aceptó negativo]';
  exception when check_violation then ok := ok + 1;
  end;
  begin
    insert into public.emergency_movements (kind, amount) values ('retiro', 1000);
    fallas := fallas || ' [retiro sin motivo]';
  exception when check_violation then ok := ok + 1;
  end;

  -- 5. Sin sesión (anon) no se puede leer nada
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin
    select count(*) into n from public.categories;
    fallas := fallas || ' [anon leyó categorías]';
  exception when insufficient_privilege then ok := ok + 1;
  end;
  begin
    perform public.delete_my_account();
    fallas := fallas || ' [anon ejecutó delete_my_account]';
  exception when insufficient_privilege then ok := ok + 1;
  end;

  -- 6. Eliminar cuenta: B se borra a sí mismo y sus datos; A queda intacto
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform public.delete_my_account();
  perform set_config('role', 'postgres', true);
  select count(*) into n from auth.users where id = b;
  select n + count(*) into n from public.categories where user_id = b;
  select n + count(*) into n from public.monthly_balances where user_id = b;
  if n = 0 then ok := ok + 1; else fallas := fallas || ' [quedaron ' || n || ' filas de B]'; end if;
  select count(*) into n from public.balance_lines where user_id = a;
  if n = 1 then ok := ok + 1; else fallas := fallas || ' [A perdió datos]'; end if;

  raise exception 'RESULTADO: % pruebas correctas de 16.%', ok,
    case when fallas = '' then ' Sin fallas.' else ' Fallas:' || fallas end;
end;
$$;
