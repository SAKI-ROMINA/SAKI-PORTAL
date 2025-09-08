import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BUCKET = 'saki-cases' // ← verifica que el nombre sea EXACTO

export async function GET(_: Request, { params }: { params: { docId: string } }) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      return NextResponse.json(
        { ok: false, step: 'env', error: 'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }

    const supabase = createClient(url, serviceKey)

    // 1) Traer el doc
    const { data: row, error: fetchErr } = await supabase
      .from('documents')
      .select('id, file_url')
      .eq('id', params.docId)
      .maybeSingle()

    if (fetchErr) {
      return NextResponse.json({ ok: false, step: 'fetch', error: fetchErr.message }, { status: 500 })
    }
    if (!row) {
      return NextResponse.json({ ok: false, step: 'fetch', error: 'Documento no encontrado' }, { status: 404 })
    }

    const filePath = row.file_url // ej: users/<uid>/casos/<case_id>/InformeDominioAA804HC.pdf

    // 2) Firmar
    const { data: signed, error: signErr } = await supabase
      .storage
      .from(BUCKET)
      .createSignedUrl(filePath, 60 * 60)

    if (signErr) {
      return NextResponse.json(
        { ok: false, step: 'sign', bucket: BUCKET, filePath, error: signErr.message },
        { status: 500 }
      )
    }

    if (!signed?.signedUrl) {
      return NextResponse.json(
        { ok: false, step: 'sign', bucket: BUCKET, filePath, error: 'createSignedUrl no devolvió signedUrl' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, docId: row.id, url: signed.signedUrl })
  } catch (e: any) {
    return NextResponse.json({ ok: false, step: 'catch', error: e?.message ?? 'Error inesperado' }, { status: 500 })
  }
}
