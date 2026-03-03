import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSession, getMembro } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { SITE_URL, VIDEO_APRESENTACAO_NEGOCIO } from '../constants'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import './AreaMembros.css'
import './OportunidadePage.css'

const TITULO = 'Ganhe R$500 por semana com bebidas funcionais'

export default function MinhaOportunidade() {
  const [membro, setMembro] = useState(null)
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
      const m = await getMembro()
      if (cancelled) return
      setMembro(m)
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
      setCodigo(perfil?.referral_code || null)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const baseUrl = SITE_URL.replace(/\/$/, '')
  const linkCompartilhar = codigo ? `${baseUrl}/oportunidade/${codigo}` : ''
  const urlComecar = membro?.telefone ? buildWhatsAppUrl(membro.telefone, 'Quero começar! Me explica como.') : null
  const urlDuvidas = membro?.telefone ? buildWhatsAppUrl(membro.telefone, 'Tenho dúvidas sobre a oportunidade.') : null

  function handleCopiar(texto) {
    if (!texto) return
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  if (loading) {
    return (
      <div className="area-membros__conteudo">
        <p className="area-membros__loading">Carregando…</p>
      </div>
    )
  }

  return (
    <div className="area-membros__conteudo">
      <h2 className="area-membros__conteudo-titulo">Oportunidade de Negócio</h2>
      <p className="area-membros__conteudo-subtitulo">Sua página com o vídeo da apresentação. Compartilhe o link e os contatos vão direto pro seu WhatsApp.</p>

      {linkCompartilhar && (
        <div className="oportunidade-page__share-box config-membro__bloco">
          <h3 className="config-membro__bloco-titulo">Seu link para compartilhar</h3>
          <p className="oportunidade-page__share-url">{linkCompartilhar}</p>
          <button type="button" className="config-membro__btn" onClick={() => handleCopiar(linkCompartilhar)}>
            {copiado ? 'Copiado!' : 'Copiar link'}
          </button>
        </div>
      )}

      {!codigo && (
        <p className="config-membro__erro">Seu link ainda está sendo gerado. Atualize a página em instantes.</p>
      )}

      <div className="oportunidade-page oportunidade-page--inside">
        <div className="oportunidade-page__container">
          <h1 className="oportunidade-page__titulo">{TITULO}</h1>

          <div className="oportunidade-page__video-wrap">
            <video
              className="oportunidade-page__video"
              src={VIDEO_APRESENTACAO_NEGOCIO}
              controls
              playsInline
              aria-label="Apresentação da oportunidade de negócio"
            >
              Seu navegador não suporta vídeos.
            </video>
          </div>

          <div className="oportunidade-page__botoes">
            {urlComecar && (
              <a href={urlComecar} target="_blank" rel="noopener noreferrer" className="oportunidade-page__btn oportunidade-page__btn--primary">
                Quero começar
              </a>
            )}
            {urlDuvidas && (
              <a href={urlDuvidas} target="_blank" rel="noopener noreferrer" className="oportunidade-page__btn oportunidade-page__btn--secondary">
                Tirar dúvidas
              </a>
            )}
            {(!membro?.telefone || !membro.telefone.trim()) && (
              <p className="oportunidade-page__aviso">Cadastre seu telefone em <Link to="/membros/configuracoes" className="oportunidade-page__aviso-link">Configurações</Link> para os botões levarem ao seu WhatsApp.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
