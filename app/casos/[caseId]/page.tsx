// app/casos/[caseId]/page.tsx
import { headers } from "next/headers";

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

export default async function CasePage({
  params,
}: {
  params: { caseId: string };
}) {
  const base = getBaseUrl();

  let items: DocItem[] = [];
  try {
    const res = await fetch(`${base}/api/casos/${params.caseId}/documents`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      items = data.items || [];
    }
  } catch (err) {
    console.error("Error cargando documentos:", err);
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Expediente {params.caseId}</h1>
      {items.length === 0 ? (
        <p>No hay documentos para este caso.</p>
      ) : (
        <ul>
          {items.map((doc) => (
            <li key={doc.id}>
              {doc.kind} - {new Date(doc.created_at).toLocaleString()}{" "}
              <a
                href={`/api/documentos/${doc.id}/download?redirect=1`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Descargar
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
