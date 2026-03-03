import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getSession } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { SITE_URL, LOGO_RESET_METABOLICO, IMAGEM_SACOLA } from '../constants'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import './QuizMateriaisEstabelecimentos.css'

export default function QuizMateriaisEstabelecimentos() {
  const [codigo, setCodigo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [baixando, setBaixando] = useState(false)
  const flyerRef = useRef(null)

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
      setCodigo(perfil?.referral_code || null)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const baseUrl = SITE_URL.replace(/\/$/, '')
  const linkQuizIndireto = codigo ? `${baseUrl}/quiz/${codigo}?versao=indireto` : ''
  const qrUrl = linkQuizIndireto
    ? `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(linkQuizIndireto)}`
    : ''

  const beneficios = [
    { emoji: '⚡', texto: 'Energia ao longo do dia' },
    { emoji: '🌱', texto: 'Leveza e bem-estar' },
    { emoji: '😌', texto: 'Foco e clareza mental' },
    { emoji: '🌊', texto: 'Reduz cansaço constante' },
    { emoji: '🔥', texto: 'Metabolismo mais ativo' },
    { emoji: '🍃', texto: 'Controle da vontade por doces' },
    { emoji: '🌱', texto: 'Equilíbrio do organismo' },
    { emoji: '🌿', texto: 'Sensação de limpeza interna' },
    { emoji: '🌊', texto: 'Ajuda a desinchar' },
    { emoji: '🌿', texto: 'Ajuda a desintoxicar' },
  ]

  async function handleBaixarPdf() {
    if (!linkQuizIndireto || !flyerRef.current) return
    setBaixando(true)
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      const pdfWidth = 210
      const pdfHeight = 297
      let imgWidth = pdfWidth
      let imgHeight = (canvas.height * pdfWidth) / canvas.width
      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight
        imgWidth = (canvas.width * pdfHeight) / canvas.height
      }
      const x = (pdfWidth - imgWidth) / 2
      pdf.addImage(imgData, 'PNG', x, 0, imgWidth, imgHeight)
      pdf.save('material-quiz-parcerias.pdf')
    } catch (err) {
      console.error(err)
    } finally {
      setBaixando(false)
    }
  }

  if (loading) {
    return (
      <div className="quiz-materiais">
        <div className="quiz-materiais__container">
          <p className="quiz-materiais__loading">Carregando…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-materiais">
      <header className="quiz-materiais__header">
        <div className="quiz-materiais__header-inner">
          <Link to="/membros/quiz" className="quiz-materiais__voltar">
            ← Voltar ao Quiz RST
          </Link>
          <h1 className="quiz-materiais__titulo">Material para Parcerias</h1>
          <p className="quiz-materiais__intro">
            Flyer com QR Code do Quiz RST Reset Metabólico. Deixe em cafeterias, academias, salões, consultórios. A pessoa escaneia, faz o diagnóstico e pode pedir a sacola direto no seu WhatsApp.
          </p>
        </div>
      </header>

      <div className="quiz-materiais__container">
        {!codigo && (
          <p className="quiz-materiais__erro">Seu link ainda está sendo gerado. Atualize a página em instantes.</p>
        )}

        {codigo && (
          <div className="quiz-materiais__layout">
            <aside className="quiz-materiais__preview">
              <p className="quiz-materiais__preview-label">Preview do PDF para parcerias</p>
              <div ref={flyerRef} className="quiz-materiais__flyer">
                <div className="quiz-materiais__flyer-top">
                  <img src={LOGO_RESET_METABOLICO} alt="Reset Metabólico" className="quiz-materiais__flyer-logo" crossOrigin="anonymous" />
                </div>
                <h2 className="quiz-materiais__flyer-titulo">O que está travando sua energia hoje?</h2>
                <p className="quiz-materiais__flyer-chamada">
                  Faça seu diagnóstico gratuito em 1 minuto.<br />
                  Descubra o que seu corpo está pedindo.
                </p>
                <div className="quiz-materiais__flyer-imagens">
                  <img src={IMAGEM_SACOLA} alt="Sacola RST" className="quiz-materiais__flyer-sacola" onError={(e) => { e.target.style.display = 'none' }} crossOrigin="anonymous" />
                  <div className="quiz-materiais__flyer-qr">
                    <img src={qrUrl} alt="QR Code Quiz" crossOrigin="anonymous" />
                  </div>
                </div>
                <p className="quiz-materiais__flyer-instrucao">Escaneie o QR Code</p>
                <div className="quiz-materiais__beneficios">
                  <p className="quiz-materiais__beneficios-titulo">O que você pode conquistar:</p>
                  <ul className="quiz-materiais__beneficios-list">
                    {beneficios.map((b, i) => (
                      <li key={i}><span className="quiz-materiais__beneficio-emoji">{b.emoji}</span> {b.texto}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            <div className="quiz-materiais__acoes">
              <button type="button" className="quiz-materiais__btn" onClick={handleBaixarPdf} disabled={baixando}>
                {baixando ? 'Gerando…' : '📄 Baixar PDF'}
              </button>
              <p className="quiz-materiais__dica">
                Clique para baixar o PDF diretamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
