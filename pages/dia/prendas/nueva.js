import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../../lib/supabaseClient";

function getTodayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toUpper(value) {
  return (value || "").toString().toUpperCase();
}

function cleanUpper(value) {
  const v = (value || "").toString().trim().toUpperCase();
  return v === "" ? null : v;
}

function buildFullName(lastName, firstName) {
  return [lastName, firstName]
    .map((item) => (item || "").trim())
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
}

function onlyDigits(value) {
  return (value || "").replace(/\D/g, "").slice(0, 11);
}

function formatCuit(value) {
  const digits = onlyDigits(value);

  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
}

const normalizarEmailPrenda = (value) => {
  return String(value || "").trim().toLowerCase();
};

const separarEmailsPrenda = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => separarEmailsPrenda(item));
  }

  return String(value || "")
    .split(/[;,\n\s]+/)
    .map((email) => normalizarEmailPrenda(email))
    .filter((email) => email && email.includes("@"));
};

const emailsUnicosPrenda = (values) => {
  return Array.from(new Set(values.flatMap((value) => separarEmailsPrenda(value))));
};

const enviarNotificacionNuevaPrenda = async ({
  prendaId,
  payload,
  requesterEmail,
}) => {
  if (!prendaId) return;

  try {
    const mailAdminSaki = "rominamazzeo@gmail.com";
    const sectorResponsable = "Créditos y Cobranzas";

    const { data: perfilesSector, error: perfilesError } = await supabase
      .from("profiles")
      .select("email, sector, role")
      .eq("role", "member")
      .in("sector", ["Créditos y Cobranzas", "Creditos y Cobranzas"]);

    if (perfilesError) {
      console.error("Error buscando destinatarios de Prendas:", perfilesError);
    }

    const mailsSector = emailsUnicosPrenda(
      (perfilesSector || []).map((perfil) => perfil?.email)
    );

const destinatariosPrincipales = emailsUnicosPrenda([
  mailAdminSaki,
]);

// PRUEBA INTERNA: por ahora no se envía a miembros de Créditos y Cobranzas.
// Cuando validemos el mail, volvemos a agregar:
// ...mailsSector,

    if (!destinatariosPrincipales.length) {
      console.warn("No hay destinatarios para notificar la nueva prenda.");
      return;
    }

    const mailRes = await fetch("/api/dia/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: destinatariosPrincipales.join(","),
        cc: payload?.cc_email || "",
        subject: "SAKI | Nueva prenda cargada",
        html: `
          <div style="font-family: Arial, sans-serif; font-size: 14px; color: #111; line-height: 1.5;">
            <h2 style="margin: 0 0 16px 0; color: #0f172a;">Nueva prenda cargada</h2>

            <p style="margin: 0 0 16px 0;">
              Se registró una nueva prenda en el Portal Día.
            </p>

            <p style="margin: 0 0 8px 0;"><strong>Legajo:</strong> ${
              `PR-${String(prendaId || "").slice(0, 8).toUpperCase()}`
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Sector responsable:</strong> ${
              sectorResponsable
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Solicitante:</strong> ${
              requesterEmail || "-"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Tienda:</strong> ${
              payload?.tienda || "-"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Franquiciado:</strong> ${
              payload?.frq || "-"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>CUIT FRQ:</strong> ${
              payload?.frq_cuit || "-"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Dominio:</strong> ${
              payload?.dominio || "-"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Estado:</strong> ${
              payload?.estado || "Pendiente de envío"
            }</p>
            <p style="margin: 0 0 8px 0;"><strong>Fecha de envío:</strong> ${
              payload?.fecha_envio_oficina || "-"
            }</p>

            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;" />

            <p style="margin: 0; color: #475569;">
              Este mensaje fue generado automáticamente por SAKI Portal Día. Por favor, no responder a este correo.
            </p>
          </div>
        `,
        requestId: prendaId,
        threadId: null,
      }),
    });

    const mailJson = await mailRes.json().catch(() => null);

    if (mailJson?.threadId) {
      await supabase
        .from("dia_request_prendas")
        .update({ email_thread_id: mailJson.threadId })
        .eq("id", prendaId);
    }

    if (!mailRes.ok) {
      console.error("Error enviando notificación de nueva prenda:", mailJson);
    }
  } catch (mailError) {
    console.error("Error inesperado notificando nueva prenda:", mailError);
  }
};

export default function DiaPrendasNueva() {
  const router = useRouter();
  const dateInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
const [errorMsg, setErrorMsg] = useState("");
const [isAdmin, setIsAdmin] = useState(false);
const [tipoCarga, setTipoCarga] = useState("nueva");
const [fechaNoAplica, setFechaNoAplica] = useState(false);

  const [form, setForm] = useState({
  tienda: "",
  dominio: "",
  frq_apellido: "",
  frq_nombre: "",
  frq_cuit: "",
  titular_apellido: "",
  titular_nombre: "",
  titular_cuit: "",
  fecha_envio_oficina: "",
  cc_email: "",
});

  const todayStr = useMemo(() => getTodayLocalDateString(), []);

  useEffect(() => {
  async function fetchCurrentProfile() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsAdmin(false);
        setTipoCarga("nueva");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error cargando perfil:", profileError);
        setIsAdmin(false);
        setTipoCarga("nueva");
        return;
      }

      const userIsAdmin =
        (profile?.role || "").toString().trim().toLowerCase() === "admin";

      setIsAdmin(userIsAdmin);

if (!userIsAdmin) {
  setTipoCarga("nueva");
  setFechaNoAplica(false);
}
    } catch (error) {
      console.error("Error verificando usuario:", error);
      setIsAdmin(false);
      setTipoCarga("nueva");
    }
  }

  fetchCurrentProfile();
}, []);

  function setUpperField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: toUpper(value),
    }));
  }

  function setField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function setCuitField(name, value) {
  setForm((prev) => ({
    ...prev,
    [name]: formatCuit(value),
  }));
}

  function openDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    const tienda = form.tienda.trim();
const dominio = form.dominio.trim();
const frqApellido = form.frq_apellido.trim();
const frqNombre = form.frq_nombre.trim();
const frqCuit = onlyDigits(form.frq_cuit);
const fechaOperacion = form.fecha_envio_oficina;
const esCargaHistorica = isAdmin && tipoCarga === "historica";
const fechaNoAplicaAdmin = isAdmin && fechaNoAplica;
const ccEmailLimpio = emailsUnicosPrenda([form.cc_email]).join(",");

const camposFaltantes = [];

if (!tienda) camposFaltantes.push("Tienda");
if (!dominio) camposFaltantes.push("Dominio");
if (!frqApellido) camposFaltantes.push("Apellido FRQ");
if (!frqNombre) camposFaltantes.push("Nombre FRQ");
if (!frqCuit) camposFaltantes.push("CUIT FRQ");
if (!fechaOperacion && !fechaNoAplicaAdmin) {
  camposFaltantes.push(esCargaHistorica ? "Fecha de retiro" : "Fecha de envío");
}

if (camposFaltantes.length > 0) {
  setErrorMsg(`Falta completar: ${camposFaltantes.join(", ")}.`);
  return;
}

if (frqCuit.length !== 11) {
  setErrorMsg("El CUIT de FRQ debe tener 11 dígitos.");
  return;
}

if (!fechaNoAplicaAdmin && !esCargaHistorica && fechaOperacion < todayStr) {
  setErrorMsg("La Fecha de envío no puede ser anterior al día de hoy.");
  return;
}

if (!esCargaHistorica && !ccEmailLimpio) {
  const continuarSinCopia = window.confirm(
    "No agregaste destinatarios en copia.\n\nEl sector Créditos y Cobranzas recibirá las notificaciones automáticamente.\n\n¿Querés continuar sin agregar destinatarios en copia?"
  );

  if (!continuarSinCopia) {
    return;
  }
}

    const titularApellido = form.titular_apellido.trim();
const titularNombre = form.titular_nombre.trim();
const titularCuit = onlyDigits(form.titular_cuit);

const hayTitularApellido = titularApellido !== "";
const hayTitularNombre = titularNombre !== "";
const hayTitularCuit = titularCuit !== "";

const bloqueTitularIniciado =
  hayTitularApellido || hayTitularNombre || hayTitularCuit;

if (
  bloqueTitularIniciado &&
  (!hayTitularApellido || !hayTitularNombre || !hayTitularCuit)
) {
  setErrorMsg(
    "Si cargás Garante / Titular de dominio, completá Apellido, Nombre y CUIT."
  );
  return;
}

if (hayTitularCuit && titularCuit.length !== 11) {
  setErrorMsg("El CUIT de Garante / Titular de dominio debe tener 11 dígitos.");
  return;
}

    const frqCompuesto = buildFullName(form.frq_apellido, form.frq_nombre);
    const titularCompuesto = buildFullName(
      form.titular_apellido,
      form.titular_nombre
    );

    setSaving(true);

    try {
      const payload = {
  tienda: cleanUpper(form.tienda),
  dominio: cleanUpper(form.dominio),
  frq: cleanUpper(frqCompuesto),
  frq_cuit: frqCuit || null,
  titular_dominio: cleanUpper(titularCompuesto),
  titular_cuit: titularCuit || null,

  cc_email: ccEmailLimpio || null,

  fecha_envio_oficina: fechaNoAplicaAdmin ? null : fechaOperacion || null,
  fecha_retiro_final_real: null,

estado: "Pendiente de envío",
};

const { data: createdPrenda, error } = await supabase
  .from("dia_request_prendas")
  .insert([payload])
  .select("id")
  .single();

if (error) throw error;

const {
  data: { user },
} = await supabase.auth.getUser();

const { error: historyError } = await supabase
  .from("dia_request_prendas_history")
  .insert({
    prenda_id: createdPrenda.id,
    tipo_evento: "carga_inicial",
    titulo: esCargaHistorica
      ? "Carga histórica del legajo"
      : "Carga inicial de nueva prenda",
    detalle: {
  fecha_envio_inicial: fechaNoAplicaAdmin ? null : fechaOperacion || null,
  estado: "Pendiente de envío",
  tienda: cleanUpper(form.tienda),
  dominio: cleanUpper(form.dominio),
  frq: cleanUpper(frqCompuesto),
nota: fechaNoAplicaAdmin
  ? "Carga administrativa: fecha no aplica. Legajo incorporado para gestión de observación o regularización sin fecha de envío/retiro disponible."
  : esCargaHistorica
    ? "Legajo cargado administrativamente como carga histórica. Continúa el mismo circuito operativo que una prenda nueva."
    : null,
},
    created_by_name: user?.user_metadata?.full_name || null,
    created_by_email: user?.email || null,
    created_at: new Date().toISOString(),
  });

if (historyError) throw historyError;

await enviarNotificacionNuevaPrenda({
  prendaId: createdPrenda.id,
  payload,
  requesterEmail: user?.email || "",
});

router.push("/dia/prendas");
    } catch (err) {
      console.error("Error creando prenda:", err);
      setErrorMsg(err?.message || "No se pudo crear la prenda.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>Management &amp; Tracking</div>
            <h1 style={titleStyle}>Nueva prenda</h1>
          </div>

          <Link href="/dia/prendas" style={secondaryTopButtonStyle}>
            Volver al listado
          </Link>
        </div>

        {errorMsg ? <div style={errorBoxStyle}>{errorMsg}</div> : null}

        <div style={formCardStyle}>
          <div style={formHeaderStyle}>
  <div>
    <div style={sectionTitleStyle}>Datos base</div>
    <div style={sectionSubtitleStyle}>
      {tipoCarga === "historica"
        ? "Carga administrativa de una prenda histórica ya retirada."
        : "Ingresá los datos y guardá la solicitud."}
    </div>
  </div>

  {isAdmin && (
    <div style={tipoCargaBoxStyle}>
      <span style={tipoCargaLabelStyle}>Tipo de carga</span>

      <div style={tipoCargaButtonsStyle}>
        <button
          type="button"
          onClick={() => setTipoCarga("nueva")}
          style={{
            ...tipoCargaButtonStyle,
            ...(tipoCarga === "nueva" ? tipoCargaButtonActiveStyle : {}),
          }}
        >
          Solicitud nueva
        </button>

        <button
          type="button"
          onClick={() => setTipoCarga("historica")}
          style={{
            ...tipoCargaButtonStyle,
            ...(tipoCarga === "historica" ? tipoCargaButtonActiveStyle : {}),
          }}
        >
          Carga histórica
        </button>
      </div>
    </div>
  )}
</div>

          <form id="prenda-form" onSubmit={handleSubmit}>
            <div style={rowTwoColsStyle}>
              <div style={fieldBlockStyle}>
                <label style={labelStyle}>Tienda</label>
                <input
                  type="text"
                  value={form.tienda}
                  onChange={(e) => setUpperField("tienda", e.target.value)}
                  placeholder="Ej. 125"
                  style={inputStyle}
                />
              </div>

              <div style={fieldBlockStyle}>
                <label style={labelStyle}>Dominio</label>
                <input
                  type="text"
                  value={form.dominio}
                  onChange={(e) => setUpperField("dominio", e.target.value)}
                  placeholder="AA123BB"
                  style={{
                    ...inputStyle,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>

            <div style={groupSectionStyle}>
  <label style={labelStyle}>FRQ</label>

  <div style={groupInnerGrid3Style}>
    <div style={fieldBlockStyle}>
      <span style={subLabelStyle}>Apellido</span>
      <input
        type="text"
        value={form.frq_apellido}
        onChange={(e) => setUpperField("frq_apellido", e.target.value)}
        placeholder="Ej. PEREZ"
        style={inputStyle}
      />
    </div>

    <div style={fieldBlockStyle}>
      <span style={subLabelStyle}>Nombre</span>
      <input
        type="text"
        value={form.frq_nombre}
        onChange={(e) => setUpperField("frq_nombre", e.target.value)}
        placeholder="Ej. JUAN"
        style={inputStyle}
      />
    </div>

    <div style={fieldBlockStyle}>
      <span style={subLabelStyle}>CUIT</span>
      <input
        type="text"
        value={form.frq_cuit}
        onChange={(e) => setCuitField("frq_cuit", e.target.value)}
        placeholder="20-12345678-9"
        inputMode="numeric"
        style={inputStyle}
      />
    </div>
  </div>
</div>

            <div style={groupSectionStyle}>
  <label style={labelStyle}>Garante / Titular de dominio (opcional)</label>

  <div style={groupInnerGrid3Style}>
    <div style={fieldBlockStyle}>
      <span style={subLabelStyle}>Apellido</span>
      <input
        type="text"
        value={form.titular_apellido}
        onChange={(e) => setUpperField("titular_apellido", e.target.value)}
        placeholder="Ej. GOMEZ"
        style={inputStyle}
      />
    </div>

    <div style={fieldBlockStyle}>
      <span style={subLabelStyle}>Nombre</span>
      <input
        type="text"
        value={form.titular_nombre}
        onChange={(e) => setUpperField("titular_nombre", e.target.value)}
        placeholder="Ej. MARIA"
        style={inputStyle}
      />
    </div>

    <div style={fieldBlockStyle}>
      <span style={subLabelStyle}>CUIT</span>
      <input
        type="text"
        value={form.titular_cuit}
        onChange={(e) => setCuitField("titular_cuit", e.target.value)}
        placeholder="20-12345678-9"
        inputMode="numeric"
        style={inputStyle}
      />
    </div>
  </div>
</div>

<div style={dateSectionStyle}>
  <div style={dateFieldStyle}>
    <label style={labelStyle}>
      {tipoCarga === "historica" ? "Fecha de retiro" : "Fecha de envío"}
    </label>

<div style={dateInputWrapStyle}>
  <input
    ref={dateInputRef}
    type="date"
    value={form.fecha_envio_oficina}
    min={tipoCarga === "historica" ? undefined : todayStr}
    disabled={isAdmin && fechaNoAplica}
    onChange={(e) =>
      setField("fecha_envio_oficina", e.target.value)
    }
    style={{
      ...dateInputStyle,
      opacity: isAdmin && fechaNoAplica ? 0.55 : 1,
      cursor: isAdmin && fechaNoAplica ? "not-allowed" : "auto",
    }}
  />

  <button
    type="button"
    onClick={openDatePicker}
    disabled={isAdmin && fechaNoAplica}
    style={{
      ...calendarButtonStyle,
      opacity: isAdmin && fechaNoAplica ? 0.45 : 1,
      cursor: isAdmin && fechaNoAplica ? "not-allowed" : "pointer",
    }}
    aria-label="Abrir calendario"
    title="Abrir calendario"
  >
    📅
  </button>
</div>

{isAdmin && (
  <label style={fechaNoAplicaBoxStyle}>
    <input
      type="checkbox"
      checked={fechaNoAplica}
      onChange={(e) => {
        const checked = e.target.checked;
        setFechaNoAplica(checked);

        if (checked) {
          setField("fecha_envio_oficina", "");
        }
      }}
      style={fechaNoAplicaCheckboxStyle}
    />
    <span>
      Fecha no aplica / carga administrativa
    </span>
  </label>
)}
  </div>
</div>

<div style={helperRowStyle}>
  <span style={helperTextStyle}>
    {tipoCarga === "historica"
  ? "Carga histórica: permite registrar una fecha anterior de envío inicial. Luego continúa el mismo circuito operativo que una prenda nueva."
  : "No permite elegir una fecha anterior a hoy."}
  </span>
</div>
<div style={groupSectionStyle}>
  <label style={labelStyle}>¿Querés agregar destinatarios en copia?</label>

  <div
    style={{
      ...sectionSubtitleStyle,
      maxWidth: "820px",
    }}
  >
    El sector Créditos y Cobranzas recibirá las notificaciones automáticamente.
    Si necesitás sumar destinatarios adicionales, agregá sus correos en este campo.
    <br />
    <strong style={{ color: "#dbeafe" }}>Importante:</strong>{" "}
    los destinatarios en copia recibirán las notificaciones futuras vinculadas a este legajo.
  </div>

  <textarea
    value={form.cc_email}
    onChange={(e) => setField("cc_email", e.target.value)}
    placeholder="Ej.: nombre@empresa.com otro@empresa.com"
    style={{
      ...inputStyle,
      height: "auto",
      minHeight: "92px",
      padding: "14px 18px",
      resize: "vertical",
      lineHeight: 1.45,
      fontFamily: "inherit",
    }}
  />

  <span style={helperTextStyle}>
    Podés agregar uno o varios destinatarios.
  </span>
</div>
            <div style={footerBarStyle}>
              <div style={footerTextStyle}>
                Alta inicial · luego continúa en el listado y detalle de la prenda
              </div>

              <div style={footerActionsStyle}>
                <Link href="/dia/prendas" style={secondaryButtonStyle}>
                  Cancelar
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...primaryButtonStyle,
                    opacity: saving ? 0.7 : 1,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
            <div style={pedidoHelpBoxStyle}>
  <div>
    <div style={pedidoHelpTitleStyle}>Ayuda SAKI</div>

    <div style={pedidoHelpTextStyle}>
      ¿Necesitás asistencia sobre la carga de esta prenda? Podés contactar al
      equipo SAKI por WhatsApp para consultas operativas rápidas.
    </div>

    <div style={pedidoHelpDisclaimerStyle}>
      Las definiciones formales deben quedar registradas en el legajo.
    </div>
  </div>

  <a
    href="https://wa.me/5491157714212?text=Hola%20SAKI%2C%20necesito%20asistencia%20con%20la%20carga%20de%20una%20prenda%20en%20el%20Portal%20D%C3%ADa."
    target="_blank"
    rel="noreferrer"
    style={pedidoWhatsappButtonStyle}
  >
    WhatsApp SAKI
  </a>
</div>
          </form>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(26,78,154,0.20), transparent 28%), linear-gradient(180deg, #03122c 0%, #05152f 45%, #071327 100%)",
  padding: "32px 24px 56px",
};

const shellStyle = {
  maxWidth: "1380px",
  margin: "0 auto",
  color: "#e5eefc",
};

const heroStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "18px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const eyebrowStyle = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#7dd3fc",
  marginBottom: "12px",
};

const titleStyle = {
  margin: 0,
  fontSize: "32px",
  lineHeight: 1.08,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "#f8fbff",
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 18px",
  borderRadius: "14px",
  textDecoration: "none",
  fontWeight: 700,
  letterSpacing: "0.01em",
  color: "#f8fbff",
  background: "linear-gradient(135deg, #0f274d 0%, #143766 100%)",
  border: "1px solid rgba(125,211,252,0.18)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
};

const secondaryTopButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 18px",
  borderRadius: "14px",
  textDecoration: "none",
  fontWeight: 700,
  color: "#dbeafe",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.18)",
};

const formCardStyle = {
  background: "rgba(8, 22, 46, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "24px",
  padding: "26px",
  boxShadow: "0 18px 60px rgba(0,0,0,0.24)",
  backdropFilter: "blur(10px)",
};

const formHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
  flexWrap: "wrap",
  marginBottom: "24px",
};

const sectionTitleStyle = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#f8fbff",
  marginBottom: "6px",
};

const sectionSubtitleStyle = {
  fontSize: "14px",
  color: "#8da0be",
  lineHeight: 1.5,
};

const rowTwoColsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
  gap: "18px",
};

const groupSectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginTop: "18px",
};

const groupInnerGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(240px, 1fr))",
  gap: "14px",
};

const groupInnerGrid3Style = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(200px, 1fr))",
  gap: "14px",
};

const dateSectionStyle = {
  marginTop: "18px",
  display: "grid",
  gridTemplateColumns: "minmax(280px, 420px)",
};

const dateFieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const fieldBlockStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: 0,
};

const helperRowStyle = {
  marginTop: "14px",
  display: "flex",
  justifyContent: "flex-end",
};

const helperTextStyle = {
  fontSize: "13px",
  color: "#8da0be",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#8fa4c4",
};

const subLabelStyle = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "#8da0be",
};

const inputStyle = {
  width: "100%",
  height: "54px",
  borderRadius: "16px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3, 11, 24, 0.55)",
  color: "#f8fbff",
  padding: "0 18px",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

const dateInputWrapStyle = {
  position: "relative",
};

const dateInputStyle = {
  ...inputStyle,
  paddingRight: "52px",
};

const calendarButtonStyle = {
  position: "absolute",
  top: "50%",
  right: "12px",
  transform: "translateY(-50%)",
  width: "32px",
  height: "32px",
  borderRadius: "10px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(255,255,255,0.04)",
  color: "#cfe7ff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
};

const footerBarStyle = {
  marginTop: "28px",
  paddingTop: "22px",
  borderTop: "1px solid rgba(148, 163, 184, 0.14)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const footerTextStyle = {
  fontSize: "13px",
  color: "#8da0be",
};

const footerActionsStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: 700,
  color: "#dbeafe",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.18)",
};

const pedidoHelpBoxStyle = {
  marginTop: "18px",
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

const errorBoxStyle = {
  marginBottom: "18px",
  padding: "14px 16px",
  borderRadius: "16px",
  background: "rgba(127, 29, 29, 0.24)",
  border: "1px solid rgba(248, 113, 113, 0.24)",
  color: "#fecaca",
  fontSize: "14px",
  fontWeight: 500,
};

const tipoCargaBoxStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  alignItems: "flex-end",
};

const tipoCargaLabelStyle = {
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#8fa4c4",
};

const tipoCargaButtonsStyle = {
  display: "inline-flex",
  gap: "8px",
  padding: "5px",
  borderRadius: "999px",
  background: "rgba(3, 11, 24, 0.46)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
};

const tipoCargaButtonStyle = {
  height: "34px",
  padding: "0 13px",
  borderRadius: "999px",
  border: "1px solid transparent",
  background: "transparent",
  color: "#8da0be",
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
};

const tipoCargaButtonActiveStyle = {
  background: "rgba(59,130,246,0.18)",
  border: "1px solid rgba(96,165,250,0.32)",
  color: "#dbeafe",
};

const fechaNoAplicaBoxStyle = {
  marginTop: "10px",
  display: "inline-flex",
  alignItems: "center",
  gap: "9px",
  color: "#cfe7ff",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
};

const fechaNoAplicaCheckboxStyle = {
  width: "16px",
  height: "16px",
  accentColor: "#2563eb",
  cursor: "pointer",
};