import { useState } from 'react'
import { SITE_URL } from '../constants'
import { useReferralCode } from '../hooks/useReferralCode'
import './MeuLinkIndicacao.css'

export default function MeuLinkIndicacao() {
  const { codigo, loading } = useReferralCode()
  const [copiado, setCopiado] = useState(false)

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
        Use este link único para indicar pessoas. Quem se cadastrar por ele já fica vinculado a você e aparece automaticamente na sua Meta da Semana – Duplicação.
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
