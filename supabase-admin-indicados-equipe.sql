-- Permite ao líder ver quantas pessoas cada membro da equipe indicou (analíticas).
-- Execute no Supabase: SQL Editor (após execucao-sistema12x e referral-link).

-- Função: retorna para cada user_id da equipe do líder a contagem de indicados (leader_id = esse user).
-- Chamada pelo app quando role = leader para preencher a coluna Indicados no Painel.
create or replace function public.get_indicados_por_equipe(p_leader_uid uuid)
returns table (user_id uuid, indicados bigint)
language sql security definer set search_path = public stable as $$
  select p.leader_id as user_id, count(*)::bigint
  from public.perfil p
  where p.leader_id in (
    select pr.user_id from public.perfil pr where pr.leader_id = p_leader_uid
  )
  group by p.leader_id;
$$;

-- Só líder ou admin podem chamar (líder só passa o próprio uid)
grant execute on function public.get_indicados_por_equipe(uuid) to authenticated;

comment on function public.get_indicados_por_equipe(uuid) is 'Retorna contagem de indicados por membro da equipe do líder. Usado no Painel de Execução.';
