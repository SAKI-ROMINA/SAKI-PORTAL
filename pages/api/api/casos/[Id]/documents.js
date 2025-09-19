import { createClient } from "@supabase/supabase-js";

export async function getServerSideProps({ params }) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const id = params.id;
    const bucket = "saki-cases";
    const prefix = `${id}/`;

    // 1) Listar archivos
    const { data: list, error: listErr } = await supabase
      .storage
      .from(bucket)
      .list(prefix, { limit: 200, sortBy: { column: "name", order: "asc" } });

    if (listErr) {
      return { props: { items: [], error: `List error: ${listErr.message}`, id } };
    }

    // 2) Firmar URLs
    const items = [];
    for (const f of list ?? []) {
      const { data: signed, error: signErr } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(`${prefix}${f.name}`, 600);
      if (signErr) {
        return { props: { items: [], error: `Sign error: ${signErr.message}`, id } };
      }
      items.push({ name: f.name, url: signed.signedUrl });
    }

    return { props: { items, error: null, id } };
  } catch (e) {
    return { props: { items: [], error: `Exception: ${e?.message ?? e}`, id: params.id } };
  }
}

export default function DocumentsPage({ items = [], error, id }) {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>SAKI — Documentos del caso</h1>

      <p style={{ color: "#666" }}>
        Caso: <code>{id}</code>
      </p>

      {error ? (
        <p style={{ color: "crimson" }}>Error: {error}</p>
      ) : items.length === 0 ? (
        <p>No hay documentos para este caso.</p>
      ) : (
        <ul>
          {items.map((it) => (
            <li key={it.url} style={{ marginBottom: 8 }}>
              <a href={it.url} download>{it.name}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
