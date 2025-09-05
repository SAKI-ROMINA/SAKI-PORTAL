// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    // Verifica si hay sesión activa al cargar el dashboard
    const obtenerUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUsuario(user)
      } else {
        setUsuario(null)
      }
    }

    obtenerUsuario()
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', color: 'white' }}>
      <h1>Dashboard</h1>
      {usuario ? (
        <div>
          <p>✅ Sesión activa</p>
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>ID:</strong> {usuario.id}</p>
        </div>
      ) : (
        <p>⚠️ No hay usuario logueado</p>
      )}
    </div>
  )
}
