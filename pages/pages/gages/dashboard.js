// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))
  }, [])

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Verificando sesión…</h1>
        <p>Si abriste el enlace del email, en segundos te mostramos tu panel.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>¡Hola!</h1>
      <p>Sesión iniciada como <b>{user.email}</b></p>
      <p>Desde acá vamos a mostrar tus casos y permitir subir documentos.</p>
    </div>
  )
}
