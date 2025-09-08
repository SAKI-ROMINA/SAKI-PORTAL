// app/api/casos/[caseId]/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;
    if (!caseId) {
      return NextResponse.json({ ok: false, error: 'caseId requerido' }, { status: 400 });
    }

    const supabase = getServerSupabase();

    const { data, error } = await supabase
      .from('documents')
      .select('id, kind, created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Error' }, { status: 500 });
  }
}
