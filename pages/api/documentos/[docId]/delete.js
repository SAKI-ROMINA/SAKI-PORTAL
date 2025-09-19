// pages/api/documentos/[docId]/delete.js
import { createClient } from "@supabase/supabase-js";

const BUCKET = "saki-cases";

function pathFromPublicUrl(fileUrl) {
  const m = /\/storage\/v1\/object\/public\/[^/]+\/(.+)$/.exec(fileUrl || "");
  return m ? m[1] : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { docId } = req.query;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: doc, error: gErr } = await supabase
      .from("documents")
      .select("id, file_url")
      .eq("id", docId)
      .single();
    if (gErr) throw gErr;
    if (!doc) return res.status(404).json({ ok: false, error: "Documento no existe" });

    const path = pathFromPublicUrl(doc.file_url);
    if (path) {
      const { error: rErr } = await supabase.storage.from(BUCKET).remove([path]);
      if (rErr) throw rErr;
    }

    const { error: dErr } = await supabase.from("documents").delete().eq("id", docId);
    if (dErr) throw dErr;

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
