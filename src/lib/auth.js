import { supabase } from './supabase'
import { ADMIN_EMAIL } from '../constants'

/** Retorna a sessão atual (usuário logado). */
export async function getSession() {
  if (!supabase) return { data: { session: null }, error: new Error('Supabase não configurado') }
  return await supabase.auth.getSession()
}

/** Retorna { role, aprovado, rejeitado } do usuário logado; null se não logado */
export async function getPerfil() {
  const { data: { session }, error } = await getSession()
  if (error || !session?.user?.id) return null
  const email = session.user.email?.toLowerCase()
  if (email === ADMIN_EMAIL) {
    return { role: 'admin', aprovado: true, rejeitado: false }
  }
  const { data } = await supabase.from('perfil').select('role, aprovado, rejeitado, leader_id').eq('user_id', session.user.id).single()
  return data ?? { role: 'membro', aprovado: false, rejeitado: false, leader_id: null }
}

/** Retorna { nome, email, id_distribuidor, telefone } do membro logado (tabela membros); null se não logado ou sem registro */
export async function getMembro() {
  const { data: { session }, error } = await getSession()
  if (error || !session?.user?.id) return null
  const { data } = await supabase.from('membros').select('nome, email, id_distribuidor, telefone').eq('user_id', session.user.id).single()
  return data ?? null
}

/** Retorna o role do usuário logado: 'admin' | 'membro' | null */
export async function getUserRole() {
  const p = await getPerfil()
  return p?.role ?? null
}

/** Faz logout */
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}
