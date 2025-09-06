import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [casos, setCasos] = useState([])
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!session) {
          setLoading(false)
          return
        }
        setSession(session)

        const { data, error: casosError } = await supabase
          .from('casos')
          .select('*')
          .eq('user_id', session.user.id)

        if (casosError) throw casosError
        setCasos(data || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [])

  if (loading) return <p style={{ padding: 24 }}>Cargando...</p>

  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No estás autenticada</h2>
        <p>Volvé al login y pedí el enlace mágico por email.</p>
        <a href="/login">Ir al login</a>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis casos</h2>
      <p>Sesión: <b>{session.user.email}</b></p>

      {error ? (
        <p style={{ color: 'salmon' }}>Error: {error}</p>
      ) : null}

      {casos.length === 0 ? (
        <p>No hay casos cargados.</p>
      ) : (
        <ul>
          {casos.map((c) => (
            <li key={c.id}>
              <b>{c.codigo_de_caso || ''}</b>
              {c.tipo ? ' - ' + String(c.tipo) : ''}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={async () => {
          await supabase.auth.signOut()
        }}
        style={{ marginTop: 12 }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}