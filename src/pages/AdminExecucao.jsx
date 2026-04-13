import { useState, useEffect, useMemo, useCallback, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SwooshTop } from '../components/Swoosh'
import { getPerfil } from '../lib/auth'
import { supabase } from '../lib/supabase'
import './AdminExecucao.css'

/** Data local YYYY-MM-DD */
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

/** Segunda da semana ISO */
function mondayOfISOWeek(year, weekNum) {
  const jan4 = new Date(year, 0, 4)
  const dayJan4 = jan4.getDay() || 7
  const mondayWeek1 = new Date(year, 0, 4 - (dayJan4 - 1))
  const monday = new Date(mondayWeek1)
  monday.setDate(mondayWeek1.getDate() + (weekNum - 1) * 7)
  return monday
}

function getISOWeekParts(d = new Date()) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay() || 7
  date.setDate(date.getDate() + 4 - day)
  const jan1 = new Date(date.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((date - jan1) / 86400000) + 1) / 7)
  return { year: date.getFullYear(), weekNumber: weekNo }
}

const LOG_SELECT =
  'user_id, date, status, points_earned, contacts_done, contacts_negocio_done, followups_done, stories_done, official_question_done, presentation_invite_done, health_training_invite_done, clube_bem_estar_chamei, created_at'

const ACTIVITY_FIELDS = [
  { key: 'contacts_done', label: '10 pessoas (sacola)', short: 'Sacola' },
  { key: 'contacts_negocio_done', label: '10 pessoas (negócio)', short: 'Negócio' },
  { key: 'followups_done', label: 'Follow-ups', short: 'F/U' },
  { key: 'stories_done', label: 'Stories', short: 'Stories' },
  { key: 'presentation_invite_done', label: 'Convite apresentação', short: 'Apres.' },
  { key: 'health_training_invite_done', label: 'Convite treino saúde', short: 'Treino' },
  { key: 'clube_bem_estar_chamei', label: 'Clube Bem-estar', short: 'Clube' },
  { key: 'official_question_done', label: 'Pergunta oficial', short: 'Perg.' }
]

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Busca todos os logs no intervalo para os usuários indicados (pagina + lotes de .in).
 */
async function fetchAllExecutionLogs(client, { dateFrom, dateTo, userIds }) {
  if (!userIds.length) return []
  const batches = chunk(userIds, 80)
  const pageSize = 1000
  let all = []
  for (const ids of batches) {
    let start = 0
    while (true) {
      const { data, error } = await client
        .from('execution_logs')
        .select(LOG_SELECT)
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .in('user_id', ids)
        .order('date', { ascending: false })
        .range(start, start + pageSize - 1)
      if (error) throw error
      if (!data?.length) break
      all = all.concat(data)
      if (data.length < pageSize) break
      start += pageSize
    }
  }
  return all
}

function rowMatchesActivity(row, activityMode, selectedKeys) {
  if (activityMode === 'ignore' || selectedKeys.length === 0) return true
  if (activityMode === 'any') return selectedKeys.some((k) => row[k] === true)
  return selectedKeys.every((k) => row[k] === true)
}

function escapeCsvCell(s) {
  if (s == null) return ''
  const t = String(s)
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`
  return t
}

export default function AdminExecucao() {
  const navigate = useNavigate()
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [erro, setErro] = useState('')
  const [teamUserIds, setTeamUserIds] = useState([])
  const [membroByUser, setMembroByUser] = useState({})
  const [perfilByUser, setPerfilByUser] = useState({})
  const [rawLogs, setRawLogs] = useState([])

  const today = getLocalDateString()
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [leaderFilter, setLeaderFilter] = useState('all')
  const [busca, setBusca] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activityMode, setActivityMode] = useState('ignore')
  const [selectedActivities, setSelectedActivities] = useState(() =>
    Object.fromEntries(ACTIVITY_FIELDS.map((a) => [a.key, false]))
  )
  const [incluirSemExecucao, setIncluirSemExecucao] = useState(false)
  const [expandedUserId, setExpandedUserId] = useState(null)

  const isSingleDay = dateFrom === dateTo

  const selectedActivityKeys = useMemo(
    () => Object.entries(selectedActivities).filter(([, v]) => v).map(([k]) => k),
    [selectedActivities]
  )

  const filteredUserIds = useMemo(() => {
    let ids = teamUserIds
    if (leaderFilter !== 'all') {
      ids = ids.filter((id) => perfilByUser[id]?.leader_id === leaderFilter)
    }
    const q = busca.trim().toLowerCase()
    if (q) {
      ids = ids.filter((id) => {
        const m = membroByUser[id]
        const nome = (m?.nome || '').toLowerCase()
        const email = (m?.email || '').toLowerCase()
        return nome.includes(q) || email.includes(q)
      })
    }
    return ids
  }, [teamUserIds, leaderFilter, busca, perfilByUser, membroByUser])

  const logsAfterFilters = useMemo(() => {
    return rawLogs.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      return rowMatchesActivity(row, activityMode, selectedActivityKeys)
    })
  }, [rawLogs, statusFilter, activityMode, selectedActivityKeys])

  const logsByUser = useMemo(() => {
    const m = {}
    for (const row of logsAfterFilters) {
      if (!m[row.user_id]) m[row.user_id] = []
      m[row.user_id].push(row)
    }
    for (const uid of Object.keys(m)) {
      m[uid].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    }
    return m
  }, [logsAfterFilters])

  const resumoRows = useMemo(() => {
    if (isSingleDay) {
      const rows = filteredUserIds.map((uid) => {
        const list = logsByUser[uid] || []
        const row = list[0]
        return {
          user_id: uid,
          nome: membroByUser[uid]?.nome || '—',
          email: membroByUser[uid]?.email || '',
          leader_id: perfilByUser[uid]?.leader_id || null,
          dias: row ? 1 : 0,
          completos: row?.status === 'complete' ? 1 : 0,
          parciais: row?.status === 'partial' ? 1 : 0,
          pontos: row?.points_earned ?? 0,
          ultimaData: row?.date ?? null
        }
      })
      rows.sort((a, b) => {
        const sa = a.dias ? (a.completos ? 2 : 1) : 0
        const sb = b.dias ? (b.completos ? 2 : 1) : 0
        if (sb !== sa) return sb - sa
        return a.nome.localeCompare(b.nome, 'pt-BR')
      })
      return rows
    }

    const rows = []
    const seen = new Set()
    for (const row of logsAfterFilters) {
      if (!seen.has(row.user_id)) seen.add(row.user_id)
    }
    const withLogs = Array.from(seen)
    for (const uid of withLogs) {
      const list = logsByUser[uid] || []
      let completos = 0
      let parciais = 0
      let pontos = 0
      let ultima = null
      for (const r of list) {
        if (r.status === 'complete') completos++
        else parciais++
        pontos += r.points_earned || 0
        if (!ultima || r.date > ultima) ultima = r.date
      }
      rows.push({
        user_id: uid,
        nome: membroByUser[uid]?.nome || '—',
        email: membroByUser[uid]?.email || '',
        leader_id: perfilByUser[uid]?.leader_id || null,
        dias: list.length,
        completos,
        parciais,
        pontos,
        ultimaData: ultima
      })
    }
    if (incluirSemExecucao) {
      for (const uid of filteredUserIds) {
        if (seen.has(uid)) continue
        rows.push({
          user_id: uid,
          nome: membroByUser[uid]?.nome || '—',
          email: membroByUser[uid]?.email || '',
          leader_id: perfilByUser[uid]?.leader_id || null,
          dias: 0,
          completos: 0,
          parciais: 0,
          pontos: 0,
          ultimaData: null
        })
      }
    }
    rows.sort((a, b) => {
      if (a.dias === 0 && b.dias > 0) return 1
      if (b.dias === 0 && a.dias > 0) return -1
      return (b.ultimaData || '').localeCompare(a.ultimaData || '')
    })
    return rows
  }, [
    isSingleDay,
    filteredUserIds,
    logsAfterFilters,
    logsByUser,
    membroByUser,
    perfilByUser,
    incluirSemExecucao
  ])

  const kpis = useMemo(() => {
    const u = new Set(logsAfterFilters.map((r) => r.user_id))
    let comp = 0
    let parc = 0
    let pts = 0
    for (const r of logsAfterFilters) {
      if (r.status === 'complete') comp++
      else parc++
      pts += r.points_earned || 0
    }
    return {
      membrosComRegistro: u.size,
      registrosCompletos: comp,
      registrosParciais: parc,
      pontosSomados: pts,
      linhas: logsAfterFilters.length
    }
  }, [logsAfterFilters])

  const lideresOpcoes = useMemo(() => {
    const leaders = new Set()
    for (const uid of teamUserIds) {
      const lid = perfilByUser[uid]?.leader_id
      if (lid) leaders.add(lid)
    }
    return Array.from(leaders)
      .map((id) => ({
        id,
        nome: membroByUser[id]?.nome || id.slice(0, 8)
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [teamUserIds, perfilByUser, membroByUser])

  function nomeLider(leaderId) {
    if (!leaderId) return '—'
    return membroByUser[leaderId]?.nome || '—'
  }

  useEffect(() => {
    let cancelled = false
    async function init() {
      setErro('')
      const perfil = await getPerfil()
      if (cancelled) return
      if (perfil?.role !== 'admin') {
        navigate('/membros', { replace: true })
        return
      }
      if (!supabase) {
        setLoadingMeta(false)
        setErro('Supabase não configurado.')
        return
      }
      const { data: perfis, error: e1 } = await supabase
        .from('perfil')
        .select('user_id, role, leader_id')
        .eq('aprovado', true)
      if (e1) {
        setErro(e1.message)
        setLoadingMeta(false)
        return
      }
      const ids = (perfis || []).filter((p) => p.role !== 'admin').map((p) => p.user_id)
      const pMap = Object.fromEntries((perfis || []).map((p) => [p.user_id, p]))
      let membros = []
      if (ids.length > 0) {
        const res = await supabase.from('membros').select('user_id, nome, email').in('user_id', ids)
        if (res.error) {
          setErro(res.error.message)
          setLoadingMeta(false)
          return
        }
        membros = res.data || []
      }
      const mMap = Object.fromEntries(membros.map((m) => [m.user_id, m]))
      if (cancelled) return
      setTeamUserIds(ids)
      setPerfilByUser(pMap)
      setMembroByUser(mMap)
      setLoadingMeta(false)
    }
    init()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const loadLogs = useCallback(async () => {
    if (!supabase || !dateFrom || !dateTo || dateFrom > dateTo || filteredUserIds.length === 0) {
      setRawLogs([])
      return
    }
    setLoadingLogs(true)
    setErro('')
    try {
      const logs = await fetchAllExecutionLogs(supabase, {
        dateFrom,
        dateTo,
        userIds: filteredUserIds
      })
      setRawLogs(logs)
    } catch (e) {
      setErro(e.message || 'Erro ao carregar execuções.')
      setRawLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }, [dateFrom, dateTo, filteredUserIds])

  useEffect(() => {
    if (loadingMeta) return
    loadLogs()
  }, [loadingMeta, loadLogs])

  function applyPreset(key) {
    const now = new Date()
    const t = getLocalDateString(now)
    switch (key) {
      case 'today':
        setDateFrom(t)
        setDateTo(t)
        break
      case 'yesterday': {
        const y = new Date(now)
        y.setDate(y.getDate() - 1)
        const s = getLocalDateString(y)
        setDateFrom(s)
        setDateTo(s)
        break
      }
      case 'week': {
        const { year, weekNumber } = getISOWeekParts(now)
        const mon = mondayOfISOWeek(year, weekNumber)
        const sun = new Date(mon)
        sun.setDate(mon.getDate() + 6)
        setDateFrom(getLocalDateString(mon))
        setDateTo(getLocalDateString(sun))
        break
      }
      case 'month': {
        const a = startOfMonth(now)
        const b = endOfMonth(now)
        setDateFrom(getLocalDateString(a))
        setDateTo(getLocalDateString(b))
        break
      }
      case 'last7': {
        const a = new Date(now)
        a.setDate(a.getDate() - 6)
        setDateFrom(getLocalDateString(a))
        setDateTo(t)
        break
      }
      case 'last30': {
        const a = new Date(now)
        a.setDate(a.getDate() - 29)
        setDateFrom(getLocalDateString(a))
        setDateTo(t)
        break
      }
      default:
        break
    }
  }

  function toggleActivity(key) {
    setSelectedActivities((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function exportCsv() {
    const headers = [
      'Nome',
      'E-mail',
      'Indicador',
      'Dias c/ registro',
      'Dias completos',
      'Dias parciais',
      'Pontos (filtro)',
      'Última data'
    ]
    const lines = [headers.map(escapeCsvCell).join(',')]
    for (const r of resumoRows) {
      lines.push(
        [
          r.nome,
          r.email,
          nomeLider(r.leader_id),
          r.dias,
          r.completos,
          r.parciais,
          r.pontos,
          r.ultimaData || ''
        ]
          .map(escapeCsvCell)
          .join(',')
      )
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `execucao-${dateFrom}_${dateTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loadingMeta) {
    return (
      <div className="admin-execucao">
        <div className="admin-execucao__container">
          <p className="admin-execucao__loading">Carregando…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-execucao">
      <div className="admin-execucao__container">
        <SwooshTop className="swoosh--large" />
        <header className="admin-execucao__header">
          <div>
            <h1 className="admin-execucao__title">Análise de execução (12X)</h1>
            <p className="admin-execucao__subtitle">
              Filtre por período, pessoa, indicador e atividades. Exporte o resumo em CSV.
            </p>
          </div>
          <div className="admin-execucao__header-actions">
            <Link to="/admin" className="admin-execucao__link admin-execucao__link--btn">
              Área administrativa
            </Link>
            <Link to="/painel-execucao" className="admin-execucao__link">
              Painel da equipe
            </Link>
          </div>
        </header>

        {erro && <p className="admin-execucao__erro">{erro}</p>}

        <section className="admin-execucao__section">
          <h2 className="admin-execucao__section-title">Período</h2>
          <div className="admin-execucao__presets">
            <button type="button" className="admin-execucao__chip" onClick={() => applyPreset('today')}>
              Hoje
            </button>
            <button type="button" className="admin-execucao__chip" onClick={() => applyPreset('yesterday')}>
              Ontem
            </button>
            <button type="button" className="admin-execucao__chip" onClick={() => applyPreset('week')}>
              Semana atual (ISO)
            </button>
            <button type="button" className="admin-execucao__chip" onClick={() => applyPreset('month')}>
              Mês atual
            </button>
            <button type="button" className="admin-execucao__chip" onClick={() => applyPreset('last7')}>
              Últimos 7 dias
            </button>
            <button type="button" className="admin-execucao__chip" onClick={() => applyPreset('last30')}>
              Últimos 30 dias
            </button>
          </div>
          <div className="admin-execucao__dates">
            <label>
              De
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </label>
            <label>
              Até
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </label>
          </div>
          {dateFrom > dateTo && (
            <p className="admin-execucao__hint">A data inicial é maior que a final — ajuste para carregar os dados.</p>
          )}
        </section>

        <section className="admin-execucao__section">
          <h2 className="admin-execucao__section-title">Quem analisar</h2>
          <div className="admin-execucao__grid2">
            <label className="admin-execucao__field">
              Indicador (líder)
              <select value={leaderFilter} onChange={(e) => setLeaderFilter(e.target.value)}>
                <option value="all">Todos</option>
                {lideresOpcoes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-execucao__field">
              Busca (nome ou e-mail)
              <input
                type="search"
                placeholder="Filtra a lista de membros…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>
          </div>
          <p className="admin-execucao__meta">
            {filteredUserIds.length} membro(s) no escopo destes filtros · {teamUserIds.length} aprovados no total
          </p>
        </section>

        <section className="admin-execucao__section">
          <h2 className="admin-execucao__section-title">Refinar registros</h2>
          <p className="admin-execucao__section-desc">
            Afeta linhas de execução antes do resumo. Use “Atividades” para ver só dias em que marcou itens
            específicos.
          </p>
          <div className="admin-execucao__grid2">
            <label className="admin-execucao__field">
              Status do dia
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Completo ou parcial</option>
                <option value="complete">Só dias completos</option>
                <option value="partial">Só dias parciais</option>
              </select>
            </label>
            <label className="admin-execucao__field">
              Atividades marcadas
              <select
                value={activityMode}
                onChange={(e) => setActivityMode(e.target.value)}
                disabled={selectedActivityKeys.length === 0}
              >
                <option value="ignore">Não filtrar por atividade</option>
                <option value="any">Dia com pelo menos uma das selecionadas</option>
                <option value="all">Dia com todas as selecionadas</option>
              </select>
            </label>
          </div>
          <div className="admin-execucao__activities">
            {ACTIVITY_FIELDS.map((a) => (
              <label key={a.key} className="admin-execucao__check">
                <input
                  type="checkbox"
                  checked={selectedActivities[a.key]}
                  onChange={() => toggleActivity(a.key)}
                />
                {a.label}
              </label>
            ))}
          </div>
          {!isSingleDay && (
            <label className="admin-execucao__check admin-execucao__check--solo">
              <input
                type="checkbox"
                checked={incluirSemExecucao}
                onChange={(e) => setIncluirSemExecucao(e.target.checked)}
              />
              Incluir no resumo quem não tem nenhum registro no período (após filtros de linha)
            </label>
          )}
          {isSingleDay && (
            <p className="admin-execucao__hint">
              No modo um dia, a tabela lista todos os membros do escopo; quem não registrou aparece em branco.
            </p>
          )}
        </section>

        <section className="admin-execucao__kpis">
          <div className="admin-execucao__kpi">
            <span className="admin-execucao__kpi-val">{kpis.membrosComRegistro}</span>
            <span className="admin-execucao__kpi-label">Membros c/ registro (após filtros)</span>
          </div>
          <div className="admin-execucao__kpi">
            <span className="admin-execucao__kpi-val">{kpis.registrosCompletos}</span>
            <span className="admin-execucao__kpi-label">Dias completos</span>
          </div>
          <div className="admin-execucao__kpi">
            <span className="admin-execucao__kpi-val">{kpis.registrosParciais}</span>
            <span className="admin-execucao__kpi-label">Dias parciais</span>
          </div>
          <div className="admin-execucao__kpi">
            <span className="admin-execucao__kpi-val">{kpis.pontosSomados}</span>
            <span className="admin-execucao__kpi-label">Pontos (soma filtrada)</span>
          </div>
        </section>

        <section className="admin-execucao__section">
          <div className="admin-execucao__table-head">
            <h2 className="admin-execucao__section-title">
              {isSingleDay ? `Execução em ${dateFrom}` : 'Resumo por membro'}
            </h2>
            <button type="button" className="admin-execucao__btn-csv" onClick={exportCsv} disabled={resumoRows.length === 0}>
              Exportar CSV
            </button>
          </div>

          {loadingLogs && <p className="admin-execucao__loading-inline">Carregando registros…</p>}

          {!loadingLogs && dateFrom <= dateTo && filteredUserIds.length === 0 && (
            <p className="admin-execucao__vazio">Nenhum membro corresponde ao indicador/busca.</p>
          )}

          {!loadingLogs && filteredUserIds.length > 0 && resumoRows.length === 0 && (
            <p className="admin-execucao__vazio">Nenhuma linha de execução com os filtros atuais.</p>
          )}

          {!loadingLogs && resumoRows.length > 0 && isSingleDay && (
            <div className="admin-execucao__table-wrap">
              <table className="admin-execucao__table admin-execucao__table--wide">
                <thead>
                  <tr>
                    <th>Membro</th>
                    <th>Indicador</th>
                    <th>Status</th>
                    <th>Pontos</th>
                    {ACTIVITY_FIELDS.map((a) => (
                      <th key={a.key} title={a.label}>
                        {a.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resumoRows.map((r) => {
                    const dayRows = logsByUser[r.user_id] || []
                    const row = dayRows[0]
                    return (
                      <tr key={r.user_id}>
                        <td>
                          <strong>{r.nome}</strong>
                          <div className="admin-execucao__email">{r.email}</div>
                        </td>
                        <td>{nomeLider(r.leader_id)}</td>
                        <td>
                          {!row ? (
                            '—'
                          ) : row.status === 'complete' ? (
                            <span className="admin-execucao__badge admin-execucao__badge--ok">Completo</span>
                          ) : (
                            <span className="admin-execucao__badge admin-execucao__badge--warn">Parcial</span>
                          )}
                        </td>
                        <td>{row ? row.points_earned ?? 0 : '—'}</td>
                        {ACTIVITY_FIELDS.map((a) => (
                          <td key={a.key}>{row && row[a.key] ? '✓' : row ? '' : '—'}</td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loadingLogs && resumoRows.length > 0 && !isSingleDay && (
            <div className="admin-execucao__table-wrap">
              <table className="admin-execucao__table">
                <thead>
                  <tr>
                    <th />
                    <th>Membro</th>
                    <th>Indicador</th>
                    <th>Dias</th>
                    <th>Completos</th>
                    <th>Parciais</th>
                    <th>Pontos</th>
                    <th>Última data</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoRows.map((r) => {
                    const open = expandedUserId === r.user_id
                    const dias = logsByUser[r.user_id] || []
                    return (
                      <Fragment key={r.user_id}>
                        <tr className={r.dias === 0 ? 'admin-execucao__tr--muted' : ''}>
                          <td>
                            <button
                              type="button"
                              className="admin-execucao__expand"
                              aria-expanded={open}
                              disabled={dias.length === 0}
                              onClick={() => setExpandedUserId(open ? null : r.user_id)}
                            >
                              {dias.length === 0 ? '—' : open ? '▼' : '▶'}
                            </button>
                          </td>
                          <td>
                            <strong>{r.nome}</strong>
                            <div className="admin-execucao__email">{r.email}</div>
                          </td>
                          <td>{nomeLider(r.leader_id)}</td>
                          <td>{r.dias}</td>
                          <td>{r.completos}</td>
                          <td>{r.parciais}</td>
                          <td>{r.pontos}</td>
                          <td>{r.ultimaData ? new Date(r.ultimaData + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                        </tr>
                        {open && dias.length > 0 && (
                          <tr key={`${r.user_id}-detail`} className="admin-execucao__tr-detail">
                            <td colSpan={8}>
                              <div className="admin-execucao__detail">
                                <p className="admin-execucao__detail-title">Dias no período (filtros aplicados)</p>
                                <table className="admin-execucao__table admin-execucao__table--nested">
                                  <thead>
                                    <tr>
                                      <th>Data</th>
                                      <th>Status</th>
                                      <th>Pts</th>
                                      {ACTIVITY_FIELDS.map((a) => (
                                        <th key={a.key}>{a.short}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {dias.map((d) => (
                                      <tr key={d.date}>
                                        <td>{new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                        <td>
                                          {d.status === 'complete' ? 'Completo' : 'Parcial'}
                                        </td>
                                        <td>{d.points_earned ?? 0}</td>
                                        {ACTIVITY_FIELDS.map((a) => (
                                          <td key={a.key}>{d[a.key] ? '✓' : ''}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="admin-execucao__footer">
          <Link to="/">← Voltar ao site</Link>
        </p>
      </div>
    </div>
  )
}
