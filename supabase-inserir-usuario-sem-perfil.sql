-- Usuário existe no Auth mas não aparece em "Solicitações pendentes"
-- (falta registro em perfil e/ou membros). Rode no Supabase: SQL Editor.
--
-- Quando rodar: todos os usuários que existem em auth.users e ainda não têm
-- perfil/membros ganham registro e passam a aparecer como "solicitando" no admin.
-- Depois você pode editar nome/ID em membros se tiver ficado vazio (cadastro pelo painel).

insert into public.perfil (user_id, role, aprovado, rejeitado)
select u.id, 'membro', false, false
from auth.users u
left join public.perfil p on p.user_id = u.id
where p.user_id is null
on conflict (user_id) do nothing;

insert into public.membros (user_id, nome, email, id_distribuidor, mensagem)
select u.id,
  coalesce(nullif(trim(u.raw_user_meta_data->>'nome'), ''), 'Nome a preencher'),
  u.email,
  nullif(trim(coalesce(u.raw_user_meta_data->>'id_distribuidor', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'mensagem', '')), '')
from auth.users u
left join public.membros m on m.user_id = u.id
where m.user_id is null
on conflict (user_id) do nothing;
