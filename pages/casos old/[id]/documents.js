// pages/casos/[id]/documents.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";

// ⚙️ Config
const BUCKET = "saki-cases";
const DOC_TYPES = [
  "Informe de Dominio",
  "Certificado de Dominio",
  "Informe Infracciones",
  "Cedula identificacion (ex verde)",
  "Cedula autorizado (Ex azul)",
  "Constancia asignacion de titulo",
  "Titulo del automotor",
  "DNI del titular",
  "DNI del comprador",
  "Prenda",
  "ST 08",
  "Seguro vigente",
  "Otros",
];

export default function CaseDocuments() {
  const router = useRouter();
  const { id } = router.query; // case_id
  const fileRef = useRef(null);

  // UI
  const [busy, setBusy] = useState(true);
  const [flash, setFlash] = useState(null);

  // Case + docs
  const [caseRow, setCaseRow] = useState(null);
  const [docs, setDocs] = useState([]);

  // Upload state
  const [kind, setKind] = useState("");
  const [uploading, setUploading] = useState(false);

  // Filtros
  const [typeFilter, setTypeFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");

  // Fetch case + docs
  useEffect(() => {
    if (!id) return;
    (async () => {
      setBusy(true);
      setFlash(null);
      // sesión (para saber user_id)
      const { data: s, error: sErr } = await supabase.auth.getSession();
      if (sErr) {
        setFlash({ type: "error", text: sErr.message });
        setBusy(false);
        return;
      }
      const userId = s?.session?.user?.id ?? null;

      // caso
      const { data: cRow, error: cErr } = await supabase
        .from("cases")
        .select("id, case_code, type, status")
        .eq("id", id)
        .single();

      if (cErr) {
        setFlash({ type: "error", text: cErr.message });
        setBusy(false);
        return;
      }
      setCaseRow(cRow);

      // docs
      await loadDocs();

      setBusy(false);

      async function loadDocs() {
        const { data, error } = await supabase
          .from("documents")
          .select("id, case_id, kind, file_url, uploaded_by, created_at")
          .eq("case_id", id)
          .order("created_at", { ascending: false });

        if (error) setFlash({ type: "error", text: error.message });
        else setDocs(data || []);
      }
    })();
  }, [id]);

  // Derived filtered list
  const filtered = useMemo(() => {
    let list = [...docs];
    if (typeFilter) list = list.filter((d) => d.kind === typeFilter);
    if (from) list = list.filter((d) => new Date(d.created_at) >= new Date(from));
    if (to) list = list.filter((d) => new Date(d.created_at) <= new Date(to + "T23:59:59"));
    if (q) {
      const s = q.toLowerCase();
      list = list.filter(
        (d) =>
          (d.kind || "").toLowerCase().includes(s) ||
          (d.file_url || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [docs, typeFilter, from, to, q]);

  // Helpers
  function flashOk(text) {
    setFlash({ type: "ok", text });
    setTimeout(() => setFlash(null), 3000);
  }
  function flashErr(text) {
    setFlash({ type: "error", text });
  }

  // Upload
  async function handleUpload() {
    if (!id) return;
    const file = fileRef.current?.files?.[0];
    if (!file) return flashErr("Seleccioná un archivo.");
    if (!kind) return flashErr("Seleccioná un tipo de documento.");

    setUploading(true);
    setFlash(null);
    try {
      // ruta única: caseId/timestamp_filename
      const safeName = file.name.replace(/\s+/g, "_");
      const path = `${id}/${Date.now()}_${safeName}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;

      // public URL
      const { data: pub, error: urlErr } = await supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);
      if (urlErr) throw urlErr;

      // who am i
      const { data: s } = await supabase.auth.getSession();
      const userId = s?.session?.user?.id ?? null;

      // insert table row
      const { error: insErr } = await supabase.from("documents").insert({
        case_id: id,
        kind,
        file_url: pub?.publicUrl || null,
        uploaded_by: userId,
      });
      if (insErr) throw insErr;

      // refresh
      const { data, error } = await supabase
        .from("documents")
        .select("id, case_id, kind, file_url, uploaded_by, created_at")
        .eq("case_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocs(data || []);
      if (fileRef.current) fileRef.current.value = "";
      setKind("");
      flashOk("Documento subido correctamente.");
    } catch (e) {
      flashErr(e.message || "Error subiendo el documento.");
    } finally {
      setUploading(false);
    }
  }

  // Delete
  async function handleDelete(doc) {
    if (!confirm("¿Eliminar este documento?")) return;
    setFlash(null);
    try {
      // extraer path relativo del bucket a partir de la URL pública
      // formato: .../object/public/<bucket>/<path>
      const m = doc.file_url.match(/\/object\/public\/[^/]+\/(.+)$/);
      const storagePath = m ? m[1] : null;

      if (storagePath) {
        await supabase.storage.from(BUCKET).remove([storagePath]);
      }

      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) throw error;

      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      flashOk("Documento eliminado.");
    } catch (e) {
      flashErr(e.message || "No se pudo eliminar.");
    }
  }

  // UI bits
  function Pill({ children }) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-white/10">
        {children}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1420] text-white">
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/10">
        <h1 className="text-3xl font-extrabold tracking-tight">SAKI</h1>
        <Link className="text-blue-300 hover:underline" href="/dashboard">
          Portal de Documentos
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold">Documentos del caso</h2>

        <p className="mt-2 text-sm text-white/70">
          Caso:{" "}
          <span className="font-mono">{id}</span>{" "}
          {caseRow?.case_code ? (
            <>
              {" | "}Código: <span className="font-mono">{caseRow.case_code}</span>
            </>
          ) : null}
        </p>

        {/* Upload card */}
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-xl font-semibold mb-3">Subir documento</h3>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              className="w-full md:w-1/3 rounded-md bg-white/10 border border-white/10 px-3 py-2 outline-none"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="">Seleccionar tipo de documento</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <input
              ref={fileRef}
              type="file"
              className="w-full md:w-1/2 rounded-md bg-white/10 border border-dashed border-white/20 px-3 py-2"
            />

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 font-medium"
            >
              {uploading ? "Subiendo..." : "Subir"}
            </button>
          </div>

          {flash && (
            <div
              className={`mt-3 rounded-md px-3 py-2 text-sm ${
                flash.type === "ok" ? "bg-emerald-600/20 text-emerald-200" : "bg-rose-600/20 text-rose-200"
              }`}
            >
              {flash.text}
            </div>
          )}
        </section>

        {/* Filtros */}
        <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-xl font-semibold mb-3">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select
              className="rounded-md bg-white/10 border border-white/10 px-3 py-2 outline-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="rounded-md bg-white/10 border border-white/10 px-3 py-2"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="date"
              className="rounded-md bg-white/10 border border-white/10 px-3 py-2"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />

            <input
              type="text"
              placeholder="Buscar (tipo o URL)"
              className="md:col-span-2 rounded-md bg-white/10 border border-white/10 px-3 py-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {}}
              className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm"
            >
              Aplicar
            </button>
            <button
              onClick={() => {
                setTypeFilter("");
                setFrom("");
                setTo("");
                setQ("");
              }}
              className="rounded-md bg-white/10 hover:bg-white/20 px-4 py-2 text-sm"
            >
              Limpiar
            </button>
          </div>
        </section>

        {/* Lista */}
        <section className="mt-8 rounded-xl border border-white/10 overflow-hidden">
          <div className="bg-white/5 px-4 py-3 font-semibold">Archivos</div>
          <div className="divide-y divide-white/10">
            <div className="grid grid-cols-12 px-4 py-2 text-sm text-white/60 bg-white/5">
              <div className="col-span-5 md:col-span-5">Tipo</div>
              <div className="col-span-3 md:col-span-3">Fecha</div>
              <div className="col-span-4 md:col-span-4">Acción</div>
            </div>

            {busy ? (
              <div className="px-4 py-6 text-white/70">Cargando…</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-6 text-white/70">No hay documentos.</div>
            ) : (
              filtered.map((d) => (
                <div key={d.id} className="grid grid-cols-12 px-4 py-3 items-center">
                  <div className="col-span-5 md:col-span-5">
                    <div className="font-medium">{d.kind}</div>
                    <div className="text-xs text-white/50 break-all">{d.file_url}</div>
                  </div>
                  <div className="col-span-3 md:col-span-3">
                    <Pill>{new Date(d.created_at).toLocaleString()}</Pill>
                  </div>
                  <div className="col-span-4 md:col-span-4 flex gap-2 flex-wrap">
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-sm"
                    >
                      Ver / Descargar
                    </a>
                    <button
                      onClick={() => handleDelete(d)}
                      className="rounded-md bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
