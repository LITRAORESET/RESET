-- Rode no Supabase: SQL Editor
-- Use quando o admin (faulaandre@gmail.com) JÁ se cadastrou em "Solicitar acesso"
-- mas não consegue entrar por "Email not confirmed" ou perfil não está como admin.
-- Este SQL confirma o e-mail e garante perfil de administrador com todos os acessos.

-- 1) Confirmar o e-mail do admin (remove o "Email not confirmed" no login)
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'faulaandre@gmail.com';

-- 2) Garantir perfil admin com acesso total (role admin + aprovado)
insert into public.perfil (user_id, role, aprovado, rejeitado)
select id, 'admin', true, false
from auth.users
where email = 'faulaandre@gmail.com'
on conflict (user_id) do update set
  role = 'admin',
  aprovado = true,
  rejeitado = false;

-- 3) Se a tabela membros existir e o admin ainda não estiver nela, incluir
insert into public.membros (user_id, nome, email)
select id, 'Administrador', email
from auth.users
where email = 'faulaandre@gmail.com'
on conflict (user_id) do update set nome = coalesce(membros.nome, excluded.nome);
