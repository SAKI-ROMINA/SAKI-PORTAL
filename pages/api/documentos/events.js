// pages/api/documents/events.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { documentId, action, actorId } = req.body || {};
  if (!documentId || !action) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase
      .from("document_events")
      .insert([{ document_id: documentId, action, actor_id: actorId || null }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Error interno" });
  }
}
