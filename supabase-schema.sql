-- Execute este SQL no Supabase: SQL Editor (uma vez)
-- Cadastro único: a pessoa já se cadastra com senha em "Solicitar acesso"; você aprova ou rejeita no admin.

-- Perfil: role + se o membro já foi aprovado
create table if not exists public.perfil (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null default 'membro' check (role in ('membro', 'admin')),
  aprovado boolean not null default false,
  rejeitado boolean not null default false,
  created_at timestamptz default now()
);

-- Membros: dados exibidos no admin (nome, email, ID, mensagem)
create table if not exists public.membros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nome text,
  email text not null,
  id_distribuidor text,
  mensagem text,
  created_at timestamptz default now()
);

-- RLS
alter table public.perfil enable row level security;
alter table public.membros enable row level security;

-- Perfil: usuário lê/atualiza só o próprio (para ver aprovado/rejeitado)
create policy "Usuário vê e insere próprio perfil"
  on public.perfil for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Função para evitar recursão: admin verifica sem reler perfil na política
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.perfil where user_id = auth.uid() and role = 'admin');
$$;

-- Admin pode ver todos os perfis e atualizar aprovado/rejeitado (usa função, sem recursão)
create policy "Admin vê e atualiza perfis"
  on public.perfil for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Membros: trigger insere; só admin pode listar
create policy "Usuário insere próprio membro"
  on public.membros for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Admin vê todos os membros"
  on public.membros for select
  to authenticated
  using (public.is_admin());

-- Trigger: ao criar usuário, criar perfil e membros (admin já aprovado; membro aguardando)
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

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Se a tabela perfil/membros já existir sem as colunas novas, rode:
-- alter table public.perfil add column if not exists aprovado boolean not null default false;
-- alter table public.perfil add column if not exists rejeitado boolean not null default false;
-- alter table public.membros add column if not exists id_distribuidor text;
-- alter table public.membros add column if not exists mensagem text;
-- Para perfis já existentes (admin e membros já aprovados): update public.perfil set aprovado = true where role = 'admin' or created_at < now();
