import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // usamos la service key para firmar
)

const BUCKET = 'saki-cases'

export async function GET(req: Request, { params }: { params: { docId: string } }) {
  const { docId } = params

  // 1) Buscar documento en la tabla
  const { data: doc, error } = await supabase
    .from('documents')
    .select('file_url')
    .eq('id', docId)
    .single()

  if (error || !doc) {
    return NextResponse.json({ ok: false, error: 'Documento no encontrado' }, { status: 404 })
  }

  // 2) Firmar URL (ej: 60 segundos)
  const { data: signed, error: signErr } = await supabase
    .storage
    .from(BUCKET)
    .createSignedUrl(doc.file_url, 60)

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ ok: false, error: 'No se pudo firmar la URL' }, { status: 500 })
  }

  // 3) Redirigir directamente al archivo
  return NextResponse.redirect(signed.signedUrl, { status: 302 })
}
