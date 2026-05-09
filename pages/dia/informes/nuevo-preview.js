import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Upload,
  Mail,
  UserRound,
  Car,
  Store,
  Building2,
  ShieldCheck,
} from "lucide-react";

export default function NuevoInformePreview() {
  const [tipoInforme, setTipoInforme] = useState("");
  const [notasOpen, setNotasOpen] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const muestraBloqueExtra = tipoInforme && tipoInforme !== "informe_dominio";

const esCertificado = tipoInforme === "certificado_dominio";
const esAnotaciones = tipoInforme === "anotaciones_personales";
const esIndice = tipoInforme === "indice_titularidad";

const bloqueExtraTitulo = esCertificado
  ? "Datos de identificación"
  : esAnotaciones
  ? "Datos de identificación"
  : "Datos de identificación";

const bloqueExtraTexto =
  tipoInforme === "certificado_dominio" ||
  tipoInforme === "anotaciones_personales" ||
  tipoInforme === "indice_titularidad"
    ? "Identificá al titular o razón social."
    : "";

const nombrePersonaLabel = esCertificado
  ? "Titular / Razón social *"
  : esAnotaciones
  ? "Apellido, nombre / Razón social *"
  : "Apellido, nombre / Razón social *";

const dominioLabel = esAnotaciones
  ? "Dominio "
  : "Dominio *";

const dominioPlaceholder = esAnotaciones
  ? "Opcional"
  : "AAAAAA25";

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <main style={mainPanelStyle}>
          <section style={heroStyle}>
            <div>
              <div style={eyebrowStyle}>PORTAL DÍA</div>
              <div style={titleRowStyle}>
  <div style={titleIconStyle}>
    <FileText size={24} />
  </div>

  <h1 style={titleStyle}>Nuevo informe</h1>
</div>
                            <div style={requesterLineStyle}>
  <span>USUARIO:</span>
  <strong style={requesterLineValueStyle}>rominamazzeo@gmail.com</strong>
</div>
            </div>

<Link href="/dia/informes/preview" style={backButtonStyle}>
  <ArrowLeft size={18} />
  Volver a informes
</Link>
          </section>

   <section style={formCardStyle}>
  <div style={blockTitleRowStyle}>
    <h2 style={sectionTitleStyle}>Tipo de informe</h2>
    <p style={sectionTextStyle}>
      Seleccioná el trámite registral solicitado.
    </p>
  </div>

  <div style={reportTypeGridStyle}>
    <ReportTypeOption
      active={tipoInforme === "informe_dominio"}
      onClick={() => setTipoInforme("informe_dominio")}
      title="Informe de dominio"
    />

    <ReportTypeOption
      active={tipoInforme === "certificado_dominio"}
      onClick={() => setTipoInforme("certificado_dominio")}
      title="Certificado de dominio"
    />

    <ReportTypeOption
      active={tipoInforme === "anotaciones_personales"}
      onClick={() => setTipoInforme("anotaciones_personales")}
      title="Anotaciones personales"
    />

    <ReportTypeOption
      active={tipoInforme === "indice_titularidad"}
      onClick={() => setTipoInforme("indice_titularidad")}
      title="Índice de titularidad"
    />
  </div>

  {tipoInforme && (
    <>
      <div style={sectionDividerStyle} />

      <div style={formHeaderStyle}>
        <div>
          <h2 style={sectionTitleStyle}>Datos del pedido</h2>
          <p style={sectionTextStyle}>Completá los datos del pedido.</p>
        </div>
      </div>

      <div style={gridThreeStyle}>
        <Field
          label="Tienda *"
          placeholder="Ejemplo: 10020"
          icon={<Store size={18} />}
        />

        <Field
          label="Franquiciado *"
          placeholder="Nombre del franquiciado"
          icon={<Building2 size={18} />}
        />

        <Field
          label={dominioLabel}
          placeholder={dominioPlaceholder}
          icon={<Car size={18} />}
        />
      </div>

      {muestraBloqueExtra && (
        <>
          <div style={sectionDividerStyle} />

          <div style={extraBlockHeaderStyle}>
            <h2 style={sectionTitleStyle}>{bloqueExtraTitulo}</h2>

            {bloqueExtraTexto && (
              <p style={sectionTextStyle}>{bloqueExtraTexto}</p>
            )}
          </div>

          <div style={gridThreeStyle}>
            <Field
              label={nombrePersonaLabel}
              placeholder="Ejemplo: PÉREZ JUAN / RAZÓN SOCIAL"
              icon={<UserRound size={18} />}
            />

            <Field
              label="DNI *"
              placeholder="Ejemplo: 32.652.653"
              icon={<FileText size={18} />}
            />

            <Field
              label="CUIT / CUIL *"
              placeholder="Ejemplo: 20-32652653-8"
              icon={<ShieldCheck size={18} />}
            />
          </div>
        </>
      )}

      <div style={noticeStyle}>
        <span style={noticeDotStyle} />
        <span>
          Campos obligatorios: Tienda, Franquiciado y Tipo de informe
          {!esAnotaciones && ", Dominio"}
          {muestraBloqueExtra && ". También Nombre, DNI y CUIT / CUIL"}.
        </span>
      </div>

      {guardado && (
        <div style={successNoticeStyle}>
          Solicitud guardada correctamente. Ya se encuentra disponible en el listado de informes.
        </div>
      )}

      <div style={actionsStyle}>
        <button
          type="button"
          style={saveButtonStyle}
          onClick={() => setGuardado(true)}
        >
          Guardar solicitud
        </button>

        <Link href="/dia/informes/preview" style={cancelButtonStyle}>
          Volver a informes
        </Link>
      </div>

      <div style={sectionDividerStyle} />

      <div style={pedidoNotesHeaderStyle}>
        <div>
          <h2 style={sectionTitleStyle}>Notas del pedido</h2>
          <p style={sectionTextStyle}>
            Registrá aclaraciones, respuestas o documentación vinculada a esta solicitud.
          </p>
        </div>

        <button
          type="button"
          style={toggleNotesButtonStyle}
          onClick={() => setNotasOpen((prev) => !prev)}
        >
          {notasOpen ? "Ocultar notas" : "Agregar nota / archivo"}
        </button>
      </div>

      {notasOpen && (
        <div style={pedidoNotesContentStyle}>
          <div style={pedidoNotesListStyle}>
            <NoteMessage
              author="Día"
              sector="Usuario solicitante"
              date="Hoy · 10:32"
              text="Se inicia la solicitud del informe registral."
            />

            <NoteMessage
              author="SAKI"
              sector="Admin"
              date="Pendiente"
              text="El equipo SAKI podrá responder desde el seguimiento del pedido."
              saki
            />
          </div>

          <div style={pedidoNoteComposerStyle}>
            <textarea
              style={pedidoNoteTextareaStyle}
              placeholder="Escribir una nota para este pedido..."
              rows={3}
            />

            <button type="button" style={pedidoNoteSendButtonStyle}>
              Agregar nota
            </button>
          </div>

          <div style={pedidoNotesToolsStyle}>
            <Field
              label="Email en copia"
              placeholder="usuario@diagroup.com"
              icon={<Mail size={18} />}
            />

            <UploadBox />
          </div>

          <div style={pedidoHelpBoxStyle}>
            <div>
              <div style={pedidoHelpTitleStyle}>Ayuda SAKI</div>

              <div style={pedidoHelpTextStyle}>
                ¿Necesitás asistencia sobre este pedido? Podés contactar al equipo
                SAKI por WhatsApp para consultas operativas rápidas.
              </div>

              <div style={pedidoHelpDisclaimerStyle}>
                Las definiciones formales deben quedar registradas en Notas del pedido.
              </div>
            </div>

            <a
              href="https://wa.me/5491157714212"
              target="_blank"
              rel="noreferrer"
              style={pedidoWhatsappButtonStyle}
            >
              WhatsApp SAKI
            </a>
          </div>
        </div>
      )}
    </>
  )}
</section>
        </main>
      </div>
    </div>
  );
}

function Field({ label, placeholder, icon }) {
  return (
    <div style={fieldWrapStyle}>
      <label style={labelStyle}>{label}</label>

      <div style={inputWrapStyle}>
        <span style={inputIconStyle}>{icon}</span>
        <input style={inputStyle} placeholder={placeholder} />
      </div>
    </div>
  );
}

function ReportTypeOption({ title, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? reportTypeOptionActiveStyle : reportTypeOptionStyle}
    >
      <span style={active ? reportTypeRadioActiveStyle : reportTypeRadioStyle}>
        {active && <span style={reportTypeRadioInnerStyle} />}
      </span>

      <span style={reportTypeTextStyle}>{title}</span>
    </button>
  );
}

function UploadBox() {
  return (
    <div style={uploadBoxStyle}>
      <div style={uploadInfoStyle}>
        <label style={labelStyle}>Archivos adjuntos</label>
        <p style={uploadTextStyle}>
          Adjuntá documentación respaldatoria si corresponde.
        </p>
      </div>

      <button type="button" style={uploadButtonStyle}>
        <Upload size={16} />
        Seleccionar archivo
      </button>
    </div>
  );
}

function NoteMessage({ author, sector, date, text, saki }) {
  return (
    <div style={saki ? pedidoNoteMessageSakiStyle : pedidoNoteMessageStyle}>
      <div style={pedidoNoteMetaStyle}>
        <strong>{author}</strong>
        <span>·</span>
        <span>{sector}</span>
      </div>

      <div style={pedidoNoteDateStyle}>{date}</div>

      <div style={pedidoNoteTextStyle}>{text}</div>
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

const backButtonStyle = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  color: "#dbeafe",
  background: "rgba(30,64,108,0.74)",
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "999px",
  padding: "11px 15px",
  fontSize: "14px",
  fontWeight: 750,
};

const formCardStyle = {
  background: "rgba(8, 22, 46, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "22px",
  padding: "22px",
  boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
};

const formHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px",
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

const requesterBoxStyle = {
  border: "1px solid rgba(96,165,250,0.14)",
  background: "rgba(15,44,78,0.38)",
  borderRadius: "16px",
  padding: "11px 15px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  color: "#ffffff",
  marginTop: "22px",
};

const gridThreeStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "16px",
};

const gridTwoStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const fieldWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle = {
  color: "#e5eefc",
  fontSize: "14px",
  fontWeight: 700,
};

const inputWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  borderRadius: "16px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3,18,34,0.72)",
  padding: "0 14px",
  color: "#60a5fa",
};

const inputIconStyle = {
  display: "flex",
  alignItems: "center",
  color: "#60a5fa",
};

const inputStyle = {
  width: "100%",
  height: "52px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: 500,
  textTransform: "uppercase",
};

const sectionDividerStyle = {
  height: "1px",
  background: "rgba(148,163,184,0.12)",
  margin: "26px 0",
};

const blockTitleRowStyle = {
  marginBottom: "14px",
};

const reportTypeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const reportTypeOptionStyle = {
  width: "100%",
  minHeight: "58px",
  borderRadius: "18px",
  border: "1px solid rgba(96,165,250,0.14)",
  background: "rgba(3,18,34,0.58)",
  color: "rgba(226,237,249,0.86)",
  padding: "0 18px",
  display: "flex",
  alignItems: "center",
  gap: "13px",
  cursor: "pointer",
  textAlign: "left",
  boxSizing: "border-box",
};

const reportTypeOptionActiveStyle = {
  ...reportTypeOptionStyle,
  border: "1px solid rgba(34,211,238,0.46)",
  background:
    "linear-gradient(180deg, rgba(20,184,166,0.20), rgba(3,18,34,0.72))",
  color: "#ffffff",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
};

const reportTypeRadioStyle = {
  width: "16px",
  height: "16px",
  borderRadius: "999px",
  border: "2px solid rgba(96,165,250,0.46)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxSizing: "border-box",
};

const reportTypeRadioActiveStyle = {
  ...reportTypeRadioStyle,
  border: "2px solid #22d3ee",
  boxShadow: "0 0 0 4px rgba(34,211,238,0.10)",
};

const reportTypeRadioInnerStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "999px",
  background: "#22d3ee",
};

const reportTypeTextStyle = {
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
};

const notesBlockStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "9px",
};

const textareaStyle = {
  minHeight: "110px",
  resize: "vertical",
  borderRadius: "16px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3,18,34,0.72)",
  color: "#ffffff",
  outline: "none",
  padding: "14px",
  fontSize: "15px",
  fontFamily: "inherit",
};

const uploadBoxStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  borderRadius: "16px",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  background: "rgba(3,18,34,0.46)",
  padding: "14px 16px",
  minHeight: "68px",
};

const uploadTextStyle = {
  margin: 0,
  color: "rgba(168,196,232,0.72)",
  fontSize: "13px",
  lineHeight: 1.35,
};

const uploadButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "999px",
  background: "rgba(30,64,108,0.58)",
  color: "#dbeafe",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: 700,
  whiteSpace: "nowrap",
  cursor: "pointer",
};

const successNoticeStyle = {
  marginTop: "14px",
  color: "#bbf7d0",
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.22)",
  borderRadius: "14px",
  padding: "12px 14px",
  fontSize: "14px",
  lineHeight: 1.4,
};

const optionalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const toggleNotesButtonStyle = {
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "999px",
  background: "rgba(30,64,108,0.54)",
  color: "#dbeafe",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: 750,
  cursor: "pointer",
};

const noticeStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  marginTop: "22px",
  color: "rgba(138, 253, 146, 0.88)",
  background: "rgba(120,83,20,0.10)",
  border: "1px solid rgba(253,230,138,0.14)",
  borderRadius: "14px",
  padding: "10px 13px",
  fontSize: "13px",
  lineHeight: 1.35,
};

const noticeDotStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "999px",
  background: "#facc15",
  flexShrink: 0,
};

const actionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "18px",
};

const saveButtonStyle = {
  border: "1px solid rgba(96,165,250,0.20)",
  borderRadius: "14px",
  padding: "10px 16px",
  background: "rgba(37,99,235,0.58)",
  color: "rgba(255,255,255,0.90)",
  fontSize: "14px",
  fontWeight: 680,
  cursor: "pointer",
  minWidth: "165px",
};

const cancelButtonStyle = {
  textDecoration: "none",
  borderRadius: "14px",
  padding: "11px 16px",
  color: "rgba(219,234,254,0.82)",
  background: "rgba(30,64,108,0.30)",
  border: "1px solid rgba(96,165,250,0.12)",
  fontSize: "14px",
  fontWeight: 650,
};

const requesterLineStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginTop: "10px",
  color: "rgba(168,196,232,0.72)",
  fontSize: "13px",
};

const requesterLineValueStyle = {
  color: "rgba(238,244,255,0.82)",
  fontWeight: 560,
};

const titleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const titleIconStyle = {
  width: "46px",
  height: "46px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#60a5fa",
  background: "rgba(37,99,235,0.16)",
  border: "1px solid rgba(96,165,250,0.16)",
  flexShrink: 0,
};

const extraBlockHeaderStyle = {
  marginBottom: "18px",
};

const notesPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const uploadInfoStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const pedidoNotesHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const pedidoNotesContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const pedidoNotesToolsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const pedidoNotesListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const pedidoNoteMessageStyle = {
  maxWidth: "82%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(96,165,250,0.14)",
  background: "rgba(7,30,55,0.58)",
};

const pedidoNoteMessageSakiStyle = {
  ...pedidoNoteMessageStyle,
  marginLeft: "auto",
  background:
    "linear-gradient(180deg, rgba(37,99,235,0.18), rgba(7,30,55,0.62))",
  border: "1px solid rgba(96,165,250,0.22)",
};

const pedidoNoteMetaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  color: "rgba(168,196,232,0.9)",
  marginBottom: "4px",
};

const pedidoNoteDateStyle = {
  fontSize: "11px",
  color: "rgba(142,164,187,0.86)",
  marginBottom: "10px",
};

const pedidoNoteTextStyle = {
  fontSize: "14px",
  lineHeight: 1.5,
  color: "rgba(248,251,255,0.94)",
};

const pedidoHelpBoxStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  padding: "16px 18px",
  borderRadius: "16px",
  border: "1px solid rgba(34,197,94,0.18)",
  background:
    "linear-gradient(180deg, rgba(22,101,52,0.14), rgba(7,30,55,0.42))",
};

const pedidoHelpTitleStyle = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#bbf7d0",
  marginBottom: "5px",
};

const pedidoHelpTextStyle = {
  fontSize: "13px",
  lineHeight: 1.45,
  color: "rgba(226,237,249,0.9)",
  maxWidth: "560px",
};

const pedidoHelpDisclaimerStyle = {
  marginTop: "7px",
  fontSize: "11px",
  color: "rgba(187,247,208,0.72)",
};

const pedidoWhatsappButtonStyle = {
  flexShrink: 0,
  textDecoration: "none",
  borderRadius: "10px",
  padding: "11px 14px",
  background: "linear-gradient(180deg, #22c55e, #16a34a)",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 700,
  boxShadow: "0 14px 28px rgba(22,163,74,0.20)",
};

const pedidoNoteComposerStyle = {
  borderTop: "1px solid rgba(148,163,184,0.14)",
  paddingTop: "18px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const pedidoNoteTextareaStyle = {
  width: "100%",
  resize: "vertical",
  minHeight: "86px",
  borderRadius: "14px",
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(3,18,34,0.72)",
  color: "#ffffff",
  padding: "13px 14px",
  fontSize: "14px",
  lineHeight: 1.45,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const pedidoNoteSendButtonStyle = {
  alignSelf: "flex-end",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(180deg, #2f6df6, #1d4ed8)",
  color: "#ffffff",
  padding: "12px 18px",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
};