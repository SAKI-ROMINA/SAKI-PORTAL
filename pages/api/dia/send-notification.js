import nodemailer from "nodemailer";

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

    if (!to || !subject || !html) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos obligatorios para enviar el mail.",
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
      to,
      cc: cc || undefined,
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