// app/casos/[caseId]/page.tsx
export default function CasePage({ params }: { params: { caseId: string } }) {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui,sans-serif" }}>
      <h1>Ruta OK</h1>
      <p>CaseId: <code>{params.caseId}</code></p>
      <p>Marcador: A1</p>
    </main>
  );
}
