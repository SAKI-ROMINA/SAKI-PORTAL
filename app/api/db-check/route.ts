// app/api/db-check/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      // Te dice exactamente qué falta
      return NextResponse.json(
        { ok: false, error: 'Missing env vars', haveUrl: !!url, haveAnon: !!anon },
        { status: 500 }
      );
    }

    // Chequeo simple contra una tabla que exista (usa la que tengas: profiles, casos, etc.)
    const supabase = createClient(url, anon);
    const { error } = await supabase
      .from('profiles') // cambia por una tabla que esté en tu base
      .select('id', { head: true, count: 'exact' });

    if (error) {
      return NextResponse.json(
        { ok: false, step: 'query', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Unexpected error' },
      { status: 500 }
    );
  }
}
