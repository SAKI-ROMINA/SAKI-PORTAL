import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [casos, setCasos] = useState([])
  const [email, setEmail] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }
      setEmail(session.user.email)

      const { data, error } = await supabase
        .from('casos')
        .select('*')
        .eq('ID de usuario', session.user.id)

      if (!error) setCasos(data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return <p style={{padding:24}}>Cargando…</p>

  if (!email) {
    return (
      <div style={{padding:24}}>
        <h2>No estás autenticado</h2>
        <p>Volvé al inicio y pedí el enlace mágico por email.</p>
        <a href="/">Ir al inicio</a>
      </div>
    )
  }

  return (
    <div style={{padding:24}}>
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
    </div>
  )
}