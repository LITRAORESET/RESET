-- Área de configurações do membro: poder ver/atualizar próprio nome e telefone
-- Rode no Supabase: SQL Editor

-- 1) Coluna telefone em membros
alter table public.membros add column if not exists telefone text;

-- 2) Usuário pode ver e atualizar o próprio registro em membros (para a página "Configurações")
drop policy if exists "Usuário vê próprio membro" on public.membros;
create policy "Usuário vê próprio membro"
  on public.membros for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Usuário atualiza próprio membro" on public.membros;
create policy "Usuário atualiza próprio membro"
  on public.membros for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
