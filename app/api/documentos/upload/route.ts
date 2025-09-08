// app/api/documentos/upload/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'saki-cases';

// Cliente admin solo en el servidor (usa la SERVICE_ROLE_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANTE: no exponer esto en el cliente
);

export async function POST(req: Request) {
  try {
    // 1) Leer form-data
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const caseId = String(form.get('case_id') || '').trim();
    const userId = String(form.get('user_id') || '').trim();
    const kind   = String(form.get('kind')   || '').trim();

    if (!file || !caseId || !userId || !kind) {
      return NextResponse.json(
        { ok: false, error: 'Faltan campos: file, case_id, user_id, kind' },
        { status: 400 }
      );
    }

    // 2) Armar ruta dentro del bucket
    const path = `users/${userId}/casos/${caseId}/${file.name}`;

    // 3) Subir archivo a Storage
    const buffer = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false, // no sobreescribir si existe
      });

    if (upErr) {
      return NextResponse.json(
        { ok: false, error: `Upload: ${upErr.message}` },
        { status: 500 }
      );
    }

    // 4) Insertar fila en documents
    const { data: row, error: insErr } = await supabase
      .from('documents')
      .insert({
        id: crypto.randomUUID(),
        case_id: caseId,
        kind,
        file_url: path,
      })
      .select('id')
      .single();

    if (insErr) {
      return NextResponse.json(
        { ok: false, error: `Insert: ${insErr.message}` },
        { status: 500 }
      );
    }

    // 5) Crear URL firmada (10 minutos)
    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 10);

    if (signErr) {
      // El archivo quedó subido e insertado, pero no se pudo firmar la URL
      return NextResponse.json({
        ok: true,
        docId: row.id,
        url: null,
        warning: 'Documento subido, pero no pude generar URL firmada',
      });
    }

    // 6) OK
    return NextResponse.json({
      ok: true,
      docId: row.id,
      url: signed.signedUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Error inesperado' },
      { status: 500 }
    );
  }
}
