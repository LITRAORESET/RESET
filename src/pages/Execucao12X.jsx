import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSession } from '../lib/auth'
import { supabase } from '../lib/supabase'
import './Execucao12X.css'

const PONTOS = {
  contacts_done: 10,
  followups_done: 10,
  stories_done: 5,
  official_question_done: 10,
  presentation_invite_done: 15,
  health_training_invite_done: 5,
  bonus_complete: 10
}

const MAX_PONTOS_DIA = 55 + PONTOS.bonus_complete

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
  const [todayLog, setTodayLog] = useState(null)
  const [history, setHistory] = useState([])
  const [monthPoints, setMonthPoints] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [weeklyGoal, setWeeklyGoal] = useState(null)
  const [newMembersThisWeek, setNewMembersThisWeek] = useState(0)
  const [savingWeekly, setSavingWeekly] = useState(false)
  const [savedWeekly, setSavedWeekly] = useState(false)

  const [form, setForm] = useState({
    contacts_done: false,
    followups_done: false,
    stories_done: false,
    official_question_done: false,
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
          followups_done: !!log.followups_done,
          stories_done: !!log.stories_done,
          official_question_done: !!log.official_question_done,
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
      const { data: wg } = await supabase
        .from('weekly_goals')
        .select('brought_new_member')
        .eq('user_id', uid)
        .eq('year', year)
        .eq('week_number', weekNumber)
        .maybeSingle()
      if (cancelled) return
      setWeeklyGoal(wg || null)

      const { start: weekStart, end: weekEnd } = getISOWeekRange(year, weekNumber)
      const { count } = await supabase
        .from('perfil')
        .select('*', { count: 'exact', head: true })
        .eq('leader_id', uid)
        .gte('created_at', weekStart)
        .lt('created_at', weekEnd)
      setNewMembersThisWeek(count ?? 0)

      setLoading(false)
    }
    init()
    return () => { cancelled = true }
  }, [today])

  const allChecked = Object.values(form).every(Boolean)
  const pointsToday = (todayLog && todayLog.points_earned) || 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!userId || !supabase) return
    setSaving(true)
    const status = allChecked ? 'complete' : 'partial'
    let pts = 0
    if (form.contacts_done) pts += PONTOS.contacts_done
    if (form.followups_done) pts += PONTOS.followups_done
    if (form.stories_done) pts += PONTOS.stories_done
    if (form.official_question_done) pts += PONTOS.official_question_done
    if (form.presentation_invite_done) pts += PONTOS.presentation_invite_done
    if (form.health_training_invite_done) pts += PONTOS.health_training_invite_done
    if (status === 'complete') pts += PONTOS.bonus_complete

    const payload = {
      user_id: userId,
      date: today,
      contacts_done: form.contacts_done,
      followups_done: form.followups_done,
      stories_done: form.stories_done,
      official_question_done: form.official_question_done,
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
    setTodayLog({ ...payload })
    setMonthPoints((p) => p - pointsToday + pts)
    if (status === 'complete') {
      const prev = history.find((h) => h.date < today)
      setStreak((s) => (prev?.status === 'complete' ? s + 1 : 1))
    }
  }

  const { year: isoYear, weekNumber: isoWeek } = getISOWeek(new Date())
  const weeklyAlreadyMarked = weeklyGoal?.brought_new_member === true
  const canMarkWeekly = newMembersThisWeek >= 1

  async function handleSaveWeekly() {
    if (!userId || !supabase || weeklyAlreadyMarked) return
    if (!canMarkWeekly) {
      alert('Só é possível marcar quando houver pelo menos 1 novo membro vinculado a você nesta semana. Peça ao seu líder para vincular o novo cadastro a você.')
      return
    }
    setSavingWeekly(true)
    const { error } = await supabase.from('weekly_goals').upsert(
      { user_id: userId, year: isoYear, week_number: isoWeek, brought_new_member: true },
      { onConflict: 'user_id,year,week_number' }
    )
    setSavingWeekly(false)
    if (error) {
      alert('Erro ao salvar: ' + error.message)
      return
    }
    setWeeklyGoal({ brought_new_member: true })
    setSavedWeekly(true)
  }

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

      {todayLog ? (
        <div className="execucao12x__bloqueado">
          <p>Você já registrou sua execução hoje.</p>
          <p className="execucao12x__bloqueado-pontos">Pontos de hoje: {todayLog.points_earned} · Status: {todayLog.status === 'complete' ? 'Dia completo' : 'Dia parcial'}</p>
        </div>
      ) : (
        <form className="execucao12x__form" onSubmit={handleSubmit}>
          <p className="execucao12x__form-intro">Marque o que você fez:</p>
          {[
            { key: 'contacts_done', label: 'Falei com 10 pessoas' },
            { key: 'followups_done', label: 'Fiz 10 acompanhamentos' },
            { key: 'stories_done', label: 'Postei 2 stories' },
            { key: 'official_question_done', label: 'Fiz a pergunta oficial' },
            { key: 'presentation_invite_done', label: 'Coloquei 1 pessoa na apresentação' },
            { key: 'health_training_invite_done', label: 'Incentivei treino de saúde' }
          ].map(({ key, label }) => (
            <label key={key} className="execucao12x__check">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
              />
              <span>{label}</span>
            </label>
          ))}
          <button type="submit" className="execucao12x__btn" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar execução de hoje'}
          </button>
        </form>
      )}

      <section className="execucao12x__meta-semanal">
        <h3>Meta da Semana – Duplicação</h3>
        <p className="execucao12x__meta-semanal-info">Semana atual: {isoWeek} / {isoYear}</p>
        {weeklyAlreadyMarked ? (
          <div className="execucao12x__bloqueado execucao12x__bloqueado--small">
            <p>Meta semanal já registrada.</p>
          </div>
        ) : (
          <>
            <label className="execucao12x__check">
              <input
                type="checkbox"
                checked={false}
                readOnly
              />
              <span>Trouxe 1 novo membro essa semana</span>
            </label>
            {!canMarkWeekly && (
              <p className="execucao12x__meta-semanal-aviso">Marque apenas quando houver 1 novo membro vinculado a você (leader_id). Esta semana: {newMembersThisWeek}.</p>
            )}
            <button
              type="button"
              className="execucao12x__btn execucao12x__btn--secondary"
              onClick={handleSaveWeekly}
              disabled={savingWeekly || !canMarkWeekly}
            >
              {savingWeekly ? 'Salvando…' : 'Salvar meta semanal'}
            </button>
            {savedWeekly && <p className="execucao12x__sucesso">Meta semanal registrada.</p>}
          </>
        )}
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
