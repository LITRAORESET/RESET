import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSession } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { CLUBE_PRATA_ZOOM_URL } from '../constants'
import {
  getISOWeek,
  getMondayOfWeek,
  calcularStatus,
  nomeMes,
  statusExibicao,
  declaracaoQualificaClubeOro
} from '../lib/clubeOuro'
import './ClubeOuro.css'

export default function ClubeOuro() {
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [declaracoes, setDeclaracoes] = useState([])
  const [eliteHistory, setEliteHistory] = useState([])
  const [form, setForm] = useState({ total_sacolas: 0, novos_distribuidores: 0 })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const now = new Date()
  const { year: isoYear, weekNumber: isoWeek } = getISOWeek(now)
  const month = now.getMonth() + 1
  const declaracaoSemanaAtual = declaracoes.find(
    (d) => d.year === isoYear && d.week_number === isoWeek
  )

  const { statusClubeOuroSemana, semanasOuroMes, statusEliteMes } = calcularStatus(
    declaracoes,
    isoYear,
    isoWeek,
    month
  )
  const exibicao = statusExibicao(statusEliteMes, statusClubeOuroSemana)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await getSession()
      if (cancelled || !data?.session?.user?.id) {
        setLoading(false)
        return
      }
      setUserId(data.session.user.id)
      if (!supabase) {
        setLoading(false)
        return
      }
      const uid = data.session.user.id
      const { data: decl } = await supabase
        .from('clube_ouro_declaracao')
        .select('id, year, week_number, total_sacolas, novos_distribuidores, validado_admin, created_at')
        .eq('user_id', uid)
        .order('year', { ascending: false })
        .order('week_number', { ascending: false })
        .limit(30)
      if (!cancelled) setDeclaracoes(decl || [])

      const { data: elite } = await supabase
        .from('elite_history')
        .select('mes, ano, total_sacolas_mes, total_recrutamentos_mes, semanas_qualificadas, data_conquista')
        .eq('user_id', uid)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
      if (!cancelled) setEliteHistory(elite || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (declaracaoSemanaAtual) {
      setForm({
        total_sacolas: declaracaoSemanaAtual.total_sacolas ?? 0,
        novos_distribuidores: declaracaoSemanaAtual.novos_distribuidores ?? 0
      })
    }
  }, [declaracaoSemanaAtual?.id, declaracaoSemanaAtual?.total_sacolas, declaracaoSemanaAtual?.novos_distribuidores])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!userId || !supabase) return
    setSaving(true)
    const payload = {
      user_id: userId,
      year: isoYear,
      week_number: isoWeek,
      total_sacolas: Math.max(0, Number(form.total_sacolas) || 0),
      novos_distribuidores: Math.max(0, Number(form.novos_distribuidores) || 0)
    }
    const { error } = await supabase.from('clube_ouro_declaracao').upsert(payload, {
      onConflict: 'user_id,year,week_number'
    })
    setSaving(false)
    if (error) {
      alert('Erro ao salvar: ' + error.message)
      return
    }
    setSaved(true)
    setDeclaracoes((prev) => {
      const rest = prev.filter((d) => !(d.year === isoYear && d.week_number === isoWeek))
      return [{ ...payload, validado_admin: false, id: declaracaoSemanaAtual?.id }, ...rest]
    })
  }

  if (loading) {
    return (
      <div className="clube-ouro">
        <p className="clube-ouro__loading">Carregando…</p>
      </div>
    )
  }

  if (!userId || !supabase) {
    return (
      <div className="clube-ouro">
        <p className="clube-ouro__erro">Clube Ouro não disponível. Configure o Supabase.</p>
        <Link to="/membros">Voltar à área de membros</Link>
      </div>
    )
  }

  const inicioSemana = getMondayOfWeek(isoYear, isoWeek)
  const fimSemana = new Date(inicioSemana)
  fimSemana.setDate(fimSemana.getDate() + 6)
  const textoSemana = `${new Date(inicioSemana + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${fimSemana.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <div className="clube-ouro">
      <div className="clube-ouro__banner">
        <h2 className="clube-ouro__titulo">Clube Ouro & Elite do Mês</h2>
        <p className="clube-ouro__subtitulo">
          Declare sua semana. Quem atinge 12 sacolas + 1 novo distribuidor (validado) ganha o treinamento Clube Ouro. Quem faz isso 4 semanas no mês vira Elite.
        </p>
      </div>

      {/* Badge / Status */}
      <div className={`clube-ouro__status clube-ouro__status--nivel-${exibicao.nivel}`}>
        {exibicao.badge && (
          <span className="clube-ouro__badge">{exibicao.badge}</span>
        )}
        <span className="clube-ouro__status-label">{exibicao.label}</span>
        {semanasOuroMes > 0 && exibicao.nivel < 3 && (
          <span className="clube-ouro__semanas-mes">{semanasOuroMes} semana(s) Clube Ouro este mês</span>
        )}
      </div>

      {/* Treinamentos */}
      <section className="clube-ouro__treinamentos">
        <h3>Treinamentos</h3>
        <div className="clube-ouro__treino clube-ouro__treino--prata">
          <strong>Treinamento Clube Prata</strong>
          <p>Toda segunda-feira, 8h. Aberto a todos os cadastrados no sistema (mesma sala Zoom do Afiando Machado — só mudou o nome).</p>
          {CLUBE_PRATA_ZOOM_URL ? (
            <p className="clube-ouro__acesso">
              <a href={CLUBE_PRATA_ZOOM_URL} target="_blank" rel="noopener noreferrer" className="clube-ouro__btn clube-ouro__btn--link">Entrar na sala</a>
            </p>
          ) : null}
        </div>
        <div className="clube-ouro__treino clube-ouro__treino--ouro">
          <strong>Treinamento Clube Ouro</strong>
          <p>Toda quarta-feira, 8h. Acesso liberado para quem atingiu 12 sacolas e 1 novo distribuidor na semana (após validação do admin).</p>
          {statusClubeOuroSemana ? (
            <p className="clube-ouro__acesso clube-ouro__acesso--ok">Você está qualificado esta semana.</p>
          ) : (
            <p className="clube-ouro__acesso">Esta semana: {declaracaoSemanaAtual ? (declaracaoSemanaAtual.validado_admin ? 'não atingiu os critérios' : 'aguardando validação do admin') : 'declare abaixo.'}</p>
          )}
        </div>
        <div className="clube-ouro__treino clube-ouro__treino--elite">
          <strong>Treinamento Elite do Mês</strong>
          <p>Primeira semana do mês seguinte. Quem fez 4 semanas Clube Ouro no mês ganha acesso.</p>
          {statusEliteMes ? (
            <p className="clube-ouro__acesso clube-ouro__acesso--ok">Você é Elite {nomeMes(month)}. Acesso liberado ao treinamento do mês que vem.</p>
          ) : (
            <p className="clube-ouro__acesso">Este mês: {semanasOuroMes}/4 semanas Clube Ouro.</p>
          )}
        </div>
      </section>

      {/* Declaração da semana */}
      <section className="clube-ouro__declaracao">
        <h3>Declaração da semana</h3>
        <p className="clube-ouro__semana-info">Semana {isoWeek}/{isoYear} · {textoSemana}</p>
        <p className="clube-ouro__criteria">Critérios Clube Ouro: mínimo 12 sacolas vendidas e mínimo 1 novo distribuidor ativo (cadastrado na plataforma). Apenas declarações validadas pelo administrador contam.</p>

        {saved && (
          <p className="clube-ouro__sucesso" role="status">Declaração salva. Aguarde a validação do administrador.</p>
        )}

        <form className="clube-ouro__form" onSubmit={handleSubmit}>
          <label className="clube-ouro__label">
            <span>Total de sacolas vendidas na semana</span>
            <input
              type="number"
              min={0}
              value={form.total_sacolas}
              onChange={(e) => setForm((f) => ({ ...f, total_sacolas: e.target.value }))}
              className="clube-ouro__input"
            />
          </label>
          <label className="clube-ouro__label">
            <span>Novos distribuidores ativos (cadastrados na plataforma)</span>
            <input
              type="number"
              min={0}
              value={form.novos_distribuidores}
              onChange={(e) => setForm((f) => ({ ...f, novos_distribuidores: e.target.value }))}
              className="clube-ouro__input"
            />
          </label>
          <button type="submit" className="clube-ouro__btn" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar declaração'}
          </button>
        </form>

        {declaracaoSemanaAtual && (
          <div className="clube-ouro__status-decl">
            {declaracaoSemanaAtual.validado_admin ? (
              declaracaoQualificaClubeOro(declaracaoSemanaAtual) ? (
                <p className="clube-ouro__status-ok">Esta semana validada: Clube Ouro.</p>
              ) : (
                <p className="clube-ouro__status-partial">Esta semana validada: não atingiu os critérios (12 sacolas e 1 novo distribuidor).</p>
              )
            ) : (
              <p className="clube-ouro__status-pendente">Declaração enviada. Aguardando validação do administrador.</p>
            )}
          </div>
        )}
      </section>

      {/* Histórico Elite */}
      {eliteHistory.length > 0 && (
        <section className="clube-ouro__historico">
          <h3>Seu histórico Elite</h3>
          <ul className="clube-ouro__historico-lista">
            {eliteHistory.map((h) => (
              <li key={`${h.ano}-${h.mes}`}>
                <strong>Elite {nomeMes(h.mes)}/{h.ano}</strong> – {h.semanas_qualificadas} semanas · {h.total_sacolas_mes} sacolas · {h.total_recrutamentos_mes} recrutamentos
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="clube-ouro__footer">
        <Link to="/membros">Voltar à área de membros</Link>
      </p>
    </div>
  )
}
