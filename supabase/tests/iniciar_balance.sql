-- Prueba de start_balance (etapa 4). Deshace todo al final con una excepción a propósito.
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  cat_viv uuid; cat_sal uuid; cat_arch uuid;
  oct uuid; nov uuid; nov2 uuid; dic uuid; b_bal uuid;
  n int; ok int := 0; fallas text := '';
begin
  insert into auth.users (id, email, aud, role)
  values (a, 'balance-a@seivin.test', 'authenticated', 'authenticated'),
         (b, 'balance-b@seivin.test', 'authenticated', 'authenticated');
  select id into cat_viv from public.categories where user_id = a and name = 'Vivienda';
  select id into cat_sal from public.categories where user_id = a and name = 'Salario';
  select id into cat_arch from public.categories where user_id = a and name = 'Suscripciones';

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);

  -- 1. Sin balance anterior: parte de los fijos (quincenal x2, anual /12)
  insert into public.recurring_items (kind, category_id, name, amount, frequency)
    values ('ingreso', cat_sal, 'Salario', 1400000, 'quincenal'), ('gasto', cat_arch, 'Antivirus', 120000, 'anual');
  oct := public.start_balance('2026-10-01');
  select count(*) into n from public.balance_lines where balance_id = oct and ((name = 'Salario' and amount = 2800000) or (name = 'Antivirus' and amount = 10000 and expense_type = 'fijo'));
  if n = 2 then ok := ok + 1; else fallas := fallas || ' [desde fijos=' || n || ']'; end if;

  -- 2. Con balance anterior: copia sus líneas y omite categorías archivadas
  insert into public.balance_lines (balance_id, kind, category_id, name, amount, expense_type) values (oct, 'gasto', cat_viv, 'Arriendo', 950000, 'fijo');
  update public.categories set archived = true where id = cat_arch;
  nov := public.start_balance('2026-11-01');
  select count(*) into n from public.balance_lines where balance_id = nov;
  if n = 2 then ok := ok + 1; else fallas := fallas || ' [copia=' || n || ']'; end if;

  -- 3. Llamarla de nuevo devuelve el mismo balance sin duplicar
  nov2 := public.start_balance('2026-11-01');
  select count(*) into n from public.balance_lines where balance_id = nov;
  if nov2 = nov and n = 2 then ok := ok + 1; else fallas := fallas || ' [idempotente]'; end if;

  -- 4. Rechaza días distintos de 1 y meses muy lejanos
  begin perform public.start_balance('2026-11-15'); fallas := fallas || ' [dia]'; exception when others then ok := ok + 1; end;
  begin perform public.start_balance('2030-01-01'); fallas := fallas || ' [futuro]'; exception when others then ok := ok + 1; end;

  -- 5. B no ve ni copia nada de A
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  b_bal := public.start_balance('2026-11-01');
  select count(*) into n from public.balance_lines where balance_id = b_bal;
  if n = 0 and b_bal <> nov then ok := ok + 1; else fallas := fallas || ' [aislamiento=' || n || ']'; end if;
  select count(*) into n from public.monthly_balances;
  if n = 1 then ok := ok + 1; else fallas := fallas || ' [B ve ' || n || ' balances]'; end if;

  -- 6. Sin sesión (anon) no puede ejecutarla
  perform set_config('role', 'anon', true);
  begin perform public.start_balance('2026-12-01'); fallas := fallas || ' [anon]'; exception when insufficient_privilege then ok := ok + 1; end;

  raise exception 'RESULTADO % de 8 correctas.%', ok, fallas;
end $$;
