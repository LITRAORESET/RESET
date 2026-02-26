import { Link } from 'react-router-dom'
import './Cta.css'

export default function Cta() {
  return (
    <section className="cta">
      <div className="cta__container">
        <h2 className="cta__title">Já é distribuidor?</h2>
        <p className="cta__text">Acesse a área de membros para materiais, suporte e conteúdo exclusivo.</p>
        <Link to="/login" className="cta__btn">Entrar na Área de Membros</Link>
      </div>
    </section>
  )
}
