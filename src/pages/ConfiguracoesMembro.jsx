import { useState, useEffect } from 'react'
import { getSession, getMembro } from '../lib/auth'
import { supabase } from '../lib/supabase'
import './AreaMembros.css'

export default function ConfiguracoesMembro() {
  const [membro, setMembro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [msgDados, setMsgDados] = useState(null)
  const [erroDados, setErroDados] = useState('')
  const [salvandoDados, setSalvandoDados] = useState(false)
  const [salvandoFoto, setSalvandoFoto] = useState(false)
  const [erroFoto, setErroFoto] = useState('')

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [msgSenha, setMsgSenha] = useState(null)
  const [erroSenha, setErroSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState({ atual: false, nova: false, conf: false })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const m = await getMembro()
      if (cancelled) return
      setMembro(m)
      if (m) {
        setNome(m.nome ?? '')
        setTelefone(m.telefone ?? '')
        setAvatarUrl(m.avatar_url ?? null)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function handleSalvarDados(e) {
    e.preventDefault()
    setErroDados('')
    setMsgDados(null)
    const { data: { session } } = await getSession()
    if (!session?.user?.id || !supabase) {
      setErroDados('Sessão inválida. Faça login novamente.')
      return
    }
    setSalvandoDados(true)
    const { error } = await supabase
      .from('membros')
      .update({ nome: nome.trim() || null, telefone: telefone.trim() || null })
      .eq('user_id', session.user.id)
    setSalvandoDados(false)
    if (error) {
      setErroDados('Não foi possível salvar. Tente novamente.')
      return
    }
    setMembro((prev) => ({ ...prev, nome: nome.trim() || null, telefone: telefone.trim() || null }))
    setMsgDados('Dados salvos.')
  }

  async function handleFotoChange(e) {
    const file = e.target?.files?.[0]
    if (!file || !supabase) return
    const { data: { session } } = await getSession()
    if (!session?.user?.id) return
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    if (!['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(ext)) {
      setErroFoto('Use uma imagem (JPG, PNG, WebP ou GIF).')
      return
    }
    setErroFoto('')
    setSalvandoFoto(true)
    const path = `${session.user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) {
      setErroFoto('Não foi possível enviar a foto. Verifique se o bucket "avatars" existe no Supabase.')
      setSalvandoFoto(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: updateError } = await supabase.from('membros').update({ avatar_url: publicUrl }).eq('user_id', session.user.id)
    setSalvandoFoto(false)
    if (updateError) {
      setErroFoto('Foto enviada, mas não foi possível atualizar. Tente de novo.')
      return
    }
    setAvatarUrl(publicUrl)
    setMembro((prev) => ({ ...prev, avatar_url: publicUrl }))
  }

  async function handleTrocarSenha(e) {
    e.preventDefault()
    setErroSenha('')
    setMsgSenha(null)
    if (novaSenha.length < 6) {
      setErroSenha('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha('A nova senha e a confirmação não coincidem.')
      return
    }
    if (!supabase) {
      setErroSenha('Não foi possível alterar a senha.')
      return
    }
    setSalvandoSenha(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSalvandoSenha(false)
    if (error) {
      setErroSenha('Não foi possível alterar a senha. Tente novamente.')
      return
    }
    setMsgSenha('Senha alterada com sucesso.')
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmarSenha('')
  }

  if (loading) {
    return (
      <div className="area-membros__conteudo">
        <p className="area-membros__loading">Carregando…</p>
      </div>
    )
  }

  const nomeExibicao = membro?.nome?.trim() || membro?.email || 'Membro'

  return (
    <div className="area-membros__conteudo">
      <h2 className="area-membros__conteudo-titulo">
        <span className="area-membros__conteudo-icon">⚙️</span>
        Configurações
      </h2>
      <p className="area-membros__conteudo-subtitulo">Seus dados e senha</p>

      <div className="config-membro__nome-cabecalho">
        <span className="config-membro__nome-label">Olá,</span>
        <strong className="config-membro__nome-valor">{nomeExibicao}</strong>
      </div>

      <section className="config-membro__bloco">
        <h3 className="config-membro__bloco-titulo">Minha foto</h3>
        <p className="config-membro__hint">Sua foto aparece nos flyers de reconhecimento (Clube Ouro e Elite) quando você se qualificar.</p>
        <div className="config-membro__foto-wrap">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Sua foto" className="config-membro__avatar" />
          ) : (
            <div className="config-membro__avatar config-membro__avatar--placeholder">Sem foto</div>
          )}
          <label className="config-membro__foto-btn">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFotoChange} disabled={salvandoFoto} className="config-membro__foto-input" />
            {salvandoFoto ? 'Enviando…' : (avatarUrl ? 'Trocar foto' : 'Enviar foto')}
          </label>
        </div>
        {erroFoto && <p className="config-membro__erro" role="alert">{erroFoto}</p>}
      </section>

      <section className="config-membro__bloco">
        <h3 className="config-membro__bloco-titulo">Meus dados</h3>
        <form onSubmit={handleSalvarDados} className="config-membro__form">
          <label className="config-membro__label">
            Nome
            <input
              type="text"
              className="config-membro__input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              autoComplete="name"
            />
          </label>
          <label className="config-membro__label">
            Telefone
            <input
              type="tel"
              className="config-membro__input"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              autoComplete="tel"
            />
          </label>
          <p className="config-membro__hint">Usado nos botões de WhatsApp da sua página de oportunidade (Minha Oportunidade).</p>
          <p className="config-membro__hint">E-mail de login não pode ser alterado aqui.</p>
          {erroDados && <p className="config-membro__erro" role="alert">{erroDados}</p>}
          {msgDados && <p className="config-membro__sucesso" role="status">{msgDados}</p>}
          <button type="submit" className="config-membro__btn" disabled={salvandoDados}>
            {salvandoDados ? 'Salvando…' : 'Salvar dados'}
          </button>
        </form>
      </section>

      <section className="config-membro__bloco">
        <h3 className="config-membro__bloco-titulo">Trocar senha</h3>
        <form onSubmit={handleTrocarSenha} className="config-membro__form">
          <label className="config-membro__label">
            Nova senha (mín. 6 caracteres)
            <span className="config-membro__input-wrap">
              <input
                type={mostrarSenha.nova ? 'text' : 'password'}
                className="config-membro__input"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="config-membro__toggle-senha"
                onClick={() => setMostrarSenha((s) => ({ ...s, nova: !s.nova }))}
                aria-label={mostrarSenha.nova ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha.nova ? '🙈' : '👁'}
              </button>
            </span>
          </label>
          <label className="config-membro__label">
            Confirmar nova senha
            <span className="config-membro__input-wrap">
              <input
                type={mostrarSenha.conf ? 'text' : 'password'}
                className="config-membro__input"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="config-membro__toggle-senha"
                onClick={() => setMostrarSenha((s) => ({ ...s, conf: !s.conf }))}
                aria-label={mostrarSenha.conf ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha.conf ? '🙈' : '👁'}
              </button>
            </span>
          </label>
          {erroSenha && <p className="config-membro__erro" role="alert">{erroSenha}</p>}
          {msgSenha && <p className="config-membro__sucesso" role="status">{msgSenha}</p>}
          <button type="submit" className="config-membro__btn" disabled={salvandoSenha}>
            {salvandoSenha ? 'Alterando…' : 'Alterar senha'}
          </button>
        </form>
      </section>
    </div>
  )
}
