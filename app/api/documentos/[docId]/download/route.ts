// app/api/documentos/[docId]/download/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'saki-cases' // ⚠️ confirmame que este es el bucket real

export async function GET(
  _req: Request,
  { params }: { params: { docId: string } }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: 'Config faltante' }, { status: 500 })
  }

  // 1. Autenticación
  const cookieStore = cookies()
  const supaSSR = createServerClient(url, anon, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => cookieStore.set({ name, value, ...options }),
      remove: (name, options) => cookieStore.set({ name, value: '', ...options, maxAge: 0 })
    }
  })
  const { data: auth } = await supaSSR.auth.getUser()
  const user = auth?.user
  if (!user) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 })

  // 2. Buscar documento
  const { data: doc, error: docErr } = await supaSSR
    .from('documents')
    .select('id, case_id, file_url')
    .eq('id', params.docId)
    .single()

  if (docErr) return NextResponse.json({ ok: false, error: docErr.message }, { status: 500 })
  if (!doc) return NextResponse.json({ ok: false, error: 'Documento no encontrado' }, { status: 404 })

  // ⚠️ TODO: Falta validar que el case_id del doc realmente pertenece al usuario logueado
  // Esto depende de cómo relaciones cases/profiles con el user.id

  // 3. Generar signed URL desde file_url
  const supabase = createClient(url, anon)
  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.file_url, 60, { download: doc.file_url.split('/').pop() })

  if (signErr) return NextResponse.json({ ok: false, error: signErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, url: signed.signedUrl, expiresIn: 60 })
}
