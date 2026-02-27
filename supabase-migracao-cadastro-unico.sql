-- Migração: cadastro único (solicitar = já cadastrar com senha)
-- Rode no SQL Editor do Supabase SE você já tinha as tabelas antigas (perfil, membros, solicitacoes).

-- 1) Adicionar colunas em perfil
alter table public.perfil add column if not exists aprovado boolean not null default false;
alter table public.perfil add column if not exists rejeitado boolean not null default false;

-- 2) Marcar admin e membros já existentes como aprovados (para não bloquear ninguém)
update public.perfil set aprovado = true where role = 'admin';
update public.perfil set aprovado = true where role = 'membro';  -- quem já era membro continua aprovado

-- 3) Adicionar colunas em membros
alter table public.membros add column if not exists id_distribuidor text;
alter table public.membros add column if not exists mensagem text;

-- 4) Políticas para admin ver e atualizar todos os perfis (aprovado/rejeitado)
drop policy if exists "Admin vê e atualiza perfis" on public.perfil;
create policy "Admin vê e atualiza perfis"
  on public.perfil for all to authenticated
  using (exists (select 1 from public.perfil p where p.user_id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.perfil p where p.user_id = auth.uid() and p.role = 'admin'));

-- 5) Atualizar o trigger para preencher aprovado, rejeitado, id_distribuidor e mensagem
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfil (user_id, role, aprovado, rejeitado)
  values (
    new.id,
    case when new.email = 'faulaandre@gmail.com' then 'admin' else 'membro' end,
    case when new.email = 'faulaandre@gmail.com' then true else false end,
    false
  );
  insert into public.membros (user_id, nome, email, id_distribuidor, mensagem)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'id_distribuidor', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'mensagem', '')), '')
  );
  return new;
end;
$$ language plpgsql security definer;
