import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Solicitar from './pages/Solicitar'
import LayoutMembros from './pages/LayoutMembros'
import AreaMembros from './pages/AreaMembros'
import MaterialViewer from './pages/MaterialViewer'
import Execucao12X from './pages/Execucao12X'
import ConfiguracoesMembro from './pages/ConfiguracoesMembro'
import Admin from './pages/Admin'
import PainelExecucao from './pages/PainelExecucao'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="cadastro" element={<Cadastro />} />
        <Route path="solicitar" element={<Solicitar />} />
        <Route path="membros" element={<LayoutMembros />}>
          <Route index element={<AreaMembros />} />
          <Route path="material/:arquivo" element={<MaterialViewer />} />
          <Route path="execucao" element={<Execucao12X />} />
          <Route path="configuracoes" element={<ConfiguracoesMembro />} />
        </Route>
        <Route path="admin" element={<Admin />} />
        <Route path="painel-execucao" element={<PainelExecucao />} />
      </Route>
    </Routes>
  )
}
