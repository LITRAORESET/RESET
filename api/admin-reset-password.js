/**
 * API para admin gerar senha provisória para um membro.
 * Usa SUPABASE_SERVICE_ROLE_KEY (não exponha no cliente).
 *
 * POST /api/admin-reset-password
 * Body: { user_id: "uuid" }
 * Header: Authorization: Bearer <access_token do admin>
 */
import { createClient } from '@supabase/supabase-js'

function gerarSenhaProvisoria() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789' // sem i,l,o,0,1
  let s = ''
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação necessário' })
  }

  const { user_id } = req.body || {}
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'user_id é obrigatório' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('[admin-reset-password] Falta variável:', !supabaseUrl ? 'URL' : !anonKey ? 'ANON' : 'SERVICE_ROLE')
    return res.status(500).json({ error: 'Configuração do servidor incompleta' })
  }

  const supabase = createClient(supabaseUrl, anonKey)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada' })
  }

  const { data: perfil } = await supabase
    .from('perfil')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const adminEmail = (process.env.VITE_ADMIN_EMAIL || 'faulaandre@gmail.com').toLowerCase()
  const ehAdmin = perfil?.role === 'admin' || user.email?.toLowerCase() === adminEmail
  if (!ehAdmin) {
    return res.status(403).json({ error: 'Apenas administradores podem gerar senha provisória' })
  }

  const novaSenha = gerarSenhaProvisoria()
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
    password: novaSenha
  })

  if (updateError) {
    console.error('[admin-reset-password]', updateError)
    const msg = updateError.message || 'Não foi possível atualizar a senha. Tente novamente.'
    return res.status(500).json({ error: msg })
  }

  return res.status(200).json({ success: true, senha: novaSenha })
}
