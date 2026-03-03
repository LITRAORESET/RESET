import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'

export default function Layout() {
  const location = useLocation()
  const isAreaMembros = location.pathname.startsWith('/membros') || location.pathname.startsWith('/admin') || location.pathname === '/painel-execucao'

  return (
    <div className="layout">
      {!isAreaMembros && <Header />}
      <main className="layout-main">
        <Outlet />
      </main>
      {!isAreaMembros && <Footer />}
    </div>
  )
}
