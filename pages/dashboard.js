// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [casos, setCasos] = useState([])
  const [err, setErr] = useState(null)
  const [hashSeen, setHashSeen] = useState(false)

  // 1) Al cargar, obtener sesión + escuchar cambios
  useEffect(() => {
    let unsub = () => {}
    const init = async () => {
      try {
        // ¿Vino con token en el hash? (link mágico)
        if (typeof window !== 'undefined') {
          const hasToken = window.location.hash.includes('access_token')
          setHashSeen(hasToken)
        }

        const { data } = await supabase.auth.getSession()
        setSession(data.session)

        const sub = supabase.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession)
        })
        unsub = () => sub.data.subscription.unsubscribe()
      } catch (e) {
        setErr(e.message || String(e))
      } finally {
        setLoading(false)
      }
    }
    init()
    return () => unsub()
  }, [])

  // 2) Si ya hay sesión, cargar casos
  useEffect(() => {
    const cargarCasos = async () => {
      if (!session) return
      try {
        const { data, error } = await supabase
          .from('casos')
          .select('*')
          .eq('user_id', session.user.id)

        if (error) throw error
        setCasos(data || [])
      } catch (e) {
        setErr(e.message || String(e))
      }
    }
    cargarCasos()
  }, [session])

  // 3) Reintento corto: a veces el token entra un pelín más tarde
  useEffect(() => {
    if (session || !hashSeen) return
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) setSession(data.session)
    }, 1200)
    return () => clearTimeout(t)
  }, [session, hashSeen])

  if (loading) return <div style={{padding:24}}>Cargando…</div>

  if (!session) {
    return (
      <div style={{padding:24}}>
        <div style={{padding:8, marginBottom:12, background:'#111', color:'#fff', fontSize:12}}>
          Debug: hashConToken={String(hashSeen)}
        </div>
        <h2>No estás autenticada/o</h2>
        <p>Volvé al inicio y pedí el enlace mágico por email.</p>
        <a href="/">Ir al inicio</a>
      </div>
    )
  }

  return (
    <div style={{padding:24}}>
      <div style={{padding:8, marginBottom:12, background:'#111', color:'#fff', fontSize:12}}>
        Debug: usuario={session.user.email}
      </div>

      <h2>Mis casos</h2>
      <p>Sesión activa: <b>{session.user.email}</b></p>

      {err && <p style={{color:'salmon'}}>Error: {err}</p>}

      {casos.length === 0 ? (
        <p>Por ahora no tenés casos cargados.</p>
      ) : (
        <ul>
          {casos.map((c) => (
            <li key={c.id}>
              <b>{c.codigo_de_caso}</b> {c.tipo ? — ${c.tipo} : ''}
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => supabase.auth.signOut()} style={{marginTop:16}}>
        Cerrar sesión
      </button>
    </div>
  )
}