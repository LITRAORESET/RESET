-- Clube Ouro + Elite do Mês
-- Execute no Supabase: SQL Editor (após schema base, perfil/membros e execucao-sistema12x)

-- 1) Declaração semanal: sacolas + novos distribuidores (usuário preenche; admin valida)
create table if not exists public.clube_ouro_declaracao (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  year smallint not null,
  week_number smallint not null,
  total_sacolas smallint not null default 0,
  novos_distribuidores smallint not null default 0,
  validado_admin boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, year, week_number)
);

comment on table public.clube_ouro_declaracao is 'Declaração semanal para Clube Ouro: sacolas vendidas e novos distribuidores. Só conta quando validado_admin = true.';

create index if not exists idx_clube_ouro_declaracao_user on public.clube_ouro_declaracao(user_id, year, week_number);
create index if not exists idx_clube_ouro_declaracao_week on public.clube_ouro_declaracao(year, week_number);
create index if not exists idx_clube_ouro_declaracao_validado on public.clube_ouro_declaracao(validado_admin) where validado_admin = false;

-- 2) Histórico Elite do Mês (registro quando atinge 4 semanas Clube Ouro no mês)
create table if not exists public.elite_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  mes smallint not null,
  ano smallint not null,
  total_sacolas_mes int not null default 0,
  total_recrutamentos_mes int not null default 0,
  semanas_qualificadas smallint not null default 4,
  data_conquista date not null default current_date,
  created_at timestamptz default now(),
  unique(user_id, ano, mes)
);

comment on table public.elite_history is 'Reconhecimento Elite do Mês: 4 semanas Clube Ouro no mesmo mês. Consulta no painel admin.';

create index if not exists idx_elite_history_user on public.elite_history(user_id);
create index if not exists idx_elite_history_ano_mes on public.elite_history(ano, mes);

-- RLS clube_ouro_declaracao
alter table public.clube_ouro_declaracao enable row level security;

drop policy if exists "Usuário vê própria declaração" on public.clube_ouro_declaracao;
create policy "Usuário vê própria declaração"
  on public.clube_ouro_declaracao for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Usuário insere/atualiza própria declaração" on public.clube_ouro_declaracao;
create policy "Usuário insere/atualiza própria declaração"
  on public.clube_ouro_declaracao for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admin vê e atualiza declarações" on public.clube_ouro_declaracao;
create policy "Admin vê e atualiza declarações"
  on public.clube_ouro_declaracao for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- RLS elite_history
alter table public.elite_history enable row level security;

drop policy if exists "Usuário vê próprio elite_history" on public.elite_history;
create policy "Usuário vê próprio elite_history"
  on public.elite_history for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Admin vê e insere elite_history" on public.elite_history;
create policy "Admin vê e insere elite_history"
  on public.elite_history for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Trigger updated_at em declaração
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clube_ouro_declaracao_updated_at on public.clube_ouro_declaracao;
create trigger clube_ouro_declaracao_updated_at
  before update on public.clube_ouro_declaracao
  for each row execute function public.set_updated_at();
