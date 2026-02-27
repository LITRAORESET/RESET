-- Corrige o erro "infinite recursion detected in policy for relation 'perfil'"
-- A política do admin lia a tabela perfil para saber se é admin, e isso disparava a mesma política de novo = loop.
-- Solução: função security definer que verifica se é admin (roda sem RLS, sem recursão).
-- Rode no Supabase: SQL Editor

-- 1) Função que retorna true se o usuário logado é admin (não causa recursão)
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

-- 2) Remover a política que causava a recursão
drop policy if exists "Admin vê e atualiza perfis" on public.perfil;

-- 3) Nova política usando a função (sem ler perfil dentro da política)
create policy "Admin vê e atualiza perfis"
  on public.perfil for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4) Política em membros também lia perfil; trocar para usar a função
drop policy if exists "Admin vê todos os membros" on public.membros;

create policy "Admin vê todos os membros"
  on public.membros for select
  to authenticated
  using (public.is_admin());
