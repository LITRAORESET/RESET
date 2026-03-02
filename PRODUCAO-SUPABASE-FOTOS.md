# Fotos na produção (Supabase)

Para a área **Minha foto** (Configurações) e os **flyers com foto** funcionarem no site em produção, use o **mesmo projeto Supabase** (ou o de produção) e faça:

## 1. SQL Editor

Rode no Supabase (SQL Editor) o conteúdo do arquivo **`supabase-avatar-membros.sql`**:

- Cria a coluna **`avatar_url`** na tabela **`membros`**
- Cria as políticas do Storage para o bucket **`avatars`**

## 2. Storage – bucket "avatars"

No Supabase: **Storage** → **New bucket**:

- **Name:** `avatars`
- **Public bucket:** ligado (Sim)
- **File size limit:** 2 MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/gif` (ou em branco)

Salve o bucket.

---

Depois disso, em produção a seção **Minha foto** continua aparecendo e o upload passa a funcionar (e as fotos entram nos flyers de reconhecimento).

Se o bucket ou a coluna ainda não existirem, a seção **Minha foto** ainda aparece; o upload só vai dar erro até a configuração acima ser feita no Supabase de produção.
