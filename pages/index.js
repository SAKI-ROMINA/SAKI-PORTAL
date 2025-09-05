import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/dashboard')  // si está logueado → va al dashboard
      } else {
        router.replace('/login')      // si no está logueado → va al login
      }
    })
  }, [router])

  return null
}