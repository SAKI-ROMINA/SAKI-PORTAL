import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    return NextResponse.json(
      { ok: false, error: 'Faltan variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY' },
      { status: 500 }
    )
  }

  const supabase = createClient(url, anon)
  const { error } = await supabase
    .from('perfiles')
    .select('id', { head: true, count: 'exact' })

  if (error) {
    return NextResponse.json({ ok: false, step: 'query', error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
