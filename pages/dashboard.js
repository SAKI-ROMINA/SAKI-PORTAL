// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [casos, setCasos] = useState([])
  const [error, setError] = useState(null)

  // 1) Obtener sesión y escuchar cambios (forma compatible con supabase-js v2)
  useEffect(() => {
    let subscription

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)

        const res = supabase.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession)
        })
        subscription = res.data.subscription
      } catch (e) {
        setError(e.message || String(e))
      } finally {
        setLoading(false)
      }
    }

    init()
    return () => { if (subscription) subscription.unsubscribe() }
  }, [])

  // 2) Cuando hay sesión, traer casos del usuario
  useEffect(() => {
    const fetchCasos = async () => {
      if (!session) return
      try {
        const { data, error } = await supabase
          .from('casos')
          .select('*')
          .eq('user_id', session.user.id)

        if (error) throw error
        setCasos(data || [])
      } catch (e) {
        setError(e.message || String(e))
      }
    }
    fetchCasos()
  }, [session])

  // 3) UI
  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>

  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No estás autenticada/o</h2>
        <p>Volvé al login y pedí el enlace mágico.</p>
        <a href="/login">Ir al login</a>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis casos</h2>
      <p>Sesión: <b>{session.user.email}</b></p>

      {error && <p style={{ color: 'salmon' }}>Error: {error}</p>}

      {casos.length === 0 ? (
        <p>No hay casos cargados.</p>
      ) : (
        <ul>
          {casos.map((c) => (
            <li key={c.id}>
              <b>{c.codigo_de_caso ?? c.codigo ?? c.id}</b>
              {c.tipo ? ` — ${c.tipo}` : ''}
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 12 }}>
        Cerrar sesión
      </button>
    </div>
  )
}