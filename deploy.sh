#!/usr/bin/env bash
# Força deploy em produção na Vercel.
# Uso: ./deploy.sh   (antes rode: npx vercel login)
set -e
cd "$(dirname "$0")"
echo "Build local..."
npm run build
echo "Deploy produção (Vercel)..."
npx vercel --prod --yes
