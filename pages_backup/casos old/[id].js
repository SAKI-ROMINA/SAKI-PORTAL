// pages/casos/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "../../lib/supabaseClient";

export default function DetalleCaso() {
  const router = useRouter();
  const { id } = router.query;

  const [caso, setCaso] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [dia, setDia] = useState(null); // <- pedido DIA si existe

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      // Traer caso
      const { data: casoData, error: casoError } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

      if (casoError) {
        console.error("Error cargando caso:", casoError);
      } else {
        setCaso(casoData);
      }

      // Traer documentos del caso
      const { data: docsData, error: docsError } = await supabase
        .from("documents")
        .select("id, kind, file_url, created_at")
        .eq("case_id", id)
        .order("created_at", { ascending: false });

      if (docsError) {
        console.error("Error cargando documentos:", docsError);
      } else {
        setDocumentos(docsData || []);
      }

      // Traer pedido DIA si existe
      const { data: diaData, error: diaError } = await supabase
        .from("dia_requests")
        .select("*")
        .eq("case_id", id)
        .maybeSingle();

      if (diaError) {
        console.error("Error cargando dia_requests:", diaError);
      } else {
        setDia(diaData);
      }
    };

    fetchData();
  }, [id]);

  if (!caso) return <p style={{ padding: 24 }}>Cargando caso...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Detalle del Caso</h1>

      <p>
        <b>Código:</b> {caso.case_code}
      </p>
      <p>
        <b>Tipo:</b> {caso.type}
      </p>
      <p>
        <b>Estado:</b> {caso.status}
      </p>

      {/* Sección DIA */}
      <div style={{ margin: "24px 0", padding: 16, border: "1px solid #234", borderRadius: 8 }}>
        <h2>PEDIDO DIA</h2>

        {dia ? (
          <div style={{ lineHeight: 1.6 }}>
            <p>
              <b>Estado:</b> {dia.status}
            </p>
            {dia.requester_email && (
              <p>
                <b>Solicitante:</b> {dia.requester_email}
              </p>
            )}
            {dia.franquiciado && (
              <p>
                <b>Franquiciado:</b> {dia.franquiciado}
              </p>
            )}
            {dia.titular_dominio && (
              <p>
                <b>Titular dominio:</b> {dia.titular_dominio}
              </p>
            )}
            {dia.notes && (
              <p>
                <b>Notas:</b> {dia.notes}
              </p>
            )}

            <Link href={`/dia/nuevo?case_id=${id}`}>
              <button>Editar pedido DIA</button>
            </Link>
          </div>
        ) : (
          <div>
            <p>No hay pedido DIA cargado.</p>
            <Link href={`/dia/nuevo?case_id=${id}`}>
              <button>Cargar pedido DIA</button>
            </Link>
          </div>
        )}
      </div>

      {/* Documentos */}
      <h2>Documentos</h2>
      <ul>
        {documentos.length > 0 ? (
          documentos.map((doc) => (
            <li key={doc.id}>
              {doc.kind} —{" "}
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                Ver archivo
              </a>{" "}
              ({new Date(doc.created_at).toLocaleDateString()})
            </li>
          ))
        ) : (
          <p>No hay documentos cargados.</p>
        )}
      </ul>
    </div>
  );
}
