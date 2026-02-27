import { Link } from 'react-router-dom'
import { SITE_URL } from '../constants'
import './Footer.css'

const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(SITE_URL)}`

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
        <div className="footer__qr">
          <img src={QR_CODE_URL} alt="QR Code para litraoreset.com.br" width={120} height={120} />
          <p className="footer__qr-label">Escaneie para acessar</p>
        </div>
        <div className="footer__links">
          <Link to="/">Início</Link>
          <Link to="/login">Área de Membros</Link>
        </div>
        <p className="footer__copy">
          Litrão Reset Metabólico. &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
