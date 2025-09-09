// app/casos/layout.tsx
import React from "react";

export const metadata = {
  title: "SAKI - Casos",
  description: "Sección de casos",
};

export default function CasosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section style={{ padding: 16 }}>
      {children}
    </section>
  );
}
