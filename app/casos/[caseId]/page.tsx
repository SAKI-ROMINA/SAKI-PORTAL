// app/casos/[caseId]/page.tsx
export default async function CasePage({ params }: { params: { caseId: string } }) {
  let status = 0;
  let err: string | null = null;

  try {
    const res = await fetch(`/api/casos/${params.caseId}/documents`, { cache: "no-store" });
    status = res.status;
  } catch (e: any) {
    err = e?.message ?? "Error desconocido";
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui,sans-serif" }}>
      <h1>Prueba fetch</h1>
      <p>Marcador: B1</p>
      <p>HTTP status: <strong>{status}</strong></p>
      {err && <p style={{color:"crimson"}}>Error: {err}</p>}
    </main>
  );
}
