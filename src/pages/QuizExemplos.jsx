import { Link } from 'react-router-dom'
import { getDiagnosticoDireto, getDiagnosticoIndireto } from '../data/quizRst'
import './QuizExemplos.css'

// Exemplos de respostas para simular diferentes perfis
// Cada array = 10 respostas (0=nunca, 1=às vezes, 2=frequentemente)
// Ordem: e1,e2,e3,e4, f1,f2,f3, m1,m2,m3
const EXEMPLOS = [
  {
    nome: 'Perfil Energia (mais deficiente em energia)',
    respostas: [2, 2, 2, 2, 1, 0, 0, 0, 0, 0], // energia alta, resto baixo
  },
  {
    nome: 'Perfil Foco (mais deficiente em foco)',
    respostas: [0, 0, 1, 0, 2, 2, 2, 0, 0, 0], // foco alto, resto baixo
  },
  {
    nome: 'Perfil Metabolismo (mais deficiente em metabolismo)',
    respostas: [0, 1, 0, 0, 0, 0, 1, 2, 2, 2], // metabolismo alto
  },
  {
    nome: 'Perfil Misto (vários sinais)',
    respostas: [2, 1, 2, 1, 1, 2, 1, 1, 2, 1], // vários blocos
  },
]

export default function QuizExemplos() {
  return (
    <div className="quiz-exemplos">
      <div className="quiz-exemplos__container">
        <Link to="/membros/quiz" className="quiz-exemplos__voltar">
          ← Voltar ao Quiz RST
        </Link>
        <h1 className="quiz-exemplos__titulo">Exemplos de Diagnóstico do Quiz</h1>
        <p className="quiz-exemplos__intro">
          Veja como o resultado aparece para diferentes perfis de respostas. O diagnóstico personaliza o texto conforme o que a pessoa mais marcou.
        </p>

        {EXEMPLOS.map((exemplo, idx) => {
          const dir = getDiagnosticoDireto(exemplo.respostas)
          const ind = getDiagnosticoIndireto(exemplo.respostas)
          return (
            <section key={idx} className="quiz-exemplos__bloco">
              <h2 className="quiz-exemplos__bloco-titulo">{exemplo.nome}</h2>

              <div className="quiz-exemplos__versoes">
                <div className="quiz-exemplos__versao">
                  <h3 className="quiz-exemplos__versao-titulo">Versão Direta (público quente)</h3>
                  <div className="quiz-exemplos__diagnostico">
                    <p><strong>{dir.intro}</strong></p>
                    {dir.principal && (
                      <div className="quiz-exemplos__principal">
                        <span className="quiz-exemplos__principal-label">Seu principal ponto de atenção:</span>
                        <p>{dir.principal}</p>
                      </div>
                    )}
                    {dir.pontos.filter((p) => !p.principal).length > 0 && (
                      <ul>
                        {dir.pontos.filter((p) => !p.principal).map((p, i) => (
                          <li key={i}>{p.texto}</li>
                        ))}
                      </ul>
                    )}
                    <p>{dir.explicacao}</p>
                    <p><strong>{dir.sacola}</strong></p>
                    <ul className="quiz-exemplos__check">
                      {dir.beneficios.map((b, i) => (
                        <li key={i}>✔️ {b}</li>
                      ))}
                    </ul>
                    <p>{dir.conclusao}</p>
                    <div className="quiz-exemplos__cta">
                      <strong>CTA:</strong> {dir.ctaTexto}
                    </div>
                    <div className="quiz-exemplos__whatsapp">
                      <strong>Mensagem WhatsApp:</strong>
                      <p>"{dir.msgWhatsApp}"</p>
                    </div>
                  </div>
                </div>

                <div className="quiz-exemplos__versao">
                  <h3 className="quiz-exemplos__versao-titulo">Versão Indireta (público frio)</h3>
                  <div className="quiz-exemplos__diagnostico">
                    <p><strong>{ind.intro}</strong></p>
                    {ind.principal && (
                      <div className="quiz-exemplos__principal">
                        <span className="quiz-exemplos__principal-label">Seu principal ponto de atenção:</span>
                        <p>{ind.principal}</p>
                      </div>
                    )}
                    {ind.pontos.filter((p) => !p.principal).length > 0 && (
                      <ul>
                        {ind.pontos.filter((p) => !p.principal).map((p, i) => (
                          <li key={i}>{p.texto}</li>
                        ))}
                      </ul>
                    )}
                    <p><strong>{ind.explicacao}</strong></p>
                    <ul className="quiz-exemplos__check">
                      {ind.necessidades.map((n, i) => (
                        <li key={i}>✔️ {n}</li>
                      ))}
                    </ul>
                    <p><strong>{ind.alerta}</strong></p>
                    <ul>
                      {ind.alertaItens.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                    <p>{ind.transicao}</p>
                    <div className="quiz-exemplos__cta">
                      <strong>CTA:</strong> {ind.ctaTexto}
                    </div>
                    <div className="quiz-exemplos__whatsapp">
                      <strong>Mensagem WhatsApp:</strong>
                      <p>"{ind.msgWhatsApp}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
