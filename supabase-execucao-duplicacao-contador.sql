-- Meta semanal de duplicação: contador de novos membros (permite clicar várias vezes)
-- Execute no Supabase: SQL Editor

alter table public.weekly_goals
  add column if not exists new_members_count integer not null default 0;

comment on column public.weekly_goals.new_members_count is 'Quantidade de novos membros trazidos na semana (clicável)';
