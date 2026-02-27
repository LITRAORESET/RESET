import { useState } from 'react'
import { SwooshTop, SwooshBottom } from './Swoosh'
import { LOGO_RESET_METABOLICO, VIDEO_BEBIDA, CAPA_VIDEO_BEBIDA } from '../constants'
import './Bebida.css'

export default function Bebida() {
  const [logoError, setLogoError] = useState(false)

  return (
    <section id="bebida" className="bebida">
      <div className="bebida__container">
        <div className="bebida__header">
          <SwooshTop className="swoosh--large" />
          <h2 className="bebida__title">
            {!logoError ? (
              <img
                src={LOGO_RESET_METABOLICO}
                alt="Reset Metabólico"
                className="bebida__logo-img"
                onError={() => setLogoError(true)}
              />
            ) : (
              <>
                <span className="bebida__title-main">RESET</span>
                <span className="bebida__title-sub">Metabólico</span>
              </>
            )}
          </h2>
          <SwooshBottom className="swoosh--large" />
          <p className="bebida__tagline">Energia Natural em Movimento</p>
        </div>

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
