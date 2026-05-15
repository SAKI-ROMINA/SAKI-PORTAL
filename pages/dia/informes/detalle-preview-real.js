import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../lib/supabaseClient";
import {
  Home,
  ShieldCheck,
  Store,
  UserRound,
  Flag,
  Clock3,
  Network,
  Car,
  CircleDollarSign,
  Bell,
  MoreVertical,
  ArrowLeft,
  Wrench,
ChevronDown,
Printer,
Download,
Copy,
Share2,
MessagesSquare,
Paperclip,
} from "lucide-react";

function formatDate(value) {
  if (!value) return null;

  const raw = String(value).trim();
  const onlyDate = raw.slice(0, 10);
  const match = onlyDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }

  return raw;
}

function normalizeDateForDb(value) {
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
}

function getInformeTipoLabel(type) {
  const value = (type || "").toString().trim();

  if (value === "informe_dominio") return "Informe de dominio";
  if (value === "certificado_dominio") return "Certificado de dominio";
  if (value === "anotaciones_personales") return "Anotaciones personales";
  if (value === "informe_nominal") return "Informe nominal";
  if (value === "indice_titularidad") return "Índice de titularidad";

  return value
    ? value.replaceAll("_", " ")
    : "Informe";
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

const CATEGORIAS_ARCHIVOS_PRENDA = [
  { value: "documentacion_inicial", label: "Documentación inicial" },
  { value: "informe_emitido", label: "Informe emitido" },
  { value: "dominio_automotor", label: "Dominio / Automotor" },
  { value: "titular_garante", label: "Titular / Garante" },
  { value: "observacion", label: "Observación" },
  { value: "documentacion_complementaria", label: "Documentación complementaria" },
  { value: "cierre_legajo", label: "Cierre del legajo" },
  { value: "otros", label: "Otros" },
];

function getCategoriaArchivoLabel(value) {
  return (
    CATEGORIAS_ARCHIVOS_PRENDA.find((item) => item.value === value)?.label ||
    value ||
    "Sin categoría"
  );
}

function formatDocumentoInput(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length <= 8) {
    return digits.replace(
      /^(\d{1,2})(\d{3})(\d{0,3}).*/,
      (_, a, b, c) => (c ? `${a}.${b}.${c}` : `${a}.${b}`)
    );
  }

  const limited = digits.slice(0, 11);

  return limited.replace(
    /^(\d{2})(\d{0,8})(\d{0,1}).*/,
    (_, a, b, c) => {
      if (!b) return a;
      if (!c) return `${a}-${b}`;
      return `${a}-${b}-${c}`;
    }
  );
}

function createEmptyInformeObservacion() {
  return {
    tipo_observacion: "prenda",
    tipo_medida: "",
    acreedor: "",
    grado: "",
    juzgado: "",
    actor: "",
    expediente: "",
    fecha_contrato: "",
    fecha_inscripcion: "",
    monto: "",
    estado: "",
    observacion: "",
  };
}

function createEmptyVehiculoNominal() {
  return {
    condicion_titular: "titular_actual",
    dominio: "",
    marca: "",
    modelo: "",
    tipo: "",
    modelo_anio: "",
    registro_seccional: "",
    registro_domicilio: "",
    registro_localidad: "",
    registro_provincia: "",
    titular: "",
    documento_titular: "",
    porcentaje_titular: "",
    fecha_titular: "",
    observacion: "",
  };
}

function createEmptyPrendaCondomino() {
  return {
    apellido: "",
    nombres: "",
    dni: "",
    cuil_cuit: "",
    estado_civil: "",
    titular_desde: "",
    porcentaje: "",
    domicilio: "",
    conyuge_apellido: "",
    conyuge_nombres: "",
    conyuge_dni: "",
    conyuge_cuil_cuit: "",
  };
}

function buildDatosLegajoForm(source) {
  return {

    // Datos administrativos del informe
    status: source?.status || source?.estado || "SOLICITADO",
    result: source?.result || "PENDIENTE",
    fecha_pedido_real: source?.fecha_pedido_real || "",
    fecha_entrega_real: source?.fecha_entrega_real || "",
    observed_status: source?.observed_status || "",
    observed_date: source?.observed_date || "",
    observed_other: source?.observed_other || "",

    // Dominio / automotor
    dominio: source?.dominio || "",
    marca: source?.marca || "",
    modelo: source?.modelo || "",
    tipo: source?.tipo || "",
    modelo_anio: source?.modelo_anio || "",
    marca_motor: source?.marca_motor || "",
    numero_motor: source?.numero_motor || "",
    marca_chasis: source?.marca_chasis || "",
    numero_chasis: source?.numero_chasis || "",
    radicacion: source?.radicacion || "",
    registro_interviniente: source?.registro_interviniente || "",

    // Franquiciado
tienda: source?.tienda || "",
frq_tipo_persona: source?.frq_tipo_persona || "JURIDICA",
frq_apellido:
  source?.frq_apellido ||
  String(source?.frq || source?.franquiciado || "")
    .trim()
    .split(" ")[0] ||
  "",

frq_nombres:
  source?.frq_nombres ||
  String(source?.frq || source?.franquiciado || "")
    .trim()
    .split(" ")
    .slice(1)
    .join(" ") ||
  "",

frq_razon_social:
  source?.frq_razon_social ||
  source?.frq ||
  source?.franquiciado ||
  "",
frq_cuit:
  source?.frq_cuit ||
  source?.cuit ||
  source?.identificacion_cuit ||
  "",
frq_email: source?.frq_email || "",
frq_telefono: source?.frq_telefono || "",
frq_domicilio: source?.frq_domicilio || "",

 // Titular / garante / persona consultada
titular_tipo_persona: source?.titular_tipo_persona || "HUMANA",

titular_apellido:
  source?.titular_apellido ||
  String(source?.titular_dominio || source?.identificacion_nombre || "")
    .trim()
    .split(" ")[0] ||
  "",

titular_nombres:
  source?.titular_nombres ||
  String(source?.titular_dominio || source?.identificacion_nombre || "")
    .trim()
    .split(" ")
    .slice(1)
    .join(" ") ||
  "",

titular_razon_social:
  source?.titular_razon_social ||
  source?.titular_dominio ||
  source?.identificacion_nombre ||
  "",

titular_dni:
  source?.titular_dni ||
  source?.identificacion_dni ||
  "",

titular_cuil_cuit:
  source?.titular_cuil_cuit ||
  source?.titular_cuit ||
  source?.identificacion_cuit ||
  "",
    titular_estado_civil: source?.titular_estado_civil || "",
    titular_desde: source?.titular_desde || "",
    porcentaje_titular:
      source?.porcentaje_titular !== null &&
      source?.porcentaje_titular !== undefined
        ? String(source.porcentaje_titular)
        : "",
    titular_domicilio: source?.titular_domicilio || "",

    titular_conyuge_apellido: source?.titular_conyuge_apellido || "",
    titular_conyuge_nombres: source?.titular_conyuge_nombres || "",
    titular_conyuge_dni: source?.titular_conyuge_dni || "",
    titular_conyuge_cuil_cuit: source?.titular_conyuge_cuil_cuit || "",

    condominos: Array.isArray(source?.condominos) ? source.condominos : [],
  };
}

function parsePrendaPorcentaje(value) {
  const normalized = String(value || "").replace(",", ".");
  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getPrendaTitularidadTotal(form) {
  const titularPorcentaje = parsePrendaPorcentaje(form.porcentaje_titular);

  const condominosTotal = Array.isArray(form.condominos)
    ? form.condominos.reduce(
        (total, condomino) =>
          total + parsePrendaPorcentaje(condomino?.porcentaje),
        0
      )
    : 0;

  return titularPorcentaje + condominosTotal;
}

function getPersonaConsultadaNombre(row) {
  return (
    row?.titular_dominio ||
    row?.identificacion_nombre ||
    row?.informe_titular_razon_social ||
    row?.titular_razon_social ||
    `${row?.informe_titular_apellido || ""} ${
      row?.informe_titular_nombres || row?.informe_titular_nombre || ""
    }`.trim() ||
    `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim() ||
    "—"
  );
}

function getPersonaConsultadaDocumento(row) {
  return (
    row?.informe_titular_cuil_cuit ||
    row?.informe_titular_dni ||
    row?.titular_cuit ||
    row?.titular_cuil_cuit ||
    row?.identificacion_cuit ||
    row?.identificacion_dni ||
    row?.titular_dni ||
    "—"
  );
}

function buildCargaInicialMirror(form, source = null) {
  const frqNombre =
    form?.frq_tipo_persona === "HUMANA"
      ? `${form?.frq_apellido || ""} ${form?.frq_nombres || ""}`.trim()
      : form?.frq_razon_social || "";

  const personaNombreFromForm =
    form?.titular_tipo_persona === "JURIDICA"
      ? form?.titular_razon_social || ""
      : `${form?.titular_apellido || ""} ${form?.titular_nombres || ""}`.trim();

  const personaNombre =
    personaNombreFromForm ||
    source?.titular_dominio ||
    source?.identificacion_nombre ||
    source?.titular_razon_social ||
    `${source?.titular_apellido || ""} ${source?.titular_nombres || ""}`.trim();

  const personaCuit =
    form?.titular_cuil_cuit ||
    source?.titular_cuil_cuit ||
    source?.titular_cuit ||
    source?.identificacion_cuit ||
    "";

  const personaDni =
    form?.titular_dni ||
    source?.identificacion_dni ||
    source?.titular_dni ||
    "";

  return {
    franquiciado: frqNombre || source?.franquiciado || null,

    identificacion_nombre: personaNombre || null,
    titular_dominio: personaNombre || null,
    identificacion_cuit: personaCuit || null,
    identificacion_dni: personaDni || null,
  };
}

export default function PreviewPrenda() {
  const [activeFicha, setActiveFicha] = useState(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [avisosOpen, setAvisosOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();
const { id } = router.query;

const [loading, setLoading] = useState(false);
const [errorMsg, setErrorMsg] = useState("");
const [row, setRow] = useState(null);
const [historyRows, setHistoryRows] = useState([]);

const [observacionesInforme, setObservacionesInforme] = useState([]);
const [loadingObservacionesInforme, setLoadingObservacionesInforme] = useState(false);
const [observacionInformeMsg, setObservacionInformeMsg] = useState("");

const [vehiculosNominal, setVehiculosNominal] = useState([]);
const [loadingVehiculosNominal, setLoadingVehiculosNominal] = useState(false);
const [vehiculosNominalMsg, setVehiculosNominalMsg] = useState("");

const [savingVehiculosNominal, setSavingVehiculosNominal] = useState(false);
const [vehiculoNominalEditandoId, setVehiculoNominalEditandoId] = useState(null);
const [vehiculosNominalForm, setVehiculosNominalForm] = useState([
  createEmptyVehiculoNominal(),
]);

const [showObservacionInformeModal, setShowObservacionInformeModal] = useState(false);
const [savingObservacionInforme, setSavingObservacionInforme] = useState(false);
const [observacionesForm, setObservacionesForm] = useState([
  createEmptyInformeObservacion(),
]);

const [notasLegajo, setNotasLegajo] = useState([]);
const [loadingNotas, setLoadingNotas] = useState(false);
const [savingNota, setSavingNota] = useState(false);
const [nuevaNota, setNuevaNota] = useState("");
const [notaMsg, setNotaMsg] = useState("");
const [respondiendoNota, setRespondiendoNota] = useState(null);
const [hayAvisoNotas, setHayAvisoNotas] = useState(false);

const [archivosLegajo, setArchivosLegajo] = useState([]);
const [loadingArchivos, setLoadingArchivos] = useState(false);
const [uploadingArchivo, setUploadingArchivo] = useState(false);
const [archivoCategoria, setArchivoCategoria] = useState("documentacion_inicial");
const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
const [archivoMsg, setArchivoMsg] = useState("");
const [archivoInputKey, setArchivoInputKey] = useState(0);

const [showDatosLegajoEditor, setShowDatosLegajoEditor] = useState(false);

const [savingDatosLegajo, setSavingDatosLegajo] = useState(false);
const [datosLegajoError, setDatosLegajoError] = useState("");
const [editingFrqBlock, setEditingFrqBlock] = useState(false);
const [editingDominioBlock, setEditingDominioBlock] = useState(false);
const [editingTitularBlock, setEditingTitularBlock] = useState(false);
const [datosLegajoForm, setDatosLegajoForm] = useState(
  buildDatosLegajoForm(null)
);
const [datosLegajoDirty, setDatosLegajoDirty] = useState(false);

const [printMode, setPrintMode] = useState(null);

const [currentProfile, setCurrentProfile] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);
const [savingEstadoInforme, setSavingEstadoInforme] = useState(false);

  const estadoActual = row?.status || row?.estado || "—";

const estadoActualKey = (row?.status || row?.estado || "")
  .toString()
  .trim()
  .toUpperCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

    useEffect(() => {
  if (!id) return;

  async function fetchInformeReal() {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("dia_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando informe real:", error);
setErrorMsg(error.message || "No se pudo cargar el informe.");
      setRow(null);
      setLoading(false);
      return;
    }

    setRow(data);

const { data: historyData, error: historyError } = await supabase
  .from("dia_requests_history")
  .select("*")
  .eq("request_id", id)
  .order("created_at", { ascending: false });

if (historyError) {
  console.error("Error cargando historial del informe:", historyError);
  setHistoryRows([]);
} else {
  setHistoryRows(historyData || []);
}
    setLoading(false);
  }

fetchInformeReal();
fetchArchivosLegajo();
fetchNotasLegajo();
fetchObservacionesInforme();
fetchVehiculosNominal();
}, [id]);

async function fetchObservacionesInforme() {
  if (!id) return;

  try {
    setLoadingObservacionesInforme(true);
    setObservacionInformeMsg("");

    const { data, error } = await supabase
      .from("dia_request_informe_observaciones")
      .select("*")
      .eq("request_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    setObservacionesInforme(data || []);
  } catch (error) {
    console.error("Error cargando observaciones del informe:", error);
    setObservacionesInforme([]);
    setObservacionInformeMsg(
      error?.message || "No se pudieron cargar las observaciones del informe."
    );
  } finally {
    setLoadingObservacionesInforme(false);
  }
}

async function fetchVehiculosNominal() {
  if (!id) return;

  try {
    setLoadingVehiculosNominal(true);
    setVehiculosNominalMsg("");

    const { data, error } = await supabase
      .from("dia_request_informe_nominal_vehiculos")
      .select("*")
      .eq("request_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    setVehiculosNominal(data || []);
  } catch (error) {
    console.error("Error cargando vehículos del informe nominal:", error);
    setVehiculosNominal([]);
    setVehiculosNominalMsg(
      error?.message || "No se pudieron cargar los vehículos del informe nominal."
    );
  } finally {
    setLoadingVehiculosNominal(false);
  }
}

async function fetchArchivosLegajo() {
  if (!id) return;

  try {
    setLoadingArchivos(true);
    setArchivoMsg("");

    const { data, error } = await supabase
      .from("dia_request_files")
      .select("*")
      .eq("request_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    setArchivosLegajo(data || []);
  } catch (error) {
    console.error("Error cargando archivos del legajo:", error);
    setArchivoMsg(error?.message || "No se pudieron cargar los archivos.");
  } finally {
    setLoadingArchivos(false);
  }
}

async function handleSubirArchivoLegajo() {
  if (!id) return;

  if (!archivoSeleccionado) {
    setArchivoMsg("Seleccioná un archivo para subir.");
    return;
  }

  try {
    setUploadingArchivo(true);
    setArchivoMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const originalName = archivoSeleccionado.name || "archivo";

    const safeName = originalName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const storagePath = `informes/${id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("dia-informes-files")
      .upload(storagePath, archivoSeleccionado, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase
  .from("dia_request_files")
  .insert({
    request_id: id,
    categoria: archivoCategoria,
    nombre_archivo: originalName,
    storage_path: storagePath,
    path: storagePath,
    mime_type: archivoSeleccionado.type || null,
    size_bytes: archivoSeleccionado.size || null,
    uploaded_by: user?.id || null,
  });

    if (insertError) throw insertError;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: "archivo_subido",
        titulo: "Archivo agregado al legajo",
        detalle: {
          categoria: archivoCategoria,
          categoria_label: getCategoriaArchivoLabel(archivoCategoria),
          nombre_archivo: originalName,
          storage_path: storagePath,
          mime_type: archivoSeleccionado.type || null,
          size_bytes: archivoSeleccionado.size || null,
        },
        created_by_name: user?.user_metadata?.full_name || null,
        created_by_email: user?.email || null,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...prev]);
    }

    setArchivoSeleccionado(null);
    setArchivoInputKey((prev) => prev + 1);
    setArchivoCategoria("documentacion_inicial");
    setArchivoMsg("Archivo subido correctamente.");

    await fetchArchivosLegajo();
  } catch (error) {
    console.error("Error subiendo archivo del legajo:", error);
    setArchivoMsg(error?.message || "No se pudo subir el archivo.");
  } finally {
    setUploadingArchivo(false);
  }
}

async function handleAbrirArchivoLegajo(file) {
  try {
    setArchivoMsg("");

    const { data, error } = await supabase.storage
      .from("dia-informes-files")
      .createSignedUrl(file.storage_path, 60);

    if (error) throw error;

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  } catch (error) {
    console.error("Error abriendo archivo del legajo:", error);
    setArchivoMsg(error?.message || "No se pudo abrir el archivo.");
  }
}

async function handleEliminarArchivoLegajo(file) {
  if (!id || !file) return;

  if (!isAdmin) {
    setArchivoMsg("Solo un usuario administrador puede eliminar archivos.");
    return;
  }

  const confirmar = window.confirm(
    `¿Eliminar el archivo "${file.nombre_archivo || "archivo"}" del legajo?`
  );

  if (!confirmar) return;

  try {
    setArchivoMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: storageError } = await supabase.storage
      .from("dia-informes-files")
      .remove([file.storage_path]);

    if (storageError) throw storageError;

    const { error: deleteError } = await supabase
      .from("dia_request_files")
      .delete()
      .eq("id", file.id);

    if (deleteError) throw deleteError;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: "archivo_eliminado",
        titulo: "Archivo eliminado del legajo",
        detalle: {
          categoria: file.categoria || null,
          categoria_label: getCategoriaArchivoLabel(file.categoria),
          nombre_archivo: file.nombre_archivo || null,
          storage_path: file.storage_path || null,
          mime_type: file.mime_type || null,
          size_bytes: file.size_bytes || null,
        },
        created_by_name: user?.user_metadata?.full_name || null,
        created_by_email: user?.email || null,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...prev]);
    }

    setArchivosLegajo((prev) =>
      Array.isArray(prev) ? prev.filter((item) => item.id !== file.id) : []
    );

    setArchivoMsg("Archivo eliminado correctamente.");

    await fetchArchivosLegajo();
  } catch (error) {
    console.error("Error eliminando archivo del legajo:", error);
    setArchivoMsg(error?.message || "No se pudo eliminar el archivo.");
  }
}

function handleOpenDatosLegajoEditor() {
  setDatosLegajoForm(buildDatosLegajoForm(row));
  setDatosLegajoError("");
  setDatosLegajoDirty(false);
  setEditingFrqBlock(false);
  setEditingDominioBlock(false);
  setEditingTitularBlock(false);
  setShowDatosLegajoEditor(true);
}

async function fetchNotasLegajo() {
  if (!id) return;

  try {
    setLoadingNotas(true);
    setNotaMsg("");

    const { data, error } = await supabase
      .from("dia_notes")
      .select("*")
      .eq("request_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    setNotasLegajo(data || []);
  } catch (error) {
    console.error("Error cargando notas del informe:", error);
    setNotasLegajo([]);
    setNotaMsg(error?.message || "No se pudieron cargar las notas del informe.");
  } finally {
    setLoadingNotas(false);
  }
}

async function handleGuardarNotaLegajo() {
  if (!id) return;

  const notaLimpia = nuevaNota.trim();

  if (!notaLimpia) {
    setNotaMsg("Escribí una nota antes de guardar.");
    return;
  }

  try {
    setSavingNota(true);
    setNotaMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let profile = null;

    if (user?.id) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role, name, full_name, email")
        .eq("id", user.id)
        .maybeSingle();

      profile = profileData || null;
    }

    const authorName =
      profile?.full_name ||
      profile?.name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "Usuario";

    const authorEmail = profile?.email || user?.email || null;

    const authorRole = profile?.role || "member";

    const createdAt = new Date().toISOString();

    const parentId = respondiendoNota?.id || null;

    const { data: createdNote, error: noteError } = await supabase
      .from("dia_notes")
      .insert({
        request_id: id,
        parent_id: parentId,
        note: notaLimpia,
        author_id: user?.id || null,
        author_name: authorName,
        author_email: authorEmail,
        author_role: authorRole,
        created_at: createdAt,
      })
      .select("*")
      .single();

    if (noteError) throw noteError;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: parentId ? "respuesta_agregada" : "nota_agregada",
        titulo: parentId
          ? "Respuesta agregada al legajo"
          : "Nota agregada al legajo",
        detalle: {
          nota: notaLimpia,
          autor: authorName,
          email: authorEmail,
          parent_id: parentId,
        },
        detalle_texto: parentId
          ? `Respuesta operativa registrada por ${authorName}: ${notaLimpia}`
          : `Nota operativa registrada por ${authorName}: ${notaLimpia}`,
        created_by_name: authorName,
        created_by_email: authorEmail,
        created_at: createdAt,
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    if (createdNote) {
      setNotasLegajo((prev) => [createdNote, ...(prev || [])]);
    }

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...(prev || [])]);
    }

    setNuevaNota("");
    setRespondiendoNota(null);
    setHayAvisoNotas(true);

    setNotaMsg(
      parentId
        ? "Respuesta guardada correctamente."
        : "Nota guardada correctamente."
    );
  } catch (error) {
    console.error("Error guardando nota del informe:", error);
    setNotaMsg(error?.message || "No se pudo guardar la nota.");
  } finally {
    setSavingNota(false);
  }
}

function handlePrintResumenLegajo() {
  setPrintMode("resumen");

  const cleanup = () => {
    setPrintMode(null);
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  setTimeout(() => {
    window.print();
  }, 150);
}

function handlePrintFichaInforme() {
  setPrintMode("informe");

  const cleanup = () => {
    setPrintMode(null);
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  setTimeout(() => {
    window.print();
  }, 150);
}

function handlePrintFichaDominio() {
  setPrintMode("dominio");

  const cleanup = () => {
    setPrintMode(null);
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  setTimeout(() => {
    window.print();
  }, 150);
}

function handlePrintFichaFranquiciado() {
  setPrintMode("franquiciado");

  const cleanup = () => {
    setPrintMode(null);
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  setTimeout(() => {
    window.print();
  }, 150);
}

function handlePrintFichaGarante() {
  setPrintMode("garante");

  const cleanup = () => {
    setPrintMode(null);
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  setTimeout(() => {
    window.print();
  }, 150);
}

function handlePrintHistorial() {
  setPrintMode("historial");

  const cleanup = () => {
    setPrintMode(null);
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  setTimeout(() => {
    window.print();
  }, 150);
}

function handlePrintTrazabilidad() {
  setPrintMode("trazabilidad");

  const cleanup = () => {
    setPrintMode(null);
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  setTimeout(() => {
    window.print();
  }, 150);
}

function buildResumenLegajoCompleto() {
  const legajoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dia/informes/detalle-preview-real?id=${id}`
      : "";

  const titularNombre =
    row?.titular_tipo_persona === "JURIDICA"
      ? row?.titular_razon_social || "—"
      : `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim() ||
        "—";

  const franquiciadoNombre =
    row?.frq_tipo_persona === "HUMANA"
      ? `${row?.frq_apellido || ""} ${row?.frq_nombres || ""}`.trim() ||
        row?.frq ||
        "—"
      : row?.frq_razon_social || row?.frq || "—";

  const condominosTexto =
    Array.isArray(row?.condominos) && row.condominos.length > 0
      ? row.condominos
          .map((condomino, index) => {
            const nombreCondomino = `${condomino?.apellido || ""} ${
              condomino?.nombres || ""
            }`.trim();

            const conyugeCondomino =
              condomino?.estado_civil === "CASADO/A"
                ? `
  Cónyuge del condómino:
  - Apellido: ${condomino?.conyuge_apellido || "—"}
  - Nombres: ${condomino?.conyuge_nombres || "—"}
  - DNI: ${condomino?.conyuge_dni || "—"}
  - CUIL / CUIT: ${condomino?.conyuge_cuil_cuit || "—"}`
                : "";

            return `Condómino ${index + 1}
- Nombre: ${nombreCondomino || "—"}
- DNI: ${condomino?.dni || "—"}
- CUIL / CUIT: ${condomino?.cuil_cuit || "—"}
- Estado civil: ${condomino?.estado_civil || "—"}
- Titular desde: ${
              condomino?.titular_desde ? formatDate(condomino.titular_desde) : "—"
            }
- Porcentaje: ${condomino?.porcentaje ? `${condomino.porcentaje}%` : "—"}
- Domicilio: ${condomino?.domicilio || "—"}${conyugeCondomino}`;
          })
          .join("\n\n")
      : "Sin condóminos cargados.";

  const conyugeTitularTexto =
    row?.titular_estado_civil === "CASADO/A"
      ? `
Cónyuge del titular:
- Apellido: ${row?.titular_conyuge_apellido || "—"}
- Nombres: ${row?.titular_conyuge_nombres || "—"}
- DNI: ${row?.titular_conyuge_dni || "—"}
- CUIL / CUIT: ${row?.titular_conyuge_cuil_cuit || "—"}`
      : "Cónyuge del titular: No corresponde / no informado.";

const trazabilidadTexto = [
  ["Solicitud del informe", row?.created_at],
  ["Gestión SAKI", row?.datos_legajo_actualizado_en || row?.updated_at],
  ["Observación", row?.observed_date],
  [
    row?.status === "ENTREGADO"
      ? "Informe entregado"
      : row?.status === "ANULADO"
      ? "Informe anulado"
      : "Estado actual",
    row?.datos_legajo_actualizado_en || row?.updated_at || row?.created_at,
  ],
]
  .filter(([, fecha]) => fecha)
  .map(([titulo, fecha]) => `- ${titulo}: ${formatDate(fecha)}`)
  .join("\n");

  return `SAKI — Resumen del informe

Fecha de generación: ${new Date().toLocaleDateString("es-AR")}

1. Datos principales
- Dominio: ${row?.dominio || "—"}
- Estado actual: ${row?.estado || "—"}
- Próxima acción: ${proximaAccionInfo?.titulo || "—"}
- Tienda: ${row?.tienda || "—"}
- Franquiciado: ${franquiciadoNombre}
- CUIT franquiciado: ${row?.frq_cuit || "—"}


2. Informe
- Tipo de informe: ${getInformeTipoLabel(row?.type)}
- Estado: ${row?.status || row?.estado || "—"}
- Resultado: ${row?.result || "Pendiente"}
- Fecha del pedido: ${row?.created_at ? formatDate(row.created_at) : "—"}
- Estado observado: ${row?.observed_status || "—"}
- Fecha de observación: ${
    row?.observed_date ? formatDate(row.observed_date) : "—"
  }
- Monto observado: ${row?.observed_amount || "—"}
- Detalle / otros: ${row?.observed_other || "—"}

3. Dominio / Automotor
- Dominio: ${row?.dominio || "—"}
- Marca: ${row?.marca || "—"}
- Modelo: ${row?.modelo || "—"}
- Tipo: ${row?.tipo || "—"}
- Modelo año: ${row?.modelo_anio || "—"}
- Marca motor: ${row?.marca_motor || "—"}
- N° motor: ${row?.numero_motor || "—"}
- Marca chasis: ${row?.marca_chasis || "—"}
- N° chasis: ${row?.numero_chasis || "—"}
- Radicación: ${row?.radicacion || "—"}
- Registro interviniente: ${row?.registro_interviniente || "—"}

4. Franquiciado
- Tipo de persona: ${
    row?.frq_tipo_persona === "HUMANA" ? "Persona humana" : "Persona jurídica"
  }
- Nombre / razón social: ${franquiciadoNombre}
- CUIT / CUIL: ${row?.frq_cuit || "—"}
- Email: ${row?.frq_email || "—"}
- Teléfono: ${row?.frq_telefono || "—"}
- Domicilio: ${row?.frq_domicilio || "—"}

5. Garante / Titular
- Tipo de persona: ${
    row?.titular_tipo_persona === "JURIDICA"
      ? "Persona jurídica"
      : "Persona humana"
  }
- Nombre / razón social: ${titularNombre}
- DNI: ${row?.titular_dni || "—"}
- CUIL / CUIT: ${row?.titular_cuil_cuit || row?.titular_cuit || "—"}
- Estado civil: ${row?.titular_estado_civil || "—"}
- Titular desde: ${row?.titular_desde ? formatDate(row.titular_desde) : "—"}
- Porcentaje de titularidad: ${
    row?.porcentaje_titular ? `${row.porcentaje_titular}%` : "—"
  }
- Domicilio: ${row?.titular_domicilio || "—"}

${conyugeTitularTexto}

6. Condóminos
${condominosTexto}

7. Trazabilidad básica
${trazabilidadTexto || "Sin hitos cargados."}

8. Link directo al legajo
${legajoUrl}`;
}

function handleDescargarResumenLegajoTxt() {
  const resumen = buildResumenLegajoCompleto();

  const nombreArchivo = `saki-informe-${row?.dominio || id || "informe"}.txt`;

  const blob = new Blob([resumen], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

async function handleCopiarDatosLegajo() {
  try {
    await navigator.clipboard.writeText(buildResumenLegajoCompleto());
    alert("Resumen completo del legajo copiado al portapapeles.");
  } catch (error) {
    console.error("Error copiando resumen del legajo:", error);
    alert("No se pudo copiar el resumen del legajo.");
  }
}

async function handleCompartirLegajo() {
  const resumen = buildResumenLegajoCompleto();

  const legajoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dia/informes/detalle-preview-real?id=${id}`
      : "";

  try {
    if (navigator.share) {
      await navigator.share({
        title: `Legajo SAKI ${row?.dominio || ""}`,
        text: resumen,
        url: legajoUrl,
      });

      return;
    }

    await navigator.clipboard.writeText(resumen);
    alert("Resumen completo y link del legajo copiados al portapapeles.");
  } catch (error) {
    console.error("Error compartiendo legajo:", error);
    alert("No se pudo compartir el legajo.");
  }
}

async function handleCambiarEstadoInforme({
  nuevoStatus,
  nuevoResult,
  tipoEvento,
  tituloHistorial,
  detalleHistorial = {},
  extraPayload = {},
}) {
  if (!id || !isAdmin || savingEstadoInforme) return;

  try {
    setSavingEstadoInforme(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      status: nuevoStatus,
      datos_legajo_actualizado_en: new Date().toISOString(),
      ...extraPayload,
    };

    if (nuevoResult !== undefined) {
      payload.result = nuevoResult;
    }

    const { data, error } = await supabase
      .from("dia_requests")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: tipoEvento,
        titulo: tituloHistorial,
        detalle: {
          status: nuevoStatus,
          result: nuevoResult || null,
          ...detalleHistorial,
        },
        created_by_name: user?.user_metadata?.full_name || null,
        created_by_email: user?.email || null,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    setRow(data);

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...prev]);
    }
  } catch (error) {
    console.error("Error cambiando estado del informe:", error);
    alert(error?.message || "No se pudo cambiar el estado del informe.");
  } finally {
    setSavingEstadoInforme(false);
  }
}

async function handleTomarGestionInforme() {
  await handleCambiarEstadoInforme({
    nuevoStatus: "EN CURSO",
    nuevoResult: "PENDIENTE",
    tipoEvento: "informe_en_curso",
    tituloHistorial: "Informe en gestión",
    detalleHistorial: {
      accion: "SAKI tomó intervención y el informe pasó a estar en gestión.",
    },
  });
}

function handleOpenObservacionInformeModal() {
  setObservacionInformeMsg("");
  setObservacionesForm([createEmptyInformeObservacion()]);
  setShowObservacionInformeModal(true);
}

function handleCancelObservacionInformeModal() {
  if (savingObservacionInforme) return;

  setObservacionInformeMsg("");
  setObservacionesForm([createEmptyInformeObservacion()]);
  setShowObservacionInformeModal(false);
}

function handleObservacionFormChange(index, field, value) {
  setObservacionesForm((prev) => {
    const next = Array.isArray(prev) ? [...prev] : [];
    next[index] = {
      ...(next[index] || createEmptyInformeObservacion()),
      [field]: value,
    };
    return next;
  });
}

function handleAddObservacionForm() {
  setObservacionesForm((prev) => [
    ...(Array.isArray(prev) ? prev : []),
    createEmptyInformeObservacion(),
  ]);
}

function handleRemoveObservacionForm(index) {
  setObservacionesForm((prev) => {
    const next = Array.isArray(prev)
      ? prev.filter((_, itemIndex) => itemIndex !== index)
      : [];

    return next.length > 0 ? next : [createEmptyInformeObservacion()];
  });
}

async function handleGuardarObservacionInforme() {
  if (!id || !isAdmin || savingObservacionInforme) return;

  const observacionesLimpias = (Array.isArray(observacionesForm)
    ? observacionesForm
    : []
  )
    .map((obs) => ({
      tipo_observacion: (obs?.tipo_observacion || "prenda").toString().trim(),
      tipo_medida: (obs?.tipo_medida || "").toString().trim(),
      acreedor: (obs?.acreedor || "").toString().trim(),
      grado: (obs?.grado || "").toString().trim(),
      juzgado: (obs?.juzgado || "").toString().trim(),
      actor: (obs?.actor || "").toString().trim(),
      expediente: (obs?.expediente || "").toString().trim(),
      fecha_contrato: (obs?.fecha_contrato || "").toString().trim(),
      fecha_inscripcion: (obs?.fecha_inscripcion || "").toString().trim(),
      monto: (obs?.monto || "").toString().trim(),
      estado: (obs?.estado || "").toString().trim(),
      observacion: (obs?.observacion || "").toString().trim(),
    }))
    .filter((obs) => {
      return (
        obs.tipo_observacion ||
        obs.tipo_medida ||
        obs.acreedor ||
        obs.grado ||
        obs.juzgado ||
        obs.actor ||
        obs.expediente ||
        obs.fecha_contrato ||
        obs.fecha_inscripcion ||
        obs.monto ||
        obs.estado ||
        obs.observacion
      );
    });

  if (observacionesLimpias.length === 0) {
    setObservacionInformeMsg("Cargá al menos una observación para entregar el informe como observado.");
    return;
  }

  try {
    setSavingObservacionInforme(true);
    setObservacionInformeMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const authorName =
      currentProfile?.full_name ||
      currentProfile?.name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "Usuario";

    const authorEmail = currentProfile?.email || user?.email || null;

    const now = new Date().toISOString();

    const observacionesPayload = observacionesLimpias.map((obs) => ({
      request_id: id,
      tipo_observacion: obs.tipo_observacion,
      tipo_medida: obs.tipo_medida || null,
      acreedor: obs.acreedor || null,
      grado: obs.grado || null,
      juzgado: obs.juzgado || null,
      actor: obs.actor || null,
      expediente: obs.expediente || null,
      fecha_contrato: obs.fecha_contrato || null,
      fecha_inscripcion: obs.fecha_inscripcion || null,
      monto: obs.monto || null,
      estado: obs.estado || null,
      observacion: obs.observacion || null,
      created_by: user?.id || null,
      created_by_email: authorEmail,
      created_at: now,
    }));

    const { data: createdObservaciones, error: observacionesError } =
      await supabase
        .from("dia_request_informe_observaciones")
        .insert(observacionesPayload)
        .select("*");

    if (observacionesError) throw observacionesError;

    const getTipoObservacionLabel = (value) => {
      const key = (value || "").toString().trim();

      if (key === "prenda") return "Prenda";
      if (key === "embargo") return "Embargo";
      if (key === "inhibicion") return "Inhibición";
      if (key === "medida_cautelar") return "Medida cautelar";
      if (key === "otro") return "Otro";

      return key || "Observación";
    };

    const resumenObservaciones = observacionesLimpias
      .map((obs, index) => {
        const tipo = getTipoObservacionLabel(obs.tipo_observacion);

        const partes = [
          tipo,
          obs.tipo_medida,
          obs.acreedor ? `Acreedor: ${obs.acreedor}` : "",
          obs.juzgado ? `Juzgado: ${obs.juzgado}` : "",
          obs.actor ? `Actor: ${obs.actor}` : "",
          obs.expediente ? `Expediente: ${obs.expediente}` : "",
          obs.fecha_inscripcion ? `Fecha inscripción: ${obs.fecha_inscripcion}` : "",
          obs.monto ? `Monto: ${obs.monto}` : "",
          obs.estado ? `Estado: ${obs.estado}` : "",
        ].filter(Boolean);

        return `${index + 1}. ${partes.join(" · ")}`;
      })
      .join(" | ");

    const primerMonto =
      observacionesLimpias.find((obs) => obs.monto)?.monto || null;

    const { data: updatedInforme, error: updateError } = await supabase
      .from("dia_requests")
      .update({
        status: "ENTREGADO",
        result: "OBSERVADO",
        observed_status: "OBSERVADO",
        observed_date: now,
        observed_amount: null,
        observed_other: resumenObservaciones,
        datos_legajo_actualizado_en: now,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: "informe_observado",
        titulo: "Informe entregado observado",
        detalle: {
          resultado: "OBSERVADO",
          observaciones: observacionesLimpias,
          cantidad_observaciones: observacionesLimpias.length,
        },
        detalle_texto: `Informe entregado con resultado observado. ${resumenObservaciones}`,
        created_by_name: authorName,
        created_by_email: authorEmail,
        created_at: now,
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    setRow(updatedInforme);

    if (Array.isArray(createdObservaciones)) {
      setObservacionesInforme((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        ...createdObservaciones,
      ]);
    }

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...(prev || [])]);
    }

    setObservacionesForm([createEmptyInformeObservacion()]);
    setShowObservacionInformeModal(false);
    setObservacionInformeMsg("");

    await fetchObservacionesInforme();
  } catch (error) {
    console.error("Error guardando observación del informe:", error);
    setObservacionInformeMsg(
      error?.message || "No se pudo guardar la observación del informe."
    );
  } finally {
    setSavingObservacionInforme(false);
  }
}

async function handleEntregarInformeAprobado() {
  const confirmar = window.confirm(
    "¿Confirmás que el informe fue entregado sin observaciones?"
  );

  if (!confirmar) return;

  await handleCambiarEstadoInforme({
    nuevoStatus: "ENTREGADO",
    nuevoResult: "APROBADO",
    tipoEvento: "informe_entregado",
    tituloHistorial: "Informe entregado",
    detalleHistorial: {
      resultado: "APROBADO",
      accion: "El informe fue entregado sin observaciones.",
    },
    extraPayload: {
      observed_status: null,
      observed_date: null,
      observed_amount: null,
      observed_other: null,
    },
  });
}

async function handleEntregarInformeObservado() {
  const detalle = window.prompt(
    "Detalle de la observación del informe:"
  );

  if (detalle === null) return;

  const monto = window.prompt(
    "Monto observado, si corresponde. Si no corresponde, dejalo vacío:"
  );

  await handleCambiarEstadoInforme({
    nuevoStatus: "ENTREGADO",
    nuevoResult: "OBSERVADO",
    tipoEvento: "informe_observado",
    tituloHistorial: "Informe observado",
    detalleHistorial: {
      resultado: "OBSERVADO",
      observacion: detalle || "Sin detalle adicional cargado.",
      monto_observado: monto || null,
    },
    extraPayload: {
      observed_status: "OBSERVADO",
      observed_date: new Date().toISOString(),
      observed_amount: monto || null,
      observed_other: detalle || null,
    },
  });
}

async function handleAnularInforme() {
  const motivo = window.prompt("Motivo de anulación del informe:");

  if (!motivo) return;

  await handleCambiarEstadoInforme({
    nuevoStatus: "ANULADO",
    nuevoResult: undefined,
    tipoEvento: "informe_anulado",
    tituloHistorial: "Informe anulado",
    detalleHistorial: {
      motivo,
    },
  });
}

async function handleCambiarEstadoInforme({
  nuevoStatus,
  nuevoResult,
  tipoEvento,
  tituloHistorial,
  detalleHistorial = {},
  extraPayload = {},
}) {
  if (!id || !isAdmin || savingEstadoInforme) return;

  try {
    setSavingEstadoInforme(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      status: nuevoStatus,
      datos_legajo_actualizado_en: new Date().toISOString(),
      ...extraPayload,
    };

    if (nuevoResult !== undefined) {
      payload.result = nuevoResult;
    }

    const { data, error } = await supabase
      .from("dia_requests")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: tipoEvento,
        titulo: tituloHistorial,
        detalle: {
          status: nuevoStatus,
          result: nuevoResult || null,
          ...detalleHistorial,
        },
        created_by_name: user?.user_metadata?.full_name || null,
        created_by_email: user?.email || null,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    setRow(data);

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...prev]);
    }
  } catch (error) {
    console.error("Error cambiando estado del informe:", error);
    alert(error?.message || "No se pudo cambiar el estado del informe.");
  } finally {
    setSavingEstadoInforme(false);
  }
}

async function handleTomarGestionInforme() {
  await handleCambiarEstadoInforme({
    nuevoStatus: "EN CURSO",
    nuevoResult: "PENDIENTE",
    tipoEvento: "informe_en_curso",
    tituloHistorial: "Informe en gestión",
    detalleHistorial: {
      accion: "SAKI tomó intervención y el informe pasó a estar en gestión.",
    },
  });
}

async function handleEntregarInformeAprobado() {
  const confirmar = window.confirm(
    "¿Confirmás que el informe fue entregado sin observaciones?"
  );

  if (!confirmar) return;

  await handleCambiarEstadoInforme({
    nuevoStatus: "ENTREGADO",
    nuevoResult: "APROBADO",
    tipoEvento: "informe_entregado",
    tituloHistorial: "Informe entregado",
    detalleHistorial: {
      resultado: "APROBADO",
      accion: "El informe fue entregado sin observaciones.",
    },
    extraPayload: {
      observed_status: null,
      observed_date: null,
      observed_amount: null,
      observed_other: null,
    },
  });
}

async function handleEntregarInformeObservado() {
  const detalle = window.prompt("Detalle de la observación del informe:");

  if (detalle === null) return;

  const monto = window.prompt(
    "Monto observado, si corresponde. Si no corresponde, dejalo vacío:"
  );

  await handleCambiarEstadoInforme({
    nuevoStatus: "ENTREGADO",
    nuevoResult: "OBSERVADO",
    tipoEvento: "informe_observado",
    tituloHistorial: "Informe observado",
    detalleHistorial: {
      resultado: "OBSERVADO",
      observacion: detalle || "Sin detalle adicional cargado.",
      monto_observado: monto || null,
    },
    extraPayload: {
      observed_status: "OBSERVADO",
      observed_date: new Date().toISOString(),
      observed_amount: monto || null,
      observed_other: detalle || null,
    },
  });
}

async function handleAnularInforme() {
  const motivo = window.prompt("Motivo de anulación del informe:");

  if (!motivo) return;

  await handleCambiarEstadoInforme({
    nuevoStatus: "ANULADO",
    nuevoResult: undefined,
    tipoEvento: "informe_anulado",
    tituloHistorial: "Informe anulado",
    detalleHistorial: {
      motivo,
    },
  });
}

function handleCancelDatosLegajoEditor() {
  if (datosLegajoDirty) {
    const confirmarSalida = window.confirm(
      "Tenés cambios sin guardar. Si salís ahora, vas a perder los datos cargados. ¿Querés salir igual?"
    );

    if (!confirmarSalida) return;
  }

  setDatosLegajoForm(buildDatosLegajoForm(row));
  setDatosLegajoError("");
  setDatosLegajoDirty(false);
  setShowDatosLegajoEditor(false);
}

function handleDatosLegajoChange(field, value) {
  setDatosLegajoDirty(true);

  setDatosLegajoForm((prev) => ({
    ...prev,
    [field]: value,
  }));
}

function handleAddPrendaCondomino() {
  setDatosLegajoForm((prev) => ({
    ...prev,
    condominos: [
      ...(Array.isArray(prev.condominos) ? prev.condominos : []),
      createEmptyPrendaCondomino(),
    ],
  }));
}

function handlePrendaCondominoChange(index, field, value) {
  setDatosLegajoForm((prev) => {
    const condominos = Array.isArray(prev.condominos)
      ? [...prev.condominos]
      : [];

    condominos[index] = {
      ...(condominos[index] || createEmptyPrendaCondomino()),
      [field]: value,
    };

    return {
      ...prev,
      condominos,
    };
  });
}

function handleRemovePrendaCondomino(index) {
  setDatosLegajoForm((prev) => ({
    ...prev,
    condominos: Array.isArray(prev.condominos)
      ? prev.condominos.filter((_, itemIndex) => itemIndex !== index)
      : [],
  }));
}

function handleVehiculoNominalChange(index, field, value) {
  setVehiculosNominalForm((prev) => {
    const next = Array.isArray(prev) ? [...prev] : [];

    next[index] = {
      ...(next[index] || createEmptyVehiculoNominal()),
      [field]: value,
    };

    return next;
  });
}

function handleAddVehiculoNominal() {
  setVehiculosNominalForm((prev) => [
    ...(Array.isArray(prev) ? prev : []),
    createEmptyVehiculoNominal(),
  ]);
}

function handleRemoveVehiculoNominal(index) {
  setVehiculosNominalForm((prev) => {
    const next = Array.isArray(prev)
      ? prev.filter((_, itemIndex) => itemIndex !== index)
      : [];

    return next.length > 0 ? next : [createEmptyVehiculoNominal()];
  });
}

function handleEditarVehiculoNominal(vehiculo) {
  if (!vehiculo) return;

  setVehiculoNominalEditandoId(vehiculo.id);

  setVehiculosNominalForm([
    {
      condicion_titular: vehiculo?.condicion_titular || "titular_actual",
      dominio: vehiculo?.dominio || "",
      marca: vehiculo?.marca || "",
      modelo: vehiculo?.modelo || "",
      tipo: vehiculo?.tipo || "",
      modelo_anio: vehiculo?.modelo_anio || "",
      registro_seccional: vehiculo?.registro_seccional || "",
      registro_domicilio: vehiculo?.registro_domicilio || "",
      registro_localidad: vehiculo?.registro_localidad || "",
      registro_provincia: vehiculo?.registro_provincia || "",
      titular: vehiculo?.titular || "",
      documento_titular: vehiculo?.documento_titular || "",
      porcentaje_titular: vehiculo?.porcentaje_titular || "",
      fecha_titular: vehiculo?.fecha_titular || "",
      observacion: vehiculo?.observacion || "",
    },
  ]);

  setVehiculosNominalMsg(
    "Editando vehículo informado. Modificá los datos y guardá los cambios."
  );
}

function handleCancelarEdicionVehiculoNominal() {
  setVehiculoNominalEditandoId(null);
  setVehiculosNominalForm([createEmptyVehiculoNominal()]);
  setVehiculosNominalMsg("");
}

async function handleEliminarVehiculoNominal(vehiculo) {
  if (!id || !isAdmin || !vehiculo?.id || savingVehiculosNominal) return;

  const confirmar = window.confirm(
    `¿Eliminar el vehículo informado "${vehiculo?.dominio || "sin dominio"}"? Esta acción no se puede deshacer.`
  );

  if (!confirmar) return;

  try {
    setSavingVehiculosNominal(true);
    setVehiculosNominalMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const authorName =
      currentProfile?.full_name ||
      currentProfile?.name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "Usuario";

    const authorEmail = currentProfile?.email || user?.email || null;

    const now = new Date().toISOString();

    const { error: deleteError } = await supabase
      .from("dia_request_informe_nominal_vehiculos")
      .delete()
      .eq("id", vehiculo.id)
      .eq("request_id", id);

    if (deleteError) throw deleteError;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: "vehiculo_nominal_eliminado",
        titulo: "Vehículo informado eliminado",
        detalle: {
          vehiculo_id: vehiculo.id,
          dominio: vehiculo?.dominio || null,
          marca: vehiculo?.marca || null,
          modelo: vehiculo?.modelo || null,
          titular: vehiculo?.titular || null,
        },
        detalle_texto: `SAKI eliminó un vehículo informado del informe nominal. Dominio: ${
          vehiculo?.dominio || "—"
        }. ${vehiculo?.marca || "—"} ${vehiculo?.modelo || ""}. Titular: ${
          vehiculo?.titular || "—"
        }.`,
        created_by_name: authorName,
        created_by_email: authorEmail,
        created_at: now,
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    const { data: updatedInforme, error: updateError } = await supabase
      .from("dia_requests")
      .update({
        datos_legajo_actualizado_en: now,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    setRow(updatedInforme);

    setVehiculosNominal((prev) =>
      Array.isArray(prev)
        ? prev.filter((item) => item.id !== vehiculo.id)
        : []
    );

    if (vehiculoNominalEditandoId === vehiculo.id) {
      setVehiculoNominalEditandoId(null);
      setVehiculosNominalForm([createEmptyVehiculoNominal()]);
    }

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...(prev || [])]);
    }

    setVehiculosNominalMsg("Vehículo informado eliminado correctamente.");

    await fetchVehiculosNominal();
  } catch (error) {
    console.error("Error eliminando vehículo informado:", error);
    setVehiculosNominalMsg(
      error?.message || "No se pudo eliminar el vehículo informado."
    );
  } finally {
    setSavingVehiculosNominal(false);
  }
}

async function handleGuardarVehiculosNominal() {
  if (!id || !isAdmin || savingVehiculosNominal) return;

  const vehiculosLimpios = (Array.isArray(vehiculosNominalForm)
    ? vehiculosNominalForm
    : []
  )
    .map((vehiculo) => ({
      condicion_titular: (
        vehiculo?.condicion_titular || "titular_actual"
      ).toString().trim(),
      dominio: (vehiculo?.dominio || "").toString().trim().toUpperCase(),
      marca: (vehiculo?.marca || "").toString().trim().toUpperCase(),
      modelo: (vehiculo?.modelo || "").toString().trim().toUpperCase(),
      tipo: (vehiculo?.tipo || "").toString().trim().toUpperCase(),
      modelo_anio: (vehiculo?.modelo_anio || "").toString().trim(),
      registro_seccional: (vehiculo?.registro_seccional || "")
        .toString()
        .trim()
        .toUpperCase(),
      registro_domicilio: (vehiculo?.registro_domicilio || "")
        .toString()
        .trim()
        .toUpperCase(),
      registro_localidad: (vehiculo?.registro_localidad || "")
        .toString()
        .trim()
        .toUpperCase(),
      registro_provincia: (vehiculo?.registro_provincia || "")
        .toString()
        .trim()
        .toUpperCase(),
      titular: (vehiculo?.titular || "").toString().trim().toUpperCase(),
      documento_titular: (vehiculo?.documento_titular || "").toString().trim(),
      porcentaje_titular: (vehiculo?.porcentaje_titular || "")
        .toString()
        .trim(),
      fecha_titular: (vehiculo?.fecha_titular || "").toString().trim(),
      observacion: (vehiculo?.observacion || "").toString().trim(),
    }))
    .filter((vehiculo) => {
      return (
        vehiculo.dominio ||
        vehiculo.marca ||
        vehiculo.modelo ||
        vehiculo.tipo ||
        vehiculo.modelo_anio ||
        vehiculo.registro_seccional ||
        vehiculo.titular ||
        vehiculo.documento_titular ||
        vehiculo.porcentaje_titular ||
        vehiculo.fecha_titular ||
        vehiculo.observacion
      );
    });

  if (vehiculosLimpios.length === 0) {
    setVehiculosNominalMsg(
      "Cargá al menos un vehículo informado antes de guardar."
    );
    return;
  }

  try {
    setSavingVehiculosNominal(true);
    setVehiculosNominalMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const authorName =
      currentProfile?.full_name ||
      currentProfile?.name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "Usuario";

    const authorEmail = currentProfile?.email || user?.email || null;

    const now = new Date().toISOString();

    const esEdicionVehiculo = Boolean(vehiculoNominalEditandoId);

const payload = vehiculosLimpios.map((vehiculo) => ({
  request_id: id,
  condicion_titular: vehiculo.condicion_titular,
  dominio: vehiculo.dominio || null,
  marca: vehiculo.marca || null,
  modelo: vehiculo.modelo || null,
  tipo: vehiculo.tipo || null,
  modelo_anio: vehiculo.modelo_anio || null,
  registro_seccional: vehiculo.registro_seccional || null,
  registro_domicilio: vehiculo.registro_domicilio || null,
  registro_localidad: vehiculo.registro_localidad || null,
  registro_provincia: vehiculo.registro_provincia || null,
  titular: vehiculo.titular || null,
  documento_titular: vehiculo.documento_titular || null,
  porcentaje_titular: vehiculo.porcentaje_titular || null,
  fecha_titular: vehiculo.fecha_titular || null,
  observacion: vehiculo.observacion || null,
  created_by: user?.id || null,
  created_by_email: authorEmail,
  created_at: now,
}));

let vehiculosGuardados = [];

if (esEdicionVehiculo) {
  const vehiculoEditado = payload[0];

  const { data: updatedVehiculo, error: vehiculosError } = await supabase
    .from("dia_request_informe_nominal_vehiculos")
    .update({
      condicion_titular: vehiculoEditado.condicion_titular,
      dominio: vehiculoEditado.dominio,
      marca: vehiculoEditado.marca,
      modelo: vehiculoEditado.modelo,
      tipo: vehiculoEditado.tipo,
      modelo_anio: vehiculoEditado.modelo_anio,
      registro_seccional: vehiculoEditado.registro_seccional,
      registro_domicilio: vehiculoEditado.registro_domicilio,
      registro_localidad: vehiculoEditado.registro_localidad,
      registro_provincia: vehiculoEditado.registro_provincia,
      titular: vehiculoEditado.titular,
      documento_titular: vehiculoEditado.documento_titular,
      porcentaje_titular: vehiculoEditado.porcentaje_titular,
      fecha_titular: vehiculoEditado.fecha_titular,
      observacion: vehiculoEditado.observacion,
    })
    .eq("id", vehiculoNominalEditandoId)
    .eq("request_id", id)
    .select("*")
    .single();

  if (vehiculosError) throw vehiculosError;

  vehiculosGuardados = updatedVehiculo ? [updatedVehiculo] : [];
} else {
  const { data: createdVehiculos, error: vehiculosError } = await supabase
    .from("dia_request_informe_nominal_vehiculos")
    .insert(payload)
    .select("*");

  if (vehiculosError) throw vehiculosError;

  vehiculosGuardados = createdVehiculos || [];
}

    const resumenVehiculos = vehiculosLimpios
      .map((vehiculo, index) => {
        const condicion =
          vehiculo.condicion_titular === "titular_historico"
            ? "Titular histórico"
            : "Titular actual";

        return `${index + 1}. ${condicion} · Dominio: ${
          vehiculo.dominio || "—"
        } · ${vehiculo.marca || "—"} ${vehiculo.modelo || ""} · Titular: ${
          vehiculo.titular || "—"
        }`;
      })
      .join(" | ");

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: esEdicionVehiculo
  ? "vehiculo_nominal_actualizado"
  : "vehiculos_nominal_cargados",
titulo: esEdicionVehiculo
  ? "Vehículo informado actualizado"
  : "Vehículos informados cargados",
        detalle: {
          cantidad_vehiculos: vehiculosLimpios.length,
          vehiculos: vehiculosLimpios,
        },
        detalle_texto: esEdicionVehiculo
  ? `SAKI actualizó un vehículo informado del informe nominal. ${resumenVehiculos}`
  : `SAKI cargó vehículos informados del informe nominal. ${resumenVehiculos}`,
        created_by_name: authorName,
        created_by_email: authorEmail,
        created_at: now,
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    const { data: updatedInforme, error: updateError } = await supabase
      .from("dia_requests")
      .update({
        datos_legajo_actualizado_en: now,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    setRow(updatedInforme);

if (esEdicionVehiculo) {
  setVehiculosNominal((prev) =>
    Array.isArray(prev)
      ? prev.map((item) =>
          item.id === vehiculoNominalEditandoId
            ? vehiculosGuardados[0] || item
            : item
        )
      : []
  );
} else if (Array.isArray(vehiculosGuardados)) {
  setVehiculosNominal((prev) => [
    ...(Array.isArray(prev) ? prev : []),
    ...vehiculosGuardados,
  ]);
}

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...(prev || [])]);
    }

    setVehiculoNominalEditandoId(null);
setVehiculosNominalForm([createEmptyVehiculoNominal()]);
setVehiculosNominalMsg(
  esEdicionVehiculo
    ? "Vehículo informado actualizado correctamente."
    : "Vehículos informados guardados correctamente."
);

    await fetchVehiculosNominal();
  } catch (error) {
    console.error("Error guardando vehículos del informe nominal:", error);
    setVehiculosNominalMsg(
      error?.message || "No se pudieron guardar los vehículos informados."
    );
  } finally {
    setSavingVehiculosNominal(false);
  }
}

async function handleSaveFrqBlock() {
  if (!id || !isAdmin) return;

  try {
    setSavingDatosLegajo(true);
    setDatosLegajoError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      tienda: datosLegajoForm.tienda || null,
      frq_tipo_persona: datosLegajoForm.frq_tipo_persona || null,
      frq_apellido: datosLegajoForm.frq_apellido || null,
      frq_nombres: datosLegajoForm.frq_nombres || null,
      frq_razon_social: datosLegajoForm.frq_razon_social || null,
      frq_cuit: datosLegajoForm.frq_cuit || null,
      frq_email: datosLegajoForm.frq_email || null,
      frq_telefono: datosLegajoForm.frq_telefono || null,
      frq_domicilio: datosLegajoForm.frq_domicilio || null,

franquiciado:
  datosLegajoForm.frq_tipo_persona === "HUMANA"
    ? `${datosLegajoForm.frq_apellido || ""} ${datosLegajoForm.frq_nombres || ""}`.trim() || null
    : datosLegajoForm.frq_razon_social || null,

datos_legajo_actualizado_en: new Date().toISOString(),
      datos_legajo_actualizado_por: user?.id || null,
    };

    const { data, error } = await supabase
      .from("dia_requests")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: "datos_informe_actualizados",
        titulo: "Datos administrativos del informe actualizados por SAKI",
        detalle: {
          seccion: "Franquiciado",
          campos: [
            "tienda",
            "frq_tipo_persona",
            "frq_apellido",
            "frq_nombres",
            "frq_razon_social",
            "frq_cuit",
            "frq_email",
            "frq_telefono",
            "frq_domicilio",
          ],
        },
        created_by_name: user?.user_metadata?.full_name || null,
        created_by_email: user?.email || null,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    setRow(data);
    setDatosLegajoForm(buildDatosLegajoForm(data));

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...prev]);
    }
setDatosLegajoDirty(false);
    setEditingFrqBlock(false);
  } catch (error) {
    console.error("Error guardando datos del franquiciado:", error);
    alert(error?.message || "No se pudieron guardar los datos del franquiciado.");
  } finally {
    setSavingDatosLegajo(false);
  }
}

async function handleSaveDominioBlock() {
  if (!id || !isAdmin) return;

  try {
    setSavingDatosLegajo(true);
    setDatosLegajoError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      dominio: datosLegajoForm.dominio || null,
      marca: datosLegajoForm.marca || null,
      modelo: datosLegajoForm.modelo || null,
      tipo: datosLegajoForm.tipo || null,
      modelo_anio: datosLegajoForm.modelo_anio || null,
      marca_motor: datosLegajoForm.marca_motor || null,
      numero_motor: datosLegajoForm.numero_motor || null,
      marca_chasis: datosLegajoForm.marca_chasis || null,
      numero_chasis: datosLegajoForm.numero_chasis || null,
      radicacion: datosLegajoForm.radicacion || null,
      registro_interviniente: datosLegajoForm.registro_interviniente || null,
      datos_legajo_actualizado_en: new Date().toISOString(),
      datos_legajo_actualizado_por: user?.id || null,
    };

    const { data, error } = await supabase
      .from("dia_requests")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: "datos_informe_actualizados",
        titulo: "Datos administrativos del informe actualizados por SAKI",
        detalle: {
          seccion: "Dominio / Automotor",
          campos: [
            "dominio",
            "marca",
            "modelo",
            "tipo",
            "modelo_anio",
            "marca_motor",
            "numero_motor",
            "marca_chasis",
            "numero_chasis",
            "radicacion",
            "registro_interviniente",
          ],
        },
        created_by_name: user?.user_metadata?.full_name || null,
        created_by_email: user?.email || null,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    setRow(data);
    setDatosLegajoForm(buildDatosLegajoForm(data));

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...prev]);
    }

    setDatosLegajoDirty(false);
    setEditingDominioBlock(false);
  } catch (error) {
    console.error("Error guardando datos del dominio:", error);
    alert(error?.message || "No se pudieron guardar los datos del dominio.");
  } finally {
    setSavingDatosLegajo(false);
  }
}

async function handleSaveDatosLegajo() {
  if (!id || !isAdmin) return;

  setSavingDatosLegajo(true);
  setDatosLegajoError("");

  const titularidadTotal =
  Math.round(getPrendaTitularidadTotal(datosLegajoForm) * 100) / 100;

const hayTitularidadCargada =
  datosLegajoForm.porcentaje_titular !== "" ||
  (Array.isArray(datosLegajoForm.condominos) &&
    datosLegajoForm.condominos.length > 0);

if (hayTitularidadCargada && titularidadTotal !== 100) {
  setSavingDatosLegajo(false);
  setDatosLegajoError(
    `La titularidad debe sumar 100%. Actualmente suma ${titularidadTotal}%.`
  );
  return;
}

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
        // Datos administrativos del informe
status: datosLegajoForm.status || null,
result:
  datosLegajoForm.result === "PENDIENTE"
    ? null
    : datosLegajoForm.result || null,
fecha_pedido_real: normalizeDateForDb(datosLegajoForm.fecha_pedido_real),
fecha_entrega_real: normalizeDateForDb(datosLegajoForm.fecha_entrega_real),
observed_status:
  datosLegajoForm.result === "OBSERVADO"
    ? datosLegajoForm.observed_status || "OBSERVADO"
    : null,

observed_date:
  datosLegajoForm.result === "OBSERVADO"
    ? normalizeDateForDb(
        datosLegajoForm.observed_date ||
          datosLegajoForm.fecha_entrega_real ||
          datosLegajoForm.fecha_pedido_real
      )
    : null,

observed_other:
  datosLegajoForm.result === "OBSERVADO"
    ? datosLegajoForm.observed_other || null
    : null,
      
      // Dominio / automotor
      dominio: datosLegajoForm.dominio || null,
      marca: datosLegajoForm.marca || null,
      modelo: datosLegajoForm.modelo || null,
      tipo: datosLegajoForm.tipo || null,
      modelo_anio: datosLegajoForm.modelo_anio || null,
      marca_motor: datosLegajoForm.marca_motor || null,
      numero_motor: datosLegajoForm.numero_motor || null,
      marca_chasis: datosLegajoForm.marca_chasis || null,
      numero_chasis: datosLegajoForm.numero_chasis || null,
      radicacion: datosLegajoForm.radicacion || null,
      registro_interviniente:
        datosLegajoForm.registro_interviniente || null,

      // Franquiciado
      tienda: datosLegajoForm.tienda || null,
      frq_tipo_persona: datosLegajoForm.frq_tipo_persona || null,
      frq_apellido: datosLegajoForm.frq_apellido || null,
      frq_nombres: datosLegajoForm.frq_nombres || null,
      frq_razon_social: datosLegajoForm.frq_razon_social || null,
      frq_cuit: datosLegajoForm.frq_cuit || null,
      frq_email: datosLegajoForm.frq_email || null,
      frq_telefono: datosLegajoForm.frq_telefono || null,
      frq_domicilio: datosLegajoForm.frq_domicilio || null,

      // Titular / garante
      // Espejo de persona consultada / titular para visualización general
identificacion_nombre:
  datosLegajoForm.titular_tipo_persona === "JURIDICA"
    ? datosLegajoForm.titular_razon_social || null
    : `${datosLegajoForm.titular_apellido || ""} ${datosLegajoForm.titular_nombres || ""}`.trim() || null,

titular_dominio:
  datosLegajoForm.titular_tipo_persona === "JURIDICA"
    ? datosLegajoForm.titular_razon_social || null
    : `${datosLegajoForm.titular_apellido || ""} ${datosLegajoForm.titular_nombres || ""}`.trim() || null,

identificacion_cuit: datosLegajoForm.titular_cuil_cuit || null,
identificacion_dni: datosLegajoForm.titular_dni || null,
      titular_tipo_persona: datosLegajoForm.titular_tipo_persona || null,
      titular_apellido: datosLegajoForm.titular_apellido || null,
      titular_nombres: datosLegajoForm.titular_nombres || null,
      titular_razon_social:
        datosLegajoForm.titular_razon_social || null,
      titular_dni: datosLegajoForm.titular_dni || null,
      titular_cuil_cuit: datosLegajoForm.titular_cuil_cuit || null,
      titular_cuit: datosLegajoForm.titular_cuil_cuit || null,
      titular_estado_civil:
        datosLegajoForm.titular_estado_civil || null,
      titular_desde: datosLegajoForm.titular_desde || null,
      porcentaje_titular:
        datosLegajoForm.porcentaje_titular === ""
          ? null
          : Number(datosLegajoForm.porcentaje_titular),
      titular_domicilio: datosLegajoForm.titular_domicilio || null,

      titular_conyuge_apellido:
        datosLegajoForm.titular_conyuge_apellido || null,
      titular_conyuge_nombres:
        datosLegajoForm.titular_conyuge_nombres || null,
      titular_conyuge_dni:
        datosLegajoForm.titular_conyuge_dni || null,
      titular_conyuge_cuil_cuit:
        datosLegajoForm.titular_conyuge_cuil_cuit || null,

      condominos: Array.isArray(datosLegajoForm.condominos)
        ? datosLegajoForm.condominos
        : [],

      datos_legajo_actualizado_en: new Date().toISOString(),
      datos_legajo_actualizado_por: user?.id || null,
    };

    const { data, error } = await supabase
      .from("dia_requests")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_requests_history")
      .insert({
        request_id: id,
        tipo_evento: "datos_informe_actualizados",
titulo: "Datos del informe actualizados",
        detalle: {
          secciones: [
            "Dominio",
            "Franquiciado",
            "Garante / Titular",
          ],
          titularidad_total: titularidadTotal,
        },
        created_by_name: user?.user_metadata?.full_name || null,
        created_by_email: user?.email || null,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...prev]);
    }

    setRow(data);
    setDatosLegajoForm(buildDatosLegajoForm(data));
    setShowDatosLegajoEditor(false);
    setDatosLegajoError("");
    setDatosLegajoDirty(false);
  } catch (error) {
  console.error("Error guardando datos del legajo:", error);

  const mensajeError =
    error?.message || "No se pudieron guardar los datos del legajo.";

  setDatosLegajoError(mensajeError);
  alert(mensajeError);
} finally {
    setSavingDatosLegajo(false);
  }
}

useEffect(() => {
  async function fetchCurrentProfile() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setCurrentProfile(null);
        setIsAdmin(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, email, full_name, name, sector")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error cargando perfil actual:", profileError);
        setCurrentProfile(null);
        setIsAdmin(false);
        return;
      }

      const role = (profile?.role || "").toString().trim().toLowerCase();

      setCurrentProfile(profile || null);
      setIsAdmin(role === "admin");
    } catch (error) {
      console.error("Error verificando perfil actual:", error);
      setCurrentProfile(null);
      setIsAdmin(false);
    }
  }

  fetchCurrentProfile();
}, []);

useEffect(() => {
  if (!datosLegajoDirty) return;

  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = "";
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [datosLegajoDirty]);

const estadoFechaInfo = (() => {
  const resultKey = (row?.result || "").toString().trim().toUpperCase();

if (estadoActualKey === "SOLICITADO") {
  return {
    label: "Pedido",
    value: formatDate(row?.fecha_pedido_real || row?.created_at),
  };
}

  if (estadoActualKey === "EN CURSO") {
    return {
      label: "Desde",
      value: formatDate(row?.datos_legajo_actualizado_en || row?.updated_at || row?.created_at),
    };
  }

if (estadoActualKey === "ENTREGADO") {
  if (resultKey === "OBSERVADO") {
    return {
      label: "Observado",
      value: formatDate(
        row?.fecha_entrega_real ||
          row?.observed_date ||
          row?.datos_legajo_actualizado_en
      ),
    };
  }

  return {
    label: "Entregado",
    value: formatDate(
      row?.fecha_entrega_real ||
        row?.datos_legajo_actualizado_en ||
        row?.updated_at ||
        row?.created_at
    ),
  };
}

  if (estadoActualKey === "ANULADO") {
    return {
      label: "Anulado",
      value: formatDate(row?.datos_legajo_actualizado_en || row?.updated_at || row?.created_at),
    };
  }

  return {
    label: "Fecha",
    value: formatDate(row?.created_at),
  };
})();

const estadoPillColors = (() => {
  const amber = {
    bg: "rgba(245, 158, 11, 0.16)",
    border: "rgba(245, 158, 11, 0.32)",
    color: "#fde68a",
    dot: "#fbbf24",
  };

  const blue = {
    bg: "rgba(59, 130, 246, 0.26)",
    border: "rgba(147, 197, 253, 0.48)",
    color: "#eff6ff",
    dot: "#93c5fd",
  };

  const red = {
    bg: "rgba(239, 68, 68, 0.16)",
    border: "rgba(239, 68, 68, 0.34)",
    color: "#fecaca",
    dot: "#fb7185",
  };

  const green = {
    bg: "rgba(16, 185, 129, 0.16)",
    border: "rgba(16, 185, 129, 0.34)",
    color: "#a7f3d0",
    dot: "#34d399",
  };

  if (estadoActualKey === "SOLICITADO") {
    return amber;
  }

  if (estadoActualKey === "EN CURSO") {
    return blue;
  }

  if (estadoActualKey === "ENTREGADO") {
    if ((row?.result || "").toString().toUpperCase() === "OBSERVADO") {
      return red;
    }

    return green;
  }

  if (estadoActualKey === "ANULADO") {
    return red;
  }

  return blue;
})();

const proximaAccionInfo = (() => {
  const resultKey = (row?.result || "").toString().trim().toUpperCase();

  if (estadoActualKey === "SOLICITADO") {
    return {
      titulo: "Tomar gestión",
      texto: "Día cargó el pedido. SAKI debe tomar el informe para iniciar la gestión.",
      boton: "Ver trazabilidad →",
    };
  }

  if (estadoActualKey === "EN CURSO") {
    return {
      titulo: "Gestionar informe",
      texto: "SAKI ya tomó el pedido y se encuentra gestionando el informe.",
      boton: "Ver trazabilidad →",
    };
  }

  if (estadoActualKey === "ENTREGADO") {
    if (resultKey === "OBSERVADO") {
      return {
        titulo: "Informe observado",
        texto: "El informe fue entregado con observación. Consultá el resultado y el detalle cargado.",
        boton: "Ver trazabilidad →",
      };
    }

    return {
      titulo: "Informe entregado",
      texto: "El informe fue finalizado y se encuentra disponible para consulta.",
      boton: "Ver trazabilidad →",
    };
  }

  if (estadoActualKey === "ANULADO") {
    return {
      titulo: "Informe anulado",
      texto: "La solicitud fue anulada y no continuará su circuito operativo.",
      boton: "Ver trazabilidad →",
    };
  }

  return {
    titulo: "Revisar informe",
    texto: "Verificá el estado actual y la trazabilidad del informe.",
    boton: "Ver trazabilidad →",
  };
})();

const resumenLegajoTexto = [
  "SAKI · Informes M&T",
  "",
  `Tipo de informe: ${getInformeTipoLabel(row?.type)}`,
  `Dominio: ${row?.dominio || "Por completar"}`,
  `Tienda: ${row?.tienda || "Por completar"}`,
  `Franquiciado: ${
    row?.franquiciado ||
    row?.frq_razon_social ||
    row?.frq ||
    "Por completar"
  }`,
  `CUIT FRQ: ${
    formatCuit(row?.frq_cuit || row?.identificacion_cuit) ||
    "Por completar"
  }`,
  "",
  `Estado: ${estadoActual || "Por completar"}`,
  `${estadoFechaInfo?.label || "Fecha"}: ${
    estadoFechaInfo?.value || "Por completar"
  }`,
  `Resultado: ${row?.result || "Pendiente"}`,
  `Próxima acción: ${proximaAccionInfo?.titulo || "Por completar"}`,
  "",
  `Titular / Garante: ${
    row?.titular_tipo_persona === "JURIDICA"
      ? row?.titular_razon_social || "Por completar"
      : `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim() ||
        row?.titular_dominio ||
        "Por completar"
  }`,
  `CUIT / DNI titular: ${
    formatCuit(row?.titular_cuil_cuit || row?.titular_cuit) ||
    row?.titular_dni ||
    "Por completar"
  }`,
  `Titularidad: ${
    row?.porcentaje_titular ? `${row.porcentaje_titular}%` : "Por completar"
  }`,
  "",
  `Observación: ${
    row?.observed_status ||
    row?.observed_other ||
    "Sin observación cargada"
  }`,
].join("\n");

const datosLegajoTitularidadTotal =
  Math.round(getPrendaTitularidadTotal(datosLegajoForm) * 100) / 100;

const datosLegajoTitularidadFaltante =
  Math.round((100 - datosLegajoTitularidadTotal) * 100) / 100;

const porcentajeTitularAdmin = parsePrendaPorcentaje(
  datosLegajoForm.porcentaje_titular
);

const mostrarCondominosAdmin =
  (datosLegajoForm.porcentaje_titular !== "" &&
    porcentajeTitularAdmin < 100) ||
  (Array.isArray(datosLegajoForm.condominos) &&
    datosLegajoForm.condominos.length > 0);

const titularAdminCasado =
  datosLegajoForm.titular_estado_civil === "CASADO/A";

const informeTipoKey = (row?.type || "").toString().trim();

const esInformeNominal =
  informeTipoKey === "informe_nominal" ||
  informeTipoKey === "indice_titularidad";

  const esInformePersonal =
  informeTipoKey === "anotaciones_personales" || esInformeNominal;

const dominioNoAplica =
  informeTipoKey === "anotaciones_personales";
  
const titularInformeLabel =
  informeTipoKey === "informe_dominio" ||
  informeTipoKey === "certificado_dominio"
    ? "Titular del dominio"
    : "Persona consultada";

    const personaConsultadaHeader =
  row?.titular_dominio ||
  row?.identificacion_nombre ||
  row?.titular_razon_social ||
  `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim();

const headerEsPersona =
  informeTipoKey === "anotaciones_personales" || esInformeNominal;

const headerDatoPrincipalLabel = headerEsPersona
  ? "PERSONA CONSULTADA"
  : "DOMINIO";

const headerDatoPrincipalValue = headerEsPersona
  ? personaConsultadaHeader || "—"
  : row?.dominio || "—";

  const fechaPedidoVisible =
  row?.fecha_pedido_real || row?.created_at;

const fechaEntregaVisible =
  row?.fecha_entrega_real ||
  row?.datos_legajo_actualizado_en ||
  row?.updated_at;

const fechaEstadoVisible =
  estadoActualKey === "ENTREGADO"
    ? fechaEntregaVisible
    : fechaPedidoVisible;

  return (
    <div style={pageStyle}>
      <aside
  style={sidebarOpen ? sidebarOpenStyle : sidebarStyle}
  onMouseEnter={() => setSidebarOpen(true)}
  onMouseLeave={() => setSidebarOpen(false)}
>
<div style={brandStyle}>
  <span className="sidebar-label" style={brandSubStyle}>M&T</span>
</div>

<div className="sidebar-label" style={navTitleStyle}>NAVEGACIÓN</div>

<NavItem
  active
  icon={<Home size={22} />}
  label="Workspace"
  onClick={() => {
    window.location.href = "/dia";
  }}
/>

<NavItem
  icon={<ShieldCheck size={22} />}
  label="Informe"
  onClick={() => setActiveFicha("informe")}
/>

<NavItem
  icon={<Car size={22} />}
  label={esInformeNominal ? "Vehículos informados" : "Dominio"}
  onClick={() => setActiveFicha("dominio")}
/>

<NavItem
  icon={<Store size={22} />}
  label="Franquiciado"
  onClick={() => setActiveFicha("frq")}
/>

<NavItem
  icon={<UserRound size={22} />}
  label={titularInformeLabel}
  onClick={() => setActiveFicha("garante")}
/>

<NavItem
  icon={<MessagesSquare size={22} />}
  label="Notas del legajo"
  hasAlert={hayAvisoNotas}
  onClick={() => {
    setActiveFicha("notas");
    setHayAvisoNotas(false);
  }}
/>

<NavItem
  icon={<Paperclip size={22} />}
  label="Archivos del legajo"
  onClick={() => setActiveFicha("archivos")}
/>

<div style={navDividerStyle} />

<NavItem
  icon={<Clock3 size={22} />}
  label="Historial"
  onClick={() => setActiveFicha("historial")}
/>

<NavItem
  icon={<Network size={22} />}
  label="Trazabilidad"
  onClick={() => setActiveFicha("trazabilidad")}
/>

<div style={toolsWrapperStyle}>
  <button
    type="button"
    style={toolsButtonStyle}
    onClick={() => setToolsOpen((prev) => !prev)}
  >
    <span style={navIconStyle}>
      <Wrench size={22} />
    </span>

    <span className="sidebar-label">Herramientas</span>

<ChevronDown
  className="sidebar-label"
  size={18}
  style={{
    marginLeft: "auto",
    transform: toolsOpen ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.18s ease",
  }}
/>
  </button>

  {toolsOpen && (
    <div style={toolsDropdownStyle}>
      <ToolItem
  icon={<Printer size={17} />}
  label="Centro de impresión"
  onClick={() => {
    setActiveFicha("impresion");
    setToolsOpen(false);
  }}
/>

<ToolItem
  icon={<Download size={17} />}
  label="Descargar resumen"
  onClick={handleDescargarResumenLegajoTxt}
/>

<ToolItem
  icon={<Copy size={17} />}
  label="Copiar datos"
  onClick={handleCopiarDatosLegajo}
/>

<ToolItem
  icon={<Share2 size={17} />}
  label="Compartir legajo"
  onClick={handleCompartirLegajo}
/>
    </div>
  )}
</div>

<button
  type="button"
  style={backButtonStyle}
  title="Volver al listado"
  onClick={() => router.push("/dia/informes")}
>
  <ArrowLeft size={20} />
  <span className="sidebar-label">Volver al listado</span>
</button>
      </aside>

      <main style={mainStyle}>
        <div style={topBarStyle}>
        
    <div>

  <div style={eyebrowStyle}>Management &amp; Tracking</div>
  <h1 style={titleStyle}>Informes | M&amp;T</h1>
</div>
            

         <div style={topIconsStyle}>
{isAdmin && (
  <button
    type="button"
    onClick={handleOpenDatosLegajoEditor}
    style={{
      height: "38px",
      padding: "0 14px",
      borderRadius: "999px",
      border: "1px solid rgba(96, 165, 250, 0.34)",
      background:
        "linear-gradient(135deg, rgba(37, 99, 235, 0.24), rgba(14, 165, 233, 0.16))",
      color: "#dbeafe",
      fontSize: "12px",
      fontWeight: 850,
      letterSpacing: "0.02em",
      cursor: "pointer",
      whiteSpace: "nowrap",
      boxShadow: "0 12px 28px rgba(15, 23, 42, 0.20)",
    }}
  >
    Cargar / editar informe
  </button>
)}

<div style={topMenuWrapperStyle}>
  <button
    type="button"
    style={topIconButtonStyle}
    onClick={() => setAvisosOpen((prev) => !prev)}
    title="Avisos del trámite"
  >
    <Bell size={21} />
  </button>

  {avisosOpen && (
  <div style={avisosDropdownStyle}>
    <div style={avisosHeaderStyle}>Avisos del trámite</div>

    <button
      type="button"
      style={avisoItemStyle}
      onClick={() => setActiveFicha("avisos")}
    >
      <span style={{ ...avisoDotStyle, background: "#38bdf8" }} />
      <span>
        <strong style={avisoTitleStyle}>Centro de avisos</strong>
        <small style={avisoTextStyle}>
          Consultar novedades operativas del trámite.
        </small>
      </span>
    </button>
  </div>
)}

</div>

  </div>
        </div>

        <section style={contextCardStyle}>
  <ContextItem
    icon={<Store size={30} />}
    label="TIENDA"
    value={row?.tienda || "—"}
  />

  <ContextItem
  icon={<UserRound size={30} />}
  label="FRANQUICIADO"
value={
  row?.franquiciado ||
  row?.frq ||
  row?.frq_razon_social ||
  row?.identificacion_nombre ||
  "—"
}
/>

<ContextItem
  icon={headerEsPersona ? <UserRound size={32} /> : <Car size={32} />}
  label={headerDatoPrincipalLabel}
  value={headerDatoPrincipalValue}
/>
</section>

<section style={caseOverviewStyle}>
  <div style={caseOverviewTopStyle}>
    <div>
      <div style={caseLabelStyle}>{headerDatoPrincipalLabel}</div>
<div style={caseDomainStyle}>{headerDatoPrincipalValue}</div>

      <div style={caseMoneyPillStyle}>
  <span style={caseMoneyIconStyle}>
    <ShieldCheck size={16} />
  </span>

  <span>{getInformeTipoLabel(row?.type)}</span>
</div>
    </div>
  </div>

  <div style={caseOverviewDividerStyle} />

  <div style={caseOverviewBottomStyle}>
    
    <div style={caseStatusBlockStyle}>
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      minHeight: "30px",
      padding: "0 13px",
      borderRadius: "999px",
      background: estadoPillColors.bg,
      border: `1px solid ${estadoPillColors.border}`,
      color: estadoPillColors.color,
      fontSize: "12px",
      fontWeight: 800,
      letterSpacing: "0.04em",
      width: "fit-content",
    }}
  >
    <span
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "999px",
        background: estadoPillColors.dot,
        boxShadow: `0 0 0 3px ${estadoPillColors.bg}`,
        flexShrink: 0,
      }}
    />

    <span>
      {(estadoActual || "Estado por completar").toString().toUpperCase()}
    </span>
  </div>

  <div style={caseStatusSubStyle}>
    {estadoActualKey === "SOLICITADO"
      ? "Pedido cargado por Día"
      : estadoActualKey === "EN CURSO"
      ? "Informe en gestión"
      : estadoActualKey === "ENTREGADO" &&
        (row?.result || "").toString().toUpperCase() === "OBSERVADO"
      ? "Informe entregado con observación"
      : estadoActualKey === "ENTREGADO"
      ? "Informe entregado"
      : estadoActualKey === "ANULADO"
      ? "Informe anulado"
      : "Estado del informe"}
  </div>

  <div style={caseDateStyle}>
    {estadoFechaInfo.value ? (
      <>
        {estadoFechaInfo.label} <strong>{estadoFechaInfo.value}</strong>
      </>
    ) : (
      <span>Fecha por completar</span>
    )}
  </div>
</div>

    <div style={caseActionBlockStyle}>
      <div style={caseLabelStyle}>PRÓXIMA ACCIÓN</div>

      <div style={caseActionTitleStyle}>{proximaAccionInfo.titulo}</div>

<div style={caseActionTextStyle}>
  {proximaAccionInfo.texto}
</div>
    </div>

    <div style={caseActionButtonWrapStyle}>
      <button
  style={caseActionButtonStyle}
  onClick={() => setActiveFicha("trazabilidad")}
>
  {proximaAccionInfo.boton}
</button>

    </div>
  </div>
</section>
        <section style={cardsGridStyle}>
  <InfoCard
    icon={<ShieldCheck size={30} />}
    title="INFORME"
    items={[
      ["Tipo", getInformeTipoLabel(row?.type)],
      ["Estado", row?.status || row?.estado || "Por completar"],
      ["Resultado", row?.result || "Pendiente"],
      ["Pedido", formatDate(fechaPedidoVisible) || "Por completar"],
    ]}
    action="Ver ficha →"
    onClick={() => setActiveFicha("informe")}
  />

  <InfoCard
  icon={<Car size={30} />}
  title={esInformeNominal ? "VEHÍCULOS INFORMADOS" : "DOMINIO"}
  disabled={dominioNoAplica}
  items={
    dominioNoAplica
      ? [
          ["Estado", "No aplica"],
          ["Motivo", "Informe sobre persona"],
          ["Dominio", "—"],
        ]
      : esInformeNominal
      ? [
          [
            "Vehículos",
            Array.isArray(vehiculosNominal)
              ? `${vehiculosNominal.length}`
              : "0",
          ],
          [
            "Titular actual",
            Array.isArray(vehiculosNominal)
              ? `${vehiculosNominal.filter(
                  (v) => v.condicion_titular === "titular_actual"
                ).length}`
              : "0",
          ],
          [
            "Titular histórico",
            Array.isArray(vehiculosNominal)
              ? `${vehiculosNominal.filter(
                  (v) => v.condicion_titular === "titular_historico"
                ).length}`
              : "0",
          ],
        ]
      : [
    ["Dominio", row?.dominio || "Por completar"],
    [
      "Titular",
      row?.titular_dominio ||
        row?.identificacion_nombre ||
        row?.titular_razon_social ||
        `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim() ||
        "Por completar",
    ],
    [
      "CUIT / DNI",
      row?.titular_cuit ||
        row?.titular_cuil_cuit ||
        row?.identificacion_cuit ||
        row?.identificacion_dni ||
        row?.titular_dni ||
        "Por completar",
    ],
  ]
  }
  onClick={() => {
    if (!dominioNoAplica) {
      setActiveFicha("dominio");
    }
  }}
/>

  <InfoCard
    icon={<Store size={30} />}
    title="FRANQUICIADO"
    items={[
      ["Tienda", row?.tienda || "Por completar"],
      ["Franquiciado", row?.franquiciado || row?.frq || "Por completar"],
      ["CUIT", row?.frq_cuit || row?.identificacion_cuit || "Por completar"],
    ]}
    action="Ver ficha →"
    onClick={() => setActiveFicha("frq")}
  />

<InfoCard
  icon={<UserRound size={30} />}
  title={titularInformeLabel.toUpperCase()}
  items={[
    [
      "Nombre",
      row?.titular_dominio ||
        row?.identificacion_nombre ||
        row?.titular_razon_social ||
        `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim() ||
        "Por completar",
    ],
    [
      "CUIT / DNI",
      row?.titular_cuit ||
        row?.titular_cuil_cuit ||
        row?.identificacion_cuit ||
        row?.identificacion_dni ||
        row?.titular_dni ||
        "Por completar",
    ],
  ]}
  onClick={() => setActiveFicha("garante")}
/>
</section>

      </main>

      {activeFicha && (
        <div style={overlayStyle} onClick={() => setActiveFicha(null)}>
          <div style={floatingCardStyle} onClick={(e) => e.stopPropagation()}>
            <button style={closeButtonStyle} onClick={() => setActiveFicha(null)}>
              ×
            </button>

            {activeFicha === "informe" && (
  <FichaInforme
    row={row}
    observacionesInforme={observacionesInforme}
    loadingObservacionesInforme={loadingObservacionesInforme}
  />
)}

{activeFicha === "dominio" && (
  <FichaDominio
    row={row}
    vehiculosNominal={vehiculosNominal}
    loadingVehiculosNominal={loadingVehiculosNominal}
  />
)}
{activeFicha === "frq" && <FichaFrq row={row} />}
{activeFicha === "garante" && (
  <FichaGarante row={row} titularInformeLabel={titularInformeLabel} />
)}
{activeFicha === "notas" && (
  <FichaNotas
    row={row}
    notasLegajo={notasLegajo}
    loadingNotas={loadingNotas}
    notaMsg={notaMsg}
    nuevaNota={nuevaNota}
    setNuevaNota={setNuevaNota}
    savingNota={savingNota}
    onGuardarNota={handleGuardarNotaLegajo}
    respondiendoNota={respondiendoNota}
    setRespondiendoNota={setRespondiendoNota}
  />
)}
{activeFicha === "archivos" && (
  <FichaArchivos
    row={row}
    archivosLegajo={archivosLegajo}
    loadingArchivos={loadingArchivos}
    uploadingArchivo={uploadingArchivo}
    archivoCategoria={archivoCategoria}
    setArchivoCategoria={setArchivoCategoria}
    archivoSeleccionado={archivoSeleccionado}
    setArchivoSeleccionado={setArchivoSeleccionado}
    archivoInputKey={archivoInputKey}
setArchivoInputKey={setArchivoInputKey}
    archivoMsg={archivoMsg}
    onSubirArchivo={handleSubirArchivoLegajo}
    onAbrirArchivo={handleAbrirArchivoLegajo}
    isAdmin={isAdmin}
onEliminarArchivo={handleEliminarArchivoLegajo}
  />
)}

{activeFicha === "impresion" && (
  <FichaImpresion
    row={row}
    observacionesInforme={observacionesInforme}
    vehiculosNominal={vehiculosNominal}
    onPrintResumen={handlePrintResumenLegajo}
    onPrintInforme={handlePrintFichaInforme}
    onPrintDominio={handlePrintFichaDominio}
    onPrintFranquiciado={handlePrintFichaFranquiciado}
    onPrintGarante={handlePrintFichaGarante}
    onPrintHistorial={handlePrintHistorial}
    onPrintTrazabilidad={handlePrintTrazabilidad}
  />
)}

{activeFicha === "historial" && (
  <FichaHistorial row={row} historyRows={historyRows} />
)}
{activeFicha === "trazabilidad" && (
  <FichaTrazabilidad
    row={row}
    observacionesInforme={observacionesInforme}
  />
)}
{activeFicha === "avisos" && <FichaAvisos />}
{activeFicha === "reporte" && <FichaReporte />}
          </div>
        </div>
      )}

{printMode === "resumen" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>

      <h1>Resumen del informe</h1>

      <p>
        {headerDatoPrincipalLabel}:{" "}
        <strong>{headerDatoPrincipalValue}</strong>
      </p>

      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    <section className="print-section">
      <h2>Datos principales</h2>

      <div className="print-grid">
        <div>
          <span>Tipo de informe</span>
          <strong>{getInformeTipoLabel(row?.type)}</strong>
        </div>

        <div>
          <span>{headerDatoPrincipalLabel}</span>
          <strong>{headerDatoPrincipalValue}</strong>
        </div>

        <div>
          <span>CUIT / DNI</span>
          <strong>
            {row?.titular_cuit ||
              row?.titular_cuil_cuit ||
              row?.identificacion_cuit ||
              row?.identificacion_dni ||
              row?.titular_dni ||
              "—"}
          </strong>
        </div>

        <div>
          <span>Tienda</span>
          <strong>{row?.tienda || "—"}</strong>
        </div>

        <div>
          <span>Franquiciado</span>
          <strong>
            {row?.franquiciado ||
              row?.frq_razon_social ||
              row?.frq ||
              "—"}
          </strong>
        </div>

        <div>
          <span>CUIT franquiciado</span>
          <strong>{row?.frq_cuit || "—"}</strong>
        </div>

        <div>
          <span>Estado operativo</span>
          <strong>{row?.status || row?.estado || "—"}</strong>
        </div>

        <div>
          <span>Resultado</span>
          <strong>{row?.result || "Pendiente"}</strong>
        </div>

        <div>
          <span>Fecha del pedido</span>
          <strong>{formatDate(row?.created_at) || "—"}</strong>
        </div>
      </div>
    </section>

    {!dominioNoAplica && !esInformeNominal && (
      <section className="print-section">
        <h2>Dominio / Automotor</h2>

        <div className="print-grid">
          <div>
            <span>Dominio</span>
            <strong>{row?.dominio || "—"}</strong>
          </div>

          <div>
            <span>Marca</span>
            <strong>{row?.marca || "—"}</strong>
          </div>

          <div>
            <span>Modelo</span>
            <strong>{row?.modelo || "—"}</strong>
          </div>

          <div>
            <span>Tipo</span>
            <strong>{row?.tipo || "—"}</strong>
          </div>

          <div>
            <span>Modelo año</span>
            <strong>{row?.modelo_anio || "—"}</strong>
          </div>

          <div>
            <span>Motor</span>
            <strong>{row?.numero_motor || "—"}</strong>
          </div>

          <div>
            <span>Chasis</span>
            <strong>{row?.numero_chasis || "—"}</strong>
          </div>

          <div>
            <span>Radicación</span>
            <strong>{row?.radicacion || "—"}</strong>
          </div>

          <div>
            <span>Registro interviniente</span>
            <strong>{row?.registro_interviniente || "—"}</strong>
          </div>
        </div>
      </section>
    )}

    {esInformeNominal && (
      <section className="print-section">
        <h2>Vehículos informados</h2>

        {Array.isArray(vehiculosNominal) && vehiculosNominal.length > 0 ? (
          vehiculosNominal.map((vehiculo, index) => (
            <div
              key={vehiculo.id || index}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h2
                style={{
                  fontSize: "13px",
                  margin: "0 0 10px",
                }}
              >
                Vehículo {index + 1} ·{" "}
                {vehiculo?.condicion_titular === "titular_historico"
                  ? "Titular histórico"
                  : "Titular actual"}
              </h2>

              <div className="print-grid">
                <div>
                  <span>Dominio</span>
                  <strong>{vehiculo?.dominio || "—"}</strong>
                </div>

                <div>
                  <span>Marca</span>
                  <strong>{vehiculo?.marca || "—"}</strong>
                </div>

                <div>
                  <span>Modelo</span>
                  <strong>{vehiculo?.modelo || "—"}</strong>
                </div>

                <div>
                  <span>Tipo</span>
                  <strong>{vehiculo?.tipo || "—"}</strong>
                </div>

                <div>
                  <span>Año modelo</span>
                  <strong>{vehiculo?.modelo_anio || "—"}</strong>
                </div>

                <div>
                  <span>Registro seccional</span>
                  <strong>{vehiculo?.registro_seccional || "—"}</strong>
                </div>

                <div>
                  <span>Titular</span>
                  <strong>{vehiculo?.titular || "—"}</strong>
                </div>

                <div>
                  <span>CUIT / DNI titular</span>
                  <strong>{vehiculo?.documento_titular || "—"}</strong>
                </div>

                <div>
                  <span>% titular</span>
                  <strong>{vehiculo?.porcentaje_titular || "—"}</strong>
                </div>

                <div>
                  <span>Fecha titular</span>
                  <strong>{vehiculo?.fecha_titular || "—"}</strong>
                </div>

                {vehiculo?.observacion && (
                  <div>
                    <span>Observación</span>
                    <strong>{vehiculo.observacion}</strong>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              fontSize: "12px",
              color: "#374151",
            }}
          >
            No hay vehículos informados cargados para este informe.
          </div>
        )}
      </section>
    )}

    <section className="print-section">
      <h2>Resultado / Observación</h2>

      <div className="print-grid">
        <div>
          <span>Resultado</span>
          <strong>{row?.result || "Pendiente"}</strong>
        </div>

        <div>
          <span>Estado observado</span>
          <strong>{row?.observed_status || "—"}</strong>
        </div>

        <div>
          <span>Fecha observación</span>
          <strong>{formatDate(row?.observed_date) || "—"}</strong>
        </div>

        <div>
          <span>Detalle / otros</span>
          <strong>{row?.observed_other || "—"}</strong>
        </div>
      </div>

      {Array.isArray(observacionesInforme) &&
        observacionesInforme.length > 0 && (
          <div style={{ marginTop: "12px" }}>
            {observacionesInforme.map((obs, index) => (
              <div
                key={obs.id || index}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <h2
                  style={{
                    fontSize: "13px",
                    margin: "0 0 10px",
                  }}
                >
                  Observación {index + 1}
                </h2>

                <div className="print-grid">
                  <div>
                    <span>Tipo</span>
                    <strong>{obs?.tipo_observacion || "—"}</strong>
                  </div>

                  <div>
                    <span>Tipo de medida</span>
                    <strong>{obs?.tipo_medida || "—"}</strong>
                  </div>

                  <div>
                    <span>Acreedor</span>
                    <strong>{obs?.acreedor || "—"}</strong>
                  </div>

                  <div>
                    <span>Juzgado</span>
                    <strong>{obs?.juzgado || "—"}</strong>
                  </div>

                  <div>
                    <span>Actor</span>
                    <strong>{obs?.actor || "—"}</strong>
                  </div>

                  <div>
                    <span>Expediente</span>
                    <strong>{obs?.expediente || "—"}</strong>
                  </div>

                  <div>
                    <span>Fecha inscripción</span>
                    <strong>{obs?.fecha_inscripcion || "—"}</strong>
                  </div>

                  <div>
                    <span>Monto</span>
                    <strong>{obs?.monto || "—"}</strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>{obs?.estado || "—"}</strong>
                  </div>

                  {obs?.observacion && (
                    <div>
                      <span>Observación</span>
                      <strong>{obs.observacion}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </section>
  </div>
)}

{printMode === "informe" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>

      <h1>Ficha Informe</h1>

      <p>
        {headerDatoPrincipalLabel}:{" "}
        <strong>{headerDatoPrincipalValue}</strong>
      </p>

      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    <section className="print-section">
      <h2>Carátula administrativa</h2>

      <div className="print-grid">
        <div>
          <span>Tipo de informe</span>
          <strong>{getInformeTipoLabel(row?.type)}</strong>
        </div>

        <div>
          <span>Estado operativo</span>
          <strong>{row?.status || row?.estado || "—"}</strong>
        </div>

        <div>
          <span>Resultado</span>
          <strong>{row?.result || "Pendiente"}</strong>
        </div>

        <div>
          <span>Fecha del pedido</span>
          <strong>{formatDate(row?.created_at) || "—"}</strong>
        </div>

        <div>
          <span>{headerDatoPrincipalLabel}</span>
          <strong>{headerDatoPrincipalValue}</strong>
        </div>

        <div>
          <span>CUIT / DNI</span>
          <strong>
            {row?.titular_cuit ||
              row?.titular_cuil_cuit ||
              row?.identificacion_cuit ||
              row?.identificacion_dni ||
              row?.titular_dni ||
              "—"}
          </strong>
        </div>

        <div>
          <span>Tienda</span>
          <strong>{row?.tienda || "—"}</strong>
        </div>

        <div>
          <span>Franquiciado</span>
          <strong>
            {row?.franquiciado ||
              row?.frq_razon_social ||
              row?.frq ||
              "—"}
          </strong>
        </div>

        <div>
          <span>CUIT franquiciado</span>
          <strong>{row?.frq_cuit || "—"}</strong>
        </div>

        {!dominioNoAplica && !esInformeNominal && (
          <div>
            <span>Dominio</span>
            <strong>{row?.dominio || "—"}</strong>
          </div>
        )}
      </div>
    </section>

    {(row?.result || "").toString().toUpperCase() === "OBSERVADO" && (
      <section className="print-section">
        <h2>Resultado observado</h2>

        <div className="print-grid">
          <div>
            <span>Estado observado</span>
            <strong>{row?.observed_status || "OBSERVADO"}</strong>
          </div>

          <div>
            <span>Fecha observación</span>
            <strong>{formatDate(row?.observed_date) || "—"}</strong>
          </div>

          <div>
            <span>Detalle / otros</span>
            <strong>{row?.observed_other || "—"}</strong>
          </div>
        </div>
      </section>
    )}
  </div>
)}

{printMode === "dominio" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>

      <h1>
        {esInformeNominal
          ? "Vehículos informados"
          : "Ficha Dominio / Automotor"}
      </h1>

      <p>
        {headerDatoPrincipalLabel}:{" "}
        <strong>{headerDatoPrincipalValue}</strong>
      </p>

      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    {esInformeNominal ? (
      <section className="print-section">
        <h2>Vehículos informados por el informe nominal</h2>

        {Array.isArray(vehiculosNominal) && vehiculosNominal.length > 0 ? (
          vehiculosNominal.map((vehiculo, index) => (
            <div
              key={vehiculo.id || index}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h2
                style={{
                  fontSize: "13px",
                  margin: "0 0 10px",
                }}
              >
                Vehículo {index + 1} ·{" "}
                {vehiculo?.condicion_titular === "titular_historico"
                  ? "Titular histórico"
                  : "Titular actual"}
              </h2>

              <div className="print-grid">
                <div>
                  <span>Dominio</span>
                  <strong>{vehiculo?.dominio || "—"}</strong>
                </div>

                <div>
                  <span>Marca</span>
                  <strong>{vehiculo?.marca || "—"}</strong>
                </div>

                <div>
                  <span>Modelo</span>
                  <strong>{vehiculo?.modelo || "—"}</strong>
                </div>

                <div>
                  <span>Tipo</span>
                  <strong>{vehiculo?.tipo || "—"}</strong>
                </div>

                <div>
                  <span>Año modelo</span>
                  <strong>{vehiculo?.modelo_anio || "—"}</strong>
                </div>

                <div>
                  <span>Registro seccional</span>
                  <strong>{vehiculo?.registro_seccional || "—"}</strong>
                </div>

                <div>
                  <span>Domicilio registro</span>
                  <strong>{vehiculo?.registro_domicilio || "—"}</strong>
                </div>

                <div>
                  <span>Localidad</span>
                  <strong>{vehiculo?.registro_localidad || "—"}</strong>
                </div>

                <div>
                  <span>Provincia</span>
                  <strong>{vehiculo?.registro_provincia || "—"}</strong>
                </div>

                <div>
                  <span>Titular</span>
                  <strong>{vehiculo?.titular || "—"}</strong>
                </div>

                <div>
                  <span>CUIT / DNI titular</span>
                  <strong>{vehiculo?.documento_titular || "—"}</strong>
                </div>

                <div>
                  <span>% titular</span>
                  <strong>{vehiculo?.porcentaje_titular || "—"}</strong>
                </div>

                <div>
                  <span>Fecha titular</span>
                  <strong>{vehiculo?.fecha_titular || "—"}</strong>
                </div>

                {vehiculo?.observacion && (
                  <div>
                    <span>Observación</span>
                    <strong>{vehiculo.observacion}</strong>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              fontSize: "12px",
              color: "#374151",
            }}
          >
            No hay vehículos informados cargados para este informe.
          </div>
        )}
      </section>
    ) : (
      <section className="print-section">
        <h2>Datos identificatorios del automotor</h2>

        <div className="print-grid">
          <div>
            <span>Dominio</span>
            <strong>{row?.dominio || "—"}</strong>
          </div>

          <div>
            <span>Marca</span>
            <strong>{row?.marca || "—"}</strong>
          </div>

          <div>
            <span>Modelo</span>
            <strong>{row?.modelo || "—"}</strong>
          </div>

          <div>
            <span>Tipo</span>
            <strong>{row?.tipo || "—"}</strong>
          </div>

          <div>
            <span>Modelo año</span>
            <strong>{row?.modelo_anio || "—"}</strong>
          </div>

          <div>
            <span>Marca motor</span>
            <strong>{row?.marca_motor || "—"}</strong>
          </div>

          <div>
            <span>N° motor</span>
            <strong>{row?.numero_motor || "—"}</strong>
          </div>

          <div>
            <span>Marca chasis</span>
            <strong>{row?.marca_chasis || "—"}</strong>
          </div>

          <div>
            <span>N° chasis</span>
            <strong>{row?.numero_chasis || "—"}</strong>
          </div>

          <div>
            <span>Radicación</span>
            <strong>{row?.radicacion || "—"}</strong>
          </div>

          <div>
            <span>Registro interviniente</span>
            <strong>{row?.registro_interviniente || "—"}</strong>
          </div>
        </div>
      </section>
    )}
  </div>
)}

{printMode === "franquiciado" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>

      <h1>Ficha Franquiciado</h1>

      <p>
        {headerDatoPrincipalLabel}:{" "}
        <strong>{headerDatoPrincipalValue}</strong>
      </p>

      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    <section className="print-section">
      <h2>Datos del franquiciado</h2>

      <div className="print-grid">
        <div>
          <span>Tienda</span>
          <strong>{row?.tienda || "—"}</strong>
        </div>

        <div>
          <span>Franquiciado / Razón social</span>
          <strong>
            {row?.frq_razon_social ||
              row?.franquiciado ||
              row?.frq ||
              "—"}
          </strong>
        </div>

        <div>
          <span>CUIT</span>
          <strong>
            {formatCuit(row?.frq_cuit) ||
              row?.frq_cuit ||
              "—"}
          </strong>
        </div>

        <div>
          <span>Email</span>
          <strong>{row?.frq_email || row?.frq_mail || "—"}</strong>
        </div>

        <div>
          <span>Teléfono</span>
          <strong>{row?.frq_telefono || "—"}</strong>
        </div>

        <div>
          <span>Domicilio</span>
          <strong>{row?.frq_domicilio || "—"}</strong>
        </div>

        <div>
          <span>Tipo de informe</span>
          <strong>{getInformeTipoLabel(row?.type)}</strong>
        </div>

        <div>
          <span>Estado operativo</span>
          <strong>{row?.status || row?.estado || "—"}</strong>
        </div>

        <div>
          <span>Resultado</span>
          <strong>{row?.result || "Pendiente"}</strong>
        </div>
      </div>
    </section>
  </div>
)}

{printMode === "garante" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>

      <h1>
        {headerDatoPrincipalLabel === "PERSONA CONSULTADA"
          ? "Persona consultada"
          : "Titular del dominio"}
      </h1>

      <p>
        {headerDatoPrincipalLabel}:{" "}
        <strong>{headerDatoPrincipalValue}</strong>
      </p>

      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    {headerDatoPrincipalLabel === "PERSONA CONSULTADA" ? (
      <section className="print-section">
        <h2>Datos de la persona consultada</h2>

        <div className="print-grid">
          <div>
            <span>Nombre / Razón social</span>
            <strong>
              {row?.titular_dominio ||
                row?.identificacion_nombre ||
                row?.titular_razon_social ||
                `${row?.titular_apellido || ""} ${
                  row?.titular_nombres || ""
                }`.trim() ||
                "—"}
            </strong>
          </div>

          <div>
            <span>CUIT / DNI</span>
            <strong>
              {row?.titular_cuit ||
                row?.titular_cuil_cuit ||
                row?.identificacion_cuit ||
                row?.identificacion_dni ||
                row?.titular_dni ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Tipo de informe</span>
            <strong>{getInformeTipoLabel(row?.type)}</strong>
          </div>

          <div>
            <span>Fecha del pedido</span>
            <strong>{formatDate(row?.created_at) || "—"}</strong>
          </div>
        </div>
      </section>
    ) : (
      <section className="print-section">
        <h2>Datos del titular del dominio</h2>

        <div className="print-grid">
          <div>
            <span>Nombre / Razón social</span>
            <strong>
              {row?.titular_tipo_persona === "JURIDICA"
                ? row?.titular_razon_social ||
                  row?.titular_dominio ||
                  row?.identificacion_nombre ||
                  "—"
                : `${row?.titular_apellido || ""} ${
                    row?.titular_nombres || ""
                  }`.trim() ||
                  row?.titular_dominio ||
                  row?.identificacion_nombre ||
                  "—"}
            </strong>
          </div>

          <div>
            <span>DNI</span>
            <strong>{row?.titular_dni || row?.identificacion_dni || "—"}</strong>
          </div>

          <div>
            <span>CUIL / CUIT</span>
            <strong>
              {row?.titular_cuil_cuit ||
                row?.titular_cuit ||
                row?.identificacion_cuit ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Tipo de persona</span>
            <strong>
              {row?.titular_tipo_persona === "JURIDICA"
                ? "Persona jurídica"
                : "Persona humana"}
            </strong>
          </div>

          <div>
            <span>Titular desde</span>
            <strong>
              {row?.titular_desde ? formatDate(row.titular_desde) : "—"}
            </strong>
          </div>

          <div>
            <span>Porcentaje de titularidad</span>
            <strong>
              {row?.porcentaje_titular ? `${row.porcentaje_titular}%` : "—"}
            </strong>
          </div>

          <div>
            <span>Domicilio</span>
            <strong>{row?.titular_domicilio || "—"}</strong>
          </div>
        </div>
      </section>
    )}
  </div>
)}

{printMode === "historial" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>
      <h1>Historial del trámite</h1>
      <p>
  {headerDatoPrincipalLabel}:{" "}
  <strong>{headerDatoPrincipalValue}</strong>
</p>
      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    <section className="print-section">
      <h2>Movimientos registrados</h2>

      {Array.isArray(historyRows) && historyRows.length > 0 ? (
        historyRows.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#111827",
                marginBottom: "5px",
              }}
            >
              {formatDate(item.created_at)} ·{" "}
              {item.titulo || item.title || "Movimiento del informe"}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#374151",
                lineHeight: 1.45,
                marginBottom: "5px",
              }}
            >
              {item.tipo_evento === "archivo_subido" && item.detalle
                ? `Archivo agregado al legajo. Categoría: ${
                    item.detalle?.categoria_label ||
                    getCategoriaArchivoLabel(item.detalle?.categoria)
                  }. Archivo: ${item.detalle?.nombre_archivo || "—"}.`
                : item.tipo_evento === "archivo_eliminado" && item.detalle
                ? `Archivo eliminado del legajo. Categoría: ${
                    item.detalle?.categoria_label ||
                    getCategoriaArchivoLabel(item.detalle?.categoria)
                  }. Archivo: ${item.detalle?.nombre_archivo || "—"}.`
                : item.tipo_evento === "datos_legajo_actualizados"
                ? "Datos administrativos del legajo actualizados por SAKI."
                : item.detalle_texto ||
                  item.descripcion ||
                  item.observacion ||
                  "Movimiento registrado en el legajo."}
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#6b7280",
              }}
            >
              Usuario: {item.created_by_email || item.user_email || "—"}
            </div>
          </div>
        ))
      ) : (
        <div
          style={{
            fontSize: "12px",
            color: "#374151",
          }}
        >
          No hay movimientos registrados para este informe.
        </div>
      )}
    </section>
  </div>
)}

{printMode === "trazabilidad" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>
      <h1>Trazabilidad del informe</h1>
      <p>
  {headerDatoPrincipalLabel}:{" "}
  <strong>{headerDatoPrincipalValue}</strong>
</p>
      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    <section className="print-section">
      <h2>Estado actual</h2>

      <div className="print-grid">
        <div>
          <span>Estado</span>
          <strong>{row?.status || row?.estado || "—"}</strong>
        </div>

        <div>
          <span>Resultado</span>
          <strong>{row?.result || "Pendiente"}</strong>
        </div>

        <div>
          <span>Próxima acción</span>
          <strong>{proximaAccionInfo?.titulo || "—"}</strong>
        </div>

        <div>
  <span>{headerDatoPrincipalLabel}</span>
  <strong>{headerDatoPrincipalValue}</strong>
</div>

        <div>
          <span>Franquiciado</span>
          <strong>
            {row?.franquiciado || row?.frq_razon_social || row?.frq || "—"}
          </strong>
        </div>

        <div>
          <span>Fecha del pedido</span>
          <strong>{formatDate(row?.created_at) || "—"}</strong>
        </div>
      </div>
    </section>

    <section className="print-section">
      <h2>Hitos del circuito operativo</h2>

      {[
        {
          titulo: "Solicitud del informe",
          fecha: row?.created_at,
          detalle: row?.requester_email
            ? `Pedido cargado por Día. Solicitado por ${row.requester_email}.`
            : "Pedido cargado por Día.",
        },
        {
          titulo: "Gestión SAKI",
          fecha: row?.datos_legajo_actualizado_en || row?.updated_at,
          detalle: "SAKI tomó intervención y actualizó los datos administrativos del informe.",
        },
        {
          titulo: "Resultado del informe",
          fecha: row?.observed_date || row?.datos_legajo_actualizado_en || row?.updated_at,
          detalle:
  (row?.result || "").toString().toUpperCase() === "OBSERVADO"
    ? `Informe entregado con observación. ${
        row?.observed_other ||
        row?.observed_status ||
        "Resultado observado."
      }`
              : row?.status === "ENTREGADO"
              ? "Informe entregado y disponible para consulta."
              : "Resultado pendiente de carga.",
        },
        {
          titulo: "Cierre operativo",
          fecha: row?.datos_legajo_actualizado_en || row?.updated_at,
          detalle:
            row?.status === "ANULADO"
              ? "La solicitud fue anulada y no continuará su circuito operativo."
              : row?.status === "ENTREGADO"
              ? "El informe quedó finalizado operativamente."
              : "El informe continúa en circuito operativo.",
        },
      ]
        .filter((item) => item.fecha)
        .map((item, index) => (
          <div
            key={`${item.titulo}-${index}`}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#111827",
                marginBottom: "5px",
              }}
            >
              {formatDate(item.fecha)} · {item.titulo}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#374151",
                lineHeight: 1.45,
              }}
            >
              {item.detalle}
            </div>
          </div>
        ))}

      {![
        row?.created_at,
        row?.datos_legajo_actualizado_en,
        row?.updated_at,
        row?.observed_date,
      ].some(Boolean) && (
        <div
          style={{
            fontSize: "12px",
            color: "#374151",
          }}
        >
          Todavía no hay hitos de trazabilidad cargados para este informe.
        </div>
      )}
    </section>
  </div>
)}

{showObservacionInformeModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.72)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10020,
      padding: "24px",
    }}
    onClick={handleCancelObservacionInformeModal}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(980px, 100%)",
        maxHeight: "88vh",
        overflowY: "auto",
        borderRadius: "24px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.18)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.48)",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "18px",
          alignItems: "flex-start",
          marginBottom: "22px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8fb9e8",
              fontWeight: 850,
              marginBottom: "8px",
            }}
          >
            Resultado del informe
          </div>

          <h3
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "25px",
              fontWeight: 800,
              letterSpacing: "-0.035em",
            }}
          >
            Entregar informe observado
          </h3>

          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(214,228,245,0.78)",
              fontSize: "13px",
              lineHeight: 1.5,
              maxWidth: "720px",
            }}
          >
            Cargá una o más observaciones registrales detectadas en el informe.
            El trámite quedará como entregado con resultado observado.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancelObservacionInformeModal}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.04)",
            color: "#dbeafe",
            fontSize: "22px",
            lineHeight: "30px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {observacionesForm.map((obs, index) => (
          <div
            key={index}
            style={{
              borderRadius: "20px",
              border: "1px solid rgba(245, 158, 11, 0.24)",
background:
  "linear-gradient(180deg, rgba(15, 50, 92, 0.72), rgba(3,18,34,0.62))",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  color: "#fde68a",
                  fontSize: "12px",
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Observación {index + 1}
              </div>

              {observacionesForm.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveObservacionForm(index)}
                  style={{
                    border: "1px solid rgba(248,113,113,0.28)",
                    background: "rgba(127,29,29,0.22)",
                    color: "#fecaca",
                    borderRadius: "999px",
                    padding: "7px 10px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Quitar
                </button>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              <div>
                <label style={modalFieldLabelStyle}>Tipo de observación</label>
                <select
                  style={modalInputStyle}
                  value={obs.tipo_observacion}
                  onChange={(e) =>
                    handleObservacionFormChange(
                      index,
                      "tipo_observacion",
                      e.target.value
                    )
                  }
                >
                  <option value="prenda">Prenda</option>
                  <option value="embargo">Embargo</option>
                  <option value="inhibicion">Inhibición</option>
                  <option value="medida_cautelar">Medida cautelar</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {obs.tipo_observacion === "prenda" ? (
                <>
                  <div>
                    <label style={modalFieldLabelStyle}>Acreedor</label>
                    <input
                      style={modalInputStyle}
                      value={obs.acreedor}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "acreedor",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Ej. DÍA ARGENTINA S.A."
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>Grado</label>
                    <input
                      style={modalInputStyle}
                      value={obs.grado}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "grado",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Ej. 1°"
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>Fecha contrato</label>
                    <input
                      style={modalInputStyle}
                      value={obs.fecha_contrato}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "fecha_contrato",
                          e.target.value
                        )
                      }
                      placeholder="Ej. 21/05/25"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={modalFieldLabelStyle}>Tipo de medida</label>
                    <input
                      style={modalInputStyle}
                      value={obs.tipo_medida}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "tipo_medida",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Ej. INHIBICIÓN / EMBARGO"
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>Juzgado</label>
                    <input
                      style={modalInputStyle}
                      value={obs.juzgado}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "juzgado",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Juzgado interviniente"
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>Actor</label>
                    <input
                      style={modalInputStyle}
                      value={obs.actor}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "actor",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Actor"
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>Expediente</label>
                    <input
                      style={modalInputStyle}
                      value={obs.expediente}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "expediente",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Expediente"
                    />
                  </div>
                </>
              )}

              <div>
                <label style={modalFieldLabelStyle}>Fecha inscripción</label>
                <input
                  style={modalInputStyle}
                  value={obs.fecha_inscripcion}
                  onChange={(e) =>
                    handleObservacionFormChange(
                      index,
                      "fecha_inscripcion",
                      e.target.value
                    )
                  }
                  placeholder="Ej. 11/2025"
                />
              </div>

              <div>
                <label style={modalFieldLabelStyle}>Monto</label>
                <input
                  style={modalInputStyle}
                  value={obs.monto}
                  onChange={(e) =>
                    handleObservacionFormChange(
                      index,
                      "monto",
                      e.target.value
                    )
                  }
                  placeholder="Ej. $ 490.918,06 + INT $ 73.637,71"
                />
              </div>

              <div>
                <label style={modalFieldLabelStyle}>Estado</label>
                <input
                  style={modalInputStyle}
                  value={obs.estado}
                  onChange={(e) =>
                    handleObservacionFormChange(
                      index,
                      "estado",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Ej. VIGENTE"
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={modalFieldLabelStyle}>Observación</label>
                <input
                  style={modalInputStyle}
                  value={obs.observacion}
                  onChange={(e) =>
                    handleObservacionFormChange(
                      index,
                      "observacion",
                      e.target.value
                    )
                  }
                  placeholder="Detalle adicional"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddObservacionForm}
          style={{
            alignSelf: "flex-start",
            border: "1px solid rgba(96, 165, 250, 0.34)",
            background: "rgba(37, 99, 235, 0.14)",
            color: "#bfdbfe",
            borderRadius: "999px",
            padding: "9px 14px",
            fontSize: "13px",
            fontWeight: 850,
            cursor: "pointer",
          }}
        >
          + Agregar otra observación
        </button>

        {observacionInformeMsg && (
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid rgba(56,189,248,0.22)",
              background: "rgba(14,165,233,0.10)",
              color: "#bae6fd",
              padding: "11px 12px",
              fontSize: "13px",
              lineHeight: 1.45,
            }}
          >
            {observacionInformeMsg}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "4px",
          }}
        >
          <button
            type="button"
            onClick={handleCancelObservacionInformeModal}
            style={{
              height: "42px",
              padding: "0 15px",
              borderRadius: "12px",
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(255,255,255,0.03)",
              color: "#dbeafe",
              fontSize: "13px",
              fontWeight: 750,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleGuardarObservacionInforme}
            disabled={savingObservacionInforme}
            style={{
              height: "42px",
              padding: "0 17px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(180deg, #ef4444, #b91c1c)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 850,
              opacity: savingObservacionInforme ? 0.65 : 1,
              cursor: savingObservacionInforme ? "not-allowed" : "pointer",
            }}
          >
            {savingObservacionInforme
              ? "Guardando..."
              : "Guardar y entregar observado"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showObservacionInformeModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.72)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10020,
      padding: "24px",
    }}
    onClick={handleCancelObservacionInformeModal}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(980px, 100%)",
        maxHeight: "88vh",
        overflowY: "auto",
        borderRadius: "24px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.18)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.48)",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "18px",
          alignItems: "flex-start",
          marginBottom: "22px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8fb9e8",
              fontWeight: 850,
              marginBottom: "8px",
            }}
          >
            Resultado del informe
          </div>

          <h3
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "25px",
              fontWeight: 800,
              letterSpacing: "-0.035em",
            }}
          >
            Entregar informe observado
          </h3>

          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(214,228,245,0.78)",
              fontSize: "13px",
              lineHeight: 1.5,
              maxWidth: "720px",
            }}
          >
            Cargá una o más observaciones registrales detectadas en el informe.
            El trámite quedará como entregado con resultado observado.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancelObservacionInformeModal}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.04)",
            color: "#dbeafe",
            fontSize: "22px",
            lineHeight: "30px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {observacionesForm.map((obs, index) => (
          <div
            key={index}
            style={{
              borderRadius: "20px",
              border: "1px solid rgba(248,113,113,0.24)",
              background:
                "linear-gradient(180deg, rgba(127,29,29,0.18), rgba(3,18,34,0.48))",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  color: "#fecaca",
                  fontSize: "12px",
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Observación {index + 1}
              </div>

              {observacionesForm.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveObservacionForm(index)}
                  style={{
                    border: "1px solid rgba(248,113,113,0.28)",
                    background: "rgba(127,29,29,0.22)",
                    color: "#fecaca",
                    borderRadius: "999px",
                    padding: "7px 10px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Quitar
                </button>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              <div>
                <label style={modalFieldLabelStyle}>Tipo de observación</label>
                <select
                  style={modalInputStyle}
                  value={obs.tipo_observacion}
                  onChange={(e) =>
                    handleObservacionFormChange(
                      index,
                      "tipo_observacion",
                      e.target.value
                    )
                  }
                >
                  <option value="prenda">Prenda</option>
                  <option value="embargo">Embargo</option>
                  <option value="inhibicion">Inhibición</option>
                  <option value="medida_cautelar">Medida cautelar</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {obs.tipo_observacion === "prenda" ? (
                <>
                  <div>
                    <label style={modalFieldLabelStyle}>Acreedor</label>
                    <input
                      style={modalInputStyle}
                      value={obs.acreedor}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "acreedor",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Ej. DÍA ARGENTINA S.A."
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>Grado</label>
                    <input
                      style={modalInputStyle}
                      value={obs.grado}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "grado",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Ej. 1°"
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>Fecha contrato</label>
                    <input
                      style={modalInputStyle}
                      value={obs.fecha_contrato}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "fecha_contrato",
                          e.target.value
                        )
                      }
                      placeholder="Ej. 21/05/25"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={modalFieldLabelStyle}>Tipo de medida</label>
                    <input
                      style={modalInputStyle}
                      value={obs.tipo_medida}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "tipo_medida",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Ej. INHIBICIÓN / EMBARGO"
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>Juzgado</label>
                    <input
                      style={modalInputStyle}
                      value={obs.juzgado}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "juzgado",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Juzgado interviniente"
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>Actor</label>
                    <input
                      style={modalInputStyle}
                      value={obs.actor}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "actor",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Actor"
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>Expediente</label>
                    <input
                      style={modalInputStyle}
                      value={obs.expediente}
                      onChange={(e) =>
                        handleObservacionFormChange(
                          index,
                          "expediente",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Expediente"
                    />
                  </div>
                </>
              )}

              <div>
                <label style={modalFieldLabelStyle}>Fecha inscripción</label>
                <input
                  style={modalInputStyle}
                  value={obs.fecha_inscripcion}
                  onChange={(e) =>
                    handleObservacionFormChange(
                      index,
                      "fecha_inscripcion",
                      e.target.value
                    )
                  }
                  placeholder="Ej. 11/2025"
                />
              </div>

              <div>
                <label style={modalFieldLabelStyle}>Monto</label>
                <input
                  style={modalInputStyle}
                  value={obs.monto}
                  onChange={(e) =>
                    handleObservacionFormChange(index, "monto", e.target.value)
                  }
                  placeholder="Ej. $ 490.918,06 + INT $ 73.637,71"
                />
              </div>

              <div>
                <label style={modalFieldLabelStyle}>Estado</label>
                <input
                  style={modalInputStyle}
                  value={obs.estado}
                  onChange={(e) =>
                    handleObservacionFormChange(
                      index,
                      "estado",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Ej. VIGENTE"
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={modalFieldLabelStyle}>Observación</label>
                <input
                  style={modalInputStyle}
                  value={obs.observacion}
                  onChange={(e) =>
                    handleObservacionFormChange(
                      index,
                      "observacion",
                      e.target.value
                    )
                  }
                  placeholder="Detalle adicional"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddObservacionForm}
          style={{
            alignSelf: "flex-start",
            border: "1px solid rgba(96, 165, 250, 0.34)",
            background: "rgba(37, 99, 235, 0.14)",
            color: "#bfdbfe",
            borderRadius: "999px",
            padding: "9px 14px",
            fontSize: "13px",
            fontWeight: 850,
            cursor: "pointer",
          }}
        >
          + Agregar otra observación
        </button>

        {observacionInformeMsg && (
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid rgba(56,189,248,0.22)",
              background: "rgba(14,165,233,0.10)",
              color: "#bae6fd",
              padding: "11px 12px",
              fontSize: "13px",
              lineHeight: 1.45,
            }}
          >
            {observacionInformeMsg}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "4px",
          }}
        >
          <button
            type="button"
            onClick={handleCancelObservacionInformeModal}
            style={{
              height: "42px",
              padding: "0 15px",
              borderRadius: "12px",
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(255,255,255,0.03)",
              color: "#dbeafe",
              fontSize: "13px",
              fontWeight: 750,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleGuardarObservacionInforme}
            disabled={savingObservacionInforme}
            style={{
              height: "42px",
              padding: "0 17px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(180deg, #ef4444, #b91c1c)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 850,
              opacity: savingObservacionInforme ? 0.65 : 1,
              cursor: savingObservacionInforme ? "not-allowed" : "pointer",
            }}
          >
            {savingObservacionInforme
              ? "Guardando..."
              : "Guardar y entregar observado"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showDatosLegajoEditor && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.72)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(980px, 100%)",
        maxHeight: "88vh",
        overflowY: "auto",
        borderRadius: "24px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.18)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.48)",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "18px",
          alignItems: "flex-start",
          marginBottom: "22px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8fb9e8",
              fontWeight: 850,
              marginBottom: "8px",
            }}
          >
            Administración del legajo
          </div>

          <h3
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "25px",
              fontWeight: 800,
              letterSpacing: "-0.035em",
            }}
          >
            Cargar / editar informe
          </h3>

          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(214,228,245,0.78)",
              fontSize: "13px",
              lineHeight: 1.5,
              maxWidth: "720px",
            }}
          >
            Desde este panel SAKI podrá completar los datos administrativos del informe,
dominio, franquiciado, titularidad, cónyuge y condóminos del legajo.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancelDatosLegajoEditor}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.04)",
            color: "#dbeafe",
            fontSize: "22px",
            lineHeight: "30px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  }}
>
  <div
  style={{
    borderRadius: "20px",
    border: "1px solid rgba(96,165,250,0.22)",
    background:
      "linear-gradient(180deg, rgba(15, 50, 92, 0.82), rgba(3,18,34,0.62))",
    padding: "18px",
  }}
>
  <div style={{ marginBottom: "14px" }}>
    <div
      style={{
        fontSize: "11px",
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#60a5fa",
        marginBottom: "6px",
      }}
    >
      Datos administrativos del informe
    </div>

    <div
      style={{
        color: "rgba(214,228,245,0.78)",
        fontSize: "13px",
        lineHeight: 1.5,
      }}
    >
      Corrección administrativa SAKI. Estos datos pueden actualizarse aunque el
      informe ya se encuentre entregado.
    </div>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
    }}
  >
    <div>
      <label style={modalFieldLabelStyle}>Estado operativo</label>
      <select
        value={datosLegajoForm.status}
        onChange={(e) => handleDatosLegajoChange("status", e.target.value)}
        style={modalInputStyle}
      >
        <option value="SOLICITADO">Solicitado</option>
        <option value="EN CURSO">En curso</option>
        <option value="ENTREGADO">Entregado</option>
        <option value="ANULADO">Anulado</option>
      </select>
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Resultado</label>
      <select
        value={datosLegajoForm.result}
        onChange={(e) => handleDatosLegajoChange("result", e.target.value)}
        style={modalInputStyle}
      >
        <option value="PENDIENTE">Pendiente</option>
        <option value="APROBADO">Aprobado</option>
        <option value="OBSERVADO">Observado</option>
      </select>
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Fecha real del pedido</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.fecha_pedido_real}
        onChange={(e) =>
          handleDatosLegajoChange("fecha_pedido_real", e.target.value)
        }
        placeholder="DD/MM/AAAA"
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Fecha real de entrega</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.fecha_entrega_real}
        onChange={(e) =>
          handleDatosLegajoChange("fecha_entrega_real", e.target.value)
        }
        placeholder="DD/MM/AAAA"
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Estado observado</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.observed_status}
        onChange={(e) =>
          handleDatosLegajoChange("observed_status", e.target.value.toUpperCase())
        }
        placeholder="Ej. OBSERVADO"
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Fecha de observación</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.observed_date}
        onChange={(e) =>
          handleDatosLegajoChange("observed_date", e.target.value)
        }
        placeholder="DD/MM/AAAA"
      />
    </div>

    <div style={{ gridColumn: "1 / -1" }}>
      <label style={modalFieldLabelStyle}>Detalle / observación administrativa</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.observed_other}
        onChange={(e) =>
          handleDatosLegajoChange("observed_other", e.target.value)
        }
        placeholder="Detalle administrativo del resultado, si corresponde"
      />
    </div>
    {datosLegajoForm.result === "OBSERVADO" && (
  <div style={{ gridColumn: "1 / -1" }}>
    <button
      type="button"
      onClick={handleOpenObservacionInformeModal}
      style={{
        height: "38px",
        padding: "0 14px",
        borderRadius: "12px",
        border: "1px solid rgba(245, 158, 11, 0.34)",
        background:
          "linear-gradient(180deg, rgba(120, 70, 18, 0.32), rgba(3,18,34,0.62))",
        color: "#fde68a",
        fontSize: "13px",
        fontWeight: 850,
        cursor: "pointer",
      }}
    >
      Cargar observación del informe
    </button>
  </div>
)}
  </div>
</div>
<div
  style={{
    borderRadius: "20px",
    border: "1px solid rgba(96,165,250,0.22)",
    background:
      "linear-gradient(180deg, rgba(15, 50, 92, 0.82), rgba(3,18,34,0.62))",
    padding: "18px",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      gap: "16px",
      alignItems: "flex-start",
      marginBottom: "16px",
    }}
  >
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 900,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#60a5fa",
          marginBottom: "6px",
        }}
      >
        Estado del informe
      </div>

      <div
        style={{
          color: "rgba(214,228,245,0.78)",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        Gestión interna SAKI. Solo usuarios administradores pueden modificar el
        estado operativo del informe.
      </div>
    </div>

    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        minHeight: "30px",
        padding: "0 13px",
        borderRadius: "999px",
        background: estadoPillColors.bg,
        border: `1px solid ${estadoPillColors.border}`,
        color: estadoPillColors.color,
        fontSize: "12px",
        fontWeight: 850,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "999px",
          background: estadoPillColors.dot,
          boxShadow: `0 0 0 3px ${estadoPillColors.bg}`,
          flexShrink: 0,
        }}
      />

      {(estadoActual || "Estado por completar").toString().toUpperCase()}
    </div>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
      marginBottom: "16px",
    }}
  >
    <div>
      <label style={modalFieldLabelStyle}>Estado actual</label>
      <div style={modalInputStyle}>
        {row?.status || row?.estado || "Por completar"}
      </div>
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Resultado</label>
      <div style={modalInputStyle}>
        {row?.result || "Pendiente"}
      </div>
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Fecha estado</label>
      <div style={modalInputStyle}>
        {estadoFechaInfo?.value || "Por completar"}
      </div>
    </div>
  </div>

  <div
    style={{
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      alignItems: "center",
    }}
  >
    {estadoActualKey === "SOLICITADO" && (
      <button
        type="button"
        onClick={handleTomarGestionInforme}
        disabled={savingEstadoInforme}
        style={{
          height: "38px",
          padding: "0 14px",
          borderRadius: "12px",
          border: "none",
          background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 850,
          cursor: savingEstadoInforme ? "not-allowed" : "pointer",
          opacity: savingEstadoInforme ? 0.65 : 1,
        }}
      >
        Tomar gestión
      </button>
    )}

    {estadoActualKey === "EN CURSO" && (
      <>
        <button
          type="button"
          onClick={handleEntregarInformeAprobado}
          disabled={savingEstadoInforme}
          style={{
            height: "38px",
            padding: "0 14px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #16a34a, #15803d)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 850,
            cursor: savingEstadoInforme ? "not-allowed" : "pointer",
            opacity: savingEstadoInforme ? 0.65 : 1,
          }}
        >
          Entregar aprobado
        </button>

        <button
          type="button"
          onClick={handleOpenObservacionInformeModal}
          disabled={savingEstadoInforme}
          style={{
            height: "38px",
            padding: "0 14px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #ef4444, #b91c1c)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 850,
            cursor: savingEstadoInforme ? "not-allowed" : "pointer",
            opacity: savingEstadoInforme ? 0.65 : 1,
          }}
        >
          Entregar observado
        </button>
      </>
    )}

    {estadoActualKey !== "ANULADO" && (
      <button
        type="button"
        onClick={handleAnularInforme}
        disabled={savingEstadoInforme}
        style={{
          height: "38px",
          padding: "0 14px",
          borderRadius: "12px",
          border: "1px solid rgba(248,113,113,0.28)",
          background: "rgba(127,29,29,0.26)",
          color: "#fecaca",
          fontSize: "13px",
          fontWeight: 850,
          cursor: savingEstadoInforme ? "not-allowed" : "pointer",
          opacity: savingEstadoInforme ? 0.65 : 1,
        }}
      >
        Anular informe
      </button>
    )}

    {estadoActualKey === "ANULADO" && (
      <div
        style={{
          color: "#fecaca",
          fontSize: "13px",
          fontWeight: 750,
        }}
      >
        Informe anulado. No hay acciones operativas pendientes.
      </div>
    )}

    {savingEstadoInforme && (
      <div
        style={{
          color: "#bfdbfe",
          fontSize: "13px",
          fontWeight: 750,
        }}
      >
        Actualizando estado...
      </div>
    )}
  </div>
</div>

  <div
  style={{
    borderRadius: "20px",
    border: "1px solid rgba(96,165,250,0.18)",
    background:
      "linear-gradient(180deg, rgba(7,31,58,0.72), rgba(3,18,34,0.58))",
    padding: "18px",
  }}
>
  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "14px",
  }}
>
  <div>
    <div
      style={{
        fontSize: "11px",
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#60a5fa",
        marginBottom: "6px",
      }}
    >
      Dominio / Automotor
    </div>

    <div
      style={{
        color: "rgba(214,228,245,0.78)",
        fontSize: "13px",
        lineHeight: 1.5,
      }}
    >
      Datos identificatorios del automotor, radicación y registro
      interviniente.
    </div>
  </div>

  <button
    type="button"
    onClick={() => setEditingDominioBlock(true)}
    style={{
      height: "34px",
      padding: "0 12px",
      borderRadius: "999px",
      border: "1px solid rgba(96,165,250,0.28)",
      background:
        "linear-gradient(180deg, rgba(37,99,235,0.22), rgba(3,18,34,0.58))",
      color: "#dbeafe",
      fontSize: "12px",
      fontWeight: 850,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    {editingDominioBlock ? "Editando" : "Editar"}
  </button>
</div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
    }}
  >
    <div>
      <label style={modalFieldLabelStyle}>Dominio</label>
      <input
  style={modalInputStyle}
  value={datosLegajoForm.dominio}
  onChange={(e) =>
    handleDatosLegajoChange("dominio", e.target.value.toUpperCase())
  }
  placeholder="Ej. AC384MD"
  disabled={!editingDominioBlock}
/>
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Marca</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.marca}
        onChange={(e) =>
          handleDatosLegajoChange("marca", e.target.value.toUpperCase())
        }
        placeholder="Marca"
        disabled={!editingDominioBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Modelo</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.modelo}
        onChange={(e) =>
          handleDatosLegajoChange("modelo", e.target.value.toUpperCase())
        }
        placeholder="Modelo"
        disabled={!editingDominioBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Tipo</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.tipo}
        onChange={(e) =>
          handleDatosLegajoChange("tipo", e.target.value.toUpperCase())
        }
        placeholder="Ej. Sedán / SUV / Pick-up"
        disabled={!editingDominioBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Modelo año</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.modelo_anio}
        onChange={(e) =>
          handleDatosLegajoChange("modelo_anio", e.target.value)
        }
        placeholder="Ej. 2025"
        disabled={!editingDominioBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Marca motor</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.marca_motor}
        onChange={(e) =>
          handleDatosLegajoChange("marca_motor", e.target.value.toUpperCase())
        }
        placeholder="Marca motor"
        disabled={!editingDominioBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>N° motor</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.numero_motor}
        onChange={(e) =>
          handleDatosLegajoChange("numero_motor", e.target.value.toUpperCase())
        }
        placeholder="Número de motor"
        disabled={!editingDominioBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Marca chasis</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.marca_chasis}
        onChange={(e) =>
          handleDatosLegajoChange("marca_chasis", e.target.value.toUpperCase())
        }
        placeholder="Marca chasis"
        disabled={!editingDominioBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>N° chasis</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.numero_chasis}
        onChange={(e) =>
          handleDatosLegajoChange("numero_chasis", e.target.value.toUpperCase())
        }
        placeholder="Número de chasis"
        disabled={!editingDominioBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Radicación</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.radicacion}
        onChange={(e) =>
          handleDatosLegajoChange("radicacion", e.target.value.toUpperCase())
        }
        placeholder="Radicación"
        disabled={!editingDominioBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Registro interviniente</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.registro_interviniente}
        onChange={(e) =>
          handleDatosLegajoChange(
            "registro_interviniente",
            e.target.value.toUpperCase()
          )
        }
        placeholder="Registro interviniente"
        disabled={!editingDominioBlock}
      />
    </div>
  </div>
  {editingDominioBlock && (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "16px",
    }}
  >
    <button
      type="button"
      onClick={() => {
        setDatosLegajoForm(buildDatosLegajoForm(row));
        setEditingDominioBlock(false);
        setDatosLegajoDirty(false);
      }}
      style={{
        height: "38px",
        padding: "0 14px",
        borderRadius: "12px",
        border: "1px solid rgba(148,163,184,0.18)",
        background: "rgba(255,255,255,0.03)",
        color: "#dbeafe",
        fontSize: "13px",
        fontWeight: 750,
        cursor: "pointer",
      }}
    >
      Cancelar
    </button>

    <button
      type="button"
      onClick={handleSaveDominioBlock}
      disabled={savingDatosLegajo}
      style={{
        height: "38px",
        padding: "0 15px",
        borderRadius: "12px",
        border: "none",
        background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: 850,
        opacity: savingDatosLegajo ? 0.65 : 1,
        cursor: savingDatosLegajo ? "not-allowed" : "pointer",
      }}
    >
      {savingDatosLegajo ? "Guardando..." : "Guardar cambios"}
    </button>
  </div>
)}
</div>

{esInformeNominal && (
  <div
    style={{
      borderRadius: "20px",
      border: "1px solid rgba(96,165,250,0.18)",
      background:
        "linear-gradient(180deg, rgba(7,31,58,0.72), rgba(3,18,34,0.58))",
      padding: "18px",
    }}
  >
    <div style={{ marginBottom: "14px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 900,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#60a5fa",
          marginBottom: "6px",
        }}
      >
        Vehículos informados
      </div>

      <div
        style={{
          color: "rgba(214,228,245,0.78)",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        Carga de dominios informados por el Informe Nominal. Se puede indicar si
        la persona consultada figura como titular actual o titular histórico.
      </div>
    </div>

{Array.isArray(vehiculosNominal) && vehiculosNominal.length > 0 && (
  <div
    style={{
      borderRadius: "18px",
      border: "1px solid rgba(96,165,250,0.22)",
      background:
        "linear-gradient(180deg, rgba(15,50,92,0.54), rgba(3,18,34,0.46))",
      padding: "14px",
      marginBottom: "14px",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#93c5fd",
        marginBottom: "10px",
      }}
    >
      Vehículos ya cargados
    </div>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {vehiculosNominal.map((vehiculo, index) => {
        const estaEditando = vehiculoNominalEditandoId === vehiculo.id;

        return (
          <div
            key={vehiculo.id || index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              borderRadius: "14px",
              border: estaEditando
                ? "1px solid rgba(34,197,94,0.42)"
                : "1px solid rgba(148,163,184,0.16)",
              background: estaEditando
                ? "rgba(22,163,74,0.14)"
                : "rgba(255,255,255,0.035)",
              padding: "12px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 850,
                }}
              >
                Vehículo {index + 1} · {vehiculo?.dominio || "Sin dominio"}
              </div>

              <div
                style={{
                  color: "rgba(214,228,245,0.72)",
                  fontSize: "12px",
                  marginTop: "4px",
                  lineHeight: 1.4,
                }}
              >
                {vehiculo?.marca || "—"} {vehiculo?.modelo || ""} ·{" "}
                {vehiculo?.titular || "Titular sin cargar"}
              </div>
            </div>

            <div
  style={{
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexShrink: 0,
  }}
>
  <button
    type="button"
    onClick={() => handleEditarVehiculoNominal(vehiculo)}
    disabled={savingVehiculosNominal}
    style={{
      height: "34px",
      padding: "0 12px",
      borderRadius: "999px",
      border: estaEditando
        ? "1px solid rgba(34,197,94,0.42)"
        : "1px solid rgba(96,165,250,0.28)",
      background: estaEditando
        ? "rgba(22,163,74,0.22)"
        : "linear-gradient(180deg, rgba(37,99,235,0.22), rgba(3,18,34,0.58))",
      color: estaEditando ? "#bbf7d0" : "#dbeafe",
      fontSize: "12px",
      fontWeight: 850,
      cursor: savingVehiculosNominal ? "not-allowed" : "pointer",
      whiteSpace: "nowrap",
    }}
  >
    {estaEditando ? "Editando" : "Editar"}
  </button>

  <button
    type="button"
    onClick={() => handleEliminarVehiculoNominal(vehiculo)}
    disabled={savingVehiculosNominal}
    style={{
      height: "34px",
      padding: "0 12px",
      borderRadius: "999px",
      border: "1px solid rgba(248,113,113,0.34)",
      background: "rgba(127,29,29,0.26)",
      color: "#fecaca",
      fontSize: "12px",
      fontWeight: 850,
      cursor: savingVehiculosNominal ? "not-allowed" : "pointer",
      whiteSpace: "nowrap",
    }}
  >
    Eliminar
  </button>
</div>
          </div>
        );
      })}
    </div>
  </div>
)}

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {vehiculosNominalForm.map((vehiculo, index) => (
        <div
          key={index}
          style={{
            borderRadius: "18px",
            border: "1px solid rgba(96,165,250,0.22)",
            background:
              "linear-gradient(180deg, rgba(15,50,92,0.68), rgba(3,18,34,0.52))",
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                color: "#93c5fd",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Vehículo {index + 1}
            </div>

            {vehiculosNominalForm.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveVehiculoNominal(index)}
                style={{
                  border: "1px solid rgba(248,113,113,0.28)",
                  background: "rgba(127,29,29,0.22)",
                  color: "#fecaca",
                  borderRadius: "999px",
                  padding: "7px 10px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Quitar
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            <div>
              <label style={modalFieldLabelStyle}>Condición</label>
              <select
                style={modalInputStyle}
                value={vehiculo.condicion_titular}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "condicion_titular",
                    e.target.value
                  )
                }
              >
                <option value="titular_actual">Titular actual</option>
                <option value="titular_historico">Titular histórico</option>
              </select>
            </div>

            <div>
              <label style={modalFieldLabelStyle}>Dominio</label>
              <input
                style={modalInputStyle}
                value={vehiculo.dominio}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "dominio",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Ej. AE387DN"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>Marca</label>
              <input
                style={modalInputStyle}
                value={vehiculo.marca}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "marca",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Ej. FORD"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>Modelo</label>
              <input
                style={modalInputStyle}
                value={vehiculo.modelo}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "modelo",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Ej. KA SEDAN S"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>Tipo</label>
              <input
                style={modalInputStyle}
                value={vehiculo.tipo}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "tipo",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Ej. SEDAN 4 PUERTAS"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>Año modelo</label>
              <input
                style={modalInputStyle}
                value={vehiculo.modelo_anio}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "modelo_anio",
                    e.target.value
                  )
                }
                placeholder="Ej. 2020"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>Registro seccional</label>
              <input
                style={modalInputStyle}
                value={vehiculo.registro_seccional}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "registro_seccional",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Ej. 01158 - TRES DE FEBRERO N° 3"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>Domicilio registro</label>
              <input
                style={modalInputStyle}
                value={vehiculo.registro_domicilio}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "registro_domicilio",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Domicilio del registro"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>Localidad / Provincia</label>
              <input
                style={modalInputStyle}
                value={`${vehiculo.registro_localidad || ""}${
                  vehiculo.registro_provincia
                    ? ` / ${vehiculo.registro_provincia}`
                    : ""
                }`}
                onChange={(e) => {
                  const [localidad, provincia] = e.target.value.split("/");
                  handleVehiculoNominalChange(
                    index,
                    "registro_localidad",
                    (localidad || "").toUpperCase().trim()
                  );
                  handleVehiculoNominalChange(
                    index,
                    "registro_provincia",
                    (provincia || "").toUpperCase().trim()
                  );
                }}
                placeholder="Ej. CABA / BUENOS AIRES"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>Titular</label>
              <input
                style={modalInputStyle}
                value={vehiculo.titular}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "titular",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Titular informado"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>CUIT / DNI titular</label>
              <input
                style={modalInputStyle}
                value={vehiculo.documento_titular}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "documento_titular",
                    e.target.value
                  )
                }
                placeholder="CUIT / DNI"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>% titular</label>
              <input
                style={modalInputStyle}
                value={vehiculo.porcentaje_titular}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "porcentaje_titular",
                    e.target.value
                  )
                }
                placeholder="Ej. 100"
              />
            </div>

            <div>
              <label style={modalFieldLabelStyle}>Fecha titular</label>
              <input
                style={modalInputStyle}
                value={vehiculo.fecha_titular}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "fecha_titular",
                    e.target.value
                  )
                }
                placeholder="Ej. 25/03/2022"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={modalFieldLabelStyle}>Observación</label>
              <input
                style={modalInputStyle}
                value={vehiculo.observacion}
                onChange={(e) =>
                  handleVehiculoNominalChange(
                    index,
                    "observacion",
                    e.target.value
                  )
                }
                placeholder="Detalle adicional"
              />
            </div>
          </div>
        </div>
      ))}

      <div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  }}
>
  {!vehiculoNominalEditandoId && (
    <button
      type="button"
      onClick={handleAddVehiculoNominal}
      style={{
        border: "1px solid rgba(96, 165, 250, 0.34)",
        background: "rgba(37, 99, 235, 0.14)",
        color: "#bfdbfe",
        borderRadius: "999px",
        padding: "9px 14px",
        fontSize: "13px",
        fontWeight: 850,
        cursor: "pointer",
      }}
    >
      + Agregar otro vehículo
    </button>
  )}

  {vehiculoNominalEditandoId && (
    <button
      type="button"
      onClick={handleCancelarEdicionVehiculoNominal}
      disabled={savingVehiculosNominal}
      style={{
        border: "1px solid rgba(148,163,184,0.22)",
        background: "rgba(255,255,255,0.04)",
        color: "#dbeafe",
        borderRadius: "999px",
        padding: "9px 14px",
        fontSize: "13px",
        fontWeight: 850,
        cursor: savingVehiculosNominal ? "not-allowed" : "pointer",
      }}
    >
      Cancelar edición
    </button>
  )}

  <button
    type="button"
    onClick={handleGuardarVehiculosNominal}
    disabled={savingVehiculosNominal}
    style={{
      border: "none",
      background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
      color: "#ffffff",
      borderRadius: "999px",
      padding: "10px 15px",
      fontSize: "13px",
      fontWeight: 850,
      opacity: savingVehiculosNominal ? 0.65 : 1,
      cursor: savingVehiculosNominal ? "not-allowed" : "pointer",
    }}
  >
    {savingVehiculosNominal
      ? "Guardando..."
      : vehiculoNominalEditandoId
      ? "Guardar cambios del vehículo"
      : "Guardar vehículos informados"}
  </button>
</div>

      {vehiculosNominalMsg && (
        <div
          style={{
            borderRadius: "14px",
            border: "1px solid rgba(56,189,248,0.22)",
            background: "rgba(14,165,233,0.10)",
            color: "#bae6fd",
            padding: "11px 12px",
            fontSize: "13px",
            lineHeight: 1.45,
          }}
        >
          {vehiculosNominalMsg}
        </div>
      )}
    </div>
  </div>
)}
<div
  style={{
    borderRadius: "20px",
    border: "1px solid rgba(96,165,250,0.18)",
    background:
      "linear-gradient(180deg, rgba(7,31,58,0.72), rgba(3,18,34,0.58))",
    padding: "18px",
  }}
>
  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "14px",
  }}
>
  <div>
    <div
      style={{
        fontSize: "11px",
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#60a5fa",
        marginBottom: "6px",
      }}
    >
      Franquiciado
    </div>

    <div
      style={{
        color: "rgba(214,228,245,0.78)",
        fontSize: "13px",
        lineHeight: 1.5,
      }}
    >
      Datos del franquiciado vinculado al informe.
    </div>
  </div>

  <button
    type="button"
    onClick={() => setEditingFrqBlock(true)}
    style={{
      height: "34px",
      padding: "0 12px",
      borderRadius: "999px",
      border: "1px solid rgba(96,165,250,0.28)",
      background:
        "linear-gradient(180deg, rgba(37,99,235,0.22), rgba(3,18,34,0.58))",
      color: "#dbeafe",
      fontSize: "12px",
      fontWeight: 850,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    {editingFrqBlock ? "Editando" : "Editar"}
  </button>
</div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
    }}
  >
    <div>
      <label style={modalFieldLabelStyle}>Tienda</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.tienda}
        onChange={(e) =>
          handleDatosLegajoChange("tienda", e.target.value.toUpperCase())
        }
        placeholder="Ej. 8888"
        disabled={!editingFrqBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Tipo de persona</label>
      <select
        value={datosLegajoForm.frq_tipo_persona}
        onChange={(e) =>
          handleDatosLegajoChange("frq_tipo_persona", e.target.value)
        }
        style={modalInputStyle}
        disabled={!editingFrqBlock}
      >
        <option value="JURIDICA">Persona jurídica</option>
        <option value="HUMANA">Persona humana</option>
      </select>
    </div>

    {datosLegajoForm.frq_tipo_persona === "JURIDICA" ? (
      <>
        <div>
          <label style={modalFieldLabelStyle}>Franquiciado / razón social</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.frq_razon_social}
            onChange={(e) =>
              handleDatosLegajoChange(
                "frq_razon_social",
                e.target.value.toUpperCase()
              )
            }
            placeholder="Franquiciado cargado por Día"
            disabled={!editingFrqBlock}
          />
        </div>
      </>
    ) : (
      <>
        <div>
          <label style={modalFieldLabelStyle}>Apellido</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.frq_apellido}
            onChange={(e) =>
              handleDatosLegajoChange(
                "frq_apellido",
                e.target.value.toUpperCase()
              )
            }
            placeholder="Apellido"
            disabled={!editingFrqBlock}
          />
        </div>

        <div>
          <label style={modalFieldLabelStyle}>Nombres</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.frq_nombres}
            onChange={(e) =>
              handleDatosLegajoChange(
                "frq_nombres",
                e.target.value.toUpperCase()
              )
            }
            placeholder="Nombres"
            disabled={!editingFrqBlock}
          />
        </div>
      </>
    )}

    <div>
      <label style={modalFieldLabelStyle}>CUIT / CUIL</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.frq_cuit}
        onChange={(e) =>
          handleDatosLegajoChange("frq_cuit", formatDocumentoInput(e.target.value))
        }
        placeholder="CUIT / CUIL"
        disabled={!editingFrqBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Email</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.frq_email}
        onChange={(e) =>
          handleDatosLegajoChange("frq_email", e.target.value)
        }
        placeholder="Email"
        disabled={!editingFrqBlock}
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Teléfono</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.frq_telefono}
        onChange={(e) =>
          handleDatosLegajoChange("frq_telefono", e.target.value)
        }
        placeholder="Teléfono"
        disabled={!editingFrqBlock}
      />
    </div>

    <div style={{ gridColumn: "1 / -1" }}>
      <label style={modalFieldLabelStyle}>Domicilio</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.frq_domicilio}
        onChange={(e) =>
          handleDatosLegajoChange(
            "frq_domicilio",
            e.target.value.toUpperCase()
          )
        }
        placeholder="Domicilio del franquiciado"
        disabled={!editingFrqBlock}
      />
    </div>
    {editingFrqBlock && (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "16px",
    }}
  >
    <button
      type="button"
      onClick={() => {
        setDatosLegajoForm(buildDatosLegajoForm(row));
        setEditingFrqBlock(false);
      }}
      style={{
        height: "38px",
        padding: "0 14px",
        borderRadius: "12px",
        border: "1px solid rgba(148,163,184,0.18)",
        background: "rgba(255,255,255,0.03)",
        color: "#dbeafe",
        fontSize: "13px",
        fontWeight: 750,
        cursor: "pointer",
      }}
    >
      Cancelar
    </button>

    <button
      type="button"
      onClick={handleSaveFrqBlock}
      disabled={savingDatosLegajo}
      style={{
        height: "38px",
        padding: "0 15px",
        borderRadius: "12px",
        border: "none",
        background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: 850,
        opacity: savingDatosLegajo ? 0.65 : 1,
        cursor: savingDatosLegajo ? "not-allowed" : "pointer",
      }}
    >
      {savingDatosLegajo ? "Guardando..." : "Guardar cambios"}
    </button>
  </div>
)}
  </div>
</div>
<div
  style={{
    borderRadius: "20px",
    border: "1px solid rgba(96,165,250,0.18)",
    background:
      "linear-gradient(180deg, rgba(7,31,58,0.72), rgba(3,18,34,0.58))",
    padding: "18px",
  }}
>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "14px",
  }}
>
  <div>
    <div
      style={{
        fontSize: "11px",
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#60a5fa",
        marginBottom: "6px",
      }}
    >
      Garante / Titular
    </div>

    <div
      style={{
        color: "rgba(214,228,245,0.78)",
        fontSize: "13px",
        lineHeight: 1.5,
      }}
    >
      Carga administrativa SAKI del titular/garante, estado civil, titularidad,
      cónyuge y condóminos cuando corresponda.
    </div>
  </div>

  <button
    type="button"
    onClick={() => setEditingTitularBlock(true)}
    style={{
      height: "34px",
      padding: "0 12px",
      borderRadius: "999px",
      border: "1px solid rgba(96,165,250,0.28)",
      background:
        "linear-gradient(180deg, rgba(37,99,235,0.22), rgba(3,18,34,0.58))",
      color: "#dbeafe",
      fontSize: "12px",
      fontWeight: 850,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    {editingTitularBlock ? "Editando" : "Editar"}
  </button>
</div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
    }}
  >
    <div>
      <label style={modalFieldLabelStyle}>Tipo de persona</label>
      <select
        value={datosLegajoForm.titular_tipo_persona}
        onChange={(e) =>
          handleDatosLegajoChange("titular_tipo_persona", e.target.value)
        }
        style={modalInputStyle}
      >
        <option value="HUMANA">Persona humana</option>
        <option value="JURIDICA">Persona jurídica</option>
      </select>
    </div>

    {datosLegajoForm.titular_tipo_persona === "JURIDICA" ? (
      <>
        <div>
          <label style={modalFieldLabelStyle}>Razón social</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.titular_razon_social}
            onChange={(e) =>
              handleDatosLegajoChange(
                "titular_razon_social",
                e.target.value.toUpperCase()
              )
            }
            placeholder="Razón social"
            disabled={!editingTitularBlock}
          />
        </div>

        <div>
          <label style={modalFieldLabelStyle}>CUIT</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.titular_cuil_cuit}
            onChange={(e) =>
              handleDatosLegajoChange(
                "titular_cuil_cuit",
                formatDocumentoInput(e.target.value)
              )
            }
            placeholder="CUIT"
            disabled={!editingTitularBlock}
          />
        </div>
      </>
    ) : (
      <>
        <div>
          <label style={modalFieldLabelStyle}>Apellido</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.titular_apellido}
            onChange={(e) =>
              handleDatosLegajoChange(
                "titular_apellido",
                e.target.value.toUpperCase()
              )
            }
            placeholder="Apellido"
            disabled={!editingTitularBlock}
          />
        </div>

        <div>
          <label style={modalFieldLabelStyle}>Nombres</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.titular_nombres}
            onChange={(e) =>
              handleDatosLegajoChange(
                "titular_nombres",
                e.target.value.toUpperCase()
              )
            }
            placeholder="Nombres"
            disabled={!editingTitularBlock}
          />
        </div>

        <div>
          <label style={modalFieldLabelStyle}>DNI</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.titular_dni}
            onChange={(e) =>
              handleDatosLegajoChange(
                "titular_dni",
                formatDocumentoInput(e.target.value)
              )
            }
            placeholder="DNI"
            disabled={!editingTitularBlock}
          />
        </div>

        <div>
          <label style={modalFieldLabelStyle}>CUIL / CUIT</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.titular_cuil_cuit}
            onChange={(e) =>
              handleDatosLegajoChange(
                "titular_cuil_cuit",
                formatDocumentoInput(e.target.value)
              )
            }
            placeholder="CUIL / CUIT"
            disabled={!editingTitularBlock}
          />
        </div>

        <div>
          <label style={modalFieldLabelStyle}>Estado civil</label>
          <select
            value={datosLegajoForm.titular_estado_civil}
            onChange={(e) =>
              handleDatosLegajoChange("titular_estado_civil", e.target.value)
            }
            style={modalInputStyle}
          >
            <option value="">Seleccionar</option>
            <option value="SOLTERO/A">Soltero/a</option>
            <option value="CASADO/A">Casado/a</option>
            <option value="DIVORCIADO/A">Divorciado/a</option>
            <option value="VIUDO/A">Viudo/a</option>
          </select>
        </div>
      </>
    )}

    <div>
      <label style={modalFieldLabelStyle}>Titular desde</label>
      <input
        type="date"
        style={{
          ...modalInputStyle,
          colorScheme: "dark",
        }}
        value={datosLegajoForm.titular_desde}
        onChange={(e) =>
          handleDatosLegajoChange("titular_desde", e.target.value)
        }
      />
    </div>

    <div>
      <label style={modalFieldLabelStyle}>Porcentaje de titularidad</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.porcentaje_titular}
        onChange={(e) =>
          handleDatosLegajoChange("porcentaje_titular", e.target.value)
        }
        placeholder="Ej. 100"
        disabled={!editingTitularBlock}
      />
    </div>

    <div style={{ gridColumn: "1 / -1" }}>
      <label style={modalFieldLabelStyle}>Domicilio</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.titular_domicilio}
        onChange={(e) =>
          handleDatosLegajoChange(
            "titular_domicilio",
            e.target.value.toUpperCase()
          )
        }
        placeholder="Domicilio del titular / garante"
        disabled={!editingTitularBlock}
      />
    </div>

    {titularAdminCasado && (
      <>
        <div
          style={{
            gridColumn: "1 / -1",
            marginTop: "6px",
            color: "#93c5fd",
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Cónyuge del titular
        </div>

        <div>
          <label style={modalFieldLabelStyle}>Apellido del cónyuge</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.titular_conyuge_apellido}
            onChange={(e) =>
              handleDatosLegajoChange(
                "titular_conyuge_apellido",
                e.target.value.toUpperCase()
              )
            }
            placeholder="Apellido"
            disabled={!editingTitularBlock}
          />
        </div>

        <div>
          <label style={modalFieldLabelStyle}>Nombres del cónyuge</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.titular_conyuge_nombres}
            onChange={(e) =>
              handleDatosLegajoChange(
                "titular_conyuge_nombres",
                e.target.value.toUpperCase()
              )
            }
            placeholder="Nombres"
            disabled={!editingTitularBlock}
          />
        </div>

        <div>
          <label style={modalFieldLabelStyle}>DNI del cónyuge</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.titular_conyuge_dni}
            onChange={(e) =>
              handleDatosLegajoChange(
                "titular_conyuge_dni",
                formatDocumentoInput(e.target.value)
              )
            }
            placeholder="DNI"
            disabled={!editingTitularBlock}
          />
        </div>

        <div>
          <label style={modalFieldLabelStyle}>CUIL / CUIT del cónyuge</label>
          <input
            style={modalInputStyle}
            value={datosLegajoForm.titular_conyuge_cuil_cuit}
            onChange={(e) =>
              handleDatosLegajoChange(
                "titular_conyuge_cuil_cuit",
                formatDocumentoInput(e.target.value)
              )
            }
            placeholder="CUIL / CUIT"
            disabled={!editingTitularBlock}
          />
        </div>
      </>
    )}

    <div
      style={{
        gridColumn: "1 / -1",
        border:
          datosLegajoTitularidadTotal === 100
            ? "1px solid rgba(34, 197, 94, 0.34)"
            : "1px solid rgba(251, 191, 36, 0.34)",
        background:
          datosLegajoTitularidadTotal === 100
            ? "rgba(34, 197, 94, 0.12)"
            : "rgba(217, 119, 6, 0.12)",
        color: datosLegajoTitularidadTotal === 100 ? "#bbf7d0" : "#fde68a",
        borderRadius: "16px",
        padding: "12px 14px",
        fontSize: "13px",
        fontWeight: 800,
      }}
    >
      {datosLegajoTitularidadTotal === 100
        ? "Titularidad completa: 100%."
        : datosLegajoTitularidadFaltante > 0
        ? `Titularidad cargada: ${datosLegajoTitularidadTotal}%. Falta completar: ${datosLegajoTitularidadFaltante}%.`
        : `La titularidad supera el 100%. Actualmente suma ${datosLegajoTitularidadTotal}%.`}
    </div>

    {mostrarCondominosAdmin && (
      <>
        <div
          style={{
            gridColumn: "1 / -1",
            marginTop: "6px",
            color: "#a78bfa",
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Condóminos
        </div>

        {Array.isArray(datosLegajoForm.condominos) &&
          datosLegajoForm.condominos.map((condomino, index) => (
            <div
              key={index}
              style={{
                gridColumn: "1 / -1",
                border: "1px solid rgba(109, 45, 212, 0.22)",
                borderLeft: "4px solid rgba(109, 45, 212, 0.72)",
                background:
                  "linear-gradient(180deg, rgba(109, 45, 212, 0.18), rgba(3, 18, 34, 0.48))",
                borderRadius: "18px",
                padding: "14px",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <strong style={{ color: "#dbeafe", fontSize: "13px" }}>
                  Condómino {index + 1}
                </strong>

                <button
                  type="button"
                  onClick={() => handleRemovePrendaCondomino(index)}
                  style={{
                    border: "1px solid rgba(248, 113, 113, 0.28)",
                    background: "rgba(127, 29, 29, 0.18)",
                    color: "#fecaca",
                    borderRadius: "999px",
                    padding: "7px 10px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Quitar
                </button>
              </div>

              <div>
                <label style={modalFieldLabelStyle}>Apellido</label>
                <input
                  style={modalInputStyle}
                  value={condomino.apellido}
                  onChange={(e) =>
                    handlePrendaCondominoChange(
                      index,
                      "apellido",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Apellido"
                  disabled={!editingTitularBlock}
                />
              </div>

              <div>
                <label style={modalFieldLabelStyle}>Nombres</label>
                <input
                  style={modalInputStyle}
                  value={condomino.nombres}
                  onChange={(e) =>
                    handlePrendaCondominoChange(
                      index,
                      "nombres",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Nombres"
                  disabled={!editingTitularBlock}
                />
              </div>

              <div>
                <label style={modalFieldLabelStyle}>DNI</label>
                <input
                  style={modalInputStyle}
                  value={condomino.dni}
                  onChange={(e) =>
                    handlePrendaCondominoChange(
                      index,
                      "dni",
                      formatDocumentoInput(e.target.value)
                    )
                  }
                  placeholder="DNI"
                  disabled={!editingTitularBlock}
                />
              </div>

              <div>
                <label style={modalFieldLabelStyle}>CUIL / CUIT</label>
                <input
                  style={modalInputStyle}
                  value={condomino.cuil_cuit}
                  onChange={(e) =>
                    handlePrendaCondominoChange(
                      index,
                      "cuil_cuit",
                      formatDocumentoInput(e.target.value)
                    )
                  }
                  placeholder="CUIL / CUIT"
                  disabled={!editingTitularBlock}
                />
              </div>

              <div>
                <label style={modalFieldLabelStyle}>Estado civil</label>
                <select
                  style={modalInputStyle}
                  value={condomino.estado_civil}
                  onChange={(e) =>
                    handlePrendaCondominoChange(
                      index,
                      "estado_civil",
                      e.target.value
                    )
                  }
                >
                  <option value="">Seleccionar</option>
                  <option value="SOLTERO/A">Soltero/a</option>
                  <option value="CASADO/A">Casado/a</option>
                  <option value="DIVORCIADO/A">Divorciado/a</option>
                  <option value="VIUDO/A">Viudo/a</option>
                </select>
              </div>

              <div>
                <label style={modalFieldLabelStyle}>Titular desde</label>
                <input
                  type="date"
                  style={{
                    ...modalInputStyle,
                    colorScheme: "dark",
                  }}
                  value={condomino.titular_desde}
                  onChange={(e) =>
                    handlePrendaCondominoChange(
                      index,
                      "titular_desde",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label style={modalFieldLabelStyle}>Porcentaje</label>
                <input
                  style={modalInputStyle}
                  value={condomino.porcentaje}
                  onChange={(e) =>
                    handlePrendaCondominoChange(
                      index,
                      "porcentaje",
                      e.target.value
                    )
                  }
                  placeholder="Ej. 30"
                  disabled={!editingTitularBlock}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={modalFieldLabelStyle}>Domicilio</label>
                <input
                  style={modalInputStyle}
                  value={condomino.domicilio}
                  onChange={(e) =>
                    handlePrendaCondominoChange(
                      index,
                      "domicilio",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Domicilio"
                  disabled={!editingTitularBlock}
                />
              </div>

              {condomino.estado_civil === "CASADO/A" && (
                <>
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      color: "#c4b5fd",
                      fontSize: "12px",
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Cónyuge del condómino
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>
                      Apellido del cónyuge
                    </label>
                    <input
                      style={modalInputStyle}
                      value={condomino.conyuge_apellido}
                      onChange={(e) =>
                        handlePrendaCondominoChange(
                          index,
                          "conyuge_apellido",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Apellido"
                      disabled={!editingTitularBlock}
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>
                      Nombres del cónyuge
                    </label>
                    <input
                      style={modalInputStyle}
                      value={condomino.conyuge_nombres}
                      onChange={(e) =>
                        handlePrendaCondominoChange(
                          index,
                          "conyuge_nombres",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Nombres"
                      disabled={!editingTitularBlock}
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>DNI del cónyuge</label>
                    <input
                      style={modalInputStyle}
                      value={condomino.conyuge_dni}
                      onChange={(e) =>
                        handlePrendaCondominoChange(
                          index,
                          "conyuge_dni",
                          formatDocumentoInput(e.target.value)
                        )
                      }
                      placeholder="DNI"
                      disabled={!editingTitularBlock}
                    />
                  </div>

                  <div>
                    <label style={modalFieldLabelStyle}>
                      CUIL / CUIT del cónyuge
                    </label>
                    <input
                      style={modalInputStyle}
                      value={condomino.conyuge_cuil_cuit}
                      onChange={(e) =>
                        handlePrendaCondominoChange(
                          index,
                          "conyuge_cuil_cuit",
                          formatDocumentoInput(e.target.value)
                        )
                      }
                      placeholder="CUIL / CUIT"
                      disabled={!editingTitularBlock}
                    />
                  </div>
                </>
              )}
            </div>
          ))}

        <button
          type="button"
          onClick={handleAddPrendaCondomino}
          style={{
            gridColumn: "1 / -1",
            justifySelf: "flex-start",
            border: "1px solid rgba(96, 165, 250, 0.34)",
            background: "rgba(37, 99, 235, 0.14)",
            color: "#bfdbfe",
            borderRadius: "999px",
            padding: "9px 14px",
            fontSize: "13px",
            fontWeight: 850,
            cursor: "pointer",
          }}
        >
          + Agregar condómino
        </button>
      </>
    )}
  </div>
</div>
</div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        <button
          type="button"
          onClick={handleCancelDatosLegajoEditor}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 750,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
  type="button"
  onClick={handleSaveDatosLegajo}
  disabled={savingDatosLegajo}
  style={{
    height: "42px",
    padding: "0 17px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 850,
    opacity: savingDatosLegajo ? 0.65 : 1,
    cursor: savingDatosLegajo ? "not-allowed" : "pointer",
  }}
>
  {savingDatosLegajo ? "Guardando..." : "Guardar datos"}
</button>
      </div>
    </div>
  </div>
)}

      <style jsx global>{`
  aside:not(:hover) .sidebar-label {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }

  aside:hover .sidebar-label {
    opacity: 1;
    width: auto;
  }

  .sidebar-label {
    transition: opacity 0.18s ease;
    white-space: nowrap;
  }

  .print-only {
  display: none;
}

@media print {
  body * {
    visibility: hidden !important;
  }

  .print-only,
  .print-only * {
    visibility: visible !important;
  }

  .print-only {
    display: block !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    background: #ffffff !important;
    color: #111827 !important;
    padding: 24px !important;
    font-family: Arial, sans-serif !important;
  }

  .print-header {
    border-bottom: 1px solid #d1d5db !important;
    padding-bottom: 14px !important;
    margin-bottom: 18px !important;
  }

  .print-brand {
    font-size: 22px !important;
    font-weight: 900 !important;
    letter-spacing: 0.08em !important;
    margin-bottom: 10px !important;
  }

  .print-header h1 {
    font-size: 22px !important;
    margin: 0 0 8px !important;
    color: #111827 !important;
  }

  .print-header p {
    font-size: 12px !important;
    margin: 4px 0 !important;
    color: #374151 !important;
  }

  .print-section {
    border: 1px solid #d1d5db !important;
    border-radius: 10px !important;
    padding: 14px !important;
    margin-bottom: 14px !important;
    page-break-inside: avoid !important;
  }

  .print-section h2 {
    font-size: 15px !important;
    margin: 0 0 12px !important;
    color: #111827 !important;
  }

  .print-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }

  .print-grid div {
    border: 1px solid #e5e7eb !important;
    border-radius: 8px !important;
    padding: 9px !important;
  }

  .print-grid span {
    display: block !important;
    font-size: 10px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    color: #6b7280 !important;
    margin-bottom: 4px !important;
  }

  .print-grid strong {
    display: block !important;
    font-size: 12px !important;
    color: #111827 !important;
    font-weight: 700 !important;
  }
}
`}</style>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, hasAlert }) {
  return (
    <div
      style={{
        ...(active ? navItemActiveStyle : navItemStyle),
        position: "relative",
      }}
      onClick={onClick}
      title={label}
    >
      <span style={navIconStyle}>{icon}</span>

      <span className="sidebar-label" style={active ? navLabelActiveStyle : navLabelStyle}>
        {label}
      </span>

      {hasAlert && (
        <span
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: "#22c55e",
            boxShadow: "0 0 0 3px rgba(34,197,94,0.16)",
          }}
        />
      )}
    </div>
  );
}

function ToolItem({ icon, label, onClick }) {
  return (
    <button type="button" style={toolItemStyle} onClick={onClick}>
      <span style={toolIconStyle}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function NoteMessage({ author, sector, date, text, saki }) {
  return (
    <div style={saki ? noteMessageSakiStyle : noteMessageStyle}>
      <div style={noteMetaStyle}>
        <strong>{author}</strong>
        <span>·</span>
        <span>{sector}</span>
      </div>

      <div style={noteDateStyle}>{date}</div>

      <div style={noteTextStyle}>{text}</div>
    </div>
  );
}

function ContextItem({ icon, label, value }) {
  return (
    <div style={contextItemStyle}>
      <div style={contextIconStyle}>{icon}</div>
      <div>
        <div style={contextLabelStyle}>{label}</div>
        <div style={contextValueStyle}>{value}</div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, items, onClick, disabled = false }) {
  return (
    <div
      style={{
        ...infoCardStyle,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.46 : 1,
        filter: disabled ? "grayscale(0.35)" : "none",
      }}
      onClick={disabled ? undefined : onClick}
    >
      <div style={infoHeaderStyle}>
        <div style={infoIconStyle}>{icon}</div>
        <div style={infoTitleStyle}>{title}</div>
      </div>

      <div style={infoBodyStyle}>
        {items.map(([label, value]) => {
          const displayValue =
            value === null ||
            value === undefined ||
            value === "" ||
            value === "Por completar"
              ? "—"
              : value;

          return (
            <div key={label}>
              <div style={smallLabelStyle}>{label}</div>
              <div style={smallValueStyle}>{displayValue}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineCard({ estado, fecha, texto, onClick }) {
  return (
    <div style={infoCardStyle}>
      <div style={infoHeaderStyle}>
        <div style={infoIconStyle}>
          <Flag size={30} />
        </div>
        <div style={infoTitleStyle}>ESTADO DEL TRÁMITE</div>
      </div>

      <div style={timelineStyle}>
  <TimelineItem
    color="#3b82f6"
    title={estado || "Estado del trámite"}
    date={fecha || "Fecha por completar"}
    text={texto || "Verificá el estado actual del legajo."}
  />
</div>

      <div style={cardFooterStyle}>
        <button style={linkButtonStyle} onClick={onClick}>
          Ver historial del trámite →
        </button>
      </div>
    </div>
  );
}

function TimelineItem({ color, title, date, text }) {
  return (
    <div style={timelineItemStyle}>
      <span style={{ ...timelineDotStyle, background: color }} />
      <div>
        <div style={timelineTopStyle}>
          <strong>{title}</strong>
          <span>{date}</span>
        </div>
        <div style={timelineTextStyle}>{text}</div>
      </div>
    </div>
  );
}

function FichaAvisos() {
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Bell size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Avisos del trámite</div>
          <h2 style={credentialNameStyle}>Centro de novedades</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato
          label="Uso previsto"
          value="Este panel concentra alertas y novedades operativas vinculadas al informe."
          wide
        />

        <FichaDato
          label="Estado actual"
          value="Los avisos automáticos se mostrarán cuando el trámite tenga una acción pendiente o una novedad relevante."
          wide
        />

        <FichaDato
          label="Importante"
          value="Este panel no modifica el estado del informe. Las acciones operativas se consultan desde la trazabilidad del legajo."
          wide
        />
      </div>
    </div>
  );
}

function FichaReporte() {
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Wrench size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Soporte del sistema</div>
          <h2 style={credentialNameStyle}>Reportar inconveniente</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato
          label="Uso previsto"
          value="Esta opción permitirá informar errores, datos incorrectos o problemas de visualización del legajo."
          wide
        />
        <FichaDato
          label="Ejemplos"
          value="No carga una ficha, falta un dato, el estado no coincide, no se visualiza un archivo o hay un problema operativo."
          wide
        />

        <button
  type="button"
  onClick={() => {
    const asunto = encodeURIComponent(
  "SAKI Portal Día | Informes | Reporte de inconveniente"
);

    const cuerpo = encodeURIComponent(
  `Hola, necesito reportar un inconveniente en el módulo Informes.

Módulo: Informes
URL del legajo: ${window.location.href}

Detalle del inconveniente:
`
);

    window.open(
  `https://outlook.office.com/mail/deeplink/compose?to=soporte@saki.net.ar&subject=${asunto}&body=${cuerpo}`,
  "_blank"
);
  }}
  style={{
    marginTop: "22px",
    width: "fit-content",
    border: "1px solid rgba(56, 189, 248, 0.45)",
    background:
      "linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(37, 99, 235, 0.18))",
    color: "#e0f2fe",
    borderRadius: "14px",
    padding: "11px 16px",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.01em",
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(8, 47, 73, 0.25)",
  }}
>
  Enviar reporte por mail
</button>
      </div>
    </div>
  );
}

function FichaNotas({
  row,
  notasLegajo = [],
  loadingNotas = false,
  notaMsg = "",
  nuevaNota = "",
  setNuevaNota,
  savingNota = false,
  onGuardarNota,
  respondiendoNota = null,
  setRespondiendoNota,
}) {
  const notasPrincipales = notasLegajo.filter((nota) => !nota.parent_id);

  const respuestasPorNota = notasLegajo.reduce((acc, nota) => {
    if (!nota.parent_id) return acc;

    const key = String(nota.parent_id);

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(nota);

    return acc;
  }, {});

  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <MessagesSquare size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Notas del legajo</div>

          <h2 style={credentialNameStyle}>
            {row?.dominio || "Legajo"}
          </h2>
        </div>
      </div>

      <div style={notesContentStyle}>
        <div style={helpBoxStyle}>
          <div>
            <div style={helpTitleStyle}>Agregar nota operativa</div>

            <div style={helpTextStyle}>
              Registrá comunicaciones, aclaraciones o comentarios internos
              vinculados al trámite.
            </div>
          </div>
        </div>

        {respondiendoNota && (
          <div
            style={{
              marginTop: "12px",
              borderRadius: "14px",
              border: "1px solid rgba(74,222,128,0.24)",
              background:
                "linear-gradient(180deg, rgba(22,163,74,0.16), rgba(16,185,129,0.08))",
              padding: "11px 12px",
              color: "#d1fae5",
              fontSize: "12px",
              lineHeight: 1.45,
            }}
          >
            <div
              style={{
                fontWeight: 850,
                marginBottom: "4px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              Respondiendo a
            </div>

            <div
              style={{
                color: "rgba(226,237,249,0.88)",
                marginBottom: "8px",
                whiteSpace: "pre-wrap",
              }}
            >
              {respondiendoNota.note || "Nota sin texto"}
            </div>

            <button
              type="button"
              onClick={() => {
                setRespondiendoNota(null);
                setNuevaNota("");
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "#86efac",
                fontSize: "12px",
                fontWeight: 850,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Cancelar respuesta
            </button>
          </div>
        )}

        <textarea
          value={nuevaNota}
          onChange={(e) => setNuevaNota(e.target.value)}
          placeholder="Escribí una nota para este legajo..."
          style={{
            width: "100%",
            minHeight: "96px",
            resize: "vertical",
            borderRadius: "16px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "13px 14px",
            fontSize: "13px",
            lineHeight: 1.45,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            marginTop: "12px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "10px",
          }}
        >
          <button
            type="button"
            onClick={onGuardarNota}
            disabled={savingNota}
            style={{
              height: "38px",
              padding: "0 14px",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 800,
              cursor: savingNota ? "not-allowed" : "pointer",
              opacity: savingNota ? 0.65 : 1,
            }}
          >
            {savingNota
              ? "Guardando..."
              : respondiendoNota
              ? "Guardar respuesta"
              : "Guardar nota"}
          </button>
        </div>

        {notaMsg && (
          <div
            style={{
              marginTop: "10px",
              color: "#bfdbfe",
              fontSize: "12px",
              lineHeight: 1.4,
            }}
          >
            {notaMsg}
          </div>
        )}

        <div style={{ marginTop: "18px" }}>
          {loadingNotas ? (
            <div style={historyPlaceholderStyle}>
              Cargando notas del legajo...
            </div>
          ) : notasPrincipales.length > 0 ? (
            notasPrincipales.map((nota) => {
              const respuestas = respuestasPorNota[String(nota.id)] || [];

              const isSakiNote =
                (nota.author_role || "")
                  .toString()
                  .trim()
                  .toLowerCase() === "admin";

              return (
                <div key={nota.id} style={{ marginBottom: "14px" }}>
                  <div
                    style={{
                      borderRadius: "16px",
                      border: isSakiNote
                        ? "1px solid rgba(74,222,128,0.32)"
                        : "1px solid rgba(148,163,184,0.14)",
                      background: isSakiNote
                        ? "linear-gradient(180deg, rgba(22,163,74,0.24), rgba(16,185,129,0.10))"
                        : "rgba(3,18,34,0.42)",
                      padding: "14px",
                    }}
                  >
                    <div
                      style={{
                        color: isSakiNote ? "#bbf7d0" : "#8fb9e8",
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                      }}
                    >
                      {isSakiNote ? "SAKI" : "DÍA"} ·{" "}
                      {formatDate(nota.created_at) || "Sin fecha"}
                      {nota.author_name ? ` · ${nota.author_name}` : ""}
                    </div>

                    <div
                      style={{
                        color: "rgba(226,237,249,0.92)",
                        fontSize: "13px",
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {nota.note || "—"}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRespondiendoNota(nota);
                        setNuevaNota("");
                      }}
                      style={{
                        marginTop: "10px",
                        border: "none",
                        background: "transparent",
                        color: "#93c5fd",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Responder
                    </button>
                  </div>

                  {respuestas.length > 0 && (
                    <div
                      style={{
                        marginTop: "9px",
                        marginLeft: "26px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "9px",
                      }}
                    >
                      {respuestas.map((respuesta) => {
                        const isSakiReply =
                          (respuesta.author_role || "")
                            .toString()
                            .trim()
                            .toLowerCase() === "admin";

                        return (
                          <div
                            key={respuesta.id}
                            style={{
                              borderRadius: "16px",
                              border: isSakiReply
                                ? "1px solid rgba(74,222,128,0.34)"
                                : "1px solid rgba(148,163,184,0.14)",
                              background: isSakiReply
                                ? "linear-gradient(180deg, rgba(22,163,74,0.28), rgba(16,185,129,0.12))"
                                : "rgba(15,44,78,0.34)",
                              padding: "13px",
                              boxShadow: isSakiReply
                                ? "0 10px 26px rgba(22,163,74,0.08)"
                                : "none",
                            }}
                          >
                            <div
                              style={{
                                color: isSakiReply ? "#bbf7d0" : "#8fb9e8",
                                fontSize: "11px",
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                marginBottom: "6px",
                              }}
                            >
                              ↳ {isSakiReply ? "SAKI" : "DÍA"} ·{" "}
                              {formatDate(respuesta.created_at) || "Sin fecha"}
                              {respuesta.author_name
                                ? ` · ${respuesta.author_name}`
                                : ""}
                            </div>

                            <div
                              style={{
                                color: "rgba(226,237,249,0.92)",
                                fontSize: "13px",
                                lineHeight: 1.55,
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {respuesta.note || "—"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={historyPlaceholderStyle}>
              No hay notas cargadas para este legajo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FichaArchivos({
  row,
  archivosLegajo,
  loadingArchivos,
  uploadingArchivo,
  archivoCategoria,
  setArchivoCategoria,
  archivoSeleccionado,
  setArchivoSeleccionado,
  archivoInputKey,
  setArchivoInputKey,
  archivoMsg,
  onSubirArchivo,
  onAbrirArchivo,
  isAdmin,
onEliminarArchivo,
}) {
  const formatFileSize = (bytes) => {
    if (!bytes) return "Tamaño no informado";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(2)} MB`;
  };

  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Paperclip size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Archivos del legajo</div>
          <h2 style={credentialNameStyle}>
            {row?.dominio || "Legajo por completar"}
          </h2>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(148,163,184,0.16)",
            background:
              "linear-gradient(180deg, rgba(7,31,58,0.72) 0%, rgba(3,18,34,0.58) 100%)",
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              lineHeight: 1.55,
              color: "rgba(214,228,245,0.82)",
              marginBottom: "16px",
            }}
          >
          Este espacio concentra toda la documentación digital vinculada al
informe: documentación inicial, informe emitido, dominio / automotor,
titular / garante, observaciones y cierre del legajo.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(220px, 0.8fr) minmax(260px, 1fr) auto",
              gap: "12px",
              alignItems: "end",
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
                  textTransform: "uppercase",
                  color: "#90a7c7",
                }}
              >
                Categoría
              </label>

              <select
                value={archivoCategoria}
                onChange={(e) => setArchivoCategoria(e.target.value)}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "14px",
                  border: "1px solid rgba(148, 163, 184, 0.18)",
                  background: "rgba(3, 11, 24, 0.72)",
                  color: "#f8fbff",
                  padding: "0 14px",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                  colorScheme: "dark",
                }}
              >
                {CATEGORIAS_ARCHIVOS_PRENDA.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#90a7c7",
                }}
              >
                Archivo
              </label>

              <input
  key={archivoInputKey}
  type="file"
  onChange={(e) =>
    setArchivoSeleccionado(e.target.files?.[0] || null)
  }
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "14px",
                  border: "1px solid rgba(148, 163, 184, 0.18)",
                  background: "rgba(3, 11, 24, 0.72)",
                  color: "#dbeafe",
                  padding: "9px 12px",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="button"
              onClick={onSubirArchivo}
              disabled={uploadingArchivo}
              style={{
                height: "44px",
                padding: "0 16px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 800,
                cursor: uploadingArchivo ? "not-allowed" : "pointer",
                opacity: uploadingArchivo ? 0.72 : 1,
                whiteSpace: "nowrap",
                boxShadow: "0 12px 24px rgba(37,99,235,0.24)",
              }}
            >
              {uploadingArchivo ? "Subiendo..." : "Subir archivo"}
            </button>
          </div>

          {archivoSeleccionado && (
  <div
    style={{
      marginTop: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      flexWrap: "wrap",
      fontSize: "12px",
      color: "rgba(214,228,245,0.76)",
    }}
  >
    <div>
      Archivo seleccionado:{" "}
      <strong style={{ color: "#e0f2fe" }}>
        {archivoSeleccionado.name}
      </strong>
    </div>

    <button
      type="button"
      onClick={() => {
        setArchivoSeleccionado(null);
        setArchivoInputKey((prev) => prev + 1);
      }}
      style={{
        height: "30px",
        padding: "0 10px",
        borderRadius: "10px",
        border: "1px solid rgba(248,113,113,0.28)",
        background: "rgba(127,29,29,0.22)",
        color: "#fecaca",
        fontSize: "12px",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      Quitar archivo
    </button>
  </div>
)}

          {archivoMsg && (
            <div
              style={{
                marginTop: "14px",
                borderRadius: "14px",
                border: "1px solid rgba(56,189,248,0.22)",
                background: "rgba(14,165,233,0.10)",
                color: "#bae6fd",
                padding: "11px 12px",
                fontSize: "13px",
                lineHeight: 1.45,
              }}
            >
              {archivoMsg}
            </div>
          )}
        </div>

        <div
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(148,163,184,0.16)",
            background:
              "linear-gradient(180deg, rgba(7,31,58,0.64) 0%, rgba(3,18,34,0.50) 100%)",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#90a7c7",
                  marginBottom: "4px",
                }}
              >
                Documentación cargada
              </div>

              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#f8fbff",
                }}
              >
                Archivos asociados al legajo
              </div>
            </div>

            <div
              style={{
                minHeight: "26px",
                padding: "0 10px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                background: "rgba(59,130,246,0.18)",
                border: "1px solid rgba(147,197,253,0.28)",
                color: "#dbeafe",
                fontSize: "11px",
                fontWeight: 800,
              }}
            >
              {Array.isArray(archivosLegajo) ? archivosLegajo.length : 0}
            </div>
          </div>

          {loadingArchivos ? (
            <div style={historyPlaceholderStyle}>Cargando archivos...</div>
          ) : Array.isArray(archivosLegajo) && archivosLegajo.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {archivosLegajo.map((file) => (
                <div
                  key={file.id}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid rgba(148,163,184,0.12)",
                    background: "rgba(3, 11, 24, 0.42)",
                    padding: "13px 14px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "14px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "#f8fbff",
                        marginBottom: "5px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.nombre_archivo || "Archivo sin nombre"}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        fontSize: "12px",
                        color: "rgba(214,228,245,0.70)",
                      }}
                    >
                      <span>{getCategoriaArchivoLabel(file.categoria)}</span>
                      <span>·</span>
                      <span>{formatFileSize(file.size_bytes)}</span>
                      <span>·</span>
                      <span>
                        {formatDate(file.created_at) || "Fecha no informada"}
                      </span>
                    </div>
                  </div>

                  <div
  style={{
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "flex-end",
  }}
>
  <button
    type="button"
    onClick={() => onAbrirArchivo(file)}
    style={{
      height: "36px",
      padding: "0 12px",
      borderRadius: "11px",
      border: "1px solid rgba(148,163,184,0.18)",
      background: "rgba(255,255,255,0.04)",
      color: "#dbeafe",
      fontSize: "12px",
      fontWeight: 800,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    Abrir
  </button>

  {isAdmin && (
    <button
      type="button"
      onClick={() => onEliminarArchivo(file)}
      style={{
        height: "36px",
        padding: "0 12px",
        borderRadius: "11px",
        border: "1px solid rgba(248,113,113,0.28)",
        background: "rgba(127,29,29,0.22)",
        color: "#fecaca",
        fontSize: "12px",
        fontWeight: 800,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Eliminar
    </button>
  )}
</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={historyPlaceholderStyle}>
              Todavía no hay archivos cargados para este legajo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FichaImpresion({
  row,
  observacionesInforme = [],
  vehiculosNominal = [],
  onPrintResumen,
  onPrintInforme,
  onPrintDominio,
  onPrintFranquiciado,
  onPrintGarante,
  onPrintHistorial,
  onPrintTrazabilidad,
}) {
  const informeTipoKey = (row?.type || "").toString().trim();

  const esInformeSobreDominio =
    informeTipoKey === "informe_dominio" ||
    informeTipoKey === "certificado_dominio";

  const esInformeNominal =
    informeTipoKey === "informe_nominal" ||
    informeTipoKey === "indice_titularidad";

  const esAnotacionesPersonales =
    informeTipoKey === "anotaciones_personales";

  const personaConsultada =
    row?.titular_dominio ||
    row?.identificacion_nombre ||
    row?.titular_razon_social ||
    `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim();

  const tituloCentroImpresion = esInformeSobreDominio
    ? row?.dominio || getInformeTipoLabel(row?.type)
    : personaConsultada || getInformeTipoLabel(row?.type) || "Informe";

  const textoResumen = esInformeNominal
    ? `Resumen completo con persona consultada, estado, resultado, franquiciado y ${
        Array.isArray(vehiculosNominal)
          ? `${vehiculosNominal.length} vehículo/s informado/s.`
          : "vehículos informados."
      }`
    : esAnotacionesPersonales
    ? `Resumen completo con persona consultada, estado, resultado, franquiciado y ${
        Array.isArray(observacionesInforme)
          ? `${observacionesInforme.length} observación/es cargada/s.`
          : "observaciones registrales."
      }`
    : "Resumen completo con datos principales, dominio, estado, resultado, franquiciado y titular del dominio.";

  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Printer size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Centro de impresión</div>

          <h2 style={credentialNameStyle}>
            {tituloCentroImpresion}
          </h2>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "14px",
        }}
      >
        <button
          type="button"
          onClick={onPrintResumen}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>Imprimir resumen del informe</div>
          <div style={printOptionTextStyle}>{textoResumen}</div>
        </button>

        <button
          type="button"
          onClick={onPrintInforme}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>Imprimir ficha Informe</div>
          <div style={printOptionTextStyle}>
            Carátula breve: tipo de informe, estado operativo, resultado, fecha del pedido,
            persona consultada, tienda y franquiciado.
          </div>
        </button>

        {esInformeSobreDominio && (
          <button
            type="button"
            onClick={onPrintDominio}
            style={printOptionStyle}
          >
            <div style={printOptionTitleStyle}>Imprimir ficha Dominio</div>
            <div style={printOptionTextStyle}>
              Datos identificatorios del automotor, motor, chasis, radicación y registro interviniente.
            </div>
          </button>
        )}

        {esInformeNominal && (
          <button
            type="button"
            onClick={onPrintDominio}
            style={printOptionStyle}
          >
            <div style={printOptionTitleStyle}>Imprimir vehículos informados</div>
            <div style={printOptionTextStyle}>
              Listado de vehículos informados por el informe nominal.{" "}
              {Array.isArray(vehiculosNominal)
                ? `${vehiculosNominal.length} vehículo/s cargado/s.`
                : ""}
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={onPrintGarante}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>
            {esInformeSobreDominio
              ? "Imprimir titular del dominio"
              : "Imprimir persona consultada"}
          </div>

          <div style={printOptionTextStyle}>
            {esInformeSobreDominio
              ? "Datos del titular vinculado al dominio informado."
              : "Datos de la persona o razón social consultada en el informe."}
          </div>
        </button>

        <button
          type="button"
          onClick={onPrintFranquiciado}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>Imprimir ficha Franquiciado</div>
          <div style={printOptionTextStyle}>
            Tienda, franquiciado, CUIT y datos complementarios cargados por SAKI.
          </div>
        </button>

        <button
          type="button"
          onClick={onPrintHistorial}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>Imprimir historial</div>
          <div style={printOptionTextStyle}>
            Movimientos del trámite, cambios de estado, archivos, observaciones y operaciones registradas.
          </div>
        </button>

        <button
          type="button"
          onClick={onPrintTrazabilidad}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>Imprimir trazabilidad</div>
          <div style={printOptionTextStyle}>
            Línea operativa del trámite con hitos, fechas, estado actual y resultado del circuito.
          </div>
        </button>
      </div>
    </div>
  );
}

function FichaInforme({
  row,
  observacionesInforme = [],
  loadingObservacionesInforme = false,
}) {
  const estado = row?.status || row?.estado || "Por completar";
  const resultado = row?.result || "Pendiente";

  const informeTipoKey = (row?.type || "").toString().trim();

  const esInformeSobreDominio =
    informeTipoKey === "informe_dominio" ||
    informeTipoKey === "certificado_dominio";

  const personaInformeLabel = esInformeSobreDominio
    ? "Titular del dominio"
    : "Persona consultada";

  const personaInformeNombre =
    row?.titular_dominio ||
    row?.identificacion_nombre ||
    row?.titular_razon_social ||
    `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim() ||
    "Por completar";

  const personaInformeDocumento =
    row?.titular_cuit ||
    row?.titular_cuil_cuit ||
    row?.identificacion_cuit ||
    row?.identificacion_dni ||
    row?.titular_dni ||
    "Por completar";

  const resultadoKey = (resultado || "").toString().trim().toUpperCase();

  const tieneObservacion =
    resultadoKey === "OBSERVADO" ||
    row?.observed_status ||
    row?.observed_other ||
    row?.observed_amount ||
    (Array.isArray(observacionesInforme) && observacionesInforme.length > 0);

  const getTipoObservacionLabel = (value) => {
    const key = (value || "").toString().trim();

    if (key === "prenda") return "Prenda";
    if (key === "embargo") return "Embargo";
    if (key === "inhibicion") return "Inhibición";
    if (key === "medida_cautelar") return "Medida cautelar";
    if (key === "otro") return "Otro";

    return key || "Observación";
  };

  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <ShieldCheck size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Ficha del informe</div>

          <h2 style={credentialNameStyle}>
            {getInformeTipoLabel(row?.type)}
          </h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato
  label="Tipo de informe"
  value={getInformeTipoLabel(row?.type)}
/>

<FichaDato
  label="Tienda"
  value={row?.tienda || "Por completar"}
/>

<FichaDato
  label="Dominio"
  value={row?.dominio || "Por completar"}
/>

<FichaDato
  label="Fecha del pedido"
  value={
    formatDate(row?.fecha_pedido_real || row?.created_at) ||
    "Por completar"
  }
/>

<FichaDato
  label="Fecha de entrega"
  value={
    formatDate(
      row?.fecha_entrega_real ||
        row?.datos_legajo_actualizado_en ||
        row?.updated_at
    ) || "Por completar"
  }
/>

<FichaDato
  label="Estado operativo / Resultado"
  value={`${estado || "Por completar"} / ${resultado || "Pendiente"}`}
/>

<FichaDato
  label="Franquiciado"
  value={
    row?.franquiciado ||
    row?.frq_razon_social ||
    `${row?.frq_apellido || ""} ${row?.frq_nombres || ""}`.trim() ||
    row?.frq ||
    "Por completar"
  }
/>

<FichaDato
  label="CUIT FRQ"
  value={
    row?.frq_cuit ||
    "Por completar"
  }
/>

<div />

<FichaDato
  label={personaInformeLabel}
  value={personaInformeNombre}
/>

<FichaDato
  label="CUIT titular"
  value={personaInformeDocumento}
/>
          {tieneObservacion && (
          <div
            style={{
              gridColumn: "1 / -1",
              marginTop: "10px",
              paddingTop: "18px",
              borderTop: "1px solid rgba(148,163,184,0.14)",
            }}
          >
            <div
              style={{
                color: "#93c5fd",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              Detalle de observación
            </div>

            {loadingObservacionesInforme ? (
              <div style={historyPlaceholderStyle}>
                Cargando observaciones del informe...
              </div>
            ) : Array.isArray(observacionesInforme) &&
              observacionesInforme.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {observacionesInforme.map((obs, index) => (
                  <div
  key={obs.id || index}
  style={{
    borderRadius: "18px",
    border: "1px solid rgba(245, 158, 11, 0.34)",
    background:
      "linear-gradient(180deg, rgba(120, 70, 18, 0.20), rgba(3,18,34,0.62))",
    padding: "14px",
  }}
>
  <div
    style={{
      color: "#fcd34d",
      fontSize: "12px",
      fontWeight: 900,
      letterSpacing: "0.10em",
      textTransform: "uppercase",
      marginBottom: "12px",
    }}
  >
                      Observación {index + 1} ·{" "}
                      {getTipoObservacionLabel(obs?.tipo_observacion)}
                    </div>

                    <div style={credentialInfoGridStyle}>
                      <FichaDato
                        label="Tipo"
                        value={getTipoObservacionLabel(obs?.tipo_observacion)}
                      />

                      {obs?.tipo_medida && (
                        <FichaDato
                          label="Tipo de medida"
                          value={obs.tipo_medida}
                        />
                      )}

                      {obs?.acreedor && (
                        <FichaDato
                          label="Acreedor"
                          value={obs.acreedor}
                        />
                      )}

                      {obs?.grado && (
                        <FichaDato
                          label="Grado"
                          value={obs.grado}
                        />
                      )}

                      {obs?.juzgado && (
                        <FichaDato
                          label="Juzgado"
                          value={obs.juzgado}
                        />
                      )}

                      {obs?.actor && (
                        <FichaDato
                          label="Actor"
                          value={obs.actor}
                        />
                      )}

                      {obs?.expediente && (
                        <FichaDato
                          label="Expediente"
                          value={obs.expediente}
                        />
                      )}

                      {obs?.fecha_contrato && (
                        <FichaDato
                          label="Fecha contrato"
                          value={formatDate(obs.fecha_contrato)}
                        />
                      )}

                      {obs?.fecha_inscripcion && (
                        <FichaDato
                          label="Fecha inscripción"
                          value={formatDate(obs.fecha_inscripcion)}
                        />
                      )}

                      {obs?.monto && (
                        <FichaDato
                          label="Monto"
                          value={obs.monto}
                        />
                      )}

                      {obs?.estado && (
                        <FichaDato
                          label="Estado"
                          value={obs.estado}
                        />
                      )}

                      {obs?.observacion && (
                        <FichaDato
                          label="Observación"
                          value={obs.observacion}
                          wide
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={credentialInfoGridStyle}>
                <FichaDato
                  label="Estado observado"
                  value={row?.observed_status || "Observado"}
                />

                <FichaDato
                  label="Fecha observación"
                  value={formatDate(row?.observed_date) || "Por completar"}
                />

                <FichaDato
                  label="Monto observado"
                  value={row?.observed_amount || "Por completar"}
                />

                <FichaDato
                  label="Detalle / otros"
                  value={row?.observed_other || "Sin detalle cargado"}
                  wide
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FichaHistorial({ row, historyRows }) {
  const getHistoryTitle = (item) => {
    if (item?.tipo_evento === "archivo_subido") {
      return "Archivo agregado al legajo";
    }

    if (item?.tipo_evento === "archivo_eliminado") {
      return "Archivo eliminado del legajo";
    }

    if (item?.tipo_evento === "datos_informe_actualizados") {
      return "Datos del informe actualizados";
    }

    if (item?.tipo_evento === "datos_legajo_actualizados") {
      return "Datos del legajo actualizados";
    }

    if (item?.tipo_evento === "carga_inicial") {
      return "Solicitud inicial del informe";
    }

    if (item?.tipo_evento === "informe_en_curso") {
      return "Informe en gestión";
    }

    if (item?.tipo_evento === "informe_entregado") {
      return "Informe entregado";
    }

    if (item?.tipo_evento === "informe_observado") {
      return "Informe observado";
    }

    if (item?.tipo_evento === "informe_anulado") {
      return "Informe anulado";
    }

    return item?.titulo || item?.title || "Movimiento del legajo";
  };

  const formatHistoryDetail = (item) => {
    const detalle = item?.detalle;

    if (item?.tipo_evento === "archivo_subido" && detalle) {
      const categoria =
        detalle?.categoria_label ||
        getCategoriaArchivoLabel(detalle?.categoria) ||
        "categoría no informada";

      const nombreArchivo = detalle?.nombre_archivo || "archivo sin nombre";

      return `Archivo agregado al legajo. Categoría: ${categoria}. Archivo: ${nombreArchivo}.`;
    }

    if (item?.tipo_evento === "archivo_eliminado" && detalle) {
      const categoria =
        detalle?.categoria_label ||
        getCategoriaArchivoLabel(detalle?.categoria) ||
        "categoría no informada";

      const nombreArchivo = detalle?.nombre_archivo || "archivo sin nombre";

      return `Archivo eliminado del legajo. Categoría: ${categoria}. Archivo: ${nombreArchivo}.`;
    }

    if (item?.tipo_evento === "datos_informe_actualizados" && detalle) {
      const secciones = Array.isArray(detalle?.secciones)
        ? detalle.secciones.join(", ")
        : "datos administrativos";

      const titularidad =
        detalle?.titularidad_total !== null &&
        detalle?.titularidad_total !== undefined
          ? ` Titularidad total: ${detalle.titularidad_total}%.`
          : "";

      return `SAKI actualizó información del informe: ${secciones}.${titularidad}`;
    }

    if (item?.tipo_evento === "datos_legajo_actualizados" && detalle) {
      const secciones = Array.isArray(detalle?.secciones)
        ? detalle.secciones.join(", ")
        : "datos administrativos";

      return `SAKI actualizó información del legajo: ${secciones}.`;
    }

    if (item?.tipo_evento === "carga_inicial") {
      return "Día cargó la solicitud inicial del informe en el portal.";
    }

    if (item?.tipo_evento === "informe_en_curso") {
      return "SAKI tomó intervención y el informe pasó a estar en gestión.";
    }

    if (item?.tipo_evento === "informe_entregado") {
      return "El informe fue entregado y quedó disponible para consulta.";
    }

if (item?.tipo_evento === "informe_observado") {
  if (item?.detalle_texto) {
    return item.detalle_texto;
  }

  if (Array.isArray(detalle?.observaciones) && detalle.observaciones.length > 0) {
    const resumen = detalle.observaciones
      .map((obs, index) => {
        const tipo =
          obs?.tipo_observacion === "prenda"
            ? "Prenda"
            : obs?.tipo_observacion === "embargo"
            ? "Embargo"
            : obs?.tipo_observacion === "inhibicion"
            ? "Inhibición"
            : obs?.tipo_observacion === "medida_cautelar"
            ? "Medida cautelar"
            : "Otro";

        const partes = [
          tipo,
          obs?.tipo_medida,
          obs?.acreedor ? `Acreedor: ${obs.acreedor}` : "",
          obs?.juzgado ? `Juzgado: ${obs.juzgado}` : "",
          obs?.actor ? `Actor: ${obs.actor}` : "",
          obs?.expediente ? `Expediente: ${obs.expediente}` : "",
          obs?.fecha_inscripcion ? `Fecha inscripción: ${obs.fecha_inscripcion}` : "",
          obs?.monto ? `Monto: ${obs.monto}` : "",
          obs?.estado ? `Estado: ${obs.estado}` : "",
        ].filter(Boolean);

        return `${index + 1}. ${partes.join(" · ")}`;
      })
      .join(" | ");

    return `Informe entregado con resultado observado. ${resumen}`;
  }

  const observacion =
    detalle?.observacion ||
    detalle?.observed_status ||
    detalle?.observed_other ||
    detalle?.motivo ||
    "sin detalle adicional cargado";

  return `El informe fue entregado con observación: ${observacion}.`;
}

    if (item?.tipo_evento === "informe_anulado") {
      const motivo =
        detalle?.motivo_anulacion ||
        detalle?.motivo ||
        "motivo no informado";

      return `La solicitud fue anulada. Motivo: ${motivo}.`;
    }

    if (typeof detalle === "string" && detalle.trim()) {
      return detalle;
    }

    if (item?.detalle_texto) {
      return item.detalle_texto;
    }

    if (item?.descripcion) {
      return item.descripcion;
    }

    if (item?.observacion) {
      return item.observacion;
    }

    return "Movimiento registrado en el legajo.";
  };

  const handleImprimirHistorial = () => {
    const escapeHtml = (value) =>
      String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const movimientos =
      Array.isArray(historyRows) && historyRows.length > 0
        ? historyRows
            .map(
              (item) => `
                <div class="item">
                  <div class="meta">${escapeHtml(formatDate(item.created_at))} · ${escapeHtml(
                getHistoryTitle(item)
              )}</div>
                  <div class="detalle">${escapeHtml(formatHistoryDetail(item))}</div>
                  ${
                    item?.created_by_email
                      ? `<div class="usuario">Usuario: ${escapeHtml(item.created_by_email)}</div>`
                      : ""
                  }
                </div>
              `
            )
            .join("")
        : `<div class="empty">No hay movimientos históricos cargados.</div>`;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Historial - ${escapeHtml(row?.dominio || "Legajo")}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #111827;
            }

            h1 {
              margin: 0 0 6px;
              font-size: 24px;
            }

            .sub {
              margin-bottom: 28px;
              color: #4b5563;
              font-size: 13px;
            }

            .item {
              padding: 14px 0;
              border-bottom: 1px solid #e5e7eb;
            }

            .meta {
              font-size: 15px;
              font-weight: 700;
              margin-bottom: 6px;
            }

            .detalle {
              font-size: 13px;
              line-height: 1.5;
              color: #374151;
            }

            .usuario {
              margin-top: 5px;
              font-size: 12px;
              color: #6b7280;
            }

            .empty {
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>

        <body>
          <h1>Historial del informe</h1>
          <div class="sub">
            Dominio: ${escapeHtml(row?.dominio || "Por completar")}
          </div>

          ${movimientos}

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div style={credentialStyle}>
      <div
        style={{
          ...credentialTopStyle,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          <div style={avatarStyle}>
            <Clock3 size={34} />
          </div>

          <div>
            <div style={credentialKickerStyle}>Historial del informe</div>

<h2 style={credentialNameStyle}>
  {row?.dominio || getInformeTipoLabel(row?.type) || "Informe"}
</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={handleImprimirHistorial}
          style={{
            height: "40px",
            padding: "0 14px",
            borderRadius: "11px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.04)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Imprimir historial
        </button>
      </div>

      <div style={credentialInfoGridStyle}>
        {Array.isArray(historyRows) && historyRows.length > 0 ? (
          historyRows.map((item) => (
            <div key={item.id} style={historyItemCardStyle}>
              <div style={historyItemHeaderStyle}>
                {formatDate(item.created_at)} · {getHistoryTitle(item)}
              </div>

              <div style={historyItemDetailStyle}>
                {formatHistoryDetail(item)}
              </div>

              {item?.created_by_email && (
                <div style={historyItemUserStyle}>
                  Usuario: {item.created_by_email}
                </div>
              )}
            </div>
          ))
        ) : (
          <FichaDato
            label="Historial"
            value="No hay movimientos históricos cargados todavía."
            wide
          />
        )}
      </div>
    </div>
  );
}

function FichaTrazabilidad({ row, observacionesInforme = [] }) {
  const fecha = (value) => {
    if (!value) return null;
    return formatDate(value);
  };

  const limpiarItems = (items) => items.filter((item) => item?.value);

  const etapas = [
  {
    titulo: "Solicitud del informe",
    tag: "Inicio",
    tone: "amber",
    items: limpiarItems([
      {
        label: "Pedido creado por Día",
        value: fecha(row?.fecha_pedido_real || row?.created_at),
        note: row?.requester_email
          ? `Solicitado por ${row.requester_email}`
          : null,
      },
    ]),
  },
  {
    titulo: "Gestión SAKI",
    tag: "Gestión",
    tone: "blue",
    items: limpiarItems([
      {
        label: "Estado actual",
        value: row?.status || row?.estado || null,
      },
      {
  label: "Datos del legajo actualizados",
  value: fecha(
    row?.fecha_entrega_real ||
      row?.datos_legajo_actualizado_en ||
      row?.updated_at
  ),
},
    ]),
  },
  {
    titulo: "Resultado del informe",
    tag: "Resultado",
    tone:
      row?.status === "ANULADO"
        ? "red"
        : row?.result === "OBSERVADO"
        ? "red"
        : row?.status === "ENTREGADO"
        ? "green"
        : "blue",
    items: limpiarItems([
      {
        label: "Resultado",
        value: row?.result || null,
      },
{
  label: "Detalle observado",
  value:
    (row?.result || "").toString().toUpperCase() === "OBSERVADO" &&
    Array.isArray(observacionesInforme) &&
    observacionesInforme.length > 0
      ? `${observacionesInforme.length} observación/es cargada/s`
      : null,
  note:
    (row?.result || "").toString().toUpperCase() === "OBSERVADO" &&
    Array.isArray(observacionesInforme) &&
    observacionesInforme.length > 0
      ? observacionesInforme
          .map((obs, index) => {
            const tipo =
              obs?.tipo_observacion === "prenda"
                ? "Prenda"
                : obs?.tipo_observacion === "embargo"
                ? "Embargo"
                : obs?.tipo_observacion === "inhibicion"
                ? "Inhibición"
                : obs?.tipo_observacion === "medida_cautelar"
                ? "Medida cautelar"
                : "Otro";

            return `${index + 1}. ${tipo}${
              obs?.estado ? ` · ${obs.estado}` : ""
            }${obs?.monto ? ` · ${obs.monto}` : ""}`;
          })
          .join(" | ")
      : null,
},

      {
        label: "Fecha de observación",
        value: fecha(row?.observed_date),
        note:
          row?.observed_status ||
          row?.observed_other ||
          null,
      },
      {
        label: "Monto observado",
        value: row?.observed_amount
          ? `$ ${row.observed_amount}`
          : null,
      },
    ]),
  },
  {
    titulo: "Cierre operativo",
    tag: "Cierre",
    tone: row?.status === "ANULADO" ? "red" : "green",
    items: limpiarItems([
      {
        label: "Informe entregado",
        value: row?.status === "ENTREGADO" ? "Entregado" : null,
      },
      {
        label: "Informe anulado",
        value: row?.status === "ANULADO" ? "Anulado" : null,
      },
    ]),
  },
].filter((etapa) => etapa.items.length > 0);

  const handleImprimirTrazabilidad = () => {
  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const bloques = etapas
    .map(
      (etapa, index) => `
        <div class="etapa">
          <div class="numero">${index + 1}</div>
          <div class="contenido">
            <div class="head">
              <h2>${escapeHtml(etapa.titulo)}</h2>
              <span>${escapeHtml(etapa.tag)}</span>
            </div>

            ${etapa.items
              .map(
                (item) => `
                  <div class="item">
                    <div>
                      <strong>${escapeHtml(item.label)}</strong>
                      ${
                        item.note
                          ? `<p>${escapeHtml(item.note)}</p>`
                          : ""
                      }
                    </div>
                    <b>${escapeHtml(item.value)}</b>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `
    )
    .join("");

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Trazabilidad - ${escapeHtml(row?.dominio || "Legajo")}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 32px;
            color: #111827;
          }

          h1 {
            margin: 0 0 6px;
            font-size: 24px;
          }

          .sub {
            margin-bottom: 28px;
            color: #4b5563;
            font-size: 13px;
          }

          .etapa {
            display: grid;
            grid-template-columns: 34px 1fr;
            gap: 14px;
            margin-bottom: 18px;
          }

          .numero {
            width: 28px;
            height: 28px;
            border-radius: 999px;
            background: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
          }

          .contenido {
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            padding: 16px;
          }

          .head {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: center;
            margin-bottom: 12px;
          }

          h2 {
            margin: 0;
            font-size: 17px;
          }

          .head span {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: #4b5563;
          }

          .item {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px;
            padding: 9px 0;
            border-top: 1px solid #e5e7eb;
          }

          .item strong {
            font-size: 13px;
            font-weight: 600;
          }

          .item p {
            margin: 4px 0 0;
            font-size: 12px;
            color: #6b7280;
          }

          .item b {
            font-size: 13px;
            white-space: nowrap;
          }
        </style>
      </head>

      <body>
        <h1>Trazabilidad operativa</h1>
        <div class="sub">
          Dominio: ${escapeHtml(row?.dominio || "Por completar")}
        </div>

        ${bloques}

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

  return (
    <div style={credentialStyle}>
      <div
  style={{
    ...credentialTopStyle,
    justifyContent: "space-between",
  }}
>
  <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
    <div style={avatarStyle}>
      <Clock3 size={34} />
    </div>

    <div>
      <div style={credentialKickerStyle}>Trazabilidad operativa</div>

      <h2 style={credentialNameStyle}>
        {row?.dominio || "Legajo por completar"}
      </h2>
    </div>
  </div>

  <button
    type="button"
    onClick={handleImprimirTrazabilidad}
    style={{
      height: "40px",
      padding: "0 14px",
      borderRadius: "11px",
      border: "1px solid rgba(148,163,184,0.18)",
      background: "rgba(255,255,255,0.04)",
      color: "#dbeafe",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    Imprimir trazabilidad
  </button>
</div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          marginTop: "6px",
        }}
      >
        {etapas.map((etapa, index) => (
          <TrazabilidadEtapa
            key={etapa.titulo}
            etapa={etapa}
            index={index}
            last={index === etapas.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function TrazabilidadEtapa({ etapa, index, last }) {
  const tone = getTrazabilidadTone(etapa.tone);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "42px 1fr",
        gap: "14px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {!last && (
          <div
            style={{
              position: "absolute",
              top: "34px",
              bottom: "-20px",
              width: "1px",
              background: "rgba(148,163,184,0.18)",
            }}
          />
        )}

        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "999px",
            background: tone.bg,
            border: `1px solid ${tone.border}`,
            boxShadow: tone.shadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: tone.color,
            fontSize: "12px",
            fontWeight: 900,
            zIndex: 1,
          }}
        >
          {index + 1}
        </div>
      </div>

      <div
        style={{
          borderRadius: "20px",
          border: `1px solid ${tone.softBorder}`,
          background:
            "linear-gradient(180deg, rgba(7,31,58,0.72) 0%, rgba(3,18,34,0.58) 100%)",
          padding: "16px 18px",
          boxShadow: "0 18px 42px rgba(0,0,0,0.14)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            alignItems: "flex-start",
            marginBottom: "14px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 850,
                color: "#f8fbff",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
              }}
            >
              {etapa.titulo}
            </div>
          </div>

          <div
            style={{
              minHeight: "24px",
              padding: "0 10px",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              background: tone.bg,
              border: `1px solid ${tone.border}`,
              color: tone.color,
              fontSize: "10px",
              fontWeight: 850,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {etapa.tag}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {etapa.items.map((item) => (
            <TrazabilidadEvento key={item.label} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrazabilidadEvento({ item }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(180px, 1fr) auto",
        gap: "14px",
        alignItems: "start",
        paddingBottom: "10px",
        borderBottom: "1px solid rgba(148,163,184,0.09)",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "13px",
            color: "rgba(214,228,245,0.84)",
            lineHeight: 1.35,
          }}
        >
          {item.label}
        </div>

        {item.note && (
          <div
            style={{
              marginTop: "4px",
              fontSize: "12px",
              color: "rgba(168,184,202,0.72)",
              lineHeight: 1.4,
            }}
          >
            {item.note}
          </div>
        )}
      </div>

      <div
  style={{
    fontSize: "13px",
    color: "rgba(226,237,249,0.78)",
    fontWeight: 600,
    lineHeight: 1.35,
    whiteSpace: "nowrap",
    textAlign: "right",
  }}
>
  {item.value}
</div>
    </div>
  );
}

function getTrazabilidadTone(tone) {
  if (tone === "green") {
    return {
      bg: "rgba(16,185,129,0.14)",
      border: "rgba(52,211,153,0.36)",
      softBorder: "rgba(52,211,153,0.18)",
      color: "#a7f3d0",
      shadow: "0 10px 24px rgba(16,185,129,0.14)",
    };
  }

  if (tone === "amber") {
    return {
      bg: "rgba(245,158,11,0.15)",
      border: "rgba(251,191,36,0.38)",
      softBorder: "rgba(251,191,36,0.18)",
      color: "#fde68a",
      shadow: "0 10px 24px rgba(245,158,11,0.14)",
    };
  }

  if (tone === "red") {
    return {
      bg: "rgba(239,68,68,0.14)",
      border: "rgba(248,113,113,0.38)",
      softBorder: "rgba(248,113,113,0.18)",
      color: "#fecaca",
      shadow: "0 10px 24px rgba(239,68,68,0.14)",
    };
  }

  return {
    bg: "rgba(37,99,235,0.16)",
    border: "rgba(96,165,250,0.38)",
    softBorder: "rgba(96,165,250,0.18)",
    color: "#dbeafe",
    shadow: "0 10px 24px rgba(37,99,235,0.14)",
  };
}

function FichaDominio({
  row,
  vehiculosNominal = [],
  loadingVehiculosNominal = false,
}) {
  const informeTipoKey = (row?.type || "").toString().trim();

  const dominioNoAplica =
    informeTipoKey === "anotaciones_personales";

  const esInformeNominal =
    informeTipoKey === "informe_nominal" ||
    informeTipoKey === "indice_titularidad";

  const getCondicionTitularLabel = (value) => {
    if (value === "titular_actual") return "Titular actual";
    if (value === "titular_historico") return "Titular histórico";
    return value || "Por completar";
  };

  if (dominioNoAplica) {
    return (
      <div
        style={{
          ...credentialStyle,
          opacity: 0.58,
          filter: "grayscale(0.25)",
        }}
      >
        <div style={credentialTopStyle}>
          <div style={avatarStyle}>
            <Car size={34} />
          </div>

          <div>
            <div style={credentialKickerStyle}>Dominio</div>

            <h2 style={credentialNameStyle}>
              No aplica
            </h2>
          </div>
        </div>

        <div style={credentialInfoGridStyle}>
          <FichaDato
            label="Estado"
            value="No aplica"
          />

          <FichaDato
            label="Motivo"
            value="Informe sobre persona"
          />

          <FichaDato
            label="Tipo de informe"
            value={getInformeTipoLabel(row?.type)}
          />

          <FichaDato
            label="Aclaración"
            value="Este tipo de informe no se solicita sobre un dominio automotor."
            wide
          />
        </div>
      </div>
    );
  }

  if (esInformeNominal) {
    return (
      <div style={credentialStyle}>
        <div style={credentialTopStyle}>
          <div style={avatarStyle}>
            <Car size={34} />
          </div>

          <div>
            <div style={credentialKickerStyle}>Informe nominal</div>

            <h2 style={credentialNameStyle}>
              Vehículos informados
            </h2>
          </div>
        </div>

        <div style={credentialInfoGridStyle}>
          {loadingVehiculosNominal ? (
            <FichaDato
              label="Vehículos"
              value="Cargando vehículos informados..."
              wide
            />
          ) : Array.isArray(vehiculosNominal) &&
            vehiculosNominal.length > 0 ? (
            vehiculosNominal.map((vehiculo, index) => (
              <div
                key={vehiculo.id || index}
                style={{
                  gridColumn: "1 / -1",
                  border: "1px solid rgba(96,165,250,0.18)",
                  borderRadius: "18px",
                  background:
                    "linear-gradient(180deg, rgba(7,31,58,0.72), rgba(3,18,34,0.58))",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    color: "#93c5fd",
                    fontSize: "12px",
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  {getCondicionTitularLabel(vehiculo?.condicion_titular)}
                </div>

                <div style={credentialInfoGridStyle}>
                  <FichaDato
                    label="Dominio"
                    value={vehiculo?.dominio || "Por completar"}
                  />

                  <FichaDato
                    label="Marca"
                    value={vehiculo?.marca || "Por completar"}
                  />

                  <FichaDato
                    label="Modelo"
                    value={vehiculo?.modelo || "Por completar"}
                  />

                  <FichaDato
                    label="Tipo"
                    value={vehiculo?.tipo || "Por completar"}
                  />

                  <FichaDato
                    label="Año modelo"
                    value={vehiculo?.modelo_anio || "Por completar"}
                  />

                  <FichaDato
                    label="Registro seccional"
                    value={vehiculo?.registro_seccional || "Por completar"}
                  />

                  <FichaDato
                    label="Titular"
                    value={vehiculo?.titular || "Por completar"}
                  />

                  <FichaDato
                    label="CUIT / DNI"
                    value={vehiculo?.documento_titular || "Por completar"}
                  />

                  <FichaDato
                    label="% titular"
                    value={vehiculo?.porcentaje_titular || "Por completar"}
                  />

                  <FichaDato
                    label="Fecha titular"
                    value={vehiculo?.fecha_titular || "Por completar"}
                  />

                  {vehiculo?.observacion && (
                    <FichaDato
                      label="Observación"
                      value={vehiculo.observacion}
                      wide
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <FichaDato
              label="Vehículos informados"
              value="Todavía no hay vehículos cargados para este informe nominal."
              wide
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Car size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Ficha técnica del dominio</div>

          <h2 style={credentialNameStyle}>
            {row?.dominio || "Dominio por completar"}
          </h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato label="Dominio" value={row?.dominio || "Por completar"} />

        <FichaDato
  label="Titular"
  value={
    row?.titular_dominio ||
    row?.identificacion_nombre ||
    row?.titular_razon_social ||
    `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim() ||
    "Por completar"
  }
/>

<FichaDato
  label="CUIT / DNI"
  value={
    row?.titular_cuit ||
    row?.titular_cuil_cuit ||
    row?.identificacion_cuit ||
    row?.identificacion_dni ||
    row?.titular_dni ||
    "Por completar"
  }
/>

        <FichaDato
          label="Marca"
          value={row?.marca || row?.vehiculo_marca || "Por completar"}
        />

        <FichaDato
          label="Modelo"
          value={row?.modelo || row?.vehiculo_modelo || "Por completar"}
        />

        <FichaDato
          label="Tipo"
          value={row?.tipo || row?.vehiculo_tipo || "Por completar"}
        />

        <FichaDato
          label="Marca motor"
          value={row?.marca_motor || "Por completar"}
        />

        <FichaDato
          label="N° motor"
          value={row?.numero_motor || row?.motor_numero || "Por completar"}
        />

        <FichaDato
          label="Marca chasis"
          value={row?.marca_chasis || "Por completar"}
        />

        <FichaDato
          label="N° chasis"
          value={row?.numero_chasis || row?.chasis_numero || "Por completar"}
        />

        <FichaDato
          label="Modelo año"
          value={row?.modelo_anio || row?.anio_modelo || "Por completar"}
        />

        <FichaDato
          label="Radicación"
          value={row?.radicacion || "Por completar"}
        />

        <FichaDato
          label="Registro interviniente"
          value={row?.registro_interviniente || "Por completar"}
        />
      </div>
    </div>
  );
}

function FichaFrq({ row }) {
  const nombreFranquiciado =
    row?.frq_razon_social ||
    row?.franquiciado ||
    row?.frq ||
    row?.identificacion_nombre ||
    "Por completar";

  const cuitFranquiciado =
    row?.frq_cuit ||
    row?.cuit ||
    row?.identificacion_cuit ||
    "Por completar";

  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Store size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Franquiciado</div>

          <h2 style={credentialNameStyle}>
            {nombreFranquiciado}
          </h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato
          label="Nombre / Razón social"
          value={nombreFranquiciado}
        />

        <FichaDato
          label="CUIT"
          value={formatCuit(cuitFranquiciado) || cuitFranquiciado}
        />

        <FichaDato
          label="Tienda"
          value={row?.tienda || "Por completar"}
        />

        <FichaDato
          label="Mail"
          value={row?.frq_email || row?.frq_mail || "Por completar"}
        />

        <FichaDato
          label="Teléfono"
          value={row?.frq_telefono || "Por completar"}
        />

        <FichaDato
          label="Domicilio"
          value={row?.frq_domicilio || "Por completar"}
          wide
        />
      </div>
    </div>
  );
}

function FichaGarante({ row, titularInformeLabel = "Persona consultada" }) {
      const informeTipoKey = (row?.type || "").toString().trim();

const esInformeSobreDominio =
  titularInformeLabel === "Titular del dominio" &&
  (
    informeTipoKey === "informe_dominio" ||
    informeTipoKey === "certificado_dominio"
  );

  const nombrePersonaConsultada =
    row?.titular_dominio ||
    row?.identificacion_nombre ||
    row?.titular_razon_social ||
    `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim() ||
    "Por completar";

  const documentoPersonaConsultada =
    row?.titular_cuit ||
    row?.titular_cuil_cuit ||
    row?.identificacion_cuit ||
    row?.identificacion_dni ||
    row?.titular_dni ||
    "Por completar";

  if (!esInformeSobreDominio) {
    return (
      <div style={credentialStyle}>
        <div style={credentialTopStyle}>
          <div style={avatarStyle}>
            <UserRound size={34} />
          </div>

          <div>
            <div style={credentialKickerStyle}>{titularInformeLabel}</div>
            <h2 style={credentialNameStyle}>{nombrePersonaConsultada}</h2>
          </div>
        </div>

        <div style={credentialInfoGridStyle}>
          <FichaDato
            label="Nombre"
            value={nombrePersonaConsultada}
          />

          <FichaDato
            label="CUIT / DNI"
            value={documentoPersonaConsultada}
          />

          <FichaDato
            label="Tipo de informe"
            value={getInformeTipoLabel(row?.type)}
          />

          <FichaDato
            label="Aclaración"
            value="Esta ficha identifica a la persona o razón social consultada en el informe."
            wide
          />
        </div>
      </div>
    );
  }

  const parsePercent = (value) => {
    if (value === null || value === undefined || value === "") return null;

    const parsed = Number(String(value).replace(",", "."));

    return Number.isNaN(parsed) ? null : parsed;
  };

  const formatPercent = (value) => {
    const parsed = parsePercent(value);

    if (parsed === null) return "Por completar";

    return `${parsed}%`;
  };

  const getNombreTitular = () => {
    if (!row) return "Titular por completar";

    if (row.titular_tipo_persona === "JURIDICA") {
      return row.titular_razon_social || "Titular por completar";
    }

    const nombreCompleto = `${row.titular_apellido || ""} ${
      row.titular_nombres || ""
    }`.trim();

    return nombreCompleto || "Titular por completar";
  };

  const formatConyugeName = (apellido, nombres) => {
    const fullName = `${apellido || ""} ${nombres || ""}`.trim();

    return fullName || "Por completar";
  };

  const estadoCivilTitular = (
    row?.titular_estado_civil ||
    row?.estado_civil_titular ||
    row?.estado_civil ||
    ""
  )
    .toString()
    .trim();

  const mostrarConyugeTitular =
    estadoCivilTitular.toLowerCase() === "casado/a" ||
    estadoCivilTitular.toLowerCase() === "casado" ||
    estadoCivilTitular.toLowerCase() === "casada";

  const condominos = Array.isArray(row?.condominos) ? row.condominos : [];

  const titularidadTitular = parsePercent(row?.porcentaje_titular);
  const titularidadCondominos = condominos.reduce((total, condomino) => {
    return total + (parsePercent(condomino?.porcentaje) || 0);
  }, 0);

  const totalTitularidad =
    (titularidadTitular || 0) + (titularidadCondominos || 0);

  const tituloFicha =
    condominos.length > 0
      ? `${getNombreTitular()} y otro/s`
      : getNombreTitular();

  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <UserRound size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>{titularInformeLabel}</div>
          <h2 style={credentialNameStyle}>{tituloFicha}</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato
  label="Nombre / Razón social"
  value={getNombreTitular()}
/>

<FichaDato
  label="DNI"
  value={row?.titular_dni || row?.identificacion_dni || "Por completar"}
/>

<FichaDato
  label="CUIT"
  value={
    row?.titular_cuil_cuit ||
    row?.titular_cuit ||
    row?.identificacion_cuit ||
    "Por completar"
  }
/>

<FichaDato
  label="Titular desde"
  value={
    row?.titular_desde
      ? formatDate(row.titular_desde)
      : "Por completar"
  }
/>

<FichaDato
  label="Titularidad"
  value={formatPercent(row?.porcentaje_titular)}
/>

<div />

{mostrarConyugeTitular && (
  <>
    <FichaDato
      label="Cónyuge del titular"
      value={formatConyugeName(
        row?.titular_conyuge_apellido,
        row?.titular_conyuge_nombres
      )}
    />

    <FichaDato
      label="DNI cónyuge"
      value={row?.titular_conyuge_dni || "Por completar"}
    />

    <FichaDato
      label="CUIL / CUIT cónyuge"
      value={row?.titular_conyuge_cuil_cuit || "Por completar"}
    />
  </>
)}

        {condominos.length > 0 && (
          <>
            <div
              style={{
                gridColumn: "1 / -1",
                marginTop: "14px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(148,163,184,0.14)",
              }}
            >
              <div
                style={{
                  color: "#a78bfa",
                  fontSize: "12px",
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Condóminos
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <FichaDato
                  label="Titular"
                  value={formatPercent(row?.porcentaje_titular)}
                />

                <FichaDato
                  label="Condóminos"
                  value={`${titularidadCondominos}%`}
                />

                <FichaDato
                  label="Total"
                  value={`${totalTitularidad}%`}
                />
              </div>
            </div>

            {condominos.map((condomino, index) => {
              const estadoCivilCondomino = (
                condomino?.estado_civil || ""
              )
                .toString()
                .trim();

              const mostrarConyugeCondomino =
                estadoCivilCondomino.toLowerCase() === "casado/a" ||
                estadoCivilCondomino.toLowerCase() === "casado" ||
                estadoCivilCondomino.toLowerCase() === "casada";

              const nombreCondomino = `${condomino?.apellido || ""} ${
                condomino?.nombres || ""
              }`.trim();

              return (
                <div
                  key={index}
                  style={{
                    gridColumn: "1 / -1",
                    border: "1px solid rgba(109,45,212,0.22)",
                    borderLeft: "4px solid rgba(109,45,212,0.72)",
                    background:
                      "linear-gradient(180deg, rgba(109,45,212,0.18), rgba(3,18,34,0.48))",
                    borderRadius: "18px",
                    padding: "14px",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      color: "#dbeafe",
                      fontSize: "13px",
                      fontWeight: 900,
                    }}
                  >
                    Condómino {index + 1}
                  </div>

                  <FichaDato
                    label="Nombre / Razón social"
                    value={nombreCondomino || "Por completar"}
                  />

                  <FichaDato
                    label="CUIL / CUIT"
                    value={condomino?.cuil_cuit || "Por completar"}
                  />

                  <FichaDato
                    label="Titularidad"
                    value={formatPercent(condomino?.porcentaje)}
                  />

                  <FichaDato
                    label="DNI"
                    value={condomino?.dni || "Por completar"}
                  />

                  <FichaDato
                    label="Estado civil"
                    value={estadoCivilCondomino || "Por completar"}
                  />

                  <FichaDato
                    label="Titular desde"
                    value={
                      condomino?.titular_desde
                        ? formatDate(condomino.titular_desde)
                        : "Por completar"
                    }
                  />

                  {condomino?.domicilio && (
                    <FichaDato
                      label="Domicilio"
                      value={condomino.domicilio}
                      wide
                    />
                  )}

                  {mostrarConyugeCondomino && (
                    <>
                      <FichaDato
                        label="Cónyuge del condómino"
                        value={formatConyugeName(
                          condomino?.conyuge_apellido,
                          condomino?.conyuge_nombres
                        )}
                      />

                      <FichaDato
                        label="DNI cónyuge"
                        value={condomino?.conyuge_dni || "Por completar"}
                      />

                      <FichaDato
                        label="CUIL / CUIT cónyuge"
                        value={
                          condomino?.conyuge_cuil_cuit || "Por completar"
                        }
                      />
                    </>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function FichaDato({ label, value, wide }) {
  const displayValue =
    value === null ||
    value === undefined ||
    value === "" ||
    value === "Por completar"
      ? "—"
      : value;

  return (
    <div style={wide ? fichaDatoWideStyle : {}}>
      <div style={fichaDatoLabelStyle}>{label}</div>
      <div style={fichaDatoValueStyle}>{displayValue}</div>
    </div>
  );
}

/* ===================== ESTILOS ===================== */

const modalFieldLabelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#90a7c7",
  fontSize: "11px",
  fontWeight: 850,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

const modalInputStyle = {
  width: "100%",
  height: "44px",
  boxSizing: "border-box",
  borderRadius: "14px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3, 11, 24, 0.72)",
  color: "#f8fbff",
  padding: "0 13px",
  fontSize: "13px",
  fontWeight: 700,
  outline: "none",
};

const printOptionStyle = {
  width: "100%",
  textAlign: "left",
  borderRadius: "18px",
  border: "1px solid rgba(96,165,250,0.16)",
  background:
    "linear-gradient(180deg, rgba(7,31,58,0.68), rgba(3,18,34,0.56))",
  padding: "16px",
  cursor: "pointer",
};

const printOptionTitleStyle = {
  color: "#f8fbff",
  fontSize: "14px",
  fontWeight: 850,
  marginBottom: "7px",
};

const printOptionTextStyle = {
  color: "rgba(214,228,245,0.70)",
  fontSize: "12px",
  lineHeight: 1.45,
};

const pageStyle = {
  width: "min(1100px, calc(100vw - 64px))",
  minHeight: "calc(100vh - 110px)",
  marginLeft: "50%",
  transform: "translateX(-50%)",
  display: "grid",
  gridTemplateColumns: "78px minmax(0, 1fr)",
  background:
  "radial-gradient(circle at top left, rgba(26,78,154,0.20), transparent 28%), linear-gradient(180deg, #03122c 0%, #05152f 45%, #071327 100%)",
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  overflow: "hidden",
  boxSizing: "border-box",
};

const sidebarStyle = {
  width: "78px",
  minHeight: "100%",
  background: "linear-gradient(180deg, #041a37 0%, #03152d 100%)",
  borderRight: "1px solid rgba(90, 160, 255, 0.12)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "22px 10px 18px",
  boxSizing: "border-box",
  position: "relative",
};

const sidebarOpenStyle = {
  ...sidebarStyle,
  width: "250px",
  alignItems: "stretch",
  padding: "22px 16px 18px",
  boxShadow: "18px 0 40px rgba(0,0,0,0.24)",
  zIndex: 30,
};

const brandStyle = {
  fontSize: "24px",
  fontWeight: 800,
  letterSpacing: "-0.04em",
  display: "flex",
  gap: "10px",
  alignItems: "flex-start",
justifyContent: "flex-start",
paddingLeft: "14px",
  marginBottom: "34px",
  whiteSpace: "nowrap",
  overflow: "hidden",
};

const brandSubStyle = {
  fontSize: "17px",
  color: "#3b82f6",
  letterSpacing: "0",
};

const navTitleStyle = {
  fontSize: "11px",
  color: "#7891ad",
  margin: "0 0 14px 14px",
  whiteSpace: "nowrap",
};

const navIconStyle = {
  color: "rgba(245,248,255,0.92)",
  display: "flex",
  flexShrink: 0,
  width: "28px",
  justifyContent: "center",
};

const navDividerStyle = {
  margin: "18px 0",
  borderTop: "1px solid rgba(148,163,184,0.12)",
};

const backButtonStyle = {
  marginTop: "18px",
  minHeight: "50px",
  borderRadius: "12px",
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(255,255,255,0.02)",
  color: "#dbeafe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  fontSize: "14px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  overflow: "hidden",
};

const mainStyle = {
  padding: "24px 24px 30px",
  width: "100%",
  boxSizing: "border-box",
  minWidth: 0,
  background: "rgba(8, 22, 46, 0.78)",
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "20px",
};

const titleStyle = {
  margin: 0,
  fontSize: "30px",
  lineHeight: 1.08,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "#f8fbff",
};

const dividerStyle = {
  color: "#7fb7ff",
  margin: "0 10px",
  fontWeight: 500,
};

const eyebrowStyle = {
  marginTop: "7px",
  fontSize: "13px",
  color: "#6fb1ff",
  letterSpacing: "0.03em",
};

const topIconsStyle = {
  display: "flex",
  gap: "16px",
  color: "#eaf2ff",
};

const topIconButtonStyle = {
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
};

const topMenuWrapperStyle = {
  position: "relative",
};

const topDropdownStyle = {
  position: "absolute",
  top: "40px",
  right: 0,
  minWidth: "190px",
  padding: "8px",
  borderRadius: "12px",
  border: "1px solid rgba(96,165,250,0.18)",
  background:
    "linear-gradient(180deg, rgba(7,30,55,0.98), rgba(3,18,34,0.98))",
  boxShadow: "0 22px 48px rgba(0,0,0,0.36)",
  zIndex: 50,
};

const topDropdownItemStyle = {
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

const topDropdownDangerItemStyle = {
  ...topDropdownItemStyle,
  color: "#ffffff",
};

const topDropdownDividerStyle = {
  height: "1px",
  background: "rgba(148,163,184,0.14)",
  margin: "6px 4px",
};

const contextCardStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  borderRadius: "14px",
  border: "1px solid rgba(59,130,246,0.16)",
  background: "rgba(5, 25, 45, 0.46)",
  overflow: "hidden",
  marginBottom: "18px",
};

const contextItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "13px",
  padding: "15px 20px",
  borderRight: "1px solid rgba(148,163,184,0.10)",
  minWidth: 0,
};

const contextIconStyle = {
  color: "rgba(59,130,246,0.86)",
  display: "flex",
  flexShrink: 0,
};

const contextLabelStyle = {
  fontSize: "10px",
  color: "rgba(168,184,202,0.82)",
  marginBottom: "4px",
  letterSpacing: "0.04em",
};

const contextValueStyle = {
  fontSize: "15px",
  fontWeight: 650,
  lineHeight: 1.25,
  color: "rgba(248,251,255,0.94)",
};

/* ===== BLOQUE PRINCIPAL ===== */

const heroStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.35fr) minmax(230px, 0.68fr) minmax(300px, 0.9fr)",
  alignItems: "stretch",
  padding: 0,
  borderRadius: "16px",
  border: "1px solid rgba(59,130,246,0.24)",
  background:
  "linear-gradient(180deg, rgba(16,48,86,0.72), rgba(8,28,52,0.72))",
  marginBottom: "22px",
  overflow: "hidden",
};

const heroLeftStyle = {
  minWidth: 0,
  padding: "34px 32px 30px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: "34px",
};

const heroLabelStyle = {
  fontSize: "12px",
  letterSpacing: "0.08em",
  color: "#a8c4e8",
  marginBottom: "13px",
  fontWeight: 500,
};

const domainStyle = {
  fontSize: "34px",
  fontWeight: 800,
  letterSpacing: "-0.045em",
  lineHeight: 1,
  color: "#f8fbff",
  whiteSpace: "nowrap",
};

const estadoPanelStyle = {
  borderLeft: "1px solid rgba(148,163,184,0.20)",
  borderRight: "1px solid rgba(148,163,184,0.20)",
  padding: "34px 28px 30px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  minWidth: 0,
};

const estadoStatusCardStyle = {
  width: "100%",
  maxWidth: "170px",
  borderRadius: "13px",
  padding: "13px 13px 12px",
  background:
    "linear-gradient(180deg, rgba(239,68,68,0.11), rgba(127,29,29,0.12))",
  border: "1px solid rgba(248,113,113,0.18)",
  boxSizing: "border-box",
};


const estadoStatusTopStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const estadoDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  background: "#ff5d68",
  boxShadow: "0 0 0 3px rgba(255,93,104,0.10)",
  flexShrink: 0,
};

const estadoStatusTextStyle = {
  color: "#ff7d7d",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.04em",
};

const estadoStatusSubTextStyle = {
  marginTop: "8px",
  fontSize: "11px",
  lineHeight: 1.35,
  color: "#d8e4f2",
};

const estadoDateRowStyle = {
  marginTop: "11px",
  paddingTop: "9px",
  borderTop: "1px solid rgba(248,113,113,0.14)",
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  fontSize: "11px",
  color: "#a8b8ca",
};

const estadoBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "fit-content",
  padding: "9px 15px",
  borderRadius: "10px",
  background: "rgba(239,68,68,0.30)",
  color: "#ff7373",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.04em",
};

const estadoFechaStyle = {
  marginTop: "9px",
  fontSize: "12px",
  color: "#d2d9e5",
  whiteSpace: "nowrap",
};

const moneyBoxStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "18px",
  padding: "10px 14px",
  borderRadius: "16px",
  background:
    "linear-gradient(180deg, rgba(16,48,92,0.54) 0%, rgba(8,26,53,0.64) 100%)",
  border: "1px solid rgba(58,130,246,0.14)",
  boxShadow: "none",
  width: "fit-content",
  maxWidth: "100%",
};

const moneyIconStyle = {
  width: "38px",
  height: "38px",
  minWidth: "38px",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at 30% 30%, rgba(93,163,255,0.28), rgba(35,79,158,0.68))",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#f4f8ff",
};

const moneyTextStyle = {
  fontSize: "15px",
  fontWeight: 650,
  color: "#ffffff",
  lineHeight: 1.1,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const moneyDotStyle = {
  fontSize: "12px",
  color: "rgba(159,189,228,0.55)",
  flexShrink: 0,
};

const dotStyle = {
  color: "#5d7797",
  fontSize: "16px",
  flexShrink: 0,
};

const heroActionStyle = {
  minWidth: 0,
  padding: "34px 32px 30px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
};

const actionTitleStyle = {
  fontSize: "20px",
  fontWeight: 750,
  lineHeight: 1.14,
  marginBottom: "14px",
  color: "#ffffff",
};

const actionTextStyle = {
  fontSize: "13px",
  color: "#d4dfec",
  lineHeight: 1.55,
  maxWidth: "270px",
};

const primaryButtonStyle = {
  marginTop: "22px",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(180deg, #2f6df6, #1d4ed8)",
  color: "#ffffff",
  padding: "13px 18px",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 14px 26px rgba(37,99,235,0.26)",
  width: "100%",
  maxWidth: "280px",
  lineHeight: 1.25,
  whiteSpace: "normal",
};

/* ===== TARJETAS INFERIORES ===== */

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
};

const infoCardStyle = {
  minHeight: "310px",
  borderRadius: "14px",
  border: "1px solid rgba(59,130,246,0.14)",
  background:
    "linear-gradient(180deg, rgba(12,42,72,0.52), rgba(4,20,36,0.58))",
  padding: "22px",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

const infoHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  marginBottom: "22px",
};

const infoIconStyle = {
  color: "rgba(59,130,246,0.86)",
  display: "flex",
  flexShrink: 0,
};

const infoTitleStyle = {
  fontSize: "12px",
  letterSpacing: "0.07em",
  color: "rgba(168,196,232,0.86)",
  lineHeight: 1.25,
  fontWeight: 500,
};

const infoBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "13px",
};

const smallLabelStyle = {
  fontSize: "11px",
  color: "#8ea4bb",
  marginBottom: "5px",
};

const smallValueStyle = {
  fontSize: "14.5px",
  color: "rgba(255,255,255,0.94)",
  lineHeight: 1.25,
  fontWeight: 450,
  wordBreak: "break-word",
};

const cardFooterStyle = {
  marginTop: "auto",
  paddingTop: "18px",
  borderTop: "1px solid rgba(148,163,184,0.12)",
};

const linkButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#4aa3ff",
  fontSize: "13px",
  cursor: "pointer",
  padding: 0,
};

const timelineStyle = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  paddingLeft: "6px",
};

const timelineItemStyle = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "16px 1fr",
  gap: "8px",
};

const timelineDotStyle = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  marginTop: "4px",
};

const timelineTopStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "3px",
  fontSize: "12px",
  lineHeight: 1.25,
  color: "rgba(248,251,255,0.90)",
  fontWeight: 550,
};

const timelineTextStyle = {
  color: "rgba(206,220,238,0.74)",
  fontSize: "11px",
  marginTop: "5px",
  lineHeight: 1.35,
};

/* ===== MODALES / FICHAS ===== */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,8,18,0.58)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "32px 24px",
  zIndex: 9999,
  overflowY: "auto",
};

const floatingCardStyle = {
  width: "min(920px, 100%)",
  maxHeight: "calc(100vh - 64px)",
  overflowY: "auto",
  position: "relative",
  borderRadius: "22px",
  background:
    "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
  border: "1px solid rgba(148,163,184,0.14)",
  boxShadow: "0 34px 90px rgba(0,0,0,0.42)",
  padding: "26px",
};

const closeButtonStyle = {
  position: "absolute",
  top: "18px",
  right: "20px",
  border: "none",
  background: "transparent",
  color: "#9fb4cc",
  fontSize: "24px",
  cursor: "pointer",
};

const credentialStyle = {
  borderRadius: "22px",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 18% 0%, rgba(96,165,250,0.20) 0%, transparent 34%), linear-gradient(180deg, rgba(17,55,96,0.98) 0%, rgba(8,29,56,0.98) 100%)",
};

const credentialTopStyle = {
  display: "flex",
  gap: "18px",
  alignItems: "center",
  padding: "24px",
  borderBottom: "1px solid rgba(148,163,184,0.12)",
};

const avatarStyle = {
  width: "64px",
  height: "64px",
  borderRadius: "20px",
  background:
    "linear-gradient(135deg, rgba(96,165,250,0.95), rgba(34,211,238,0.65))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "21px",
  fontWeight: 600,
  color: "#071526",
};

const credentialKickerStyle = {
  fontSize: "11px",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#8fb9e8",
  marginBottom: "6px",
};

const credentialNameStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: 500,
  color: "#eef5ff",
};

const credentialInfoGridStyle = {
  padding: "20px 24px",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "18px 34px",
};

const fichaDatoLabelStyle = {
  fontSize: "11px",
  color: "#7f97b2",
  marginBottom: "4px",
};

const fichaDatoValueStyle = {
  fontSize: "15px",
  color: "#eaf2ff",
};

const fichaDatoWideStyle = {
  gridColumn: "1 / -1",
};
const appHeaderStyle = {
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "18px 32px 12px",
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  boxSizing: "border-box",
};

const appNavStyle = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
  fontSize: "14px",
};

const appNavLinkStyle = {
  color: "#4aa3ff",
  textDecoration: "none",
  fontWeight: 500,
};

const logoutButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#ffffff",
  textDecoration: "underline",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
};

const vencimientoLabelStyle = {
  fontSize: "11px",
  color: "#8ea4bb",
  letterSpacing: "0.06em",
  marginBottom: "5px",
};

const estadoCleanRowStyle = {
  marginTop: "17px",
  display: "flex",
  alignItems: "center",
  gap: "9px",
};

const estadoCleanDotStyle = {
  width: "9px",
  height: "9px",
  borderRadius: "999px",
  background: "#ff5d68",
  boxShadow: "0 0 0 4px rgba(255,93,104,0.10)",
  flexShrink: 0,
};

const estadoCleanTextStyle = {
  color: "#ff6f7a",
  fontSize: "16px",
  fontWeight: 800,
  letterSpacing: "0.04em",
};

const estadoCleanSubTextStyle = {
  marginTop: "13px",
  fontSize: "13px",
  lineHeight: 1.45,
  color: "#e2edf9",
  maxWidth: "210px",
};

const estadoCleanDividerStyle = {
  width: "100%",
  maxWidth: "170px",
  height: "1px",
  background: "rgba(148,163,184,0.22)",
  margin: "20px 0 15px",
};

const estadoCleanDateStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "13px",
  color: "#9fb4cc",
};

const vencimientoBoxStyle = {
  marginTop: "18px",
  paddingTop: "14px",
  borderTop: "1px solid rgba(148,163,184,0.16)",
};

const vencimientoValueStyle = {
  fontSize: "15px",
  fontWeight: 600,
  color: "#ffffff",
};

const moneyContentStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "nowrap",
  whiteSpace: "nowrap",
  minWidth: 0,
};

const toolsWrapperStyle = {
  marginTop: "4px",
};

const toolsButtonStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "13px 16px",
  borderRadius: "10px",
  border: "none",
  background: "transparent",
  color: "rgba(226,237,249,0.82)",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 520,
  textAlign: "left",
};

const toolsDropdownStyle = {
  margin: "4px 0 6px 42px",
  padding: "6px 0 6px 12px",
  borderLeft: "1px solid rgba(148,163,184,0.16)",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const toolItemStyle = {
  border: "none",
  background: "transparent",
  color: "rgba(206,220,238,0.72)",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 460,
  padding: "8px 8px",
  display: "flex",
  alignItems: "center",
  gap: "9px",
  textAlign: "left",
  borderRadius: "8px",
};

const toolIconStyle = {
  color: "rgba(74,163,255,0.82)",
  display: "flex",
  flexShrink: 0,
};
const avisosBadgeStyle = {
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

const avisosDropdownStyle = {
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

const avisosHeaderStyle = {
  padding: "8px 8px 10px",
  fontSize: "12px",
  fontWeight: 700,
  color: "rgba(168,196,232,0.94)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const avisoItemStyle = {
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

const avisoDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  marginTop: "5px",
  flexShrink: 0,
};

const avisoTitleStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 650,
  color: "rgba(248,251,255,0.94)",
  marginBottom: "3px",
};

const avisoTextStyle = {
  display: "block",
  fontSize: "12px",
  lineHeight: 1.35,
  color: "rgba(206,220,238,0.76)",
};

const avisosFooterStyle = {
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

const fichaSectionTitleStyle = {
  gridColumn: "1 / -1",
  marginTop: "10px",
  paddingTop: "18px",
  borderTop: "1px solid rgba(148,163,184,0.14)",
  fontSize: "11px",
  letterSpacing: "0.10em",
  color: "rgba(168,196,232,0.88)",
  fontWeight: 700,
};
const titularidadSummaryStyle = {
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
  marginTop: "2px",
  marginBottom: "4px",
};

const titularidadSummaryLabelStyle = {
  display: "block",
  fontSize: "11px",
  color: "#8ea4bb",
  marginBottom: "4px",
};

const titularidadSummaryValueStyle = {
  display: "block",
  fontSize: "18px",
  color: "#ffffff",
  fontWeight: 650,
};

const titularidadWarningStyle = {
  gridColumn: "1 / -1",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(248,199,68,0.22)",
  background: "rgba(248,199,68,0.08)",
  color: "#f8c744",
  fontSize: "13px",
};

const titularidadErrorStyle = {
  gridColumn: "1 / -1",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(248,113,113,0.22)",
  background: "rgba(248,113,113,0.08)",
  color: "#ff7d7d",
  fontSize: "13px",
};

const condominoCardStyle = {
  gridColumn: "1 / -1",
  marginTop: "8px",
  padding: "18px",
  borderRadius: "16px",
  border: "1px solid rgba(96,165,250,0.16)",
  background:
    "linear-gradient(180deg, rgba(9,34,62,0.56), rgba(3,18,34,0.52))",
};

const condominoHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "18px",
};

const condominoKickerStyle = {
  fontSize: "10px",
  letterSpacing: "0.10em",
  color: "rgba(168,196,232,0.82)",
  fontWeight: 700,
  marginBottom: "5px",
};

const condominoNameStyle = {
  fontSize: "20px",
  color: "#ffffff",
  fontWeight: 650,
};

const condominoPercentStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(59,130,246,0.14)",
  border: "1px solid rgba(96,165,250,0.18)",
  color: "#dbeafe",
  fontSize: "14px",
  fontWeight: 700,
};

const condominoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "18px 34px",
};

const fichaSubSectionTitleStyle = {
  gridColumn: "1 / -1",
  marginTop: "4px",
  paddingTop: "16px",
  borderTop: "1px solid rgba(148,163,184,0.12)",
  fontSize: "10px",
  letterSpacing: "0.10em",
  color: "rgba(168,196,232,0.78)",
  fontWeight: 700,
};
const notesContentStyle = {
  padding: "22px 26px 26px",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
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

const historyItemCardStyle = {
  gridColumn: "1 / -1",
  padding: "14px 0 16px",
  borderBottom: "1px solid rgba(148,163,184,0.12)",
};

const historyItemHeaderStyle = {
  fontSize: "15px",
  fontWeight: 750,
  color: "#f8fbff",
  lineHeight: 1.35,
  marginBottom: "6px",
};

const historyItemDetailStyle = {
  fontSize: "13px",
  lineHeight: 1.5,
  color: "rgba(226,237,249,0.82)",
  maxWidth: "820px",
};

const historyItemUserStyle = {
  marginTop: "5px",
  fontSize: "12px",
  lineHeight: 1.4,
  color: "rgba(168,184,202,0.76)",
};

const notesListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const noteMessageStyle = {
  maxWidth: "82%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(96,165,250,0.14)",
  background: "rgba(7,30,55,0.58)",
};

const noteMessageSakiStyle = {
  ...noteMessageStyle,
  marginLeft: "auto",
  background: "linear-gradient(180deg, rgba(37,99,235,0.18), rgba(7,30,55,0.62))",
  border: "1px solid rgba(96,165,250,0.22)",
};

const noteMetaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  color: "rgba(168,196,232,0.9)",
  marginBottom: "4px",
};

const noteDateStyle = {
  fontSize: "11px",
  color: "rgba(142,164,187,0.86)",
  marginBottom: "10px",
};

const noteTextStyle = {
  fontSize: "14px",
  lineHeight: 1.5,
  color: "rgba(248,251,255,0.94)",
};

const helpBoxStyle = {
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

const helpTitleStyle = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#bbf7d0",
  marginBottom: "5px",
};

const helpTextStyle = {
  fontSize: "13px",
  lineHeight: 1.45,
  color: "rgba(226,237,249,0.9)",
  maxWidth: "560px",
};

const helpDisclaimerStyle = {
  marginTop: "7px",
  fontSize: "11px",
  color: "rgba(187,247,208,0.72)",
};

const whatsappButtonStyle = {
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

const noteComposerStyle = {
  borderTop: "1px solid rgba(148,163,184,0.14)",
  paddingTop: "18px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const noteTextareaStyle = {
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

const noteSendButtonStyle = {
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

const caseOverviewStyle = {
  borderRadius: "18px",
  border: "1px solid rgba(96,165,250,0.18)",
  background:
  "radial-gradient(circle at 18% 0%, rgba(96,165,250,0.12) 0%, transparent 34%), linear-gradient(180deg, rgba(17,55,96,0.72) 0%, rgba(8,29,56,0.72) 100%)",
  padding: "22px 26px 20px",
  marginBottom: "18px",
  boxSizing: "border-box",
  overflow: "hidden",
};

const caseOverviewTopStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "24px",
};

const caseLabelStyle = {
  fontSize: "10px",
  letterSpacing: "0.11em",
  color: "rgba(168,196,232,0.72)",
  fontWeight: 600,
  marginBottom: "10px",
  textTransform: "uppercase",
};

const caseDomainStyle = {
  fontSize: "30px",
  fontWeight: 720,
  letterSpacing: "-0.04em",
  lineHeight: 1,
  color: "#f8fbff",
  whiteSpace: "nowrap",
  marginBottom: "14px",
};

const caseMoneyPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "16px",
  padding: "12px 20px 12px 10px",
  borderRadius: "999px",
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(3,18,34,0.28)",
  color: "rgba(248,251,255,0.90)",
  fontSize: "11px",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const caseMoneyIconStyle = {
  width: "26px",
  height: "26px",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(37,99,235,0.36)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#dbeafe",
  flexShrink: 0,
};

const caseDotStyle = {
  color: "rgba(160,190,230,0.55)",
  fontSize: "13px",
  lineHeight: 1,
  margin: "0 4px",
};

const caseOverviewDividerStyle = {
  height: "1px",
  background: "rgba(148,163,184,0.14)",
  margin: "18px 0 18px",
};

const caseOverviewBottomStyle = {
  display: "grid",
  gridTemplateColumns: "0.9fr 1.15fr auto",
  alignItems: "center",
  gap: "28px",
};

const caseStatusBlockStyle = {
  minWidth: 0,
};

const caseStatusRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  marginBottom: "9px",
};

const caseStatusDotStyle = {
  width: "9px",
  height: "9px",
  borderRadius: "999px",
  background: "#ff5d68",
  boxShadow: "0 0 0 4px rgba(255,93,104,0.10)",
  flexShrink: 0,
};

const caseStatusTextStyle = {
  color: "#ff6f7a",
  fontSize: "15px",
  fontWeight: 750,
  letterSpacing: "0.02em",
};

const caseStatusSubStyle = {
  marginTop: "8px",
  fontSize: "12px",
  lineHeight: 1.45,
  color: "rgba(226,237,249,0.82)",
  marginBottom: "4px",
};

const caseDateStyle = {
  marginTop: "4px",
  paddingLeft: "4px",
  fontSize: "12px",
  color: "rgba(206,220,238,0.78)",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  lineHeight: 1.35,
};

const caseActionBlockStyle = {
  minWidth: 0,
  paddingLeft: "26px",
  borderLeft: "1px solid rgba(148,163,184,0.14)",
};

const caseActionTitleStyle = {
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: 1.2,
  color: "#f7fbff",
  marginBottom: "10px",
};

const caseActionTextStyle = {
  fontSize: "12px",
  lineHeight: 1.55,
  color: "rgba(214,228,245,0.78)",
  maxWidth: "360px",
};

const caseActionButtonWrapStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
};

const caseActionButtonStyle = {
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(180deg, #2f6df6, #1d4ed8)",
  color: "#ffffff",
  padding: "11px 16px",
  fontSize: "12px",
  fontWeight: 650,
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(37,99,235,0.18)",
  whiteSpace: "nowrap",
};

const titleDividerStyle = {
  color: "#8ecbff",
  margin: "0 12px",
  fontWeight: 500,
};

const navItemStyle = {
  height: "52px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "14px",
  padding: "0 14px",
  color: "rgba(232,240,255,0.88)",
  textDecoration: "none",
  transition: "all 0.18s ease",
  position: "relative",
  cursor: "pointer",
  whiteSpace: "nowrap",
  overflow: "hidden",
};

const navItemActiveStyle = {
  ...navItemStyle,
  background: "linear-gradient(135deg, #2f6fff 0%, #3152d9 100%)",
  boxShadow: "0 10px 24px rgba(37,96,255,0.28)",
  color: "#ffffff",
};

const navLabelStyle = {
  fontSize: "14px",
  fontWeight: 600,
  color: "rgba(226,237,249,0.84)",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

const navLabelActiveStyle = {
  fontSize: "14px",
  fontWeight: 650,
  color: "rgba(255,255,255,0.96)",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

const kickerStyle = {
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.12em",
  color: "#5fd0ff",
  textTransform: "uppercase",
  marginBottom: "8px",
};

const editorLabelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#90a7c7",
  marginBottom: "10px",
};

const editorInputStyle = {
  width: "100%",
  height: "46px",
  borderRadius: "14px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3, 11, 24, 0.72)",
  color: "#f8fbff",
  padding: "0 14px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  colorScheme: "dark",
};