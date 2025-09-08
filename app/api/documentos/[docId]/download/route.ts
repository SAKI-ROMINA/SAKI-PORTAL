// app/api/documentos/[docId]/download/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'saki-cases';

// Cliente admin en el servidor para firmar URLs y leer DB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Ctx = { params: { docId: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const docId = (params?.docId || '').trim();
    if (!docId) {
      return NextResponse.json(
        { ok: false, error: 'docId requerido' },
        { status: 400 }
      );
    }

    // 1) Buscar el documento en la tabla
    const { data: doc, error: dbErr } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', docId)
      .maybeSingle();

    if (dbErr) {
      return NextResponse.json(
        { ok: false, error: `DB: ${dbErr.message}` },
        { status: 500 }
      );
    }
    if (!doc || !doc.file_url) {
      return NextResponse.json(
        { ok: false, error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    const filePath = doc.file_url; // p.ej: users/<user_id>/casos/<case_id>/archivo.pdf

    // 2) Firmar URL por 10 minutos
    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 60 * 10);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json(
        { ok: false, error: 'No se pudo generar URL' },
        { status: 500 }
      );
    }

    // 3) Devolver la URL firmada
    return NextResponse.json({
      ok: true,
      url: signed.signedUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Error inesperado' },
      { status: 500 }
    );
  }

  // ... luego de obtener `signedUrl` exitosamente:
const { searchParams } = new URL(req.url);
const redirect = searchParams.get('redirect');

if (redirect === '1') {
  // Abre/descarga directo
  return NextResponse.redirect(signedUrl);
}

// Comportamiento actual: devuelve JSON
return NextResponse.json({ ok: true, url: signedUrl });
}
