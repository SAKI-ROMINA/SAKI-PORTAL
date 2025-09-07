// app/api/documentos/[docId]/download/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'saki-cases' // <-- tu bucket

export async function GET(
  _req: Request,
  { params }: { params: { docId: string } }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: 'Faltan variables de entorno' }, { status: 500 })
  }

  const supabase = createClient(url, anon)

  // 1) Buscar file_url del documento
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('file_url')
    .eq('id', params.docId)
    .single()

  if (docErr || !doc) {
    return NextResponse.json({ ok: false, error: 'Documento no encontrado' }, { status: 404 })
  }

  // 2) Crear URL firmada en Storage (60 segundos)
  const { data: signed, error: signErr } = await supabase
    .storage
    .from(BUCKET)
    .createSignedUrl(doc.file_url, 60, {
      download: doc.file_url.split('/').pop()
    })

  if (signErr || !signed) {
    return NextResponse.json({ ok: false, error: signErr?.message ?? 'No se pudo firmar la URL' }, { status: 500 })
  }

  // 3) Devolver URL firmada
  return NextResponse.json({ ok: true, url: signed.signedUrl, expiresIn: 60 })
}
