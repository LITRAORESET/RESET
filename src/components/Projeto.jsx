import { SwooshBottom } from './Swoosh'
import { VIDEO_PROJETO, CAPA_VIDEO_PROJETO } from '../constants'
import './Projeto.css'

export default function Projeto() {
  return (
    <section id="projeto" className="projeto">
      <div className="projeto__container">
        <h2 className="projeto__title">Conheça o projeto Reset metabólico</h2>
        <SwooshBottom className="swoosh--large projeto__swoosh" />
        <div className="projeto__video-wrap">
          <video
            className="projeto__video"
            src={VIDEO_PROJETO}
            controls
            playsInline
            poster={CAPA_VIDEO_PROJETO}
            aria-label="Vídeo explicativo do projeto Reset metabólico"
          >
            Seu navegador não suporta vídeos. Acesse <a href={VIDEO_PROJETO}>o vídeo</a> diretamente.
          </video>
        </div>
      </div>
    </section>
  )
}
