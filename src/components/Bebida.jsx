import { useState } from 'react'
import { SwooshTop, SwooshBottom } from './Swoosh'
import { LOGO_RESET_METABOLICO } from '../constants'
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
          <div className="bebida__card">
            <h3 className="bebida__card-title">Como usar</h3>
            <p className="bebida__uso">
              <strong className="bebida__uso-dose">1L</strong>
              <span className="bebida__uso-sep">|</span>
              Diluir em 1L de água
            </p>
            <p className="bebida__texto">
              Bebida funcional concentrada. Basta diluir em 1 litro de água e consumir ao longo do dia para aproveitar energia e benefícios.
            </p>
          </div>

          <div className="bebida__visual">
            <div className="bebida__bottle" aria-hidden="true">
              <div className="bebida__bottle-cap" />
              <div className="bebida__bottle-body">
                <div className="bebida__bottle-gradient" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
