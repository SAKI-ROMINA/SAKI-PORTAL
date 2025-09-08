export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  _req: Request,
  { params }: { params: { docId: string } }
) {
  const { docId } = params

  // 1) Tomar variables recién dentro del handler
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: 'Faltan variables NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' },
      { status: 500 }
    )
  }

  // 2) Crear el cliente acá adentro (no en el top-level)
  const supabase = createClient(url, serviceKey)

  // 3) Buscar el documento
  const { data: doc, error } = await supabase
    .from('documents')
    .select('file_url')
    .eq('id', docId)
    .single()

  if (error || !doc) {
    return NextResponse.json({ ok: false, error: 'Documento no encontrado' }, { status: 404 })
  }

  // 4) Firmar URL
  const { data: signed, error: signErr } = await supabase
    .storage
    .from('saki-cases')
    .createSignedUrl(doc.file_url, 60)

  if (signErr || !signed) {
    return NextResponse.json({ ok: false, error: 'No se pudo firmar la URL' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, docId, url: signed.signedUrl })
}
