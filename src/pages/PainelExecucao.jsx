import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getSession, getPerfil } from '../lib/auth'
import { supabase } from '../lib/supabase'
import './PainelExecucao.css'

function nivelFromPoints(points) {
  if (points <= 200) return 'Iniciante'
  if (points <= 500) return 'Bronze'
  if (points <= 900) return 'Prata'
  return 'Ouro'
}

/** Monday of ISO week (year, week) in local date string YYYY-MM-DD */
function getMondayOfWeek(year, weekNum) {
  const jan4 = new Date(year, 0, 4)
  const dayJan4 = jan4.getDay() || 7
  const mondayWeek1 = new Date(year, 0, 4 - (dayJan4 - 1))
  const monday = new Date(mondayWeek1)
  monday.setDate(mondayWeek1.getDate() + (weekNum - 1) * 7)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const d = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function PainelExecucao() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const [hoje, setHoje] = useState([])
  const [ranking, setRanking] = useState([])
  const [alertas, setAlertas] = useState([])

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const firstDayMonth = new Date(currentYear, currentMonth, 1).toISOString().slice(0, 10)
  const { year: isoYear, weekNumber: isoWeek } = (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const day = d.getDay() || 7
    d.setDate(d.getDate() + 4 - day)
    const jan1 = new Date(d.getFullYear(), 0, 1)
    const weekNo = Math.ceil((((d - jan1) / 86400000) + 1) / 7)
    return { year: d.getFullYear(), weekNumber: weekNo }
  })()

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: sessionData } = await getSession()
      if (cancelled || !sessionData?.session?.user?.id) {
        setLoading(false)
        return
      }
      const uid = sessionData.session.user.id
      const perfil = await getPerfil()
      if (cancelled) return
      const r = perfil?.role
      if (r !== 'admin' && r !== 'leader') {
        navigate('/membros', { replace: true })
        setLoading(false)
        return
      }
      setRole(r)
      setUserId(uid)
      if (!supabase) {
        setLoading(false)
        return
      }

      let teamUserIds = []
      if (r === 'admin') {
        const { data: perfis } = await supabase.from('perfil').select('user_id').eq('aprovado', true)
        teamUserIds = (perfis || []).map((p) => p.user_id).filter((id) => id !== uid)
      } else {
        const { data: perfis } = await supabase.from('perfil').select('user_id').eq('leader_id', uid)
        teamUserIds = (perfis || []).map((p) => p.user_id)
      }

      if (teamUserIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: membros } = await supabase.from('membros').select('user_id, nome').in('user_id', teamUserIds)
      const nomes = (membros || []).reduce((acc, m) => ({ ...acc, [m.user_id]: m.nome || m.user_id?.slice(0, 8) || '—' }), {})

      const { data: logsHoje } = await supabase
        .from('execution_logs')
        .select('user_id, status, points_earned')
        .in('user_id', teamUserIds)
        .eq('date', today)

      const { data: logsMes } = await supabase
        .from('execution_logs')
        .select('user_id, points_earned')
        .in('user_id', teamUserIds)
        .gte('date', firstDayMonth)

      const pontosPorUser = (logsMes || []).reduce((acc, row) => {
        acc[row.user_id] = (acc[row.user_id] || 0) + (row.points_earned || 0)
        return acc
      }, {})

      const hojeMap = (logsHoje || []).reduce((acc, row) => ({ ...acc, [row.user_id]: row }), {})

      setHoje(
        teamUserIds.map((id) => ({
          user_id: id,
          nome: nomes[id] || '—',
          status: hojeMap[id]?.status || 'none',
          points: hojeMap[id]?.points_earned ?? 0
        }))
      )

      setRanking(
        teamUserIds
          .map((id) => ({
            user_id: id,
            nome: nomes[id] || '—',
            pontos: pontosPorUser[id] || 0,
            nivel: nivelFromPoints(pontosPorUser[id] || 0)
          }))
          .sort((a, b) => b.pontos - a.pontos)
      )

      const { data: logsOntem } = await supabase
        .from('execution_logs')
        .select('user_id')
        .in('user_id', teamUserIds)
        .eq('date', yesterdayStr)
      const fezOntem = new Set((logsOntem || []).map((r) => r.user_id))
      const alertasExec = teamUserIds
        .filter((id) => !hojeMap[id] && !fezOntem.has(id))
        .map((id) => ({ user_id: id, nome: nomes[id] || '—', tipo: '2 dias sem executar' }))

      const { data: weeklyGoals } = await supabase
        .from('weekly_goals')
        .select('user_id, year, week_number, brought_new_member')
        .in('user_id', teamUserIds)
        .eq('year', currentYear)

      const novoNaSemana = (weeklyGoals || [])
        .filter((w) => w.year === isoYear && w.week_number === isoWeek && w.brought_new_member)
        .reduce((acc, w) => ({ ...acc, [w.user_id]: true }), {})

      const firstDayNextMonth = new Date(currentYear, currentMonth + 1, 1).toISOString().slice(0, 10)
      const novoNoMesPorUser = (weeklyGoals || [])
        .filter((w) => {
          if (!w.brought_new_member) return false
          const monday = getMondayOfWeek(w.year, w.week_number)
          return monday >= firstDayMonth && monday < firstDayNextMonth
        })
        .reduce((acc, w) => {
          acc[w.user_id] = (acc[w.user_id] || 0) + 1
          return acc
        }, {})

      setHoje(
        teamUserIds.map((id) => ({
          user_id: id,
          nome: nomes[id] || '—',
          status: hojeMap[id]?.status || 'none',
          points: hojeMap[id]?.points_earned ?? 0,
          novoNaSemana: !!novoNaSemana[id],
          novoNoMes: novoNoMesPorUser[id] ?? 0
        }))
      )

      const semMetaSemanal = teamUserIds.filter((id) => !novoNaSemana[id])
      setAlertas([
        ...alertasExec,
        ...semMetaSemanal.map((id) => ({ user_id: id, nome: nomes[id] || '—', tipo: 'Não trouxe 1 novo membro essa semana' }))
      ])

      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [navigate])

  if (loading) {
    return (
      <div className="painel-execucao">
        <p className="painel-execucao__loading">Carregando…</p>
      </div>
    )
  }

  return (
    <div className="painel-execucao">
      <header className="painel-execucao__header">
        <h1 className="painel-execucao__titulo">Painel de Execução da Equipe</h1>
        <Link to={role === 'admin' ? '/admin' : '/membros'} className="painel-execucao__voltar">
          Voltar
        </Link>
      </header>

      <section className="painel-execucao__bloco">
        <h2>Execução de hoje</h2>
        <p className="painel-execucao__subtitulo">Status e pontos do dia.</p>
        {hoje.length === 0 ? (
          <p>Nenhum membro na equipe.</p>
        ) : (
          <table className="painel-execucao__tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Pontos hoje</th>
                <th>Novo na Semana</th>
                <th>Novo no Mês</th>
              </tr>
            </thead>
            <tbody>
              {hoje
                .sort((a, b) => {
                  const order = { none: 0, partial: 1, complete: 2 }
                  return order[a.status] - order[b.status]
                })
                .map((row) => (
                  <tr key={row.user_id}>
                    <td>{row.nome}</td>
                    <td>
                      {row.status === 'complete' && '✅ Completo'}
                      {row.status === 'partial' && '⚠ Parcial'}
                      {row.status === 'none' && '❌ Não executou'}
                    </td>
                    <td>{row.points}</td>
                    <td>{row.novoNaSemana ? '✔ Sim' : '❌ Não'}</td>
                    <td>{row.novoNoMes ?? 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="painel-execucao__bloco">
        <h2>Ranking do mês</h2>
        <p className="painel-execucao__subtitulo">Pontos no mês atual.</p>
        {ranking.length === 0 ? (
          <p>Nenhum dado.</p>
        ) : (
          <table className="painel-execucao__tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Pontos</th>
                <th>Nível</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((row) => (
                <tr key={row.user_id}>
                  <td>{row.nome}</td>
                  <td>{row.pontos}</td>
                  <td>{row.nivel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {alertas.length > 0 && (
        <section className="painel-execucao__bloco painel-execucao__bloco--alerta">
          <h2>Alertas</h2>
          <p className="painel-execucao__subtitulo">Prioridade para o líder cobrar.</p>
          <ul>
            {alertas.map((a, i) => (
              <li key={`${a.user_id}-${a.tipo}-${i}`}>
                {a.nome} – {a.tipo}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
