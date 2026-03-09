-- Zerar registros de execução de um usuário específico
-- Execute no Supabase: SQL Editor
-- Substitua 'Cauê' pelo nome do usuário (ou use o e-mail/user_id se preferir)

-- Opção 1: Zerar por nome (busca parcial, case insensitive)
-- Ajuste o nome abaixo conforme necessário
delete from public.execution_logs
where user_id in (
  select m.user_id
  from public.membros m
  where lower(trim(m.nome)) like '%cauê%'
     or lower(trim(m.nome)) like '%caue%'
);

-- Verificar quantos registros foram removidos (rode antes do delete para conferir):
-- select el.*, m.nome, m.email
-- from public.execution_logs el
-- join public.membros m on m.user_id = el.user_id
-- where lower(trim(m.nome)) like '%cauê%' or lower(trim(m.nome)) like '%caue%';
