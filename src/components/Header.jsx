import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className={`header ${menuOpen ? 'header--open' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <span className="header__logo-reset">LITRÃO</span>
          <span className="header__logo-sub">Reset Metabólico</span>
        </Link>

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

        <nav className="header__nav">
          {isHome && (
            <>
              <a href="#bebida" className="header__link">A Bebida</a>
              <a href="#beneficios" className="header__link">Benefícios</a>
              <a href="#oportunidade" className="header__link">Oportunidade</a>
            </>
          )}
          <Link to="/login" className="header__link">Área de Membros</Link>
          <Link to="/login" className="header__cta">Entrar</Link>
        </nav>
      </div>

      {menuOpen && (
        <div className="header__mobile-nav">
          {isHome && (
            <>
              <a href="#bebida" onClick={() => setMenuOpen(false)}>A Bebida</a>
              <a href="#beneficios" onClick={() => setMenuOpen(false)}>Benefícios</a>
              <a href="#oportunidade" onClick={() => setMenuOpen(false)}>Oportunidade</a>
            </>
          )}
          <Link to="/login" onClick={() => setMenuOpen(false)}>Área de Membros</Link>
          <Link to="/login" className="header__mobile-cta" onClick={() => setMenuOpen(false)}>Entrar</Link>
        </div>
      )}
    </header>
  )
}
