import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { SwooshTop, SwooshBottom } from '../components/Swoosh'
import { LOGO_RESET_METABOLICO, ADMIN_EMAIL } from '../constants'
import { supabase } from '../lib/supabase'
import { getPerfil } from '../lib/auth'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [statusMsg, setStatusMsg] = useState(null) // 'aguardando' | 'rejeitado'
  const [loading, setLoading] = useState(false)

  const message = location.state?.message

  useEffect(() => {
    if (message) setErro('')
  }, [message])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setStatusMsg(null)
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha e-mail e senha.')
      return
    }
    if (!supabase) {
      navigate('/membros')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })
    setLoading(false)
    if (error) {
      if (error.message === 'Invalid login credentials') {
        setErro('E-mail ou senha incorretos.')
        if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
          setErro((prev) => prev + ' Em produção: confira a senha e no Supabase (Authentication → URL Configuration) adicione esta URL em Site URL e em Redirect URLs.')
        }
      } else if (error.message === 'Email not confirmed' || error.message?.toLowerCase().includes('email not confirmed')) {
        setErro('E-mail ainda não confirmado. 1) No Supabase: Authentication → Providers → Email, desative "Confirm email". 2) No SQL Editor, execute o arquivo supabase-admin-ja-cadastrado.sql. Depois tente entrar de novo.')
      } else if (error.message?.toLowerCase().includes('email logins are disabled')) {
        setErro('Login por e-mail está desativado no projeto. No Supabase: Authentication → Providers → Email, ative o provedor "Email" e salve.')
      } else {
        setErro(error.message)
      }
      return
    }
    const emailLogado = data?.user?.email?.toLowerCase()
    if (emailLogado === ADMIN_EMAIL) {
      navigate('/admin')
      return
    }
    const perfil = await getPerfil()
    if (perfil?.role === 'admin') {
      navigate('/admin')
      return
    }
    if (perfil?.rejeitado) {
      setStatusMsg('rejeitado')
      return
    }
    if (!perfil?.aprovado) {
      setStatusMsg('aguardando')
      return
    }
    navigate('/membros')
  }

  return (
    <div className="login-page">
      <div className="login__card">
        <div className="login__header">
          <SwooshTop className="swoosh--large" />
          <h1 className="login__title">
            <img
              src={LOGO_RESET_METABOLICO}
              alt="Litrão - Reset Metabólico"
              className="login__logo-img"
            />
            <span className="login__title-sub">Área de Membros</span>
          </h1>
          <SwooshBottom className="swoosh--large" />
          <p className="login__desc">Acesso ao conteúdo exclusivo do projeto.</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          {message && <p className="login__sucesso" role="status">{message}</p>}
          {erro && <p className="login__erro" role="alert">{erro}</p>}
          {statusMsg === 'rejeitado' && (
            <p className="login__erro" role="alert">
              Sua solicitação de acesso foi rejeitada. Entre em contato com a equipe se achar que houve engano.
            </p>
          )}
          {statusMsg === 'aguardando' && (
            <p className="login__aviso" role="status">
              Seu cadastro está aguardando aprovação. Quando aprovado, você poderá acessar a área de membros.
            </p>
          )}
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
          <button type="submit" className="login__btn" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="login__footer">
          Não tem conta? <Link to="/solicitar">Solicitar acesso (cadastro)</Link>
          <br />
          <Link to="/">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  )
}
