import { Link, useSearchParams } from 'react-router-dom'
import { PILARES, FRASE_OFICIAL_RECRUTAMENTO } from '../data/areaMembrosEstrutura'
import MeuLinkIndicacao from '../components/MeuLinkIndicacao'
import './AreaMembros.css'

const BASE_MATERIAIS = '/materiais'

export default function AreaMembros() {
  const [searchParams, setSearchParams] = useSearchParams()
  const secaoAtiva = searchParams.get('secao') || 'comece-aqui'
  const pilarAtual = PILARES.find((p) => p.id === secaoAtiva) || PILARES[0]

  return (
    <>
      {/* Prioridade: execução do dia, com direcionamento acordado */}
      <div className="area-membros__prioridade" role="region" aria-label="Prioridade do dia">
        <div className="area-membros__prioridade-inner">
          <h2 className="area-membros__prioridade-titulo">Execução do dia</h2>
          <p className="area-membros__prioridade-texto">Bata sua meta hoje: marque o que fez e mantenha sua sequência.</p>
          <Link to="/membros/execucao" className="area-membros__prioridade-btn">Executar Meu Dia</Link>
          <p className="area-membros__prioridade-proximo">Depois: declare a meta da semana no <Link to="/membros/clube-ouro">Clube Ouro</Link>. Quatro semanas = <strong>Elite</strong>.</p>
        </div>
      </div>

      <div className="area-membros__banner" role="banner">
        <p className="area-membros__banner-frase">{FRASE_OFICIAL_RECRUTAMENTO}</p>
        <p className="area-membros__banner-sub">Pergunta oficial do projeto. Use todos os dias.</p>
      </div>

      <section className="area-membros__conteudo">
        <h2 className="area-membros__conteudo-titulo">
          <span className="area-membros__conteudo-icon">{pilarAtual.icon}</span>
          {pilarAtual.titulo}
        </h2>
        {pilarAtual.subtitulo && (
          <p className="area-membros__conteudo-subtitulo">{pilarAtual.subtitulo}</p>
        )}
        <p className="area-membros__conteudo-descricao">{pilarAtual.descricao}</p>

        {pilarAtual.id === 'meu-link' ? (
          <MeuLinkIndicacao />
        ) : pilarAtual.itens && pilarAtual.itens.length > 0 ? (
          <ul className="area-membros__lista">
            {pilarAtual.id === 'rotina-diaria' && (
              <li className="area-membros__item area-membros__item--destaque">
                <span className="area-membros__item-icon">🔥</span>
                <div className="area-membros__item-text">
                  <strong>Executar Meu Dia</strong>
                  <span>Marque o que você fez hoje, salve e acompanhe sua sequência.</span>
                </div>
                <Link to="/membros/execucao" className="area-membros__item-link">
                  Abrir
                </Link>
              </li>
            )}
            {pilarAtual.itens.map((item, i) => (
              <li key={i} className="area-membros__item">
                <span className="area-membros__item-icon">
                  {item.tipo === 'pdf' ? '📄' : item.tipo === 'video' ? '🎬' : '📌'}
                </span>
                <div className="area-membros__item-text">
                  <strong>{item.titulo}</strong>
                  {item.descricao && <span>{item.descricao}</span>}
                </div>
                {item.tipo === 'pdf' && (
                  <div className="area-membros__item-actions">
                    <Link
                      to={`/membros/material/${item.arquivo}`}
                      state={{ titulo: item.titulo }}
                      className="area-membros__item-link"
                    >
                      Ler aqui
                    </Link>
                    <a
                      href={`${BASE_MATERIAIS}/${item.arquivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="area-membros__item-link area-membros__item-link--secundario"
                    >
                      Baixar PDF
                    </a>
                  </div>
                )}
                {item.tipo === 'video' && (
                  <a
                    href={`${BASE_MATERIAIS}/${item.arquivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="area-membros__item-link"
                  >
                    Ver vídeo
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="area-membros__vazio">
            <p>Conteúdo em breve. Vídeos, PDFs e scripts serão adicionados aqui.</p>
          </div>
        )}
      </section>
    </>
  )
}
