import { Link } from 'react-router-dom'
import { SwooshBottom } from './Swoosh'
import { VIDEO_OPORTUNIDADE, CAPA_VIDEO_OPORTUNIDADE } from '../constants'
import './Oportunidade.css'

export default function Oportunidade() {
  return (
    <section id="oportunidade" className="oportunidade">
      <div className="oportunidade__container">
        <h2 className="oportunidade__title">Oportunidade de Negócio</h2>
        <SwooshBottom className="swoosh--large oportunidade__swoosh" />
        <p className="oportunidade__video-label">
          Vídeo: Conheça o projeto
        </p>
        <div className="oportunidade__video-wrap">
          <video
            className="oportunidade__video"
            src={VIDEO_OPORTUNIDADE}
            controls
            playsInline
            poster={CAPA_VIDEO_OPORTUNIDADE}
            aria-label="Vídeo sobre a oportunidade de negócio Litrão"
          >
            Seu navegador não suporta vídeos. Acesse <a href={VIDEO_OPORTUNIDADE}>o vídeo</a> diretamente.
          </video>
        </div>
        <p className="oportunidade__intro">
          Como distribuidor do projeto Litrão, você faz parte de um movimento de 
          bebidas funcionais com a força da Herbalife: produto reconhecido e 
          suporte para crescer no negócio.
        </p>
        <ul className="oportunidade__list">
          <li>Produto alinhado à tendência de saúde e bem-estar</li>
          <li>Marca forte e mensagem clara: Energia Natural em Movimento</li>
          <li>Suporte e materiais para divulgação</li>
          <li>Comunidade de distribuidores e liderança</li>
        </ul>
        <div className="oportunidade__actions">
          <Link to="/login" className="oportunidade__btn">
            Acessar Área de Membros
          </Link>
        </div>
      </div>
    </section>
  )
}
