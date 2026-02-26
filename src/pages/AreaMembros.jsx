import { Link } from 'react-router-dom'
import { SwooshTop } from '../components/Swoosh'
import './AreaMembros.css'

export default function AreaMembros() {
  return (
    <div className="area-membros">
      <div className="area-membros__container">
        <SwooshTop className="swoosh--large" />
        <h1 className="area-membros__title">
          <span className="area-membros__title-main">Área de Membros</span>
          <span className="area-membros__title-sub">Litrão · Reset Metabólico</span>
        </h1>
        <p className="area-membros__welcome">
          Bem-vindo à área exclusiva para distribuidores. Aqui você terá acesso a materiais, 
          suporte e conteúdo para impulsionar seu negócio.
        </p>

        <div className="area-membros__grid">
          <div className="area-membros__card">
            <span className="area-membros__card-icon">📋</span>
            <h3>Materiais de divulgação</h3>
            <p>Em breve: artes, textos e guias para usar nas redes e com clientes.</p>
          </div>
          <div className="area-membros__card">
            <span className="area-membros__card-icon">💬</span>
            <h3>Suporte</h3>
            <p>Canal direto com a liderança do projeto para dúvidas e sugestões.</p>
          </div>
          <div className="area-membros__card">
            <span className="area-membros__card-icon">📈</span>
            <h3>Conteúdo exclusivo</h3>
            <p>Treinamentos e novidades sobre o produto e a oportunidade de negócio.</p>
          </div>
        </div>

        <p className="area-membros__note">
          Esta área está em construção. Em breve você poderá fazer login real e acessar todo o conteúdo.
        </p>

        <Link to="/" className="area-membros__back">← Voltar ao site</Link>
      </div>
    </div>
  )
}
