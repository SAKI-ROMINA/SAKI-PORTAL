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

// pages/dashboard.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Header from '../components/Header'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      setUser(session.user)
      setLoading(false)
    }
    run()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div className="card">Cargando…</div>
      </div>
    )
  }

  return (
    <>
      <Header onLogout={handleLogout} />

      <div className="container">
        <div className="card">
          <h1 className="h1" style={{marginBottom: 4}}>Hola {user?.email}</h1>
          <p className="muted" style={{marginBottom: 16}}>
            Bienvenida/o a tu panel. Elegí una opción para continuar.
          </p>

          <div className="grid">
            <a className="tile" href="/docs">
              <h3 className="tile__title">Mis documentos</h3>
              <p className="tile__desc">Subí archivos y consultá los que ya enviaste.</p>
            </a>

            <a className="tile" href="/cases">
              <h3 className="tile__title">Mis casos</h3>
              <p className="tile__desc">Estado de tus trámites y novedades.</p>
            </a>

            <a className="tile" href="/profile">
              <h3 className="tile__title">Mi perfil</h3>
              <p className="tile__desc">Datos de contacto y preferencias.</p>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
