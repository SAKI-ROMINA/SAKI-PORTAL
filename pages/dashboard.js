// pages/dashboard.js
import { useEffect, useState } from 'react'
import Head from 'next/head'
import supabase from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (ignore) return

      if (!session) {
        // si no hay sesión, mandamos a /login
        window.location.href = '/login'
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    load()

    const { data: authListener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) window.location.href = '/login'
    })

    return () => {
      ignore = true
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  if (loading) return <div style={{ padding: '2rem' }}>Cargando…</div>

  return (
    <>
      <Head><title>Panel • SAKI</title></Head>
      <div className="container">
        <div className="card">
          <h1>Hola, {user?.email}</h1>
          <p>Bienvenida al panel.</p>
          <button
            className="btn"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  )
}
