import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Casos() {
  const [casos, setCasos] = useState([]);

  useEffect(() => {
    const fetchCasos = async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, case_code, type, status")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando casos:", error);
      } else {
        setCasos(data);
      }
    };

    fetchCasos();
  }, []);

  return (
    <div>
      <h1>Listado de Casos</h1>
      <ul>
        {casos.map((c) => (
          <li key={c.id}>
            <Link href={`/casos/${c.id}`}>
              <b>{c.case_code}</b> - {c.type} - {c.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
