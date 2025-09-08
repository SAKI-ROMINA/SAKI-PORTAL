// app/casos/[caseId]/page.tsx
import Link from "next/link";

type Doc = {
  id: string;
  kind: string;
  created_at: string;
};

// ---- Helper: base URL para fetch del lado servidor ----
function getBaseUrl() {
  // 1) Si definís la URL pública, se usa esa
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // 2) En Vercel, VERCEL_URL viene como dominio sin protocolo
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // 3) Local
  return "http://localhost:3000";
}

async function getDocuments(caseId: string): Promise<Doc[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/casos/${caseId}/documents`, {
    // No-cache para ver cambios al instante
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || "No se pudo obtener la lista");
  }
  return data.items as Doc[];
}

export default async function CaseDocumentsPage({
  params,
}: {
  params: { caseId: string };
}) {
  const docs = await getDocuments(params.caseId);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Documentos del caso</h1>

      {docs.length === 0 ? (
        <p className="text-gray-600">Este caso aún no tiene documentos.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border rounded-md">
          {docs.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between p-4 gap-4"
            >
              <div>
                <div className="font-medium">{d.kind}</div>
                <div className="text-sm text-gray-500">
                  {new Date(d.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Descarga directa usando tu API */}
              <Link
                href={`/api/documentos/${d.id}/download?redirect=1`}
                prefetch={false}
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Descargar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
