# Deploy não está acontecendo (GitHub mostra X 0/1)

O "X 0/1" no GitHub significa que **1 verificação obrigatória** (geralmente o deploy da Vercel) **não está passando**.

## O que fazer

### 1. Ver o erro na Vercel
1. Acesse [vercel.com](https://vercel.com) e entre na sua conta.
2. Abra o projeto **Litrão Reset** (ou o nome que estiver).
3. Aba **Deployments**.
4. Clique no último deployment (o que está com erro).
5. Veja o **log do Build** ou a mensagem de erro (ex.: "Build failed", variável faltando, etc.).

### 2. Conferir variáveis de ambiente
Se o build falhar por variável não definida:
- **Settings** → **Environment Variables**.
- Use a lista em `vercel-variaveis.txt` e preencha para **Production** (e opcionalmente Preview):
  - `VITE_SITE_URL`
  - `VITE_SITE_NAME`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_ADMIN_EMAIL`
- Salve e faça **Redeploy** no último deployment.

### 3. Conferir conexão GitHub
- **Settings** → **Git**.
- Confirme que o repositório conectado é **LITRAORESET/RESET** e a branch **main**.
- Se não estiver conectado, clique em **Connect Git Repository** e escolha o repo.

### 4. Deploy manual pela CLI (enquanto isso)
No seu computador, na pasta do projeto:
```bash
npx vercel login
npx vercel --prod
```
Isso sobe a versão atual mesmo que o GitHub ainda mostre X 0/1.

### 5. Verificação obrigatória no GitHub
Se no repositório tiver **Branch protection** em `main` exigindo “1 check”:
- Em **Settings** → **Branches** → rule da `main` → **Status checks**.
- Se aparecer algo como “Vercel” ou “vercel”, esse é o check que está falhando.
- Corrigir o deploy na Vercel (passos 1 e 2) costuma fazer esse check voltar a passar.

### 6. Usar o check "Build" do GitHub (alternativa)
O projeto tem um workflow em `.github/workflows/build.yml` que roda o build a cada push.
- Depois do próximo push, em **Actions** você verá o job "Build".
- No repositório: **Settings** → **Branches** → editar a rule da `main` → em **Required status checks** adicione **Build** (e pode remover "Vercel" se quiser).
- Assim o ✓ passa quando o build do GitHub Actions funcionar; o deploy em produção você pode fazer pela Vercel (Redeploy no painel ou `npx vercel --prod`).
