// pages/index.js
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [msg, setMsg] = useState('Si ves esta página, la app está funcionando ✅');
  const [raw, setRaw] = useState('');

  const probar = async () => {
    setMsg('Probando conexión con Supabase…');

    // 1) Prueba simple: ¿la URL y la KEY existen?
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setMsg('⚠️ Faltan variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.');
      return;
    }

    // 2) Intento 1: leer 5 perfiles (si la tabla existe)
    const { data, error } = await supabase.from('profiles').select('*').limit(5);

    if (error) {
      // 3) Si falla (por ej. la tabla no existe), muestro el error
      setMsg('❌ Error consultando "profiles": ' + error.message);
      setRaw('');
      return;
    }

    if (!data || data.length === 0) {
      setMsg('✅ Conectó, pero la tabla "profiles" está vacía.');
      setRaw('[]');
      return;
    }

    setMsg('✅ Conectó y devolvió datos de "profiles".');
    setRaw(JSON.stringify(data, null, 2));
  };

  return (
    <main style={{maxWidth: 680, margin: '4rem auto', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, sans-serif'}}>
      <h1>Portal SAKI</h1>
      <p>{msg}</p>
      <button onClick={probar} style={{padding:'10px 16px', borderRadius:8, border:'1px solid #ddd', cursor:'pointer'}}>
        Probar conexión con Supabase
      </button>
      {raw && (
        <pre style={{marginTop:16, background:'#111827', color:'#e5e7eb', padding:12, borderRadius:8, overflowX:'auto'}}>
{raw}
        </pre>
      )}
    </main>
  );
}
