/**
 * Clube Ouro + Elite do Mês: semana ISO, critérios e cálculo de status.
 * Clube Ouro: 12+ sacolas e 1+ novo distribuidor na semana (validado admin).
 * Elite: 4 semanas Clube Ouro no mesmo mês.
 */

/** Retorna { year, weekNumber } da data (ISO 8601). */
export function getISOWeek(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay() || 7
  date.setDate(date.getDate() + 4 - day)
  const jan1 = new Date(date.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((date - jan1) / 86400000) + 1) / 7)
  return { year: date.getFullYear(), weekNumber: weekNo }
}

/** Segunda-feira da semana ISO (YYYY-MM-DD). */
export function getMondayOfWeek(year, weekNum) {
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

const MIN_SACOLAS_CLUBE_OURO = 12
const MIN_NOVOS_DISTRIBUIDORES = 1
const SEMANAS_PARA_ELITE = 4

/** Uma declaração validada qualifica para Clube Ouro se sacolas >= 12 e novos >= 1. */
export function declaracaoQualificaClubeOuro(declaracao) {
  if (!declaracao?.validado_admin) return false
  return (
    (declaracao.total_sacolas ?? 0) >= MIN_SACOLAS_CLUBE_OURO &&
    (declaracao.novos_distribuidores ?? 0) >= MIN_NOVOS_DISTRIBUIDORES
  )
}

/**
 * Dado um array de declarações (do usuário ou de todos), retorna:
 * - statusClubeOuroSemana: boolean para a semana (year, weekNumber) indicada
 * - semanasOuroMes: número de semanas qualificadas no mês (year, month 1-based)
 * - statusEliteMes: boolean (semanasOuroMes >= 4)
 */
export function calcularStatus(declaracoes, year, weekNumber, month) {
  const somenteValidados = (declaracoes || []).filter((d) => d.validado_admin === true)
  const qualificadas = somenteValidados.filter(declaracaoQualificaClubeOuro)

  const statusClubeOuroSemana = qualificadas.some(
    (d) => d.year === year && d.week_number === weekNumber
  )

  const semanasNoMes = qualificadas.filter((d) => {
    const monday = getMondayOfWeek(d.year, d.week_number)
    const [y, m] = monday.split('-').map(Number)
    return y === year && m === month
  })
  const semanasOuroMes = semanasNoMes.length
  const statusEliteMes = semanasOuroMes >= SEMANAS_PARA_ELITE

  return { statusClubeOuroSemana, semanasOuroMes, statusEliteMes, qualificadas }
}

/** Nome do mês em pt-BR. */
export function nomeMes(mes) {
  const nomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return nomes[Math.max(0, mes - 1)] || ''
}

/** Status hierárquico para exibição: maior ativo primeiro. */
export function statusExibicao(statusEliteMes, statusClubeOuroSemana) {
  if (statusEliteMes) return { nivel: 3, label: 'Elite do Mês', badge: 'Elite' }
  if (statusClubeOuroSemana) return { nivel: 2, label: 'Clube Ouro', badge: 'Clube Ouro' }
  return { nivel: 1, label: 'Formação', badge: null }
}
