// app/api/documentos/[docId]/download/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 🔧 Ajustá si tu bucket se llama distinto
const BUCKET = 'saki-cases';

// ⚠️ Requiere estas variables en Vercel:
// - NEXT_PUBLIC_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY  (clave de servicio; NO la pública)
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Faltan variables de entorno de Supabase');
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

function isUUIDv4(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { docId: string } },
) {
  try {
    const { docId } = params;

    // ✅ validación temprana
    if (!docId || !isUUIDv4(docId)) {
      return NextResponse.json(
        { ok: false, error: 'Parámetro docId inválido' },
        { status: 400 },
      );
    }

    const supabase = getServerSupabase();

    // 1) Buscar la fila del documento
    const { data: doc, error: dbErr } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', docId)
      .single();

    if (dbErr) {
      return NextResponse.json(
        { ok: false, error: `DB: ${dbErr.message}` },
        { status: 500 },
      );
    }

    if (!doc || !doc.file_url) {
      return NextResponse.json(
        { ok: false, error: 'Documento no encontrado' },
        { status: 404 },
      );
    }

    // 2) Generar URL firmada del archivo en Storage
    //    (expira en 60 segundos; ajustá si querés)
    const expiresIn = 60;
    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.file_url, expiresIn);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json(
        { ok: false, error: 'No se pudo generar URL' },
        { status: 500 },
      );
    }

    const signedUrl = signed.signedUrl;

    // 3) Si viene ?redirect=1 (o true), redirigimos al archivo
    const redirect = req.nextUrl.searchParams.get('redirect');
    if (redirect === '1' || redirect === 'true') {
      // 302: redirección temporal
      return NextResponse.redirect(signedUrl, 302);
    }

    // 4) Respuesta por defecto: JSON con la URL firmada
    return NextResponse.json({ ok: true, url: signedUrl });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error inesperado' },
      { status: 500 },
    );
  }
}
