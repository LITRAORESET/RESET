// Imagem do logo Reset Metabólico — coloque o arquivo em public/images/
export const LOGO_RESET_METABOLICO = '/images/reset-metabolico.jpeg'

// Imagem de capa da explicação de negócio (compartilhamento WhatsApp em /oportunidade)
// Coloque em public/images/ — usada como og:image quando o link de oportunidade é compartilhado
export const CAPA_EXPLICACAO_NEGOCIO = '/images/capa-explicacao-negocio.jpg'

// Imagem de incentivo ao quiz (compartilhamento WhatsApp em /quiz)
// Coloque em public/images/ — imagem com mensagem incentivando a preencher o quiz de saúde
export const IMAGEM_QUIZ_INCENTIVO = '/images/quiz-incentivo.jpg'

// Imagem da sacola para material de estabelecimentos — coloque em public/images/
export const IMAGEM_SACOLA = '/images/sacola.png'

// URL do site (definida em .env.local como VITE_SITE_URL)
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.litraoreset.com.br'
export const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Litrão | Reset Metabólico'

// Vídeo da seção Projeto (Conheça o projeto Reset metabólico)
// YouTube: https://youtu.be/DUF7M-KK5vY — defina VITE_VIDEO_PROJETO para trocar
export const VIDEO_PROJETO = import.meta.env.VITE_VIDEO_PROJETO || 'https://www.youtube.com/embed/DUF7M-KK5vY'

// Capa do vídeo do projeto (imagem antes de dar play) — coloque em public/videos/
export const CAPA_VIDEO_PROJETO = '/videos/capa-projeto.jpg'

// Vídeo da seção Oportunidade — coloque o arquivo em public/videos/
// Nome padrão: oportunidade.mp4 (ou altere aqui para .webm, ou use URL do YouTube/Vimeo)
export const VIDEO_OPORTUNIDADE = '/videos/oportunidade.mp4'

// Vídeo da apresentação de negócio (página /oportunidade/:codigo e Minha Oportunidade)
export const VIDEO_APRESENTACAO_NEGOCIO = import.meta.env.VITE_VIDEO_APRESENTACAO_NEGOCIO || '/videos/oportunidade.mp4'

// Capa do vídeo (imagem que aparece antes de dar play) — coloque em public/videos/
// Nome padrão: capa-video.jpg (ou .png, .webp)
export const CAPA_VIDEO_OPORTUNIDADE = '/videos/capa-video.jpg'

// Vídeo da seção A Bebida (em pé/vertical) — coloque em public/videos/
// Nome padrão: bebida.mp4
export const VIDEO_BEBIDA = '/videos/bebida.mp4'

// Capa do vídeo da bebida (opcional) — coloque em public/videos/
export const CAPA_VIDEO_BEBIDA = '/videos/capa-bebida.jpg'

// Supabase (definido em .env.local)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// E-mail do admin (pode cadastrar sem solicitação aprovada)
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'faulaandre@gmail.com').toLowerCase()

// Sala Zoom do Clube Prata (segunda 8h) — mesma sala do Afiando Machado, só mudou o nome
// Defina em .env.local como VITE_CLUBE_PRATA_ZOOM_URL ou preencha aqui
export const CLUBE_PRATA_ZOOM_URL = import.meta.env.VITE_CLUBE_PRATA_ZOOM_URL || ''
