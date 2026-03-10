import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSession, getMembro } from '../lib/auth'
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
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [declaracoes, setDeclaracoes] = useState([])
  const [eliteHistory, setEliteHistory] = useState([])
  const [form, setForm] = useState({ total_sacolas: 0, novos_distribuidores: 0 })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [baixandoFlyer, setBaixandoFlyer] = useState(null)

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
      const m = await getMembro()
      if (!cancelled && m?.avatar_url) setAvatarUrl(m.avatar_url)
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

  /** Gera e baixa o flyer com a foto do membro no círculo (centro). Apenas o próprio membro pode baixar aqui (sua sessão, sua foto). */
  async function handleBaixarFlyer(tipo) {
    const flyerSrc = tipo === 'ouro' ? '/images/reconhecimento/flyer-clube-ouro.png' : '/images/reconhecimento/flyer-elite.png'
    const nomeArquivo = tipo === 'ouro' ? 'reconhecimento-clube-ouro.png' : 'reconhecimento-elite.png'
    setBaixandoFlyer(tipo)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const imgFlyer = new Image()
    imgFlyer.crossOrigin = 'anonymous'
    imgFlyer.src = flyerSrc
    await new Promise((resolve, reject) => {
      imgFlyer.onload = resolve
      imgFlyer.onerror = reject
    })
    const w = imgFlyer.naturalWidth
    const h = imgFlyer.naturalHeight
    canvas.width = w
    canvas.height = h
    ctx.drawImage(imgFlyer, 0, 0)
    if (avatarUrl) {
      const imgAvatar = new Image()
      imgAvatar.crossOrigin = 'anonymous'
      imgAvatar.src = avatarUrl
      try {
        await new Promise((resolve, reject) => {
          imgAvatar.onload = resolve
          imgAvatar.onerror = reject
        })
        const cx = w / 2
        const cy = h / 2
        const raio = Math.min(w, h) * 0.22
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, raio, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(imgAvatar, cx - raio, cy - raio, raio * 2, raio * 2)
        ctx.restore()
      } catch (_) {
        /* foto não carregou (CORS etc.), baixa só o flyer */
      }
    }
    const link = document.createElement('a')
    link.download = nomeArquivo
    link.href = canvas.toDataURL('image/png')
    link.click()
    setBaixandoFlyer(null)
  }

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

      {/* Flyers de reconhecimento – exibidos quando qualificado */}
      {(statusClubeOuroSemana || statusEliteMes) && (
        <section className="clube-ouro__reconhecimento" aria-label="Reconhecimento da qualificação">
          <h3>Seu reconhecimento</h3>
          <p className="clube-ouro__reconhecimento-intro">Parabéns pela qualificação. Use o flyer para celebrar.</p>
          {!avatarUrl && (
            <p className="clube-ouro__reconhecimento-aviso">Adicione sua foto em <Link to="/membros/configuracoes">Configurações</Link> para aparecer no flyer e poder baixar com sua foto.</p>
          )}
          <div className="clube-ouro__reconhecimento-flyers">
            {statusClubeOuroSemana && (
              <div className="clube-ouro__flyer-wrap">
                <p className="clube-ouro__flyer-label">Qualificação Clube Ouro – esta semana</p>
                <div className="clube-ouro__flyer-composite">
                  <img src="/images/reconhecimento/flyer-clube-ouro.png" alt="" className="clube-ouro__flyer-img" />
                  {avatarUrl && <div className="clube-ouro__flyer-foto" style={{ backgroundImage: `url(${avatarUrl})` }} aria-hidden />}
                </div>
                <p className="clube-ouro__flyer-desc">Seu foco e dedicação desta semana garantiram sua qualificação no Clube Ouro!</p>
                <button type="button" className="clube-ouro__btn clube-ouro__btn--flyer" onClick={() => handleBaixarFlyer('ouro')} disabled={baixandoFlyer !== null}>
                  {baixandoFlyer === 'ouro' ? 'Gerando…' : 'Baixar flyer com minha foto'}
                </button>
              </div>
            )}
            {statusEliteMes && (
              <div className="clube-ouro__flyer-wrap">
                <p className="clube-ouro__flyer-label">Qualificação Elite – este mês</p>
                <div className="clube-ouro__flyer-composite">
                  <img src="/images/reconhecimento/flyer-elite.png" alt="" className="clube-ouro__flyer-img" />
                  {avatarUrl && <div className="clube-ouro__flyer-foto" style={{ backgroundImage: `url(${avatarUrl})` }} aria-hidden />}
                </div>
                <p className="clube-ouro__flyer-desc">Você demonstrou foco e disciplina ao longo deste mês, conquistando sua qualificação no Clube Elite!</p>
                <button type="button" className="clube-ouro__btn clube-ouro__btn--flyer" onClick={() => handleBaixarFlyer('elite')} disabled={baixandoFlyer !== null}>
                  {baixandoFlyer === 'elite' ? 'Gerando…' : 'Baixar flyer com minha foto'}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Treinamentos */}
      <section className="clube-ouro__treinamentos">
        <h3>Treinamentos</h3>
        <div className="clube-ouro__treino clube-ouro__treino--prata">
          <img src="/images/treinamentos/clube-prata.png" alt="Reset Metabólico – Clube Prata – Treinamento Base" className="clube-ouro__treino-img" />
          <div className="clube-ouro__treino-texto">
            <strong>Treinamento Clube Prata</strong>
            <p className="clube-ouro__treino-horario">Segunda-feira, 7h — todas as semanas.</p>
            <p>Aberto a todos os cadastrados no sistema.</p>
            {CLUBE_PRATA_ZOOM_URL ? (
              <p className="clube-ouro__acesso">
                <a href={CLUBE_PRATA_ZOOM_URL} target="_blank" rel="noopener noreferrer" className="clube-ouro__btn clube-ouro__btn--link">Entrar na sala</a>
              </p>
            ) : null}
          </div>
        </div>
        <div className="clube-ouro__treino clube-ouro__treino--bem-estar">
          <img src="/images/treinamentos/clube-bem-estar.png" alt="Clube do Bem-estar – De segunda a sexta, 9h às 9h30" className="clube-ouro__treino-img" />
          <div className="clube-ouro__treino-texto">
            <strong>Clube do Bem-estar</strong>
            <p className="clube-ouro__treino-horario">De segunda a sexta, 9h às 9h30.</p>
            <p>Aberto a todos os cadastrados no sistema.</p>
          </div>
        </div>
        <div className="clube-ouro__treino clube-ouro__treino--ouro">
          <img src="/images/treinamentos/clube-ouro.png" alt="Reset Metabólico – Clube Ouro – Treinamento Exclusivo" className="clube-ouro__treino-img" />
          <div className="clube-ouro__treino-texto">
            <strong>Treinamento Clube Ouro</strong>
            <p className="clube-ouro__treino-horario">Quarta-feira, 7h — todas as semanas.</p>
            <p>Acesso para quem atingiu 12 sacolas e 1 novo distribuidor na semana (após validação do admin).</p>
            {statusClubeOuroSemana ? (
              <p className="clube-ouro__acesso clube-ouro__acesso--ok">Você está qualificado esta semana.</p>
            ) : (
              <p className="clube-ouro__acesso">Esta semana: {declaracaoSemanaAtual ? (declaracaoSemanaAtual.validado_admin ? 'não atingiu os critérios' : 'aguardando validação do admin') : 'declare abaixo.'}</p>
            )}
          </div>
        </div>
        <div className="clube-ouro__treino clube-ouro__treino--elite">
          <img src="/images/treinamentos/elite.png" alt="Reset Metabólico – Elite – Treinamento Avançado" className="clube-ouro__treino-img" />
          <div className="clube-ouro__treino-texto">
            <strong>Treinamento Elite do Mês</strong>
            <p>Primeira semana do mês seguinte. Quem fez 4 semanas Clube Ouro no mês ganha acesso.</p>
            {statusEliteMes ? (
              <p className="clube-ouro__acesso clube-ouro__acesso--ok">Você é Elite {nomeMes(month)}. Acesso liberado ao treinamento do mês que vem.</p>
            ) : (
              <p className="clube-ouro__acesso">Este mês: {semanasOuroMes}/4 semanas Clube Ouro.</p>
            )}
          </div>
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
