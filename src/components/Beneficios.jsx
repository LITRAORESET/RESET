import { SwooshTop } from './Swoosh'
import './Beneficios.css'

const LISTA = [
  'Corpo mais leve e menos inchaço',
  'Energia natural ao longo do dia',
  'Foco e clareza mental',
  'Metabolismo mais ativo',
  'Ação antioxidante',
  'Bem-estar de dentro pra fora',
]

export default function Beneficios() {
  return (
    <section id="beneficios" className="beneficios">
      <div className="beneficios__container">
        <SwooshTop className="swoosh--large beneficios__swoosh" />
        <h2 className="beneficios__title">Benefícios</h2>
        <ul className="beneficios__list">
          {LISTA.map((item, i) => (
            <li key={i} className="beneficios__item">
              <span className="beneficios__check" aria-hidden="true">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
