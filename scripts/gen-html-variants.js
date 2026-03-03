/**
 * Gera oportunidade.html e quiz.html com meta tags específicas para compartilhamento no WhatsApp.
 * Cada rota usa uma imagem diferente quando o link é compartilhado.
 *
 * - /oportunidade/* → capa da explicação de negócio (capa-explicacao-negocio.jpg)
 * - /quiz/* → logo Litrão (reset-metabolico.jpeg) — não usa imagens oficiais Case Saúde
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')

// Lê VITE_SITE_URL do .env.local se existir
function getSiteUrl() {
  try {
    const envPath = join(__dirname, '..', '.env.local')
    const env = readFileSync(envPath, 'utf-8')
    const match = env.match(/VITE_SITE_URL=(.+)/)
    if (match) return match[1].trim().replace(/\/$/, '')
  } catch (_) {}
  return 'https://www.litraoreset.com.br'
}

const SITE_URL = getSiteUrl()

function replaceMeta(html, { image, title, description }) {
  return html
    .replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${image}" />`
    )
    .replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${title}" />`
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${description}" />`
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*" \/>/,
      `<meta name="twitter:image" content="${image}" />`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${title}" />`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${description}" />`
    )
}

function main() {
  const indexPath = join(distDir, 'index.html')
  const html = readFileSync(indexPath, 'utf-8')

  const oportunidadeHtml = replaceMeta(html, {
    image: `${SITE_URL}/images/capa-explicacao-negocio.jpg`,
    title: 'Ganhe R$500 por semana com bebidas funcionais',
    description: 'Assista à apresentação da oportunidade Litrão Reset Metabólico. Bebidas funcionais e negócio com suporte.',
  })

  const quizHtml = replaceMeta(html, {
    image: `${SITE_URL}/images/quiz-incentivo.jpg`,
    title: 'Quiz de Saúde | Litrão Reset Metabólico',
    description: 'Descubra em menos de 1 minuto como está sua energia, foco e metabolismo.',
  })

  writeFileSync(join(distDir, 'oportunidade.html'), oportunidadeHtml)
  writeFileSync(join(distDir, 'quiz.html'), quizHtml)

  console.log('✓ Gerados: oportunidade.html, quiz.html (meta tags para WhatsApp)')
}

main()
