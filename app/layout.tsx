// app/layout.tsx
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "SAKI",
  description: "Portal de clientes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
