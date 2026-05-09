import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../../lib/supabaseClient";
import { Store, UserRound, Car } from "lucide-react";

function formatDate(value) {
  if (!value) return "—";

  const raw = String(value).trim();
  const onlyDate = raw.slice(0, 10);
  const match = onlyDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }

  return raw;
}

function formatMoney(value, currency = "$") {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return value;

  function formatMoneyInput(value) {
  if (value === null || value === undefined || value === "") return "";

  const normalized = String(value)
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  if (!normalized) return "";

  const n = Number(normalized);
  if (Number.isNaN(n)) return value;

  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);

  return `${currency} ${formatted}`;
}

function normalizeStatus(value) {
  return (value || "")
    .toString()
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toNullable(value) {
  const v = (value || "").toString().trim();
  return v === "" ? null : v;
}

function toNullableUpper(value) {
  const v = (value || "").toString().trim().toUpperCase();
  return v === "" ? null : v;
}

function toNullableNumber(value) {
  if (value === "" || value === null || typeof value === "undefined") return null;
  const normalized = String(value).replace(/\./g, "").replace(",", ".").trim();
  if (!normalized) return null;
  const num = Number(normalized);
  return Number.isNaN(num) ? null : num;
}

function onlyDigits(value) {
  return (value || "").toString().replace(/\D/g, "").slice(0, 11);
}

function formatCuit(value) {
  const digits = onlyDigits(value);

  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
}

function getStatusColors(value) {
  const v = normalizeStatus(value);

  if (v === "PENDIENTE" || v === "PENDIENTE DE ENVIO") {
    return {
      bg: "rgba(245, 158, 11, 0.16)",
      border: "rgba(245, 158, 11, 0.28)",
      color: "#fde68a",
    };
  }

  if (v === "EN CURSO") {
    return {
      bg: "rgba(14, 165, 233, 0.16)",
      border: "rgba(14, 165, 233, 0.28)",
      color: "#bae6fd",
    };
  }

  if (v === "OBSERVADA" || v === "OBSERVADO") {
  return {
    bg: "rgba(239, 68, 68, 0.16)",
    border: "rgba(239, 68, 68, 0.28)",
    color: "#fca5a5",
    pillBg:
      "linear-gradient(135deg, rgba(220,38,38,0.96) 0%, rgba(127,29,29,0.92) 100%)",
    pillBorder: "1px solid rgba(252,165,165,0.20)",
  };
}

  if (v === "INSCRIPTA") {
    return {
      bg: "rgba(16, 185, 129, 0.16)",
      border: "rgba(16, 185, 129, 0.28)",
      color: "#a7f3d0",
    };
  }

  if (
    v === "DISPONIBLE PARA RETIRO" ||
    v === "RETIRADA" ||
    v === "LEGAJO CERRADO" ||
    v === "FINALIZADA"
  ) {
    return {
      bg: "rgba(34, 211, 238, 0.14)",
      border: "rgba(34, 211, 238, 0.28)",
      color: "#cffafe",
    };
  }

  if (v === "ANULADA") {
    return {
      bg: "rgba(244, 63, 94, 0.16)",
      border: "rgba(244, 63, 94, 0.28)",
      color: "#fecdd3",
    };
  }

  return {
    bg: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.10)",
    color: "#e2e8f0",
  };
}

function StatusPill({ value }) {
  const colors = getStatusColors(value);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        minHeight: "30px",
        padding: "0 13px",
        borderRadius: "999px",
        background:
  colors.pillBg ||
  "linear-gradient(135deg, rgba(112, 194, 19, 0.96) 0%, rgba(20,55,102,0.92) 100%)",
border: colors.pillBorder || "1px solid rgba(125,211,252,0.14)",
        border: "1px solid rgba(125,211,252,0.14)",
        boxShadow:
          "0 8px 18px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.05)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "999px",
          background: colors.color,
          boxShadow: `0 0 0 3px ${colors.bg}`,
          flexShrink: 0,
        }}
      />

      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#e7f0ff",
          lineHeight: 1,
        }}
      >
        {value || "—"}
      </span>
    </span>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section style={sectionCardStyle}>
      <div style={sectionHeaderStyle}>
        <div style={sectionTitleStyle}>{title}</div>
        {subtitle ? <div style={sectionSubtitleStyle}>{subtitle}</div> : null}
      </div>

      {children}
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={fieldCardStyle}>
      <div style={fieldHeaderStyle}>
        <div style={labelStyle}>{label}</div>
        {hint ? <div style={hintStyle}>{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

function HeroMetric({ icon: Icon, label, value }) {
  const text = value || "—";

  return (
    <div style={heroMetricStyle}>
      <div style={heroIconStyle}>
        <Icon size={28} strokeWidth={2} />
      </div>

      <div>
        <div style={heroLabelStyle}>{label}</div>
        <div style={heroValueStyle}>{text}</div>
      </div>
    </div>
  );
}

function TraceBlock({ title, children }) {
  return (
    <div style={traceBlockStyle}>
      <div style={traceTitleStyle}>{title}</div>
      <div style={traceBlockInnerStyle}>{children}</div>
    </div>
  );
}

const ESTADOS = [
  "PENDIENTE DE ENVÍO",
  "EN CURSO",
  "OBSERVADA",
  "INSCRIPTA",
  "DISPONIBLE PARA RETIRO",
  "RETIRADA",
  "LEGAJO CERRADO",
  "ANULADA",
];

const INCIDENCIAS = [
  { value: "error_documental", label: "ERROR DOCUMENTAL" },
  { value: "observacion_registral", label: "OBSERVACIÓN REGISTRAL" },
];
const MONEDAS = ["$", "U$S"];
const GRADOS = ["1°", "2°", "3°"];

function splitFullName(value) {
  const parts = (value || "")
    .toString()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    apellido: parts[0] || "",
    nombre: parts.slice(1).join(" "),
  };
}

export default function DetallePrendaPage() {
  const router = useRouter();
  const { id } = router.query;

  const isAdmin = true;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [row, setRow] = useState(null);
  const [showReprogramarEnvio, setShowReprogramarEnvio] = useState(false);
  const [nuevaFechaEnvio, setNuevaFechaEnvio] = useState("");
  const [showEditarDatosIniciales, setShowEditarDatosIniciales] = useState(false);

  const [editDatosIniciales, setEditDatosIniciales] = useState({
  tienda: "",
  dominio: "",
  frq_apellido: "",
  frq_nombre: "",
  frq_cuit: "",
  titular_apellido: "",
  titular_nombre: "",
  titular_cuit: "",
});
  const reprogramarFechaInputRef = useRef(null);

  const [form, setForm] = useState({
    tienda: "",
    frq: "",
    frq_cuit: "",
    dominio: "",
    titular_dominio: "",
    titular_cuit: "",
    porcentaje_titular: "",
    condomino: "",
    porcentaje_condomino: "",
    incidencia_tipo: "",
    motivo_incidencia: "",
    estado: "PENDIENTE DE ENVÍO",
    fechaEnCurso: "",
    importe_prenda: "",
    moneda_importe: "$",
    plazo_anios: "",
    grado_prenda: "",
    escribania: "",
    numero_escritura: "",
    folio: "",
    fecha_escritura: "",
    radicacion: "",
    registro_interviniente: "",
    fecha_envio_oficina: "",
    fecha_recepcion_inicial_oficina: "",
    fecha_disponible_retiro_correccion: "",
    fecha_retiro_correccion: "",
    fecha_reenvio_oficina: "",
    fecha_reingreso_correccion: "",
    fecha_presentacion_registro: "",
    fecha_inscripcion: "",
    fecha_vencimiento: "",
    fecha_disponible_retiro_final: "",
    fecha_real_retiro_final: "",
    fecha_observacion: "",
    fecha_retiro_subsanar_observacion: "",
    fecha_reingreso_subsanada: "",
  });

  const estadoActual = normalizeStatus(form.estado);
  const isInscripta = estadoActual === "INSCRIPTA";
  const isObservada =
    estadoActual === "OBSERVADA" || estadoActual === "OBSERVADO";

  const fechaProgramada =
  estadoActual === "EN CURSO"
    ? form?.fechaEnCurso || null
    : form?.fecha_envio_oficina || null;

  const fechaMostradaEstado =
  estadoActual === "EN CURSO" ? form.fechaEnCurso || null : fechaProgramada;

const leyendaFechaEstado =
  estadoActual === "EN CURSO" ? "Desde: " : "Programado: ";

  function formatFecha(valor) {
  return formatDate(valor);
}

function renderFechaEstadoActual() {
  if (estadoActual === "EN CURSO") {
    if (!form.fechaEnCurso) return null;

    return (
      <span
        style={{
          marginLeft: "auto",
          color: "#b9c7d8",
          fontSize: "14px",
          whiteSpace: "nowrap",
        }}
      >
        Desde:{" "}
        <strong style={{ color: "#ffffff" }}>
          {formatFecha(form.fechaEnCurso)}
        </strong>
      </span>
    );
  }

  if (!fechaProgramada) return null;

  return (
    <span
      style={{
        marginLeft: "auto",
        color: "#b9c7d8",
        fontSize: "14px",
        whiteSpace: "nowrap",
      }}
    >
      Programado:{" "}
      <strong style={{ color: "#ffffff" }}>
        {formatFecha(fechaProgramada)}
      </strong>
    </span>
  );
}
  useEffect(() => {
    if (!id) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchData() {
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from("dia_request_prendas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setRow(data);

      setForm({
        tienda: data?.tienda || "",
        frq: data?.frq || "",
        frq_cuit: formatCuit(data?.frq_cuit || ""),
        dominio: data?.dominio || "",
        titular_dominio: data?.titular_dominio || "",
        titular_cuit: formatCuit(data?.titular_cuit || ""),
        porcentaje_titular:
          data?.porcentaje_titular !== null &&
          data?.porcentaje_titular !== undefined
            ? String(data.porcentaje_titular)
            : "",
        condomino: data?.condomino || "",
        porcentaje_condomino:
          data?.porcentaje_condomino !== null &&
          data?.porcentaje_condomino !== undefined
            ? String(data.porcentaje_condomino)
            : "",
        incidencia_tipo: data?.incidencia_tipo || "",
        motivo_incidencia: data?.motivo_incidencia || "",
        estado: data?.estado || "PENDIENTE DE ENVÍO",
        importe_prenda:
          data?.importe_prenda !== null && data?.importe_prenda !== undefined
            ? String(data.importe_prenda)
            : "",
        moneda_importe: data?.moneda_importe || "$",
        grado_prenda: data?.grado_prenda || "",
        plazo_anios:
          data?.plazo_anios !== null && data?.plazo_anios !== undefined
            ? String(data.plazo_anios)
            : "",
        escribania: data?.escribania || "",
        numero_escritura: data?.numero_escritura || "",
        folio: data?.folio || "",
        fecha_escritura: data?.fecha_escritura || "",
        radicacion: data?.radicacion || "",
        registro_interviniente: data?.registro_interviniente || "",
        fecha_envio_oficina: data?.fecha_envio_oficina || "",
        fecha_recepcion_inicial_oficina:
          data?.fecha_recepcion_inicial_oficina || "",
        fecha_disponible_retiro_correccion:
          data?.fecha_disponible_retiro_correccion || "",
        fecha_retiro_correccion: data?.fecha_retiro_correccion || "",
        fecha_reenvio_oficina: data?.fecha_reenvio_oficina || "",
        fecha_reingreso_correccion: data?.fecha_reingreso_correccion || "",
        fecha_presentacion_registro: data?.fecha_presentacion_registro || "",
        fecha_inscripcion: data?.fecha_inscripcion || "",
        fecha_vencimiento: data?.fecha_vencimiento || "",
        fecha_disponible_retiro_final:
          data?.fecha_disponible_retiro_final || "",
        fecha_real_retiro_final: data?.fecha_real_retiro_final || "",
        fecha_observacion: data?.fecha_observacion || "",
        fecha_retiro_subsanar_observacion:
          data?.fecha_retiro_subsanar_observacion || "",
        fecha_reingreso_subsanada: data?.fecha_reingreso_subsanada || "",
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "No se pudo cargar la prenda.");
    } finally {
      setLoading(false);
    }
  }

  function setValue(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleUppercaseInput(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  }

  function setCuitField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: formatCuit(value),
    }));
  }

  function openReprogramarDatePicker() {
  const input = reprogramarFechaInputRef.current;
  if (!input) return;

  if (typeof input.showPicker === "function") {
    input.showPicker();
  } else {
    input.focus();
    input.click();
  }
}

  async function handleSave(e) {
    if (e?.preventDefault) e.preventDefault();

    setSaving(true);
    setErrorMsg("");

    try {
      const fechaAnteriorEnvio = row?.fecha_envio_oficina || null;
      const fechaNuevaEnvio = form.fecha_envio_oficina || null;
      const huboReprogramacionEnvio = fechaAnteriorEnvio !== fechaNuevaEnvio;

      const payload = {
        tienda: toNullableUpper(form.tienda),
        frq: toNullableUpper(form.frq),
        frq_cuit: onlyDigits(form.frq_cuit) || null,
        dominio: toNullableUpper(form.dominio),
        titular_dominio: toNullableUpper(form.titular_dominio),
        titular_cuit: onlyDigits(form.titular_cuit) || null,
        porcentaje_titular: toNullableNumber(form.porcentaje_titular),
        condomino: toNullableUpper(form.condomino),
        porcentaje_condomino: toNullableNumber(form.porcentaje_condomino),
        incidencia_tipo: toNullable(form.incidencia_tipo),
        motivo_incidencia: toNullable(form.motivo_incidencia),
        estado: toNullableUpper(form.estado),
        importe_prenda: toNullableNumber(form.importe_prenda),
        moneda_importe: toNullable(form.moneda_importe) || "$",
        grado_prenda: toNullableUpper(form.grado_prenda),
        plazo_anios: toNullableNumber(form.plazo_anios),
        escribania: toNullableUpper(form.escribania),
        numero_escritura: toNullableUpper(form.numero_escritura),
        folio: toNullableUpper(form.folio),
        fecha_escritura: form.fecha_escritura || null,
        radicacion: toNullableUpper(form.radicacion),
        registro_interviniente: toNullableUpper(form.registro_interviniente),
        fecha_envio_oficina: form.fecha_envio_oficina || null,
        fecha_recepcion_inicial_oficina:
          form.fecha_recepcion_inicial_oficina || null,
        fecha_disponible_retiro_correccion:
          form.fecha_disponible_retiro_correccion || null,
        fecha_retiro_correccion: form.fecha_retiro_correccion || null,
        fecha_reenvio_oficina: form.fecha_reenvio_oficina || null,
        fecha_reingreso_correccion: form.fecha_reingreso_correccion || null,
        fecha_presentacion_registro: form.fecha_presentacion_registro || null,
        fecha_inscripcion: form.fecha_inscripcion || null,
        fecha_vencimiento: form.fecha_vencimiento || null,
        fecha_disponible_retiro_final:
          form.fecha_disponible_retiro_final || null,
        fecha_real_retiro_final: form.fecha_real_retiro_final || null,
        fecha_observacion: form.fecha_observacion || null,
        fecha_retiro_subsanar_observacion:
          form.fecha_retiro_subsanar_observacion || null,
        fecha_reingreso_subsanada: form.fecha_reingreso_subsanada || null,
      };

      const { error } = await supabase
        .from("dia_request_prendas")
        .update(payload)
        .eq("id", id);

      if (error) throw error;

      await fetchData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "No se pudo guardar la prenda.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGuardarReprogramacion() {
  try {
    setSaving(true);
    setErrorMsg("");

    const nuevaFecha = nuevaFechaEnvio;

    if (!nuevaFecha) {
      setErrorMsg("Seleccioná una nueva fecha de envío.");
      return;
    }

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        fecha_envio_oficina: nuevaFecha,
      })
      .eq("id", id);

    if (error) throw error;

    setShowReprogramarEnvio(false);
    await fetchData();
  } catch (err) {
    console.error(err);
    setErrorMsg(err?.message || "No se pudo guardar la reprogramación.");
  } finally {
    setSaving(false);
  }
}

async function handleGuardarDatosIniciales() {
  try {
    setSaving(true);
    setErrorMsg("");

    const frqCompleto = [
      editDatosIniciales?.frq_apellido?.trim() || "",
      editDatosIniciales?.frq_nombre?.trim() || "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const titularCompleto = [
      editDatosIniciales?.titular_apellido?.trim() || "",
      editDatosIniciales?.titular_nombre?.trim() || "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const payload = {
      tienda: editDatosIniciales?.tienda?.trim()?.toUpperCase() || null,
      dominio: editDatosIniciales?.dominio?.trim()?.toUpperCase() || null,
      frq: frqCompleto ? frqCompleto.toUpperCase() : null,
      frq_cuit: onlyDigits(editDatosIniciales?.frq_cuit) || null,
      titular_dominio: titularCompleto ? titularCompleto.toUpperCase() : null,
      titular_cuit: onlyDigits(editDatosIniciales?.titular_cuit) || null,
    };

    const { error } = await supabase
      .from("dia_request_prendas")
      .update(payload)
      .eq("id", id);

    if (error) throw error;

    setShowEditarDatosIniciales(false);
    await fetchData();
  } catch (err) {
    console.error(err);
    setErrorMsg(err?.message || "No se pudieron guardar los datos iniciales.");
  } finally {
    setSaving(false);
  }
}
  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>
          <div style={loadingBoxStyle}>Cargando prenda...</div>
        </div>
      </div>
    );
  }

  if (!row) {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>
          <div style={errorBoxBigStyle}>No se encontró la prenda.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={panelStyle}>
          <div style={headerStyle}>
            <div style={headerMainStyle}>
              <div style={headerLeftStyle}>
                <div style={eyebrowStyle}>MANAGEMENT &amp; TRACKING</div>

                <h1 style={moduleTitleStyle}>
                  <span style={moduleTitleMainStyle}>Prendas</span>
                  <span style={moduleDividerStyle}> | </span>
                  <span style={moduleTitleSecondaryStyle}>M&amp;T</span>
                </h1>

                <div style={detailRowStyle}>
                  <div style={detailTitleStyle}>Detalle de prenda</div>
                </div>

                <div style={headerDescStyle}>
                  Estado Actual &amp; Trazabilidad del trámite.
                </div>
              </div>

              <div style={headerActionsStyle}>
                <div style={topActionsStyle}>
                  <Link href="/dia/prendas" style={secondaryTopButtonStyle}>
                    Volver al listado
                  </Link>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      ...primaryTopButtonStyle,
                      opacity: saving ? 0.72 : 1,
                      cursor: saving ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>

                <div style={headerStatusStyle}>
                  <StatusPill value={form.estado} />
                </div>
              </div>
            </div>

            {errorMsg ? <div style={errorBoxStyle}>{errorMsg}</div> : null}
          </div>

          <div style={heroBandStyle}>
  <div style={heroGridStyle}>
    <HeroMetric icon={Store} label="Tienda" value={form.tienda} />
<HeroMetric icon={UserRound} label="FRQ" value={form.frq} />
<HeroMetric icon={Car} label="Dominio" value={form.dominio} />
  </div>
</div>

          <form onSubmit={handleSave} style={formBodyStyle}>
            <div style={bodyColumnsStyle}>
              <div style={leftColumnStyle}>
                <SectionCard
                  title="Estado"
                  subtitle="Estado actual del legajo y aperturas condicionales."
                >
                  <div style={singleColumnStackStyle}>
                    {isAdmin && (
                      <Field label="Estado">
                        <select
                          value={form.estado}
                          onChange={(e) => setValue("estado", e.target.value)}
                          style={selectStyle}
                        >
                          {ESTADOS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}

                    <div style={infoTileStyle}>
                      <div style={infoTileLabelStyle}>Estado actual</div>
                      <div
  style={{
    paddingTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  }}
>
<StatusPill value={form.estado} />

{(estadoActual === "OBSERVADA" || estadoActual === "OBSERVADO") ? (
  <div
  style={{
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  <span
    style={{
      color: "#b9c7d8",
      fontSize: "14px",
      whiteSpace: "nowrap",
    }}
  >
    Fecha de observación:
  </span>

  <input
    type="date"
    value={form.fecha_observacion || ""}
    onChange={(e) => setValue("fecha_observacion", e.target.value)}
    style={{
      height: "38px",
      borderRadius: "10px",
      border: "1px solid rgba(148, 163, 184, 0.18)",
      background: "rgba(3, 11, 24, 0.72)",
      color: "#f8fbff",
      padding: "0 12px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    }}
  />
</div>
) : (
  estadoActual === "INSCRIPTA" ? (
  <div
    style={{
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      justifyContent: "flex-end",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#90a7c7",
          whiteSpace: "nowrap",
        }}
      >
        Fecha inscripción
      </span>

      <input
  type="date"
  value={form.fecha_inscripcion || ""}
  onChange={(e) => {
    const nuevaFecha = e.target.value;

    setForm((prev) => {
      let nuevoVencimiento = prev.fecha_vencimiento || "";

      if (nuevaFecha) {
        const [anio, mes, dia] = nuevaFecha.split("-");
        nuevoVencimiento = `${String(Number(anio) + 5).padStart(4, "0")}-${mes}-${dia}`;
      } else {
        nuevoVencimiento = "";
      }

      return {
        ...prev,
        fecha_inscripcion: nuevaFecha,
        fecha_vencimiento: nuevoVencimiento,
      };
    });
  }}
  style={{
    height: "38px",
    borderRadius: "10px",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    background: "rgba(3, 11, 24, 0.72)",
    color: "#f8fbff",
    padding: "0 10px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  }}
/>
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#90a7c7",
          whiteSpace: "nowrap",
        }}
      >
        Fecha vencimiento
      </span>

      <input
        type="date"
        value={form.fecha_vencimiento || ""}
        onChange={(e) => setValue("fecha_vencimiento", e.target.value)}
        style={{
          height: "38px",
          borderRadius: "10px",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          background: "rgba(3, 11, 24, 0.72)",
          color: "#f8fbff",
          padding: "0 10px",
          fontSize: "14px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  </div>
  
) : null
)}

</div>
                    </div>

{estadoActual === "EN CURSO" && (
  <div style={infoTileStyle}>
    <div style={infoTileLabelStyle}>Acciones</div>

    <Field label="Desde">
      <input
        type="date"
        value={form.fechaEnCurso || ""}
        onChange={(e) => setValue("fechaEnCurso", e.target.value)}
        style={inputStyle}
      />
    </Field>
  </div>
)}
                    {estadoActual === "PENDIENTE DE ENVIO" && (
  <div style={infoTileStyle}>
    <div style={infoTileLabelStyle}>Acciones</div>

    <div
      style={{
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        paddingTop: "4px",
      }}
    >
      <button
  type="button"
  onClick={() => {
    setNuevaFechaEnvio(form.fecha_envio_oficina || "");
    setShowReprogramarEnvio(true);
  }}
  style={actionSecondaryButtonStyle}
>
  Reprogramar envío
</button>

      <button
  type="button"
  onClick={() => {
    const frqParts = splitFullName(form.frq);
    const titularParts = splitFullName(form.titular_dominio);

    setEditDatosIniciales({
      tienda: form.tienda || "",
      dominio: form.dominio || "",
      frq_apellido: frqParts.apellido,
      frq_nombre: frqParts.nombre,
      frq_cuit: form.frq_cuit || "",
      titular_apellido: titularParts.apellido,
      titular_nombre: titularParts.nombre,
      titular_cuit: form.titular_cuit || "",
    });

    setShowEditarDatosIniciales(true);
  }}
  style={actionSecondaryButtonStyle}
>
  Editar datos iniciales
</button>
      
    </div>
  </div>
)}
{showReprogramarEnvio && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.55)",
      backdropFilter: "blur(3px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "24px",
      overflowY: "auto",
    }}
    onClick={() => {
      setShowReprogramarEnvio(false);
      setNuevaFechaEnvio("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: "920px",
        maxHeight: "calc(100vh - 48px)",
        overflowY: "auto",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "22px",
        boxShadow: "0 30px 80px rgba(15,23,42,0.22)",
        padding: "28px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.14em",
              color: "#23569e",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Estado / Acciones
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: "24px",
              lineHeight: 1.2,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Reprogramar envío
          </h3>

          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: "14px",
              lineHeight: 1.5,
              color: "#337ade",
            }}
          >
            Modificá la fecha programada de envío. El guardado se hará desde este
            mismo cuadro.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowReprogramarEnvio(false);
            setNuevaFechaEnvio("");
          }}
          style={{
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#334155",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "18px",
            background: "#f8fafc",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Fecha de envío actual
          </label>

          <input
  type="text"
  value={fechaProgramada ? formatFecha(fechaProgramada) : "—"}
  readOnly
  style={{
    width: "100%",
    height: "46px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    padding: "0 54px 0 14px",
    fontSize: "14px",
    fontWeight: 500,
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    letterSpacing: "0",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  }}
/>
        </div>

        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "18px",
            background: "#f8fafc",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Nueva fecha de envío
          </label>

          <div style={{ position: "relative" }}>
  <input
    type="text"
    value={nuevaFechaEnvio ? formatFecha(nuevaFechaEnvio) : ""}
    readOnly
    onClick={openReprogramarDatePicker}
    style={{
      width: "100%",
      height: "46px",
      borderRadius: "14px",
      border: "1px solid #cbd5e1",
      background: "#fff",
      padding: "0 54px 0 14px",
      fontSize: "14px",
      fontWeight: 500,
      fontFamily:
        'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      letterSpacing: "0",
      color: "#0f172a",
      outline: "none",
      boxSizing: "border-box",
      cursor: "pointer",
    }}
  />

  <input
    ref={reprogramarFechaInputRef}
    type="date"
    value={nuevaFechaEnvio}
    onChange={(e) => setNuevaFechaEnvio(e.target.value)}
    tabIndex={-1}
    style={{
      position: "absolute",
      opacity: 0,
      pointerEvents: "none",
      width: 0,
      height: 0,
    }}
  />

  <button
    type="button"
    onClick={openReprogramarDatePicker}
    aria-label="Abrir calendario"
    title="Abrir calendario"
    style={{
      position: "absolute",
      top: "50%",
      right: "10px",
      transform: "translateY(-50%)",
      width: "34px",
      height: "34px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      background: "#eef2ff",
      color: "#334155",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
    }}
  >
    📅
  </button>
</div>      </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          paddingTop: "4px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowReprogramarEnvio(false);
            setNuevaFechaEnvio("");
          }}
          style={{
            height: "46px",
            padding: "0 18px",
            borderRadius: "14px",
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#334155",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarReprogramacion}
          style={{
            height: "46px",
            padding: "0 20px",
            borderRadius: "14px",
            border: "none",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
          }}
        >
          Guardar reprogramación
        </button>
      </div>
    </div>
  </div>
)}

{showEditarDatosIniciales && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.55)",
      backdropFilter: "blur(3px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "24px",
      overflowY: "auto",
    }}
    onClick={() => setShowEditarDatosIniciales(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: "980px",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "22px",
        boxShadow: "0 30px 80px rgba(15,23,42,0.22)",
        padding: "28px",
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.14em",
              color: "#64748b",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Estado / Acciones
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: "24px",
              lineHeight: 1.2,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Editar datos iniciales
          </h3>

          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: "14px",
              lineHeight: 1.5,
              color: "#475569",
            }}
          >
            Modificá los datos base de la prenda. El guardado se hará desde este
            mismo cuadro.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowEditarDatosIniciales(false)}
          style={{
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#334155",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>
      </div>

      {/* Fila 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Tienda
          </label>
          <input
            type="text"
            value={editDatosIniciales?.tienda || ""}
            onChange={(e) =>
              setEditDatosIniciales((prev) => ({
                ...prev,
                tienda: e.target.value,
              }))
            }
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "14px",
              border: "1px solid #cbd5e1",
              background: "#fff",
              padding: "0 14px",
              fontSize: "14px",
              color: "#0f172a",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Dominio
          </label>
          <input
            type="text"
            value={editDatosIniciales?.dominio || ""}
            onChange={(e) =>
              setEditDatosIniciales((prev) => ({
                ...prev,
                dominio: e.target.value.toUpperCase(),
              }))
            }
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "14px",
              border: "1px solid #cbd5e1",
              background: "#fff",
              padding: "0 14px",
              fontSize: "14px",
              color: "#0f172a",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* FRQ */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "18px",
          padding: "18px",
          background: "#f8fafc",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "#0f172a",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          FRQ
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Apellido
            </label>
            <input
              type="text"
              value={editDatosIniciales?.frq_apellido || ""}
              onChange={(e) =>
                setEditDatosIniciales((prev) => ({
                  ...prev,
                  frq_apellido: e.target.value,
                }))
              }
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                padding: "0 14px",
                fontSize: "14px",
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Nombre
            </label>
            <input
              type="text"
              value={editDatosIniciales?.frq_nombre || ""}
              onChange={(e) =>
                setEditDatosIniciales((prev) => ({
                  ...prev,
                  frq_nombre: e.target.value,
                }))
              }
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                padding: "0 14px",
                fontSize: "14px",
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              CUIT
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={editDatosIniciales?.frq_cuit || ""}
              onChange={(e) =>
                setEditDatosIniciales((prev) => ({
                  ...prev,
                  frq_cuit: e.target.value,
                }))
              }
              placeholder="20-12345678-3"
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                padding: "0 14px",
                fontSize: "14px",
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Garante / Titular */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "18px",
          padding: "18px",
          background: "#f8fafc",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#0f172a",
              textTransform: "uppercase",
            }}
          >
            Garante / Titular de dominio
          </div>

          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#64748b",
              background: "#e2e8f0",
              borderRadius: "999px",
              padding: "6px 10px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Opcional
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Apellido
            </label>
            <input
              type="text"
              value={editDatosIniciales?.titular_apellido || ""}
              onChange={(e) =>
                setEditDatosIniciales((prev) => ({
                  ...prev,
                  titular_apellido: e.target.value,
                }))
              }
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                padding: "0 14px",
                fontSize: "14px",
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Nombre
            </label>
            <input
              type="text"
              value={editDatosIniciales?.titular_nombre || ""}
              onChange={(e) =>
                setEditDatosIniciales((prev) => ({
                  ...prev,
                  titular_nombre: e.target.value,
                }))
              }
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                padding: "0 14px",
                fontSize: "14px",
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              CUIT
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={editDatosIniciales?.titular_cuit || ""}
              onChange={(e) =>
                setEditDatosIniciales((prev) => ({
                  ...prev,
                  titular_cuit: e.target.value,
                }))
              }
              placeholder="20-12345678-3"
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                padding: "0 14px",
                fontSize: "14px",
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          paddingTop: "4px",
        }}
      >
        <button
          type="button"
          onClick={() => setShowEditarDatosIniciales(false)}
          style={{
            height: "46px",
            padding: "0 18px",
            borderRadius: "14px",
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#334155",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarDatosIniciales}
          style={{
            height: "46px",
            padding: "0 20px",
            borderRadius: "14px",
            border: "none",
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
          }}
        >
          Guardar cambios
        </button>
      </div>
    </div>
  </div>
)}
                    {isInscripta ? (
                      <>
                        {estadoActual !== "INSCRIPTA" ? (
  <Field
    label="Fecha de inscripción"
    hint={
      form.fecha_inscripcion
        ? formatDate(form.fecha_inscripcion)
        : null
    }
  >
    <input
      type="date"
      value={form.fecha_inscripcion}
      onChange={(e) =>
        setValue("fecha_inscripcion", e.target.value)
      }
      style={inputStyle}
    />
  </Field>
) : null}

                        {estadoActual !== "INSCRIPTA" ? (
  <Field
    label="Fecha de vencimiento"
    hint={
      form.fecha_vencimiento
        ? formatDate(form.fecha_vencimiento)
        : null
    }
  >
    <input
      type="date"
      value={form.fecha_vencimiento}
      onChange={(e) =>
        setValue("fecha_vencimiento", e.target.value)
      }
      style={inputStyle}
    />
  </Field>
) : null}
                      </>
                    ) : null}

                    {isObservada ? (
                      <>
                        <Field label="Incidencia">
  <select
    value={form.incidencia_tipo || ""}
    onChange={(e) => setValue("incidencia_tipo", e.target.value)}
    style={selectStyle}
  >
    <option value="">—</option>
    {INCIDENCIAS.map((item) => (
      <option key={item.value} value={item.value}>
        {item.label}
      </option>
    ))}
  </select>
</Field>

                        {!(estadoActual === "OBSERVADA" || estadoActual === "OBSERVADO") ? (
  <Field
    label="Fecha de observación"
    hint={
      form.fecha_observacion
        ? formatDate(form.fecha_observacion)
        : null
    }
  >
    <input
      type="date"
      value={form.fecha_observacion}
      onChange={(e) =>
        setValue("fecha_observacion", e.target.value)
      }
      style={inputStyle}
    />
  </Field>
) : null}

                        <Field label="Comentarios de observación">
                          <textarea
                            rows={4}
                            value={form.motivo_incidencia}
                            onChange={(e) =>
                              setValue("motivo_incidencia", e.target.value)
                            }
                            style={textareaStyle}
                          />
                        </Field>
                      </>
                    ) : null}
                  </div>
                </SectionCard>

                <SectionCard
  title="Datos del legajo"
  subtitle="Información registral base del trámite."
>
  {(() => {
    const legajoWrapStyle = {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    };

    const legajoRowTopStyle = {
  display: "grid",
  gridTemplateColumns: "0.82fr 0.82fr 1.08fr 1.78fr",
  gap: "18px",
  alignItems: "end",
};

    const legajoRowMidStyle = {
  display: "grid",
  gridTemplateColumns: "130px 130px 180px 180px",
  gap: "16px",
  alignItems: "end",
  justifyContent: "start",
};

    const legajoRowBottomStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1.22fr",
  gap: "18px",
  alignItems: "end",
};

    const legajoItemStyle = {
      minWidth: 0,
    };

    const legajoLabelStyle = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#9bb0cc",
  marginBottom: "8px",
  lineHeight: 1.2,
};

    const legajoBaseInputStyle = {
  width: "100%",
  height: "44px",
  borderRadius: "14px",
  border: "1px solid rgba(148, 163, 184, 0.10)",
  background: "rgba(2, 10, 22, 0.62)",
  color: "#edf4ff",
  padding: "0 14px",
  fontSize: "13px",
  fontWeight: 500,
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  letterSpacing: "0",
  outline: "none",
  boxSizing: "border-box",
  boxShadow: "none",
  WebkitTextFillColor: "#edf4ff",
  fontVariantNumeric: "tabular-nums",
};

    const legajoTextUpperStyle = {
      ...legajoBaseInputStyle,
      textTransform: "uppercase",
    };

    const legajoSelectStyle = {
      ...legajoBaseInputStyle,
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      paddingRight: "18px",
      background: "rgba(2, 10, 22, 0.62)",
    };

    const legajoDateStyle = {
      ...legajoBaseInputStyle,
      colorScheme: "dark",
    };

    const legajoPlazoWrapStyle = {
  display: "grid",
  gridTemplateColumns: "110px auto",
  alignItems: "center",
  gap: "8px",
  justifyContent: "start",
  width: "100%",
};

    const legajoSuffixStyle = {
  fontSize: "12px",
  fontWeight: 500,
  color: "#93a8c4",
  whiteSpace: "nowrap",
  lineHeight: 1,
};

    return (
      <div style={legajoWrapStyle}>
        <div style={legajoRowTopStyle}>
          <div style={legajoItemStyle}>
            <div style={legajoLabelStyle}>Escritura N°</div>
            <input
              type="text"
              value={form.numero_escritura}
              onChange={(e) =>
                handleUppercaseInput("numero_escritura", e.target.value)
              }
              style={legajoTextUpperStyle}
            />
          </div>

          <div style={legajoItemStyle}>
            <div style={legajoLabelStyle}>Folio</div>
            <input
              type="text"
              value={form.folio}
              onChange={(e) =>
                handleUppercaseInput("folio", e.target.value)
              }
              style={legajoTextUpperStyle}
            />
          </div>

          <div style={legajoItemStyle}>
            <div style={legajoLabelStyle}>Fecha escritura</div>
            <input
              type="date"
              value={form.fecha_escritura}
              onChange={(e) => setValue("fecha_escritura", e.target.value)}
              style={legajoDateStyle}
            />
          </div>

          <div style={legajoItemStyle}>
            <div style={legajoLabelStyle}>Escribanía</div>
            <input
              type="text"
              value={form.escribania}
              onChange={(e) =>
                handleUppercaseInput("escribania", e.target.value)
              }
              style={legajoTextUpperStyle}
            />
          </div>
        </div>

        <div style={legajoRowMidStyle}>
          <div style={legajoItemStyle}>
            <div style={legajoLabelStyle}>Grado</div>
            <select
              value={form.grado_prenda}
              onChange={(e) => setValue("grado_prenda", e.target.value)}
              style={legajoSelectStyle}
            >
              <option value="">—</option>
              {GRADOS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={legajoItemStyle}>
            <div style={legajoLabelStyle}>Moneda</div>
            <select
              value={form.moneda_importe}
              onChange={(e) => setValue("moneda_importe", e.target.value)}
              style={legajoSelectStyle}
            >
              {MONEDAS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={legajoItemStyle}>
            <div style={legajoLabelStyle}>Importe</div>
            <input
  type="text"
  inputMode="decimal"
  value={form.importe_prenda}
  onChange={(e) => setValue("importe_prenda", e.target.value)}
  onBlur={(e) => {
    const raw = String(e.target.value || "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();

    if (!raw) {
      setValue("importe_prenda", "");
      return;
    }

    const n = Number(raw);
    if (Number.isNaN(n)) return;

    setValue(
      "importe_prenda",
      new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(n)
    );
  }}
  style={legajoBaseInputStyle}
/>
          </div>

          <div style={legajoItemStyle}>
            <div style={legajoLabelStyle}>Plazo</div>
            <div style={legajoPlazoWrapStyle}>
              <input
                type="text"
                inputMode="numeric"
                value={form.plazo_anios}
                onChange={(e) => setValue("plazo_anios", e.target.value)}
                style={{
                  ...legajoBaseInputStyle,
                  width: "110px",
  minWidth: "110px",
                }}
              />
              <span style={legajoSuffixStyle}>años</span>
            </div>
          </div>
        </div>

        <div style={legajoRowBottomStyle}>
          <div style={legajoItemStyle}>
            <div style={legajoLabelStyle}>Radicación</div>
            <input
              type="text"
              value={form.radicacion}
              onChange={(e) =>
                handleUppercaseInput("radicacion", e.target.value)
              }
              style={legajoTextUpperStyle}
            />
          </div>

          <div style={legajoItemStyle}>
            <div style={legajoLabelStyle}>Registro</div>
            <input
              type="text"
              value={form.registro_interviniente}
              onChange={(e) =>
                handleUppercaseInput(
                  "registro_interviniente",
                  e.target.value
                )
              }
              style={legajoTextUpperStyle}
            />
          </div>
        </div>
      </div>
    );
  })()}
</SectionCard>

                <SectionCard
                  title="Trazabilidad"
                  subtitle="Seguimiento operativo del trámite desde el inicio hasta el cierre."
                >
                  <div style={traceGridStyle}>
                    <TraceBlock title="Inicio">
                      <Field
                        label="Fecha envío oficina"
                        hint={
                          form.fecha_envio_oficina
                            ? formatDate(form.fecha_envio_oficina)
                            : null
                        }
                      >
                        <input
                          type="date"
                          value={form.fecha_envio_oficina}
                          onChange={(e) =>
                            setValue("fecha_envio_oficina", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </Field>

                      <Field
                        label="Fecha recepción inicial oficina"
                        hint={
                          form.fecha_recepcion_inicial_oficina
                            ? formatDate(form.fecha_recepcion_inicial_oficina)
                            : null
                        }
                      >
                        <input
                          type="date"
                          value={form.fecha_recepcion_inicial_oficina}
                          onChange={(e) =>
                            setValue(
                              "fecha_recepcion_inicial_oficina",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        />
                      </Field>
                    </TraceBlock>

                    <TraceBlock title="Corrección">
                      <Field
                        label="Disponible retiro corrección"
                        hint={
                          form.fecha_disponible_retiro_correccion
                            ? formatDate(form.fecha_disponible_retiro_correccion)
                            : null
                        }
                      >
                        <input
                          type="date"
                          value={form.fecha_disponible_retiro_correccion}
                          onChange={(e) =>
                            setValue(
                              "fecha_disponible_retiro_correccion",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        />
                      </Field>

                      <Field
                        label="Fecha retiro corrección"
                        hint={
                          form.fecha_retiro_correccion
                            ? formatDate(form.fecha_retiro_correccion)
                            : null
                        }
                      >
                        <input
                          type="date"
                          value={form.fecha_retiro_correccion}
                          onChange={(e) =>
                            setValue("fecha_retiro_correccion", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </Field>

                      <Field
                        label="Fecha reenvío oficina"
                        hint={
                          form.fecha_reenvio_oficina
                            ? formatDate(form.fecha_reenvio_oficina)
                            : null
                        }
                      >
                        <input
                          type="date"
                          value={form.fecha_reenvio_oficina}
                          onChange={(e) =>
                            setValue("fecha_reenvio_oficina", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </Field>

                      <Field
                        label="Fecha reingreso corrección"
                        hint={
                          form.fecha_reingreso_correccion
                            ? formatDate(form.fecha_reingreso_correccion)
                            : null
                        }
                      >
                        <input
                          type="date"
                          value={form.fecha_reingreso_correccion}
                          onChange={(e) =>
                            setValue("fecha_reingreso_correccion", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </Field>
                    </TraceBlock>

                    <TraceBlock title="Registro">
                      <Field
                        label="Fecha presentación registro"
                        hint={
                          form.fecha_presentacion_registro
                            ? formatDate(form.fecha_presentacion_registro)
                            : null
                        }
                      >
                        <input
                          type="date"
                          value={form.fecha_presentacion_registro}
                          onChange={(e) =>
                            setValue("fecha_presentacion_registro", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </Field>
                    </TraceBlock>

                    <TraceBlock title="Cierre">
                      <Field
                        label="Disponible retiro final"
                        hint={
                          form.fecha_disponible_retiro_final
                            ? formatDate(form.fecha_disponible_retiro_final)
                            : null
                        }
                      >
                        <input
                          type="date"
                          value={form.fecha_disponible_retiro_final}
                          onChange={(e) =>
                            setValue(
                              "fecha_disponible_retiro_final",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        />
                      </Field>

                      <Field
                        label="Fecha real retiro final"
                        hint={
                          form.fecha_real_retiro_final
                            ? formatDate(form.fecha_real_retiro_final)
                            : null
                        }
                      >
                        <input
                          type="date"
                          value={form.fecha_real_retiro_final}
                          onChange={(e) =>
                            setValue("fecha_real_retiro_final", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </Field>
                    </TraceBlock>
                  </div>
                </SectionCard>
              </div>

              <div style={rightColumnStyle}>
                <SectionCard
                  title="Detalle de la prenda"
                  subtitle="Datos personales y composición del dominio."
                >
                  <div style={rowsWrapStyle}>
                    <div style={rowFiveStyle}>
                      <div style={grow2Style}>
                        <Field label="Titular de dominio">
                          <input
                            type="text"
                            value={form.titular_dominio}
                            onChange={(e) =>
                              handleUppercaseInput(
                                "titular_dominio",
                                e.target.value
                              )
                            }
                            style={{ ...inputStyle, ...uppercaseTextStyle }}
                          />
                        </Field>
                      </div>

                      <div style={growStyle}>
                        <Field label="CUIT titular">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={form.titular_cuit}
                            onChange={(e) =>
                              setCuitField("titular_cuit", e.target.value)
                            }
                            style={inputStyle}
                          />
                        </Field>
                      </div>

                      <div style={smallFieldStyle}>
                        <Field label="% titular">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={form.porcentaje_titular}
                            onChange={(e) =>
                              setValue("porcentaje_titular", e.target.value)
                            }
                            style={inputStyle}
                          />
                        </Field>
                      </div>
                    </div>

                    <div style={rowFiveStyle}>
                      <div style={grow2Style}>
                        <Field label="Condómino">
                          <input
                            type="text"
                            value={form.condomino}
                            onChange={(e) =>
                              handleUppercaseInput("condomino", e.target.value)
                            }
                            style={{ ...inputStyle, ...uppercaseTextStyle }}
                          />
                        </Field>
                      </div>

                      <div style={smallFieldStyle}>
                        <Field label="% condómino">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={form.porcentaje_condomino}
                            onChange={(e) =>
                              setValue("porcentaje_condomino", e.target.value)
                            }
                            style={inputStyle}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Observación"
                  subtitle="Datos complementarios cuando el trámite presenta observaciones."
                >
                  <div style={singleColumnStackStyle}>
                    <div style={infoTileStyle}>
                      <div style={infoTileLabelStyle}>Estado</div>
                      <div style={infoTileValueStyle}>
                        {isObservada
                          ? "La prenda se encuentra observada."
                          : "Sin observaciones activas."}
                      </div>
                    </div>

                    {isObservada ? (
                      <div style={observacionBoxStyle}>
                        <div style={traceTitleStyle}>Subsanación</div>
                        <div style={traceBlockInnerStyle}>
                          <Field
                            label="Fecha retiro para subsanar"
                            hint={
                              form.fecha_retiro_subsanar_observacion
                                ? formatDate(
                                    form.fecha_retiro_subsanar_observacion
                                  )
                                : null
                            }
                          >
                            <input
                              type="date"
                              value={form.fecha_retiro_subsanar_observacion}
                              onChange={(e) =>
                                setValue(
                                  "fecha_retiro_subsanar_observacion",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </Field>

                          <Field
                            label="Fecha reingreso subsanada"
                            hint={
                              form.fecha_reingreso_subsanada
                                ? formatDate(form.fecha_reingreso_subsanada)
                                : null
                            }
                          >
                            <input
                              type="date"
                              value={form.fecha_reingreso_subsanada}
                              onChange={(e) =>
                                setValue(
                                  "fecha_reingreso_subsanada",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </Field>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Historial"
                  subtitle="Espacio reservado para futuras notas y trazas del caso."
                >
                  <div style={historyPlaceholderStyle}>
                    Próximamente se integrarán aquí la trazabilidad detallada y las
                    notas del expediente.
                  </div>
                </SectionCard>
              </div>
            </div>

            <div style={footerBarStyle}>
              <div style={footerTextStyle}>
                {saving ? "Guardando cambios..." : "Cambios listos para guardar"}
              </div>

              <div style={footerActionsStyle}>
                <Link href="/dia/prendas" style={secondaryButtonStyle}>
                  Volver al listado
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...primaryButtonStyle,
                    opacity: saving ? 0.72 : 1,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
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
    "radial-gradient(900px 420px at 12% 0%, rgba(59,130,246,0.22) 0%, transparent 44%), radial-gradient(700px 320px at 86% 8%, rgba(14,165,233,0.12) 0%, transparent 40%), linear-gradient(180deg, #102a4a 0%, #163d68 52%, #245f95 100%)",
  padding: "36px 20px 52px",
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const shellStyle = {
  maxWidth: "1380px",
  margin: "0 auto",
};

const panelStyle = {
 background:
  "linear-gradient(180deg, rgba(8,30,60,0.92) 0%, rgba(15,45,80,0.85) 55%, rgba(25,65,110,0.78) 100%)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "30px",
  boxShadow: "0 30px 120px rgba(0,0,0,0.28)",
  overflow: "hidden",
  backdropFilter: "blur(14px)",
};

const headerStyle = {
  padding: "24px 26px 22px",
  borderBottom: "1px solid rgba(148,163,184,0.10)",
    background:
    "linear-gradient(180deg, rgba(14,45,82,0.62) 0%, rgba(8,28,55,0.38) 100%)",
};

const headerMainStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const eyebrowStyle = {
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#8fb9e8",
  marginBottom: "8px",
};

const headerDescStyle = {
  marginTop: "10px",
  fontSize: "14px",
  lineHeight: 1.6,
  color: "#8da0be",
  maxWidth: "640px",
};

const topActionsStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const secondaryTopButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "36px",
  padding: "0 13px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "12px",
  color: "#dbeafe",
  background: "rgba(59,130,246,0.082)",
  border: "1px solid rgba(59,130,246,0.16)",
  boxSizing: "border-box",
  whiteSpace: "nowrap",
  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
};

const primaryTopButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "36px",
  padding: "0 13px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "12px",
  color: "#f8fbff",
  background: "rgba(28,74,134,0.92)",
  border: "1px solid rgba(125,211,252,0.18)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  appearance: "none",
  whiteSpace: "nowrap",
};

const dateInputWrapStyle = {
  position: "relative",
};

const dateInputStyle = {
  width: "100%",
  height: "50px",
  borderRadius: "14px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3, 11, 24, 0.72)",
  color: "#f8fbff",
  padding: "0 52px 0 16px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  appearance: "none",
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

const heroBandStyle = {
  padding: "14px 26px 16px",
  borderBottom: "1px solid rgba(148,163,184,0.10)",
  background: "transparent",
};

const heroGridStyle = {
  display: "grid",
  gridTemplateColumns: "0.9fr 1.4fr 1fr",
  gap: "14px",
  alignItems: "stretch",
};

const heroIconStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "12px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  color: "#3b82f6",
  flexShrink: 0,
};

const heroMetricStyle = {
  padding: "10px 0",
  minHeight: "42px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  minWidth: 0,
};

const heroLabelStyle = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#8fb9e8",
};

const heroValueStyle = {
  fontSize: "13px",
  lineHeight: 1.05,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: "#f3f7ff",
  wordBreak: "break-word",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const formBodyStyle = {
  padding: "24px 26px 26px",
};

const bodyColumnsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  alignItems: "flex-start",
};

const leftColumnStyle = {
  flex: "1 1 820px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  minWidth: 0,
};

const rightColumnStyle = {
  flex: "1 1 360px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  minWidth: 0,
};

const sectionCardStyle = {
  background: "rgba(19, 64, 135, 0.64)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "24px",
  padding: "22px",
  boxShadow: "0 18px 55px rgba(0,0,0,0.18)",
};

const sectionHeaderStyle = {
  marginBottom: "18px",
};

const sectionTitleStyle = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#f8fbff",
  letterSpacing: "-0.02em",
  marginBottom: "6px",
};

const sectionSubtitleStyle = {
  fontSize: "14px",
  color: "#8da0be",
  lineHeight: 1.55,
};

const rowsWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const rowFourStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "14px",
};

const rowFiveStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "14px",
};

const growStyle = {
  flex: "1 1 280px",
  minWidth: 0,
};

const grow2Style = {
  flex: "2 1 320px",
  minWidth: 0,
};

const smallFieldStyle = {
  flex: "1 1 150px",
  minWidth: 0,
};

const fieldCardStyle = {
  background: "rgba(3, 11, 24, 0.46)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "18px",
  padding: "14px",
  boxSizing: "border-box",
};

const fieldHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  marginBottom: "10px",
  flexWrap: "wrap",
};

const labelStyle = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#90a7c7",
};

const hintStyle = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#6f86a8",
};

const inputStyle = {
  width: "100%",
  height: "50px",
  borderRadius: "14px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3, 11, 24, 0.72)",
  color: "#f8fbff",
  padding: "0 16px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  appearance: "none",
};

const uppercaseTextStyle = {
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const selectStyle = {
  ...inputStyle,
  paddingRight: "16px",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

const textareaStyle = {
  width: "100%",
  minHeight: "110px",
  borderRadius: "14px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3, 11, 24, 0.72)",
  color: "#f8fbff",
  padding: "12px 16px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical",
  appearance: "none",
  lineHeight: 1.5,
};

const traceGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px",
};

const traceBlockStyle = {
  borderRadius: "20px",
  padding: "16px",
  background: "rgba(5, 16, 32, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
};

const traceTitleStyle = {
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#a5d8ff",
  marginBottom: "14px",
};

const traceBlockInnerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const observacionBoxStyle = {
  marginTop: "14px",
  borderRadius: "20px",
  padding: "16px",
  background: "rgba(5, 16, 32, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
};

const singleColumnStackStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const infoTileStyle = {
  background: "rgba(3, 11, 24, 0.46)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "18px",
  padding: "14px",
};

const infoTileLabelStyle = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#90a7c7",
  marginBottom: "10px",
};

const infoTileValueStyle = {
  fontSize: "15px",
  fontWeight: 600,
  color: "#eef6ff",
  lineHeight: 1.45,
};

const historyPlaceholderStyle = {
  borderRadius: "18px",
  padding: "16px",
  background: "rgba(3, 11, 24, 0.36)",
  border: "1px dashed rgba(148, 163, 184, 0.18)",
  color: "#8da0be",
  fontSize: "14px",
  lineHeight: 1.65,
};

const footerBarStyle = {
  marginTop: "22px",
  paddingTop: "22px",
  borderTop: "1px solid rgba(148, 163, 184, 0.14)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const footerTextStyle = {
  fontSize: "12px",
  color: "#8da0be",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
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
  minHeight: "46px",
  padding: "0 16px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: 700,
  color: "#dbeafe",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.18)",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "46px",
  padding: "0 18px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: 700,
  color: "#f8fbff",
  background: "linear-gradient(135deg, #0f274d 0%, #143766 100%)",
  border: "1px solid rgba(125,211,252,0.18)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
  appearance: "none",
};

const errorBoxStyle = {
  marginTop: "18px",
  padding: "14px 16px",
  borderRadius: "16px",
  background: "rgba(127, 29, 29, 0.24)",
  border: "1px solid rgba(248, 113, 113, 0.24)",
  color: "#fecaca",
  fontSize: "14px",
  fontWeight: 500,
};

const loadingBoxStyle = {
  background: "rgba(8, 22, 46, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "24px",
  padding: "28px",
  color: "#dbeafe",
  boxShadow: "0 18px 60px rgba(0,0,0,0.24)",
};

const headerLeftStyle = {
  minWidth: 0,
  maxWidth: "620px",
};

const moduleTitleStyle = {
  margin: 0,
  display: "flex",
  alignItems: "baseline",
  flexWrap: "wrap",
  gap: "0px",
  lineHeight: 1.02,
};

const moduleTitleMainStyle = {
  fontSize: "28px",
  fontWeight: 700,
  letterSpacing: "-0.035em",
  color: "#f8fbff",
};

const moduleDividerStyle = {
  fontSize: "30px",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  color: "#8fb9e8",
  opacity: 0.9,
  margin: "0 4px",
};

const moduleTitleSecondaryStyle = {
  fontSize: "28px",
  fontWeight: 600,
  letterSpacing: "-0.03em",
  color: "#e6f0ff",
  opacity: 0.96,
};

const detailRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const detailTitleStyle = {
  fontSize: "15px",
  lineHeight: 1.1,
  fontWeight: 600,
  color: "#dbeafe",
  letterSpacing: "-0.01em",
};

const errorBoxBigStyle = {
  background: "rgba(127, 29, 29, 0.20)",
  border: "1px solid rgba(248, 113, 113, 0.24)",
  borderRadius: "24px",
  padding: "28px",
  color: "#fecaca",
  boxShadow: "0 18px 60px rgba(0,0,0,0.24)",
};

const headerActionsStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "16px",
};

const headerStatusStyle = {
  display: "flex",
  justifyContent: "flex-end",
  width: "100%",
};

const tinyFieldStyle = {
  flex: "0 0 110px",
  minWidth: "110px",
};

const dateFieldInlineStyle = {
  flex: "0 0 180px",
  minWidth: "180px",
};

const wideFieldStyle = {
  flex: "1 1 220px",
  minWidth: "220px",
};

const gradeFieldStyle = {
  flex: "0 0 120px",
  minWidth: "120px",
};

const amountFieldStyle = {
  flex: "0 1 240px",
  minWidth: "220px",
};

const currencyFieldStyle = {
  flex: "0 0 120px",
  minWidth: "120px",
};

const termFieldStyle = {
  flex: "0 0 160px",
  minWidth: "160px",
};

const actionSecondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "36px",
  padding: "0 12px",
  borderRadius: "10px",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  background: "rgba(255,255,255,0.035)",
  color: "#e6f0ff",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  boxSizing: "border-box",
};
const editBoxStyle = {
  marginTop: "14px",
  borderRadius: "18px",
  padding: "16px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
};

const editBoxTitleStyle = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#f8fbff",
  marginBottom: "6px",
};

const editBoxTextStyle = {
  fontSize: "13px",
  color: "#8da0be",
  lineHeight: 1.5,
  marginBottom: "14px",
};
const primaryMiniButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "36px",
  padding: "0 14px",
  borderRadius: "10px",
  border: "1px solid rgba(125,211,252,0.18)",
  background: "linear-gradient(135deg, #0f274d 0%, #143766 100%)",
  color: "#f8fbff",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  boxSizing: "border-box",
  whiteSpace: "nowrap",
};