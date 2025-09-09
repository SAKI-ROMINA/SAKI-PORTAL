// app/casos/[caseId]/page.tsx
import Link from "next/link";

type DocItem = {
  id: string;
  kind: string | null;
  created_at: string; // viene como ISO string
};

async function getDocuments(caseId: string) {
  // Llamamos al endpoint que ya creaste:
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    // fallback por si no está definida en local: lo arma Next en runtime
    (typeof window === "undefined" ? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "" : "");

  const url = `${base}/api/casos/${caseId}/documents`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error al cargar documentos (${res.status})`);
  const data = await res.json();
  return (data.items as DocItem[]) || [];
}

export default async function CasePage(props: { params: { caseId: string } }) {
  const { caseId } = props.params;

  let items: DocItem[] = [];
  let error: string | null = null;

  try {
    items = await getDocuments(caseId);
  } catch (e: any) {
    error = e?.message ?? "Error desconocido";
  }

  return (
    <main style={{ maxWidth: 880, margin: "32px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Documentos del caso</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Caso: <code>{caseId}</code>
      </p>

      {error ? (
        <div style={{ padding: 12, border: "1px solid #f33", color: "#b00", borderRadius: 8 }}>
          No se pudieron cargar los documentos. {error}
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: 12, border: "1px solid #ccc", borderRadius: 8 }}>
          No hay documentos cargados para este caso.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Tipo</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Fecha</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((doc) => {
              const fecha = new Date(doc.created_at).toLocaleString();
              const downloadUrl = `/api/documentos/${doc.id}/download?redirect=1`;
              return (
                <tr key={doc.id}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
                    {doc.kind || "Documento"}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>{fecha}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
                    <Link href={downloadUrl}>Descargar</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
