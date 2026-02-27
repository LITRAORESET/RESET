# Litrão · Reset Metabólico

SaaS de suporte para distribuidores do projeto de bebidas funcionais Herbalife (Litrão / Reset Metabólico).

**Mobile First:** todo o layout e CSS foram pensados primeiro para telas pequenas (celular). Os breakpoints usam `min-width` para progressive enhancement em tablet e desktop. Botões e CTAs têm área de toque mínima (~44px) em mobile.

## O que tem hoje

- **Landing page**: apresentação do projeto (a bebida + oportunidade de negócio)
- **Solicitar acesso** (`/solicitar`): cadastro único — a pessoa preenche nome, e-mail, ID, senha e mensagem; a conta é criada na hora e fica **aguardando aprovação**
- **Login** (`/login`): se aprovado, vai para a área de membros; se aguardando, mostra “Aguardando aprovação”; se rejeitado, mostra mensagem; admin vai para `/admin`
- **Área de membros** (`/membros`): conteúdo exclusivo (PDFs, vídeos) — só quem foi aprovado acessa
- **Área administrativa** (`/admin`): lista de **solicitações pendentes** (Aprovar / Rejeitar em 1 clique) e lista de **membros aprovados**

## Como rodar

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Build para produção

```bash
npm run build
npm run preview
```

## Configuração (Supabase + admin)

1. **Variáveis de ambiente**: crie `.env.local` com `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (e opcionalmente `VITE_SITE_URL`, `VITE_SITE_NAME`).

2. **Desativar confirmação de e-mail** (para não pedir confirmação ao cadastrar): no **Supabase** → **Authentication** → **Providers** → **Email**. Desligue a opção **"Confirm email"** (ou "Enable email confirmations") e salve. Assim quem se cadastra já pode entrar com o mesmo e-mail e senha sem precisar clicar em link no e-mail.

3. **Tabelas e trigger**: no Supabase, **SQL Editor** → execute **`supabase-schema.sql`** (cria `perfil` com aprovado/rejeitado e `membros` com id_distribuidor e mensagem). Se você já tinha o schema antigo, rode **`supabase-migracao-cadastro-unico.sql`**.

4. **Administrador**: o e-mail **faulaandre@gmail.com** vira admin ao se cadastrar em `/solicitar` (já aprovado). Depois faça login → você vai para `/admin`. Lá aparecem as **solicitações pendentes** (quem se cadastrou e ainda não foi aprovado); com um clique em **Aprovar** a pessoa passa a acessar a área de membros com o mesmo login.

5. **Área de membros (conteúdo)**: a estrutura tem 6 pilares + Agenda (Comece Aqui, Produto, Como Vender, Plano 7 Dias, Duplicação, Materiais, Agenda). Edite **`src/data/areaMembrosEstrutura.js`** para adicionar vídeos e PDFs em cada pilar; os arquivos ficam em **`public/materiais/`**.
