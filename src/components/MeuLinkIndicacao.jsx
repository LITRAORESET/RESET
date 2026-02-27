import { useState, useEffect } from 'react'
import { getSession } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { SITE_URL } from '../constants'
import './MeuLinkIndicacao.css'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function gerarCodigo(len = 6) {
  let s = ''
  for (let i = 0; i < len; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)]
  return s
}

export default function MeuLinkIndicacao() {
  const [userId, setUserId] = useState(null)
  const [codigo, setCodigo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await getSession()
      if (cancelled || !data?.session?.user?.id) {
        setLoading(false)
        return
      }
      const uid = data.session.user.id
      setUserId(uid)
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
        if (error.code === '23505') continue
        break
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const link = codigo ? `${SITE_URL}/solicitar?ref=${codigo}` : ''

  function handleCopiar() {
    if (!link) return
    navigator.clipboard.writeText(link).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  if (loading) {
    return (
      <div className="meu-link">
        <p className="meu-link__loading">Gerando seu link…</p>
      </div>
    )
  }

  if (!codigo) {
    return (
      <div className="meu-link">
        <p className="meu-link__erro">Não foi possível gerar o link. Tente recarregar a página.</p>
      </div>
    )
  }

  return (
    <div className="meu-link">
      <p className="meu-link__intro">
        Use este link único para indicar pessoas. Quem se cadastrar por ele já fica vinculado a você e você pode marcar a meta semanal de duplicação.
      </p>
      <div className="meu-link__campo">
        <label className="meu-link__label">Seu link de indicação</label>
        <div className="meu-link__row">
          <input
            type="text"
            readOnly
            value={link}
            className="meu-link__input"
            aria-label="Link de indicação"
          />
          <button type="button" className="meu-link__btn" onClick={handleCopiar}>
            {copiado ? 'Copiado!' : 'Copiar link'}
          </button>
        </div>
      </div>
      <p className="meu-link__dica">
        Envie por WhatsApp, e-mail ou rede social. A pessoa preenche o cadastro e você aparece como indicador.
      </p>
    </div>
  )
}
