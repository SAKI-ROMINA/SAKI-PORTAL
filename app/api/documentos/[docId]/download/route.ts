// app/api/documentos/[docId]/download/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'          // fuerza Node.js, no Edge
export const dynamic = 'force-dynamic'   // evita prerender en build

export async function GET(
  _req: Request,
  { params }: { params: { docId: string } }
) {
  const { docId } = params
  if (!docId) {
    return NextResponse.json({ ok: false, error: 'docId requerido' }, { status: 400 })
  }

  // ⚠️ Crear el cliente DENTRO del handler, no en top-level
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // server-side, con permisos para firmar URLs
  )

  // 1) Buscar el documento en la tabla
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('file_url')
    .eq('id', docId)
    .single()

  if (docErr || !doc) {
    return NextResponse.json(
      { ok: false, error: docErr?.message || 'Documento no encontrado' },
      { status: 404 }
    )
  }

  // 2) Firmar la URL del archivo en Storage
  const { data: signed, error: signErr } = await supabase
    .storage
    .from('saki-cases')
    .createSignedUrl(doc.file_url, 60) // URL válida por 60 segundos

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json(
      { ok: false, error: signErr?.message || 'No se pudo firmar la URL' },
      { status: 500 }
    )
  }

  // 3) Redirigir al recurso firmado
  return NextResponse.redirect(signed.signedUrl)
}
