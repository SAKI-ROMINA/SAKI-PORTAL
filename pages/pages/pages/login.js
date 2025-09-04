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
        emailRedirectTo: 'https://saki-portal.vercel.app/dashboard', // adónde vuelve luego de loguear
      },
    })
    setSending(false)
    if (error) setErr(error.message)
    else setMsg('Listo ✅ Revisa tu correo y toca el enlace para ingresar.')
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.logo}>SAKI</div>
          <div style={styles.subtitle}>Portal de clientes</div>
        </div>

        <h1 style={styles.title}>Ingresar</h1>
        <p style={styles.text}>
          Te enviaremos un <b>Magic Link</b> a tu correo. Funciona perfecto también desde el celular.
        </p>

        <form onSubmit={handleMagicLink} style={styles.form}>
          <input
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <button disabled={sending} type="submit" style={styles.button}>
            {sending ? 'Enviando…' : 'Recibir enlace'}
          </button>
        </form>

        {msg && <div style={styles.ok}>{msg}</div>}
        {err && <div style={styles.err}>⚠️ {err}</div>}

        <div style={styles.footerNote}>
          ¿Problemas? Escribinos y te asistimos.
        </div>
      </div>
    </div>
  )
}

const styles = {
  bg: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(180deg,#0e1217 0%, #121826 100%)',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'white',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
  },
  brand: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 },
  logo: {
    fontWeight: 800,
    letterSpacing: 1,
    fontSize: 22,
  },
  subtitle: { color: '#667085', fontSize: 14 },
  title: { margin: '8px 0 4px', fontSize: 22 },
  text: { color: '#475467', marginBottom: 16, lineHeight: 1.4 },
  form: { display: 'grid', gap: 12 },
  input: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #E4E7EC',
    outline: 'none',
    fontSize: 16,
  },
  button: {
    padding: '12px 14px',
    borderRadius: 10,
    border: 'none',
    background: '#111827',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
  },
  ok: {
    marginTop: 12,
    padding: '10px 12px',
    borderRadius: 10,
    background: '#ECFDF3',
    color: '#027A48',
    fontSize: 14,
  },
  err: {
    marginTop: 12,
    padding: '10px 12px',
    borderRadius: 10,
    background: '#FEF3F2',
    color: '#B42318',
    fontSize: 14,
  },
  footerNote: { marginTop: 16, color: '#667085', fontSize: 13, textAlign: 'center' },
}
