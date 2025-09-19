// pages/api/profile/index.js
import { createClient } from "@supabase/supabase-js";

// Cliente con la ANON KEY (RLS aplica)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  try {
    // 1) Tomar token del header
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Falta token (Authorization: Bearer ...)" });
    }

    // 2) Resolver usuario desde el token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: userError?.message || "Token inválido o expirado" });
    }

    const userId = user.id;
    if (!userId) {
      return res.status(401).json({ error: "No se pudo resolver el ID del usuario" });
    }

    // 3) Traer perfil; usamos maybeSingle() para evitar el error de “coerce to single”
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, name, full_name, phone, dni, role, created_at")
      .eq("id", userId)
      .maybeSingle(); // devuelve 1 fila o null sin romper

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!profile) {
      // No hay fila para ese usuario
      return res.status(404).json({ error: "Profile not found para este usuario" });
    }

    return res.status(200).json({ ok: true, profile });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}
