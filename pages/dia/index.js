// pages/dia/index.js
import { useMemo, useRef, useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import PedidoList from '../../components/PedidoList';

/* -------------------- Constantes -------------------- */
const ORDER_TYPES = [
  { key: "INFORME", label: "Informe de dominio" },
  { key: "CERTIFICADO", label: "Certificado de dominio" },
  { key: "PRENDA", label: "Inscripción de prenda" },
  { key: "ASESORIA", label: "Asesoría" },
  { key: "OTROS", label: "Otros" },
];

/* ==================================================== */
/*                      Página DÍA                      */
/* ==================================================== */

return (
  <div style={{ padding: 24 }}>
    <h1>Página Día</h1>

    {/* Formulario de creación */}
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input
        type="text"
        placeholder="Franquiciado"
        value={form.franquiciado}
        onChange={(e) => setForm({ ...form, franquiciado: e.target.value })}
      />
      <input
        type="text"
        placeholder="Tienda"
        value={form.tienda}
        onChange={(e) => setForm({ ...form, tienda: e.target.value })}
      />
      <input
        type="text"
        placeholder="Dominio"
        value={form.dominio}
        onChange={(e) => setForm({ ...form, dominio: e.target.value })}
      />
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        {ORDER_TYPES.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>
      <button type="submit">Guardar</button>
    </form>

    {/* Resultados de búsqueda */}
    <div style={{ marginTop: 24 }}>
      <h2>Pedidos</h2>
      {results.length === 0 ? (
        <p>No se encontraron pedidos.</p>
      ) : (
        <ul>
          {results.map((p) => (
            <li key={p.id}>{p.dominio} - {p.type}</li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

  const [file, setFile] = useState(null);

  /* -------------------- UI state -------------------- */
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [okId, setOkId] = useState(null);
  const [shortCode, setShortCode] = useState(null);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  /* -------------------- Buscador -------------------- */
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  /* Archivos subidos (post-guardar) */
  const [uploaded, setUploaded] = useState([]);

  /* File input oculto */
  const fileRef = useRef(null);

  /* -------------------- Validaciones -------------------- */
  const emailOk = useMemo(() => {
    const v = (form.requester_email || "").trim();
    if (!v) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [form.requester_email]);

  const franquiciadoOk = (form.franquiciado || "").trim() !== "";
  const tiendaOk = (form.tienda || "").trim() !== "";
  const dominioOk = (form.dominio || "").trim() !== "";
  const typeOk = !!form.type;

  const missing = useMemo(() => {
    const m = [];
    if (!franquiciadoOk) m.push("Franquiciado");
    if (!tiendaOk) m.push("Tienda");
    if (!dominioOk) m.push("Dominio");
    if (!typeOk) m.push("Tipo de trámite");
    if (!emailOk) m.push("Email del analista válido");
    return m;
  }, [franquiciadoOk, tiendaOk, dominioOk, typeOk, emailOk]);

  const canSave = missing.length === 0 && !saving;

  const onChange = (name) => (e) =>
    setForm((p) => ({ ...p, [name]: e.target.value }));

  // Dominio/patente: a mayúsculas + filtra caracteres válidos
  const onChangeDominio = (e) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9.\-]/g, "");
    setForm((p) => ({ ...p, dominio: v }));
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setInfo(null);
    setOk(false);
    setOkId(null);
    setShortCode(null);
    setUploaded([]);

    try {
      const payload = {
        franquiciado: (form.franquiciado || "").trim(),
        tienda: (form.tienda || "").trim(),
        dominio: (form.dominio || "").trim(),
        requester_email: (form.requester_email || "").trim(),
        type: form.type || "INFORME",
        notes: (form.notes || "").trim() || null,
      };

      const { data: req, error: insErr } = await supabase
        .from("dia_requests")
        .insert(payload)
        .select("id, short_code")
        .single();

      if (insErr) {
        throw insErr;
      }

      setOkId(req.id);
      setShortCode(req.short_code || (req.id || "").slice(0, 8));

      // Subida de archivo (opcional)
      if (file) {
        const ext = file.name?.split(".").pop() || "bin";
        const safeName = (file.name || `archivo.${ext}`).replace(/[^\w.\-]/g, "_");
        const path = `${req.id}/${Date.now()}_${safeName}`;

        const { error: upErr } = await supabase.storage
          .from("dia-requests")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/octet-stream",
          });

        if (upErr) {
          setInfo("El pedido se guardó, pero el archivo no pudo subirse.");
        } else {
          const { data: meta } = await supabase
            .from("dia_request_files")
            .insert({
              request_id: req.id,
              path,
              filename: file.name,
              size_kb: Math.round(file.size / 1024),
              content_type: file.type || null,
            })
            .select("id, path, filename, size_kb, content_type")
            .single();

          setUploaded((prev) => [...prev, meta || {
            id: null,
            path,
            filename: file.name,
            size_kb: Math.round(file.size / 1024),
            content_type: file.type || null,
          }]);
        }
      }

      setOk(true);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err.message || "No se pudo guardar el pedido.");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- Eliminar archivo subido -------------------- */
  const handleDeleteUploaded = async (row) => {
    try {
      const { error: remErr } = await supabase.storage
        .from("dia-requests")
        .remove([row.path]);
      if (remErr) throw remErr;

      if (row.id) {
        const { error: delErr } = await supabase
          .from("dia_request_files")
          .delete()
          .eq("id", row.id);
        if (delErr) throw delErr;
      }

      setUploaded((prev) => prev.filter((f) => f.path !== row.path));
      setInfo("Archivo eliminado correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo eliminar el archivo.");
    }
  };
 
  /* Persistir/Restaurar búsqueda en sessionStorage */
  useEffect(() => {
    if (results.length > 0) {
      sessionStorage.setItem("dia_results", JSON.stringify(results));
    }
  }, [results]);

  useEffect(() => {
  const savedQ = sessionStorage.getItem("dia_search_q");
  const savedResults = sessionStorage.getItem("dia_search_results");
  if (savedQ) setQ(savedQ);
  if (savedResults) {
    try {
      setResults(JSON.parse(savedResults));
    } catch {}
  } else {
    // si no hay cache previa, cargo últimos pedidos
    fetchDiaRequests();
  }
}, []);

  const normalize = (row) => ({
  id: row.id ?? row.request_id ?? row.req_id,
  pedido_id: row.pedido_id ?? row.request_number ?? row.req_number ?? row.id,
  nombre: row.nombre ?? row.name ?? row.full_name ?? row.titular ?? "",
  dominio: row.dominio ?? row.domain ?? row.patente ?? "",
  email: row.email ?? row.mail ?? "",
  fecha: row.fecha ?? row.created_at ?? row.createdAt ?? null,
  estado: row.estado ?? row.status ?? row.estado_actual ?? "EN_CURSO",
  resultado: row.resultado ?? row.result ?? row.outcome ?? "PENDIENTE",
});

const fetchDiaRequests = async () => {
  try {
    const term = (q || "").trim();

    let query = supabase
      .from("dia_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (term) {
      query = query.or(
        [
          `nombre.ilike.%${term}%`,
          `name.ilike.%${term}%`,
          `full_name.ilike.%${term}%`,
          `email.ilike.%${term}%`,
          `mail.ilike.%${term}%`,
          `dominio.ilike.%${term}%`,
          `domain.ilike.%${term}%`,
          `patente.ilike.%${term}%`,
          `request_number.ilike.%${term}%`,
          `pedido_id.ilike.%${term}%`,
        ].join(",")
      );
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;

    setResults((data || []).map(normalize));
  } catch (e) {
    console.error("Error al buscar dia_requests:", e);
    setResults([]);
  }
};

  /* -------------------- Render -------------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        padding: "48px 24px",
        background:
          "linear-gradient(135deg, rgba(10,30,60,1) 0%, rgba(10,45,80,1) 40%, rgba(12,60,100,1) 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", color: "white" }}>
        {/* Encabezado */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>Bienvenido Día Argentina</h2>
          <div style={{ opacity: 0.8, marginTop: 6 }}>El portal que nos conecta</div>
        </div>

        {/* Formulario */}
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Orden de pedido</h3>

          <form onSubmit={handleSubmit}>
            {/* Franquiciado / Tienda / Dominio */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div style={{ gridColumn: "1 / span 2" }}>
                <label>Franquiciado *</label>
                <input
                  type="text"
                  placeholder="Nombre del franquiciado"
                  value={form.franquiciado}
                  onChange={onChange("franquiciado")}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label>Tienda *</label>
                <input
                  type="text"
                  placeholder="Nombre de la tienda"
                  value={form.tienda}
                  onChange={onChange("tienda")}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label>Dominio *</label>
                <input
                  type="text"
                  placeholder="DOMINIOEMPRESA.COM o AB123CD"
                  value={form.dominio}
                  onChange={onChangeDominio}
                  onBlur={() =>
                    setForm((p) => ({ ...p, dominio: (p.dominio || "").trim() }))
                  }
                  inputMode="email"
                  pattern="[A-Z0-9.\\-]+"
                  title="Usá solo letras, números, punto y guion"
                  style={{ ...inputStyle, textTransform: "uppercase" }}
                  required
                />
              </div>
            </div>

            {/* Tipo de trámite */}
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <label>Tipo de trámite *</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                {ORDER_TYPES.map((t) => (
                  <label
                    key={t.key}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.18)",
                      background:
                        form.type === t.key
                          ? "rgba(0,150,150,0.3)"
                          : "rgba(255,255,255,0.04)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t.key}
                      checked={form.type === t.key}
                      onChange={() => setForm((p) => ({ ...p, type: t.key }))}
                      required
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Email analista */}
            <div style={{ marginTop: 12 }}>
              <label>Analista (email de quien solicita) *</label>
              <input
                type="email"
                placeholder="alguien@empresa.com"
                value={form.requester_email}
                onChange={onChange("requester_email")}
                style={inputStyle}
                required
              />
            </div>

            {/* Notas */}
            <div style={{ marginTop: 12 }}>
              <label>Notas</label>
              <textarea
                placeholder="Comentarios adicionales"
                rows={4}
                value={form.notes}
                onChange={onChange("notes")}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Archivo (selector custom) */}
            <div style={{ marginTop: 12 }}>
              <label>Archivos adjuntos (opcional)</label>

              <input
                ref={fileRef}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => fileRef.current?.click()} style={miniBtn}>
                  Seleccionar archivo
                </button>

                {file && (
                  <>
                    <span style={{ alignSelf: "center", opacity: 0.95 }}>
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      style={{ ...miniBtn, borderColor: "rgba(255,120,120,0.6)" }}
                    >
                      Quitar selección
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mensajes */}
            {missing.length > 0 && (
              <div style={{ color: "#ffdf95", marginTop: 10 }}>
                Falta completar: <b>{missing.join(", ")}</b>.
              </div>
            )}
            {error && (
              <div style={{ color: "#ffb4b4", marginTop: 10 }}>
                No pudimos guardar el pedido: {error}
              </div>
            )}
            {info && <div style={{ color: "#a7f3d0", marginTop: 10 }}>{info}</div>}
            {ok && <SuccessBadge okId={okId} shortCode={shortCode} />}

            {/* Guardar */}
            <div style={{ marginTop: 16 }}>
              <button
                type="submit"
                disabled={!canSave}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: !canSave
                    ? "rgba(255,255,255,0.12)"
                    : "linear-gradient(90deg,#0aa,#0bd)",
                  color: "white",
                  cursor: !canSave ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  minWidth: 180,
                }}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>

          {/* Lista de archivos subidos post-guardar */}
          {ok && uploaded.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ opacity: 0.9, marginBottom: 6 }}>Archivos del pedido:</div>
              <ul style={{ marginTop: 4 }}>
                {uploaded.map((f) => (
                  <li key={f.path} style={{ marginBottom: 6 }}>
                    <span>
                      {f.filename} ({f.size_kb} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteUploaded(f)}
                      style={{
                        ...miniBtn,
                        marginLeft: 8,
                        borderColor: "rgba(255,120,120,0.6)",
                      }}
                    >
                      Eliminar del sistema
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Buscador */}
        <div
          style={{
            marginTop: 24,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <label>Buscar pedido</label>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              type="text"
              placeholder="Escribí parte del dominio, tienda, franquiciado, short_code o ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchDiaRequests(); }}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={fetchDiaRequests}
              disabled={!q || searching}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.22)",
                background:
                  !q || searching
                    ? "rgba(255,255,255,0.12)"
                    : "linear-gradient(90deg,#0aa,#0bd)",
                color: "white",
                cursor: !q || searching ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              {searching ? "Buscando…" : "Buscar"}
            </button>
          </div>

          {noResults && (
            <div style={{ marginTop: 12, opacity: 0.9 }}>
              No encontramos pedidos
              {lastQuery ? <> para <b>{lastQuery}</b></> : null}.
            </div>
          )}

          {/* Resultados */}
<PedidoList
  pedidos={results}
  onVerResultado={(p) => {
    // mismo comportamiento que tu link "Ver resultado"
    window.location.href = `/dia/r/${p.id}?q=${encodeURIComponent(q || "")}`;
  }}
/>
        </div>

        {/* Footer */}
        <div style={{ opacity: 0.6, fontSize: 12, marginTop: 24 }}>
          © {new Date().getFullYear()} SAKI
        </div>
      </div>
    </div>
  );
}

/* ==================================================== */
/*              Subcomponentes / estilos                */
/* ==================================================== */

function SuccessBadge({ okId, shortCode }) {
  const [copied, setCopied] = useState(false);
  const sc = shortCode || (okId || "").slice(0, 8);

  const copyFullId = async () => {
    try {
      await navigator.clipboard.writeText(okId || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(62, 230, 182, 0.12)",
        border: "1px solid rgba(62, 230, 182, 0.35)",
        color: "#3ee6b6",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontWeight: 700 }}>Pedido enviado ✅</span>
      <span style={{ opacity: 0.9 }}>
        Código: <b style={{ color: "white" }}>{sc}</b>
      </span>
      <button type="button" onClick={copyFullId} style={miniBtn}>
        {copied ? "¡Copiado!" : "Copiar ID"}
      </button>
    </div>
  );
}

/* Badge simple por si lo necesitás en otros lugares */
function Badge({ kind, value }) {
  const base = {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    marginLeft: 8,
  };
  let style = {};
  if (kind === "status") {
    style =
      value === "ENTREGADO"
        ? { background: "rgba(62, 230, 182, 0.25)", border: "1px solid rgba(62,230,182,0.4)" }
        : { background: "rgba(80, 170, 255, 0.25)", border: "1px solid rgba(80,170,255,0.4)" };
  } else {
    if (value === "APROBADO") {
      style = { background: "rgba(62, 230, 182, 0.25)", border: "1px solid rgba(62,230,182,0.4)" };
    } else if (value === "OBSERVADO") {
      style = { background: "rgba(255, 210, 90, 0.25)", border: "1px solid rgba(255,210,90,0.4)" };
    } else {
      style = { background: "rgba(200, 200, 200, 0.2)", border: "1px solid rgba(200,200,200,0.35)" };
    }
  }
  return <span style={{ ...base, ...style }}>{value}</span>;
}

/* -------------------- Estilos inline reusables -------------------- */
const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  outline: "none",
};

const miniBtn = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};
