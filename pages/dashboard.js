// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Verifica si hay sesión activa
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!user) {
    return <p style={{ padding: '2rem' }}>⏳ Cargando usuario...</p>
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Bienvenido/a, {user.email}</h1>
      <p>🎉 Ya estás en el panel del cliente.</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  )
}
