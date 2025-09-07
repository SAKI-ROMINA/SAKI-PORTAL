// app/api/documentos/[docId]/download/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'saki-cases' // <-- confirmá el bucket exacto en Supabase Storage

export async function GET(
  _req: Request,
  { params }: { params: { docId: string } }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: 'Config faltante' }, { status: 500 })
  }

  // 1) Sesión
  const cookieStore = cookies()
  const supaSSR = createServerClient(url, anon, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, opts) => cookieStore.set({ name, value, ...opts }),
      remove: (name, opts) => cookieStore.set({ name, value: '', ...opts, maxAge: 0 })
    }
  })

  const { data: auth } = await supaSSR.auth.getUser()
  const user = auth?.user
  if (!user) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 })

  // 2) Buscar documento + caso asociado
  const { data: doc, error: docErr } = await supaSSR
    .from('documents')
    .select(`
      id,
      file_url,
      case:cases!inner (
        id,
        user_id
      )
    `)
    .eq('id', params.docId)
    .single()

  if (docErr) return NextResponse.json({ ok: false, error: docErr.message }, { status: 500 })
  if (!doc) return NextResponse.json({ ok: false, error: 'Documento no encontrado' }, { status: 404 })

  // 3) Autorizar que el caso sea del usuario logueado
  if (doc.case.user_id !== user.id) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 })
  }

  // 4) Firmar URL de descarga (60s)
  const supabase = createClient(url, anon)
  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.file_url, 60, {
      download: doc.file_url.split('/').pop()
    })

  if (signErr) return NextResponse.json({ ok: false, error: signErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, url: signed.signedUrl, expiresIn: 60 })
}
