import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SwooshTop, SwooshBottom } from '../components/Swoosh'
import { LOGO_RESET_METABOLICO } from '../constants'
import { supabase } from '../lib/supabase'
import './Login.css'

export default function Solicitar() {
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref') || ''
  const [referrerNome, setReferrerNome] = useState('')
  const [referrerUserId, setReferrerUserId] = useState(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [idDistribuidor, setIdDistribuidor] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!refCode.trim() || !supabase) return
    let cancelled = false
    supabase.rpc('get_referrer_info', { ref_code: refCode.trim() })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data && data.length > 0) {
          setReferrerNome(data[0].referrer_nome || 'Indicador')
          setReferrerUserId(data[0].referrer_user_id || null)
        }
      })
    return () => { cancelled = true }
  }, [refCode])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!nome.trim() || !email.trim() || !idDistribuidor.trim() || !senha.trim() || !confirmarSenha.trim()) {
      setErro('Preencha nome, e-mail, ID, senha e confirmação de senha.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem. Digite a mesma senha nos dois campos.')
      return
    }
    if (!supabase) {
      setErro('Cadastro não disponível no momento. Tente mais tarde.')
      return
    }
    setLoading(true)
    const meta = {
      nome: nome.trim(),
      id_distribuidor: idDistribuidor.trim(),
    }
    if (referrerUserId) meta.referred_by = referrerUserId

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      options: { data: meta },
    })
    setLoading(false)
    if (error) {
      setErro(error.message === 'User already registered' ? 'Este e-mail já está cadastrado. Faça login.' : error.message)
      return
    }
    setSucesso(true)
  }

  if (sucesso) {
    return (
      <div className="login-page">
        <div className="login__card">
          <div className="login__header">
            <SwooshTop className="swoosh--large" />
            <h1 className="login__title">
              <img src={LOGO_RESET_METABOLICO} alt="Litrão - Reset Metabólico" className="login__logo-img" />
              <span className="login__title-sub">Cadastro feito</span>
            </h1>
            <SwooshBottom className="swoosh--large" />
          </div>
          <p className="login__sucesso">
            Sua conta foi criada. Aguarde a aprovação da nossa equipe para acessar a área de membros. 
            Você já pode fazer login para ver o status.
          </p>
          <p className="login__footer">
            <Link to="/login">Fazer login</Link>
            <br />
            <Link to="/">← Voltar ao início</Link>
          </p>
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
            <img src={LOGO_RESET_METABOLICO} alt="Litrão - Reset Metabólico" className="login__logo-img" />
            <span className="login__title-sub">Solicitar acesso</span>
          </h1>
          <SwooshBottom className="swoosh--large" />
          <p className="login__desc">
            Preencha os dados e crie sua senha. Após a aprovação da equipe, você acessa a área de membros com este mesmo login.
          </p>
          {referrerNome && (
            <p className="login__indicado">
              Você foi indicado por: <strong>{referrerNome}</strong>
            </p>
          )}
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          {erro && <p className="login__erro" role="alert">{erro}</p>}
          <label className="login__label">
            Nome
            <input
              type="text"
              className="login__input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              autoComplete="name"
            />
          </label>
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
            Seu ID na Herbalife
            <input
              type="text"
              className="login__input"
              value={idDistribuidor}
              onChange={(e) => setIdDistribuidor(e.target.value)}
              placeholder="ID na Herbalife"
              autoComplete="off"
            />
          </label>
          <label className="login__label">
            Senha
            <input
              type="password"
              className="login__input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </label>
          <label className="login__label">
            Confirmar senha
            <input
              type="password"
              className="login__input"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="login__btn" disabled={loading}>
            {loading ? 'Cadastrando…' : 'Solicitar acesso (cadastrar)'}
          </button>
        </form>

        <p className="login__footer">
          Já tem conta? <Link to="/login">Fazer login</Link>
          <br />
          <Link to="/">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  )
}
