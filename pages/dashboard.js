// pages/dashboard.js  (solo ASCII)
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [casos, setCasos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(function () {
    async function cargar() {
      try {
        // sesion
        const { data, error: sErr } = await supabase.auth.getSession();
        if (sErr) throw sErr;
        const sess = data && data.session ? data.session : null;
        setSession(sess);
        if (!sess) {
          setLoading(false);
          return;
        }
        // datos
        const { data: rows, error: qErr } = await supabase
          .from('casos')
          .select('*')
          .eq('user_id', sess.user.id);

        if (qErr) throw qErr;
        setCasos(Array.isArray(rows) ? rows : []);
        setLoading(false);
      } catch (e) {
        setError(e.message || 'Error desconocido');
        setLoading(false);
      }
    }

    cargar();

    // listener auth (opcional)
    const { data: sub } = supabase.auth.onAuthStateChange(function () {
      cargar();
    });
    return function () {
      if (sub && sub.subscription) sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;

  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No estas autenticada/o</h2>
        <p>Volvé al login y pedí el enlace magico por email.</p>
        <a href="/login">Ir al login</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis casos</h2>
      <p>Sesion: <b>{session.user.email}</b></p>

      {error ? <p style={{ color: 'salmon' }}>Error: {error}</p> : null}

      {casos.length === 0 ? (
        <p>No hay casos cargados.</p>
      ) : (
        <ul>
          {casos.map(function (c) {
            return (
              <li key={c.id}>
                <b>{String(c.codigo_de_caso || '')}</b>{' '}
                {c.tipo ? ' - ' + String(c.tipo) : ''}
              </li>
            );
          })}
        </ul>
      )}

      <button
        onClick={async function () { await supabase.auth.signOut(); }}
        style={{ marginTop: 12 }}
      >
        Cerrar sesion
      </button>
    </div>
  );
}