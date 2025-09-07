// app/api/documentos/[docId]/download/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: Request,
  { params }: { params: { docId: string } }
) {
  const { docId } = params

  // Buscar el documento en la tabla documents
  const { data: doc, error } = await supabase
    .from('documents')
    .select('file_url')
    .eq('id', docId)
    .single()

  if (error || !doc) {
    return NextResponse.json({ ok: false, error: 'Documento no encontrado' }, { status: 404 })
  }

  // Firmar la URL para descarga segura
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('saki-cases')
    .createSignedUrl(doc.file_url, 60) // 60 segundos

  if (signedUrlError || !signedUrlData) {
    return NextResponse.json({ ok: false, error: 'No se pudo generar URL' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, docId, url: signedUrlData.signedUrl })
}

