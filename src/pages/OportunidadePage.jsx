import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SITE_URL } from '../constants'
import VideoOportunidadeNegocio from '../components/VideoOportunidadeNegocio'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import './OportunidadePage.css'

const TITULO = 'Ganhe R$500 por semana com bebidas funcionais'

export default function OportunidadePage() {
  const { codigo } = useParams()
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!codigo?.trim() || !supabase) {
        setLoading(false)
        setErro('Link inválido.')
        return
      }
      const { data, error } = await supabase.rpc('get_referrer_info', { ref_code: codigo.trim() })
      if (cancelled) return
      if (error) {
        setErro('Não foi possível carregar. Tente novamente.')
        setLoading(false)
        return
      }
      const row = data && data[0]
      if (!row) {
        setErro('Link não encontrado ou expirado.')
        setLoading(false)
        return
      }
      setInfo({
        nome: row.referrer_nome || 'Indicador',
        telefone: row.referrer_telefone || null
      })
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [codigo])

  const urlWhatsApp = info?.telefone ? buildWhatsAppUrl(info.telefone) : null
  const urlComecar = info?.telefone ? buildWhatsAppUrl(info.telefone, 'Quero começar! Me explica como.') : null
  const urlDuvidas = info?.telefone ? buildWhatsAppUrl(info.telefone, 'Tenho dúvidas sobre a oportunidade.') : null

  if (loading) {
    return (
      <div className="oportunidade-page">
        <div className="oportunidade-page__container">
          <p className="oportunidade-page__loading">Carregando…</p>
        </div>
      </div>
    )
  }

  if (erro || !info) {
    return (
      <div className="oportunidade-page">
        <div className="oportunidade-page__container">
          <p className="oportunidade-page__erro">{erro}</p>
          <a href={SITE_URL} className="oportunidade-page__link">Ir para o site</a>
        </div>
      </div>
    )
  }

  return (
    <div className="oportunidade-page">
      <div className="oportunidade-page__container">
        <h1 className="oportunidade-page__titulo">{TITULO}</h1>

        <VideoOportunidadeNegocio />

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
          {!info.telefone && (
            <p className="oportunidade-page__aviso">Quem te indicou ainda não cadastrou o WhatsApp. Peça o link direto a ele.</p>
          )}
        </div>
      </div>
    </div>
  )
}
