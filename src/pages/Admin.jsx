import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SwooshTop } from '../components/Swoosh'
import { supabase } from '../lib/supabase'
import { getUserRole, signOut } from '../lib/auth'
import './Admin.css'

export default function Admin() {
  const navigate = useNavigate()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [membros, setMembros] = useState([])
  const [perfis, setPerfis] = useState([])
  const [erro, setErro] = useState('')

  async function carregarDados() {
    const [membrosRes, perfilRes] = await Promise.all([
      supabase.from('membros').select('id, user_id, nome, email, id_distribuidor, mensagem, created_at').order('created_at', { ascending: false }),
      supabase.from('perfil').select('user_id, role, aprovado, rejeitado'),
    ])
    if (membrosRes.error) setErro(membrosRes.error.message)
    else setMembros(membrosRes.data ?? [])
    if (perfilRes.error) setErro(perfilRes.error.message)
    else setPerfis(perfilRes.data ?? [])
  }

  useEffect(() => {
    let cancelled = false
    async function check() {
      const r = await getUserRole()
      if (cancelled) return
      setRole(r)
      if (r !== 'admin') {
        setLoading(false)
        return
      }
      await carregarDados()
      if (cancelled) return
      setLoading(false)
    }
    check()
    return () => { cancelled = true }
  }, [])

  async function handleSair() {
    await signOut()
    navigate('/login')
  }

  async function handleAprovar(userId) {
    const { error } = await supabase.from('perfil').update({ aprovado: true }).eq('user_id', userId)
    if (!error) carregarDados()
  }

  async function handleRejeitar(userId) {
    const { error } = await supabase.from('perfil').update({ rejeitado: true }).eq('user_id', userId)
    if (!error) carregarDados()
  }

  const perfilPorUser = Object.fromEntries((perfis || []).map((p) => [p.user_id, p]))
  const pendentes = (membros || []).filter((m) => {
    const p = perfilPorUser[m.user_id]
    return p && p.role !== 'admin' && !p.aprovado && !p.rejeitado
  })
  const membrosAprovados = (membros || []).filter((m) => perfilPorUser[m.user_id]?.aprovado)
  const membrosRejeitados = (membros || []).filter((m) => perfilPorUser[m.user_id]?.rejeitado)

  if (loading) {
    return (
      <div className="admin">
        <div className="admin__container">
          <p className="admin__loading">Carregando…</p>
        </div>
      </div>
    )
  }

  if (role !== 'admin') {
    return (
      <div className="admin">
        <div className="admin__container">
          <p className="admin__negado">Acesso negado. Faça login como administrador.</p>
          <Link to="/login" className="admin__link">Ir para login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <div className="admin__container">
        <SwooshTop className="swoosh--large" />
        <div className="admin__header">
          <h1 className="admin__title">Área administrativa</h1>
          <p className="admin__subtitle">Controle de membros · Litrão Reset Metabólico</p>
          <div className="admin__header-actions">
            <Link to="/painel-execucao" className="admin__link admin__link--btn">Painel de Execução</Link>
            <button type="button" className="admin__btn-sair" onClick={handleSair}>
              Sair
            </button>
          </div>
        </div>

        <section className="admin__section">
          <h2 className="admin__section-title">Solicitações pendentes</h2>
          <p className="admin__section-desc">Aprove ou rejeite com um clique. Quem for aprovado já pode fazer login e acessar a área de membros.</p>
          {erro && <p className="admin__erro">{erro}</p>}
          {pendentes.length === 0 && !erro && (
            <p className="admin__vazio">Nenhuma solicitação pendente.</p>
          )}
          {pendentes.length > 0 && (
            <ul className="admin__solicitacoes">
              {pendentes.map((m) => (
                <li key={m.id} className="admin__solic-item">
                  <div className="admin__solic-info">
                    <strong>{m.nome || '—'}</strong>
                    <span className="admin__solic-email">{m.email}</span>
                    {m.id_distribuidor && (
                      <span className="admin__solic-id">ID: {m.id_distribuidor}</span>
                    )}
                    {m.mensagem && <p className="admin__solic-msg">{m.mensagem}</p>}
                    <span className="admin__solic-data">{new Date(m.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="admin__solic-acoes">
                    <button type="button" className="admin__btn-aprovar" onClick={() => handleAprovar(m.user_id)}>
                      Aprovar
                    </button>
                    <button type="button" className="admin__btn-rejeitar" onClick={() => handleRejeitar(m.user_id)}>
                      Rejeitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin__section">
          <h2 className="admin__section-title">Membros aprovados</h2>
          {membrosAprovados.length === 0 && (
            <p className="admin__vazio">Nenhum membro aprovado ainda.</p>
          )}
          {membrosAprovados.length > 0 && (
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>ID</th>
                    <th>Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {membrosAprovados.map((m) => (
                    <tr key={m.id}>
                      <td>{m.nome || '—'}</td>
                      <td>{m.email}</td>
                      <td>{m.id_distribuidor || '—'}</td>
                      <td>{new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="admin__footer">
          <Link to="/">← Voltar ao site</Link>
        </p>
      </div>
    </div>
  )
}
