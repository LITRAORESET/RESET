import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_SITE_URL || 'https://www.litraoreset.com.br',
        changeOrigin: true
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'images/reset-metabolico.jpeg'],
      workbox: {
        // Não colocar index.html no precache: documento sempre vem da rede em produção
        globIgnores: ['**/index.html'],
        navigateFallback: '/index.html'
      },
      manifest: {
        name: 'Litrão | Reset Metabólico',
        short_name: 'Litrão Reset',
        description: 'Energia Natural em Movimento. Bebida funcional e oportunidade de negócio.',
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f1f0f',
        theme_color: '#1e4620',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/images/reset-metabolico.jpeg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: '/images/reset-metabolico.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: '/images/reset-metabolico.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
})
