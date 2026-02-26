import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SwooshTop, SwooshBottom } from '../components/Swoosh'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha e-mail e senha.')
      return
    }
    // Placeholder: em produção você conectaria a um backend de autenticação
    // Por ora redireciona para a área de membros (demo)
    navigate('/membros')
  }

  return (
    <div className="login-page">
      <div className="login__card">
        <div className="login__header">
          <SwooshTop className="swoosh--large" />
          <h1 className="login__title">
            <span className="login__title-main">LITRÃO</span>
            <span className="login__title-sub">Área de Membros</span>
          </h1>
          <SwooshBottom className="swoosh--large" />
          <p className="login__desc">Acesso para distribuidores do projeto.</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          {erro && <p className="login__erro" role="alert">{erro}</p>}
          <label className="login__label">
            E-mail
            <input
              type="email"
              className="login__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </label>
          <label className="login__label">
            Senha
            <input
              type="password"
              className="login__input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="login__btn">Entrar</button>
        </form>

        <p className="login__footer">
          <Link to="/">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  )
}
