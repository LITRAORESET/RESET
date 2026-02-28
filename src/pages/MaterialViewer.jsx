import { useParams, useNavigate, useLocation } from 'react-router-dom'
import './MaterialViewer.css'

const BASE_MATERIAIS = '/materiais'

/** Lista de arquivos permitidos (evita path traversal) */
const ARQUIVOS_PERMITIDOS = new Set([
  'comece-aqui-lucro.html', 'pergunta-oficial.html', 'plano-7-dias-checklist.html',
  'produto-manual-explicacao.html', 'como-vender-guia.html', 'scripts-oficiais.html',
  'recrutamento-r500.html', 'sistema-12x-execucao-diaria.html', 'rotina-diaria.html',
  'rotina-por-perfil.html', 'rotina-semanal-vendas.html', 'agenda-apresentacoes.html',
  'treinamentos-oficiais.html', 'manual-movimento.html', 'manifesto.html',
])

export default function MaterialViewer() {
  const { arquivo } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const titulo = state?.titulo || arquivo?.replace(/\.(html|pdf)$/i, '').replace(/-/g, ' ') || 'Material'

  const permitido = arquivo && ARQUIVOS_PERMITIDOS.has(arquivo)
  const src = permitido ? `${BASE_MATERIAIS}/${arquivo}` : null

  function handleImprimirOuPdf() {
    const iframe = document.getElementById('material-iframe')
    if (iframe?.contentWindow) {
      iframe.contentWindow.print()
    }
  }

  if (!permitido) {
    return (
      <div className="material-viewer material-viewer--erro">
        <p>Material não encontrado.</p>
        <button type="button" className="material-viewer__btn-voltar" onClick={() => navigate('/membros')}>
          Voltar à área de membros
        </button>
      </div>
    )
  }

  return (
    <div className="material-viewer">
      <div className="material-viewer__toolbar">
        <button
          type="button"
          className="material-viewer__btn-voltar"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>
        <h2 className="material-viewer__titulo">{titulo}</h2>
        <div className="material-viewer__acoes">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="material-viewer__btn material-viewer__btn--secundario"
          >
            Abrir em nova aba
          </a>
          <button
            type="button"
            className="material-viewer__btn material-viewer__btn--pdf"
            onClick={handleImprimirOuPdf}
          >
            Baixar / Imprimir PDF
          </button>
        </div>
      </div>
      <iframe
        id="material-iframe"
        title={titulo}
        src={src}
        className="material-viewer__iframe"
      />
    </div>
  )
}
