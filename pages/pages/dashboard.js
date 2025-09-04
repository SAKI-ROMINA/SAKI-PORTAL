import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <Layout>
        <h2>No estás autenticado</h2>
        <p>Volvé al inicio y solicitá el enlace por email.</p>
        <a href="/">Ir al inicio</a>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2>Bienvenida/o</h2>
      <p>Sesión activa para: <b>{session.user.email}</b></p>
      <p>Desde aquí después listaremos tus casos y documentos.</p>
      <button onClick={()=>supabase.auth.signOut()}>Cerrar sesión</button>
    </Layout>
  );
}
