// app/casos/[caseId]/page.tsx
import React from "react";

export default function CasePage({
  params,
}: {
  params: { caseId: string };
}) {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Detalles del Caso</h1>
      <p>ID del caso: <strong>{params.caseId}</strong></p>
      <p>
        Esta página está conectada al <code>RootLayout</code> y debería
        compilar correctamente.
      </p>
    </div>
  );
}
