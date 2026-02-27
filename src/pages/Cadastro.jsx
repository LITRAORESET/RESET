import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

// Cadastro único é em /solicitar (nome, e-mail, ID, senha); redirecionamos para lá.
export default function Cadastro() {
  return <Navigate to="/solicitar" replace />
}
