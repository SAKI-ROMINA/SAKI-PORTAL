export const runtime = 'nodejs';           // ⬅️ Fuerza Node.js (necesario para usar secrets)
export const dynamic = 'force-dynamic';    // ⬅️ Evita caché del handler

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usa service role en el servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',     // fallback vacío para evitar error de build
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''     // idem arriba
)

export async function GET(
  _req: Request,
  { params }: { params: { docId: string } }
) {
  // 1) Buscar documento
  const { data: doc, error } = await supabase
    .from('documentos')
    .select('storage_path, nombre_archivo')
    .eq('id', params.docId)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
  }

  // 2) Crear signed URL (5 min)
  const { data: signed, error: sErr } = await supabase
    .storage.from('saki-cases')
    .createSignedUrl(doc.storage_path, 300, {
      download: doc.nombre_archivo ?? 'archivo'
    })

  if (sErr || !signed?.signedUrl) {
    return NextResponse.json({ error: 'No se pudo generar el link' }, { status: 400 })
  }

  // 3) Redirigir a la URL firmada
  return NextResponse.redirect(signed.signedUrl, 302)
}
