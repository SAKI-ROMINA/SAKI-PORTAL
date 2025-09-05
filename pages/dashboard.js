import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [casos, setCasos] = useState([])
  const [email, setEmail] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      // 1) obtener usuario logueado
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }
      setEmail(session.user.email)

      // 2) buscar casos del usuario
      // OJO: en tu tabla la columna se llama EXACTO:  ID de usuario
      const { data, error } = await supabase
        .from('casos')
        .select('*')
        .eq('ID de usuario', session.user.id)   // 👈 ¡este nombre tal cual!

      if (error) {
        console.error(error)
        alert('No pudimos cargar tus casos')
      } else {
        setCasos(data || [])
      }
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) {
    return (
      <Layout>
        <p>Cargando…</p>
      </Layout>
    )
  }

  // si no está logueado
  if (!email) {
    return (
      <Layout>
        <h2>No estás autenticado</h2>
        <p>Volvé al inicio y pedí el enlace mágico por email.</p>
        <a href="/">Ir al inicio</a>
      </Layout>
    )
  }

  // listado de casos
  return (
    <Layout>
      <h2>Mis casos</h2>
      {casos.length === 0 ? (
        <p>Por ahora no tenés casos cargados.</p>
      ) : (
        <table width="100%" cellPadding="10" style={{borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid #223', textAlign:'left'}}>
              <th>Código</th>
              <th>Tipo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {casos.map(caso => (
              <tr key={caso.identificación} style={{borderBottom:'1px solid #223'}}>
                <td>{caso['código de caso']}</td>
                <td>{caso.tipo}</td>
                <td>{caso.estado || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  )
}