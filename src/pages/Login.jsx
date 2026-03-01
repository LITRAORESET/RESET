import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { SwooshTop, SwooshBottom } from '../components/Swoosh'
import { LOGO_RESET_METABOLICO, ADMIN_EMAIL } from '../constants'
import { supabase } from '../lib/supabase'
import { getSession, getPerfil } from '../lib/auth'
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
  const [adminEscolha, setAdminEscolha] = useState(false) // true = logou como admin, mostrar opção de ir pra admin ou membros
  const [checandoSessao, setChecandoSessao] = useState(true) // evita flash do formulário enquanto verifica se já está logado como admin

  const message = location.state?.message

  useEffect(() => {
    if (message) setErro('')
  }, [message])

  // Se já estiver logado como admin, mostrar escolha (Admin ou Área de membros) sem pedir senha de novo
  useEffect(() => {
    let cancelled = false
    async function checkSession() {
      if (!supabase) {
        setChecandoSessao(false)
        return
      }
      const { data } = await getSession()
      if (cancelled) return
      if (!data?.session) {
        setChecandoSessao(false)
        return
      }
      const perfil = await getPerfil()
      if (cancelled) return
      const email = data.session.user?.email?.toLowerCase()
      const ehAdmin = email === ADMIN_EMAIL || perfil?.role === 'admin'
      if (ehAdmin) setAdminEscolha(true)
      setChecandoSessao(false)
    }
    checkSession()
    return () => { cancelled = true }
  }, [])

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
        msg = 'E-mail ou senha incorretos. Confira os dados e tente novamente.'
      } else if (error.message === 'Email not confirmed' || error.message?.toLowerCase().includes('email not confirmed')) {
        msg = 'Seu e-mail ainda não foi autorizado. Entre em contato com seu patrocinador ou líder para liberar seu acesso.'
      } else if (error.message?.toLowerCase().includes('email logins are disabled')) {
        msg = 'O acesso está temporariamente indisponível. Entre em contato com seu patrocinador ou líder.'
      } else {
        msg = 'Não foi possível entrar. Seu acesso pode ainda não ter sido autorizado — entre em contato com seu patrocinador ou líder.'
      }
      setErro(msg)
      return
    }
    const emailLogado = data?.user?.email?.toLowerCase()
    const ehAdminPorEmail = emailLogado === ADMIN_EMAIL
    const perfil = await getPerfil()
    const ehAdminPorPerfil = perfil?.role === 'admin'
    if (ehAdminPorEmail || ehAdminPorPerfil) {
      setAdminEscolha(true)
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

  if (adminEscolha) {
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
              <span className="login__title-sub">Onde deseja entrar?</span>
            </h1>
            <SwooshBottom className="swoosh--large" />
            <p className="login__desc">Você está logado como administrador. Escolha a área:</p>
          </div>
          <div className="login__admin-escolha">
            <button
              type="button"
              className="login__btn login__btn--secondary"
              onClick={() => navigate('/admin')}
            >
              Área administrativa
            </button>
            <button
              type="button"
              className="login__btn"
              onClick={() => navigate('/membros')}
            >
              Área de membros
            </button>
            <button
              type="button"
              className="login__link-btn"
              onClick={() => setAdminEscolha(false)}
            >
              Voltar e usar outro e-mail
            </button>
          </div>
          <p className="login__footer">
            <Link to="/">← Voltar ao início</Link>
          </p>
        </div>
      </div>
    )
  }

  if (checandoSessao) {
    return (
      <div className="login-page">
        <div className="login__card">
          <p className="login__loading">Carregando…</p>
        </div>
      </div>
    )
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
              Seu acesso ainda não foi aprovado. Entre em contato com seu patrocinador ou líder se achar que houve engano.
            </p>
          )}
          {statusMsg === 'aguardando' && (
            <p className="login__aviso" role="status">
              Seu cadastro está aguardando aprovação. Assim que seu patrocinador ou líder liberar, você poderá acessar a área de membros.
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
