import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Login e cadastro não funcionarão.')
}

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null
