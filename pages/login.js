// pages/login.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://saki-portal.vercel.app/dashboard',
      },
    })

    if (error) {
      setMessage(❌ Error: ${error.message})
    } else {
      setMessage('📩 Revisa tu correo para ingresar con el enlace mágico')
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.5rem', marginRight: '0.5rem' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Ingresar'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
