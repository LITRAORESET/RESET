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
  const [mostrarSenha, setMostrarSenha] = useState(false)
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
      console.error('[Login Supabase]', error)
      let msg = ''
      if (error.message === 'Invalid login credentials') {
        msg = 'E-mail ou senha incorretos.'
        if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
          msg += ' Em produção: confira a senha e no Supabase (Authentication → URL Configuration) adicione esta URL em Site URL e em Redirect URLs.'
        }
      } else if (error.message === 'Email not confirmed' || error.message?.toLowerCase().includes('email not confirmed')) {
        msg = 'E-mail ainda não confirmado. No Supabase: Authentication → Providers → Email, desative "Confirm email" e salve. Depois tente entrar de novo.'
      } else if (error.message?.toLowerCase().includes('email logins are disabled')) {
        msg = 'Login por e-mail está desativado. No Supabase: Authentication → Providers → Email, ative o provedor "Email" e salve.'
      } else {
        msg = error.message
      }
      setErro(msg)
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
            <span className="login__senha-wrap">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                className="login__input login__input--senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login__toggle-senha"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={0}
              >
                {mostrarSenha ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </span>
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
