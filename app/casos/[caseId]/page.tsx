// app/casos/[caseId]/page.tsx
export const dynamic = "force-dynamic"; // evitá caché/SSG

import * as React from "react";

// ------- Componente CLIENTE (fetch en el navegador) -------
function CaseClient({ caseId }: { caseId: string }) {
  "use client";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<
    Array<{ id: string; kind: string | null; created_at: string | null }>
  >([]);

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        // Ruta relativa: corre en el navegador (no en SSR)
        const res = await fetch(`/api/casos/${caseId}/documents`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error ?? `HTTP ${res.status}`);
        }
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e: any) {
        setError(e?.message ?? "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [caseId]);

  if (loading) return <p>Cargando documentos…</p>;
  if (error) return <p style={{ color: "crimson" }}>Error: {error}</p>;
  if (items.length === 0) return <p>No hay documentos para este caso.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items.map((doc) => {
        const fecha = doc?.created_at
          ? new Date(doc.created_at).toLocaleString("es-AR")
          : "—";
        const href = `/api/documentos/${doc.id}/download?redirect=1`;
        return (
          <li key={doc.id} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: "10px 12px",
                background: "#fafafa",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{doc.kind || "Documento"}</div>
                <div style={{ color: "#666", fontSize: 13 }}>Fecha: {fecha}</div>
              </div>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  textDecoration: "none",
                  background: "#fff",
                  fontSize: 14,
                  color: "#0070f3",
                }}
              >
                Descargar
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ------- Server component simple que solo renderiza el cliente -------
export default function CasePage({ params }: { params: { caseId: string } }) {
  return (
    <main
      style={{
        maxWidth: 880,
        margin: "32px auto",
        padding: "0 16px",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Documentos del caso</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Caso: <code>{params.caseId}</code>
      </p>
      <CaseClient caseId={params.caseId} />
    </main>
  );
}
