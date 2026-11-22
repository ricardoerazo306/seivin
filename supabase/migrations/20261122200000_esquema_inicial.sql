-- Seivin · Etapa 2 · Esquema inicial
-- 13 tablas. Cada fila pertenece a una cuenta y las políticas RLS impiden
-- leer o modificar filas ajenas. Las relaciones entre tablas usan llaves
-- compuestas (id, user_id) para que nadie pueda enlazar datos de otra persona.

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfil
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  country text not null default 'CO' check (country ~ '^[A-Z]{2}$'),
  currency text not null default 'COP' check (currency ~ '^[A-Z]{3}$'),
  locale text not null default 'es-CO' check (char_length(locale) between 2 and 10),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  experience_mode text not null default 'inicial' check (experience_mode in ('inicial', 'intermedio', 'avanzado')),
  priority text check (priority in ('organizar', 'ahorrar', 'respaldo', 'deudas')),
  income_stability text check (income_stability in ('estable', 'variable')),
  dependents smallint not null default 0 check (dependents between 0 and 20),
  capsules_read text[] not null default '{}',
  onboarding_completed boolean not null default false,
  plan text not null default 'gratuito' check (plan in ('gratuito')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Categorías
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  kind text not null check (kind in ('ingreso', 'gasto')),
  is_essential boolean not null default false,
  icon text check (char_length(icon) <= 40),
  color text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  is_system boolean not null default false,
  archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, kind, name)
);

-- ---------------------------------------------------------------------------
-- Balance mensual
-- ---------------------------------------------------------------------------

create table public.monthly_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  period date not null check (extract(day from period) = 1),
  status text not null default 'borrador' check (status in ('borrador', 'cerrado')),
  closed_at timestamptz,
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, period),
  check ((status = 'cerrado') = (closed_at is not null))
);

create table public.recurring_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('ingreso', 'gasto')),
  category_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  amount numeric(14, 2) not null check (amount > 0),
  frequency text not null default 'mensual'
    check (frequency in ('semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual')),
  payment_day smallint check (payment_day between 1 and 31),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete restrict
);

create table public.balance_lines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  balance_id uuid not null,
  kind text not null check (kind in ('ingreso', 'gasto')),
  category_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  amount numeric(14, 2) not null check (amount > 0),
  expense_type text check (expense_type in ('fijo', 'variable', 'ocasional')),
  line_date date,
  description text check (char_length(description) <= 300),
  recurring_item_id uuid references public.recurring_items (id) on delete set null,
  source text not null default 'manual' check (source in ('manual', 'importado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (balance_id, user_id) references public.monthly_balances (id, user_id) on delete cascade,
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete restrict,
  check (kind = 'gasto' or expense_type is null)
);

-- ---------------------------------------------------------------------------
-- Metas de ahorro
-- ---------------------------------------------------------------------------

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  reason text check (char_length(reason) <= 300),
  target_amount numeric(14, 2) not null check (target_amount > 0),
  initial_saved numeric(14, 2) not null default 0 check (initial_saved >= 0),
  deadline date,
  flexible_date boolean not null default false,
  priority text not null default 'media' check (priority in ('alta', 'media', 'baja')),
  planned_monthly numeric(14, 2) check (planned_monthly >= 0),
  status text not null default 'activa' check (status in ('activa', 'cumplida', 'archivada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.goal_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  goal_id uuid not null,
  kind text not null check (kind in ('aporte', 'retiro')),
  amount numeric(14, 2) not null check (amount > 0),
  movement_date date not null default current_date,
  note text check (char_length(note) <= 200),
  balance_id uuid references public.monthly_balances (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (goal_id, user_id) references public.goals (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Fondo de emergencia (respaldo para imprevistos)
-- ---------------------------------------------------------------------------

create table public.emergency_funds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  essential_monthly_override numeric(14, 2) check (essential_monthly_override > 0),
  target_months numeric(4, 1) not null default 3 check (target_months between 1 and 12),
  initial_saved numeric(14, 2) not null default 0 check (initial_saved >= 0),
  planned_monthly numeric(14, 2) check (planned_monthly >= 0),
  has_major_debts boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.emergency_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('aporte', 'retiro')),
  amount numeric(14, 2) not null check (amount > 0),
  movement_date date not null default current_date,
  reason text check (char_length(reason) <= 200),
  note text check (char_length(note) <= 200),
  balance_id uuid references public.monthly_balances (id) on delete set null,
  created_at timestamptz not null default now(),
  check (kind = 'aporte' or char_length(btrim(coalesce(reason, ''))) > 0)
);

-- ---------------------------------------------------------------------------
-- Presupuestos, salidas, reportes y comentarios
-- ---------------------------------------------------------------------------

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid not null,
  amount numeric(14, 2) not null check (amount > 0),
  month_from date not null check (extract(day from month_from) = 1),
  month_to date check (extract(day from month_to) = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete cascade,
  check (month_to is null or month_to >= month_from)
);

create table public.outing_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  per_month numeric(4, 1) not null default 0 check (per_month between 0 and 60),
  transport numeric(14, 2) not null default 0 check (transport >= 0),
  food numeric(14, 2) not null default 0 check (food >= 0),
  drinks numeric(14, 2) not null default 0 check (drinks >= 0),
  other numeric(14, 2) not null default 0 check (other >= 0),
  scenarios jsonb not null default '{}'::jsonb check (jsonb_typeof(scenarios) = 'object'),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('png', 'pdf')),
  section text not null check (char_length(section) <= 60),
  period_from date not null,
  period_to date not null,
  created_at timestamptz not null default now(),
  check (period_to >= period_from)
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  screen text check (char_length(screen) <= 80),
  message text not null check (char_length(btrim(message)) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Índices para las consultas por usuario y por relación
-- ---------------------------------------------------------------------------

create index on public.categories (user_id);
create index on public.monthly_balances (user_id, period desc);
create index on public.recurring_items (user_id);
create index on public.recurring_items (category_id, user_id);
create index on public.balance_lines (balance_id, user_id);
create index on public.balance_lines (category_id, user_id);
create index on public.balance_lines (recurring_item_id);
create index on public.goals (user_id);
create index on public.goal_movements (goal_id, user_id);
create index on public.goal_movements (balance_id);
create index on public.emergency_movements (user_id, movement_date desc);
create index on public.emergency_movements (balance_id);
create index on public.budgets (category_id, user_id);
create index on public.budgets (user_id);
create index on public.reports (user_id);
create index on public.feedback (user_id);

-- ---------------------------------------------------------------------------
-- Marcas de actualización
-- ---------------------------------------------------------------------------

create trigger set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.monthly_balances for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.recurring_items for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.balance_lines for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.goals for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.emergency_funds for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.budgets for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.outing_habits for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seguridad a nivel de fila
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.monthly_balances enable row level security;
alter table public.recurring_items enable row level security;
alter table public.balance_lines enable row level security;
alter table public.goals enable row level security;
alter table public.goal_movements enable row level security;
alter table public.emergency_funds enable row level security;
alter table public.emergency_movements enable row level security;
alter table public.budgets enable row level security;
alter table public.outing_habits enable row level security;
alter table public.reports enable row level security;
alter table public.feedback enable row level security;

-- Nada es accesible sin sesión.
revoke all on all tables in schema public from anon;

-- Perfil: se crea solo con el registro; cada quien ve y edita el suyo.
create policy "ver mi perfil" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "editar mi perfil" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Tablas con dueño: todas las operaciones solo sobre filas propias.
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'monthly_balances', 'recurring_items', 'goals',
    'emergency_funds', 'budgets', 'outing_habits', 'reports'
  ]
  loop
    execute format(
      'create policy "solo mis filas" on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end;
$$;

-- Líneas del balance: además, el compromiso de origen debe ser propio.
create policy "solo mis lineas" on public.balance_lines for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (recurring_item_id is null or exists (
      select 1 from public.recurring_items r
      where r.id = recurring_item_id and r.user_id = (select auth.uid())))
  );

-- Movimientos de metas y fondo: el balance asociado (si hay) debe ser propio.
create policy "solo mis aportes de metas" on public.goal_movements for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (balance_id is null or exists (
      select 1 from public.monthly_balances b
      where b.id = balance_id and b.user_id = (select auth.uid())))
  );

create policy "solo mis aportes del fondo" on public.emergency_movements for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (balance_id is null or exists (
      select 1 from public.monthly_balances b
      where b.id = balance_id and b.user_id = (select auth.uid())))
  );

-- Comentarios: se crean y se leen los propios; no se editan ni se borran.
create policy "enviar comentario" on public.feedback for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "ver mis comentarios" on public.feedback for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Alta de usuario: perfil, 16 categorías, fondo y hábitos de salida
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 80), '')
  );

  insert into public.categories (user_id, name, kind, is_essential, is_system, sort_order)
  values
    (new.id, 'Salario', 'ingreso', false, true, 1),
    (new.id, 'Negocios', 'ingreso', false, true, 2),
    (new.id, 'Trabajos adicionales', 'ingreso', false, true, 3),
    (new.id, 'Otros ingresos', 'ingreso', false, true, 4),
    (new.id, 'Vivienda', 'gasto', true, true, 1),
    (new.id, 'Alimentación', 'gasto', true, true, 2),
    (new.id, 'Transporte', 'gasto', true, true, 3),
    (new.id, 'Servicios', 'gasto', true, true, 4),
    (new.id, 'Educación', 'gasto', true, true, 5),
    (new.id, 'Salud', 'gasto', true, true, 6),
    (new.id, 'Deudas', 'gasto', true, true, 7),
    (new.id, 'Compras', 'gasto', false, true, 8),
    (new.id, 'Entretenimiento', 'gasto', false, true, 9),
    (new.id, 'Salidas', 'gasto', false, true, 10),
    (new.id, 'Suscripciones', 'gasto', false, true, 11),
    (new.id, 'Otros', 'gasto', false, true, 12);

  insert into public.emergency_funds (user_id) values (new.id);
  insert into public.outing_habits (user_id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Resúmenes por balance (respetan RLS: security_invoker)
-- ---------------------------------------------------------------------------

create view public.balance_summaries
with (security_invoker = true) as
select
  b.id as balance_id,
  b.user_id,
  b.period,
  b.status,
  coalesce(sum(l.amount) filter (where l.kind = 'ingreso'), 0)::numeric(14, 2) as income_total,
  coalesce(sum(l.amount) filter (where l.kind = 'gasto'), 0)::numeric(14, 2) as expense_total,
  coalesce(sum(l.amount) filter (where l.kind = 'gasto' and c.is_essential), 0)::numeric(14, 2) as essential_total,
  (coalesce(sum(l.amount) filter (where l.kind = 'ingreso'), 0)
    - coalesce(sum(l.amount) filter (where l.kind = 'gasto'), 0))::numeric(14, 2) as left_total
from public.monthly_balances b
left join public.balance_lines l on l.balance_id = b.id and l.user_id = b.user_id
left join public.categories c on c.id = l.category_id and c.user_id = l.user_id
group by b.id, b.user_id, b.period, b.status;

revoke all on public.balance_summaries from anon;

-- ---------------------------------------------------------------------------
-- Eliminar mi cuenta: borra el usuario y, en cascada, todos sus datos
-- ---------------------------------------------------------------------------

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No hay una sesión activa.' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
