import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../../lib/supabaseClient";

function Badge({ kind, value }) {
  const base = { padding: "2px 8px", borderRadius: 999, fontSize: 12, marginLeft: 8 };
  let style = {};
  if (kind === "status") {
    style =
      value === "ENTREGADO"
        ? { background: "rgba(62,230,182,0.25)", border: "1px solid rgba(62,230,182,0.4)" }
        : { background: "rgba(80,170,255,0.25)", border: "1px solid rgba(80,170,255,0.4)" };
  } else {
    if (value === "APROBADO") {
      style = { background: "rgba(62,230,182,0.25)", border: "1px solid rgba(62,230,182,0.4)" };
    } else if (value === "OBSERVADO") {
      style = { background: "rgba(255,210,90,0.25)", border: "1px solid rgba(255,210,90,0.4)" };
    } else {
      style = { background: "rgba(200,200,200,0.2)", border: "1px solid rgba(200,200,200,0.35)" };
    }
  }
  return <span style={{ ...base, ...style }}>{value}</span>;
}

export default function DiaResultado() {
  const router = useRouter();
  const { short } = router.query;

  const [loading, setLoading] = useState(true);
  const [req, setReq] = useState(null);
  const [files, setFiles] = useState([]); // {id, filename, size_kb, content_type, url}
  const [error, setError] = useState(null);

  const created = useMemo(
    () => (req?.created_at ? new Date(req.created_at).toLocaleString() : "-"),
    [req?.created_at]
  );

  useEffect(() => {
    if (!short) return;
    (async () => {
      setLoading(true);
      setError(null);
      setReq(null);
      setFiles([]);
      try {
        // 1) buscar por short_code primero
        let { data: r, error: e1 } = await supabase
          .from("dia_requests")
          .select(
            "id, short_code, dominio, tienda, franquiciado, type, requester_email, status, result, notes, created_at, observed_has_pledge, observed_status, observed_date, observed_amount, observed_other"
          )
          .eq("short_code", String(short))
          .maybeSingle();

        // 2) si no hay short_code, probar si es un UUID completo
        if (!r && (!e1 || e1?.code === "PGRST116")) {
          const looksUuid = String(short).length === 36 && String(short).includes("-");
          if (looksUuid) {
            const res2 = await supabase
              .from("dia_requests")
              .select(
                "id, short_code, dominio, tienda, franquiciado, type, requester_email, status, result, notes, created_at, observed_has_pledge, observed_status, observed_date, observed_amount, observed_other"
              )
              .eq("id", String(short))
              .maybeSingle();
            r = res2.data || null;
          }
        }

        if (!r) throw new Error("No encontramos el pedido solicitado.");

        setReq(r);

        // Archivos vinculados
        const { data: fl, error: efl } = await supabase
          .from("dia_request_files")
          .select("id, path, filename, size_kb, content_type")
          .eq("request_id", r.id)
          .order("id", { ascending: true });

        if (efl) throw efl;

        // firmar URLs de descarga (1 hora)
        const signed = [];
        for (const f of fl || []) {
          const { data: s, error: se } = await supabase.storage
            .from("dia-requests")
            .createSignedUrl(f.path, 3600);
          signed.push({
            ...f,
            url: s?.signedUrl || null,
          });
        }
        setFiles(signed);
      } catch (err) {
        setError(err.message || "Error al cargar el pedido.");
      } finally {
        setLoading(false);
      }
    })();
  }, [short]);

  // --- UI ---
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "48px 24px",
        background:
          "linear-gradient(135deg, rgba(10,30,60,1) 0%, rgba(10,45,80,1) 40%, rgba(12,60,100,1) 100%)",
        color: "white",
      }}
    >
      <div style={{ width: "100%", maxWidth: 960 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>Pedido Día</h2>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            Resultado y detalle — {loading ? "" : req?.short_code || (req?.id || "").slice(0, 8)}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          {loading && <div>Cargando…</div>}
          {error && <div style={{ color: "#ffb4b4" }}>{error}</div>}

          {!loading && !error && req && (
            <>
              {/* Cabecera */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {req.dominio || "—"} — {req.type || "—"}
                </div>
                <Badge kind="status" value={req.status || "EN_CURSO"} />
                <Badge kind="result" value={req.result || "PENDIENTE"} />
              </div>

              {/* Meta */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Meta label="Franquiciado" value={req.franquiciado || "—"} />
                <Meta label="Tienda" value={req.tienda || "—"} />
                <Meta label="Analista (email)" value={req.requester_email || "—"} />
                <Meta label="Creado" value={created} />
              </div>

              {/* Observado / Prenda (si aplica) */}
              {(req.result === "OBSERVADO" || req?.observed_has_pledge) && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px dashed rgba(255,210,90,0.5)",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Detalle de observación</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Meta label="Estado prenda" value={req.observed_status || "—"} />
                    <Meta
                      label="Fecha de inscripción"
                      value={
                        req.observed_date ? new Date(req.observed_date).toLocaleDateString() : "—"
                      }
                    />
                    <Meta label="Monto" value={req.observed_amount ?? "—"} />
                    <Meta label="Otros" value={req.observed_other || "—"} />
                  </div>
                </div>
              )}

              {/* Notas visibles */}
              {req.notes && (
                <div style={{ marginTop: 8, marginBottom: 12 }}>
                  <div style={{ opacity: 0.9, marginBottom: 4 }}>Notas</div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      padding: 10,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {req.notes}
                  </div>
                </div>
              )}

              {/* Archivos */}
              <div style={{ marginTop: 8 }}>
                <div style={{ opacity: 0.9, marginBottom: 6 }}>Archivos</div>
                {files.length === 0 ? (
                  <div style={{ opacity: 0.7 }}>No hay archivos adjuntos.</div>
                ) : (
                  <ul style={{ marginTop: 4 }}>
                    {files.map((f) => (
                      <li key={f.id || f.path} style={{ marginBottom: 6 }}>
                        {f.filename} {f.size_kb ? `(${f.size_kb} KB)` : ""}
                        {f.url ? (
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              marginLeft: 8,
                              padding: "4px 8px",
                              borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.25)",
                              background: "rgba(255,255,255,0.08)",
                              color: "white",
                              textDecoration: "none",
                            }}
                          >
                            Descargar
                          </a>
                        ) : (
                          <span style={{ marginLeft: 8, opacity: 0.7 }}>
                            (sin permiso para descargar)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 14 }}>
          <a
            href="/dia"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              textDecoration: "none",
            }}
          >
            ← Volver a pedidos
          </a>
        </div>

        <div style={{ opacity: 0.6, fontSize: 12, marginTop: 24 }}>© 2025 SAKI</div>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}
