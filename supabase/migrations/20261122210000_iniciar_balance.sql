-- Etapa 4 · Abre (o devuelve) el balance de un mes copiando las líneas del balance anterior.
-- Si no hay balance anterior, parte de los movimientos fijos activos (equivalente mensual).
-- SECURITY INVOKER: corre con los permisos y las políticas RLS de quien la llama.

create or replace function public.start_balance(p_period date)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
  v_prev uuid;
begin
  if v_uid is null then
    raise exception 'Necesitas iniciar sesión.' using errcode = '28000';
  end if;
  if p_period is null or extract(day from p_period) <> 1 then
    raise exception 'El período debe ser el primer día del mes.' using errcode = '22023';
  end if;
  if p_period > (date_trunc('month', now()) + interval '1 month')::date then
    raise exception 'Solo puedes abrir hasta el mes siguiente.' using errcode = '22023';
  end if;

  select id into v_id from public.monthly_balances where user_id = v_uid and period = p_period;
  if v_id is not null then
    return v_id;
  end if;

  insert into public.monthly_balances (period) values (p_period) returning id into v_id;

  select id into v_prev
  from public.monthly_balances
  where user_id = v_uid and period < p_period
  order by period desc
  limit 1;

  if v_prev is not null then
    insert into public.balance_lines (balance_id, kind, category_id, name, amount, expense_type, recurring_item_id)
    select v_id, l.kind, l.category_id, l.name, l.amount, l.expense_type, l.recurring_item_id
    from public.balance_lines l
    join public.categories c on c.id = l.category_id and c.user_id = l.user_id
    where l.balance_id = v_prev and l.user_id = v_uid and not c.archived
    order by l.created_at;
  else
    insert into public.balance_lines (balance_id, kind, category_id, name, amount, expense_type, recurring_item_id)
    select v_id, r.kind, r.category_id, r.name,
      round(r.amount * case r.frequency
        when 'semanal' then 52.0 / 12 when 'quincenal' then 2 when 'mensual' then 1
        when 'bimestral' then 0.5 when 'trimestral' then 1.0 / 3 when 'semestral' then 1.0 / 6
        else 1.0 / 12 end),
      case when r.kind = 'gasto' then 'fijo' end, r.id
    from public.recurring_items r
    join public.categories c on c.id = r.category_id and c.user_id = r.user_id
    where r.user_id = v_uid and r.active and not c.archived;
  end if;

  return v_id;
end;
$$;

revoke all on function public.start_balance(date) from public, anon;
grant execute on function public.start_balance(date) to authenticated;
