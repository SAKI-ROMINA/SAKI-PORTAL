import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function FormDia() {
  const router = useRouter();
  const caseId = router.query.case_id;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    requester_email: "",
    franquiciado: "",
    titular_dominio: "",
    status: "EN_CURSO",
  });

  const [notes, setNotes] = useState([]); // 🔹 lista de notas
  const [newNote, setNewNote] = useState(""); // 🔹 nota nueva a escribir

  // 🔹 Cargar notas existentes
  useEffect(() => {
    if (!caseId) return;
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("dia_notes")
        .select("id, content, created_at, author_id")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando notas:", error);
      } else {
        setNotes(data);
      }
    };
    fetchNotes();
  }, [caseId]);

  // 🔹 Insertar nueva nota
  const addNote = async () => {
    if (!newNote.trim()) return;
    const { data, error } = await supabase
      .from("dia_notes")
      .insert([{ case_id: caseId, content: newNote }])
      .select();

    if (error) {
      console.error("Error agregando nota:", error);
    } else {
      setNotes([data[0], ...notes]); // agregar la nueva al inicio
      setNewNote(""); // limpiar campo
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Nuevo pedido DIA</h1>
      <p><b>Caso:</b> {caseId}</p>

      {/* Formulario base */}
      <div>
        <input
          type="email"
          placeholder="Email del solicitante"
          value={form.requester_email}
          onChange={(e) => setForm({ ...form, requester_email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Franquiciado"
          value={form.franquiciado}
          onChange={(e) => setForm({ ...form, franquiciado: e.target.value })}
        />
        <input
          type="text"
          placeholder="Titular de dominio"
          value={form.titular_dominio}
          onChange={(e) => setForm({ ...form, titular_dominio: e.target.value })}
        />
      </div>

      {/* 🔹 Notas */}
      <h2>Notas</h2>
      <div>
        <textarea
          placeholder="Escribir nueva nota..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button onClick={addNote}>Agregar Nota</button>
      </div>

      <ul>
        {notes.length > 0 ? (
          notes.map((note) => (
            <li key={note.id}>
              <b>{new Date(note.created_at).toLocaleString()}:</b> {note.content}
            </li>
          ))
        ) : (
          <p>No hay notas aún.</p>
        )}
      </ul>
    </div>
  );
}

