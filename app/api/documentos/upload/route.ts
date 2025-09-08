// app/api/documentos/upload/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ⚡ Variables de entorno
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // para poder escribir en Storage
)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // 1) Leer el form-data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const caseId = formData.get('caseId') as string
    const kind = formData.get('kind') as string
    const userId = formData.get('userId') as string

    if (!file || !caseId || !kind || !userId) {
      return NextResponse.json(
        { ok: false, error: 'Faltan parámetros (file, caseId, kind, userId)' },
        { status: 400 }
      )
    }

    // 2) Generar path en el bucket
    const ext = file.name.split('.').pop()
    const filePath = `users/${userId}/casos/${caseId}/${Date.now()}.${ext}`

    // 3) Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('saki-cases')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { ok: false, error: `upload: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // 4) Insertar registro en la tabla documents
    const { error: dbError } = await supabase.from('documents').insert({
      case_id: caseId,
      kind,
      file_url: filePath,
      uploaded_by: userId,
    })

    if (dbError) {
      return NextResponse.json(
        { ok: false, error: `db: ${dbError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, path: filePath })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}

