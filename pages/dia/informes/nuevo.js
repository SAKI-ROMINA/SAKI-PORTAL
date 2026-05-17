import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
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
  const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [currentUserEmail, setCurrentUserEmail] = useState("");
const [currentUserSector, setCurrentUserSector] = useState("");

const [isAdmin, setIsAdmin] = useState(false);
const [usarCargaHistorica, setUsarCargaHistorica] = useState(false);

const [dominioPrevio, setDominioPrevio] = useState(null);
const [buscandoDominioPrevio, setBuscandoDominioPrevio] = useState(false);
const [dominioPrevioMsg, setDominioPrevioMsg] = useState("");

const [datosDominioAplicados, setDatosDominioAplicados] = useState(null);

const [historicoForm, setHistoricoForm] = useState({
  fecha_pedido_real: "",
  status: "ENTREGADO",
  result: "APROBADO",
  fecha_entrega_real: "",
});

const [form, setForm] = useState({
  tienda: "",
  franquiciado: "",
  dominio: "",
  identificacion_tipo_sujeto: "persona_humana",
  identificacion_nombre: "",
  identificacion_dni: "",
  identificacion_cuit: "",
  cc_email: "",
  notes: "",
});

useEffect(() => {
  async function loadCurrentUser() {
    const { data } = await supabase.auth.getUser();

    const user = data?.user || null;

    setCurrentUserEmail(user?.email || "");

    if (!user?.id) {
      setIsAdmin(false);
      return;
    }

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role, sector")
  .eq("id", user.id)
  .maybeSingle();

    if (profileError) {
      console.error("Error cargando perfil:", profileError);
      setIsAdmin(false);
      return;
    }

    const role = (profile?.role || "").toString().trim().toLowerCase();

    setIsAdmin(role === "admin");
    setCurrentUserSector((profile?.sector || "").toString().trim());
  }

  loadCurrentUser();
}, []);

const handleChange = (field) => (e) => {
  setForm((prev) => ({
    ...prev,
    [field]: e.target.value,
  }));
};

const handleDominioChange = (e) => {
  const value = e.target.value.toUpperCase();

  setForm((prev) => ({
    ...prev,
    dominio: value,
  }));

  setDominioPrevio(null);
  setDominioPrevioMsg("");
  setDatosDominioAplicados(null);

  const dominioLimpio = value.trim();

  if (!dominioLimpio || dominioLimpio.length < 5) {
    return;
  }

  window.clearTimeout(window.__sakiDominioPrevioTimer);

  window.__sakiDominioPrevioTimer = window.setTimeout(() => {
    buscarDominioPrevio(dominioLimpio);
  }, 450);
};

const handleHistoricoChange = (field) => (e) => {
  setHistoricoForm((prev) => ({
    ...prev,
    [field]: e.target.value,
  }));
};

const buscarDominioPrevio = async (dominioValue) => {
  const dominioLimpio = (dominioValue || "").trim().toUpperCase();

  const permiteBuscar =
    isAdmin &&
    (tipoInforme === "informe_dominio" ||
      tipoInforme === "certificado_dominio");

  if (!permiteBuscar || dominioLimpio.length < 5) {
    setDominioPrevio(null);
    setDominioPrevioMsg("");
    return;
  }

  try {
    setBuscandoDominioPrevio(true);
    setDominioPrevioMsg("");

    const { data, error } = await supabase
      .from("dia_requests")
      .select(
        `
        id,
        dominio,
        marca,
        modelo,
        tipo,
        modelo_anio,
        marca_motor,
        numero_motor,
        marca_chasis,
        numero_chasis,
        radicacion,
        registro_interviniente,
        titular_dominio,
        titular_tipo_persona,
        titular_apellido,
        titular_nombres,
        titular_razon_social,
        titular_dni,
        titular_cuil_cuit,
        titular_cuit,
        titular_estado_civil,
        titular_desde,
        porcentaje_titular,
        titular_domicilio,
        identificacion_nombre,
        identificacion_dni,
        identificacion_cuit,
        created_at
        `
      )
      .eq("dominio", dominioLimpio)
      .neq("status", "ANULADO")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      setDominioPrevio(data);
      setDominioPrevioMsg(
        "Encontramos datos previos para este dominio. Podés reutilizarlos y editarlos antes de guardar."
      );
    } else {
      setDominioPrevio(null);
      setDominioPrevioMsg("");
    }
  } catch (error) {
    console.error("Error buscando dominio previo:", error);
    setDominioPrevio(null);
    setDominioPrevioMsg("No se pudieron consultar datos previos del dominio.");
  } finally {
    setBuscandoDominioPrevio(false);
  }
};

const handleUsarDatosDominioPrevio = () => {
  if (!dominioPrevio || !isAdmin) return;

  setDatosDominioAplicados({
    marca: dominioPrevio.marca || null,
    modelo: dominioPrevio.modelo || null,
    tipo: dominioPrevio.tipo || null,
    modelo_anio: dominioPrevio.modelo_anio || null,
    marca_motor: dominioPrevio.marca_motor || null,
    numero_motor: dominioPrevio.numero_motor || null,
    marca_chasis: dominioPrevio.marca_chasis || null,
    numero_chasis: dominioPrevio.numero_chasis || null,
    radicacion: dominioPrevio.radicacion || null,
    registro_interviniente: dominioPrevio.registro_interviniente || null,
  });

  setDominioPrevioMsg(
    "Datos anteriores aplicados. Al guardar la solicitud, el legajo se creará con los datos técnicos precargados."
  );
};

const formatDni = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatCuit = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;

  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

const handleDniChange = (e) => {
  setForm((prev) => ({
    ...prev,
    identificacion_dni: formatDni(e.target.value),
  }));
};

const handleCuitChange = (e) => {
  setForm((prev) => ({
    ...prev,
    identificacion_cuit: formatCuit(e.target.value),
  }));
};

const getOnlyDigits = (value) => {
  return (value || "").replace(/\D/g, "");
};

const normalizeDateForDb = (value) => {
  const raw = (value || "").toString().trim();

  if (!raw) return null;

  // Si ya viene como AAAA-MM-DD, lo dejamos igual.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  // Acepta DD/MM/AAAA o DD-MM-AAAA
  const match = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);

  if (!match) return raw;

  const [, day, month, year] = match;

  return `${year}-${month}-${day}`;
};

const normalizarEmailInforme = (value) => {
  return String(value || "").trim().toLowerCase();
};

const separarEmailsInforme = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => separarEmailsInforme(item));
  }

  return String(value || "")
    .split(/[;,\n\s]+/)
    .map((email) => normalizarEmailInforme(email))
    .filter((email) => email && email.includes("@"));
};

const emailsUnicosInforme = (values) => {
  return Array.from(new Set(values.flatMap((value) => separarEmailsInforme(value))));
};

const obtenerAliasesSectorInforme = (sector) => {
  const texto = String(sector || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (texto.includes("franqu")) {
    return ["Franquicias", "Administración Franquicias", "Administracion Franquicias"];
  }

  if (texto.includes("credito") || texto.includes("cobranza")) {
    return ["Créditos y Cobranzas", "Creditos y Cobranzas"];
  }

  if (texto.includes("jurid")) {
    return ["Asuntos Jurídicos", "Asuntos Juridicos"];
  }

  return sector ? [sector] : [];
};

const getInformeTipoLabelNuevo = (type) => {
  const labels = {
    informe_dominio: "Informe de dominio",
    certificado_dominio: "Certificado de dominio",
    anotaciones_personales: "Anotaciones personales",
    indice_titularidad: "Índice de titularidad",
  };

  return labels[type] || type || "-";
};

const enviarNotificacionNuevoInforme = async ({
  requestId,
  payload,
  requesterEmail,
}) => {
  if (!requestId) return;

  try {
    const mailAdminSaki = "rominamazzeo@gmail.com";

    let sectorResponsable = currentUserSector || "";

    if (!sectorResponsable && requesterEmail) {
      const { data: requesterProfile, error: requesterProfileError } =
        await supabase
          .from("profiles")
          .select("sector")
          .eq("email", requesterEmail)
          .maybeSingle();

      if (requesterProfileError) {
        console.error("Error buscando sector del solicitante:", requesterProfileError);
      }

      sectorResponsable = requesterProfile?.sector || "";
    }

    const aliasesSector = obtenerAliasesSectorInforme(sectorResponsable);

    let mailsSector = [];

    if (aliasesSector.length > 0) {
      const { data: perfilesSector, error: perfilesError } = await supabase
        .from("profiles")
        .select("email, sector, role")
        .eq("role", "member")
        .in("sector", aliasesSector);

      if (perfilesError) {
        console.error("Error buscando destinatarios del sector:", perfilesError);
      } else {
        mailsSector = emailsUnicosInforme(
          (perfilesSector || []).map((perfil) => perfil?.email)
        );
      }
    }

    const destinatariosPrincipales = emailsUnicosInforme([
      mailAdminSaki,
      ...mailsSector,
    ]);

    const copiasExternas = emailsUnicosInforme([payload?.cc_email]).filter(
      (email) => !destinatariosPrincipales.includes(email)
    );

    if (!destinatariosPrincipales.length) {
      console.warn("No hay destinatarios para notificar el nuevo informe.");
      return;
    }

    const mailRes = await fetch("/api/dia/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: destinatariosPrincipales.join(","),
        cc: copiasExternas.join(","),
        subject: "SAKI | Nuevo informe solicitado",
        html: `
          <div style="font-family: Arial, sans-serif; font-size: 14px; color: #111; line-height: 1.5;">
            <h2 style="margin: 0 0 16px 0; color: #0f172a;">Nuevo informe solicitado</h2>

            <p style="margin: 0 0 16px 0;">
              Se registró una nueva solicitud de informe en el Portal Día.
            </p>

            <p style="margin: 0 0 8px 0;"><strong>Legajo:</strong> ${requestId}</p>
            <p style="margin: 0 0 8px 0;"><strong>Sector responsable:</strong> ${
              sectorResponsable || "Sin sector informado"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Solicitante:</strong> ${
              requesterEmail || "-"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Tienda:</strong> ${
              payload?.tienda || "-"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Franquiciado:</strong> ${
              payload?.franquiciado || "-"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Dominio / Persona:</strong> ${
              payload?.dominio || payload?.identificacion_nombre || "-"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Tipo de informe:</strong> ${
              getInformeTipoLabelNuevo(payload?.type)
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Estado:</strong> ${
              payload?.status || "SOLICITADO"
            }</p>

            ${
              payload?.notes
                ? `<p style="margin: 16px 0 8px 0;"><strong>Nota inicial:</strong></p>
                   <p style="margin: 0 0 8px 0; white-space: pre-wrap;">${payload.notes}</p>`
                : ""
            }

            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;" />

            <p style="margin: 0; color: #475569;">
              Este mensaje fue generado automáticamente por SAKI Portal Día. Por favor, no responder a este correo.
            </p>
          </div>
        `,
        requestId,
        threadId: null,
      }),
    });

    const mailJson = await mailRes.json().catch(() => null);

    if (mailJson?.threadId) {
      await supabase
        .from("dia_requests")
        .update({ email_thread_id: mailJson.threadId })
        .eq("id", requestId);
    }

    if (!mailRes.ok) {
      console.error("Error enviando notificación de nuevo informe:", mailJson);
    }
  } catch (mailError) {
    console.error("Error inesperado notificando nuevo informe:", mailError);
  }
};

const validateInformeForm = () => {
  if (!tipoInforme) {
    return "Seleccioná el tipo de informe.";
  }

  if (!(form.tienda || "").trim()) {
    return "Completá la tienda.";
  }

  if (!(form.franquiciado || "").trim()) {
    return "Completá el franquiciado.";
  }

  const dominioObligatorio =
    tipoInforme === "informe_dominio" ||
    tipoInforme === "certificado_dominio";

  if (dominioObligatorio && !(form.dominio || "").trim()) {
    return "Completá el dominio.";
  }

  const requiereIdentificacion =
  tipoInforme === "anotaciones_personales" ||
  tipoInforme === "indice_titularidad";

  if (requiereIdentificacion) {
    if (!(form.identificacion_nombre || "").trim()) {
      return "Completá el apellido, nombre o razón social.";
    }

    if (
  form.identificacion_tipo_sujeto === "persona_humana" &&
  getOnlyDigits(form.identificacion_dni).length !== 8
) {
  return "El DNI debe tener 8 números.";
}

    if (getOnlyDigits(form.identificacion_cuit).length !== 11) {
      return "El CUIT / CUIL debe tener 11 números.";
    }
  }

  return "";
};

const handleGuardarSolicitud = async () => {
  const validationError = validateInformeForm();

  if (validationError) {
    setError(validationError);
    setGuardado(false);
    return;
  }

  setSaving(true);
  setError("");

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;

    const requesterEmail = userData?.user?.email || "";
    const userId = userData?.user?.id || null;
const esCargaHistoricaAdmin = isAdmin && usarCargaHistorica;

if (esCargaHistoricaAdmin && !historicoForm.fecha_pedido_real) {
  setError("Completá la fecha real del pedido para la carga histórica.");
  setSaving(false);
  return;
}

if (
  esCargaHistoricaAdmin &&
  historicoForm.status === "ENTREGADO" &&
  !historicoForm.fecha_entrega_real
) {
  setError("Completá la fecha real de entrega para el informe entregado.");
  setSaving(false);
  return;
}

const esHistoricoObservado =
  esCargaHistoricaAdmin && historicoForm.result === "OBSERVADO";

const statusInicial = esHistoricoObservado
  ? "EN CURSO"
  : esCargaHistoricaAdmin
  ? historicoForm.status
  : "SOLICITADO";

const resultInicial = esHistoricoObservado
  ? null
  : esCargaHistoricaAdmin
  ? historicoForm.result === "PENDIENTE"
    ? null
    : historicoForm.result
  : null;

const fechaPedidoReal = esCargaHistoricaAdmin
  ? normalizeDateForDb(historicoForm.fecha_pedido_real)
  : null;

const fechaEntregaReal =
  esCargaHistoricaAdmin && historicoForm.status === "ENTREGADO"
    ? normalizeDateForDb(historicoForm.fecha_entrega_real)
    : null;


    const payload = {
      tienda: (form.tienda || "").trim(),
      franquiciado: (form.franquiciado || "").trim().toUpperCase(),
      dominio: (form.dominio || "").trim().toUpperCase() || null,
      requester_email: requesterEmail,
      type: tipoInforme,
status: statusInicial,
result: resultInicial,
fecha_pedido_real: fechaPedidoReal,
fecha_entrega_real: fechaEntregaReal,
carga_historica: esCargaHistoricaAdmin,
datos_legajo_actualizado_en: fechaEntregaReal || null,
observed_date:
  esCargaHistoricaAdmin && resultInicial === "OBSERVADO"
    ? fechaEntregaReal
    : null,
observed_status:
  esCargaHistoricaAdmin && resultInicial === "OBSERVADO"
    ? "OBSERVADO"
    : null,
      notes: (form.notes || "").trim() || null,
      cc_email: (form.cc_email || "").trim() || null,
      identificacion_tipo_sujeto: form.identificacion_tipo_sujeto,
      identificacion_nombre:
        (form.identificacion_nombre || "").trim().toUpperCase() || null,
      identificacion_dni: form.identificacion_dni || null,
      identificacion_cuit: form.identificacion_cuit || null,

      ...(datosDominioAplicados || {}),
    };

    const { data: requestData, error: insertError } = await supabase
  .from("dia_requests")
  .insert(payload)
  .select("id")
  .single();

if (insertError) throw insertError;

const tituloHistorialInicial = esCargaHistoricaAdmin
  ? "Carga histórica del informe"
  : "Solicitud de informe creada";

const detalleHistorialInicial = esCargaHistoricaAdmin
  ? {
      carga_historica: true,
      fecha_pedido_real: fechaPedidoReal,
      fecha_entrega_real: fechaEntregaReal,
      status: statusInicial,
      result: resultInicial,
      descripcion:
        "SAKI cargó administrativamente un informe solicitado con anterioridad al uso del portal.",
    }
  : {
      carga_historica: false,
      status: statusInicial,
      descripcion: "Día creó una nueva solicitud de informe desde el portal.",
    };

const { error: historyError } = await supabase
  .from("dia_requests_history")
  .insert({
    request_id: requestData.id,
    tipo_evento: esCargaHistoricaAdmin
      ? "carga_historica_informe"
      : "solicitud_informe_creada",
    titulo: tituloHistorialInicial,
    detalle: detalleHistorialInicial,
    detalle_texto: esCargaHistoricaAdmin
      ? `Carga histórica registrada por SAKI. Fecha real del pedido: ${
          fechaPedidoReal || "sin informar"
        }${
          fechaEntregaReal
            ? `. Fecha real de entrega: ${fechaEntregaReal}`
            : ""
        }.`
      : "Solicitud de informe creada por Día desde el portal.",
    created_by_email: requesterEmail || null,
    created_at: new Date().toISOString(),
  });

if (historyError) throw historyError;

if ((form.notes || "").trim()) {
  const { error: noteError } = await supabase.from("dia_notes").insert({
    request_id: requestData.id,
    author_id: userId,
    note: (form.notes || "").trim(),
  });

  if (noteError) throw noteError;
}

await enviarNotificacionNuevoInforme({
  requestId: requestData.id,
  payload,
  requesterEmail,
});

setGuardado(true);

    setTimeout(() => {
      setGuardado(false);
    }, 3000);

    setForm({
      tienda: "",
      franquiciado: "",
      dominio: "",
      identificacion_nombre: "",
      identificacion_dni: "",
      identificacion_cuit: "",
      cc_email: "",
      notes: "",
    });

    setNotasOpen(false);
  } catch (err) {
    setError(err.message || "No se pudo guardar la solicitud.");
    setGuardado(false);
  } finally {
    setSaving(false);
  }
};

  const muestraBloqueExtra =
  tipoInforme === "anotaciones_personales" ||
  tipoInforme === "indice_titularidad";

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
  <strong style={requesterLineValueStyle}>
  {currentUserEmail || "—"}
</strong>
</div>
            </div>

<Link href="/dia/informes" style={backButtonStyle}>
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
  value={form.tienda}
  onChange={handleChange("tienda")}
/>

     <Field
  label="Franquiciado *"
  placeholder="Nombre del franquiciado"
  icon={<Building2 size={18} />}
  value={form.franquiciado}
  onChange={handleChange("franquiciado")}
/>

        <Field
  label={dominioLabel}
  placeholder={dominioPlaceholder}
  icon={<Car size={18} />}
  value={form.dominio}
  onChange={handleDominioChange}
/>
      </div>
      {isAdmin &&
  (tipoInforme === "informe_dominio" ||
    tipoInforme === "certificado_dominio") &&
  form.dominio &&
  (buscandoDominioPrevio || dominioPrevioMsg) && (
    <div
      style={{
        marginTop: "14px",
        borderRadius: "16px",
        border: dominioPrevio
          ? "1px solid rgba(34,197,94,0.24)"
          : "1px solid rgba(96,165,250,0.18)",
        background: dominioPrevio
          ? "linear-gradient(180deg, rgba(22,101,52,0.16), rgba(7,30,55,0.42))"
          : "rgba(37,99,235,0.10)",
        padding: "14px 16px",
        color: "#dbeafe",
        fontSize: "13px",
        lineHeight: 1.45,
      }}
    >
      <div
        style={{
          fontWeight: 850,
          color: dominioPrevio ? "#bbf7d0" : "#bfdbfe",
          marginBottom: "6px",
        }}
      >
        {buscandoDominioPrevio
          ? "Buscando antecedentes del dominio..."
          : dominioPrevio
          ? "Datos previos encontrados"
          : "Consulta de antecedentes"}
      </div>

      <div>
        {buscandoDominioPrevio
          ? "Estamos verificando si este dominio ya tiene datos cargados en otro legajo."
          : dominioPrevioMsg}
      </div>

      {dominioPrevio && (
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              color: "rgba(226,237,249,0.84)",
              fontSize: "12px",
            }}
          >
            {dominioPrevio.marca || "Marca sin cargar"} ·{" "}
            {dominioPrevio.modelo || "Modelo sin cargar"} ·{" "}
            {dominioPrevio.modelo_anio || "Año sin cargar"}
          </div>

          <button
            type="button"
            onClick={handleUsarDatosDominioPrevio}
            style={{
              height: "34px",
              padding: "0 13px",
              borderRadius: "999px",
              border: "1px solid rgba(34,197,94,0.28)",
              background: "rgba(22,163,74,0.18)",
              color: "#bbf7d0",
              fontSize: "12px",
              fontWeight: 850,
              cursor: "pointer",
            }}
          >
            Usar datos anteriores
          </button>
        </div>
      )}
    </div>
  )}
      {isAdmin && (
  <>
    <div style={sectionDividerStyle} />

    <div style={extraBlockHeaderStyle}>
      <h2 style={sectionTitleStyle}>Carga histórica / administrativa</h2>

      <p style={sectionTextStyle}>
        Uso exclusivo SAKI. Permite cargar informes ya pedidos o entregados con
        sus fechas reales.
      </p>
    </div>

    <div style={{ ...reportTypeGridStyle, marginBottom: "16px" }}>
      <ReportTypeOption
        active={usarCargaHistorica}
        onClick={() => setUsarCargaHistorica((prev) => !prev)}
        title={
          usarCargaHistorica
            ? "Carga histórica activada"
            : "Usar fechas manuales"
        }
      />
    </div>

    {usarCargaHistorica && (
      <div style={gridThreeStyle}>
        <Field
          label="Fecha real del pedido"
          placeholder="AAAA-MM-DD"
          icon={<FileText size={18} />}
          value={historicoForm.fecha_pedido_real}
          onChange={handleHistoricoChange("fecha_pedido_real")}
        />

        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Estado operativo</label>
          <div style={inputWrapStyle}>
            <span style={inputIconStyle}>
              <ShieldCheck size={18} />
            </span>

            <select
              value={historicoForm.status}
              onChange={handleHistoricoChange("status")}
              style={{
                ...inputStyle,
                cursor: "pointer",
              }}
            >
              <option value="SOLICITADO">SOLICITADO</option>
              <option value="EN CURSO">EN CURSO</option>
              <option value="ENTREGADO">ENTREGADO</option>
              <option value="ANULADO">ANULADO</option>
            </select>
          </div>
        </div>

        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Resultado</label>
          <div style={inputWrapStyle}>
            <span style={inputIconStyle}>
              <ShieldCheck size={18} />
            </span>

            <select
              value={historicoForm.result}
              onChange={handleHistoricoChange("result")}
              style={{
                ...inputStyle,
                cursor: "pointer",
              }}
            >
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="APROBADO">APROBADO</option>
              <option value="OBSERVADO">OBSERVADO</option>
            </select>
          </div>
        </div>

        {historicoForm.status === "ENTREGADO" && (
          <Field
            label="Fecha real de entrega"
            placeholder="AAAA-MM-DD"
            icon={<FileText size={18} />}
            value={historicoForm.fecha_entrega_real}
            onChange={handleHistoricoChange("fecha_entrega_real")}
          />
        )}
      </div>
    )}
  </>
)}

      {muestraBloqueExtra && (
        <>
          <div style={sectionDividerStyle} />

          <div style={extraBlockHeaderStyle}>
            <h2 style={sectionTitleStyle}>{bloqueExtraTitulo}</h2>

            {bloqueExtraTexto && (
              <p style={sectionTextStyle}>{bloqueExtraTexto}</p>
            )}
          </div>
<div style={{ ...reportTypeGridStyle, marginBottom: "16px" }}>
  <ReportTypeOption
    active={form.identificacion_tipo_sujeto === "persona_humana"}
    onClick={() =>
      setForm((prev) => ({
        ...prev,
        identificacion_tipo_sujeto: "persona_humana",
      }))
    }
    title="Persona humana"
  />

  <ReportTypeOption
    active={form.identificacion_tipo_sujeto === "persona_juridica"}
    onClick={() =>
      setForm((prev) => ({
        ...prev,
        identificacion_tipo_sujeto: "persona_juridica",
        identificacion_dni: "",
      }))
    }
    title="Persona jurídica"
  />
</div>


          <div style={gridThreeStyle}>
            <Field
  label={nombrePersonaLabel}
  placeholder="Ejemplo: PÉREZ JUAN / RAZÓN SOCIAL"
  icon={<UserRound size={18} />}
  value={form.identificacion_nombre}
  onChange={handleChange("identificacion_nombre")}
/>

<Field
  label={
    form.identificacion_tipo_sujeto === "persona_juridica"
      ? "DNI"
      : "DNI *"
  }
  placeholder={
    form.identificacion_tipo_sujeto === "persona_juridica"
      ? "No aplica para persona jurídica"
      : "Ejemplo: 32.652.653"
  }
  icon={<FileText size={18} />}
  value={form.identificacion_dni}
  onChange={handleDniChange}
  disabled={form.identificacion_tipo_sujeto === "persona_juridica"}
/>

<Field
  label="CUIT / CUIL *"
  placeholder="Ejemplo: 20-32652653-8"
  icon={<ShieldCheck size={18} />}
  value={form.identificacion_cuit}
  onChange={handleCuitChange}
/>
          </div>
        </>
      )}

{error && (
  <div style={errorNoticeStyle}>
    {error}
  </div>
)}

      {guardado && (
        <div style={successNoticeStyle}>
          Solicitud guardada correctamente. Ya se encuentra disponible en el listado de informes.
        </div>
      )}

      <div style={sectionDividerStyle} />

      <div style={pedidoNotesHeaderStyle}>
  <div>
    <h2 style={sectionTitleStyle}>Notas del pedido</h2>
    <p style={sectionTextStyle}>
      Podés dejar una nota inicial para este pedido. Las respuestas y el seguimiento se gestionarán desde el detalle del informe.
    </p>
  </div>
</div>

<div style={pedidoNotesContentStyle}>
  <div style={pedidoNoteComposerStyle}>
    <textarea
      style={pedidoNoteTextareaStyle}
      placeholder="Escribir una nota inicial para este pedido..."
      rows={3}
      value={form.notes}
      onChange={handleChange("notes")}
    />
  </div>
<div
  style={{
    ...actionsStyle,
    marginTop: "18px",
    justifyContent: "flex-end",
  }}
>
  <button
    type="button"
    style={saveButtonStyle}
    onClick={handleGuardarSolicitud}
    disabled={saving}
  >
    {saving ? "Guardando..." : "Guardar solicitud"}
  </button>
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
</>
)}
</section>
        </main>
      </div>
    </div>
  );
}

function Field({ label, placeholder, icon, value, onChange, disabled }) {
  return (
    <div style={fieldWrapStyle}>
      <label style={labelStyle}>{label}</label>

      <div
        style={{
          ...inputWrapStyle,
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <span style={inputIconStyle}>{icon}</span>
        <input
          style={{
            ...inputStyle,
            cursor: disabled ? "not-allowed" : "text",
          }}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
        />
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
  fontSize: "13px",
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
const errorNoticeStyle = {
  marginTop: "14px",
  color: "#fecaca",
  background: "rgba(239,68,68,0.10)",
  border: "1px solid rgba(239,68,68,0.24)",
  borderRadius: "14px",
  padding: "12px 14px",
  fontSize: "14px",
  lineHeight: 1.4,
};