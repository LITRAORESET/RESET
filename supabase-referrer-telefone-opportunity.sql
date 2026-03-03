-- Retorna telefone do indicador na página pública de oportunidade (botões WhatsApp)
-- Execute no Supabase: SQL Editor (após supabase-referral-link.sql).

drop function if exists public.get_referrer_info(text);

create or replace function public.get_referrer_info(ref_code text)
returns table (referrer_user_id uuid, referrer_nome text, referrer_telefone text)
language sql security definer set search_path = public stable as $$
  select p.user_id, coalesce(m.nome, 'Indicador')::text, nullif(trim(m.telefone), '')
  from public.perfil p
  left join public.membros m on m.user_id = p.user_id
  where p.referral_code = ref_code and ref_code is not null and length(trim(ref_code)) > 0
  limit 1;
$$;

grant execute on function public.get_referrer_info(text) to anon;
grant execute on function public.get_referrer_info(text) to authenticated;

comment on function public.get_referrer_info(text) is 'Dado o código ref da URL, retorna user_id, nome e telefone do indicador (para cadastro e página de oportunidade).';
