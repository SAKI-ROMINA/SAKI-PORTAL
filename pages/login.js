// pages/login.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [ok, setOk] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // SIN backticks
        emailRedirectTo: window.location.origin + '/dashboard'
      }
    })

    setLoading(false)
    if (error) setError(error.message)
    else setOk(true)
  }

  if (ok) {
    return (
      <div style={{ padding: 24 }}>
        <h1>📬 Revisá tu correo</h1>
        <p>Te enviamos un link para entrar al portal.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 420, margin: '24px auto' }}>
      <h1>Portal SAKI</h1>
      <p>Ingresá tu email para recibir el enlace mágico.</p>

      <form onSubmit={enviar}>
        <input
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 12, marginBottom: 12 }}
        />
        <button disabled={loading} style={{ width: '100%', padding: 12 }}>
          {loading ? 'Enviando…' : 'Enviar link'}
        </button>
      </form>

      {error && (
        <p style={{ color: 'salmon', marginTop: 12 }}>{error}</p>
      )}
    </div>
  )
}