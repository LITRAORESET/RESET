// Imagem do logo Reset Metabólico — coloque o arquivo em public/images/
export const LOGO_RESET_METABOLICO = '/images/reset-metabolico.jpeg'

// URL do site (definida em .env.local como VITE_SITE_URL)
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.litraoreset.com.br'
export const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Litrão | Reset Metabólico'

// Vídeo da seção Oportunidade — coloque o arquivo em public/videos/
// Nome padrão: oportunidade.mp4 (ou altere aqui para .webm, ou use URL do YouTube/Vimeo)
export const VIDEO_OPORTUNIDADE = '/videos/oportunidade.mp4'

// Capa do vídeo (imagem que aparece antes de dar play) — coloque em public/videos/
// Nome padrão: capa-video.jpg (ou .png, .webp)
export const CAPA_VIDEO_OPORTUNIDADE = '/videos/capa-video.jpg'

// Supabase (definido em .env.local)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
