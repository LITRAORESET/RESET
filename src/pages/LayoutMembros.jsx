import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { getSession, getPerfil, signOut } from '../lib/auth'
import { PILARES, FRASE_OFICIAL_RECRUTAMENTO } from '../data/areaMembrosEstrutura'
import './AreaMembros.css'

export default function LayoutMembros() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuAberto, setMenuAberto] = useState(false)

  const isExecucao = location.pathname === '/membros/execucao'
  const [searchParams] = useSearchParams()
  const secaoAtiva = searchParams.get('secao') || 'comece-aqui'

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await getSession()
      if (cancelled) return
      setSession(data?.session ?? null)
      if (data?.session) {
        const p = await getPerfil()
        if (cancelled) return
        setPerfil(p)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (loading) return
    if (!session) navigate('/login', { replace: true })
    else if (perfil && perfil.role === 'membro' && !perfil.aprovado) navigate('/login', { replace: true })
  }, [loading, session, perfil, navigate])

  async function handleSair() {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="area-membros">
        <div className="area-membros__loading-wrap">
          <p className="area-membros__loading">Carregando…</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="area-membros">
      <header className="area-membros__header">
        <div className="area-membros__header-inner">
          <button
            type="button"
            className="area-membros__menu-btn"
            aria-label="Abrir menu"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <span />
            <span />
            <span />
          </button>
          <h1 className="area-membros__logo">Litrão Reset · Área de Membros</h1>
          <button type="button" className="area-membros__btn-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </header>

      <div className="area-membros__body">
        <aside className={`area-membros__sidebar ${menuAberto ? 'area-membros__sidebar--open' : ''}`}>
          <nav className="area-membros__nav">
            {PILARES.map((p) => (
              <Link
                key={p.id}
                to={`/membros?secao=${p.id}`}
                className={`area-membros__nav-item ${!isExecucao && secaoAtiva === p.id ? 'area-membros__nav-item--ativo' : ''}`}
                onClick={() => setMenuAberto(false)}
              >
                <span className="area-membros__nav-icon">{p.icon}</span>
                <span className="area-membros__nav-label">{p.titulo}</span>
              </Link>
            ))}
            <Link
              to="/membros/execucao"
              className={`area-membros__nav-item ${isExecucao ? 'area-membros__nav-item--ativo' : ''}`}
              onClick={() => setMenuAberto(false)}
            >
              <span className="area-membros__nav-icon">🔥</span>
              <span className="area-membros__nav-label">Executar Meu Dia</span>
            </Link>
            {(perfil?.role === 'admin' || perfil?.role === 'leader') && (
              <Link
                to="/painel-execucao"
                className="area-membros__nav-item"
                onClick={() => setMenuAberto(false)}
              >
                <span className="area-membros__nav-icon">📊</span>
                <span className="area-membros__nav-label">Painel de Execução</span>
              </Link>
            )}
          </nav>
          <p className="area-membros__nav-footer">
            <Link to="/">Voltar ao site</Link>
          </p>
        </aside>

        <main className="area-membros__main">
          <Outlet />
        </main>
      </div>

      {menuAberto && (
        <div
          className="area-membros__overlay"
          aria-hidden="true"
          onClick={() => setMenuAberto(false)}
        />
      )}
    </div>
  )
}
