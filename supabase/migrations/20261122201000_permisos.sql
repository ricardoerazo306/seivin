-- Seivin · Etapa 2 · Permisos explícitos
-- El proyecto no concede permisos automáticos sobre tablas nuevas. Aquí se
-- conceden solo al rol "authenticated" y solo las operaciones necesarias.
-- RLS sigue limitando cada operación a las filas propias.

-- Perfil: solo lectura y edición de columnas de preferencias (no id, plan ni fechas).
grant select on public.profiles to authenticated;
grant update (display_name, country, currency, locale, theme, experience_mode, priority,
              income_stability, dependents, capsules_read, onboarding_completed)
  on public.profiles to authenticated;

grant select, insert, update, delete on
  public.categories,
  public.monthly_balances,
  public.recurring_items,
  public.balance_lines,
  public.goals,
  public.goal_movements,
  public.emergency_funds,
  public.emergency_movements,
  public.budgets,
  public.outing_habits,
  public.reports
to authenticated;

grant select, insert on public.feedback to authenticated;
grant select on public.balance_summaries to authenticated;
