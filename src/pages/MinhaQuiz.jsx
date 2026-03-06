import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SITE_URL } from '../constants'
import { useReferralCode } from '../hooks/useReferralCode'
import './AreaMembros.css'
import './OportunidadePage.css'

export default function MinhaQuiz() {
  const { codigo, loading } = useReferralCode()
  const [copiadoQuiz, setCopiadoQuiz] = useState(null) // 'direto' | 'indireto'

  useEffect(() => {
    const main = document.querySelector('.area-membros__main')
    if (main) main.scrollTo(0, 0)
    else window.scrollTo(0, 0)
  }, [])

  const baseUrl = SITE_URL.replace(/\/$/, '')
  const linkQuizDireto = codigo ? `${baseUrl}/quiz/${codigo}?versao=direto` : ''
  const linkQuizIndireto = codigo ? `${baseUrl}/quiz/${codigo}?versao=indireto` : ''

  function handleCopiarQuiz(qual) {
    const url = qual === 'direto' ? linkQuizDireto : linkQuizIndireto
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setCopiadoQuiz(qual)
      setTimeout(() => setCopiadoQuiz(null), 2500)
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
      <h2 className="area-membros__conteudo-titulo">🔬 Quiz RST</h2>
      <p className="area-membros__conteudo-subtitulo">Diagnóstico que desperta interesse e leva ao WhatsApp. Use o link correto para cada público:</p>

      <Link to="/membros/quiz-exemplos" className="minha-quiz__exemplos">
        Ver exemplos de diagnóstico e CTA
      </Link>

      {!codigo && !loading && (
        <p className="config-membro__erro">Não foi possível gerar o link. Tente recarregar a página ou acesse a seção &quot;Meu link&quot; na área de membros.</p>
      )}

      {codigo && (
        <div className="oportunidade-page__share-box config-membro__bloco">
          <div className="oportunidade-page__quiz-links">
            <div className="oportunidade-page__quiz-item">
              <span className="oportunidade-page__quiz-label">Público quente (clientes, indicados):</span>
              <p className="oportunidade-page__share-url">{linkQuizDireto}</p>
              <button type="button" className="config-membro__btn config-membro__btn--small" onClick={() => handleCopiarQuiz('direto')}>
                {copiadoQuiz === 'direto' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <div className="oportunidade-page__quiz-item">
              <span className="oportunidade-page__quiz-label">Público frio (Instagram, anúncios):</span>
              <p className="oportunidade-page__share-url">{linkQuizIndireto}</p>
              <button type="button" className="config-membro__btn config-membro__btn--small" onClick={() => handleCopiarQuiz('indireto')}>
                {copiadoQuiz === 'indireto' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {codigo && (
        <div className="oportunidade-page__share-box config-membro__bloco">
          <h3 className="config-membro__bloco-titulo">📄 Material para Parcerias</h3>
          <p className="oportunidade-page__quiz-desc">Flyer com QR Code do Quiz RST para deixar em cafeterias, academias, salões, consultórios. A pessoa escaneia, faz o diagnóstico e pode pedir a sacola no seu WhatsApp.</p>
          <Link to="/membros/quiz-materiais" className="config-membro__btn config-membro__btn--link">
            Baixar PDF com QR Code
          </Link>
        </div>
      )}
    </div>
  )
}
