import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import {
  Search,
  FileText,
  UserRound,
  Car,
  Bell,
  MoreVertical,
  Clock3,
  AlertCircle,
  ArrowRight,
  Paperclip,
  MessageSquareText,
  History,
  Download,
  Printer,
} from "lucide-react";

function getTipoInformeLabel(type) {
  if (type === "informe_dominio") return "Informe de dominio";
  if (type === "certificado_dominio") return "Certificado de dominio";
  if (type === "anotaciones_personales") return "Anotaciones personales";
  if (type === "indice_titularidad") return "Índice de titularidad";
  return type || "Informe";
}

function getEstadoLabel(status, result) {
  const estado = (status || "SOLICITADO").toUpperCase().replace("_", " ");
  const resultado = (result || "").toUpperCase();

  if (estado === "ANULADO") return "ANULADO";

  if (estado === "ENTREGADO" && resultado === "OBSERVADO") {
    return "OBSERVADO";
  }

  if (estado === "ENTREGADO") return "ENTREGADO";
  if (estado === "EN CURSO") return "EN CURSO";
  if (estado === "SOLICITADO") return "SOLICITADO";

  return estado;
}

function getEstadoVisual(status, result) {
  const estado = (status || "SOLICITADO").toUpperCase().replace("_", " ");
  const resultado = (result || "").toUpperCase();

  if (estado === "ANULADO") return "anulado";
  if (estado === "ENTREGADO" && resultado === "OBSERVADO") return "observado";
  if (estado === "ENTREGADO") return "entregado";
  if (estado === "SOLICITADO") return "solicitado";
  if (estado === "EN CURSO") return "curso";

  return "curso";
}

function getInformePillStyle(status) {
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
    minWidth: "86px",
    textAlign: "center",
  };

  switch (status) {
    case "solicitado":
      return {
        ...base,
        background: "rgba(245, 158, 11, 0.16)",
        color: "#fde68a",
        border: "1px solid rgba(245, 158, 11, 0.30)",
      };

    case "curso":
      return {
        ...base,
        background: "rgba(37, 99, 235, 0.18)",
        color: "#bfdbfe",
        border: "1px solid rgba(96, 165, 250, 0.38)",
      };

    case "observado":
      return {
        ...base,
        background: "rgba(239, 68, 68, 0.14)",
        color: "#fecaca",
        border: "1px solid rgba(239, 68, 68, 0.28)",
      };

    case "anulado":
      return {
        ...base,
        background: "rgba(239, 68, 68, 0.14)",
        color: "#fecaca",
        border: "1px solid rgba(239, 68, 68, 0.28)",
      };

    case "entregado":
      return {
        ...base,
        background: "rgba(34,197,94,0.14)",
        color: "#bbf7d0",
        border: "1px solid rgba(34,197,94,0.24)",
      };

    default:
      return {
        ...base,
        background: "rgba(37, 99, 235, 0.18)",
        color: "#bfdbfe",
        border: "1px solid rgba(96, 165, 250, 0.38)",
      };
  }
}

function getReferencia(row) {
  if (row.dominio) return row.dominio;
  if (row.identificacion_dni) return `DNI ${row.identificacion_dni}`;
  if (row.identificacion_cuit) return `CUIT ${row.identificacion_cuit}`;
  return "—";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function InformesPreview() {
    const [informes, setInformes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [searchTerm, setSearchTerm] = useState("");
const [quickFilter, setQuickFilter] = useState("TODOS");
const [selectedInforme, setSelectedInforme] = useState(null);
const [selectedInformeFilesCount, setSelectedInformeFilesCount] = useState(0);
const [printListMenuOpen, setPrintListMenuOpen] = useState(false);
const [topMenuOpen, setTopMenuOpen] = useState(false);
const [avisosOpen, setAvisosOpen] = useState(false);
const [avisosVistos, setAvisosVistos] = useState(false);

async function handleLogout() {
  await supabase.auth.signOut();
  window.location.href = "/dia/login";
}

useEffect(() => {
  if (typeof window === "undefined") return;
  if (!Array.isArray(informes) || informes.length === 0) return;

  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get("selected");

  if (!selectedId) return;
  if (selectedInforme?.id === selectedId) return;

  const informeToSelect = informes.find(
    (item) => String(item.id) === String(selectedId)
  );

  if (informeToSelect) {
    setSelectedInforme(informeToSelect);
    setSearchTerm("");
    setError("");
  }
}, [informes, selectedInforme]);

useEffect(() => {
  if (!selectedInforme?.id) {
    setSelectedInformeFilesCount(0);
    return;
  }

  async function fetchSelectedInformeFilesCount() {
    const { count, error } = await supabase
      .from("dia_request_files")
      .select("id", { count: "exact", head: true })
      .eq("request_id", selectedInforme.id);

    if (error) {
      console.error("Error contando archivos del informe:", error);
      setSelectedInformeFilesCount(0);
      return;
    }

    setSelectedInformeFilesCount(count || 0);
  }

  fetchSelectedInformeFilesCount();
}, [selectedInforme]);

useEffect(() => {
  async function fetchInformes() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("dia_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message || "No se pudieron cargar los informes.");
      setInformes([]);
      setLoading(false);
      return;
    }

    setInformes(data || []);
    setLoading(false);
  }

  fetchInformes();
}, []);

const normalizedSearch = searchTerm.trim().toLowerCase();

const filteredInformes = informes.filter((row) => {
  const matchesQuickFilter =
  quickFilter === "TODOS" ||
  (quickFilter === "SOLICITADOS" && row.status === "SOLICITADO") ||
  (quickFilter === "EN_CURSO" && row.status === "EN CURSO") ||
  (quickFilter === "OBSERVADOS" &&
    row.status === "ENTREGADO" &&
    row.result === "OBSERVADO") ||
  (quickFilter === "ENTREGADOS" &&
    row.status === "ENTREGADO" &&
    row.result !== "OBSERVADO") ||
  (quickFilter === "ANULADOS" && row.status === "ANULADO");

  if (!matchesQuickFilter) return false;

  if (!normalizedSearch) return true;

  const text = [
    row.tienda,
    row.franquiciado,
    row.identificacion_cuit,
    row.identificacion_dni,
    row.identificacion_nombre,
    row.dominio,
    row.short_code,
    row.id,
    getReferencia(row),
    getTipoInformeLabel(row.type),
    getEstadoLabel(row.status, row.result),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(normalizedSearch);
});

const hasSearch = searchTerm.trim() !== "";

const noSearchResults =
  !loading && hasSearch && filteredInformes.length === 0;

const printTitle =
  quickFilter === "SOLICITADOS"
    ? "Listado de informes solicitados"
    : quickFilter === "EN_CURSO"
    ? "Listado de informes en curso"
    : quickFilter === "OBSERVADOS"
    ? "Listado de informes observados"
    : quickFilter === "ENTREGADOS"
    ? "Listado de informes entregados"
    : quickFilter === "ANULADOS"
    ? "Listado de informes anulados"
    : "Listado general de informes";

const totalInformes = informes.length;

const totalEnCurso = informes.filter(
  (row) => row.status === "EN CURSO"
).length;

const totalObservados = informes.filter(
  (row) => row.status === "ENTREGADO" && row.result === "OBSERVADO"
).length;

const totalAvisosInformes =
  informes.filter((row) => row.status === "SOLICITADO").length +
  totalEnCurso +
  totalObservados;

const totalEntregados = informes.filter(
  (row) => row.status === "ENTREGADO" && row.result !== "OBSERVADO"
).length;

const printDate = new Date().toLocaleDateString("es-AR");
  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <main style={mainPanelStyle}>
            <div className="print-header">
  <div className="print-brand">SAKI</div>
  <h1>{printTitle}</h1>
  <p>Solicitud, seguimiento y entrega de informes registrales.</p>
  <p>Fecha de impresión: {printDate}</p>
  {searchTerm && <p>Filtro aplicado: {searchTerm}</p>}
</div>
<section style={heroStyle} className="no-print">
  <div>
    <div style={eyebrowStyle}>MANAGEMENT &amp; TRACKING</div>

    <h1 style={titleStyle}>
      Informes
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
      Solicitud, seguimiento y entrega de informes registrales.
    </p>
  </div>

  <div style={informesTopAreaStyle}>
    <div style={informesTopIconsStyle}>
      <div style={informesTopMenuWrapperStyle}>
        <button
          type="button"
          style={informesTopIconButtonStyle}
          onClick={() => {
  setAvisosOpen((prev) => !prev);
  setTopMenuOpen(false);
  setAvisosVistos(true);
}}
          title="Avisos del módulo"
        >
          <Bell size={17} />
          {totalAvisosInformes > 0 && !avisosVistos && (
  <span style={informesAvisosBadgeStyle}>{totalAvisosInformes}</span>
)}
        </button>

        {avisosOpen && (
          <div style={informesAvisosDropdownStyle}>
            <div style={informesAvisosHeaderStyle}>Avisos del módulo</div>

            <button
              type="button"
              style={informesAvisoItemStyle}
              onClick={() => {
                setQuickFilter("SOLICITADOS");
                setSelectedInforme(null);
                setAvisosOpen(false);
              }}
            >
              <span style={{ ...informesAvisoDotStyle, background: "#3b82f6" }} />
              <span>
                <strong style={informesAvisoTitleStyle}>Nuevo informe solicitado</strong>
<small style={informesAvisoTextStyle}>
  Hay un pedido pendiente de revisión por SAKI.
</small>
              </span>
            </button>

            <button
              type="button"
              style={{ ...informesAvisoItemStyle, display: "none" }}
              onClick={() => {
                setQuickFilter("OBSERVADOS");
                setSelectedInforme(null);
                setAvisosOpen(false);
              }}
            >
              <span style={{ ...informesAvisoDotStyle, background: "#f8c744" }} />
              <span>
                <strong style={informesAvisoTitleStyle}>Informes observados</strong>
                <small style={informesAvisoTextStyle}>
                  Solicitudes que requieren revisión.
                </small>
              </span>
            </button>

            <button
              type="button"
              style={{ ...informesAvisoItemStyle, display: "none" }}
              onClick={() => {
                setQuickFilter("ENTREGADOS");
                setSelectedInforme(null);
                setAvisosOpen(false);
              }}
            >
              <span style={{ ...informesAvisoDotStyle, background: "#21c985" }} />
              <span>
                <strong style={informesAvisoTitleStyle}>Informes entregados</strong>
                <small style={informesAvisoTextStyle}>
                  Ver informes finalizados y disponibles.
                </small>
              </span>
            </button>

            <div style={informesTopDropdownDividerStyle} />

            <button
              type="button"
              style={informesAvisosFooterStyle}
              onClick={() => {
                setQuickFilter("TODOS");
                setSelectedInforme(null);
                setAvisosOpen(false);
              }}
            >
              Ver todos los informes →
            </button>
          </div>
        )}
      </div>

      <div style={informesTopMenuWrapperStyle}>
        <button
          type="button"
          style={informesTopIconButtonStyle}
          onClick={() => {
            setTopMenuOpen((prev) => !prev);
            setAvisosOpen(false);
          }}
          title="Opciones"
        >
          <MoreVertical size={17} />
        </button>

        {topMenuOpen && (
          <div style={informesTopDropdownStyle}>
            
            
            <button
              type="button"
              style={informesTopDropdownItemStyle}
              onClick={() => {
                setTopMenuOpen(false);
                alert("Canal de reporte pendiente de configuración.");
              }}
            >
              Reportar inconveniente
            </button>

            <div style={informesTopDropdownDividerStyle} />

            <button
              type="button"
              style={informesTopDropdownDangerItemStyle}
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>

    <Link href="/dia/informes/nuevo" style={primaryButtonStyle}>
      + Nuevo informe
    </Link>
  </div>
</section>

          <section style={searchCardStyle} className="no-print">
            <div style={searchHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Buscador</h2>
                <p style={sectionTextStyle}>
                  Buscá por tienda, franquiciado, CUIT, dominio, persona o tipo de informe.
                </p>
              </div>

<button
  type="button"
  onClick={() => {
    setQuickFilter("TODOS");
    setSearchTerm("");
    setSelectedInforme(null);
    setSelectedInformeFilesCount(0);
    setError("");
    setPrintListMenuOpen(false);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/dia/informes");
    }
  }}
  style={{
    ...resultBadgeStyle,
    cursor: "pointer",
  }}
  title="Ver todos los informes"
>
  {loading ? "Cargando..." : `Ver listado · ${informes.length}`}
</button>
            </div>

            <div style={searchInputWrapStyle}>
              <Search size={22} />
              <input

  style={searchInputStyle}
  placeholder="Buscar por dominio, tienda, franquiciado, CUIT, persona o estado..."
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setSelectedInforme(null);
  }}
/>
            </div>
          </section>

  <section style={summaryGridStyle} className="no-print">
  <SummaryCard
    icon={<FileText size={25} />}
    label="Informes"
    value={totalInformes}
    text="Solicitudes registrales activas."
    active={quickFilter === "TODOS"}
    onClick={() => {
      setQuickFilter("TODOS");
      setSelectedInforme(null);
      setSearchTerm("");
      setError("");
    }}
  />

  <SummaryCard
    icon={<Clock3 size={25} />}
    label="En curso"
    value={totalEnCurso}
    text="Pendientes de gestión o entrega."
    active={quickFilter === "EN_CURSO"}
    onClick={() => {
      setQuickFilter("EN_CURSO");
      setSelectedInforme(null);
      setSearchTerm("");
      setError("");
    }}
  />

  <SummaryCard
    icon={<AlertCircle size={25} />}
    label="Observados"
    value={totalObservados}
    text="Requieren revisión o documentación."
    active={quickFilter === "OBSERVADOS"}
    onClick={() => {
      setQuickFilter("OBSERVADOS");
      setSelectedInforme(null);
      setSearchTerm("");
      setError("");
    }}
  />

  <SummaryCard
    icon={<Bell size={25} />}
    label="Entregados"
    value={totalEntregados}
    text="Finalizados y disponibles."
    active={quickFilter === "ENTREGADOS"}
    onClick={() => {
      setQuickFilter("ENTREGADOS");
      setSelectedInforme(null);
      setSearchTerm("");
      setError("");
    }}
  />
</section>
     
          {!selectedInforme && (
          <section style={tableCardStyle}>
            {error && (
  <div style={errorBoxStyle}>
    {error}
  </div>
)}

{loading && (
  <div style={loadingBoxStyle}>
    Cargando informes...
  </div>
)}
<div style={tableHeaderStyle} className="informes-table-header">
  <span>Tienda</span>
  <span>Franquiciado</span>
  <span>CUIT</span>
  <span>Dominio</span>
  <span className="print-hide-list">Tipo</span>
  <span className="print-hide-list">Estado</span>
  <span className="print-hide-list">Detalle</span>
</div>

            {!loading && informes.length === 0 && (
  <div
    style={{
      padding: "18px",
      color: "rgba(226,237,249,0.78)",
      fontSize: "14px",
    }}
  >
    No hay informes cargados todavía.
  </div>
)}

{noSearchResults && (
  <div
    style={{
      padding: "28px 18px 30px",
      color: "rgba(226,237,249,0.86)",
      fontSize: "14px",
      lineHeight: 1.5,
      textAlign: "center",
      borderBottom: "1px solid rgba(148,163,184,0.08)",
    }}
  >
    <div
      style={{
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: 750,
        marginBottom: "6px",
      }}
    >
      No se encontraron informes para{" "}
      <span style={{ color: "#eafd93" }}>"{searchTerm}"</span>.
    </div>

    <div style={{ color: "rgba(168,196,232,0.82)" }}>
      Probá con otro dato: dominio, tienda, franquiciado, CUIT o estado.
    </div>
  </div>
)}

{!loading &&
  filteredInformes.map((row) => (
    <InformeRow
      key={row.id}
      id={row.id}
      tienda={row.tienda || "—"}
      franquiciado={row.franquiciado || "—"}
      cuit={row.identificacion_cuit || "—"}
      referencia={getReferencia(row)}
      tipo={getTipoInformeLabel(row.type)}
estado={getEstadoLabel(row.status, row.result)}
status={getEstadoVisual(row.status, row.result)}
      onSelect={() => setSelectedInforme(row)}
    />
  ))}

{!loading && informes.length > 0 && (
  <div
    className="no-print"
    style={{
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "14px",
      position: "relative",
    }}
  >
    <button
      type="button"
      onClick={() => setPrintListMenuOpen((prev) => !prev)}
      style={{
        border: "1px solid rgba(148, 163, 184, 0.28)",
        background: "rgba(15, 23, 42, 0.35)",
        color: "rgba(226, 237, 249, 0.78)",
        borderRadius: "999px",
        padding: "7px 13px",
        fontSize: "12px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Imprimir listado ▾
    </button>

    {printListMenuOpen && (
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "38px",
          minWidth: "220px",
          border: "1px solid rgba(96, 165, 250, 0.20)",
          background: "rgba(8, 22, 46, 0.98)",
          borderRadius: "16px",
          padding: "8px",
          boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
          zIndex: 20,
        }}
      >
        {[
          ["TODOS", "Todos los informes"],
          ["SOLICITADOS", "Solicitados"],
          ["EN_CURSO", "En curso"],
          ["OBSERVADOS", "Observados"],
          ["ENTREGADOS", "Entregados"],
          ["ANULADOS", "Anulados"],
        ].map(([filterValue, label]) => (
          <button
            key={filterValue}
            type="button"
            onClick={() => {
              setQuickFilter(filterValue);
              setSearchTerm("");
              setSelectedInforme(null);
              setSelectedInformeFilesCount(0);
              setError("");
              setPrintListMenuOpen(false);

              setTimeout(() => {
                window.print();
              }, 250);
            }}
            style={{
              width: "100%",
              border: "none",
              background:
                quickFilter === filterValue
                  ? "rgba(37, 99, 235, 0.22)"
                  : "transparent",
              color: "#dbeafe",
              borderRadius: "12px",
              padding: "10px 11px",
              fontSize: "13px",
              fontWeight: 700,
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    )}
  </div>
)}
            
          </section>
          )}

          <section style={{ ...detailPreviewStyle, display: "none" }} className="no-print">
  <div style={detailMainStyle}>
    <div style={detailIconStyle}>
      <FileText size={26} />
    </div>

    <div>
      <div style={eyebrowSmallStyle}>DETALLE DE LA SOLICITUD</div>

      <h2 style={detailTitleStyle}>
  {selectedInforme ? getReferencia(selectedInforme) : "Seleccioná un informe"}
</h2>

      <p style={detailTypeStyle}>
  {selectedInforme
    ? getTipoInformeLabel(selectedInforme.type)
    : "Resumen rápido de la solicitud"}
</p>

<div
  style={{
    ...detailTextStyle,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    lineHeight: 1.28,
  }}
>
  {selectedInforme ? (
    <>
      <div>
        Tienda {selectedInforme.tienda || "—"} · Franquiciado{" "}
        {selectedInforme.franquiciado || "—"}
      </div>

      <div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "2px",
  }}
>
  <span style={{ whiteSpace: "nowrap" }}>
    CUIT {selectedInforme.identificacion_cuit || "—"}
  </span>

  <span style={{ whiteSpace: "nowrap" }}>
    Solicitado {formatDate(selectedInforme.created_at)}
  </span>

  <span style={{ whiteSpace: "nowrap" }}>
    Estado {getEstadoLabel(selectedInforme.status)}
  </span>
</div>
    </>
  ) : (
    "Seleccioná un informe del listado para ver el resumen rápido de la solicitud."
  )}
</div>
    </div>
  </div>

<div style={detailActionsStyle}>
  <div style={detailActionsRowStyle}>
    <MiniAction
      icon={<History size={18} />}
      text="Ver legajo"
      disabled={!selectedInforme}
      onClick={() => {
        if (!selectedInforme) return;
        window.location.href = `/dia/informes/${selectedInforme.id}`;
      }}
    />

    <MiniAction
      icon={<Paperclip size={18} />}
      text="Archivos adjuntos"
      disabled={!selectedInforme || selectedInformeFilesCount === 0}
      onClick={() => {
        if (!selectedInforme || selectedInformeFilesCount === 0) return;
        window.location.href = `/dia/informes/${selectedInforme.id}#archivos`;
      }}
    />

    <MiniAction
      icon={<MessageSquareText size={18} />}
      text="Notas"
      disabled={!selectedInforme}
      onClick={() => {
        if (!selectedInforme) return;
        window.location.href = `/dia/informes/${selectedInforme.id}#notas`;
      }}
    />
  </div>

  <div style={detailActionsRowStyle}>
    <MiniAction
      icon={<Printer size={18} />}
      text="Imprimir resumen"
      disabled={!selectedInforme}
      onClick={() => {
        if (!selectedInforme) return;
        window.location.href = `/dia/informes/${selectedInforme.id}?print=resumen`;
      }}
    />
  </div>
</div>
</section>

{selectedInforme && (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "18px",
    }}
  >
    <button
      type="button"
      onClick={() => {
  setSelectedInforme(null);
  setSelectedInformeFilesCount(0);
  setSearchTerm("");
  setError("");

  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", "/dia/informes");
  }
}}
      style={{
  border: "1px solid rgba(96, 165, 250, 0.32)",
  background: "rgba(37, 99, 235, 0.18)",
  color: "#bfdbfe",
  borderRadius: "999px",
  padding: "9px 15px",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "none",
}}
    >
      Cambiar selección
    </button>
  </div>
)}

<style jsx global>{`
  .print-header {
    display: none;
  }

  @media print {
    .print-header {
      display: block;
      margin-bottom: 22px;
      color: #111827;
      .print-hide-list {
  display: none !important;
}

.informes-table-header,
.informes-table-row {
  grid-template-columns: 0.75fr 1.75fr 1.2fr 1.8fr !important;
}
    }

    .print-brand {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.04em;
      margin-bottom: 18px;
    }

    .print-header h1 {
      font-size: 22px;
      margin: 0 0 8px;
    }

    .print-header p {
      font-size: 12px;
      margin: 4px 0;
      color: #374151;
    }

    .no-print {
      display: none !important;
    }
  }
`}</style>
        </main>
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

function InformeRow({ id, tienda, franquiciado, cuit, referencia, tipo, estado, status }) {
  const pillStyle = getInformePillStyle(status);

  const referenceIcon =
    referencia.includes("DNI") || referencia.includes("CUIT") ? (
      <UserRound size={17} />
    ) : (
      <Car size={17} />
    );

  const goToDetalle = () => {
    window.location.href = `/dia/informes/detalle-preview-real?id=${id}`;
  };

  return (
    <div
      className="informes-table-row"
      style={{
        ...tableRowStyle,
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
      onClick={goToDetalle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetalle();
        }
      }}
    >
      <span>{tienda}</span>
      <span>{franquiciado}</span>
      <span>{cuit}</span>

      <span style={referenceStyle}>
        {referenceIcon}
        {referencia}
      </span>

      <span className="print-hide-list">{tipo}</span>

      <span className="print-hide-list" style={pillStyle}>
        {estado}
      </span>

      <Link
        className="print-hide-list"
        href={`/dia/informes/detalle-preview-real?id=${id}`}
        style={detailButtonStyle}
        onClick={(e) => e.stopPropagation()}
      >
        DETALLE
      </Link>
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

/* ===================== ESTILOS ===================== */

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(26,78,154,0.20), transparent 28%), linear-gradient(180deg, #03122c 0%, #05152f 45%, #071327 100%)",
  padding: "24px 20px 40px",
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const shellStyle = {
  maxWidth: "1200px",
  width: "100%",
  margin: "0 auto",
  color: "#e5eefc",
  boxSizing: "border-box",
};

const mainPanelStyle = {
  background: "rgba(8, 22, 46, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
  backdropFilter: "blur(10px)",
  padding: "26px",
  boxSizing: "border-box",
};

const heroStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "22px",
};

const eyebrowStyle = {
  color: "#5fd0ff",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: "10px",
};

const titleStyle = {
  margin: 0,
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: 760,
  letterSpacing: "-0.035em",
  lineHeight: 1.08,
};

const subtitleStyle = {
  margin: "10px 0 0",
  color: "rgba(226,237,249,0.78)",
  fontSize: "16px",
  lineHeight: 1.45,
};

const primaryButtonStyle = {
  textDecoration: "none",
  color: "#ffffff",
  background: "linear-gradient(180deg, rgba(47,109,246,0.92), rgba(29,78,216,0.82))",
  border: "1px solid rgba(147,197,253,0.22)",
  borderRadius: "14px",
  padding: "11px 16px",
  fontSize: "14px",
  fontWeight: 760,
  boxShadow: "0 16px 30px rgba(37,99,235,0.22)",
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

const sectionTitleStyle = {
  margin: 0,
  fontSize: "20px",
  color: "#ffffff",
  fontWeight: 760,
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
  borderRadius: "22px",
  overflow: "visible",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  background: "rgba(8, 22, 46, 0.78)",
  marginBottom: "18px",
};

const tableHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "0.65fr 1.45fr 1.05fr 1.35fr 1.05fr 0.9fr 0.75fr",
  gap: "14px",
  padding: "16px 18px",
  borderBottom: "1px solid rgba(148,163,184,0.16)",
  color: "#608fd5",
  background: "rgba(255,255,255,0.02)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "12px",
  fontWeight: 800,
};

const tableRowStyle = {
  display: "grid",
  gridTemplateColumns: "0.65fr 1.45fr 1.05fr 1.35fr 1.05fr 0.9fr 0.75fr",
  gap: "14px",
  alignItems: "center",
  padding: "16px 18px",
  borderBottom: "1px solid rgba(148,163,184,0.08)",
  color: "#e5eefc",
  fontSize: "13px",
  wordBreak: "normal",
};

const referenceStyle = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  color: "rgba(238,244,255,0.90)",
  fontWeight: 560,
  fontSize: "13px",
  lineHeight: 1.2,
  whiteSpace: "normal",
  wordBreak: "break-word",
};

const detailButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  justifySelf: "start",
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
  cursor: "pointer",
  transition: "all 0.12s ease",
};

const badgeProgressStyle = {
  justifySelf: "start",
  borderRadius: "999px",
  padding: "7px 11px",
  background: "rgba(20,184,166,0.16)",
  border: "1px solid rgba(20,184,166,0.24)",
  color: "#ccfbf1",
  fontSize: "11px",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const badgeWarningStyle = {
  ...badgeProgressStyle,
  background: "rgba(245,158,11,0.16)",
  border: "1px solid rgba(245,158,11,0.26)",
  color: "#fde68a",
};

const badgeSuccessStyle = {
  ...badgeProgressStyle,
  background: "rgba(34,197,94,0.14)",
  border: "1px solid rgba(34,197,94,0.24)",
  color: "#bbf7d0",
};

const detailPreviewStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  alignItems: "center",
  borderRadius: "22px",
  border: "1px solid rgba(96,165,250,0.14)",
  background:
    "linear-gradient(180deg, rgba(17,55,96,0.50), rgba(8,22,46,0.78))",
  padding: "20px",
};

const detailMainStyle = {
  display: "flex",
  gap: "16px",
  alignItems: "center",
};

const detailIconStyle = {
  width: "54px",
  height: "54px",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#60a5fa",
  background: "rgba(37,99,235,0.16)",
  border: "1px solid rgba(96,165,250,0.16)",
  flexShrink: 0,
};

const eyebrowSmallStyle = {
  color: "#60a5fa",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const detailTitleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 800,
  color: "#ffffff",
};

const detailTypeStyle = {
  margin: "4px 0 0",
  color: "rgba(226,237,249,0.86)",
  fontSize: "15px",
  fontWeight: 650,
};

const detailTextStyle = {
  margin: "6px 0 0",
  color: "rgba(168,196,232,0.82)",
  fontSize: "13px",
};

const detailActionsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  alignItems: "flex-end",
  minWidth: "420px",
};

const detailActionsRowStyle = {
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
const errorBoxStyle = {
  margin: "16px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(239,68,68,0.10)",
  border: "1px solid rgba(239,68,68,0.24)",
  color: "#fecaca",
  fontSize: "14px",
};

const loadingBoxStyle = {
  margin: "16px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(96,165,250,0.10)",
  border: "1px solid rgba(96,165,250,0.20)",
  color: "#dbeafe",
  fontSize: "14px",
};

const badgeRequestedStyle = {
  borderRadius: "999px",
  padding: "7px 12px",
  background: "rgba(37,99,235,0.18)",
  border: "1px solid rgba(96,165,250,0.38)",
  color: "#bfdbfe",
  fontSize: "12px",
  fontWeight: 800,
  width: "fit-content",
  whiteSpace: "nowrap",
minWidth: "86px",
textAlign: "center",
};

const badgeInProgressStyle = {
  borderRadius: "999px",
  padding: "7px 12px",
  background: "rgba(14,165,233,0.22)",
  border: "1px solid rgba(56,189,248,0.44)",
  color: "#2ba6e9",
  fontSize: "12px",
  fontWeight: 800,
  width: "fit-content",
  whiteSpace: "nowrap",
minWidth: "86px",
textAlign: "center",
};

const badgeDeliveredStyle = {
  borderRadius: "999px",
  padding: "7px 12px",
  background: "rgba(22,163,74,0.24)",
  border: "1px solid rgba(74,222,128,0.42)",
  color: "#49eb82",
  fontSize: "12px",
  fontWeight: 800,
  width: "fit-content",
  whiteSpace: "nowrap",
minWidth: "86px",
textAlign: "center",
};

const badgeObservedStyle = {
  borderRadius: "999px",
  padding: "7px 12px",
  background: "rgba(217,119,6,0.28)",
  border: "1px solid rgba(251,191,36,0.50)",
  color: "#e52b01",
  fontSize: "12px",
  fontWeight: 800,
  width: "fit-content",
  whiteSpace: "nowrap",
minWidth: "86px",
textAlign: "center",
};

const badgeAnuladoStyle = {
  borderRadius: "999px",
  padding: "7px 12px",
  background: "rgba(153,27,27,0.34)",
  border: "1px solid rgba(248,113,113,0.48)",
  color: "#fecaca",
  fontSize: "12px",
  fontWeight: 800,
  width: "fit-content",
  whiteSpace: "nowrap",
minWidth: "86px",
textAlign: "center",
};

const informesTopAreaStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "16px",
  minHeight: "86px",
};

const informesTopIconsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  color: "#eaf2ff",
};

const informesTopMenuWrapperStyle = {
  position: "relative",
};

const informesTopIconButtonStyle = {
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

const informesAvisosBadgeStyle = {
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

const informesTopDropdownStyle = {
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

const informesTopDropdownItemStyle = {
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

const informesTopDropdownDangerItemStyle = {
  ...informesTopDropdownItemStyle,
  color: "#ffffff",
};

const informesTopDropdownDividerStyle = {
  height: "1px",
  background: "rgba(148,163,184,0.14)",
  margin: "6px 4px",
};

const informesAvisosDropdownStyle = {
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

const informesAvisosHeaderStyle = {
  padding: "8px 8px 10px",
  fontSize: "12px",
  fontWeight: 700,
  color: "rgba(168,196,232,0.94)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const informesAvisoItemStyle = {
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

const informesAvisoDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  marginTop: "5px",
  flexShrink: 0,
};

const informesAvisoTitleStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 650,
  color: "rgba(248,251,255,0.94)",
  marginBottom: "3px",
};

const informesAvisoTextStyle = {
  display: "block",
  fontSize: "12px",
  lineHeight: 1.35,
  color: "rgba(206,220,238,0.76)",
};

const informesAvisosFooterStyle = {
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