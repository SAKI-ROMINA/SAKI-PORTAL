// app/casos/page.tsx
import Link from "next/link";
import { headers } from "next/headers";

type CaseItem = {
  id: string;
  title: string | null;
  created_at: string;
};

function getBaseUrl() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export default async function CasesPage() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/casos`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <main style={{ maxWidth: 880, margin: "32px auto", padding: "0 16px" }}>
        <h1>Mis Casos</h1>
        <p style={{ color: "crimson" }}>
          Error al cargar casos (HTTP {res.status})
        </p>
      </main>
    );
  }

  const data = await res.json();
  if (!data?.ok) {
    return (
      <main style={{ maxWidth: 880, margin: "32px auto", padding: "0 16px" }}>
        <h1>Mis Casos</h1>
        <p style={{ color: "crimson" }}>
          {data?.error ?? "No se pudieron cargar los casos"}
        </p>
      </main>
    );
  }

  const cases: CaseItem[] = data.items || [];

  return (
    <main style={{ maxWidth: 880, margin: "32px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 16 }}>Mis Casos</h1>

      {cases.length === 0 ? (
        <p>No tenés casos registrados todavía.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cases.map((c) => (
            <li key={c.id} style={{ marginBottom: 12 }}>
              <Link
                href={`/casos/${c.id}`}
                style={{
                  display: "block",
                  padding: "12px 16px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  textDecoration: "none",
                  background: "#fafafa",
                }}
              >
                <strong>{c.title || "Caso sin título"}</strong>
                <br />
                <span style={{ color: "#555", fontSize: 14 }}>
                  Creado: {new Date(c.created_at).toLocaleDateString("es-AR")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
