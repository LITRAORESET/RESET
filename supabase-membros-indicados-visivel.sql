-- Permite ao usuário ver nome dos membros que indicou (leader_id = eu).
-- Necessário para exibir "Parabéns! [Nome]" na Meta da Semana – Duplicação.
-- Execute no Supabase: SQL Editor

drop policy if exists "Usuário vê membros dos indicados" on public.membros;
create policy "Usuário vê membros dos indicados"
  on public.membros for select to authenticated
  using (
    exists (
      select 1 from public.perfil p
      where p.user_id = membros.user_id and p.leader_id = auth.uid()
    )
  );
