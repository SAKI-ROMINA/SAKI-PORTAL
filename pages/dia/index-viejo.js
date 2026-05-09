import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import {
  Search,
  FileText,
  UserRound,
  Car,
  Bell,
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

function getEstadoLabel(status) {
  return status || "EN CURSO";
}

function getEstadoVisual(status) {
  if (status === "OBSERVADO") return "observado";
  if (status === "ENTREGADO") return "entregado";
  return "curso";
}

function getReferencia(row) {
  if (row.dominio) return row.dominio;
  if (row.identificacion_dni) return `DNI ${row.identificacion_dni}`;
  if (row.identificacion_cuit) return `CUIT ${row.identificacion_cuit}`;
  return "—";
}
export default function InformesPreview() {
    const [informes, setInformes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

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

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <main style={mainPanelStyle}>
          <section style={heroStyle}>
            <div>
              <div style={eyebrowStyle}>PORTAL DÍA</div>

              <h1 style={titleStyle}>Informes</h1>

              <p style={subtitleStyle}>
                Solicitud, seguimiento y entrega de informes registrales.
              </p>
            </div>

            <Link href="/dia/informes/nuevo" style={primaryButtonStyle}>
              + Nuevo informe
            </Link>
          </section>

          <section style={searchCardStyle}>
            <div style={searchHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Buscador</h2>
                <p style={sectionTextStyle}>
                  Buscá por tienda, franquiciado, CUIT, dominio, persona o tipo de informe.
                </p>
              </div>

              <div style={resultBadgeStyle}>
  {loading ? "Cargando..." : `${informes.length} informes`}
</div>
            </div>

            <div style={searchInputWrapStyle}>
              <Search size={22} />
              <input
                style={searchInputStyle}
                placeholder="Buscar por dominio, tienda, franquiciado, CUIT, persona o estado..."
              />
            </div>
          </section>

          <section style={summaryGridStyle}>
            <SummaryCard
              icon={<FileText size={25} />}
              label="Informes"
              value="8"
              text="Solicitudes registrales activas."
            />

            <SummaryCard
              icon={<Clock3 size={25} />}
              label="En curso"
              value="4"
              text="Pendientes de gestión o entrega."
            />

            <SummaryCard
              icon={<AlertCircle size={25} />}
              label="Observados"
              value="2"
              text="Requieren revisión o documentación."
            />

            <SummaryCard
              icon={<Bell size={25} />}
              label="Entregados"
              value="2"
              text="Finalizados y disponibles."
            />
          </section>

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
            <div style={tableHeaderStyle}>
              <span>Tienda</span>
              <span>Franquiciado</span>
              <span>CUIT</span>
              <span>Referencia</span>
              <span>Tipo</span>
              <span>Estado</span>
              <span>Detalle</span>
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

{!loading &&
  informes.map((row) => (
    <InformeRow
      key={row.id}
      id={row.id}
      tienda={row.tienda || "—"}
      franquiciado={row.franquiciado || "—"}
      cuit={row.identificacion_cuit || "—"}
      referencia={getReferencia(row)}
      tipo={getTipoInformeLabel(row.type)}
      estado={getEstadoLabel(row.status)}
      status={getEstadoVisual(row.status)}
    />
  ))}
            
          </section>

          <section style={detailPreviewStyle}>
  <div style={detailMainStyle}>
    <div style={detailIconStyle}>
      <FileText size={26} />
    </div>

    <div>
      <div style={eyebrowSmallStyle}>DETALLE DE LA SOLICITUD</div>

      <h2 style={detailTitleStyle}>AAAAAA25</h2>

      <p style={detailTypeStyle}>Informe de dominio</p>

      <p style={detailTextStyle}>
        Vista operativa de la solicitud con estado, archivos, notas y
        trazabilidad.
      </p>
    </div>
  </div>

<div style={detailActionsStyle}>
  <div style={detailActionsRowStyle}>
    <MiniAction icon={<Paperclip size={18} />} text="Archivos" />
    <MiniAction icon={<Download size={18} />} text="Descargar" />
    <MiniAction icon={<Printer size={18} />} text="Imprimir" />
  </div>

  <div style={detailActionsRowStyle}>
    <MiniAction icon={<MessageSquareText size={18} />} text="Notas" />
    <MiniAction icon={<History size={18} />} text="Historial" />
  </div>
</div>
</section>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, text }) {
  return (
    <div style={summaryCardStyle}>
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
  const badgeStyle =
    status === "observado"
      ? badgeWarningStyle
      : status === "entregado"
      ? badgeSuccessStyle
      : badgeProgressStyle;

  const referenceIcon =
    referencia.includes("DNI") || referencia.includes("CUIT") ? (
      <UserRound size={17} />
    ) : (
      <Car size={17} />
    );

  return (
    <div style={tableRowStyle}>
      <span>{tienda}</span>
      <span>{franquiciado}</span>
      <span>{cuit}</span>

      <span style={referenceStyle}>
        {referenceIcon}
        {referencia}
      </span>

      <span>{tipo}</span>
      <span style={badgeStyle}>{estado}</span>

      <Link href={`/dia/r/${id}`} style={detailButtonStyle}>
  Ver detalle
</Link>
    </div>
  );
}

function MiniAction({ icon, text }) {
  return (
    <div style={miniActionStyle}>
      {icon}
      <span>{text}</span>
    </div>
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
  alignItems: "flex-end",
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
  fontSize: "38px",
  fontWeight: 800,
  letterSpacing: "-0.04em",
  lineHeight: 1.05,
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
  borderRadius: "16px",
  padding: "14px 20px",
  fontSize: "15px",
  fontWeight: 800,
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
  overflow: "hidden",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  background: "rgba(8, 22, 46, 0.78)",
  marginBottom: "18px",
};

const tableHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "0.55fr 1.45fr 1.05fr 1.55fr 1.05fr 0.95fr 0.85fr",
  gap: "14px",
  padding: "16px 18px",
  borderBottom: "1px solid rgba(148,163,184,0.16)",
  color: "#60a5fa",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "12px",
  fontWeight: 800,
};

const tableRowStyle = {
  display: "grid",
  gridTemplateColumns: "0.55fr 1.45fr 1.05fr 1.55fr 1.05fr 0.95fr 0.85fr",
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
  textDecoration: "none",
  justifySelf: "start",
  borderRadius: "999px",
  padding: "8px 12px",
  background: "rgba(30,64,108,0.74)",
  border: "1px solid rgba(96,165,250,0.18)",
  color: "#dbeafe",
  fontSize: "12px",
  fontWeight: 800,
  whiteSpace: "nowrap",
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