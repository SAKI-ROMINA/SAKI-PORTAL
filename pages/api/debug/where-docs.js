import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Falta ?id=<UUID>" });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1) Traer case_code (por si hay carpetas con el código)
    let caseCode = null;
    const { data: caseRow } = await supabase
      .from("cases")
      .select("case_code")
      .eq("id", id)
      .single();
    if (caseRow?.case_code) caseCode = caseRow.case_code;

    // 2) Listar todos los buckets
    const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
    if (bucketsErr) return res.status(500).json({ error: bucketsErr.message });

    const prefixes = [ `${id}/`, id, caseCode ? `${caseCode}/` : null, caseCode ].filter(Boolean);
    const findings = [];

    // 3) Buscar archivos en cada bucket y prefijo
    for (const b of buckets) {
      for (const p of prefixes) {
        const { data: list, error: listErr } = await supabase
          .storage
          .from(b.name)
          .list(p, { limit: 200, sortBy: { column: "name", order: "asc" } });
        if (listErr) continue;
        for (const f of list ?? []) {
          findings.push({ bucket: b.name, prefix: p, name: f.name });
        }
      }
    }

    // 4) Ver si hay filas en la tabla documents para este caso
    const { data: docs, error: docsErr } = await supabase
      .from("documents")
      .select("id, name, bucket, path, case_id")
      .eq("case_id", id);

    return res.status(200).json({
      input: { id, caseCode },
      buckets: buckets.map(b => b.name),
      storage_matches: findings,      // dónde encontró archivos en Storage
      table_documents: docs ?? [],    // filas en la tabla documents (si existen)
      docs_error: docsErr?.message ?? null,
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message ?? String(e) });
  }
}
