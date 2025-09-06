// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [casos, setCasos] = useState([])
  const [email, setEmail] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session || !session.session) {
        setLoading(false)
        return
      }

      setEmail(session.session.user.email)

      const { data, error } = await supabase
        .from('casos')
        .select('*')
        .eq('user_id', session.session.user.id) // 👈 acá corregido

      if (!error) setCasos(data || [])
      setLoading(false)
    }

    cargar()
  }, [])

  if (loading) return <p style={{ padding: 24 }}>Cargando...</p>

  if (!email) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No estás autenticado</h2>
        <p>Volvé al inicio y pedí el enlace mágico por email.</p>
        <a href="/">Ir al inicio</a>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis casos</h2>
      <p>Sesión activa: {email}</p>
      {casos.length === 0 ? (
        <p>No tenés casos todavía.</p>
      ) : (
        <ul>
          {casos.map((caso) => (
            <li key={caso.id}>
              <strong>{caso.codigo_de_caso}</strong> - {caso.tipo}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}