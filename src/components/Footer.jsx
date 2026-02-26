import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__swoosh" aria-hidden="true" />
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__logo-reset">LITRÃO</span>
          <span className="footer__logo-sub">Reset Metabólico</span>
          <p className="footer__tagline">Energia Natural em Movimento</p>
        </div>
        <div className="footer__links">
          <Link to="/">Início</Link>
          <Link to="/login">Área de Membros</Link>
        </div>
        <p className="footer__copy">
          Projeto para distribuidores Herbalife. &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
