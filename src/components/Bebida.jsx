import { VIDEO_BEBIDA, CAPA_VIDEO_BEBIDA } from '../constants'
import './Bebida.css'

export default function Bebida() {
  return (
    <section id="bebida" className="bebida">
      <div className="bebida__container">
        <div className="bebida__content">
          <div className="bebida__visual">
            <div className="bebida__video-wrap">
              <video
                className="bebida__video"
                src={VIDEO_BEBIDA}
                controls
                playsInline
                poster={CAPA_VIDEO_BEBIDA}
                aria-label="Vídeo sobre a bebida Litrão Reset Metabólico"
              >
                Seu navegador não suporta vídeos. Acesse <a href={VIDEO_BEBIDA}>o vídeo</a> diretamente.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
