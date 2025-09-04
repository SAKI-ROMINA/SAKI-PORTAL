// pages/login.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  async function handleMagicLink(e) {
    e.preventDefault()
    setSending(true)
    setMsg(null)
    setErr(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://saki-portal.vercel.app/dashboard',
      },
    })

    if (error) {
      setErr(error.message)
    } else {
      setMsg('📩 Revisa tu correo y haz clic en el enlace para entrar.')
    }
    setSending(false)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', textAlign: 'center' }}>
      <h1>Portal SAKI</h1>
      <p>Ingresa tu correo para recibir un enlace mágico:</p>
      <form onSubmit={handleMagicLink}>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.5rem', width: '250px' }}
        />
        <br /><br />
        <button type="submit" disabled={sending}>
          {sending ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {err && <p style={{ color: 'red' }}>{err}</p>}
    </div>
  )
}
