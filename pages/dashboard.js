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
        const { data: sess } = await supabase.auth.getSession()
        if (!sess || !sess.session) {
          setLoading(false)
          return
        }
        setSession(sess.session)

        const { data, error: qError } = await supabase
          .from('casos')
          .select('*')
          .eq('user_id', sess.session.user.id)

        if (qError) throw qError
        setCasos(Array.isArray(data) ? data : [])
      } catch (e) {
        setError(e.message || 'Error inesperado')
      } finally {
        setLoading(false)
      }
    }

    cargar()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    unsub = () => listener.subscription.unsubscribe()

    return () => unsub()
  }, [])

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>

  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No estás autenticada/o</h2>
        <p>Volvé al inicio y pedí el enlace mágico por email.</p>
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
              <b>{String(c.codigo_de_caso || '')}</b>
              {c.tipo ? ' - ' + String(c.tipo) : ''}
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