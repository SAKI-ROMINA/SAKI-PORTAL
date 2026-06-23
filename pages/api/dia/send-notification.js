import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const MAIL_ADMIN_SAKI = "rominamazzeo@gmail.com";

const SECTORES_AUTORIZADOS_DIA = [
  "creditos y cobranzas",
  "cobranzas y creditos",
  "c c",
  "c y c",
  "administracion franquicias",
  "adm franquicias",
  "adm frq",
  "administracion frq",
  "administracion de franquicias",
  "administracion franquicia",
  "franquicias",
  "asuntos juridicos",
];

function normalizarTexto(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function separarEmails(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => separarEmails(item));
  }

  return String(value || "")
    .split(/[;,\n\s]+/)
    .map((email) => normalizarEmail(email))
    .filter((email) => email && email.includes("@"));
}

function emailsUnicos(values) {
  return Array.from(new Set(values.flatMap((value) => separarEmails(value))));
}

function sectorAutorizado(sector) {
  const sectorNormalizado = normalizarTexto(sector);

  return SECTORES_AUTORIZADOS_DIA.some((permitido) =>
    sectorNormalizado.includes(permitido)
  );
}

function perfilPuedeEnviarDia(profile) {
  const role = normalizarTexto(profile?.role);

  if (role === "admin") return true;

  return role === "member" && sectorAutorizado(profile?.sector);
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) return null;

  return authHeader.slice("Bearer ".length).trim();
}

function crearSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase para validar la sesión.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function obtenerCopiasAsociadas({ supabaseAdmin, requestId }) {
  if (!requestId) return [];

  const copias = [];

  const { data: informe } = await supabaseAdmin
    .from("dia_requests")
    .select("cc_email, cc_emails, emails_copia, mail_copia")
    .eq("id", requestId)
    .maybeSingle();

  if (informe) {
    copias.push(
      informe.cc_email,
      informe.cc_emails,
      informe.emails_copia,
      informe.mail_copia
    );
  }

  const { data: prenda } = await supabaseAdmin
    .from("dia_request_prendas")
    .select("cc_email")
    .eq("id", requestId)
    .maybeSingle();

  if (prenda) {
    copias.push(prenda.cc_email);
  }

  return emailsUnicos(copias);
}

async function obtenerDestinatariosPermitidos({ supabaseAdmin, requestId }) {
  const principales = new Set([normalizarEmail(MAIL_ADMIN_SAKI)]);
  const copiasExternas = new Set();

  const { data: perfiles, error: perfilesError } = await supabaseAdmin
    .from("profiles")
    .select("email, role, sector");

  if (perfilesError) throw perfilesError;

  (perfiles || []).forEach((perfil) => {
    if (perfilPuedeEnviarDia(perfil)) {
      separarEmails(perfil?.email).forEach((email) => principales.add(email));
    }
  });

  const copiasAsociadas = await obtenerCopiasAsociadas({
    supabaseAdmin,
    requestId,
  });

  copiasAsociadas.forEach((email) => copiasExternas.add(email));

  return { principales, copiasExternas };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const {
      to,
      cc,
      subject,
      html,
      requestId,
      threadId,
    } = req.body || {};

    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "Falta sesión. Iniciá sesión nuevamente para enviar notificaciones.",
      });
    }

    const supabaseAdmin = crearSupabaseAdmin();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({
        ok: false,
        error: "Sesión inválida o vencida. Iniciá sesión nuevamente.",
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role, sector")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!perfilPuedeEnviarDia(profile)) {
      return res.status(403).json({
        ok: false,
        error: "No tenés permiso para enviar notificaciones del Portal Día.",
      });
    }

    if (!to || !subject || !html) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos obligatorios para enviar el mail.",
      });
    }

    const destinatariosTo = emailsUnicos([to]);
    const destinatariosCc = emailsUnicos([cc]);

    if (!destinatariosTo.length) {
      return res.status(400).json({
        ok: false,
        error: "No hay destinatarios válidos para enviar el mail.",
      });
    }

    const { principales, copiasExternas } =
      await obtenerDestinatariosPermitidos({
        supabaseAdmin,
        requestId,
      });

    const destinatariosToNoPermitidos = destinatariosTo.filter(
      (email) => !principales.has(email)
    );

    if (destinatariosToNoPermitidos.length > 0) {
      return res.status(403).json({
        ok: false,
        error:
          "La notificación contiene destinatarios principales no permitidos para el Portal Día.",
        blockedRecipients: destinatariosToNoPermitidos,
      });
    }

    const destinatariosCcNoPermitidos = destinatariosCc.filter(
      (email) => !principales.has(email) && !copiasExternas.has(email)
    );

    if (destinatariosCcNoPermitidos.length > 0) {
      return res.status(403).json({
        ok: false,
        error:
          "La notificación contiene destinatarios en copia no asociados al pedido o legajo.",
        blockedRecipients: destinatariosCcNoPermitidos,
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Si ya existe hilo, usamos ese.
    // Si no existe, generamos uno fijo para este pedido.
    const rootThreadId =
      threadId || (requestId ? `<dia-request-${requestId}@saki.net.ar>` : undefined);

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: destinatariosTo.join(","),
      cc: destinatariosCc.length ? destinatariosCc.join(",") : undefined,
      subject,
      html,
    };

    // Primer mail del pedido: crea el hilo
    if (!threadId && rootThreadId) {
      mailOptions.messageId = rootThreadId;
    }

    // Mails siguientes: responden al mismo hilo
    if (threadId) {
      mailOptions.inReplyTo = threadId;
      mailOptions.references = [threadId];
    }

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      ok: true,
      messageId: info.messageId || rootThreadId || null,
      threadId: rootThreadId || null,
    });
  } catch (error) {
    console.error("Error enviando mail:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "No se pudo enviar el mail.",
    });
  }
}
