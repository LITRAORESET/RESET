# Configurar URLs no Supabase (obrigatório para login em produção)

Se o login em **https://www.litraoreset.com.br** dá "E-mail ou senha incorretos" mesmo com senha certa, falta o Supabase aceitar a origem do site.

## Passos (faça exatamente)

1. Abra o **Supabase**: https://supabase.com/dashboard  
2. Entre no projeto (LITRAORESET).  
3. No menu lateral: **Authentication** → **URL Configuration**.  
4. Preencha:

   **Site URL** (uma só):
   ```
   https://www.litraoreset.com.br
   ```

   **Redirect URLs** (uma por linha; inclua as duas se quiser):
   ```
   https://www.litraoreset.com.br/**
   https://litraoreset.com.br/**
   ```

5. Clique em **Save**.  
6. Tente fazer login de novo no site (pode levar alguns segundos para aplicar).

## Se ainda falhar

- **Authentication** → **Users**: confira se existe o usuário com o e-mail que você usa. Se não existir, crie; se existir, use **Send password recovery** e defina uma senha nova. Use essa mesma senha no site.
- **Authentication** → **Providers** → **Email**: deixe **Enable Email provider** ativado e, se existir, desative **Confirm email**.
