-- Link de indicação único por membro
-- Execute no Supabase após o schema base e execucao-sistema12x (perfil com leader_id).

-- 1) Código único de indicação no perfil
alter table public.perfil
  add column if not exists referral_code text unique;

create index if not exists idx_perfil_referral_code on public.perfil(referral_code) where referral_code is not null;

-- 2) Função pública: dado o código (ref da URL), retorna user_id e nome do indicador (para página de cadastro)
create or replace function public.get_referrer_info(ref_code text)
returns table (referrer_user_id uuid, referrer_nome text)
language sql security definer set search_path = public stable as $$
  select p.user_id, coalesce(m.nome, 'Indicador')::text
  from public.perfil p
  left join public.membros m on m.user_id = p.user_id
  where p.referral_code = ref_code and ref_code is not null and length(trim(ref_code)) > 0
  limit 1;
$$;

-- Anon e authenticated podem chamar (página de solicitar é anon)
grant execute on function public.get_referrer_info(text) to anon;
grant execute on function public.get_referrer_info(text) to authenticated;

-- 3) Trigger: ao criar usuário, definir leader_id = quem indicou (referred_by no metadata)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  ref_uid uuid;
begin
  ref_uid := nullif(trim(coalesce(new.raw_user_meta_data->>'referred_by', '')), '')::uuid;

  insert into public.perfil (user_id, role, aprovado, rejeitado, leader_id)
  values (
    new.id,
    case when new.email = 'faulaandre@gmail.com' then 'admin' else 'membro' end,
    case when new.email = 'faulaandre@gmail.com' then true else false end,
    false,
    ref_uid
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

comment on column public.perfil.referral_code is 'Código único do link de indicação (?ref=XXX). Gerado na área de membros.';
