// pages/_app.js
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

// pages/docs.js
import Header from '../components/Header'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function Docs() {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login')
      else setOk(true)
    })
  }, [router])

  if (!ok) return null

  return (
    <>
      <Header onLogout={async()=>{await supabase.auth.signOut(); router.replace('/login')}} />
      <div className="container">
        <div className="card">
          <h1 className="h1">Mis documentos</h1>
          <p className="muted">Aquí vas a poder subir y ver tus archivos. Próximamente.</p>
        </div>
      </div>
    </>
  )
}
