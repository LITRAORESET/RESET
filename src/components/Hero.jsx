import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SwooshTop, SwooshBottom } from './Swoosh'
import { LOGO_RESET_METABOLICO, IMAGEM_CAPA } from '../constants'
import './Hero.css'

export default function Hero() {
  const [logoError, setLogoError] = useState(false)

  return (
    <section className="hero">
      <div
          className={`hero__bg${IMAGEM_CAPA ? ' hero__bg--cover' : ''}`}
          style={IMAGEM_CAPA ? { backgroundImage: `url(${IMAGEM_CAPA})` } : undefined}
          aria-hidden="true"
        />
      <div className="hero__content">
        <SwooshTop className="swoosh--large" />
        <h1 className="hero__title">
          {!logoError ? (
            <img
              src={LOGO_RESET_METABOLICO}
              alt="Litrão - Reset Metabólico"
              className="hero__logo-img"
              onError={() => setLogoError(true)}
            />
          ) : (
            <>
              <span className="hero__title-main">LITRÃO</span>
              <span className="hero__title-sub">Reset Metabólico</span>
            </>
          )}
        </h1>
        <SwooshBottom className="swoosh--large" />
        <p className="hero__tagline">Energia Natural em Movimento</p>
        <p className="hero__desc">
          Conheça o projeto de bebidas funcionais para distribuidores Herbalife: 
          a bebida que revitaliza e a oportunidade de negócio que transforma.
        </p>
        <div className="hero__actions">
          <a href="#bebida" className="hero__btn hero__btn--primary">Conhecer a Bebida</a>
          <a href="#oportunidade" className="hero__btn hero__btn--secondary">Ver Oportunidade</a>
          <Link to="/login" className="hero__btn hero__btn--outline">Área de Membros</Link>
        </div>
      </div>
    </section>
  )
}
