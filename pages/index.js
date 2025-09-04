import { supabase } from '../lib/supabaseClient'

export default function Home() {
  async function testConnection() {
    const { data, error } = await supabase.from('perfiles').select('*')
    if (error) {
      console.error('Error al conectar:', error.message)
    } else {
      console.log('Datos recibidos:', data)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Portal SAKI</h1>
      <p>Si ves esta página, la app está funcionando ✅</p>
      <button onClick={testConnection}>Probar conexión con Supabase</button>
    </div>
  )
}
