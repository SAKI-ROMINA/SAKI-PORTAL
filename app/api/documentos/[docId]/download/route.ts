import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Versión simple para que funcione ya
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // solo en server
)

export async function GET(
  _req: Request,
  { params }: { params: { docId: string } }
) {
  // 1) Buscar el documento en la tabla
  const { data: doc, error } = await supabase
    .from('documentos')
    .select('storage_path, nombre_archivo')
    .eq('id', params.docId)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
  }

  // 2) Crear signed URL que dura 5 min
  const { data: signed, error: sErr } = await supabase
    .storage.from('saki-cases')
    .createSignedUrl(doc.storage_path, 300, {
      download: doc.nombre_archivo ?? 'archivo'
    })

  if (sErr || !signed?.signedUrl) {
    return NextResponse.json({ error: 'No se pudo generar el link' }, { status: 400 })
  }

  // 3) Redirigir directo a la URL firmada
  return NextResponse.redirect(signed.signedUrl, 302)
}
