import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import {
  Search,
  ShieldCheck,
  Bell,
  MoreVertical,
  Clock3,
  AlertCircle,
  CheckCircle2,
  History,
  Paperclip,
  MessageSquareText,
  Printer,
} from "lucide-react";

function onlyDigits(value) {
  return (value || "").toString().replace(/\D/g, "");
}

function formatCuit(value) {
  const digits = onlyDigits(value);

  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
}

function getStatusSummary(status) {
  const value = (status || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!value) return "Pendiente de envío";

  if (value === "pendiente de envio") return "Pendiente de envío";
  if (value === "en curso") return "En curso";
  if (value === "anulada") return "Anulada";
  if (value === "observada") return "Observada";

  if (
    value === "inscripta" ||
    value === "retirada" ||
    value === "legajo cerrado" ||
    value === "disponible para retiro"
  ) {
    return "Inscripta";
  }

  return status || "Pendiente de envío";
}

function getStatusPillStyle(summary) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    border: "1px solid rgba(255,255,255,0.08)",
    whiteSpace: "nowrap",
  };

  switch (summary) {
        case "Pendiente de envío":
      return {
        ...base,
        background: "rgba(245, 158, 11, 0.16)",
        color: "#fde68a",
        border: "1px solid rgba(245, 158, 11, 0.30)",
      };
    case "Inscripta":
      return {
        ...base,
        background: "rgba(34,197,94,0.14)",
        color: "#bbf7d0",
        border: "1px solid rgba(34,197,94,0.24)",
      };

    case "Observada":
      return {
        ...base,
        background: "rgba(245,158,11,0.14)",
        color: "#fde68a",
        border: "1px solid rgba(245,158,11,0.24)",
      };

    case "Anulada":
      return {
        ...base,
        background: "rgba(239,68,68,0.14)",
        color: "#fecaca",
        border: "1px solid rgba(239,68,68,0.24)",
      };

    default:
      return {
        ...base,
        background: "rgba(16,185,129,0.12)",
        color: "#d1fae5",
        border: "1px solid rgba(16,185,129,0.20)",
      };
  }
}

export default function DiaPrendasIndex() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPrenda, setSelectedPrenda] = useState(null);

  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const topMenuRef = useRef(null);

const [avisosOpen, setAvisosOpen] = useState(false);
const [avisosVistos, setAvisosVistos] = useState(false);

const [userProfile, setUserProfile] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);
const [canCreatePrenda, setCanCreatePrenda] = useState(false);

async function handleLogout() {
  await supabase.auth.signOut();
  window.location.href = "/dia/login";
}

  useEffect(() => {
    fetchPrendas();
  }, []);

  useEffect(() => {
  function handleClickOutside(event) {
    if (topMenuRef.current && !topMenuRef.current.contains(event.target)) {
      setTopMenuOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  async function fetchPrendas() {
    setLoading(true);

    const { data, error } = await supabase
      .from("dia_request_prendas")
      .select(`
        id,
        tienda,
        frq,
        frq_cuit,
        dominio,
        titular_dominio,
        titular_cuit,
        estado,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando prendas:", error);
      setRows([]);
    } else {
      setRows(data || []);
    }

    setLoading(false);
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qDigits = onlyDigits(search);

    if (!q && !qDigits) return rows;

    return rows.filter((row) => {
      const summary = getStatusSummary(row.estado);

      const textValues = [
        row.tienda,
        row.frq,
        formatCuit(row.frq_cuit),
        row.dominio,
        row.titular_dominio,
        formatCuit(row.titular_cuit),
        row.estado,
        summary,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      const digitValues = [
        row.frq_cuit,
        row.titular_cuit,
      ]
        .filter(Boolean)
        .map((value) => onlyDigits(value));

      const matchesText = q
        ? textValues.some((value) => value.includes(q))
        : false;

      const matchesDigits = qDigits
        ? digitValues.some((value) => value.includes(qDigits))
        : false;

      return matchesText || matchesDigits;
    });
  }, [rows, search]);

  const hasSearch = search.trim() !== "";

const noSearchResults =
  !loading && hasSearch && filteredRows.length === 0;

  const totalPrendas = rows.length;

const totalEnCurso = rows.filter((row) => {
  const summary = getStatusSummary(row.estado);
  return summary === "En proceso";
}).length;

const totalObservadas = rows.filter((row) => {
  const summary = getStatusSummary(row.estado);
  return summary === "Observada";
}).length;

const totalInscriptas = rows.filter((row) => {
  const summary = getStatusSummary(row.estado);
  return summary === "Inscripta";
}).length;

const totalAvisosPrendas = totalEnCurso + totalObservadas;

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <section style={heroStyle}>
  <div>
    <div style={eyebrowStyle}>MANAGEMENT &amp; TRACKING</div>

    <h1 style={titleStyle}>
      Prendas
      <span
        style={{
          color: "#8fb9e8",
          fontWeight: 500,
          margin: "0 7px",
        }}
      >
        |
      </span>
      <span
        style={{
          color: "#e6f0ff",
          fontWeight: 650,
        }}
      >
        M&amp;T
      </span>
    </h1>

    <p style={subtitleStyle}>
      Gestión, seguimiento e inscripción de prendas registrales.
    </p>
  </div>

  <div style={prendasTopAreaStyle}>
  <div style={prendasTopIconsStyle}>
    <div style={prendasTopMenuWrapperStyle}>
      <button
        type="button"
        style={prendasTopIconButtonStyle}
        onClick={() => {
          setAvisosOpen((prev) => !prev);
          setTopMenuOpen(false);
          setAvisosVistos(true);
        }}
        title="Avisos del módulo"
      >
        <Bell size={17} />
        {totalAvisosPrendas > 0 && !avisosVistos && (
          <span style={prendasAvisosBadgeStyle}>{totalAvisosPrendas}</span>
        )}
      </button>

      {avisosOpen && (
        <div style={prendasAvisosDropdownStyle}>
          <div style={prendasAvisosHeaderStyle}>Avisos del módulo</div>

          <button
            type="button"
            style={prendasAvisoItemStyle}
            onClick={() => {
              setSearch("en proceso");
              setAvisosOpen(false);
            }}
          >
            <span style={{ ...prendasAvisoDotStyle, background: "#3b82f6" }} />
            <span>
              <strong style={prendasAvisoTitleStyle}>Prendas en curso</strong>
              <small style={prendasAvisoTextStyle}>
                Trámites pendientes de gestión o seguimiento.
              </small>
            </span>
          </button>

          <button
            type="button"
            style={prendasAvisoItemStyle}
            onClick={() => {
              setSearch("observada");
              setAvisosOpen(false);
            }}
          >
            <span style={{ ...prendasAvisoDotStyle, background: "#f8c744" }} />
            <span>
              <strong style={prendasAvisoTitleStyle}>Prendas observadas</strong>
              <small style={prendasAvisoTextStyle}>
                Trámites que requieren revisión o subsanación.
              </small>
            </span>
          </button>

          <div style={prendasTopDropdownDividerStyle} />

          <button
            type="button"
            style={prendasAvisosFooterStyle}
            onClick={() => {
              setSearch("");
              setAvisosOpen(false);
            }}
          >
            Ver todas las prendas →
          </button>
        </div>
      )}
    </div>

    <div style={prendasTopMenuWrapperStyle}>
      <button
        type="button"
        style={prendasTopIconButtonStyle}
        onClick={() => {
          setTopMenuOpen((prev) => !prev);
          setAvisosOpen(false);
        }}
        title="Opciones"
      >
        <MoreVertical size={17} />
      </button>

      {topMenuOpen && (
        <div style={prendasTopDropdownStyle}>
          
          <button
            type="button"
            style={prendasTopDropdownItemStyle}
            onClick={() => {
  setTopMenuOpen(false);

  const mensaje = encodeURIComponent(
    "Hola SAKI, quiero reportar un inconveniente en el Portal Día.\n\nMódulo: Informes\nDetalle:"
  );

  window.open(`https://wa.me/5491157714212?text=${mensaje}`, "_blank");
}}
          >
            Reportar inconveniente
          </button>

          <div style={prendasTopDropdownDividerStyle} />

          <button
            type="button"
            style={prendasTopDropdownDangerItemStyle}
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  </div>

{canCreatePrenda && (
  <Link href="/dia/prendas/nueva" style={primaryButtonStyle}>
    + Nueva prenda
  </Link>
)}
</div>
</section>

<section style={searchCardStyle}>
  <div style={searchHeaderStyle}>
    <div>
      <h2 style={sectionTitleStyle}>Buscador</h2>
      <p style={sectionTextStyle}>
        Buscá por tienda, franquiciado, CUIT, dominio, garante / titular o estado.
      </p>
    </div>

    <button
  type="button"
  onClick={() => {
    window.location.href = "/dia";
  }}
  style={{
    ...resultBadgeStyle,
    cursor: "pointer",
  }}
  title="Volver al Workspace"
>
  ← Workspace
</button>
  </div>

  <div style={searchInputWrapStyle}>
    <Search size={22} />
    <input
      type="text"
      placeholder="Buscar por dominio, tienda, franquiciado, CUIT, titular o estado..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={searchInputStyle}
    />
  </div>
</section>
<section style={summaryGridStyle}>
  <SummaryCard
    icon={<ShieldCheck size={25} />}
    label="Prendas"
    value={totalPrendas}
    text="Solicitudes prendarias activas."
    active={search.trim() === ""}
    onClick={() => {
      setSearch("");
      setAvisosOpen(false);
      setTopMenuOpen(false);
    }}
  />

  <SummaryCard
    icon={<Clock3 size={25} />}
    label="En curso"
    value={totalEnCurso}
    text="Pendientes de gestión o seguimiento."
    active={search.trim().toLowerCase() === "en proceso"}
    onClick={() => {
      setSearch("en proceso");
      setAvisosOpen(false);
      setTopMenuOpen(false);
    }}
  />

  <SummaryCard
    icon={<AlertCircle size={25} />}
    label="Observadas"
    value={totalObservadas}
    text="Requieren revisión o subsanación."
    active={search.trim().toLowerCase() === "observada"}
    onClick={() => {
      setSearch("observada");
      setAvisosOpen(false);
      setTopMenuOpen(false);
    }}
  />

  <SummaryCard
    icon={<CheckCircle2 size={25} />}
    label="Inscriptas"
    value={totalInscriptas}
    text="Finalizadas o disponibles."
    active={search.trim().toLowerCase() === "inscripta"}
    onClick={() => {
      setSearch("inscripta");
      setAvisosOpen(false);
      setTopMenuOpen(false);
    }}
  />
</section>

        <div
  style={{
    ...tableCardStyle,
    display: selectedPrenda ? "none" : "block",
  }}
>
          {loading ? (
  <div style={emptyBoxStyle}>Cargando prendas...</div>
) : noSearchResults ? (
  <div style={noResultsBoxStyle}>
    <div style={noResultsTitleStyle}>
      No se encontraron prendas para{" "}
      <span style={{ color: "#eafd93" }}>"{search}"</span>.
    </div>

    <div style={noResultsTextStyle}>
      Probá con otro dato: dominio, tienda, franquiciado, CUIT, titular o estado.
    </div>
  </div>
) : rows.length === 0 ? (
  <div style={emptyBoxStyle}>No hay prendas cargadas todavía.</div>
) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
  <tr>
    <th style={{ ...thStyle, width: "12%" }}>Tienda</th>
    <th style={{ ...thStyle, width: "27%" }}>Franquiciado</th>
    <th style={{ ...thStyle, width: "17%" }}>CUIT</th>
    <th style={{ ...thStyle, width: "14%" }}>Dominio</th>
    <th style={{ ...thStyle, width: "14%" }}>Estado</th>
    <th style={{ ...thStyle, width: "10%" }}>Detalle</th>
  </tr>
</thead>

                <tbody>
                  {filteredRows.map((row) => {
                    const summary = getStatusSummary(row.estado);

                    return (
<tr
  key={row.id}
  style={{
    ...trStyle,
    cursor: "pointer",
    transition: "background 0.18s ease, box-shadow 0.18s ease",
  }}
  role="button"
  tabIndex={0}
  onMouseEnter={(e) => {
    e.currentTarget.style.background =
      "linear-gradient(90deg, rgba(37, 99, 235, 0.18), rgba(14, 165, 233, 0.08))";
    e.currentTarget.style.boxShadow =
      "inset 3px 0 0 rgba(96, 165, 250, 0.9)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.boxShadow = "none";
  }}
  onClick={() => {
    window.location.href = `/dia/prendas/detalle-preview-real?id=${row.id}`;
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.location.href = `/dia/prendas/detalle-preview-real?id=${row.id}`;
    }
  }}
>
                        <td style={tdStyle}>{row.tienda || "—"}</td>

                        <td style={tdStyle}>
                          <span style={frqTextStyle}>{row.frq || "—"}</span>
                        </td>

                        <td style={tdStyle}>
                          {formatCuit(row.frq_cuit) || "—"}
                        </td>

                        <td style={domainTdStyle}>
                          {row.dominio || "—"}
                        </td>

                        <td style={tdStyle}>
                          <span style={getStatusPillStyle(summary)}>
                            {summary.toUpperCase()}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <Link
                            href={`/dia/prendas/detalle-preview-real?id=${row.id}`}
                            style={detailButtonStyle}
                          >
                            DETALLE
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                            </table>
            </div>
          )}
        </div>

        {selectedPrenda && (
          <section style={quickDetailStyle}>
            <div style={quickDetailMainStyle}>
              <div>
                <div style={quickEyebrowStyle}>DETALLE DEL LEGAJO</div>

                <h2 style={quickTitleStyle}>
                  {selectedPrenda.dominio || "Sin dominio"}
                </h2>

                <p style={quickSubtitleStyle}>Prenda registral</p>

                <div style={quickTextStyle}>
                  <div>
                    Tienda {selectedPrenda.tienda || "—"} · Franquiciado{" "}
                    {selectedPrenda.frq || "—"}
                  </div>

                  <div>
                    CUIT {formatCuit(selectedPrenda.frq_cuit) || "—"} · Estado{" "}
                    {getStatusSummary(selectedPrenda.estado)}
                  </div>
                </div>
              </div>
            </div>

<div style={quickActionsStyle}>
  <div style={quickActionsRowStyle}>
    <MiniAction
  icon={<History size={18} />}
  text="Ver legajo"
  onClick={() => {
    window.location.href = `/dia/prendas/detalle-preview-real?id=${selectedPrenda.id}`;
  }}
/>

<MiniAction
  icon={<Paperclip size={18} />}
  text="Archivos adjuntos"
  onClick={() => {
    window.location.href = `/dia/prendas/detalle-preview-real?id=${selectedPrenda.id}`;
  }}
/>

<MiniAction
  icon={<MessageSquareText size={18} />}
  text="Notas"
  onClick={() => {
    window.location.href = `/dia/prendas/detalle-preview-real?id=${selectedPrenda.id}`;
  }}
/>
  </div>

  <div style={quickActionsRowStyle}>
    <MiniAction
      icon={<Printer size={18} />}
      text="Imprimir resumen"
      onClick={() => {
        window.location.href = `/dia/prendas/${selectedPrenda.id}?print=resumen`;
      }}
    />
  </div>
</div>
          </section>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, text, onClick, active }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        ...summaryCardStyle,
        cursor: onClick ? "pointer" : "default",
        border: active
          ? "1px solid rgba(96, 165, 250, 0.85)"
          : summaryCardStyle.border,
        boxShadow: active
          ? "0 18px 45px rgba(37, 99, 235, 0.22)"
          : summaryCardStyle.boxShadow,
      }}
    >
      <div style={summaryIconStyle}>{icon}</div>

      <div>
        <div style={summaryLabelStyle}>{label}</div>
        <div style={summaryValueStyle}>{value}</div>
        <div style={summaryTextStyle}>{text}</div>
      </div>
    </div>
  );
}

function MiniAction({ icon, text, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...miniActionStyle,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(26,78,154,0.20), transparent 28%), linear-gradient(180deg, #03122c 0%, #05152f 45%, #071327 100%)",
  padding: "24px 20px 40px",
};

const shellStyle = {
  maxWidth: "1200px",
  width: "100%",
  margin: "0 auto",
  color: "#e5eefc",
  boxSizing: "border-box",
};

const heroStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const eyebrowStyle = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#7dd3fc",
  marginBottom: "10px",
};

const titleStyle = {
  margin: 0,
  fontSize: "30px",
  lineHeight: 1.08,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "#f8fbff",
};

const subtitleStyle = {
  margin: "10px 0 0",
  color: "rgba(226,237,249,0.78)",
  fontSize: "16px",
  lineHeight: 1.45,
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 16px",
  borderRadius: "14px",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "14px",
  letterSpacing: "0.01em",
  color: "#f8fbff",
  background: "linear-gradient(135deg, #0f274d 0%, #143766 100%)",
  border: "1px solid rgba(125,211,252,0.18)",
  boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
};

const searchCardStyle = {
  background: "rgba(8, 22, 46, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "22px",
  padding: "20px 22px",
  boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
  marginBottom: "18px",
};

const searchHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "16px",
};

const sectionTextStyle = {
  margin: "6px 0 0",
  color: "rgba(168,196,232,0.82)",
  fontSize: "14px",
  lineHeight: 1.45,
};

const resultBadgeStyle = {
  borderRadius: "999px",
  padding: "10px 14px",
  background: "rgba(30,64,108,0.74)",
  border: "1px solid rgba(96,165,250,0.18)",
  color: "#dbeafe",
  fontSize: "13px",
  fontWeight: 700,
};

const searchInputWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  borderRadius: "18px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3,18,34,0.78)",
  padding: "0 16px",
  color: "#60a5fa",
};

const prendasTopAreaStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "16px",
  minHeight: "86px",
};

const prendasTopIconsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  color: "#eaf2ff",
};

const prendasTopMenuWrapperStyle = {
  position: "relative",
};

const prendasTopIconButtonStyle = {
  position: "relative",
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  border: "none",
  background: "transparent",
  color: "rgba(234,242,255,0.86)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
  outline: "none",
};

const prendasAvisosBadgeStyle = {
  position: "absolute",
  top: "2px",
  right: "1px",
  width: "15px",
  height: "15px",
  borderRadius: "999px",
  background: "#2563eb",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 0 0 2px rgba(3,18,34,0.95)",
};

const prendasTopDropdownStyle = {
  position: "absolute",
  top: "40px",
  right: 0,
  minWidth: "210px",
  padding: "8px",
  borderRadius: "12px",
  border: "1px solid rgba(96,165,250,0.18)",
  background:
    "linear-gradient(180deg, rgba(7,30,55,0.98), rgba(3,18,34,0.98))",
  boxShadow: "0 22px 48px rgba(0,0,0,0.36)",
  zIndex: 50,
};

const prendasTopDropdownItemStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  color: "rgba(231,238,248,0.92)",
  padding: "10px 10px",
  borderRadius: "8px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
};

const prendasTopDropdownDangerItemStyle = {
  ...prendasTopDropdownItemStyle,
  color: "#ffffff",
};

const prendasTopDropdownDividerStyle = {
  height: "1px",
  background: "rgba(148,163,184,0.14)",
  margin: "6px 4px",
};

const prendasAvisosDropdownStyle = {
  position: "absolute",
  top: "40px",
  right: 0,
  width: "270px",
  padding: "10px",
  borderRadius: "14px",
  border: "1px solid rgba(96,165,250,0.18)",
  background:
    "linear-gradient(180deg, rgba(7,30,55,0.98), rgba(3,18,34,0.98))",
  boxShadow: "0 22px 48px rgba(0,0,0,0.36)",
  zIndex: 60,
};

const prendasAvisosHeaderStyle = {
  padding: "8px 8px 10px",
  fontSize: "12px",
  fontWeight: 700,
  color: "rgba(168,196,232,0.94)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const prendasAvisoItemStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  color: "#ffffff",
  padding: "10px 8px",
  borderRadius: "10px",
  display: "grid",
  gridTemplateColumns: "12px 1fr",
  gap: "10px",
  textAlign: "left",
  cursor: "pointer",
};

const prendasAvisoDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  marginTop: "5px",
  flexShrink: 0,
};

const prendasAvisoTitleStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 650,
  color: "rgba(248,251,255,0.94)",
  marginBottom: "3px",
};

const prendasAvisoTextStyle = {
  display: "block",
  fontSize: "12px",
  lineHeight: 1.35,
  color: "rgba(206,220,238,0.76)",
};

const prendasAvisosFooterStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  color: "#4aa3ff",
  fontSize: "13px",
  fontWeight: 600,
  padding: "9px 8px 6px",
  textAlign: "left",
  cursor: "pointer",
};

const toolbarCardStyle = {
  background: "rgba(8, 22, 46, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "22px",
  padding: "18px",
  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
  backdropFilter: "blur(10px)",
  marginBottom: "18px",
};

const toolbarTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "14px",
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#f8fbff",
  marginBottom: "4px",
};

const sectionSubtitleStyle = {
  fontSize: "13px",
  color: "#8da0be",
  lineHeight: 1.45,
};

const counterPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(125,211,252,0.08)",
  border: "1px solid rgba(125,211,252,0.14)",
  color: "#cfe7ff",
  fontSize: "12px",
  fontWeight: 700,
};

const searchInputStyle = {
  width: "100%",
  height: "58px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#ffffff",
  fontSize: "16px",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const summaryCardStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  borderRadius: "18px",
  border: "1px solid rgba(96,165,250,0.14)",
  background: "rgba(8, 22, 46, 0.66)",
  padding: "14px",
};

const summaryIconStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#60a5fa",
  background: "rgba(37,99,235,0.14)",
  flexShrink: 0,
};

const summaryLabelStyle = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(168,196,232,0.80)",
  fontWeight: 700,
};

const summaryValueStyle = {
  fontSize: "22px",
  fontWeight: 800,
  color: "#ffffff",
  marginTop: "2px",
};

const summaryTextStyle = {
  fontSize: "12px",
  color: "rgba(168,196,232,0.76)",
  marginTop: "2px",
  lineHeight: 1.35,
};

const tableCardStyle = {
  width: "100%",
  background: "rgba(8, 22, 46, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "22px",
  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
  backdropFilter: "blur(10px)",
  overflow: "hidden",
  boxSizing: "border-box",
};

const quickDetailStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  alignItems: "center",
  borderRadius: "22px",
  border: "1px solid rgba(96,165,250,0.14)",
  background:
    "linear-gradient(180deg, rgba(17,55,96,0.50), rgba(8,22,46,0.78))",
  padding: "20px",
  marginTop: "18px",
};

const quickDetailMainStyle = {
  display: "flex",
  gap: "16px",
  alignItems: "center",
};

const quickEyebrowStyle = {
  color: "#60a5fa",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const quickTitleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 800,
  color: "#ffffff",
};

const quickSubtitleStyle = {
  margin: "4px 0 0",
  color: "rgba(226,237,249,0.86)",
  fontSize: "15px",
  fontWeight: 650,
};

const quickTextStyle = {
  margin: "6px 0 0",
  color: "rgba(168,196,232,0.82)",
  fontSize: "13px",
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  lineHeight: 1.28,
};

const quickActionsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  alignItems: "flex-end",
  minWidth: "420px",
};

const quickActionsRowStyle = {
  display: "flex",
  gap: "12px",
  justifyContent: "flex-end",
  flexWrap: "nowrap",
};

const miniActionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  borderRadius: "999px",
  padding: "8px 11px",
  background: "rgba(30,64,108,0.52)",
  border: "1px solid rgba(96,165,250,0.16)",
  color: "#dbeafe",
  fontSize: "12px",
  fontWeight: 700,
};

const quickPrimaryActionStyle = {
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(30,64,108,0.74)",
  color: "#dbeafe",
  borderRadius: "999px",
  padding: "9px 14px",
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
};

const noResultsBoxStyle = {
  padding: "28px 18px 30px",
  color: "rgba(226,237,249,0.86)",
  fontSize: "14px",
  lineHeight: 1.5,
  textAlign: "center",
  borderBottom: "1px solid rgba(148,163,184,0.08)",
};

const noResultsTitleStyle = {
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 750,
  marginBottom: "6px",
};

const noResultsTextStyle = {
  color: "rgba(168,196,232,0.82)",
};

const emptyBoxStyle = {
  padding: "24px 18px",
  color: "#9fb0ca",
  fontSize: "14px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "820px",
};

const thStyle = {
  textAlign: "left",
  padding: "14px 18px",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#608fd5",
  background: "rgba(255,255,255,0.02)",
  borderBottom: "1px solid rgba(148, 163, 184, 0.24)",
};

const trStyle = {
  borderTop: "1px solid rgba(148, 163, 184, 0.08)",
};

const tdStyle = {
  padding: "12px 18px",
  fontSize: "13px",
  color: "#edf4ff",
  verticalAlign: "middle",
};

const domainTdStyle = {
  ...tdStyle,
  textTransform: "uppercase",
  fontWeight: 400,
  color: "#e7eef9",
  letterSpacing: "0",
};

const frqTextStyle = {
  display: "inline-block",
  maxWidth: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontWeight: 400,
  color: "#e7eef9",
};

const detailButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "74px",
  padding: "6px 10px",
  borderRadius: "999px",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "10px",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#dbeafe",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.18)",
  whiteSpace: "nowrap",
};