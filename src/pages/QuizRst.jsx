import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import { SITE_URL } from '../constants'
import {
  QUIZ_NOME,
  PERGUNTAS,
  RESPOSTAS,
  getDiagnosticoDireto,
  getDiagnosticoIndireto,
} from '../data/quizRst'
import './QuizRst.css'

export default function QuizRst() {
  const { codigo } = useParams()
  const [searchParams] = useSearchParams()
  const versao = searchParams.get('versao') || 'indireto' // direto | indireto

  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [etapa, setEtapa] = useState('quiz') // quiz | resultado
  const [respostas, setRespostas] = useState([])
  const [perguntaAtual, setPerguntaAtual] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!codigo?.trim() || !supabase) {
        setErro('Link inválido.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.rpc('get_referrer_info', {
        ref_code: codigo.trim(),
      })
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
        telefone: row.referrer_telefone || null,
      })
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [codigo])

  function responder(valor) {
    const novas = [...respostas]
    novas[perguntaAtual] = valor
    setRespostas(novas)
    if (perguntaAtual < PERGUNTAS.length - 1) {
      setPerguntaAtual((p) => p + 1)
    } else {
      setEtapa('resultado')
    }
  }

  const diagnostico =
    versao === 'direto'
      ? getDiagnosticoDireto(respostas)
      : getDiagnosticoIndireto(respostas)

  const urlWhatsApp =
    info?.telefone && diagnostico?.msgWhatsApp
      ? buildWhatsAppUrl(info.telefone, diagnostico.msgWhatsApp)
      : null

  if (loading) {
    return (
      <div className="quiz-rst">
        <div className="quiz-rst__container">
          <p className="quiz-rst__loading">Carregando…</p>
        </div>
      </div>
    )
  }

  if (erro || !info) {
    return (
      <div className="quiz-rst">
        <div className="quiz-rst__container">
          <p className="quiz-rst__erro">{erro}</p>
          <a href={SITE_URL} className="quiz-rst__link">
            Ir para o site
          </a>
        </div>
      </div>
    )
  }

  if (etapa === 'quiz') {
    const p = PERGUNTAS[perguntaAtual]
    const progresso = ((perguntaAtual + 1) / PERGUNTAS.length) * 100

    return (
      <div className="quiz-rst">
        <div className="quiz-rst__container">
          <h1 className="quiz-rst__titulo">{QUIZ_NOME}</h1>
          <p className="quiz-rst__subtitulo">
            Responda em menos de 1 minuto e descubra seu resultado
          </p>

          <div className="quiz-rst__progresso">
            <div
              className="quiz-rst__progresso-bar"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="quiz-rst__contador">
            {perguntaAtual + 1} de {PERGUNTAS.length}
          </p>

          <div className="quiz-rst__pergunta">
            <h2 className="quiz-rst__pergunta-texto">{p.texto}</h2>
            <div className="quiz-rst__opcoes">
              {RESPOSTAS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="quiz-rst__opcao"
                  onClick={() => responder(r.valor)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Etapa resultado
  const fraseAntesCta =
    'Se você não ajustar agora, a tendência é continuar sentindo esses sinais nas próximas semanas.'

  return (
    <div className="quiz-rst">
      <div className="quiz-rst__container quiz-rst__container--resultado">
        <h1 className="quiz-rst__titulo-resultado">📊 {diagnostico.titulo}</h1>

        <div className="quiz-rst__diagnostico">
          <p className="quiz-rst__diagnostico-intro">{diagnostico.intro}</p>

          {diagnostico.principal && (
            <div className="quiz-rst__principal">
              <span className="quiz-rst__principal-label">Seu principal ponto de atenção:</span>
              <p className="quiz-rst__principal-texto">{diagnostico.principal}</p>
            </div>
          )}

          {diagnostico.pontos.filter((p) => !p.principal).length > 0 && (
            <ul className="quiz-rst__lista">
              {diagnostico.pontos.filter((p) => !p.principal).map((item, i) => (
                <li key={i}>{item.texto}</li>
              ))}
            </ul>
          )}

          <p className="quiz-rst__diagnostico-texto">
            {diagnostico.explicacao}
          </p>

          {versao === 'direto' && (
            <>
              <p className="quiz-rst__diagnostico-sacola">
                {diagnostico.sacola}
              </p>
              <ul className="quiz-rst__lista quiz-rst__lista--check">
                {diagnostico.beneficios.map((b, i) => (
                  <li key={i}>✔️ {b}</li>
                ))}
              </ul>
              <p className="quiz-rst__diagnostico-conclusao">
                {diagnostico.conclusao}
              </p>
            </>
          )}

          {versao === 'indireto' && (
            <>
              <ul className="quiz-rst__lista quiz-rst__lista--check">
                {diagnostico.necessidades.map((n, i) => (
                  <li key={i}>✔️ {n}</li>
                ))}
              </ul>
              <p className="quiz-rst__diagnostico-alerta">
                {diagnostico.alerta}
              </p>
              <ul className="quiz-rst__lista">
                {diagnostico.alertaItens.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
              <p className="quiz-rst__diagnostico-transicao">
                {diagnostico.transicao}
              </p>
            </>
          )}

          <p className="quiz-rst__frase-cta">{fraseAntesCta}</p>

          <div className="quiz-rst__cta-wrap">
            {urlWhatsApp ? (
              <a
                href={urlWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="quiz-rst__btn-cta"
              >
                🚀 {diagnostico.ctaTexto}
              </a>
            ) : (
              <p className="quiz-rst__aviso">
                Quem te indicou ainda não cadastrou o WhatsApp. Peça o link
                direto a ele.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
