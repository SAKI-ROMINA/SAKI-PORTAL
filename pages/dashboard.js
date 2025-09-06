// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)
  const [casos, setCasos] = useState([])

  useEffect(() => {
    let unsub = () => {}

    async function cargar() {
      try {
        setLoading(true)
        setError(null)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setSession(null)
          setCasos([])
          setLoading(false)
          return
        }
        setSession(session)

        // Traer casos del usuario logueado
        const { data, error } = await supabase
          .from('casos')
          .select('*')
          .eq('user_id', session.user.id)

        if (error) throw error
        setCasos(data || [])
      } catch (e) {
        setError(e.message || 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }

    cargar()

    // Escucha cambios de sesión (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess)
      if (sess) cargar()
      else {
        setCasos([])
        setLoading(false)
      }
    })

    unsub = () => listener.subscription.unsubscribe()
    return () => unsub()
  }, [])

  // UI
  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>

  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No estás autenticada/o</h2>
        <p>Volvé al login y pedí el enlace mágico por email.</p>
        <a href="/login">Ir al login</a>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis casos</h2>
      <p>Sesión: <b>{session.user.email}</b></p>

      {error ? <p style={{ color: 'salmon' }}>Error: {error}</p> : null}

      {casos.length === 0 ? (
        <p>No hay casos cargados.</p>
      ) : (
        <ul>
          {casos.map((c) => (
            <li key={c.id}>
              <b>{c.codigo_de_caso}</b>{c.tipo ? ' - ' + c.tipo : ''}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={async () => { await supabase.auth.signOut() }}
        style={{ marginTop: 12 }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}