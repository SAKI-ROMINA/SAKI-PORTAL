// app/casos/[caseId]/page.tsx
import { headers } from "next/headers";
import Link from "next/link";

type DocItem = {
  id: string;
  kind: string | null;
  created_at: string;
};

function getBaseUrl() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export default async function CasePage({ params }: { params: { caseId: string } }) {
  const base = getBaseUrl();

  // Llamamos a la API de documentos por caseId
  const res = await fetch(`${base}/api/casos/${params.caseId}/documents`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return <main style={{ padding: 16 }}>Error al cargar documentos (HTTP {res.status})</main>;
  }

  const data = await res.json();
  if (!data?.ok) {
    return <main style={{ padding: 16 }}>Error: {data?.error ?? "No se pudieron cargar documentos"}</main>;
  }

  const docs: DocItem[] = data.items || [];

  return (
    <main style={{ maxWidth: 880, margin: "32px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 16 }}>Documentos del caso</h1>
      {docs.length === 0 ? (
        <p>No hay documentos cargados para este caso.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {docs.map((d) => (
            <li key={d.id} style={{ marginBottom: 12 }}>
              <Link
                href={`/api/documentos/${d.id}/download?redirect=1`}
                style={{
                  display: "block",
                  padding: "12px 16px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  textDecoration: "none",
                  background: "#fafafa",
                }}
              >
                <strong>{d.kind ?? "Documento"}</strong>
                <br />
                <span style={{ color: "#555", fontSize: 14 }}>
                  Subido: {new Date(d.created_at).toLocaleDateString("es-AR")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
