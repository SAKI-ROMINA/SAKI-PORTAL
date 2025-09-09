// app/casos/[caseId]/page.tsx

type DocItem = {
  id: string;
  kind: string | null;
  created_at: string | null;
};

export default async function CasePage({ params }: { params: { caseId: string } }) {
  // 1) Llamamos a la API con ruta RELATIVA (más confiable en Next SSR)
  let items: DocItem[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await fetch(`/api/casos/${params.caseId}/documents`, {
      cache: "no-store",
      // next: { revalidate: 0 }, // opcional
    });

    if (!res.ok) {
      errorMsg = `Error HTTP ${res.status}`;
    } else {
      const data = await res.json();
      if (!data?.ok) {
        errorMsg = data?.error ?? "Respuesta no OK de la API";
      } else {
        items = Array.isArray(data.items) ? data.items : [];
      }
    }
  } catch (e: any) {
    errorMsg = e?.message ?? "Error inesperado llamando a la API";
  }

  // 2) Render súper defensivo (nada de quedarse en blanco)
  return (
    <main style={{ maxWidth: 880, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Documentos del caso</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Caso: <code>{params.caseId}</code>
      </p>

      {errorMsg ? (
        <div style={{ padding: 12, border: "1px solid #f33", color: "#b00", borderRadius: 6 }}>
          <strong>No se pudieron cargar los documentos.</strong>
          <div style={{ marginTop: 6, fontSize: 13 }}>Detalle: {String(errorMsg)}</div>
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6 }}>
          No hay documentos para este caso.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((doc) => {
            const ts = doc?.created_at ? new Date(doc.created_at) : null;
            const fecha = ts && !isNaN(ts.valueOf()) ? ts.toLocaleString("es-AR") : "—";
            const label = doc?.kind || "Documento";
            const href = `/api/documentos/${doc?.id}/download?redirect=1`;

            return (
              <li key={doc?.id} style={{ marginBottom: 10 }}>
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
                    <div style={{ fontWeight: 600 }}>{label}</div>
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
      )}
    </main>
  );
}
