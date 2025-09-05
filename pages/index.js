import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export default function Home() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const sendLink = async (e) => {
    e.preventDefault();
    setMessage('Enviando enlace...');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/dashboard' : undefined }
    });
    setMessage(error ? ('Error: ' + error.message) : 'Listo. Revisa tu correo.');
  };

  return (
    <Layout>
      <h2>Portal de clientes SAKI</h2>
      <p>Ingresá con tu email para recibir un enlace mágico.</p>
      <form onSubmit={sendLink} style={{display:'flex',gap:8}}>
        <input type="email" placeholder="tu@correo.com" value={email} onChange={e=>setEmail(e.target.value)} required style={{flex:1,padding:10}} />
        <button type="submit" style={{padding:'10px 16px'}}>Recibir enlace</button>
      </form>
      {message && <p>{message}</p>}
    </Layout>
  );
}
