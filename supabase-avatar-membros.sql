-- Foto do membro para uso nos flyers de reconhecimento
-- Rode no Supabase: SQL Editor (após schema base e membros)

-- 1) Coluna avatar_url na tabela membros (URL da foto no Storage ou externa)
alter table public.membros add column if not exists avatar_url text;

comment on column public.membros.avatar_url is 'URL da foto do membro (Storage avatars ou link). Usada nos flyers de reconhecimento.';

-- 2) Bucket "avatars": crie no Dashboard (Storage > New bucket > nome "avatars", Public = true, limite 2MB, tipos image/*).
--    Depois rode as políticas abaixo.

-- 3) Políticas: usuário pode fazer upload apenas na própria pasta (user_id)
drop policy if exists "Usuário faz upload do próprio avatar" on storage.objects;
create policy "Usuário faz upload do próprio avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuário atualiza próprio avatar" on storage.objects;
create policy "Usuário atualiza próprio avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuário remove próprio avatar" on storage.objects;
create policy "Usuário remove próprio avatar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Leitura pública (bucket público já permite; esta política garante select para todos)
drop policy if exists "Avatar público leitura" on storage.objects;
create policy "Avatar público leitura"
  on storage.objects for select to public
  using (bucket_id = 'avatars');
