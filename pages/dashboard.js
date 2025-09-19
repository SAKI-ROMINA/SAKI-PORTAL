// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [status, setStatus] = useState('Cargando sesión…');
  const [casos, setCasos] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const boot = async () => {
      try {
        // 1) Chequear que el cliente exista
        if (!supabase || !supabase.auth) {
          setErrorMsg('El cliente de Supabase no está disponible.');
          return;
        }

        // 2) Obtener sesión actual (SDK v2)
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setErrorMsg(`Auth error: ${error.message}`);
          return;
        }

        const session = data?.session;
        if (!session) {
          setStatus('Sin sesión. Redirigiendo a login…');
          router.replace('/login');
          return;
        }

        setStatus(`Sesión iniciada como ${session.user.email}`);

        // 3) Traer casos (ajustá el filtro a tu modelo)
        const { data: rows, error: qErr } = await supabase
          .from('casos')
          .select('*')
          .order('created_at', { ascending: false });

        if (qErr) {
          setErrorMsg(`Error al traer casos: ${qErr.message}`);
          return;
        }

        setCasos(rows || []);
      } catch (e) {
        setErrorMsg(`Error inesperado: ${e?.message || e}`);
      }
    };

    boot();
  }, [router]);

  const salir = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      router.replace('/login');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>SAKI</h1>

      <p><strong>Sesión:</strong></p>
      {errorMsg ? (
        <p style={{ color: '#f55' }}>Error: {errorMsg}</p>
      ) : (
        <p>{status}</p>
      )}

      <h3 style={{ marginTop: 24 }}>Casos</h3>
      {casos.length === 0 ? (
        <p>No hay casos cargados.</p>
      ) : (
        <ul>
          {casos.map((c) => (
            <li key={c.id}>
              {c.id} — {c?.titulo || c?.dominio || 'Sin título'}
            </li>
          ))}
        </ul>
      )}

      <button onClick={salir} style={{ marginTop: 24 }}>Cerrar sesión</button>

      <footer style={{ marginTop: 32, opacity: 0.6 }}>© 2025 SAKI</footer>
    </div>
  );
}
