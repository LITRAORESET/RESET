/**
 * Quiz RST — Sacola Reset Metabólico (NRG + Herbal Concentrate)
 * Dois fluxos: direto (público quente) e indireto (público frio)
 * Mesmas perguntas, diagnóstico e CTA diferentes
 */

export const QUIZ_NOME = 'O que está travando sua energia hoje?'

export const RESPOSTAS = [
  { id: 'nunca', label: 'Nunca', valor: 0 },
  { id: 'as_vezes', label: 'Às vezes', valor: 1 },
  { id: 'frequentemente', label: 'Frequentemente', valor: 2 },
]

export const PERGUNTAS = [
  {
    id: 'e1',
    bloco: 'energia',
    texto: 'Você sente queda de energia no meio da manhã?',
  },
  {
    id: 'e2',
    bloco: 'energia',
    texto: 'À tarde você sente cansaço ou sono?',
  },
  {
    id: 'e3',
    bloco: 'energia',
    texto: 'Precisa de café para continuar produtivo?',
  },
  {
    id: 'e4',
    bloco: 'energia',
    texto: 'Sua energia oscila ao longo do dia?',
  },
  {
    id: 'f1',
    bloco: 'foco',
    texto: 'Você sente dificuldade de concentração?',
  },
  {
    id: 'f2',
    bloco: 'foco',
    texto: 'Esquece tarefas simples?',
  },
  {
    id: 'f3',
    bloco: 'foco',
    texto: 'Sente mente "lenta" ou confusa em alguns momentos?',
  },
  {
    id: 'm1',
    bloco: 'metabolismo',
    texto: 'Sente inchaço ao longo do dia?',
  },
  {
    id: 'm2',
    bloco: 'metabolismo',
    texto: 'Nota retenção no final do dia?',
  },
  {
    id: 'm3',
    bloco: 'metabolismo',
    texto: 'Sente que seu metabolismo está lento?',
  },
]

/**
 * Calcula pontuação total e por bloco
 */
export function calcularPontuacao(respostas) {
  let total = 0
  const blocos = { energia: 0, foco: 0, metabolismo: 0 }
  PERGUNTAS.forEach((p, i) => {
    const val = respostas[i] ?? 0
    total += val
    if (p.bloco in blocos) blocos[p.bloco] += val
  })
  return { total, blocos }
}

/** Labels por bloco para o diagnóstico */
const LABELS_BLOCOS = {
  energia: {
    forte: 'Oscilação de energia ao longo do dia',
    medio: 'Queda de energia em alguns momentos',
    leve: 'Energia pode melhorar com estímulo',
  },
  foco: {
    forte: 'Queda de foco e concentração',
    medio: 'Dificuldade ocasional de concentração',
    leve: 'Foco pode ser potencializado',
  },
  metabolismo: {
    forte: 'Sinais de retenção e metabolismo lento',
    medio: 'Sensação leve de inchaço',
    leve: 'Metabolismo pode ser ativado',
  },
}

/**
 * Retorna o bloco mais deficiente (maior pontuação) e os demais ordenados
 */
export function obterBlocoPrincipal(respostas) {
  const { blocos } = calcularPontuacao(respostas)
  const entradas = Object.entries(blocos)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
  if (entradas.length === 0) return { principal: null, demais: [], blocos }
  const [principal] = entradas
  const demais = entradas.slice(1)
  return {
    principal: { bloco: principal[0], valor: principal[1] },
    demais: demais.map(([b, v]) => ({ bloco: b, valor: v })),
    blocos,
  }
}

function getLabelBloco(bloco, valor) {
  const labels = LABELS_BLOCOS[bloco]
  if (!labels) return ''
  if (bloco === 'energia' && valor >= 3) return labels.forte
  if (bloco === 'energia' && valor >= 1) return labels.medio
  if (bloco === 'foco' && valor >= 2) return labels.forte
  if (bloco === 'foco' && valor >= 1) return labels.medio
  if (bloco === 'metabolismo' && valor >= 2) return labels.forte
  if (bloco === 'metabolismo' && valor >= 1) return labels.medio
  return labels.leve
}

/**
 * Gera pontos de atenção com ênfase no que a pessoa está mais deficiente
 * principal = destaque (maior pontuação), demais = secundários
 */
export function obterPontosAtencao(respostas) {
  const { principal, demais } = obterBlocoPrincipal(respostas)
  const pontos = []
  if (principal) {
    const txt = getLabelBloco(principal.bloco, principal.valor) || LABELS_BLOCOS[principal.bloco]?.forte
    pontos.push({ texto: txt, principal: true })
  }
  demais.forEach(({ bloco, valor }) => {
    const txt = getLabelBloco(bloco, valor)
    if (txt) pontos.push({ texto: txt, principal: false })
  })
  if (pontos.length === 0) {
    return [{ texto: 'Seu corpo pode estar precisando de mais estímulo diário', principal: false }]
  }
  return pontos
}

/** Conteúdo personalizado por bloco principal — VERSÃO DIRETA */
const CONTEUDO_DIRETO = {
  energia: {
    explicacao: 'Seu corpo está precisando de mais estímulo de energia ao longo do dia.',
    sacola: 'A Sacola RST (NRG + Herbal Concentrate) pode ajudar você a sentir:',
    beneficios: [
      'Mais disposição já pela manhã',
      'Energia mais estável ao longo do dia',
      'Menos dependência de café',
      'Melhor rendimento físico e mental',
    ],
    conclusao: 'Se usada corretamente, você pode sentir mais energia já nos primeiros dias.',
    ctaTexto: 'Quero ativar minha energia agora',
    msgWhatsApp: 'Oi, fiz o diagnóstico e deu que preciso de mais energia. Quero encomendar minha sacola RST dessa semana.',
  },
  foco: {
    explicacao: 'Seu corpo está precisando de estímulo para foco e concentração.',
    sacola: 'A Sacola RST (NRG + Herbal Concentrate) pode ajudar você a sentir:',
    beneficios: [
      'Mais foco mental durante o dia',
      'Melhor concentração nas tarefas',
      'Mente mais clara e produtiva',
      'Menos sensação de "mente lenta"',
    ],
    conclusao: 'Se usada corretamente, você pode sentir melhora na concentração já nos primeiros dias.',
    ctaTexto: 'Quero melhorar minha concentração',
    msgWhatsApp: 'Oi, fiz o diagnóstico e deu que preciso de mais concentração. Quero encomendar minha sacola RST dessa semana.',
  },
  metabolismo: {
    explicacao: 'Seu corpo está precisando de ativação metabólica e hidratação estratégica.',
    sacola: 'A Sacola RST (NRG + Herbal Concentrate) pode ajudar você a sentir:',
    beneficios: [
      'Ativação do metabolismo',
      'Redução da sensação de inchaço',
      'Sensação de leveza',
      'Melhor circulação e retenção',
    ],
    conclusao: 'Se usada corretamente, você pode sentir melhora na sensação de inchaço já nos primeiros dias.',
    ctaTexto: 'Quero ativar meu metabolismo agora',
    msgWhatsApp: 'Oi, fiz o diagnóstico e deu que preciso ativar meu metabolismo. Quero encomendar minha sacola RST dessa semana.',
  },
  default: {
    explicacao: 'Seu corpo está precisando de estímulo diário de ativação e hidratação estratégica.',
    sacola: 'A Sacola RST (NRG + Herbal Concentrate) foi pensada exatamente para:',
    beneficios: [
      'Estimular o metabolismo',
      'Melhorar disposição',
      'Aumentar foco mental',
      'Reduzir sensação de inchaço',
      'Melhorar rendimento físico',
    ],
    conclusao: 'Se usada corretamente, você pode sentir melhora já nos primeiros dias.',
    ctaTexto: 'Encomendar minha Sacola RST dessa semana',
    msgWhatsApp: 'Oi, fiz o diagnóstico e quero encomendar minha sacola RST dessa semana.',
  },
}

/** Conteúdo personalizado por bloco principal — VERSÃO INDIRETA */
const CONTEUDO_INDIRETO = {
  energia: {
    explicacao: 'Isso indica necessidade de:',
    necessidades: [
      'Estímulo natural de energia',
      'Mais disposição ao longo do dia',
      'Menos dependência de estimulantes',
    ],
    alerta: 'Se nada for ajustado, a tendência é continuar sentindo:',
    alertaItens: [
      'Cansaço no meio da manhã ou à tarde',
      'Dependência de café para continuar',
      'Energia oscilando o dia todo',
    ],
    transicao: 'Existe uma estratégia simples que ajuda a ter mais energia e disposição de forma natural.',
    ctaTexto: 'Quero receber a estratégia para mais energia',
    msgWhatsApp: 'Oi, fiz o diagnóstico e deu que preciso de mais energia. Quero saber qual estratégia é indicada para mim.',
  },
  foco: {
    explicacao: 'Isso indica necessidade de:',
    necessidades: [
      'Estímulo para foco e concentração',
      'Mente mais clara durante o dia',
      'Melhor produtividade mental',
    ],
    alerta: 'Se nada for ajustado, a tendência é continuar sentindo:',
    alertaItens: [
      'Dificuldade de concentração',
      'Mente "lenta" ou confusa',
      'Esquecimento de tarefas simples',
    ],
    transicao: 'Existe uma estratégia simples que ajuda a melhorar foco e concentração de forma natural.',
    ctaTexto: 'Quero receber a estratégia para mais concentração',
    msgWhatsApp: 'Oi, fiz o diagnóstico e deu que preciso de mais concentração. Quero saber qual estratégia é indicada para mim.',
  },
  metabolismo: {
    explicacao: 'Isso indica necessidade de:',
    necessidades: [
      'Ativação metabólica diária',
      'Redução de retenção e inchaço',
      'Hidratação estratégica',
    ],
    alerta: 'Se nada for ajustado, a tendência é continuar sentindo:',
    alertaItens: [
      'Sensação de inchaço ao longo do dia',
      'Retenção no final do dia',
      'Metabolismo mais lento',
    ],
    transicao: 'Existe uma estratégia simples que combina ativação metabólica com hidratação para sensação de leveza.',
    ctaTexto: 'Quero receber a estratégia para ativar meu metabolismo',
    msgWhatsApp: 'Oi, fiz o diagnóstico e deu que preciso ativar meu metabolismo. Quero saber qual estratégia é indicada para mim.',
  },
  default: {
    explicacao: 'Isso indica necessidade de:',
    necessidades: [
      'Ativação metabólica diária',
      'Estímulo natural de energia',
      'Ajuste estratégico na hidratação',
    ],
    alerta: 'Se nada for ajustado, a tendência é continuar sentindo:',
    alertaItens: [
      'Cansaço no meio do dia',
      'Dependência de café',
      'Dificuldade de foco',
    ],
    transicao: 'Existe uma estratégia simples que combina ativação metabólica com estímulo de energia e foco.',
    ctaTexto: 'Quero receber a estratégia indicada para mim',
    msgWhatsApp: 'Oi, fiz o diagnóstico e quero saber qual estratégia é indicada para mim.',
  },
}

/**
 * Textos do diagnóstico — VERSÃO DIRETA (público quente)
 * Personalizado conforme o bloco mais deficiente (energia, foco ou metabolismo)
 */
export function getDiagnosticoDireto(respostas) {
  const pontos = obterPontosAtencao(respostas)
  const principal = pontos.find((p) => p.principal)
  const { principal: blocoPrincipal } = obterBlocoPrincipal(respostas)
  const bloco = blocoPrincipal?.bloco || 'default'
  const conteudo = CONTEUDO_DIRETO[bloco] || CONTEUDO_DIRETO.default

  return {
    titulo: 'Seu Resultado',
    intro: 'Com base nas suas respostas, identificamos sinais de:',
    pontos,
    principal: principal?.texto || null,
    explicacao: conteudo.explicacao,
    sacola: conteudo.sacola,
    beneficios: conteudo.beneficios,
    conclusao: conteudo.conclusao,
    ctaTexto: conteudo.ctaTexto,
    msgWhatsApp: conteudo.msgWhatsApp,
  }
}

/**
 * Textos do diagnóstico — VERSÃO INDIRETA (público frio)
 * Personalizado conforme o bloco mais deficiente (energia, foco ou metabolismo)
 */
export function getDiagnosticoIndireto(respostas) {
  const pontos = obterPontosAtencao(respostas)
  const principal = pontos.find((p) => p.principal)
  const { principal: blocoPrincipal } = obterBlocoPrincipal(respostas)
  const bloco = blocoPrincipal?.bloco || 'default'
  const conteudo = CONTEUDO_INDIRETO[bloco] || CONTEUDO_INDIRETO.default

  return {
    titulo: 'Seu Resultado',
    intro: 'Identificamos que seu corpo apresenta:',
    pontos,
    principal: principal?.texto || null,
    explicacao: conteudo.explicacao,
    necessidades: conteudo.necessidades,
    alerta: conteudo.alerta,
    alertaItens: conteudo.alertaItens,
    transicao: conteudo.transicao,
    ctaTexto: conteudo.ctaTexto,
    msgWhatsApp: conteudo.msgWhatsApp,
  }
}
