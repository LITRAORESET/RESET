import { useState, useEffect } from 'react'
import { getSession } from '../lib/auth'
import { supabase } from '../lib/supabase'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function gerarCodigo(len = 6) {
  let s = ''
  for (let i = 0; i < len; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)]
  return s
}

/**
 * Hook que busca o referral_code do perfil e, se não existir, gera um novo.
 * Usado em MinhaOportunidade, MinhaQuiz, QuizMateriaisEstabelecimentos e MeuLinkIndicacao.
 */
export function useReferralCode() {
  const [codigo, setCodigo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await getSession()
      if (cancelled || !data?.session?.user?.id) {
        setLoading(false)
        return
      }
      const uid = data.session.user.id
      if (!supabase) {
        setLoading(false)
        return
      }
      const { data: perfil } = await supabase
        .from('perfil')
        .select('referral_code')
        .eq('user_id', uid)
        .single()
      if (cancelled) return
      if (perfil?.referral_code) {
        setCodigo(perfil.referral_code)
        setLoading(false)
        return
      }
      // Gera o código se não existir
      for (let t = 0; t < 5; t++) {
        const novo = gerarCodigo(6)
        const { error } = await supabase
          .from('perfil')
          .update({ referral_code: novo })
          .eq('user_id', uid)
        if (cancelled) return
        if (!error) {
          setCodigo(novo)
          break
        }
        if (error.code === '23505') continue // conflito de unicidade, tenta outro
        break
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { codigo, loading }
}
