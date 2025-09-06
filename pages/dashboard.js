// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [casos, setCasos] = useState([])
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)

  useEffect(function () {
    async function cargar() {
      const res = await supabase.auth.getSession()
      const ses = res && res.data ? res.data.session : null
      if (!ses) { setLoading(false); return }
      setSession(ses)

      const q = await supabase.from('casos').select('*').eq('user_id', ses.user.id)
      if (q.error) setError(q.error.message)
      setCasos(q.data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>

  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No estás autenticado</h2>
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
          {casos.map(function (c) {
            return (
              <li key={c.id}>
                <b>{c.codigo_de_caso}</b> {c.tipo ? ' - ' + c.tipo : ''}
              </li>
          })}
        </ul>
      )}

      <button
        onClick={async function () { await supabase.auth.signOut() }}
        style={{ marginTop: 12 }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}