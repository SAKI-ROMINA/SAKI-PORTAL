// app/api/documentos/[docId]/download/route.ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  _req: Request,
  { params }: { params: { docId: string } }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: 'Faltan variables de Supabase (URL/KEY)' },
      { status: 500 }
    )
  }

  const supabase = createClient(url, key)

  try {
    // TODO: reemplazar por tu lógica real (ej: generar signed URL del archivo)
    return NextResponse.json({ ok: true, docId: params.docId })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
