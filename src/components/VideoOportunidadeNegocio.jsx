import { VIDEO_APRESENTACAO_NEGOCIO } from '../constants'

const isYouTube = (url) => typeof url === 'string' && /youtube|youtu\.be/i.test(url)

export default function VideoOportunidadeNegocio() {
  const useYouTube = isYouTube(VIDEO_APRESENTACAO_NEGOCIO)

  return (
    <div className="oportunidade-page__video-wrap">
      {useYouTube ? (
        <iframe
          className="oportunidade-page__video oportunidade-page__video--iframe"
          src={VIDEO_APRESENTACAO_NEGOCIO}
          title="Apresentação da oportunidade de negócio"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          className="oportunidade-page__video"
          src={VIDEO_APRESENTACAO_NEGOCIO}
          controls
          playsInline
          aria-label="Apresentação da oportunidade de negócio"
        >
          Seu navegador não suporta vídeos. Acesse <a href={VIDEO_APRESENTACAO_NEGOCIO}>o vídeo</a> diretamente.
        </video>
      )}
    </div>
  )
}
