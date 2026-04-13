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
import ClubeOuro from './pages/ClubeOuro'
import Admin from './pages/Admin'
import AdminClubeOuro from './pages/AdminClubeOuro'
import PainelExecucao from './pages/PainelExecucao'
import AdminExecucao from './pages/AdminExecucao'
import OportunidadePage from './pages/OportunidadePage'
import MinhaOportunidade from './pages/MinhaOportunidade'
import MinhaQuiz from './pages/MinhaQuiz'
import QuizExemplos from './pages/QuizExemplos'
import QuizMateriaisEstabelecimentos from './pages/QuizMateriaisEstabelecimentos'
import QuizRst from './pages/QuizRst'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="cadastro" element={<Cadastro />} />
        <Route path="solicitar" element={<Solicitar />} />
        <Route path="oportunidade/:codigo" element={<OportunidadePage />} />
        <Route path="quiz/:codigo" element={<QuizRst />} />
        <Route path="membros" element={<LayoutMembros />}>
          <Route index element={<AreaMembros />} />
          <Route path="material/:arquivo" element={<MaterialViewer />} />
          <Route path="execucao" element={<Execucao12X />} />
          <Route path="clube-ouro" element={<ClubeOuro />} />
          <Route path="oportunidade" element={<MinhaOportunidade />} />
          <Route path="quiz" element={<MinhaQuiz />} />
          <Route path="quiz-exemplos" element={<QuizExemplos />} />
          <Route path="quiz-materiais" element={<QuizMateriaisEstabelecimentos />} />
          <Route path="configuracoes" element={<ConfiguracoesMembro />} />
        </Route>
        <Route path="admin" element={<Admin />} />
        <Route path="admin-clube-ouro" element={<AdminClubeOuro />} />
        <Route path="painel-execucao" element={<PainelExecucao />} />
        <Route path="admin-execucao-analitica" element={<AdminExecucao />} />
      </Route>
    </Routes>
  )
}
