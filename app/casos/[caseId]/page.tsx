"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DocumentItem {
  id: string;
  kind: string;
  created_at: string;
}

export default function CasePage({ params }: { params: { caseId: string } }) {
  const { caseId } = params;
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch(`/api/casos/${caseId}/documents`);
        const data = await res.json();

        if (!data.ok) {
          throw new Error(data.error || "Error al cargar documentos");
        }

        setDocuments(data.items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [caseId]);

  if (loading) return <p>Cargando documentos...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Expediente {caseId}</h1>
      <h2>Documentos</h2>

      {documents.length === 0 ? (
        <p>No hay documentos cargados.</p>
      ) : (
        <ul>
          {documents.map((doc) => (
            <li key={doc.id}>
              <strong>{doc.kind}</strong> ({new Date(doc.created_at).toLocaleString()}){" "}
              <Link href={`/api/documentos/${doc.id}/download?redirect=1`}>
                Descargar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

