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

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.replace('/login')
      else setLoading(false)
    }
    check()
  }, [router])

  if (loading) return <div style={{padding:'2rem'}}>Cargando…</div>

  return (
    <div className="container">
      <h1>Bienvenida, Romina</h1>
      <button className="btn" onClick={() => supabase.auth.signOut().then(()=>router.replace('/login'))}>
        Cerrar sesión
      </button>
    </div>
  )
}
