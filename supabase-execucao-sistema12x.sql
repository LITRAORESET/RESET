-- Sistema 12X – Execução Diária + Streak + Pontuação + Líder + Duplicação semanal
-- Execute no Supabase: SQL Editor (após o schema base e perfil/membros)

-- 1) Permite role 'leader' em perfil e adiciona leader_id
alter table public.perfil
  drop constraint if exists perfil_role_check;
alter table public.perfil
  add constraint perfil_role_check check (role in ('membro', 'leader', 'admin'));

alter table public.perfil
  add column if not exists leader_id uuid references auth.users(id) on delete set null;

-- 2) Tabela de execução diária (1 registro por usuário por dia)
create table if not exists public.execution_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  contacts_done boolean not null default false,
  followups_done boolean not null default false,
  stories_done boolean not null default false,
  official_question_done boolean not null default false,
  presentation_invite_done boolean not null default false,
  health_training_invite_done boolean not null default false,
  status text not null default 'partial' check (status in ('complete', 'partial')),
  points_earned integer not null default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- 3) Meta semanal: 1 novo membro por semana
create table if not exists public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  year smallint not null,
  week_number smallint not null,
  brought_new_member boolean not null default false,
  created_at timestamptz default now(),
  unique(user_id, year, week_number)
);

-- Índices
create index if not exists idx_execution_logs_user_date on public.execution_logs(user_id, date desc);
create index if not exists idx_execution_logs_date on public.execution_logs(date);
create index if not exists idx_weekly_goals_user on public.weekly_goals(user_id, year, week_number);

-- RLS execution_logs
alter table public.execution_logs enable row level security;

drop policy if exists "Usuário vê próprio execution_logs" on public.execution_logs;
create policy "Usuário vê próprio execution_logs"
  on public.execution_logs for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Usuário insere próprio execution_logs" on public.execution_logs;
create policy "Usuário insere próprio execution_logs"
  on public.execution_logs for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Usuário atualiza próprio execution_logs" on public.execution_logs;
create policy "Usuário atualiza próprio execution_logs"
  on public.execution_logs for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admin e leader veem execution_logs" on public.execution_logs;
create policy "Admin e leader veem execution_logs"
  on public.execution_logs for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.perfil p where p.user_id = auth.uid() and p.role in ('admin', 'leader'))
  );

-- RLS weekly_goals
alter table public.weekly_goals enable row level security;

drop policy if exists "Usuário vê próprio weekly_goals" on public.weekly_goals;
create policy "Usuário vê próprio weekly_goals"
  on public.weekly_goals for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Usuário insere/atualiza próprio weekly_goals" on public.weekly_goals;
create policy "Usuário insere/atualiza próprio weekly_goals"
  on public.weekly_goals for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admin e leader veem weekly_goals" on public.weekly_goals;
create policy "Admin e leader veem weekly_goals"
  on public.weekly_goals for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.perfil p where p.user_id = auth.uid() and p.role in ('admin', 'leader'))
  );

-- Comentário para referência
comment on table public.execution_logs is 'Sistema 12X: registro diário de execução (10 contatos, acompanhamento, etc.)';
comment on table public.weekly_goals is 'Meta semanal: 1 novo membro por semana por pessoa';

-- Líder vê apenas perfis da própria equipe (leader_id = eu)
drop policy if exists "Leader vê equipe em perfil" on public.perfil;
create policy "Leader vê equipe em perfil"
  on public.perfil for select to authenticated
  using (
    exists (select 1 from public.perfil p where p.user_id = auth.uid() and p.role = 'leader')
    and leader_id = auth.uid()
  );

-- Qualquer usuário pode ver perfis onde ele é o líder (para validar meta semanal: "trouxe 1 novo")
drop policy if exists "Usuário vê perfis onde é líder" on public.perfil;
create policy "Usuário vê perfis onde é líder"
  on public.perfil for select to authenticated
  using (leader_id = auth.uid());
