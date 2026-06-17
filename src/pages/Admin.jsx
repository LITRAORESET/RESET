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
      supabase.from('perfil').select('user_id, role, aprovado, rejeitado, leader_id'),
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
    navigate('/admin-login')
  }

  async function handleAprovar(userId) {
    const { error } = await supabase.from('perfil').update({ aprovado: true }).eq('user_id', userId)
    if (!error) carregarDados()
  }

  async function handleRejeitar(userId) {
    const { error } = await supabase.from('perfil').update({ rejeitado: true }).eq('user_id', userId)
    if (!error) carregarDados()
  }

  const [revogando, setRevogando] = useState(null)
  const [buscaMembros, setBuscaMembros] = useState('')
  const [gerandoSenha, setGerandoSenha] = useState(null)
  const [senhaGerada, setSenhaGerada] = useState(null) // { user_id, senha, email }
  const [copiado, setCopiado] = useState(false)

  async function handleRevogarAcesso(userId) {
    if (!window.confirm('Revogar o acesso deste membro? Ele não poderá mais entrar na área de membros.')) return
    setRevogando(userId)
    const { error } = await supabase
      .from('perfil')
      .update({ aprovado: false, rejeitado: true })
      .eq('user_id', userId)
    setRevogando(null)
    if (!error) carregarDados()
    else setErro(error.message)
  }

  async function handleGerarSenhaProvisoria(membro) {
    setGerandoSenha(membro.user_id)
    setSenhaGerada(null)
    setErro('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setErro('Sessão expirada. Faça login novamente.')
        return
      }
      const res = await fetch('/api/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: membro.user_id })
      })
      const json = await res.json()
      if (!res.ok) {
        setErro(json.error || 'Não foi possível gerar a senha.')
        return
      }
      setSenhaGerada({ user_id: membro.user_id, senha: json.senha, email: membro.email, nome: membro.nome })
    } catch (err) {
      setErro('Erro ao conectar. Verifique se a variável SUPABASE_SERVICE_ROLE_KEY está na Vercel.')
    } finally {
      setGerandoSenha(null)
    }
  }

  function mensagemWhatsApp(s) {
    const nome = s.nome?.trim() || s.email
    return `Olá, ${nome}! 👋

Sua senha provisória foi gerada com sucesso.

📧 *E-mail:* ${s.email}
🔑 *Senha provisória:* ${s.senha}

⚠️ Esta é uma senha temporária. Por segurança, troque-a assim que entrar:
   • Faça login no site com o e-mail e a senha acima
   • Vá em Configurações
   • Clique em "Trocar senha"

Qualquer dúvida, é só falar!`
  }

  function copiarSenha(senha) {
    navigator.clipboard?.writeText(senha).then(() => {
      setCopiado('senha')
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  function copiarMensagem() {
    if (!senhaGerada) return
    navigator.clipboard?.writeText(mensagemWhatsApp(senhaGerada)).then(() => {
      setCopiado('mensagem')
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  const perfilPorUser = Object.fromEntries((perfis || []).map((p) => [p.user_id, p]))
  const membroPorUser = Object.fromEntries((membros || []).map((m) => [m.user_id, m]))
  const buscaLower = buscaMembros.trim().toLowerCase()
  const membrosFiltrados = buscaLower
    ? membros.filter((m) => {
        const nome = (m.nome || '').toLowerCase()
        const email = (m.email || '').toLowerCase()
        return nome.includes(buscaLower) || email.includes(buscaLower)
      })
    : membros
  const pendentes = (membros || []).filter((m) => {
    const p = perfilPorUser[m.user_id]
    return p && p.role !== 'admin' && !p.aprovado && !p.rejeitado
  })
  const membrosAprovados = (membros || []).filter((m) => perfilPorUser[m.user_id]?.aprovado)
  const membrosRejeitados = (membros || []).filter((m) => perfilPorUser[m.user_id]?.rejeitado)

  // Analíticas: quantas pessoas cada um indicou (leader_id = esse user)
  const indicadosPorLider = {}
  ;(perfis || []).forEach((p) => {
    const lid = p.leader_id
    if (!lid) return
    if (!indicadosPorLider[lid]) indicadosPorLider[lid] = { total: 0, aprovados: 0, pendentes: 0, rejeitados: 0 }
    indicadosPorLider[lid].total++
    if (p.aprovado) indicadosPorLider[lid].aprovados++
    else if (p.rejeitado) indicadosPorLider[lid].rejeitados++
    else indicadosPorLider[lid].pendentes++
  })
  const rankingIndicacoes = (membros || [])
    .filter((m) => (indicadosPorLider[m.user_id]?.total || 0) > 0)
    .map((m) => ({
      ...m,
      indicados: indicadosPorLider[m.user_id] || { total: 0, aprovados: 0, pendentes: 0, rejeitados: 0 }
    }))
    .sort((a, b) => (b.indicados.total - a.indicados.total))

  function nomeIndicador(userId) {
    if (!userId) return null
    return membroPorUser[userId]?.nome || null
  }

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
          <Link to="/admin-login" className="admin__link">Ir para login</Link>
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
            <Link to="/membros" className="admin__link admin__link--btn">Área de membros</Link>
            <Link to="/painel-execucao" className="admin__link admin__link--btn">Painel de Execução</Link>
            <Link to="/admin-execucao-analitica" className="admin__link admin__link--btn">Análise de execução</Link>
            <Link to="/admin-clube-ouro" className="admin__link admin__link--btn">Clube Ouro & Elite</Link>
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
                    {perfilPorUser[m.user_id]?.leader_id && (
                      <span className="admin__solic-indicador">Indicado por: {nomeIndicador(perfilPorUser[m.user_id].leader_id) || '—'}</span>
                    )}
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
          <h2 className="admin__section-title">Indicações e crescimento</h2>
          <p className="admin__section-desc">Quem convidou quem: controle e analíticas por indicador.</p>
          {rankingIndicacoes.length === 0 && (
            <p className="admin__vazio">Ninguém indicou ainda (cadastros precisam vir pelo link com ?ref=).</p>
          )}
          {rankingIndicacoes.length > 0 && (
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>E-mail</th>
                    <th>Total indicados</th>
                    <th>Aprovados</th>
                    <th>Pendentes</th>
                    <th>Rejeitados</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingIndicacoes.map((m) => (
                    <tr key={m.id}>
                      <td>{m.nome || '—'}</td>
                      <td>{m.email}</td>
                      <td><strong>{m.indicados.total}</strong></td>
                      <td>{m.indicados.aprovados}</td>
                      <td>{m.indicados.pendentes}</td>
                      <td>{m.indicados.rejeitados}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin__section">
          <h2 className="admin__section-title">Movimento recente</h2>
          <p className="admin__section-desc">Últimos cadastros e quem indicou.</p>
          {membros.length === 0 && <p className="admin__vazio">Nenhum cadastro.</p>}
          {membros.length > 0 && (
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Indicado por</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {membros.slice(0, 20).map((m) => {
                    const p = perfilPorUser[m.user_id]
                    const status = p?.aprovado ? 'Aprovado' : p?.rejeitado ? 'Rejeitado' : 'Pendente'
                    return (
                      <tr key={m.id}>
                        <td>{m.nome || '—'}</td>
                        <td>{m.email}</td>
                        <td>{p?.leader_id ? (nomeIndicador(p.leader_id) || '—') : '—'}</td>
                        <td>{status}</td>
                        <td>{new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin__section">
          <h2 className="admin__section-title">Buscar usuário e gerar senha</h2>
          <p className="admin__section-desc">Busque por nome ou e-mail e gere uma senha provisória para o membro. Envie a senha por WhatsApp; ele poderá trocar em Configurações após o login.</p>
          <label className="admin__search-wrap">
            <input
              type="search"
              className="admin__search-input"
              placeholder="Buscar por nome ou e-mail…"
              value={buscaMembros}
              onChange={(e) => setBuscaMembros(e.target.value)}
            />
          </label>
          {senhaGerada && (
            <div className="admin__senha-gerada">
              <p><strong>Senha provisória gerada para {senhaGerada.nome || senhaGerada.email}</strong></p>
              <div className="admin__senha-copy">
                <code>{senhaGerada.senha}</code>
                <button type="button" className="admin__btn-copiar" onClick={() => copiarSenha(senhaGerada.senha)}>
                  {copiado === 'senha' ? 'Copiado!' : 'Copiar senha'}
                </button>
              </div>
              <div className="admin__senha-msg-wrap">
                <p className="admin__senha-msg-label">Mensagem pronta para WhatsApp:</p>
                <pre className="admin__senha-msg">{mensagemWhatsApp(senhaGerada)}</pre>
                <button type="button" className="admin__btn-copiar admin__btn-copiar--msg" onClick={copiarMensagem}>
                  {copiado === 'mensagem' ? 'Copiado!' : 'Copiar mensagem'}
                </button>
              </div>
            </div>
          )}
          {membrosFiltrados.length === 0 && (
            <p className="admin__vazio">
              {membros.length === 0 ? 'Nenhum membro cadastrado.' : 'Nenhum usuário encontrado.'}
            </p>
          )}
          {membrosFiltrados.length > 0 && (
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Status</th>
                    <th>Gerar senha</th>
                  </tr>
                </thead>
                <tbody>
                  {membrosFiltrados.map((m) => {
                    const p = perfilPorUser[m.user_id]
                    const status = p?.role === 'admin' ? 'Admin' : p?.aprovado ? 'Aprovado' : p?.rejeitado ? 'Rejeitado' : 'Pendente'
                    return (
                      <tr key={m.id}>
                        <td>{m.nome || '—'}</td>
                        <td>{m.email}</td>
                        <td>{status}</td>
                        <td>
                          {p?.role === 'admin' ? (
                            <span className="admin__nao-aplica">—</span>
                          ) : (
                            <button
                              type="button"
                              className="admin__btn-senha"
                              onClick={() => handleGerarSenhaProvisoria(m)}
                              disabled={gerandoSenha === m.user_id}
                              title="Gerar senha provisória e exibir para enviar ao membro"
                            >
                              {gerandoSenha === m.user_id ? 'Gerando…' : 'Gerar senha provisória'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
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
                    <th>Indicado por</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {membrosAprovados.map((m) => (
                    <tr key={m.id}>
                      <td>{m.nome || '—'}</td>
                      <td>{m.email}</td>
                      <td>{m.id_distribuidor || '—'}</td>
                      <td>{perfilPorUser[m.user_id]?.leader_id ? (nomeIndicador(perfilPorUser[m.user_id].leader_id) || '—') : '—'}</td>
                      <td>{new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <button
                          type="button"
                          className="admin__btn-revogar"
                          onClick={() => handleRevogarAcesso(m.user_id)}
                          disabled={revogando === m.user_id}
                          title="Revogar acesso: o membro não poderá mais entrar na área de membros."
                        >
                          {revogando === m.user_id ? 'Revogando…' : 'Revogar acesso'}
                        </button>
                      </td>
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
