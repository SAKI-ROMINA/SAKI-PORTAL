// app/casos/[caseId]/page.tsx
import Link from "next/link";
import { headers } from "next/headers";

type DocItem = {
  id: string;
  kind: string | null;
  created_at: string;
};

function getBaseUrl() {
  // Construye la URL absoluta a partir de los headers (sirve en prod y local)
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export default async function CasePage({ params }: { params: { caseId: string } }) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/casos/${params.caseId}/documents`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ maxWidth: 880, margin: "32px auto", padding: "0 16px" }}>
        <h1>Documentos del caso</h1>
        <p style={{ color: "crimson" }}>
          Error al cargar documentos (HTTP {res.status})
        </p>
      </main>
    );
  }

  const data = await res.json();
  if (!data?.ok) {
    return (
      <main style={{ maxWidth: 880, margin: "32px auto", padding: "0 16px" }}>
        <h1>Documentos del caso</h1>
        <p style={{ color: "crimson" }}>
          {data?.error ?? "No se pudo cargar"}
        </p>
      </main>
    );
  }

  const items: DocItem[] = data.items || [];

  return (
    <main style={{ maxWidth: 880, margin: "32px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Documentos del caso</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Caso: <code>{params.caseId}</code>
      </p>

      {items.length === 0 ? (
        <div style={{ padding: 12, border: "1px solid #ccc", borderRadius: 8 }}>
          No hay documentos cargados para este caso.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Tipo</th>
              <th style={th}>Fecha</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((doc) => (
              <tr key={doc.id}>
                <td style={td}>{doc.kind || "Documento"}</td>
                <td style={td}>{new Date(doc.created_at).toLocaleString("es-AR")}</td>
                <td style={{ ...td, textAlign: "right" }}>
                  <Link href={`/api/documentos/${doc.id}/download?redirect=1`}>
                    Descargar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #eee",
  fontWeight: 600,
  fontSize: 14,
  color: "#333",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: 14,
  color: "#222",
};
