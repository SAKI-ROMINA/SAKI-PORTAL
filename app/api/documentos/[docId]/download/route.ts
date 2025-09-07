import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'saki-cases'  // el bucket que ya creaste

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request, { params }: { params: { docId: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: 'Faltan env vars' }, { status: 500 })
  }

  // Cliente autenticado (con cookies)
  const cookieStore = cookies()
  const supaSSR = createServerClient(url, anon, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => cookieStore.set(name, value, options),
      remove: (name, options) => cookieStore.set(name, '', { ...options, maxAge: 0 })
    }
  })

  // Buscar documento en la DB
  const { data: doc, error } = await supaSSR
    .from('documents')
    .select('file_url')
    .eq('id', params.docId)
    .single()

  if (error || !doc) {
    return NextResponse.json({ ok: false, error: 'Documento no encontrado' }, { status: 404 })
  }

  // Cliente directo a Storage
  const supa = createClient(url, anon)
  const { data: signed, error: signedErr } = await supa
    .storage
    .from(BUCKET)
    .createSignedUrl(doc.file_url, 60) // válido 60s

  if (signedErr) {
    return NextResponse.json({ ok: false, error: signedErr.message }, { status: 500 })
  }

  // Responder con URL firmada
  return NextResponse.json({ ok: true, url: signed.signedUrl })
}
