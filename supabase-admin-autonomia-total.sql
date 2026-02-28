-- Autonomia total do admin (faulaandre@gmail.com)
-- Rode no Supabase: SQL Editor
-- Cria perfil e membros se não existirem, depois garante admin com e-mail confirmado.

-- ========== 1) Criar tabelas se não existirem ==========
create table if not exists public.perfil (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null default 'membro' check (role in ('membro', 'admin')),
  aprovado boolean not null default false,
  rejeitado boolean not null default false,
  created_at timestamptz default now()
);

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

-- Função para admin (evita recursão nas políticas)
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.perfil where user_id = auth.uid() and role = 'admin');
$$;

-- Políticas perfil
drop policy if exists "Usuário vê e insere próprio perfil" on public.perfil;
create policy "Usuário vê e insere próprio perfil"
  on public.perfil for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admin vê e atualiza perfis" on public.perfil;
create policy "Admin vê e atualiza perfis"
  on public.perfil for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Políticas membros
drop policy if exists "Usuário insere próprio membro" on public.membros;
create policy "Usuário insere próprio membro"
  on public.membros for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Admin vê todos os membros" on public.membros;
create policy "Admin vê todos os membros"
  on public.membros for select to authenticated
  using (public.is_admin());

-- Trigger: novo usuário ganha perfil e membros
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== 2) Confirmar e-mail do admin ==========
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'faulaandre@gmail.com';

-- ========== 3) Perfil admin (role + aprovado) ==========
insert into public.perfil (user_id, role, aprovado, rejeitado)
select id, 'admin', true, false
from auth.users
where email = 'faulaandre@gmail.com'
on conflict (user_id) do update set
  role = 'admin',
  aprovado = true,
  rejeitado = false;

-- ========== 4) Admin na tabela membros ==========
insert into public.membros (user_id, nome, email)
select id, 'Administrador', email
from auth.users
where email = 'faulaandre@gmail.com'
on conflict (user_id) do update set
  nome = coalesce(membros.nome, excluded.nome),
  email = excluded.email;
