import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getUserRole } from '../lib/auth'
import {
  getISOWeek,
  getMondayOfWeek,
  declaracaoQualificaClubeOro,
  nomeMes
} from '../lib/clubeOuro'
import './AdminClubeOuro.css'

export default function AdminClubeOuro() {
  const navigate = useNavigate()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [declaracoes, setDeclaracoes] = useState([])
  const [membros, setMembros] = useState([])
  const [eliteHistory, setEliteHistory] = useState([])
  const [validando, setValidando] = useState(null)
  const [registrandoElite, setRegistrandoElite] = useState(false)

  const now = new Date()
  const { year: isoYear, weekNumber: isoWeek } = getISOWeek(now)
  const month = now.getMonth() + 1

  const [filtroYear, setFiltroYear] = useState(isoYear)
  const [filtroWeek, setFiltroWeek] = useState(isoWeek)

  const nomesPorUserId = (membros || []).reduce((acc, m) => {
    acc[m.user_id] = m.nome || m.email || m.user_id?.slice(0, 8) || '—'
    return acc
  }, {})

  const declaracoesDaSemana = (declaracoes || []).filter(
    (d) => d.year === filtroYear && d.week_number === filtroWeek
  )
  const pendentesSemana = declaracoesDaSemana.filter((d) => !d.validado_admin)
  const qualificadosClubeOuroSemana = declaracoesDaSemana.filter((d) =>
    declaracaoQualificaClubeOro(d)
  )

  // Elite do mês: usuários com 4+ semanas qualificadas no mês (apenas validados)
  const declaracoesValidadas = (declaracoes || []).filter((d) => d.validado_admin)
  const qualificadas = declaracoesValidadas.filter(declaracaoQualificaClubeOro)
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const semanasPorUserNoMes = qualificadas
    .filter((d) => {
      const monday = getMondayOfWeek(d.year, d.week_number)
      const [y, m] = monday.split('-').map(Number)
      return y === currentYear && m === currentMonth
    })
    .reduce((acc, d) => {
      acc[d.user_id] = (acc[d.user_id] || 0) + 1
      return acc
    }, {})
  const eliteDoMesUserIds = Object.entries(semanasPorUserNoMes)
    .filter(([, count]) => count >= 4)
    .map(([uid]) => uid)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const r = await getUserRole()
      if (cancelled) return
      setRole(r)
      if (r !== 'admin') {
        setLoading(false)
        return
      }
      if (!supabase) {
        setLoading(false)
        return
      }
      const [declRes, membrosRes, eliteRes] = await Promise.all([
        supabase.from('clube_ouro_declaracao').select('id, user_id, year, week_number, total_sacolas, novos_distribuidores, validado_admin, created_at').order('year', { ascending: false }).order('week_number', { ascending: false }).limit(200),
        supabase.from('membros').select('user_id, nome, email'),
        supabase.from('elite_history').select('user_id, mes, ano, total_sacolas_mes, total_recrutamentos_mes, semanas_qualificadas, data_conquista').order('ano', { ascending: false }).order('mes', { ascending: false }).limit(100)
      ])
      if (!cancelled) {
        setDeclaracoes(declRes.data || [])
        setMembros(membrosRes.data || [])
        setEliteHistory(eliteRes.data || [])
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (loading) return
    if (role !== 'admin') navigate('/login', { replace: true })
  }, [loading, role, navigate])

  async function handleValidar(declaracaoId, validar) {
    setValidando(declaracaoId)
    const { error } = await supabase
      .from('clube_ouro_declaracao')
      .update({ validado_admin: validar })
      .eq('id', declaracaoId)
    setValidando(null)
    if (!error) {
      setDeclaracoes((prev) =>
        prev.map((d) => (d.id === declaracaoId ? { ...d, validado_admin: validar } : d))
      )
    } else alert('Erro: ' + error.message)
  }

  async function handleRegistrarEliteMes() {
    if (eliteDoMesUserIds.length === 0) return
    setRegistrandoElite(true)
    const ano = now.getFullYear()
    const mes = now.getMonth() + 1
    const jaRegistrados = new Set(
      (eliteHistory || [])
        .filter((h) => h.ano === ano && h.mes === mes)
        .map((h) => h.user_id)
    )
    const toInsert = eliteDoMesUserIds.filter((uid) => !jaRegistrados.has(uid))
    for (const uid of toInsert) {
      const semanasQualificadas = semanasPorUserNoMes[uid] || 4
      const declsUser = qualificadas.filter((d) => {
        const monday = getMondayOfWeek(d.year, d.week_number)
        const [y, m] = monday.split('-').map(Number)
        return d.user_id === uid && y === ano && m === mes
      })
      const total_sacolas_mes = declsUser.reduce((s, d) => s + (d.total_sacolas || 0), 0)
      const total_recrutamentos_mes = declsUser.reduce((s, d) => s + (d.novos_distribuidores || 0), 0)
      await supabase.from('elite_history').upsert(
        { user_id: uid, ano, mes, total_sacolas_mes, total_recrutamentos_mes, semanas_qualificadas, data_conquista: new Date().toISOString().slice(0, 10) },
        { onConflict: 'user_id,ano,mes' }
      )
    }
    if (toInsert.length > 0) {
      const { data } = await supabase.from('elite_history').select('*').order('ano', { ascending: false }).order('mes', { ascending: false }).limit(100)
      if (data) setEliteHistory(data)
    }
    setRegistrandoElite(false)
  }

  if (loading) {
    return (
      <div className="admin-clube">
        <p className="admin-clube__loading">Carregando…</p>
      </div>
    )
  }

  if (role !== 'admin') {
    return (
      <div className="admin-clube">
        <p className="admin-clube__negado">Acesso negado. Faça login como administrador.</p>
        <Link to="/login">Ir para login</Link>
      </div>
    )
  }

  const inicioSemana = getMondayOfWeek(filtroYear, filtroWeek)
  const textoSemana = `${inicioSemana} (semana ${filtroWeek}/${filtroYear})`

  return (
    <div className="admin-clube">
      <header className="admin-clube__header">
        <h1 className="admin-clube__titulo">Clube Ouro & Elite – Administração</h1>
        <p className="admin-clube__subtitulo">Valide declarações e veja qualificados para os treinamentos.</p>
        <div className="admin-clube__links">
          <Link to="/admin" className="admin-clube__link">Voltar ao Admin</Link>
          <Link to="/painel-execucao" className="admin-clube__link">Painel de Execução</Link>
        </div>
      </header>

      {/* Filtro semana */}
      <section className="admin-clube__section">
        <h2>Semana</h2>
        <div className="admin-clube__filtro">
          <label>
            Ano
            <input
              type="number"
              min={2024}
              max={2030}
              value={filtroYear}
              onChange={(e) => setFiltroYear(Number(e.target.value))}
              className="admin-clube__input"
            />
          </label>
          <label>
            Semana ISO
            <input
              type="number"
              min={1}
              max={53}
              value={filtroWeek}
              onChange={(e) => setFiltroWeek(Number(e.target.value))}
              className="admin-clube__input"
            />
          </label>
        </div>
        <p className="admin-clube__semana-texto">{textoSemana}</p>
      </section>

      {/* Declarações da semana – validar */}
      <section className="admin-clube__section">
        <h2>Declarações da semana (validar)</h2>
        <p className="admin-clube__criteria">Só conta para Clube Ouro se validado e se sacolas ≥ 12 e novos distribuidores ≥ 1.</p>
        {declaracoesDaSemana.length === 0 ? (
          <p className="admin-clube__vazio">Nenhuma declaração nesta semana.</p>
        ) : (
          <div className="admin-clube__table-wrap">
            <table className="admin-clube__table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Sacolas</th>
                  <th>Novos dist.</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {declaracoesDaSemana.map((d) => (
                  <tr key={d.id}>
                    <td>{nomesPorUserId[d.user_id] || d.user_id?.slice(0, 8)}</td>
                    <td>{d.total_sacolas}</td>
                    <td>{d.novos_distribuidores}</td>
                    <td>
                      {d.validado_admin ? (
                        declaracaoQualificaClubeOro(d) ? (
                          <span className="admin-clube__badge admin-clube__badge--ouro">Clube Ouro</span>
                        ) : (
                          <span className="admin-clube__badge admin-clube__badge--nao">Não atingiu</span>
                        )
                      ) : (
                        <span className="admin-clube__badge admin-clube__badge--pendente">Pendente</span>
                      )}
                    </td>
                    <td>
                      {d.validado_admin ? (
                        <button
                          type="button"
                          className="admin-clube__btn admin-clube__btn--secondary"
                          onClick={() => handleValidar(d.id, false)}
                          disabled={validando === d.id}
                        >
                          Desfazer
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-clube__btn admin-clube__btn--ok"
                          onClick={() => handleValidar(d.id, true)}
                          disabled={validando === d.id}
                        >
                          {validando === d.id ? '…' : 'Validar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pendentesSemana.length > 0 && (
          <p className="admin-clube__pendentes">{pendentesSemana.length} declaração(ões) pendente(s) de validação.</p>
        )}
      </section>

      {/* Qualificados Clube Ouro esta semana */}
      <section className="admin-clube__section">
        <h2>Qualificados Clube Ouro esta semana</h2>
        <p className="admin-clube__subtitulo-secao">Quem atinge 12 sacolas + 1 novo distribuidor (validado) tem acesso ao treinamento de quarta 8h.</p>
        {qualificadosClubeOuroSemana.length === 0 ? (
          <p className="admin-clube__vazio">Ninguém qualificado nesta semana ainda.</p>
        ) : (
          <ul className="admin-clube__lista">
            {qualificadosClubeOuroSemana.map((d) => (
              <li key={d.id}>
                <strong>{nomesPorUserId[d.user_id] || d.user_id?.slice(0, 8)}</strong> – {d.total_sacolas} sacolas, {d.novos_distribuidores} novo(s) distribuidor(es)
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Elite do Mês */}
      <section className="admin-clube__section">
        <h2>Elite do Mês ({nomeMes(month)}/{now.getFullYear()})</h2>
        <p className="admin-clube__subtitulo-secao">4 semanas Clube Ouro no mesmo mês. Acesso ao treinamento especial na primeira semana do mês seguinte.</p>
        {eliteDoMesUserIds.length === 0 ? (
          <p className="admin-clube__vazio">Ninguém atingiu 4 semanas Clube Ouro este mês ainda.</p>
        ) : (
          <>
            <ul className="admin-clube__lista">
              {eliteDoMesUserIds.map((uid) => (
                <li key={uid}>
                  <strong>{nomesPorUserId[uid] || uid?.slice(0, 8)}</strong> – {semanasPorUserNoMes[uid]} semanas qualificadas
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="admin-clube__btn admin-clube__btn--elite"
              onClick={handleRegistrarEliteMes}
              disabled={registrandoElite}
            >
              {registrandoElite ? 'Registrando…' : 'Registrar conquistas Elite deste mês'}
            </button>
          </>
        )}
      </section>

      {/* Histórico Elite */}
      <section className="admin-clube__section">
        <h2>Histórico Elite</h2>
        <p className="admin-clube__subtitulo-secao">Registro de quem conquistou Elite por mês.</p>
        {eliteHistory.length === 0 ? (
          <p className="admin-clube__vazio">Nenhum registro ainda.</p>
        ) : (
          <div className="admin-clube__table-wrap">
            <table className="admin-clube__table">
              <thead>
                <tr>
                  <th>Membro</th>
                  <th>Mês/Ano</th>
                  <th>Sacolas (mês)</th>
                  <th>Recrutamentos (mês)</th>
                  <th>Semanas</th>
                  <th>Data conquista</th>
                </tr>
              </thead>
              <tbody>
                {eliteHistory.map((h) => (
                  <tr key={`${h.user_id}-${h.ano}-${h.mes}`}>
                    <td>{nomesPorUserId[h.user_id] || h.user_id?.slice(0, 8)}</td>
                    <td>{nomeMes(h.mes)}/{h.ano}</td>
                    <td>{h.total_sacolas_mes}</td>
                    <td>{h.total_recrutamentos_mes}</td>
                    <td>{h.semanas_qualificadas}</td>
                    <td>{h.data_conquista ? new Date(h.data_conquista).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="admin-clube__footer">
        <Link to="/admin">← Voltar ao admin</Link>
      </p>
    </div>
  )
}
