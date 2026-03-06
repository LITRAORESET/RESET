/**
 * Estrutura da Área de Membros – Sistema de Formação Litrão Reset
 * Menu: Comece Aqui, Plano 7 Dias, Produto, Como Vender, Scripts Oficiais, Recrutamento, Meu link de indicação, Rotina Diária, Agenda Sistema, Materiais
 * Arquivos em public/materiais/ (PDF ou HTML para imprimir como PDF)
 */

/** Pergunta oficial de vendas da sacola (oferta produto) */
export const FRASE_OFICIAL_SACOLA =
  'Quem você conhece que gostaria de mais energia, concentração e desintoxicar ESSA SEMANA?'

/** Pergunta oficial de recrutamento (oferta renda/negócio) */
export const FRASE_OFICIAL_RECRUTAMENTO =
  'Quem você conhece que gostaria de ganhar R$500 por semana com bebidas funcionais?'

export const PILARES = [
  {
    id: 'comece-aqui',
    titulo: 'Comece Aqui',
    subtitulo: 'Obrigatório – sua base',
    icon: '📌',
    descricao: 'Boas-vindas, explicação do projeto, meta 12 sacolas/semana (R$540). Primeiro você aprende a vender. Depois aprende a duplicar.',
    itens: [
      { tipo: 'pdf', titulo: 'Como funciona o lucro', arquivo: 'comece-aqui-lucro.html', descricao: 'R$70 venda, R$45 lucro, 12 sacolas = R$540/semana.' },
      { tipo: 'pdf', titulo: 'Pergunta Oficial – Como usar', arquivo: 'pergunta-oficial.html', descricao: 'A pergunta principal e quando usá-la: pós-venda, pós-apresentação, conversa casual.' },
    ],
  },
  {
    id: 'plano-7-dias',
    titulo: 'Plano 7 Dias',
    subtitulo: 'Primeiras 12 sacolas',
    icon: '🎯',
    descricao: 'Dia 1 Lista · Dia 2 Mensagens · Dia 3 Stories · Dia 4 Fechamento · Dia 5 Indicação · Dia 6 Acompanhamento · Dia 7 Organização.',
    itens: [
      { tipo: 'pdf', titulo: 'Plano 7 Dias – Checklist (imprimir)', arquivo: 'plano-7-dias-checklist.html', descricao: 'Meta: 12 sacolas na semana. Dia a dia.' },
    ],
  },
  {
    id: 'produto',
    titulo: 'Produto',
    subtitulo: 'Treinamento da Bebida',
    icon: '🧴',
    descricao: 'O que é o Litrão Reset, como preparar, como explicar sem exagerar. Benefícios em linguagem simples e FAQ.',
    itens: [
      { tipo: 'pdf', titulo: 'Manual de Explicação do Litrão Reset', arquivo: 'produto-manual-explicacao.html', descricao: 'Frases padrão, benefícios, o que não pode falar.' },
    ],
  },
  {
    id: 'como-vender',
    titulo: 'Como Vender',
    subtitulo: 'Passo a passo simples',
    icon: '💰',
    descricao: 'Scripts de conversa, áudio estratégico, stories, fechamento, acompanhamento, indicação.',
    itens: [
      { tipo: 'pdf', titulo: 'Guia Rápido de Vendas', arquivo: 'como-vender-guia.html', descricao: 'Scripts, stories, fechamento, acompanhamento em 2 páginas.' },
    ],
  },
  {
    id: 'scripts-oficiais',
    titulo: 'Scripts Oficiais',
    subtitulo: 'Falas padronizadas',
    icon: '📜',
    descricao: 'Scripts para iniciar conversa, cliente, acompanhamento, recrutamento, indicação e colocar na apresentação.',
    itens: [
      { tipo: 'pdf', titulo: 'Todos os Scripts Oficiais', arquivo: 'scripts-oficiais.html', descricao: 'Iniciar conversa, cliente, acompanhamento, recrutamento, indicação, apresentação.' },
    ],
  },
  {
    id: 'recrutamento',
    titulo: 'Recrutamento',
    subtitulo: 'Projeto R$500 por semana',
    icon: '👥',
    descricao: 'Modelo de ganho, pergunta oficial de recrutamento, como convidar. Foco: colocar pessoas nas apresentações.',
    itens: [
      { tipo: 'pdf', titulo: 'Projeto R$500 por Semana – Como Convidar', arquivo: 'recrutamento-r500.html', descricao: 'Pergunta oficial, modelo de ganho, scripts.' },
    ],
  },
  {
    id: 'meu-link',
    titulo: 'Meu link de indicação',
    subtitulo: 'Link único para indicar',
    icon: '🔗',
    descricao: 'Gere seu link personalizado. Quem se cadastrar por ele já fica vinculado a você.',
    itens: [],
  },
  {
    id: 'rotina-diaria',
    titulo: 'Rotina Diária',
    subtitulo: 'Atividade obrigatória',
    icon: '📋',
    descricao: 'Geração de contato por perfil (Comunicadora, Digital, Híbrido), checklist diário, colocar pessoas nas apresentações.',
    itens: [
      { tipo: 'pdf', titulo: 'Sistema 12X – Método de Execução Diária', arquivo: 'sistema-12x-execucao-diaria.html', descricao: 'Horários 8h, 10h, 13h, 15h, noite. 3 metas diárias obrigatórias.' },
      { tipo: 'pdf', titulo: 'Atividade Diária Obrigatória', arquivo: 'rotina-diaria.html', descricao: 'Regras gerais, pergunta oficial, acompanhamento.' },
      { tipo: 'pdf', titulo: 'Rotina por Perfil (Comunicadora, Digital, Híbrido)', arquivo: 'rotina-por-perfil.html', descricao: 'Comportamento diário conforme seu perfil: falar mais ou internet mais.' },
      { tipo: 'pdf', titulo: 'Rotina Semanal – Segunda a Sábado', arquivo: 'rotina-semanal-vendas.html', descricao: 'Checklist por dia para fechar 12 sacolas.' },
    ],
  },
  {
    id: 'agenda-oficial',
    titulo: 'Agenda Sistema',
    subtitulo: 'Apresentações e treinamentos',
    icon: '📅',
    descricao: 'Horários das apresentações do negócio e dos treinamentos oficiais. Seu trabalho é colocar pessoas nas apresentações.',
    itens: [
      { tipo: 'pdf', titulo: 'Horários de Apresentação do Negócio', arquivo: 'agenda-apresentacoes.html', descricao: 'Segunda 10h e 15h, Terça 8h30 e 15h, Quarta 20h, Quinta 15h, Sexta 8h30.' },
      { tipo: 'pdf', titulo: 'Treinamentos Oficiais', arquivo: 'treinamentos-oficiais.html', descricao: 'Segunda 8h Mentalidade; Seg-Sex 9h-9h30 clientes e produto.' },
    ],
  },
  {
    id: 'materiais',
    titulo: 'Materiais',
    subtitulo: 'Downloads',
    icon: '📂',
    descricao: 'Artes, scripts, tabela de lucro, planilha, modelos de story e bio. Tudo que a equipe precisa.',
    itens: [
      { tipo: 'pdf', titulo: 'Manual do Movimento Litrão Reset', arquivo: 'manual-movimento.html', descricao: 'Identidade, 3 pilares, código, cultura.' },
      { tipo: 'pdf', titulo: 'Manifesto Oficial', arquivo: 'manifesto.html', descricao: 'Saúde, movimento, disciplina. Nós fazemos diferença.' },
    ],
  },
]
