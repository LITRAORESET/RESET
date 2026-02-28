-- Corrige "infinite recursion detected in policy for relation 'perfil'"
-- Rode no Supabase: SQL Editor (produção e qualquer ambiente)
-- Políticas que leem perfil dentro da própria política causam loop; usamos funções SECURITY DEFINER.

-- 1) Função admin (lê perfil sem RLS = sem recursão)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfil
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- 2) Função leader (para políticas que checam "é líder" sem causar recursão)
create or replace function public.is_leader()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfil
    where user_id = auth.uid() and role = 'leader'
  );
$$;

-- 3) Políticas na tabela perfil (só funções, nunca SELECT em perfil dentro da política)
drop policy if exists "Admin vê e atualiza perfis" on public.perfil;
create policy "Admin vê e atualiza perfis"
  on public.perfil for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Leader vê apenas linhas onde leader_id = eu (só se a coluna leader_id existir)
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'perfil' and column_name = 'leader_id') then
    execute 'drop policy if exists "Leader vê equipe em perfil" on public.perfil';
    execute 'create policy "Leader vê equipe em perfil" on public.perfil for select to authenticated using (public.is_leader() and leader_id = auth.uid())';
  end if;
end $$;

-- 4) Política em membros
drop policy if exists "Admin vê todos os membros" on public.membros;
create policy "Admin vê todos os membros"
  on public.membros for select to authenticated
  using (public.is_admin());

-- 5) Política em solicitacoes (se a tabela existir)
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'solicitacoes') then
    execute 'drop policy if exists "Admin vê e atualiza solicitações" on public.solicitacoes';
    execute 'create policy "Admin vê e atualiza solicitações" on public.solicitacoes for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
end $$;

-- 6) execution_logs e weekly_goals: usar só is_admin() e is_leader(), sem SELECT em perfil na política
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'execution_logs') then
    execute 'drop policy if exists "Admin e leader veem execution_logs" on public.execution_logs';
    execute 'create policy "Admin e leader veem execution_logs" on public.execution_logs for select to authenticated using (public.is_admin() or public.is_leader())';
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'weekly_goals') then
    execute 'drop policy if exists "Admin e leader veem weekly_goals" on public.weekly_goals';
    execute 'create policy "Admin e leader veem weekly_goals" on public.weekly_goals for select to authenticated using (public.is_admin() or public.is_leader())';
  end if;
end $$;
