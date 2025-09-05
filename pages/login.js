// pages/login.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Head from 'next/head'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://saki-portal.vercel.app/dashboard',
      },
    })

    if (error) {
      setMsg(`❌ Error: ${error.message}`)
    } else {
      setMsg('📮 Revisá tu correo para ingresar con el enlace mágico.')
    }
    setLoading(false)
  }

  return (
    <>
      <Head><title>Iniciar sesión • SAKI</title></Head>
      <div className="center-screen">
        <div className="card">
          <h1>Iniciar sesión</h1>
          <p className="sub">Te enviaremos un enlace mágico a tu correo.</p>

          <form onSubmit={handleLogin}>
            <input
              className="input"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div style={{ height: 12 }} />
            <button className="btn" disabled={loading}>
              {loading ? 'Enviando…' : 'Ingresar'}
            </button>
          </form>

          {msg && <div className="msg">{msg}</div>}
        </div>
      </div>
    </>
  )
}
