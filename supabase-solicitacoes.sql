-- Execute este SQL no Supabase (SQL Editor) SE você já rodou supabase-schema.sql antes
-- e não tem a tabela de solicitações. Caso contrário, o supabase-schema.sql já inclui isso.

-- Tabela de solicitações de acesso
create table if not exists public.solicitacoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  id_distribuidor text,
  mensagem text,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.solicitacoes enable row level security;

create policy "Anon pode solicitar acesso"
  on public.solicitacoes for insert to anon with check (true);

create policy "Admin vê e atualiza solicitações"
  on public.solicitacoes for all to authenticated
  using (exists (select 1 from public.perfil where perfil.user_id = auth.uid() and perfil.role = 'admin'))
  with check (exists (select 1 from public.perfil where perfil.user_id = auth.uid() and perfil.role = 'admin'));

create or replace function public.check_email_aprovado(p_email text)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.solicitacoes
    where email = lower(trim(p_email)) and status = 'aprovado'
  );
$$;

grant execute on function public.check_email_aprovado(text) to anon;
grant execute on function public.check_email_aprovado(text) to authenticated;

-- Se a tabela solicitacoes já existir sem a coluna ID, rode apenas:
-- alter table public.solicitacoes add column if not exists id_distribuidor text;
