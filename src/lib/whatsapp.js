/**
 * Formata telefone para link do WhatsApp (wa.me).
 * Aceita (11) 99999-9999, 11999999999, etc. Retorna só dígitos; adiciona 55 se for Brasil.
 */
export function formatPhoneForWhatsApp(telefone) {
  if (!telefone || typeof telefone !== 'string') return ''
  const digits = telefone.replace(/\D/g, '')
  if (digits.length < 10) return ''
  let num = digits
  if (num.length === 11 && num.startsWith('0')) num = num.slice(1)
  if (num.length === 10 || num.length === 11) num = '55' + num
  return num
}

export function buildWhatsAppUrl(telefone, text = '') {
  const num = formatPhoneForWhatsApp(telefone)
  if (!num) return null
  const base = `https://wa.me/${num}`
  if (text && text.trim()) return `${base}?text=${encodeURIComponent(text.trim())}`
  return base
}
