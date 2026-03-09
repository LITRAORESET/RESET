import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSession } from '../lib/auth'
import { FRASE_OFICIAL_SACOLA, FRASE_OFICIAL_RECRUTAMENTO } from '../data/areaMembrosEstrutura'
import { supabase } from '../lib/supabase'
import './Execucao12X.css'

const PONTOS = {
  contacts_done: 10,
  contacts_negocio_done: 10,
  followups_done: 5,
  stories_done: 5,
  presentation_invite_done: 15,
  health_training_invite_done: 5,
  bonus_complete: 10
}

const MAX_PONTOS_DIA = 50 + PONTOS.bonus_complete

function nivelFromPoints(points) {
  if (points <= 200) return { label: 'Iniciante', emoji: '🌱' }
  if (points <= 500) return { label: 'Executor Bronze', emoji: '🥉' }
  if (points <= 900) return { label: 'Executor Prata', emoji: '🥈' }
  return { label: 'Executor Ouro', emoji: '🥇' }
}

/** ISO 8601: retorna { year, weekNumber } */
function getISOWeek(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay() || 7
  date.setDate(date.getDate() + 4 - day)
  const jan1 = new Date(date.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((date - jan1) / 86400000) + 1) / 7)
  return { year: date.getFullYear(), weekNumber: weekNo }
}

/** Retorna início e fim da semana ISO (para query: created_at >= start e < end) */
function getISOWeekRange(year, weekNumber) {
  const jan4 = new Date(year, 0, 4)
  const dayJan4 = jan4.getDay() || 7
  const mondayWeek1 = new Date(year, 0, 4 - (dayJan4 - 1))
  const monday = new Date(mondayWeek1)
  monday.setDate(mondayWeek1.getDate() + (weekNumber - 1) * 7)
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)
  return {
    start: monday.toISOString().slice(0, 10) + 'T00:00:00.000Z',
    end: nextMonday.toISOString().slice(0, 10) + 'T00:00:00.000Z'
  }
}

export default function Execucao12X() {
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [todayLog, setTodayLog] = useState(null)
  const [history, setHistory] = useState([])
  const [monthPoints, setMonthPoints] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [indicadosEstaSemana, setIndicadosEstaSemana] = useState([])

  const [form, setForm] = useState({
    contacts_done: false,
    contacts_negocio_done: false,
    followups_done: false,
    stories_done: false,
    presentation_invite_done: false,
    health_training_invite_done: false
  })

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    let cancelled = false
    async function init() {
      const { data } = await getSession()
      if (cancelled || !data?.session?.user?.id) return
      setUserId(data.session.user.id)
      if (!supabase) {
        setLoading(false)
        return
      }
      const uid = data.session.user.id
      const { data: log } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('user_id', uid)
        .eq('date', today)
        .maybeSingle()
      if (cancelled) return
      if (log) {
        setTodayLog(log)
        setForm({
          contacts_done: !!log.contacts_done,
          contacts_negocio_done: !!log.contacts_negocio_done,
          followups_done: !!log.followups_done,
          stories_done: !!log.stories_done,
          presentation_invite_done: !!log.presentation_invite_done,
          health_training_invite_done: !!log.health_training_invite_done
        })
      }
      const start = new Date()
      start.setDate(start.getDate() - 6)
      const startStr = start.toISOString().slice(0, 10)
      const { data: logs } = await supabase
        .from('execution_logs')
        .select('date, status, points_earned')
        .eq('user_id', uid)
        .gte('date', startStr)
        .order('date', { ascending: false })
      if (cancelled) return
      setHistory(logs || [])

      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
      const { data: monthLogs } = await supabase
        .from('execution_logs')
        .select('points_earned')
        .eq('user_id', uid)
        .gte('date', firstDay)
      const total = (monthLogs || []).reduce((s, r) => s + (r.points_earned || 0), 0)
      setMonthPoints(total)

      const sorted = (logs || []).slice().sort((a, b) => b.date.localeCompare(a.date))
      let current = 0
      for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().slice(0, 10)
        const log = sorted.find((r) => r.date === dateStr)
        if (!log || log.status !== 'complete') break
        current++
      }
      let best = 0
      let run = 0
      for (const row of sorted) {
        if (row.status === 'complete') {
          run++
          if (run > best) best = run
        } else {
          run = 0
        }
      }
      setStreak(current)
      setBestStreak(best)

      const { year, weekNumber } = getISOWeek(new Date())
      const { start: weekStart, end: weekEnd } = getISOWeekRange(year, weekNumber)
      const { data: perfisIndicados } = await supabase
        .from('perfil')
        .select('user_id')
        .eq('leader_id', uid)
        .gte('created_at', weekStart)
        .lt('created_at', weekEnd)
      if (cancelled) return
      const userIds = (perfisIndicados || []).map((p) => p.user_id)
      let nomes = []
      if (userIds.length > 0) {
        const { data: membros } = await supabase
          .from('membros')
          .select('user_id, nome')
          .in('user_id', userIds)
        if (cancelled) return
        const mapa = (membros || []).reduce((acc, m) => ({ ...acc, [m.user_id]: m.nome?.trim() || 'Novo distribuidor' }), {})
        nomes = userIds.map((id) => mapa[id] || 'Novo distribuidor')
      }
      setIndicadosEstaSemana(nomes)

      setLoading(false)
    }
    init()
    return () => { cancelled = true }
  }, [today])

  const checklistKeys = ['contacts_done', 'contacts_negocio_done', 'followups_done', 'stories_done', 'presentation_invite_done', 'health_training_invite_done']
  const allChecked = checklistKeys.every((k) => form[k])
  const pointsToday = (todayLog && todayLog.points_earned) || 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!userId || !supabase) return
    setSaving(true)
    const status = allChecked ? 'complete' : 'partial'
    let pts = 0
    if (form.contacts_done) pts += PONTOS.contacts_done
    if (form.contacts_negocio_done) pts += PONTOS.contacts_negocio_done
    if (form.followups_done) pts += PONTOS.followups_done
    if (form.stories_done) pts += PONTOS.stories_done
    if (form.presentation_invite_done) pts += PONTOS.presentation_invite_done
    if (form.health_training_invite_done) pts += PONTOS.health_training_invite_done
    if (status === 'complete') pts += PONTOS.bonus_complete

    const payload = {
      user_id: userId,
      date: today,
      contacts_done: form.contacts_done,
      contacts_negocio_done: form.contacts_negocio_done,
      followups_done: form.followups_done,
      stories_done: form.stories_done,
      official_question_done: false,
      presentation_invite_done: form.presentation_invite_done,
      health_training_invite_done: form.health_training_invite_done,
      status,
      points_earned: pts
    }

    const { error } = await supabase.from('execution_logs').upsert(payload, {
      onConflict: 'user_id,date'
    })
    setSaving(false)
    if (error) {
      alert('Erro ao salvar: ' + error.message)
      return
    }
    setSaved(true)
    setEditing(false)
    setTodayLog({ ...payload })
    setMonthPoints((p) => p - pointsToday + pts)
    if (status === 'complete') {
      const prev = history.find((h) => h.date < today)
      setStreak((s) => (prev?.status === 'complete' ? s + 1 : 1))
    }
  }

  const { year: isoYear, weekNumber: isoWeek } = getISOWeek(new Date())
  const countIndicados = indicadosEstaSemana.length

  const nivel = nivelFromPoints(monthPoints)

  if (loading) {
    return (
      <div className="execucao12x">
        <p className="execucao12x__loading">Carregando…</p>
      </div>
    )
  }

  if (!supabase) {
    return (
      <div className="execucao12x">
        <p className="execucao12x__erro">Sistema de execução não disponível. Configure o Supabase.</p>
      </div>
    )
  }

  return (
    <div className="execucao12x">
      <div className="execucao12x__banner">
        <h2 className="execucao12x__titulo">Sistema 12X – Execução de Hoje</h2>
        <p className="execucao12x__data">Data: {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="execucao12x__metas">
        <div className="execucao12x__meta">
          <span className="execucao12x__meta-valor">{streak}</span>
          <span className="execucao12x__meta-label">Sequência atual (dias)</span>
        </div>
        <div className="execucao12x__meta">
          <span className="execucao12x__meta-valor">{bestStreak}</span>
          <span className="execucao12x__meta-label">Melhor sequência</span>
        </div>
        <div className="execucao12x__meta">
          <span className="execucao12x__meta-valor">{monthPoints}</span>
          <span className="execucao12x__meta-label">Pontos do mês</span>
        </div>
        <div className="execucao12x__meta">
          <span className="execucao12x__meta-valor">{nivel.emoji} {nivel.label}</span>
          <span className="execucao12x__meta-label">Nível</span>
        </div>
      </div>

      {streak >= 7 && <p className="execucao12x__msg execucao12x__msg--ok">Você está consistente. Continue.</p>}
      {streak === 0 && !todayLog && <p className="execucao12x__msg">Comece hoje sua sequência.</p>}

      {saved && (
        <p className="execucao12x__sucesso" role="status">Dia registrado com sucesso.</p>
      )}

      {todayLog && !editing ? (
        <div className="execucao12x__bloqueado">
          <p>Você já registrou sua execução hoje.</p>
          <p className="execucao12x__bloqueado-pontos">Pontos de hoje: {todayLog.points_earned} · Status: {todayLog.status === 'complete' ? 'Dia completo' : 'Dia parcial'}</p>
          <button type="button" className="execucao12x__btn execucao12x__btn--secondary" onClick={() => setEditing(true)}>
            Editar
          </button>
        </div>
      ) : (
        <form className="execucao12x__form" onSubmit={handleSubmit}>
          <p className="execucao12x__form-intro">Marque o que você fez (cada item vale os pontos ao lado). Marcando tudo: +{PONTOS.bonus_complete} pts bônus de dia completo.</p>
          {[
            { key: 'contacts_done', label: 'Falei com 10 pessoas da sacola (oferta produto)', pergunta: FRASE_OFICIAL_SACOLA },
            { key: 'contacts_negocio_done', label: 'Falei com 10 pessoas do negócio (oferta renda)', pergunta: FRASE_OFICIAL_RECRUTAMENTO },
            { key: 'followups_done', label: 'Fiz 5 acompanhamentos', pergunta: null },
            { key: 'stories_done', label: 'Coloquei 2 posts nos stories', pergunta: null },
            { key: 'presentation_invite_done', label: 'Coloquei 1 pessoa na apresentação', pergunta: null },
            { key: 'health_training_invite_done', label: 'Incentivei e chamei pessoas para o Clube do Bem-estar', pergunta: null }
          ].map(({ key, label, pergunta }) => (
            <div key={key} className="execucao12x__check-wrap">
              <label className="execucao12x__check">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                />
                <span className="execucao12x__check-pontos">{PONTOS[key]} pts</span>
                <span>{label}</span>
              </label>
              {pergunta && <p className="execucao12x__check-pergunta">{pergunta}</p>}
            </div>
          ))}
          <div className="execucao12x__form-actions">
            <button type="submit" className="execucao12x__btn" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar execução de hoje'}
            </button>
            {todayLog && (
              <button type="button" className="execucao12x__btn execucao12x__btn--secondary" onClick={() => setEditing(false)} disabled={saving}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <section className="execucao12x__meta-semanal">
        <h3>Meta da Semana – Duplicação</h3>
        <p className="execucao12x__meta-semanal-info">Semana atual: {isoWeek} / {isoYear}</p>
        <p className="execucao12x__meta-semanal-informativo">
          Conforme seu novo distribuidor entrar pelo seu link de indicação, ele aparecerá automaticamente aqui.
        </p>
        <div className="execucao12x__meta-semanal-contador">
          <p className="execucao12x__meta-semanal-count">
            {countIndicados === 0 ? (
              'Ainda não trouxe distribuidores essa semana'
            ) : countIndicados === 1 ? (
              <>Trouxe <strong>1</strong> distribuidor essa semana</>
            ) : (
              <>Trouxe <strong>{countIndicados}</strong> distribuidores essa semana</>
            )}
          </p>
          {countIndicados > 0 && (
            <div className="execucao12x__meta-semanal-parabens">
              <p className="execucao12x__meta-semanal-parabens-titulo">Parabéns!</p>
              <ul className="execucao12x__meta-semanal-lista">
                {indicadosEstaSemana.map((nome, i) => (
                  <li key={i}>{nome}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="execucao12x__historico">
        <h3>Últimos 7 dias</h3>
        {history.length === 0 ? (
          <p>Nenhum registro ainda.</p>
        ) : (
          <ul className="execucao12x__historico-lista">
            {history.map((row) => (
              <li key={row.date}>
                {new Date(row.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} – {row.status === 'complete' ? 'Dia completo' : 'Dia parcial'} ({row.points_earned} pts)
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="execucao12x__footer">
        <Link to="/membros">Voltar à área de membros</Link>
      </p>
    </div>
  )
}
