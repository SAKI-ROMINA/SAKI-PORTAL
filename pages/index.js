import { useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error al obtener la sesión:', error.message);
          router.replace('/login');
          return;
        }

        if (data?.session) {
          router.replace('/dashboard'); // si está logueado
        } else {
          router.replace('/login'); // si no está logueado
        }
      } catch (err) {
        console.error('Error inesperado:', err);
        router.replace('/login');
      }
    };

    checkSession();
  }, [router]);

  return <p>Cargando...</p>;
}
