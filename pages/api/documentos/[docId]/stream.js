// pages/api/documentos/[docId]/stream.js
import { createClient } from "@supabase/supabase-js";

const BUCKET = "saki-cases";

function pathFromPublicUrl(fileUrl) {
  const m = /\/storage\/v1\/object\/public\/[^/]+\/(.+)$/.exec(fileUrl || "");
  return m ? m[1] : null;
}

function guessContentType(path = "") {
  const p = path.toLowerCase();
  if (p.endsWith(".pdf")) return "application/pdf";
  if (p.endsWith(".png")) return "image/png";
  if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
  if (p.endsWith(".gif")) return "image/gif";
  if (p.endsWith(".webp")) return "image/webp";
  if (p.endsWith(".svg")) return "image/svg+xml";
  if (p.endsWith(".bmp")) return "image/bmp";
  return "application/octet-stream";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
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
    if (!doc?.file_url) return res.status(404).json({ ok: false, error: "file_url vacío" });

    const path = pathFromPublicUrl(doc.file_url);
    if (!path) return res.status(400).json({ ok: false, error: "No se pudo derivar el path" });

    const { data, error: dErr } = await supabase.storage.from(BUCKET).download(path);
    if (dErr) throw dErr;

    const arrBuf = await data.arrayBuffer();
    const buf = Buffer.from(arrBuf);

    res.setHeader("Content-Type", guessContentType(path));
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buf);
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: e?.message || "Error al streamear el archivo" });
  }
}
