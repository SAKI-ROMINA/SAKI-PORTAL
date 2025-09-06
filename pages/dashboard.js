// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [casos, setCasos] = useState([])
  const [error, setError] = useState(null)

  // 1) Sesion y listener
  useEffect(() => {
    let subscription

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data ? data.session : null)

        const res = supabase.auth.onAuthStateChange(function (_event, newSession) {
          setSession(newSession)
        })
        subscription = res.data.subscription
      } catch (e) {
        setError((e && e.message) ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }

    init()
    return function cleanup() {
      if (subscription) { subscription.unsubscribe() }
    }
  }, [])

  // 2) Traer casos del usuario
  useEffect(() => {
    async function fetchCasos() {
      if (!session) { return }
      try {
        const resp = await supabase
          .from('casos')
          .select('*')
          .eq('user_id', session.user.id)

        if (resp.error) { throw resp.error }
        setCasos(resp.data || [])
      } catch (e) {
        setError((e && e.message) ? e.message : String(e))
      }
    }
    fetchCasos()
  }, [session])

  // 3) UI
  if (loading) { return <div style={{ padding: 24 }}>Cargando...</div> }

  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No estas autenticada/o</h2>
        <p>Volve al login y pedi el enlace magico.</p>
        <a href="/login">Ir al login</a>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis casos</h2>
      <p>Sesion: <b>{session.user.email}</b></p>

      {error && <p style={{ color: 'salmon' }}>Error: {error}</p>}

      {casos.length === 0 ? (
        <p>No hay casos cargados.</p>
      ) : (
        <ul>
          {casos.map(function (c) {
            return (
              <li key={c.id}>
                <b>{c.codigo_de_caso ? c.codigo_de_caso : (c.codigo ? c.codigo : c.id)}</b>
	        {c.tipo ? (' - ' + c.tipo) : ''}
              </li>
            )
          })}
        </ul>
      )}

      <button onClick={function () { supabase.auth.signOut() }} style={{ marginTop: 12 }}>
        Cerrar sesion
      </button>
    </div>
  )
}