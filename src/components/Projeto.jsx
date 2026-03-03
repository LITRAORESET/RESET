import { SwooshBottom } from './Swoosh'
import { VIDEO_PROJETO, CAPA_VIDEO_PROJETO } from '../constants'
import './Projeto.css'

const isYouTube = (url) => typeof url === 'string' && /youtube|youtu\.be/i.test(url)

export default function Projeto() {
  const useYouTube = isYouTube(VIDEO_PROJETO)

  return (
    <section id="projeto" className="projeto">
      <div className="projeto__container">
        <h2 className="projeto__title">Conheça o projeto Reset metabólico</h2>
        <SwooshBottom className="swoosh--large projeto__swoosh" />
        <div className="projeto__video-wrap">
          {useYouTube ? (
            <iframe
              className="projeto__video"
              src={VIDEO_PROJETO}
              title="Vídeo explicativo do projeto Reset metabólico"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
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
          )}
        </div>
      </div>
    </section>
  )
}
