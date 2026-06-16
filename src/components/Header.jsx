import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LOGO_RESET_METABOLICO } from '../constants'
import './Header.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isPaginaPropagacao = location.pathname.startsWith('/quiz/') || location.pathname.startsWith('/oportunidade/')

  return (
    <header className={`header ${menuOpen ? 'header--open' : ''} ${isPaginaPropagacao ? 'header--quiz' : ''}`}>
      <div className="header__inner">
        {!isPaginaPropagacao && (
          <button
            type="button"
            className="header__menu-btn"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        )}

        <Link to="/" className="header__logo">
          {!logoError ? (
            <img
              src={LOGO_RESET_METABOLICO}
              alt="Litrão - Reset Metabólico"
              className="header__logo-img"
              onError={() => setLogoError(true)}
            />
          ) : (
            <>
              <span className="header__logo-reset">LITRÃO</span>
              <span className="header__logo-sub">Reset Metabólico</span>
            </>
          )}
        </Link>

        {!isPaginaPropagacao && (
          <nav className="header__nav">
            {isHome && (
              <>
                <a href="#bebida" className="header__link">A Bebida</a>
                <a href="#beneficios" className="header__link">Benefícios</a>
                <a href="#oportunidade" className="header__link">Oportunidade</a>
              </>
            )}
          </nav>
        )}
      </div>

      {menuOpen && !isPaginaPropagacao && (
        <div className="header__mobile-nav">
          {isHome && (
            <>
              <a href="#bebida" onClick={() => setMenuOpen(false)}>A Bebida</a>
              <a href="#beneficios" onClick={() => setMenuOpen(false)}>Benefícios</a>
              <a href="#oportunidade" onClick={() => setMenuOpen(false)}>Oportunidade</a>
            </>
          )}
        </div>
      )}
    </header>
  )
}
