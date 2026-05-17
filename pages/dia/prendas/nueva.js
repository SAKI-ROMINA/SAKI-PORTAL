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
export default function DiaPrendasNueva() {
  const router = useRouter();
  const dateInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
const [tipoCarga, setTipoCarga] = useState("nueva");
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
const fechaEnvio = form.fecha_envio_oficina;

    if (!tienda || !dominio || !frqApellido || !frqNombre || !frqCuit || !fechaEnvio) {
  setErrorMsg(
    "Completá Tienda, Dominio, Apellido, Nombre y CUIT de FRQ, y Fecha de envío."
  );
  return;
}

if (frqCuit.length !== 11) {
  setErrorMsg("El CUIT de FRQ debe tener 11 dígitos.");
  return;
}

    if (fechaEnvio < todayStr) {
      setErrorMsg("La Fecha de envío no puede ser anterior al día de hoy.");
      return;
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
  fecha_envio_oficina: form.fecha_envio_oficina || null,
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
    titulo: "Carga inicial de nueva prenda",
    detalle: {
      fecha_envio_inicial: form.fecha_envio_oficina || null,
      estado: "Pendiente de envío",
      tienda: cleanUpper(form.tienda),
      dominio: cleanUpper(form.dominio),
      frq: cleanUpper(frqCompuesto),
    },
    created_by_name: user?.user_metadata?.full_name || null,
    created_by_email: user?.email || null,
    created_at: new Date().toISOString(),
  });

if (historyError) throw historyError;

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
                <label style={labelStyle}>Fecha de envío</label>

                <div style={dateInputWrapStyle}>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={form.fecha_envio_oficina}
                    min={todayStr}
                    onChange={(e) =>
                      setField("fecha_envio_oficina", e.target.value)
                    }
                    style={dateInputStyle}
                  />

                  <button
                    type="button"
                    onClick={openDatePicker}
                    style={calendarButtonStyle}
                    aria-label="Abrir calendario"
                    title="Abrir calendario"
                  >
                    📅
                  </button>
                </div>
              </div>
            </div>

            <div style={helperRowStyle}>
              <span style={helperTextStyle}>
                No permite elegir una fecha anterior a hoy.
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