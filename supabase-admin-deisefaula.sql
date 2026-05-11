-- Rode no Supabase: SQL Editor
-- Segunda administradora (deisefaula@gmail.com): mesmo acesso que o admin principal
-- (área /admin, análise de execução /admin-execucao-analitica, aprovações, etc.)
--
-- Pré-requisito: ela já deve existir em auth.users (cadastro em "Solicitar acesso" ou convite).
-- Se ainda não cadastrou, peça para concluir o cadastro com esse e-mail e rode este script depois.

-- 1) Confirmar e-mail (evita bloqueio "Email not confirmed" no login)
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where lower(trim(email)) = 'deisefaula@gmail.com';

-- 2) Perfil admin + aprovado
insert into public.perfil (user_id, role, aprovado, rejeitado)
select id, 'admin', true, false
from auth.users
where lower(trim(email)) = 'deisefaula@gmail.com'
on conflict (user_id) do update set
  role = 'admin',
  aprovado = true,
  rejeitado = false;

-- 3) Linha em membros (lista no admin)
insert into public.membros (user_id, nome, email)
select id, coalesce(raw_user_meta_data->>'nome', 'Administradora'), email
from auth.users
where lower(trim(email)) = 'deisefaula@gmail.com'
on conflict (user_id) do update set
  nome = coalesce(membros.nome, excluded.nome),
  email = excluded.email;
