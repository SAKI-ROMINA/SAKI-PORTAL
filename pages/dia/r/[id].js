import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

// Etiquetas
const estadoLabel = (estado) => {
  if (estado === "SOLICITADO") return "SOLICITADO";
  if (estado === "EN_CURSO") return "EN CURSO";
  if (estado === "ENTREGADO") return "ENTREGADO";
  return estado || "";
};

const resultadoLabel = (res) => {
  if (res === "APROBADO") return "APROBADO";
  if (res === "OBSERVADO") return "OBSERVADO";
  return "";
};

// Fecha segura
const fmtDate = (iso) => {
  if (!iso) return "Sin fecha";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "Sin fecha"
    : d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
};

export default function DiaResultado() {
  const router = useRouter();
  const { id, q } = router.query;

  const BUCKET = "dia-requests";

  const [row, setRow] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  const fileRef = useRef(null);

  // edición de estado/resultado
  const [status, setStatus] = useState("SOLICITADO");
  const [result, setResult] = useState(null);

  const [observedStatus, setObservedStatus] = useState(null);
  const [observedDate, setObservedDate] = useState(null);
  const [observedAmount, setObservedAmount] = useState(null);
  const [observedOther, setObservedOther] = useState(null);

  const [saving, setSaving] = useState(false);

  // notas
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [replyFor, setReplyFor] = useState(null);
  const [inlineReply, setInlineReply] = useState({});
  const [authorMap, setAuthorMap] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshNotes = async () => {
    const { data: notesRows, error } = await supabase
      .from("dia_notes")
      .select(
        "id, request_id, author_id, note, parent_id, created_at, author:profiles ( full_name, role )"
      )
      .eq("request_id", id)
      .order("created_at", { ascending: true });

    if (!error) setNotes(notesRows || []);
  };

  const authorLabel = (uid) => {
    const a = authorMap?.[uid];
    if (!a) return "Usuario";
    return a.role ? `${a.name} (${a.role})` : a.name;
  };

  async function sendMailForRequest({
    rowData,
    subject,
    html,
    to = "rominamazzeo@gmail.com",
    cc = "",
  }) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        return {
          ok: false,
          error: "Falta sesión para enviar la notificación.",
        };
      }

      const mailRes = await fetch("/api/dia/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          to,
          cc,
          subject,
          html,
          requestId: rowData?.id,
          threadId: rowData?.email_thread_id || null,
        }),
      });

      const mailJson = await mailRes.json();

      if (!mailRes.ok) {
        return {
          ok: false,
          error: mailJson?.error || "No se pudo enviar el mail.",
        };
      }

      if (mailJson?.ok && !rowData?.email_thread_id && mailJson.threadId) {
        const { error: threadError } = await supabase
          .from("dia_requests")
          .update({ email_thread_id: mailJson.threadId })
          .eq("id", rowData.id);

        if (!threadError) {
          setRow((prev) =>
            prev ? { ...prev, email_thread_id: mailJson.threadId } : prev
          );
        }
      }

      return mailJson;
    } catch (err) {
      console.error("Error enviando notificación:", err);
      return { ok: false, error: err.message || "No se pudo enviar el mail." };
    }
  }

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        // Pedido
        const { data, error } = await supabase
          .from("dia_requests")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setRow(data);

        // Rol usuario actual
        const { data: auth, error: authError } = await supabase.auth.getUser();

        console.log("AUTH DETAIL:", auth);
        console.log("AUTH ERROR:", authError);

        if (auth?.user) {
          const { data: prof, error: profError } = await supabase
            .from("profiles")
            .select("id, email, role, full_name, name")
            .eq("id", auth.user.id)
            .maybeSingle();

          console.log("PROFILE DETAIL:", prof);
          console.log("PROFILE ERROR:", profError);
          console.log("AUTH USER ID:", auth?.user?.id);
          console.log("PROFILE ERROR MESSAGE:", profError?.message);

          setIsAdmin((prof?.role || "").toLowerCase() === "admin");
        } else {
          setIsAdmin(false);
        }

        // Notas
        await refreshNotes();

        // Mapa de autores
        const { data: n2 } = await supabase
          .from("dia_notes")
          .select("author_id")
          .eq("request_id", id);

        const ids = Array.from(
          new Set((n2 || []).map((x) => x.author_id).filter(Boolean))
        );

        if (ids.length) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, full_name, name, role")
            .in("id", ids);

          const map = {};
          (profs || []).forEach((p) => {
            const name = p.full_name || p.name || p.id;
            const role =
              (p.role || "").toLowerCase() === "admin" ? "Admin Saki" : "Día";

            map[p.id] = { name, role };
          });

          setAuthorMap(map);
        }

        // Estados actuales
        if (data) {
          setStatus(data.status ?? "SOLICITADO");
          setResult(data.result ?? null);
          setObservedStatus(data.observed_status ?? null);
          setObservedDate(data.observed_date ?? null);
          setObservedAmount(data.observed_amount ?? null);
          setObservedOther(data.observed_other ?? null);
        }

        // Archivos
        const { data: fData, error: fErr } = await supabase
          .from("dia_request_files")
          .select("*")
          .eq("request_id", id)
          .order("id", { ascending: true });

        if (fErr) throw fErr;
        setFiles(fData || []);
      } catch (e) {
        setError(e.message || "No se pudo cargar el pedido.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // guardar estado/resultado
  async function handleGuardar() {
    setSaving(true);
    try {
      const patch = {
        status,
        result,
        observed_status:
          result === "OBSERVADO" ? observedStatus?.trim() || null : null,
        observed_date: result === "OBSERVADO" ? observedDate || null : null,
        observed_amount:
          result === "OBSERVADO"
            ? observedAmount !== "" && observedAmount !== null
              ? Number(observedAmount)
              : null
            : null,
        observed_other:
          result === "OBSERVADO" ? observedOther?.trim() || null : null,
      };

      if (result === "APROBADO") patch.status = "ENTREGADO";

      const { error } = await supabase
        .from("dia_requests")
        .update(patch)
        .eq("id", id);

      if (error) throw error;

      const updatedRow = {
        ...row,
        ...patch,
      };

      if (result === "APROBADO" || result === "OBSERVADO") {
        const mailJson = await sendMailForRequest({
          rowData: updatedRow,
          subject: `SAKI | Legajo ${updatedRow?.short_code || String(updatedRow?.id || "").slice(0, 8)} | Tienda: ${updatedRow?.tienda || "-"} | Dominio: ${updatedRow?.dominio || "-"}`,
          html: `
            <div style="font-family: Arial, sans-serif; font-size: 14px; color: #111; line-height: 1.5;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a;">Notificación del Portal Día</h2>

              <p style="margin: 0 0 16px 0;">
                El pedido ya cuenta con resultado disponible para su consulta.
              </p>

              <p style="margin: 0 0 8px 0;"><strong>Tienda:</strong> ${updatedRow?.tienda || "-"}</p>
              <p style="margin: 0 0 8px 0;"><strong>Dominio:</strong> ${updatedRow?.dominio || "-"}</p>
              <p style="margin: 0 0 8px 0;"><strong>Franquiciado:</strong> ${updatedRow?.franquiciado || "-"}</p>
              <p style="margin: 0 0 8px 0;"><strong>Tipo de trámite:</strong> ${updatedRow?.type || "-"}</p>
              <p style="margin: 0 0 8px 0;"><strong>Analista:</strong> ${updatedRow?.requester_email || "-"}</p>
              <p style="margin: 0 0 8px 0;"><strong>Resultado:</strong> ${result || "-"}</p>

              <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;" />

              <p style="margin: 0; color: #475569;">
                Este mensaje fue generado automáticamente por SAKI Portal Día. Por favor, no responder a este correo.
              </p>
            </div>
          `,
        });

        if (!mailJson?.ok) {
          alert(
            mailJson.error ||
              "El resultado se guardó, pero el mail no pudo enviarse."
          );
        }
      }

      setRow((prev) => ({
        ...prev,
        ...patch,
      }));

      alert("Guardado ✔");
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  // acciones rápidas
  const handleMarcarEnCurso = async () => {
    if (!row?.id) return;

    const updatedRow = {
      ...row,
      status: "EN_CURSO",
      updated_at: new Date().toISOString(),
    };

    setRow((prev) => ({ ...prev, status: "EN_CURSO" }));
    setStatus("EN_CURSO");

    const { error } = await supabase
      .from("dia_requests")
      .update({ status: "EN_CURSO", updated_at: updatedRow.updated_at })
      .eq("id", row.id);

    if (error) {
      alert("No se pudo marcar EN CURSO.");
      return;
    }

    const mailJson = await sendMailForRequest({
      rowData: updatedRow,
      subject: `SAKI | Legajo ${updatedRow?.short_code || String(updatedRow?.id || "").slice(0, 8)} | Tienda: ${updatedRow?.tienda || "-"} | Dominio: ${updatedRow?.dominio || "-"}`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #111; line-height: 1.5;">
          <h2 style="margin: 0 0 16px 0; color: #0f172a;">Notificación del Portal Día</h2>

          <p style="margin: 0 0 16px 0;">
            El pedido fue tomado y se encuentra en curso.
          </p>

          <p style="margin: 0 0 8px 0;"><strong>Tienda:</strong> ${updatedRow.tienda || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Dominio:</strong> ${updatedRow.dominio || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Franquiciado:</strong> ${updatedRow.franquiciado || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Tipo de trámite:</strong> ${updatedRow.type || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Analista:</strong> ${updatedRow.requester_email || "-"}</p>

          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;" />

          <p style="margin: 0; color: #475569;">
            Este mensaje fue generado automáticamente por SAKI Portal Día. Por favor, no responder a este correo.
          </p>
        </div>
      `,
    });

    if (!mailJson?.ok) {
      alert(
        mailJson.error ||
          "El estado se actualizó, pero el mail no pudo enviarse."
      );
    }
  };

  const handleMarcarObservado = async () => {
    if (!row?.id) return;

    setRow((prev) => ({ ...prev, result: "OBSERVADO" }));
    setResult("OBSERVADO");

    const { error } = await supabase
      .from("dia_requests")
      .update({ result: "OBSERVADO", updated_at: new Date().toISOString() })
      .eq("id", row.id);

    if (error) alert("No se pudo marcar OBSERVADO.");
  };

  // archivos
  const handleUploadInforme = async () => {
    try {
      if (!fileRef.current?.files?.length) {
        alert("Primero seleccioná un archivo");
        return;
      }

      const file = fileRef.current.files[0];
      const filePath = `${id}/${Date.now()}_${file.name.replace(/[^\w.\-]/g, "_")}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase.from("dia_request_files").insert({
        request_id: id,
        path: filePath,
        filename: file.name,
        size_kb: Math.round((file.size || 0) / 1024),
        content_type: file.type || null,
      });

      if (insertErr) throw insertErr;

      const { data: fData, error: fErr } = await supabase
        .from("dia_request_files")
        .select("*")
        .eq("request_id", id)
        .order("id", { ascending: true });

      if (fErr) throw fErr;

      setFiles(fData || []);
      if (fileRef.current) fileRef.current.value = "";

      alert("Archivo subido con éxito ✅");
    } catch (e) {
      console.error(e);
      alert("Error al subir archivo ❌");
    }
  };

  const handleDownload = async (fileRow) => {
    try {
      setDownloading(fileRow.id || fileRow.path);

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(fileRow.path, 60);

      if (error) throw error;

      const url = data?.signedUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert(e.message || "No se pudo descargar el archivo.");
    } finally {
      setDownloading(null);
    }
  };

  // notas
  const handleAddNote = async () => {
    const text = (noteText || "").trim();
    if (!text) return;

    const { data: auth } = await supabase.auth.getUser();

    const insert = {
      request_id: id,
      author_id: auth?.user?.id || null,
      note: text,
      parent_id: replyFor || null,
    };

    const { error } = await supabase.from("dia_notes").insert(insert);
    if (error) return alert("No se pudo guardar la nota");

    const mailJson = await sendMailForRequest({
      rowData: row,
      subject: `SAKI | Legajo ${row?.short_code || String(row?.id || "").slice(0, 8)} | Tienda: ${row?.tienda || "-"} | Dominio: ${row?.dominio || "-"}`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #111; line-height: 1.5;">
          <h2 style="margin: 0 0 16px 0; color: #0f172a;">Notificación del Portal Día</h2>

          <p style="margin: 0 0 16px 0;">
            Se agregó una nueva nota al pedido.
          </p>

          <p style="margin: 0 0 8px 0;"><strong>Tienda:</strong> ${row?.tienda || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Dominio:</strong> ${row?.dominio || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Franquiciado:</strong> ${row?.franquiciado || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Tipo de trámite:</strong> ${row?.type || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Analista:</strong> ${row?.requester_email || "-"}</p>
          <p style="margin: 16px 0 8px 0;"><strong>Nota:</strong></p>
          <p style="margin: 0 0 8px 0; white-space: pre-wrap;">${text}</p>

          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;" />

          <p style="margin: 0; color: #475569;">
            Este mensaje fue generado automáticamente por SAKI Portal Día. Por favor, no responder a este correo.
          </p>
        </div>
      `,
    });

    if (!mailJson?.ok) {
      alert(mailJson.error || "La nota se guardó, pero el mail no pudo enviarse.");
    }

    setNoteText("");
    setReplyFor(null);
    setInlineReply({});
    await refreshNotes();
  };

  const handleStartReply = (noteId) => {
    setReplyFor(noteId);
    setInlineReply((p) => ({ ...p, [noteId]: p[noteId] ?? "" }));
  };

  const handleSaveInlineReply = async (noteId) => {
    const text = (inlineReply[noteId] || "").trim();
    if (!text) return;

    const { data: auth } = await supabase.auth.getUser();

    const insert = {
      request_id: id,
      author_id: auth?.user?.id || null,
      note: text,
      parent_id: noteId,
    };

    const { error } = await supabase.from("dia_notes").insert(insert);
    if (error) return alert("No se pudo guardar la respuesta");

    const mailJson = await sendMailForRequest({
      rowData: row,
      subject: `SAKI | Legajo ${row?.short_code || String(row?.id || "").slice(0, 8)} | Tienda: ${row?.tienda || "-"} | Dominio: ${row?.dominio || "-"}`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #111; line-height: 1.5;">
          <h2 style="margin: 0 0 16px 0; color: #0f172a;">Notificación del Portal Día</h2>

          <p style="margin: 0 0 16px 0;">
            Se agregó una respuesta a una nota del pedido.
          </p>

          <p style="margin: 0 0 8px 0;"><strong>Tienda:</strong> ${row?.tienda || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Dominio:</strong> ${row?.dominio || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Franquiciado:</strong> ${row?.franquiciado || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Tipo de trámite:</strong> ${row?.type || "-"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Analista:</strong> ${row?.requester_email || "-"}</p>
          <p style="margin: 16px 0 8px 0;"><strong>Respuesta:</strong></p>
          <p style="margin: 0 0 8px 0; white-space: pre-wrap;">${text}</p>

          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;" />

          <p style="margin: 0; color: #475569;">
            Este mensaje fue generado automáticamente por SAKI Portal Día. Por favor, no responder a este correo.
          </p>
        </div>
      `,
    });

    if (!mailJson?.ok) {
      alert(
        mailJson.error || "La respuesta se guardó, pero el mail no pudo enviarse."
      );
    }

    setInlineReply((p) => ({ ...p, [noteId]: "" }));
    setReplyFor(null);
    await refreshNotes();
  };

  const handleDeleteNote = async (noteId) => {
    if (!isAdmin) return;
    if (!confirm("¿Borrar esta nota? Las respuestas también se eliminarán.")) {
      return;
    }

    const { error } = await supabase
      .from("dia_notes")
      .delete()
      .eq("id", noteId);

    if (error) return alert("No se pudo borrar la nota");

    await refreshNotes();
  };

  // estilos
  const wrap = {
    minHeight: "100vh",
    padding: 24,
    color: "white",
    background:
      "linear-gradient(135deg, rgba(10,30,60,1) 0%, rgba(10,45,80,1) 40%, rgba(12,60,100,1) 100%)",
  };

  const card = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 14,
  };

  const miniBtn = {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  };

  const fieldStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    boxSizing: "border-box",
  };

  if (loading) return <div style={wrap}>Cargando…</div>;
  if (error) return <div style={wrap}>Error: {error}</div>;
  if (!row) return <div style={wrap}>No se encontró el pedido.</div>;

  const estadoRaw = row?.status || row?.estado || "SOLICITADO";
  const resultadoRaw = row?.result || row?.resultado || null;

  const resultadoTone =
    resultadoRaw === "APROBADO"
      ? "green"
      : resultadoRaw === "OBSERVADO"
      ? "yellow"
      : "gray";

  const rootNotes = notes.filter((n) => !n.parent_id);

  return (
    <div style={wrap}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>
          Pedido {row.short_code || String(row.id).slice(0, 8)}
          <span style={{ marginLeft: 8 }} />
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              marginLeft: 8,
              background: "rgba(200,200,200,0.2)",
              border: "1px solid rgba(200,200,200,0.8)",
            }}
          >
            {estadoLabel(estadoRaw)}
          </span>
          {resultadoLabel(resultadoRaw) && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                marginLeft: 8,
                background:
                  resultadoTone === "green"
                    ? "rgba(62,230,182,.25)"
                    : "rgba(255,210,90,.25)",
                border:
                  resultadoTone === "green"
                    ? "1px solid rgba(62,230,182,.8)"
                    : "1px solid rgba(255,210,90,.8)",
              }}
            >
              {resultadoLabel(resultadoRaw)}
            </span>
          )}
        </h2>

        <Link
          href={q ? `/dia?q=${encodeURIComponent(q)}` : "/dia"}
          style={miniBtn}
        >
          ← Volver
        </Link>
      </div>

      <div style={{ opacity: 0.9, marginBottom: 12, marginTop: 16 }}>
        <b>Franquiciado:</b> {row.franquiciado || "-"} &nbsp;•&nbsp;
        <b>Tienda:</b> {row.tienda || "-"} &nbsp;•&nbsp;
        <b>Dominio:</b> {row.dominio || "-"}
      </div>

      <div style={{ opacity: 0.9, marginBottom: 16 }}>
        <b>Tipo:</b> {row.type || "-"} &nbsp;•&nbsp;
        <b>Creado:</b> {fmtDate(row.created_at)}
      </div>

      {isAdmin && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <button type="button" style={miniBtn} onClick={handleMarcarEnCurso}>
            Marcar en curso
          </button>

          <button
            type="button"
            style={miniBtn}
            onClick={handleMarcarObservado}
          >
            Marcar observado
          </button>

          <input type="file" ref={fileRef} style={{ display: "none" }} />

          <button
            type="button"
            style={miniBtn}
            onClick={() => fileRef.current?.click()}
          >
            Seleccionar archivo
          </button>

          <button type="button" style={miniBtn} onClick={handleUploadInforme}>
            Subir archivo
          </button>
        </div>
      )}

      {isAdmin && (
        <div style={{ ...card, marginBottom: 12 }}>
          <h3 style={{ marginTop: 0 }}>Estado del trámite</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label>Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={fieldStyle}
              >
                <option value="SOLICITADO">SOLICITADO</option>
                <option value="EN_CURSO">EN CURSO</option>
                <option value="ENTREGADO">ENTREGADO</option>
              </select>
            </div>

            <div>
              <label>Resultado</label>
              <select
                value={result ?? ""}
                onChange={(e) => setResult(e.target.value || null)}
                style={fieldStyle}
              >
                <option value="">—</option>
                <option value="APROBADO">APROBADO</option>
                <option value="OBSERVADO">OBSERVADO</option>
              </select>
            </div>

            {result === "OBSERVADO" && (
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <label>Estado de prenda</label>
                  <input
                    value={observedStatus || ""}
                    onChange={(e) => setObservedStatus(e.target.value)}
                    placeholder="vigente / caduca sin inscripción"
                    style={fieldStyle}
                  />
                </div>

                <div>
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={observedDate || ""}
                    onChange={(e) => setObservedDate(e.target.value)}
                    style={fieldStyle}
                  />
                </div>

                <div>
                  <label>Monto</label>
                  <input
                    type="number"
                    value={observedAmount || ""}
                    onChange={(e) => setObservedAmount(e.target.value)}
                    style={fieldStyle}
                  />
                </div>

                <div>
                  <label>Otros</label>
                  <textarea
                    value={observedOther || ""}
                    onChange={(e) => setObservedOther(e.target.value)}
                    style={{ ...fieldStyle, minHeight: 90 }}
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleGuardar}
                disabled={saving}
                style={{
                  ...miniBtn,
                  background: "linear-gradient(90deg,#0aa,#0bd)",
                  border: "none",
                }}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="notas" style={card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Notas del trámite</div>

        <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={
              replyFor ? "Escribir respuesta…" : "Escribir nota del trámite…"
            }
            style={{
              ...fieldStyle,
              minHeight: 80,
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={miniBtn} onClick={handleAddNote}>
              {replyFor ? "Guardar respuesta" : "Agregar nota"}
            </button>
            {replyFor && (
              <button
                type="button"
                style={miniBtn}
                onClick={() => {
                  setReplyFor(null);
                  setNoteText("");
                }}
              >
                Cancelar respuesta
              </button>
            )}
          </div>
        </div>

        {rootNotes.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No hay notas.</div>
        ) : (
          <div>
            {rootNotes.map((n) => (
              <div
                key={n.id}
                style={{
                  marginBottom: 14,
                  paddingBottom: 14,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.85 }}>
                  {fmtDate(n.created_at)} — {authorLabel(n.author_id)}
                </div>

                <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                  {n.note}
                </div>

                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    style={miniBtn}
                    onClick={() => handleStartReply(n.id)}
                  >
                    ↩️ Responder
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      style={miniBtn}
                      onClick={() => handleDeleteNote(n.id)}
                    >
                      🗑️ Borrar
                    </button>
                  )}
                </div>

                {notes
                  .filter((r) => r.parent_id === n.id)
                  .map((r) => (
                    <div
                      key={r.id}
                      style={{
                        marginLeft: 24,
                        marginTop: 10,
                        paddingLeft: 12,
                        borderLeft: "2px solid rgba(255,255,255,0.14)",
                      }}
                    >
                      <div style={{ fontSize: 13, opacity: 0.85 }}>
                        {fmtDate(r.created_at)} — {authorLabel(r.author_id)}
                      </div>

                      <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                        {r.note}
                      </div>

                      <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          style={miniBtn}
                          onClick={() => handleStartReply(n.id)}
                        >
                          ↩️ Responder
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            style={miniBtn}
                            onClick={() => handleDeleteNote(r.id)}
                          >
                            🗑️ Borrar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                {replyFor === n.id && (
                  <div style={{ marginLeft: 24, marginTop: 10 }}>
                    <textarea
                      value={inlineReply[n.id] || ""}
                      onChange={(e) =>
                        setInlineReply((p) => ({
                          ...p,
                          [n.id]: e.target.value,
                        }))
                      }
                      placeholder="Escribir respuesta…"
                      style={{
                        ...fieldStyle,
                        minHeight: 60,
                        resize: "vertical",
                      }}
                    />
                    <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        style={miniBtn}
                        onClick={() => handleSaveInlineReply(n.id)}
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        style={miniBtn}
                        onClick={() => {
                          setInlineReply((p) => ({ ...p, [n.id]: "" }));
                          setReplyFor(null);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Archivos del pedido</div>

        {files.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No hay archivos adjuntos.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {files.map((f) => (
              <li key={f.id || f.path} style={{ marginBottom: 8 }}>
                <span>
                  {f.filename}{" "}
                  {typeof f.size_kb === "number" ? `(${f.size_kb} KB)` : ""}
                </span>

                <button
                  type="button"
                  onClick={() => handleDownload(f)}
                  disabled={downloading === (f.id || f.path)}
                  style={{ ...miniBtn, marginLeft: 8 }}
                >
                  {downloading === (f.id || f.path)
                    ? "Preparando…"
                    : "Descargar"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
