-- Novos campos na atividade diária: 10 pessoas do negócio, Chamei para Clube do Bem-estar
-- Rode no Supabase: SQL Editor

alter table public.execution_logs
  add column if not exists contacts_negocio_done boolean not null default false;

alter table public.execution_logs
  add column if not exists clube_bem_estar_chamei boolean not null default false;

comment on column public.execution_logs.contacts_done is 'Falei com 10 pessoas da sacola (oferta produto)';
comment on column public.execution_logs.contacts_negocio_done is 'Falei com 10 pessoas do negócio (oferta renda)';
comment on column public.execution_logs.clube_bem_estar_chamei is 'Chamei pessoas para o Clube do Bem-estar';
