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

function addYearsToDateString(value, years) {
  if (!value) return "";

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return "";

  return [
    year + years,
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function onlyDigits(value) {
  return (value || "").toString().replace(/\D/g, "").slice(0, 11);
}

function formatNumberMiles(value) {
  if (value === null || value === undefined || value === "") return "";

  const onlyNumbers = String(value).replace(/\D/g, "");

  if (!onlyNumbers) return "";

  return new Intl.NumberFormat("es-AR").format(Number(onlyNumbers));
}

function parseNumberMiles(value) {
  if (value === null || value === undefined || value === "") return "";

  return String(value).replace(/\D/g, "");
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
  { value: "instrumento_prendario", label: "Instrumento prendario" },
  { value: "rectificaciones", label: "Rectificaciones" },
  {
    value: "observaciones_subsanaciones",
    label: "Observaciones y subsanaciones",
  },
  { value: "inscripcion", label: "Inscripción" },
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
    // Prenda
    importe_prenda:
      source?.importe_prenda !== null && source?.importe_prenda !== undefined
        ? String(source.importe_prenda)
        : "",
    moneda_importe: source?.moneda_importe || "$",
    plazo_anios:
      source?.plazo_anios !== null && source?.plazo_anios !== undefined
        ? String(source.plazo_anios)
        : "",
    grado_prenda: source?.grado_prenda || "",
    escribania: source?.escribania || "",
    numero_escritura: source?.numero_escritura || "",
    folio: source?.folio || "",
    st03_numero: source?.st03_numero || "",
st02_numero: source?.st02_numero || "",
    fecha_escritura: source?.fecha_escritura || "",
    fecha_inscripcion: source?.fecha_inscripcion || "",
fecha_vencimiento: source?.fecha_vencimiento || "",

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

    // Titular / garante
    titular_tipo_persona: source?.titular_tipo_persona || "HUMANA",
    titular_apellido: source?.titular_apellido || "",
    titular_nombres: source?.titular_nombres || "",
    titular_razon_social: source?.titular_razon_social || "",
    titular_dni: source?.titular_dni || "",
    titular_cuil_cuit: source?.titular_cuil_cuit || source?.titular_cuit || "",
    titular_estado_civil: source?.titular_estado_civil || "",
    titular_desde: source?.titular_desde || "",
    porcentaje_titular:
      source?.porcentaje_titular !== null &&
      source?.porcentaje_titular !== undefined
        ? String(source.porcentaje_titular)
        : "",
    titular_domicilio: source?.titular_domicilio || "",
    titular_email: source?.titular_email || "",

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
const [datosLegajoForm, setDatosLegajoForm] = useState(
  buildDatosLegajoForm(null)
);

const [printMode, setPrintMode] = useState(null);

const [currentProfile, setCurrentProfile] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);
const [canOperatePrendas, setCanOperatePrendas] = useState(false);

const [showReprogramarEnvio, setShowReprogramarEnvio] = useState(false);
const [nuevaFechaEnvio, setNuevaFechaEnvio] = useState("");
const [savingReprogramacion, setSavingReprogramacion] = useState(false);

const [showRecibirPrenda, setShowRecibirPrenda] = useState(false);
const [fechaRecepcionSaki, setFechaRecepcionSaki] = useState("");
const [savingRecepcionSaki, setSavingRecepcionSaki] = useState(false);

const [showAprobarRevision, setShowAprobarRevision] = useState(false);
const [fechaPaseEnCurso, setFechaPaseEnCurso] = useState("");
const [savingAprobarRevision, setSavingAprobarRevision] = useState(false);

const [showSolicitarRectificacion, setShowSolicitarRectificacion] = useState(false);
const [rectificacionTipo, setRectificacionTipo] = useState("");
const [rectificacionMotivo, setRectificacionMotivo] = useState("");
const [rectificacionNota, setRectificacionNota] = useState("");
const [savingRectificacion, setSavingRectificacion] = useState(false);

const [
  showDisponibleRetiroCorreccion,
  setShowDisponibleRetiroCorreccion,
] = useState(false);
const [
  fechaDisponibleRetiroCorreccion,
  setFechaDisponibleRetiroCorreccion,
] = useState("");
const [
  savingDisponibleRetiroCorreccion,
  setSavingDisponibleRetiroCorreccion,
] = useState(false);

const [showRetiroCorreccion, setShowRetiroCorreccion] = useState(false);
const [fechaRetiroCorreccion, setFechaRetiroCorreccion] = useState("");
const [savingRetiroCorreccion, setSavingRetiroCorreccion] = useState(false);

const [
  showReprogramacionRectificacion,
  setShowReprogramacionRectificacion,
] = useState(false);
const [fechaReenvioOficina, setFechaReenvioOficina] = useState("");
const [
  savingReprogramacionRectificacion,
  setSavingReprogramacionRectificacion,
] = useState(false);

const [showReingresoCorreccion, setShowReingresoCorreccion] = useState(false);
const [fechaReingresoCorreccion, setFechaReingresoCorreccion] = useState("");
const [savingReingresoCorreccion, setSavingReingresoCorreccion] = useState(false);

const [showPresentacionRegistro, setShowPresentacionRegistro] = useState(false);
const [fechaPresentacionRegistro, setFechaPresentacionRegistro] = useState("");
const [savingPresentacionRegistro, setSavingPresentacionRegistro] = useState(false);

const [showMarcarObservada, setShowMarcarObservada] = useState(false);
const [fechaObservacion, setFechaObservacion] = useState("");
const [observacionTipo, setObservacionTipo] = useState("");
const [observacionMotivo, setObservacionMotivo] = useState("");
const [observacionNota, setObservacionNota] = useState("");
const [savingObservada, setSavingObservada] = useState(false);

const [showRetiroSubsanacion, setShowRetiroSubsanacion] = useState(false);
const [fechaRetiroSubsanacion, setFechaRetiroSubsanacion] = useState("");
const [savingRetiroSubsanacion, setSavingRetiroSubsanacion] = useState(false);

const [showReingresoSubsanada, setShowReingresoSubsanada] = useState(false);
const [fechaReingresoSubsanada, setFechaReingresoSubsanada] = useState("");
const [savingReingresoSubsanada, setSavingReingresoSubsanada] = useState(false);

const [showMarcarInscripta, setShowMarcarInscripta] = useState(false);
const [fechaInscripcion, setFechaInscripcion] = useState("");
const [savingInscripta, setSavingInscripta] = useState(false);

const [showDisponibleRetiroFinal, setShowDisponibleRetiroFinal] = useState(false);
const [fechaDisponibleRetiroFinal, setFechaDisponibleRetiroFinal] = useState("");
const [savingDisponibleRetiroFinal, setSavingDisponibleRetiroFinal] = useState(false);

const [showRetiradaFinal, setShowRetiradaFinal] = useState(false);
const [fechaRetiradaFinal, setFechaRetiradaFinal] = useState("");
const [savingRetiradaFinal, setSavingRetiradaFinal] = useState(false);

const [showCerrarLegajo, setShowCerrarLegajo] = useState(false);
const [fechaCierreLegajo, setFechaCierreLegajo] = useState("");
const [savingCerrarLegajo, setSavingCerrarLegajo] = useState(false);

const [showAnularPrenda, setShowAnularPrenda] = useState(false);
const [motivoAnulacion, setMotivoAnulacion] = useState("");
const [savingAnularPrenda, setSavingAnularPrenda] = useState(false);

const [showEliminarLegajo, setShowEliminarLegajo] = useState(false);
const [confirmacionEliminarLegajo, setConfirmacionEliminarLegajo] = useState("");
const [savingEliminarLegajo, setSavingEliminarLegajo] = useState(false);

  const estadoActual = row?.estado || "—";

const estadoActualKey = (row?.estado || "")
  .toString()
  .trim()
  .toUpperCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

  const fechaEstadoActual = "12/03/2026";
  const fechaVencimiento = "12/03/2031";

  const moneda = "USD";
const importePrenda = "50.000";

  const mostrarVencimiento = estadoActual === "INSCRIPTA";

  useEffect(() => {
  if (!id) return;

  async function fetchPrendaReal() {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("dia_request_prendas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando prenda real:", error);
      setErrorMsg(error.message || "No se pudo cargar la prenda.");
      setRow(null);
      setLoading(false);
      return;
    }

    setRow(data);

    const { data: historyData, error: historyError } = await supabase
  .from("dia_request_prendas_history")
  .select("*")
  .eq("prenda_id", id)
  .order("created_at", { ascending: false });

if (historyError) {
  console.error("Error cargando historial de prenda:", historyError);
  setHistoryRows([]);
} else {
  setHistoryRows(historyData || []);
}
    setLoading(false);
  }

    fetchPrendaReal();
fetchArchivosLegajo();
fetchNotasLegajo();
}, [id]);

async function fetchArchivosLegajo() {
  if (!id) return;

  try {
    setLoadingArchivos(true);
    setArchivoMsg("");

    const { data, error } = await supabase
      .from("dia_request_prendas_files")
      .select("*")
      .eq("prenda_id", id)
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

  const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

if (archivoSeleccionado.size > MAX_FILE_SIZE_BYTES) {
  setArchivoMsg(
    `El archivo supera el peso máximo permitido de ${MAX_FILE_SIZE_MB} MB. Comprimí el PDF o dividí la documentación en más de un archivo.`
  );
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

    const storagePath = `prendas/${id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("dia-prendas-files")
      .upload(storagePath, archivoSeleccionado, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

const { data: createdFile, error: insertError } = await supabase
  .from("dia_request_prendas_files")
  .insert({
    prenda_id: id,
    categoria: archivoCategoria,
    nombre_archivo: originalName,
    storage_path: storagePath,
    mime_type: archivoSeleccionado.type || null,
    size_bytes: archivoSeleccionado.size || null,
    uploaded_by: user?.id || null,
  })
  .select("*")
  .single();

if (insertError) throw insertError;

const { data: createdHistory, error: historyError } = await supabase
  .from("dia_request_prendas_history")
  .insert({
    prenda_id: id,
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
      .from("dia-prendas-files")
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
      .from("dia-prendas-files")
      .remove([file.storage_path]);

    if (storageError) throw storageError;

    const { error: deleteError } = await supabase
      .from("dia_request_prendas_files")
      .delete()
      .eq("id", file.id);

    if (deleteError) throw deleteError;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
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

async function fetchArchivosLegajo() {
  if (!id) return;

  try {
    setLoadingArchivos(true);
    setArchivoMsg("");

    const { data, error } = await supabase
      .from("dia_request_prendas_files")
      .select("*")
      .eq("prenda_id", id)
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

async function fetchNotasLegajo() {
  if (!id) return;

  try {
    setLoadingNotas(true);
    setNotaMsg("");

    const { data, error } = await supabase
      .from("dia_notes")
      .select("*")
      .eq("prenda_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    setNotasLegajo(data || []);
  } catch (error) {
    console.error("Error cargando notas del legajo:", error);
    setNotasLegajo([]);
    setNotaMsg(error?.message || "No se pudieron cargar las notas del legajo.");
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

    const authorName =
  currentProfile?.full_name ||
  currentProfile?.name ||
  user?.user_metadata?.full_name ||
  user?.email ||
  "Usuario";

const authorEmail =
  currentProfile?.email ||
  user?.email ||
  null;

const createdAt = new Date().toISOString();

const authorRole =
  currentProfile?.role ||
  "member";

const parentId = respondiendoNota?.id || null;

const { data: createdNote, error: noteError } = await supabase
  .from("dia_notes")
  .insert({
    prenda_id: id,
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
  .from("dia_request_prendas_history")
  .insert({
    prenda_id: id,
    tipo_evento: "nota_agregada",
    titulo: "Nota agregada al legajo",
    detalle: {
      nota: notaLimpia,
      autor: authorName,
      email: authorEmail,
    },
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
    console.error("Error guardando nota del legajo:", error);
    setNotaMsg(error?.message || "No se pudo guardar la nota.");
  } finally {
    setSavingNota(false);
  }
}

function handleOpenDatosLegajoEditor() {
  setDatosLegajoForm(buildDatosLegajoForm(row));
  setDatosLegajoError("");
  setShowDatosLegajoEditor(true);
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

function handlePrintFichaPrenda() {
  setPrintMode("prenda");

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
      ? `${window.location.origin}/dia/prendas/detalle-preview-real?id=${id}`
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
    ["Carga inicial", row?.created_at],
    ["Envío programado", row?.fecha_envio_oficina],
    ["Recepción SAKI", row?.fecha_recepcion_inicial_oficina],
    ["Presentación en Registro", row?.fecha_presentacion_registro],
    ["Observación", row?.fecha_observacion],
    ["Reingreso subsanado", row?.fecha_reingreso_subsanada],
    ["Inscripción", row?.fecha_inscripcion],
    ["Vencimiento", row?.fecha_vencimiento],
    ["Disponible para retiro", row?.fecha_disponible_retiro_final],
    ["Retiro final", row?.fecha_real_retiro_final],
    ["Cierre de legajo", row?.fecha_cierre_legajo || row?.legajo_cerrado_en],
  ]
    .filter(([, fecha]) => fecha)
    .map(([titulo, fecha]) => `- ${titulo}: ${formatDate(fecha)}`)
    .join("\n");

  return `SAKI — Resumen del legajo prendario

Fecha de generación: ${new Date().toLocaleDateString("es-AR")}

1. Datos principales
- Dominio: ${row?.dominio || "—"}
- Estado actual: ${row?.estado || "—"}
- Próxima acción: ${proximaAccionInfo?.title || "—"}
- Tienda: ${row?.tienda || "—"}
- Franquiciado: ${franquiciadoNombre}
- CUIT franquiciado: ${row?.frq_cuit || "—"}
- Fecha de envío programada: ${
    row?.fecha_envio_oficina ? formatDate(row.fecha_envio_oficina) : "—"
  }

2. Prenda
- Escritura: ${row?.numero_escritura || "—"}
- Folio: ${row?.folio || "—"}
- Fecha de escritura: ${
    row?.fecha_escritura ? formatDate(row.fecha_escritura) : "—"
  }
- Escribanía: ${row?.escribania || "—"}
- Moneda: ${row?.moneda_importe || "—"}
- Importe: ${
    row?.importe_prenda
      ? `${row?.moneda_importe || "$"} ${formatNumberMiles(row.importe_prenda)}`
      : "—"
  }
- Plazo: ${row?.plazo_anios ? `${row.plazo_anios} años` : "—"}
- Grado / orden de prelación: ${row?.grado_prenda || "—"}

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

  const nombreArchivo = `saki-legajo-${row?.dominio || id || "prenda"}.txt`;

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
      ? `${window.location.origin}/dia/prendas/detalle-preview-real?id=${id}`
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

function handleCancelDatosLegajoEditor() {
  setDatosLegajoForm(buildDatosLegajoForm(row));
  setDatosLegajoError("");
  setShowDatosLegajoEditor(false);
}

function handleDatosLegajoChange(field, value) {
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

async function handleSaveDatosLegajo() {
  if (!id || !isAdmin) return;

  setSavingDatosLegajo(true);
  setDatosLegajoError("");

  const titularidadTotal =
    Math.round(getPrendaTitularidadTotal(datosLegajoForm) * 100) / 100;

  if (titularidadTotal !== 100) {
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
      // Prenda
      importe_prenda:
        datosLegajoForm.importe_prenda === ""
          ? null
          : Number(datosLegajoForm.importe_prenda),
      moneda_importe: datosLegajoForm.moneda_importe || "$",
      plazo_anios:
        datosLegajoForm.plazo_anios === ""
          ? null
          : Number(datosLegajoForm.plazo_anios),
      grado_prenda: datosLegajoForm.grado_prenda || null,
      escribania: datosLegajoForm.escribania || null,
      numero_escritura: datosLegajoForm.numero_escritura || null,
      folio: datosLegajoForm.folio || null,
      st03_numero: datosLegajoForm.st03_numero || null,
st02_numero: datosLegajoForm.st02_numero || null,
      fecha_escritura: datosLegajoForm.fecha_escritura || null,
      fecha_inscripcion: datosLegajoForm.fecha_inscripcion || null,
fecha_vencimiento: datosLegajoForm.fecha_inscripcion
  ? addYearsToDateString(datosLegajoForm.fecha_inscripcion, 5)
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
      titular_email: datosLegajoForm.titular_email || null,

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
      .from("dia_request_prendas")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "datos_legajo_actualizados",
        titulo: "Datos del legajo actualizados",
        detalle: {
          secciones: [
            "Prenda",
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
  } catch (error) {
    console.error("Error guardando datos del legajo:", error);
    setDatosLegajoError(
      error?.message || "No se pudieron guardar los datos del legajo."
    );
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
  setCanOperatePrendas(false);
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
  setCanOperatePrendas(false);
  return;
}

const role = (profile?.role || "").toString().trim().toLowerCase();

const sector = (profile?.sector || "")
  .toString()
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

const userIsAdmin = role === "admin";

const userCanOperatePrendas =
  userIsAdmin ||
  (sector.includes("creditos") && sector.includes("cobranzas"));

setCurrentProfile(profile || null);
setIsAdmin(userIsAdmin);
setCanOperatePrendas(userCanOperatePrendas);

    } catch (error) {
      console.error("Error verificando perfil actual:", error);
      setCurrentProfile(null);
      setIsAdmin(false);
    }
  }

  fetchCurrentProfile();
}, []);

async function handleGuardarReprogramacion() {
  if (!id) return;

  if (!nuevaFechaEnvio) {
    alert("Seleccioná una nueva fecha de envío.");
    return;
  }

  try {
    setSavingReprogramacion(true);

    const fechaAnteriorEnvio = row?.fecha_envio_oficina || null;

const { error } = await supabase
  .from("dia_request_prendas")
  .update({
    fecha_envio_oficina: nuevaFechaEnvio,
  })
  .eq("id", id);

if (error) throw error;

const {
  data: { user },
} = await supabase.auth.getUser();

const { data: createdHistory, error: historyError } = await supabase
  .from("dia_request_prendas_history")
  .insert({
    prenda_id: id,
    tipo_evento: "reprogramacion_envio",
    titulo: "Reprogramación de envío",
    detalle: {
      fecha_anterior: fechaAnteriorEnvio,
      fecha_nueva: nuevaFechaEnvio,
      estado: row?.estado || null,
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

setRow((prev) => ({
  ...prev,
  fecha_envio_oficina: nuevaFechaEnvio,
}));

    setShowReprogramarEnvio(false);
    setNuevaFechaEnvio("");

    alert("Fecha de envío reprogramada correctamente.");
  } catch (error) {
    console.error("Error reprogramando envío:", error);
    alert("No se pudo reprogramar la fecha de envío.");
  } finally {
    setSavingReprogramacion(false);
  }
}

async function handleGuardarRecepcionSaki() {
  if (!id) return;

  if (!fechaRecepcionSaki) {
    alert("Seleccioná la fecha de recepción en SAKI.");
    return;
  }

  try {
    setSavingRecepcionSaki(true);

    const estadoAnterior = row?.estado || null;

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        estado: "En revisión",
        fecha_recepcion_inicial_oficina: fechaRecepcionSaki,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "recepcion_inicial_saki",
        titulo: "Recepción inicial en SAKI",
        detalle: {
          estado_anterior: estadoAnterior,
          estado_nuevo: "En revisión",
          fecha_recepcion: fechaRecepcionSaki,
          nota:
            "SAKI recibió físicamente la prenda y comenzó la revisión documental previa al trámite.",
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

    setRow((prev) => ({
      ...prev,
      estado: "En revisión",
      fecha_recepcion_inicial_oficina: fechaRecepcionSaki,
    }));

    setShowRecibirPrenda(false);
    setFechaRecepcionSaki("");

    alert("Prenda recibida en SAKI correctamente.");
  } catch (error) {
    console.error("Error registrando recepción en SAKI:", error);
    alert("No se pudo registrar la recepción en SAKI.");
  } finally {
    setSavingRecepcionSaki(false);
  }
}

async function handleGuardarAprobarRevision() {
  if (!id) return;

  if (!fechaPaseEnCurso) {
    alert("Seleccioná la fecha de pase a En curso.");
    return;
  }

  try {
    setSavingAprobarRevision(true);

    const estadoAnterior = row?.estado || null;

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        estado: "En curso",
        fecha_pase_en_curso: fechaPaseEnCurso,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "aprobacion_revision",
        titulo: "Prenda en curso",
        detalle: {
          estado_anterior: estadoAnterior,
          estado_nuevo: "En curso",
          fecha_pase_en_curso: fechaPaseEnCurso,
          nota:
            "SAKI verificó la prenda y confirmó que se encuentra apta para continuar el trámite.",
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

    setRow((prev) => ({
      ...prev,
      estado: "En curso",
      fecha_pase_en_curso: fechaPaseEnCurso,
    }));

    setShowAprobarRevision(false);
    setFechaPaseEnCurso("");

    alert("Revisión aprobada. La prenda pasó a En curso.");
  } catch (error) {
    console.error("Error aprobando revisión:", error);
    alert("No se pudo aprobar la revisión.");
  } finally {
    setSavingAprobarRevision(false);
  }
}

async function handleGuardarSolicitarRectificacion() {
  if (!id) return;

  if (!rectificacionTipo) {
    alert("Seleccioná el tipo de rectificación.");
    return;
  }

  if (!rectificacionMotivo.trim()) {
    alert("Ingresá el motivo de la rectificación.");
    return;
  }

  try {
    setSavingRectificacion(true);

    const estadoAnterior = row?.estado || null;

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        estado: "Rectificación solicitada",
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "rectificacion_solicitada",
        titulo: "Rectificación solicitada",
        detalle: {
          estado_anterior: estadoAnterior,
          estado_nuevo: "Rectificación solicitada",
          tipo_rectificacion: rectificacionTipo,
          motivo_rectificacion: rectificacionMotivo.trim(),
          nota: rectificacionNota.trim() || null,
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

    setRow((prev) => ({
      ...prev,
      estado: "Rectificación solicitada",
    }));

    setShowSolicitarRectificacion(false);
    setRectificacionTipo("");
    setRectificacionMotivo("");
    setRectificacionNota("");

    alert("Rectificación solicitada correctamente.");
  } catch (error) {
    console.error("Error solicitando rectificación:", error);
    alert("No se pudo solicitar la rectificación.");
  } finally {
    setSavingRectificacion(false);
  }
}

async function handleGuardarDisponibleRetiroCorreccion() {
  if (!id) return;

  if (!fechaDisponibleRetiroCorreccion) {
    alert("Seleccioná la fecha disponible para retiro por corrección.");
    return;
  }

  try {
    setSavingDisponibleRetiroCorreccion(true);

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        fecha_disponible_retiro_correccion: fechaDisponibleRetiroCorreccion,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "disponible_retiro_correccion",
        titulo: "Disponible para retiro por corrección",
        detalle: {
          estado_actual: row?.estado || null,
          fecha_disponible_retiro_correccion: fechaDisponibleRetiroCorreccion,
          nota:
            "SAKI dejó la prenda disponible para que Día la retire y gestione la corrección correspondiente.",
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

    setRow((prev) => ({
      ...prev,
      fecha_disponible_retiro_correccion: fechaDisponibleRetiroCorreccion,
    }));

    setShowDisponibleRetiroCorreccion(false);
    setFechaDisponibleRetiroCorreccion("");

    alert("Fecha disponible para retiro por corrección guardada correctamente.");
  } catch (error) {
    console.error("Error guardando retiro por corrección:", error);
    alert("No se pudo guardar la fecha disponible para retiro por corrección.");
  } finally {
    setSavingDisponibleRetiroCorreccion(false);
  }
}

async function handleGuardarRetiroCorreccion() {
  if (!id) return;

  if (!fechaRetiroCorreccion) {
    alert("Seleccioná la fecha de retiro para rectificación.");
    return;
  }

  try {
    setSavingRetiroCorreccion(true);

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        fecha_retiro_correccion: fechaRetiroCorreccion,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "retiro_correccion",
        titulo: "Retiro para rectificación",
        detalle: {
          estado_actual: row?.estado || null,
          fecha_retiro_correccion: fechaRetiroCorreccion,
          nota:
            "Día retiró la prenda de SAKI para gestionar la rectificación solicitada.",
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

    setRow((prev) => ({
      ...prev,
      fecha_retiro_correccion: fechaRetiroCorreccion,
    }));

    setShowRetiroCorreccion(false);
    setFechaRetiroCorreccion("");

    alert("Retiro para rectificación guardado correctamente.");
  } catch (error) {
    console.error("Error guardando retiro para rectificación:", error);
    alert("No se pudo guardar el retiro para rectificación.");
  } finally {
    setSavingRetiroCorreccion(false);
  }
}

async function handleGuardarReprogramacionRectificacion() {
  if (!id) return;

  if (!fechaReenvioOficina) {
    alert("Seleccioná la nueva fecha de envío por rectificación.");
    return;
  }

  try {
    setSavingReprogramacionRectificacion(true);

    const fechaAnterior = row?.fecha_reenvio_oficina || null;

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        fecha_reenvio_oficina: fechaReenvioOficina,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "reprogramacion_envio_rectificacion",
        titulo: "Reprogramación de envío por rectificación",
        detalle: {
          estado_actual: row?.estado || null,
          fecha_anterior: fechaAnterior,
          fecha_nueva: fechaReenvioOficina,
          nota:
            "Día informó una nueva fecha de envío de la prenda rectificada.",
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

    setRow((prev) => ({
      ...prev,
      fecha_reenvio_oficina: fechaReenvioOficina,
    }));

    setShowReprogramacionRectificacion(false);
    setFechaReenvioOficina("");

    alert("Reprogramación de envío por rectificación guardada correctamente.");
  } catch (error) {
    console.error("Error guardando reprogramación por rectificación:", error);
    alert("No se pudo guardar la reprogramación por rectificación.");
  } finally {
    setSavingReprogramacionRectificacion(false);
  }
}

async function handleGuardarReingresoCorreccion() {
  if (!id) return;

  if (!fechaReingresoCorreccion) {
    alert("Seleccioná la fecha de reingreso de la prenda rectificada.");
    return;
  }

  try {
    setSavingReingresoCorreccion(true);

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        fecha_reingreso_correccion: fechaReingresoCorreccion,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "reingreso_correccion",
        titulo: "Reingreso de prenda rectificada",
        detalle: {
          estado_actual: row?.estado || null,
          fecha_reingreso_correccion: fechaReingresoCorreccion,
          nota:
            "La prenda volvió a ingresar a SAKI luego de la rectificación solicitada.",
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

    setRow((prev) => ({
      ...prev,
      fecha_reingreso_correccion: fechaReingresoCorreccion,
    }));

    setShowReingresoCorreccion(false);
    setFechaReingresoCorreccion("");

    alert("Reingreso de prenda rectificada guardado correctamente.");
  } catch (error) {
    console.error("Error guardando reingreso de prenda rectificada:", error);
    alert("No se pudo guardar el reingreso de la prenda rectificada.");
  } finally {
    setSavingReingresoCorreccion(false);
  }
}

async function handleGuardarPresentacionRegistro() {
  if (!id) return;

  if (!fechaPresentacionRegistro) {
    alert("Seleccioná la fecha de presentación en Registro.");
    return;
  }

  try {
    setSavingPresentacionRegistro(true);

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        fecha_presentacion_registro: fechaPresentacionRegistro,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "presentacion_registro",
        titulo: "Presentación en Registro",
        detalle: {
          estado_actual: row?.estado || null,
          fecha_presentacion_registro: fechaPresentacionRegistro,
          nota:
            "SAKI presentó la prenda ante el Registro interviniente para su tramitación.",
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

    setRow((prev) => ({
      ...prev,
      fecha_presentacion_registro: fechaPresentacionRegistro,
    }));

    setShowPresentacionRegistro(false);
    setFechaPresentacionRegistro("");

    alert("Presentación en Registro guardada correctamente.");
  } catch (error) {
    console.error("Error guardando presentación en Registro:", error);
    alert("No se pudo guardar la presentación en Registro.");
  } finally {
    setSavingPresentacionRegistro(false);
  }
}

async function handleGuardarMarcarObservada() {
  if (!id) return;

  if (!fechaObservacion) {
    alert("Seleccioná la fecha de observación.");
    return;
  }

  if (!observacionTipo) {
    alert("Seleccioná el tipo de observación.");
    return;
  }

  if (!observacionMotivo.trim()) {
    alert("Ingresá el motivo de la observación.");
    return;
  }

  try {
    setSavingObservada(true);

    const estadoAnterior = row?.estado || null;

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        estado: "Observada",
        fecha_observacion: fechaObservacion,
        incidencia_tipo: observacionTipo,
        motivo_incidencia: observacionMotivo.trim(),
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "prenda_observada",
        titulo: "Prenda observada",
        detalle: {
          estado_anterior: estadoAnterior,
          estado_nuevo: "Observada",
          fecha_observacion: fechaObservacion,
          incidencia_tipo: observacionTipo,
          motivo_incidencia: observacionMotivo.trim(),
          nota: observacionNota.trim() || null,
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

    setRow((prev) => ({
      ...prev,
      estado: "Observada",
      fecha_observacion: fechaObservacion,
      incidencia_tipo: observacionTipo,
      motivo_incidencia: observacionMotivo.trim(),
    }));

    setShowMarcarObservada(false);
    setFechaObservacion("");
    setObservacionTipo("");
    setObservacionMotivo("");
    setObservacionNota("");

    alert("Prenda marcada como observada correctamente.");
  } catch (error) {
    console.error("Error marcando prenda como observada:", error);
    alert("No se pudo marcar la prenda como observada.");
  } finally {
    setSavingObservada(false);
  }
}

async function handleGuardarRetiroSubsanacion() {
  if (!id) return;

  if (!fechaRetiroSubsanacion) {
    alert("Seleccioná la fecha de retiro para subsanar observación.");
    return;
  }

  try {
    setSavingRetiroSubsanacion(true);

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        fecha_retiro_subsanacion: fechaRetiroSubsanacion,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "retiro_subsanacion",
        titulo: "Retiro para subsanar observación",
        detalle: {
          estado_actual: row?.estado || null,
          fecha_retiro_subsanacion: fechaRetiroSubsanacion,
          nota:
            "La documentación fue retirada para subsanar la observación informada por el Registro.",
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

    setRow((prev) => ({
      ...prev,
      fecha_retiro_subsanacion: fechaRetiroSubsanacion,
    }));

    setShowRetiroSubsanacion(false);
    setFechaRetiroSubsanacion("");

    alert("Retiro para subsanar observación guardado correctamente.");
  } catch (error) {
    console.error("Error guardando retiro para subsanar:", error);
    alert("No se pudo guardar el retiro para subsanar observación.");
  } finally {
    setSavingRetiroSubsanacion(false);
  }
}

async function handleGuardarReingresoSubsanada() {
  if (!id) return;

  if (!fechaReingresoSubsanada) {
    alert("Seleccioná la fecha de reingreso de observación subsanada.");
    return;
  }

  try {
    setSavingReingresoSubsanada(true);

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        fecha_reingreso_subsanada: fechaReingresoSubsanada,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "reingreso_subsanada",
        titulo: "Reingreso de observación subsanada",
        detalle: {
          estado_actual: row?.estado || null,
          fecha_reingreso_subsanada: fechaReingresoSubsanada,
          nota:
            "La documentación reingresó luego de subsanar la observación informada por el Registro.",
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

    setRow((prev) => ({
      ...prev,
      fecha_reingreso_subsanada: fechaReingresoSubsanada,
    }));

    setShowReingresoSubsanada(false);
    setFechaReingresoSubsanada("");

    alert("Reingreso de observación subsanada guardado correctamente.");
  } catch (error) {
    console.error("Error guardando reingreso subsanado:", error);
    alert("No se pudo guardar el reingreso de observación subsanada.");
  } finally {
    setSavingReingresoSubsanada(false);
  }
}

async function handleGuardarMarcarInscripta() {
  if (!id) return;

  if (!fechaInscripcion) {
    alert("Seleccioná la fecha de inscripción.");
    return;
  }

  try {
    setSavingInscripta(true);

    const [year, month, day] = fechaInscripcion.split("-").map(Number);
    const fechaVencimientoDate = new Date(year + 5, month - 1, day);

    const fechaVencimientoCalculada = [
      fechaVencimientoDate.getFullYear(),
      String(fechaVencimientoDate.getMonth() + 1).padStart(2, "0"),
      String(fechaVencimientoDate.getDate()).padStart(2, "0"),
    ].join("-");

    const estadoAnterior = row?.estado || null;

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        estado: "Inscripta",
        fecha_inscripcion: fechaInscripcion,
        fecha_vencimiento: fechaVencimientoCalculada,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "prenda_inscripta",
        titulo: "Prenda inscripta",
        detalle: {
          estado_anterior: estadoAnterior,
          estado_nuevo: "Inscripta",
          fecha_inscripcion: fechaInscripcion,
          fecha_vencimiento: fechaVencimientoCalculada,
          nota: "La prenda fue inscripta correctamente en el Registro.",
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

    setRow((prev) => ({
      ...prev,
      estado: "Inscripta",
      fecha_inscripcion: fechaInscripcion,
      fecha_vencimiento: fechaVencimientoCalculada,
    }));

    setShowMarcarInscripta(false);
    setFechaInscripcion("");

    alert("Prenda marcada como inscripta correctamente.");
  } catch (error) {
    console.error("Error marcando prenda como inscripta:", error);
    alert("No se pudo marcar la prenda como inscripta.");
  } finally {
    setSavingInscripta(false);
  }
}

async function handleGuardarDisponibleRetiroFinal() {
  if (!id) return;

  if (!fechaDisponibleRetiroFinal) {
    alert("Seleccioná la fecha disponible para retiro.");
    return;
  }

  try {
    setSavingDisponibleRetiroFinal(true);

    const estadoAnterior = row?.estado || null;

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        estado: "Disponible para retiro",
        fecha_disponible_retiro_final: fechaDisponibleRetiroFinal,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "disponible_retiro_final",
        titulo: "Disponible para retiro",
        detalle: {
          estado_anterior: estadoAnterior,
          estado_nuevo: "Disponible para retiro",
          fecha_disponible_retiro_final: fechaDisponibleRetiroFinal,
          nota:
            "SAKI dejó la prenda inscripta disponible para retiro de Día.",
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

    setRow((prev) => ({
      ...prev,
      estado: "Disponible para retiro",
      fecha_disponible_retiro_final: fechaDisponibleRetiroFinal,
    }));

    setShowDisponibleRetiroFinal(false);
    setFechaDisponibleRetiroFinal("");

    alert("Prenda disponible para retiro correctamente.");
  } catch (error) {
    console.error("Error guardando disponible para retiro:", error);
    alert("No se pudo guardar la disponibilidad para retiro.");
  } finally {
    setSavingDisponibleRetiroFinal(false);
  }
}

async function handleGuardarRetiradaFinal() {
  if (!id) return;

  if (!fechaRetiradaFinal) {
    alert("Seleccioná la fecha de retiro final.");
    return;
  }

  try {
    setSavingRetiradaFinal(true);

    const estadoAnterior = row?.estado || null;

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        estado: "Retirada",
        fecha_real_retiro_final: fechaRetiradaFinal,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "prenda_retirada",
        titulo: "Prenda retirada",
        detalle: {
          estado_anterior: estadoAnterior,
          estado_nuevo: "Retirada",
          fecha_retiro_final: fechaRetiradaFinal,
          nota: "Día retiró la prenda inscripta de SAKI.",
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

    setRow((prev) => ({
      ...prev,
      estado: "Retirada",
      fecha_real_retiro_final: fechaRetiradaFinal,
    }));

    setShowRetiradaFinal(false);
    setFechaRetiradaFinal("");

    alert("Retiro final guardado correctamente.");
  } catch (error) {
    console.error("Error guardando retiro final:", error);
    alert("No se pudo guardar el retiro final.");
  } finally {
    setSavingRetiradaFinal(false);
  }
}

async function handleGuardarCerrarLegajo() {
  if (!id) return;

  if (!fechaCierreLegajo) {
    alert("Seleccioná la fecha de cierre del legajo.");
    return;
  }

  try {
    setSavingCerrarLegajo(true);

    const estadoAnterior = row?.estado || null;

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        estado: "Legajo cerrado",
        fecha_cierre_legajo: fechaCierreLegajo,
      })
      .eq("id", id);

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "legajo_cerrado",
        titulo: "Legajo cerrado",
        detalle: {
          estado_anterior: estadoAnterior,
          estado_nuevo: "Legajo cerrado",
          fecha_cierre_legajo: fechaCierreLegajo,
          nota:
            "El trámite fue finalizado y el legajo quedó cerrado sin acciones pendientes.",
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

    setRow((prev) => ({
      ...prev,
      estado: "Legajo cerrado",
      fecha_cierre_legajo: fechaCierreLegajo,
    }));

    setShowCerrarLegajo(false);
    setFechaCierreLegajo("");

    alert("Legajo cerrado correctamente.");
  } catch (error) {
    console.error("Error cerrando legajo:", error);
    alert("No se pudo cerrar el legajo.");
  } finally {
    setSavingCerrarLegajo(false);
  }
}

async function handleGuardarAnularPrenda() {
  if (!id) return;

  if (!motivoAnulacion.trim()) {
    alert("Ingresá el motivo de anulación.");
    return;
  }

  try {
    setSavingAnularPrenda(true);

    const estadoAnterior = row?.estado || null;

    const {
      data: { user },
    } = await supabase.auth.getUser();

const anuladaEn = new Date().toISOString();
const anuladaPor = user?.id || null;
const anuladaPorTexto =
  user?.user_metadata?.full_name || user?.email || "Usuario no identificado";

    const { error } = await supabase
      .from("dia_request_prendas")
      .update({
        estado: "Anulada",
        anulada_en: anuladaEn,
        anulada_por: anuladaPor,
        motivo_anulacion: motivoAnulacion.trim(),
      })
      .eq("id", id);

    if (error) throw error;

    const { data: createdHistory, error: historyError } = await supabase
      .from("dia_request_prendas_history")
      .insert({
        prenda_id: id,
        tipo_evento: "prenda_anulada",
        titulo: "Prenda anulada",
        detalle: {
          estado_anterior: estadoAnterior,
          estado_nuevo: "Anulada",
          anulada_en: anuladaEn,
          anulada_por: anuladaPorTexto,
          motivo_anulacion: motivoAnulacion.trim(),
          nota:
            "El trámite fue anulado y no continuará su circuito operativo.",
        },
        created_by_name: user?.user_metadata?.full_name || null,
        created_by_email: user?.email || null,
        created_at: anuladaEn,
      })
      .select("*")
      .single();

    if (historyError) throw historyError;

    if (createdHistory) {
      setHistoryRows((prev) => [createdHistory, ...prev]);
    }

    setRow((prev) => ({
      ...prev,
      estado: "Anulada",
      anulada_en: anuladaEn,
      anulada_por: anuladaPor,
      motivo_anulacion: motivoAnulacion.trim(),
    }));

    setShowAnularPrenda(false);
    setMotivoAnulacion("");

    alert("Prenda anulada correctamente.");
  } catch (error) {
    console.error("Error anulando prenda:", error);
    alert("No se pudo anular la prenda.");
  } finally {
    setSavingAnularPrenda(false);
  }
}

async function handleEliminarLegajoCompleto() {
  if (!id || !isAdmin) return;

  const confirmacion = confirmacionEliminarLegajo.trim().toUpperCase();

  if (confirmacion !== "ELIMINAR") {
    alert('Para confirmar, escribí "ELIMINAR".');
    return;
  }

  try {
    setSavingEliminarLegajo(true);

    const { data: archivosData, error: archivosError } = await supabase
      .from("dia_request_prendas_files")
      .select("id, storage_path")
      .eq("prenda_id", id);

    if (archivosError) throw archivosError;

    const storagePaths = (archivosData || [])
      .map((file) => file.storage_path)
      .filter(Boolean);

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("dia-prendas-files")
        .remove(storagePaths);

      if (storageError) throw storageError;
    }

    const { error: deleteFilesError } = await supabase
      .from("dia_request_prendas_files")
      .delete()
      .eq("prenda_id", id);

    if (deleteFilesError) throw deleteFilesError;

    const { error: deleteNotesError } = await supabase
      .from("dia_notes")
      .delete()
      .eq("prenda_id", id);

    if (deleteNotesError) throw deleteNotesError;

    const { error: deleteHistoryError } = await supabase
      .from("dia_request_prendas_history")
      .delete()
      .eq("prenda_id", id);

    if (deleteHistoryError) throw deleteHistoryError;

    const { error: deletePrendaError } = await supabase
      .from("dia_request_prendas")
      .delete()
      .eq("id", id);

    if (deletePrendaError) throw deletePrendaError;

    router.push("/dia/prendas");
  } catch (error) {
    console.error("Error eliminando legajo completo:", error);
    alert(error?.message || "No se pudo eliminar el legajo.");
  } finally {
    setSavingEliminarLegajo(false);
  }
}

const casePillItems = [
  row?.importe_prenda
    ? `Importe ${row?.moneda_importe || "$"} ${formatNumberMiles(row.importe_prenda)}`
    : null,
  row?.grado_prenda
    ? `Orden de Prelación ${row.grado_prenda} Grado`
    : null,
  row?.plazo_anios
    ? `Plazo ${row.plazo_anios} años`
    : null,
  row?.fecha_inscripcion
    ? `Inscripción ${formatDate(row.fecha_inscripcion)}`
    : `Inscripción —`,
  row?.fecha_vencimiento ? (
  <span style={{ color: "#fde68a" }}>
    Reinscripción {formatDate(row.fecha_vencimiento)}
  </span>
) : (
  "Reinscripción —"
),
].filter(Boolean);

const estadoFechaInfo = (() => {
  if (estadoActualKey === "PENDIENTE DE ENVIO") {
    return {
      label: "Programado",
      value: formatDate(row?.fecha_envio_oficina),
    };
  }

  if (estadoActualKey === "EN REVISION") {
    return {
      label: "Recibida",
      value: formatDate(row?.fecha_recepcion_inicial_oficina),
    };
  }

  if (estadoActualKey === "RECTIFICACION SOLICITADA") {
    if (row?.fecha_reingreso_correccion) {
      return {
        label: "Reingresada",
        value: formatDate(row?.fecha_reingreso_correccion),
      };
    }

    if (row?.fecha_reenvio_oficina) {
      return {
        label: "Reenvío",
        value: formatDate(row?.fecha_reenvio_oficina),
      };
    }

    if (row?.fecha_retiro_correccion) {
      return {
        label: "Retirada",
        value: formatDate(row?.fecha_retiro_correccion),
      };
    }

    if (row?.fecha_disponible_retiro_correccion) {
      return {
        label: "Disponible",
        value: formatDate(row?.fecha_disponible_retiro_correccion),
      };
    }

    return {
      label: "Solicitada",
      value: null,
    };
  }

  if (estadoActualKey === "EN CURSO") {
    if (row?.fecha_presentacion_registro) {
      return {
        label: "Presentada",
        value: formatDate(row?.fecha_presentacion_registro),
      };
    }

    return {
      label: "Desde",
      value: formatDate(row?.fecha_pase_en_curso),
    };
  }

  if (estadoActualKey === "OBSERVADA") {
    if (row?.fecha_reingreso_subsanada) {
      return {
        label: "Reingresada",
        value: formatDate(row?.fecha_reingreso_subsanada),
      };
    }

    if (row?.fecha_retiro_subsanacion) {
      return {
        label: "Retirada",
        value: formatDate(row?.fecha_retiro_subsanacion),
      };
    }

    return {
      label: "Observada",
      value: formatDate(row?.fecha_observacion),
    };
  }

  if (estadoActualKey === "INSCRIPTA") {
    return {
      label: "Inscripta",
      value: formatDate(row?.fecha_inscripcion),
    };
  }

  if (estadoActualKey === "DISPONIBLE PARA RETIRO") {
    return {
      label: "Disponible",
      value: formatDate(row?.fecha_disponible_retiro_final),
    };
  }

  if (estadoActualKey === "RETIRADA") {
    return {
      label: "Retirada",
      value: formatDate(row?.fecha_real_retiro_final),
    };
  }

  if (estadoActualKey === "LEGAJO CERRADO") {
    return {
      label: "Cierre",
      value: formatDate(row?.fecha_cierre_legajo),
    };
  }

  if (estadoActualKey === "ANULADA") {
    return {
      label: "Anulada",
      value: formatDate(row?.anulada_en),
    };
  }

  return {
    label: "Fecha",
    value: null,
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

  if (
    estadoActualKey === "PENDIENTE DE ENVIO" ||
    estadoActualKey === "RECTIFICACION SOLICITADA" ||
    estadoActualKey === "DISPONIBLE PARA RETIRO" ||
    estadoActualKey === "RETIRADA"
  ) {
    return amber;
  }

  if (estadoActualKey === "EN REVISION") {
  return {
    bg: "rgba(14, 165, 233, 0.24)",
    border: "rgba(125, 211, 252, 0.52)",
    color: "#e0f2fe",
    dot: "#38bdf8",
  };
}

if (estadoActualKey === "EN CURSO") {
  return blue;
}

  if (
    estadoActualKey === "OBSERVADA" ||
    estadoActualKey === "ANULADA"
  ) {
    return red;
  }

  if (
    estadoActualKey === "INSCRIPTA" ||
    estadoActualKey === "LEGAJO CERRADO"
  ) {
    return green;
  }

  return blue;
})();

const proximaAccionInfo = (() => {
  if (estadoActualKey === "PENDIENTE DE ENVIO") {
    return {
      titulo: "Preparar envío",
      texto: "La prenda se encuentra pendiente de envío según la fecha programada.",
      boton: "Ver detalle del envío →",
    };
  }

  if (estadoActualKey === "EN REVISION") {
    return {
      titulo: "Prenda en revisión",
      texto: "SAKI está validando la documentación antes de avanzar.",
      boton: "Ver revisión →",
    };
  }

  if (estadoActualKey === "RECTIFICACION SOLICITADA") {
    if (row?.fecha_reingreso_correccion) {
      return {
        titulo: "Prenda rectificada reingresada",
        texto: "SAKI debe revisar la documentación rectificada y definir si avanza a En curso.",
        boton: "Ver reingreso rectificado →",
      };
    }

    if (row?.fecha_reenvio_oficina) {
      return {
        titulo: "Reenvío rectificado programado",
        texto: "Día informó una nueva fecha de envío de la prenda rectificada.",
        boton: "Ver reprogramación →",
      };
    }

    if (row?.fecha_retiro_correccion) {
      return {
        titulo: "Prenda retirada para corrección",
        texto: "Día retiró la prenda de SAKI para gestionar la rectificación solicitada.",
        boton: "Ver retiro por corrección →",
      };
    }

    if (row?.fecha_disponible_retiro_correccion) {
      return {
        titulo: "Lista para retiro por corrección",
        texto: "Día debe retirar la prenda de SAKI para gestionar la rectificación solicitada.",
        boton: "Ver retiro por corrección →",
      };
    }

    return {
      titulo: "Rectificación solicitada",
      texto: "SAKI solicitó corregir la prenda antes de continuar el trámite.",
      boton: "Ver rectificación →",
    };
  }

  if (estadoActualKey === "EN CURSO") {
    if (row?.fecha_presentacion_registro) {
      return {
        titulo: "Esperar resultado registral",
        texto: "La prenda fue presentada en Registro y se encuentra pendiente de resultado.",
        boton: "Ver presentación →",
      };
    }

    return {
      titulo: "Trámite en curso",
      texto: "La prenda fue validada por SAKI y se encuentra en gestión.",
      boton: "Ver trámite →",
    };
  }

  if (estadoActualKey === "OBSERVADA") {
    if (row?.fecha_reingreso_subsanada) {
      return {
        titulo: "Observación subsanada",
        texto: "La documentación reingresó luego de subsanar la observación registral.",
        boton: "Ver subsanación →",
      };
    }

    if (row?.fecha_retiro_subsanacion) {
      return {
        titulo: "Subsanación en curso",
        texto: "La documentación fue retirada para subsanar la observación informada por el Registro.",
        boton: "Ver retiro para subsanar →",
      };
    }

    return {
      titulo: "Subsanar observación",
      texto: "El trámite presenta una observación registral pendiente de subsanación.",
      boton: "Ver detalle de la observación →",
    };
  }

  if (estadoActualKey === "INSCRIPTA") {
    return {
      titulo: "Preparar retiro final",
      texto: "La prenda fue inscripta correctamente y debe quedar disponible para retiro.",
      boton: "Ver inscripción →",
    };
  }

  if (estadoActualKey === "DISPONIBLE PARA RETIRO") {
    return {
      titulo: "Lista para retiro",
      texto: "Día debe retirar la prenda inscripta de SAKI.",
      boton: "Ver retiro final →",
    };
  }

  if (estadoActualKey === "RETIRADA") {
    return {
      titulo: "Cerrar legajo",
      texto: "Día ya retiró la prenda. SAKI puede cerrar administrativamente el legajo.",
      boton: "Ver cierre →",
    };
  }

  if (estadoActualKey === "LEGAJO CERRADO") {
    return {
      titulo: "Trámite finalizado",
      texto: "El legajo se encuentra cerrado sin acciones pendientes.",
      boton: "Ver historial →",
    };
  }

  if (estadoActualKey === "ANULADA") {
    return {
      titulo: "Trámite anulado",
      texto: "El trámite fue anulado y no continuará su circuito operativo.",
      boton: "Ver anulación →",
    };
  }

  return {
    titulo: "Revisar trámite",
    texto: "Verificá el estado actual y la trazabilidad del legajo.",
    boton: "Ver detalle del trámite →",
  };
})();

const resumenLegajoTexto = [
  "SAKI · Prendas M&T",
  "",
  `Dominio: ${row?.dominio || "Por completar"}`,
  `Tienda: ${row?.tienda || "Por completar"}`,
  `Franquiciado: ${row?.frq || "Por completar"}`,
  `CUIT FRQ: ${formatCuit(row?.frq_cuit) || "Por completar"}`,
  "",
  `Estado: ${estadoActual || "Por completar"}`,
  `${estadoFechaInfo?.label || "Fecha"}: ${
    estadoFechaInfo?.value || "Por completar"
  }`,
  `Próxima acción: ${proximaAccionInfo?.titulo || "Por completar"}`,
  "",
  `Titular / Garante: ${row?.titular_dominio || "Por completar"}`,
  `CUIT titular: ${formatCuit(row?.titular_cuit) || "Por completar"}`,
  `Titularidad: ${
    row?.porcentaje_titular ? `${row.porcentaje_titular}%` : "Por completar"
  }`,
  "",
  `Importe: ${
  row?.importe_prenda
    ? `${row?.moneda_importe || "$"} ${formatNumberMiles(row.importe_prenda)}`
    : "Por completar"
}`,
`Grado: ${row?.grado_prenda || "Por completar"}`,
`Plazo: ${row?.plazo_anios ? `${row.plazo_anios} años` : "Por completar"}`,
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
  onClick={() => router.push("/dia")}
/>
<NavItem
  icon={<ShieldCheck size={22} />}
  label="Prenda"
  onClick={() => setActiveFicha("prenda")}
/>
<NavItem
  icon={<Car size={22} />}
  label="Dominio"
  onClick={() => setActiveFicha("dominio")}
/>
<NavItem
  icon={<Store size={22} />}
  label="Franquiciado"
  onClick={() => setActiveFicha("frq")}
/>
<NavItem
  icon={<UserRound size={22} />}
  label="Garante / Titular"
  onClick={() => setActiveFicha("garante")}
/>
<NavItem
  icon={<Flag size={22} />}
  label="Estado del trámite"
  onClick={() => setActiveFicha("estado")}
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
  onClick={() => router.push("/dia/prendas")}
>
  <ArrowLeft size={20} />
  <span className="sidebar-label">Volver al listado</span>
</button>
      </aside>

      <main style={mainStyle}>
        <div style={topBarStyle}>
        
    <div>

  <div style={eyebrowStyle}>Management &amp; Tracking</div>
  <h1 style={titleStyle}>Prendas | M&amp;T</h1>
</div>
            

         <div style={topIconsStyle}>
{isAdmin && (
  <>
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
      Cargar / editar datos del legajo
    </button>

    <button
      type="button"
      onClick={() => {
        setConfirmacionEliminarLegajo("");
        setShowEliminarLegajo(true);
      }}
      style={{
        height: "38px",
        padding: "0 14px",
        borderRadius: "999px",
        border: "1px solid rgba(248, 113, 113, 0.32)",
        background:
          "linear-gradient(135deg, rgba(127, 29, 29, 0.34), rgba(220, 38, 38, 0.18))",
        color: "#fecaca",
        fontSize: "12px",
        fontWeight: 850,
        letterSpacing: "0.02em",
        cursor: "pointer",
        whiteSpace: "nowrap",
        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.20)",
      }}
    >
      Eliminar legajo
    </button>
  </>
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
    value={row?.frq || "—"}
  />

  <ContextItem
    icon={<Car size={32} />}
    label="DOMINIO"
    value={row?.dominio || "—"}
  />
</section>

<section style={caseOverviewStyle}>
  <div style={caseOverviewTopStyle}>
    <div>
      <div style={caseLabelStyle}>DOMINIO</div>
<div style={caseDomainStyle}>{row?.dominio || "—"}</div>

      <div style={caseMoneyPillStyle}>
  <span style={caseMoneyIconStyle}>
    <CircleDollarSign size={16} />
  </span>
  {casePillItems.length > 0 ? (
  casePillItems.map((item, index) => (
    <span
      key={item}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      {index > 0 && <span style={caseDotStyle}>·</span>}
      <span>{item}</span>
    </span>
  ))
) : (
  <span>Condiciones de la prenda por completar</span>
)}

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

{estadoActualKey !== "PENDIENTE DE ENVIO" && (
  <div style={caseStatusSubStyle}>
    {estadoActualKey === "OBSERVADA"
      ? "Requiere subsanación"
      : estadoActualKey === "INSCRIPTA"
      ? "Prenda inscripta"
      : estadoActualKey === "EN CURSO"
      ? "Trámite en gestión"
      : estadoActualKey === "DISPONIBLE PARA RETIRO"
      ? "Disponible para retiro"
      : estadoActualKey === "RETIRADA"
      ? "Retirada"
      : estadoActualKey === "LEGAJO CERRADO"
      ? "Legajo cerrado"
      : estadoActualKey === "ANULADA"
      ? "Legajo anulado"
      : "Estado del trámite"}
  </div>
)}

      <div style={caseDateStyle}>
  {estadoFechaInfo.value ? (
    <>
      {estadoFechaInfo.label} <strong>{estadoFechaInfo.value}</strong>
    </>
  ) : (
    <span>Fecha por completar</span>
  )}
</div>

      {mostrarVencimiento && (
        <div style={caseDateStyle}>
          Vencimiento <strong>{fechaVencimiento}</strong>
        </div>
      )}
    </div>

    <div style={caseActionBlockStyle}>
      <div style={caseLabelStyle}>PRÓXIMA ACCIÓN</div>

      <div style={caseActionTitleStyle}>{proximaAccionInfo.titulo}</div>

<div style={caseActionTextStyle}>
  {proximaAccionInfo.texto}
</div>
    </div>

    <div style={caseActionButtonWrapStyle}>
      <button style={caseActionButtonStyle} onClick={() => setActiveFicha("estado")}>
  {proximaAccionInfo.boton}
</button>
    </div>
  </div>
</section>
        <section style={cardsGridStyle}>
          <InfoCard
  icon={<ShieldCheck size={30} />}
  title="PRENDA"
  items={[
  [
    "Instrumento",
    row?.numero_escritura
      ? `Escritura ${row.numero_escritura}`
      : "Por completar",
  ],
  ["Folio", row?.folio || "Por completar"],
  ["Fecha", formatDate(row?.fecha_escritura) || "Por completar"],
  ["Inscripción", formatDate(row?.fecha_inscripcion) || "—"],
  ["Reinscripción", formatDate(row?.fecha_vencimiento) || "—"],
  ["Escribanía", row?.escribania || "Por completar"],
]}
  action={null}
  onClick={() => setActiveFicha("prenda")}
/>

<InfoCard
  icon={<Car size={30} />}
  title="DOMINIO"
  items={[
    ["Dominio", row?.dominio || "Por completar"],
    ["Marca", row?.marca || "Por completar"],
    ["Modelo", row?.modelo || "Por completar"],
    ["Modelo año", row?.modelo_anio || "Por completar"],
  ]}
  action={null}
  onClick={() => setActiveFicha("dominio")}
/>

          <InfoCard
  icon={<Store size={30} />}
  title="FRANQUICIADO"
  items={[
    ["Nombre", row?.frq || "Por completar"],
    ["CUIT", formatCuit(row?.frq_cuit) || "Por completar"],
    ["Tienda", row?.tienda || "Por completar"],
  ]}
  action={null}
  onClick={() => setActiveFicha("frq")}
/>

          <InfoCard
  icon={<UserRound size={30} />}
  title="GARANTE / TITULAR"
  items={[
    [
  "Nombre",
  row?.titular_tipo_persona === "JURIDICA"
    ? row?.titular_razon_social || "Por completar"
    : `${row?.titular_apellido || ""} ${row?.titular_nombres || ""}`.trim() ||
      "Por completar",
],
    [
  "CUIT",
  formatCuit(row?.titular_cuil_cuit || row?.titular_cuit) ||
    "Por completar",
],
    [
      "Titularidad",
      row?.porcentaje_titular
        ? `${row.porcentaje_titular}%`
        : "Por completar",
    ],
  ]}
  action={null}
  onClick={() => setActiveFicha("garante")}
/>
         
        </section>
      </main>

      {activeFicha && (
        <div style={overlayStyle}>
          <div style={floatingCardStyle} onClick={(e) => e.stopPropagation()}>
            <button style={closeButtonStyle} onClick={() => setActiveFicha(null)}>
              ×
            </button>

            {activeFicha === "prenda" && <FichaPrenda row={row} />}
{activeFicha === "dominio" && <FichaDominio row={row} />}
{activeFicha === "frq" && <FichaFrq row={row} />}
{activeFicha === "garante" && <FichaGarante row={row} />}
{activeFicha === "estado" && (
  <FichaEstado
    row={row}
    estadoActual={estadoActual}
    estadoActualKey={estadoActualKey}
    estadoFechaInfo={estadoFechaInfo}
    proximaAccionInfo={proximaAccionInfo}
    isAdmin={isAdmin}
    canOperatePrendas={canOperatePrendas}
    onReprogramarEnvio={() => {
      setNuevaFechaEnvio(row?.fecha_envio_oficina || "");
      setShowReprogramarEnvio(true);
    }}
    onRecibirPrenda={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaRecepcionSaki(hoy);
      setShowRecibirPrenda(true);
    }}
    onAprobarRevision={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaPaseEnCurso(hoy);
      setShowAprobarRevision(true);
    }}
    onSolicitarRectificacion={() => {
      setRectificacionTipo("");
      setRectificacionMotivo("");
      setRectificacionNota("");
      setShowSolicitarRectificacion(true);
    }}
    onDisponibleRetiroCorreccion={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaDisponibleRetiroCorreccion(hoy);
      setShowDisponibleRetiroCorreccion(true);
    }}
    onRetiroCorreccion={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaRetiroCorreccion(hoy);
      setShowRetiroCorreccion(true);
    }}
    onReprogramacionRectificacion={() => {
      setFechaReenvioOficina(row?.fecha_reenvio_oficina || "");
      setShowReprogramacionRectificacion(true);
    }}
    onReingresoCorreccion={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaReingresoCorreccion(hoy);
      setShowReingresoCorreccion(true);
    }}
    onPresentacionRegistro={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaPresentacionRegistro(hoy);
      setShowPresentacionRegistro(true);
    }}
    onMarcarObservada={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaObservacion(hoy);
      setObservacionTipo("");
      setObservacionMotivo("");
      setObservacionNota("");
      setShowMarcarObservada(true);
    }}
    onRetiroSubsanacion={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaRetiroSubsanacion(hoy);
      setShowRetiroSubsanacion(true);
    }}
    onReingresoSubsanada={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaReingresoSubsanada(hoy);
      setShowReingresoSubsanada(true);
    }}
    onMarcarInscripta={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaInscripcion(hoy);
      setShowMarcarInscripta(true);
    }}
    onDisponibleRetiroFinal={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaDisponibleRetiroFinal(hoy);
      setShowDisponibleRetiroFinal(true);
    }}
    onRetiradaFinal={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaRetiradaFinal(hoy);
      setShowRetiradaFinal(true);
    }}
    onCerrarLegajo={() => {
      const hoy = new Date().toISOString().slice(0, 10);
      setFechaCierreLegajo(hoy);
      setShowCerrarLegajo(true);
    }}
    onAnularPrenda={() => {
      setMotivoAnulacion("");
      setShowAnularPrenda(true);
    }}
  />
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
  onPrintResumen={handlePrintResumenLegajo}
  onPrintPrenda={handlePrintFichaPrenda}
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
{activeFicha === "trazabilidad" && <FichaTrazabilidad row={row} />}
{activeFicha === "avisos" && <FichaAvisos />}
{activeFicha === "reporte" && <FichaReporte />}
          </div>
        </div>
      )}
{showReprogramarEnvio && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowReprogramarEnvio(false);
      setNuevaFechaEnvio("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(520px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Estado del trámite
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Reprogramar envío
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Seleccioná una nueva fecha de envío para esta prenda.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Nueva fecha de envío
        </label>

        <input
          type="date"
          value={nuevaFechaEnvio}
          onChange={(e) => setNuevaFechaEnvio(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowReprogramarEnvio(false);
            setNuevaFechaEnvio("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarReprogramacion}
          disabled={savingReprogramacion}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #2f6df6, #1d4ed8)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingReprogramacion ? "not-allowed" : "pointer",
            opacity: savingReprogramacion ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(37,99,235,0.24)",
          }}
        >
          {savingReprogramacion ? "Guardando..." : "Guardar fecha"}
        </button>
      </div>
    </div>
  </div>
)}

{showRecibirPrenda && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowRecibirPrenda(false);
      setFechaRecepcionSaki("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(520px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Estado del trámite
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Recibir prenda en SAKI
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha en la que SAKI recibió físicamente la prenda.
          Al guardar, el trámite pasará a estado En revisión.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha de recepción en SAKI
        </label>

        <input
          type="date"
          value={fechaRecepcionSaki}
          onChange={(e) => setFechaRecepcionSaki(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowRecibirPrenda(false);
            setFechaRecepcionSaki("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarRecepcionSaki}
          disabled={savingRecepcionSaki}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #16a34a, #15803d)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingRecepcionSaki ? "not-allowed" : "pointer",
            opacity: savingRecepcionSaki ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(22,163,74,0.24)",
          }}
        >
          {savingRecepcionSaki ? "Guardando..." : "Confirmar recepción"}
        </button>
      </div>
    </div>
  </div>
)}

{showAprobarRevision && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowAprobarRevision(false);
      setFechaPaseEnCurso("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(520px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Estado del trámite
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Aprobar revisión
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha en la que SAKI validó la prenda. Al guardar, el trámite pasará a estado En curso.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha de pase a En curso
        </label>

        <input
          type="date"
          value={fechaPaseEnCurso}
          onChange={(e) => setFechaPaseEnCurso(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowAprobarRevision(false);
            setFechaPaseEnCurso("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarAprobarRevision}
          disabled={savingAprobarRevision}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingAprobarRevision ? "not-allowed" : "pointer",
            opacity: savingAprobarRevision ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(37,99,235,0.24)",
          }}
        >
          {savingAprobarRevision ? "Guardando..." : "Confirmar revisión"}
        </button>
      </div>
    </div>
  </div>
)}

{showSolicitarRectificacion && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowSolicitarRectificacion(false);
      setRectificacionTipo("");
      setRectificacionMotivo("");
      setRectificacionNota("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(620px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Estado del trámite
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Solicitar rectificación
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Indicá qué debe corregirse antes de continuar el trámite. Esta información quedará registrada en el historial del legajo.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#90a7c7",
              marginBottom: "10px",
            }}
          >
            Tipo de rectificación
          </label>

          <select
            value={rectificacionTipo}
            onChange={(e) => setRectificacionTipo(e.target.value)}
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(3, 11, 24, 0.72)",
              color: "#f8fbff",
              padding: "0 14px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              colorScheme: "dark",
            }}
          >
            <option value="">Seleccionar tipo</option>
            <option value="rectificacion_escribania_interviniente">
  Rectificación por escribanía interviniente
</option>
            <option value="error_documental">Error documental</option>
            <option value="datos_incompletos">Datos incompletos</option>
            <option value="diferencia_datos">Diferencia en datos</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#90a7c7",
              marginBottom: "10px",
            }}
          >
            Motivo de rectificación
          </label>

          <textarea
            value={rectificacionMotivo}
            onChange={(e) => setRectificacionMotivo(e.target.value)}
            placeholder="Ej.: La escritura presenta un error en el CUIT del titular."
            style={{
              width: "100%",
              minHeight: "92px",
              resize: "vertical",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(3, 11, 24, 0.72)",
              color: "#f8fbff",
              padding: "13px 14px",
              fontSize: "14px",
              lineHeight: 1.45,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#90a7c7",
              marginBottom: "10px",
            }}
          >
            Nota del movimiento
          </label>

          <textarea
            value={rectificacionNota}
            onChange={(e) => setRectificacionNota(e.target.value)}
            placeholder="Opcional. Ej.: Se informa a Día que la prenda queda pendiente de retiro para corrección."
            style={{
              width: "100%",
              minHeight: "76px",
              resize: "vertical",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(3, 11, 24, 0.72)",
              color: "#f8fbff",
              padding: "13px 14px",
              fontSize: "14px",
              lineHeight: 1.45,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowSolicitarRectificacion(false);
            setRectificacionTipo("");
            setRectificacionMotivo("");
            setRectificacionNota("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarSolicitarRectificacion}
          disabled={savingRectificacion}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #f59e0b, #d97706)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingRectificacion ? "not-allowed" : "pointer",
            opacity: savingRectificacion ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(245,158,11,0.24)",
          }}
        >
          {savingRectificacion ? "Guardando..." : "Solicitar rectificación"}
        </button>
      </div>
    </div>
  </div>
)}

{showDisponibleRetiroCorreccion && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowDisponibleRetiroCorreccion(false);
      setFechaDisponibleRetiroCorreccion("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Rectificación solicitada
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Disponible para retiro por corrección
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha en la que SAKI deja la prenda disponible para que Día la retire y gestione la rectificación.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha disponible para retiro
        </label>

        <input
          type="date"
          value={fechaDisponibleRetiroCorreccion}
          onChange={(e) => setFechaDisponibleRetiroCorreccion(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowDisponibleRetiroCorreccion(false);
            setFechaDisponibleRetiroCorreccion("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarDisponibleRetiroCorreccion}
          disabled={savingDisponibleRetiroCorreccion}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #f59e0b, #d97706)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingDisponibleRetiroCorreccion ? "not-allowed" : "pointer",
            opacity: savingDisponibleRetiroCorreccion ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(245,158,11,0.24)",
          }}
        >
          {savingDisponibleRetiroCorreccion
            ? "Guardando..."
            : "Guardar fecha"}
        </button>
      </div>
    </div>
  </div>
)}

{showRetiroCorreccion && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowRetiroCorreccion(false);
      setFechaRetiroCorreccion("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Rectificación solicitada
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Retiro para rectificación
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha en la que Día retiró la prenda de SAKI para gestionar la rectificación solicitada.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha de retiro para rectificación
        </label>

        <input
          type="date"
          value={fechaRetiroCorreccion}
          onChange={(e) => setFechaRetiroCorreccion(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowRetiroCorreccion(false);
            setFechaRetiroCorreccion("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarRetiroCorreccion}
          disabled={savingRetiroCorreccion}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #f97316, #ea580c)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingRetiroCorreccion ? "not-allowed" : "pointer",
            opacity: savingRetiroCorreccion ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(249,115,22,0.24)",
          }}
        >
          {savingRetiroCorreccion ? "Guardando..." : "Guardar retiro"}
        </button>
      </div>
    </div>
  </div>
)}

{showReprogramacionRectificacion && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowReprogramacionRectificacion(false);
      setFechaReenvioOficina("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Rectificación solicitada
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Reprogramar envío rectificado
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Cargá la nueva fecha informada por Día para enviar nuevamente la prenda rectificada.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Nueva fecha de envío
        </label>

        <input
          type="date"
          value={fechaReenvioOficina}
          onChange={(e) => setFechaReenvioOficina(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowReprogramacionRectificacion(false);
            setFechaReenvioOficina("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarReprogramacionRectificacion}
          disabled={savingReprogramacionRectificacion}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #f59e0b, #d97706)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingReprogramacionRectificacion ? "not-allowed" : "pointer",
            opacity: savingReprogramacionRectificacion ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(245,158,11,0.24)",
          }}
        >
          {savingReprogramacionRectificacion ? "Guardando..." : "Guardar fecha"}
        </button>
      </div>
    </div>
  </div>
)}

{showReingresoCorreccion && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowReingresoCorreccion(false);
      setFechaReingresoCorreccion("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Rectificación solicitada
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Reingreso de prenda rectificada
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha en la que la prenda rectificada volvió a ingresar a SAKI.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha de reingreso
        </label>

        <input
          type="date"
          value={fechaReingresoCorreccion}
          onChange={(e) => setFechaReingresoCorreccion(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowReingresoCorreccion(false);
            setFechaReingresoCorreccion("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarReingresoCorreccion}
          disabled={savingReingresoCorreccion}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #16a34a, #15803d)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingReingresoCorreccion ? "not-allowed" : "pointer",
            opacity: savingReingresoCorreccion ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(22,163,74,0.24)",
          }}
        >
          {savingReingresoCorreccion ? "Guardando..." : "Guardar reingreso"}
        </button>
      </div>
    </div>
  </div>
)}

{showPresentacionRegistro && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowPresentacionRegistro(false);
      setFechaPresentacionRegistro("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          En curso
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Presentación en Registro
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha en la que SAKI presentó la prenda ante el Registro interviniente.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha de presentación en Registro
        </label>

        <input
          type="date"
          value={fechaPresentacionRegistro}
          onChange={(e) => setFechaPresentacionRegistro(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowPresentacionRegistro(false);
            setFechaPresentacionRegistro("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarPresentacionRegistro}
          disabled={savingPresentacionRegistro}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingPresentacionRegistro ? "not-allowed" : "pointer",
            opacity: savingPresentacionRegistro ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(37,99,235,0.24)",
          }}
        >
          {savingPresentacionRegistro ? "Guardando..." : "Guardar presentación"}
        </button>
      </div>
    </div>
  </div>
)}

{showMarcarObservada && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowMarcarObservada(false);
      setFechaObservacion("");
      setObservacionTipo("");
      setObservacionMotivo("");
      setObservacionNota("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(620px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Resultado registral
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Marcar como observada
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Cargá la fecha, el tipo y el motivo de la observación informada por el Registro.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#90a7c7",
              marginBottom: "10px",
            }}
          >
            Fecha de observación
          </label>

          <input
            type="date"
            value={fechaObservacion}
            onChange={(e) => setFechaObservacion(e.target.value)}
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(3, 11, 24, 0.72)",
              color: "#f8fbff",
              padding: "0 14px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              colorScheme: "dark",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#90a7c7",
              marginBottom: "10px",
            }}
          >
            Tipo de observación
          </label>

          <select
            value={observacionTipo}
            onChange={(e) => setObservacionTipo(e.target.value)}
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(3, 11, 24, 0.72)",
              color: "#f8fbff",
              padding: "0 14px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              colorScheme: "dark",
            }}
          >
            <option value="">Seleccionar tipo</option>
            <option value="observacion_formal">Observación formal</option>
            <option value="observacion_registral">Observación registral</option>
            <option value="observacion_documental">Observación documental</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#90a7c7",
              marginBottom: "10px",
            }}
          >
            Motivo de observación
          </label>

          <textarea
            value={observacionMotivo}
            onChange={(e) => setObservacionMotivo(e.target.value)}
            placeholder="Ej.: El Registro observó diferencias en los datos consignados."
            style={{
              width: "100%",
              minHeight: "92px",
              resize: "vertical",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(3, 11, 24, 0.72)",
              color: "#f8fbff",
              padding: "13px 14px",
              fontSize: "14px",
              lineHeight: 1.45,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#90a7c7",
              marginBottom: "10px",
            }}
          >
            Nota del movimiento
          </label>

          <textarea
            value={observacionNota}
            onChange={(e) => setObservacionNota(e.target.value)}
            placeholder="Opcional. Ej.: Se deberá subsanar la observación antes de continuar."
            style={{
              width: "100%",
              minHeight: "76px",
              resize: "vertical",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(3, 11, 24, 0.72)",
              color: "#f8fbff",
              padding: "13px 14px",
              fontSize: "14px",
              lineHeight: 1.45,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowMarcarObservada(false);
            setFechaObservacion("");
            setObservacionTipo("");
            setObservacionMotivo("");
            setObservacionNota("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarMarcarObservada}
          disabled={savingObservada}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #ef4444, #b91c1c)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingObservada ? "not-allowed" : "pointer",
            opacity: savingObservada ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(239,68,68,0.24)",
          }}
        >
          {savingObservada ? "Guardando..." : "Marcar observada"}
        </button>
      </div>
    </div>
  </div>
)}

{showRetiroSubsanacion && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowRetiroSubsanacion(false);
      setFechaRetiroSubsanacion("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Observación registral
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Retiro para subsanar observación
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha en la que se retiró la documentación para subsanar la observación informada por el Registro.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha de retiro para subsanar
        </label>

        <input
          type="date"
          value={fechaRetiroSubsanacion}
          onChange={(e) => setFechaRetiroSubsanacion(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowRetiroSubsanacion(false);
            setFechaRetiroSubsanacion("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarRetiroSubsanacion}
          disabled={savingRetiroSubsanacion}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #ef4444, #b91c1c)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingRetiroSubsanacion ? "not-allowed" : "pointer",
            opacity: savingRetiroSubsanacion ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(239,68,68,0.24)",
          }}
        >
          {savingRetiroSubsanacion ? "Guardando..." : "Guardar retiro"}
        </button>
      </div>
    </div>
  </div>
)}

{showReingresoSubsanada && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowReingresoSubsanada(false);
      setFechaReingresoSubsanada("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Observación registral
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Reingreso de observación subsanada
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha en la que reingresó la documentación luego de subsanar la observación.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha de reingreso subsanado
        </label>

        <input
          type="date"
          value={fechaReingresoSubsanada}
          onChange={(e) => setFechaReingresoSubsanada(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowReingresoSubsanada(false);
            setFechaReingresoSubsanada("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarReingresoSubsanada}
          disabled={savingReingresoSubsanada}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #f97316, #ea580c)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingReingresoSubsanada ? "not-allowed" : "pointer",
            opacity: savingReingresoSubsanada ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(249,115,22,0.24)",
          }}
        >
          {savingReingresoSubsanada ? "Guardando..." : "Guardar reingreso"}
        </button>
      </div>
    </div>
  </div>
)}

{showMarcarInscripta && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowMarcarInscripta(false);
      setFechaInscripcion("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Resultado registral
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Marcar como inscripta
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha de inscripción. El sistema calculará automáticamente el vencimiento a 5 años.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha de inscripción
        </label>

        <input
          type="date"
          value={fechaInscripcion}
          onChange={(e) => setFechaInscripcion(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowMarcarInscripta(false);
            setFechaInscripcion("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarMarcarInscripta}
          disabled={savingInscripta}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #16a34a, #15803d)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingInscripta ? "not-allowed" : "pointer",
            opacity: savingInscripta ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(22,163,74,0.24)",
          }}
        >
          {savingInscripta ? "Guardando..." : "Marcar inscripta"}
        </button>
      </div>
    </div>
  </div>
)}

{showDisponibleRetiroFinal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowDisponibleRetiroFinal(false);
      setFechaDisponibleRetiroFinal("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Prenda inscripta
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Disponible para retiro
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha en la que SAKI dejó la prenda inscripta disponible para retiro de Día.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha disponible para retiro
        </label>

        <input
          type="date"
          value={fechaDisponibleRetiroFinal}
          onChange={(e) => setFechaDisponibleRetiroFinal(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowDisponibleRetiroFinal(false);
            setFechaDisponibleRetiroFinal("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarDisponibleRetiroFinal}
          disabled={savingDisponibleRetiroFinal}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #f59e0b, #d97706)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingDisponibleRetiroFinal ? "not-allowed" : "pointer",
            opacity: savingDisponibleRetiroFinal ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(245,158,11,0.24)",
          }}
        >
          {savingDisponibleRetiroFinal ? "Guardando..." : "Guardar disponibilidad"}
        </button>
      </div>
    </div>
  </div>
)}

{showRetiradaFinal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowRetiradaFinal(false);
      setFechaRetiradaFinal("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Retiro final
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Registrar retiro final
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha en la que Día retiró físicamente la prenda inscripta de SAKI.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha de retiro final
        </label>

        <input
          type="date"
          value={fechaRetiradaFinal}
          onChange={(e) => setFechaRetiradaFinal(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowRetiradaFinal(false);
            setFechaRetiradaFinal("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarRetiradaFinal}
          disabled={savingRetiradaFinal}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #f59e0b, #d97706)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingRetiradaFinal ? "not-allowed" : "pointer",
            opacity: savingRetiradaFinal ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(245,158,11,0.24)",
          }}
        >
          {savingRetiradaFinal ? "Guardando..." : "Guardar retiro"}
        </button>
      </div>
    </div>
  </div>
)}

{showCerrarLegajo && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.62)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowCerrarLegajo(false);
      setFechaCierreLegajo("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(540px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(18,52,91,0.98) 0%, rgba(10,31,58,0.98) 100%)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.44)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8fb9e8",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Cierre administrativo
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Cerrar legajo
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(214,228,245,0.78)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Confirmá la fecha de cierre administrativo del trámite. Al guardar, el legajo quedará cerrado sin acciones pendientes.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(3,18,34,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#90a7c7",
            marginBottom: "10px",
          }}
        >
          Fecha de cierre del legajo
        </label>

        <input
          type="date"
          value={fechaCierreLegajo}
          onChange={(e) => setFechaCierreLegajo(e.target.value)}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            colorScheme: "dark",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowCerrarLegajo(false);
            setFechaCierreLegajo("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#dbeafe",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarCerrarLegajo}
          disabled={savingCerrarLegajo}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #16a34a, #15803d)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingCerrarLegajo ? "not-allowed" : "pointer",
            opacity: savingCerrarLegajo ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(22,163,74,0.24)",
          }}
        >
          {savingCerrarLegajo ? "Guardando..." : "Cerrar legajo"}
        </button>
      </div>
    </div>
  </div>
)}

{showAnularPrenda && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.72)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      setShowAnularPrenda(false);
      setMotivoAnulacion("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(620px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(91,18,28,0.98) 0%, rgba(48,10,18,0.98) 100%)",
        border: "1px solid rgba(248,113,113,0.22)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.48)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#fecaca",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Acción excepcional
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Anular prenda
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(254,226,226,0.82)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Esta acción corta el circuito operativo del trámite. Ingresá el motivo de anulación para dejar constancia en el historial.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(248,113,113,0.20)",
          background: "rgba(24,8,12,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#fecaca",
            marginBottom: "10px",
          }}
        >
          Motivo de anulación
        </label>

        <textarea
          value={motivoAnulacion}
          onChange={(e) => setMotivoAnulacion(e.target.value)}
          placeholder="Ej.: Día informó la cancelación de la operación y solicitó dejar sin efecto el trámite."
          style={{
            width: "100%",
            minHeight: "110px",
            resize: "vertical",
            borderRadius: "14px",
            border: "1px solid rgba(248,113,113,0.22)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "13px 14px",
            fontSize: "14px",
            lineHeight: 1.45,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={() => {
            setShowAnularPrenda(false);
            setMotivoAnulacion("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(248,113,113,0.22)",
            background: "rgba(255,255,255,0.03)",
            color: "#fee2e2",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleGuardarAnularPrenda}
          disabled={savingAnularPrenda}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #dc2626, #991b1b)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingAnularPrenda ? "not-allowed" : "pointer",
            opacity: savingAnularPrenda ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(127,29,29,0.28)",
          }}
        >
          {savingAnularPrenda ? "Anulando..." : "Confirmar anulación"}
        </button>
      </div>
    </div>
  </div>
)}

{showEliminarLegajo && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 8, 18, 0.76)",
      backdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    }}
    onClick={() => {
      if (savingEliminarLegajo) return;
      setShowEliminarLegajo(false);
      setConfirmacionEliminarLegajo("");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(620px, 100%)",
        borderRadius: "22px",
        background:
          "linear-gradient(180deg, rgba(91,18,28,0.98) 0%, rgba(48,10,18,0.98) 100%)",
        border: "1px solid rgba(248,113,113,0.24)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.52)",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#fecaca",
            fontWeight: 800,
            marginBottom: "7px",
          }}
        >
          Acción irreversible
        </div>

        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 750,
            letterSpacing: "-0.03em",
          }}
        >
          Eliminar legajo completo
        </h3>

        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(254,226,226,0.84)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Esta acción eliminará la prenda, sus archivos, notas e historial. No
          se podrá recuperar desde el portal.
        </p>
      </div>

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(248,113,113,0.20)",
          background: "rgba(24,8,12,0.48)",
          padding: "16px",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#fecaca",
            marginBottom: "10px",
          }}
        >
          Para confirmar, escribí ELIMINAR
        </label>

        <input
          type="text"
          value={confirmacionEliminarLegajo}
          onChange={(e) => setConfirmacionEliminarLegajo(e.target.value)}
          placeholder="ELIMINAR"
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid rgba(248,113,113,0.22)",
            background: "rgba(3, 11, 24, 0.72)",
            color: "#f8fbff",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            textTransform: "uppercase",
          }}
        />

        <div
          style={{
            marginTop: "10px",
            color: "rgba(254,226,226,0.72)",
            fontSize: "12px",
            lineHeight: 1.45,
          }}
        >
          Legajo: {row?.dominio || "—"} · Estado actual: {row?.estado || "—"}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          disabled={savingEliminarLegajo}
          onClick={() => {
            setShowEliminarLegajo(false);
            setConfirmacionEliminarLegajo("");
          }}
          style={{
            height: "42px",
            padding: "0 15px",
            borderRadius: "12px",
            border: "1px solid rgba(248,113,113,0.22)",
            background: "rgba(255,255,255,0.03)",
            color: "#fee2e2",
            fontSize: "13px",
            fontWeight: 700,
            cursor: savingEliminarLegajo ? "not-allowed" : "pointer",
            opacity: savingEliminarLegajo ? 0.65 : 1,
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleEliminarLegajoCompleto}
          disabled={savingEliminarLegajo}
          style={{
            height: "42px",
            padding: "0 17px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(180deg, #dc2626, #991b1b)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: savingEliminarLegajo ? "not-allowed" : "pointer",
            opacity: savingEliminarLegajo ? 0.72 : 1,
            boxShadow: "0 12px 24px rgba(127,29,29,0.28)",
          }}
        >
          {savingEliminarLegajo ? "Eliminando..." : "Eliminar definitivamente"}
        </button>
      </div>
    </div>
  </div>
)}

{printMode === "resumen" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>
      <h1>Resumen del legajo prendario</h1>
      <p>
        Dominio: <strong>{row?.dominio || "—"}</strong>
      </p>
      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    <section className="print-section">
      <h2>Datos principales</h2>
      <div className="print-grid">
        <div>
          <span>Tienda</span>
          <strong>{row?.tienda || "—"}</strong>
        </div>
        <div>
          <span>Franquiciado</span>
          <strong>{row?.frq_razon_social || row?.frq || "—"}</strong>
        </div>
        <div>
          <span>CUIT franquiciado</span>
          <strong>{row?.frq_cuit || "—"}</strong>
        </div>
        <div>
          <span>Estado actual</span>
          <strong>{row?.estado || "—"}</strong>
        </div>
      </div>
    </section>

    <section className="print-section">
      <h2>Prenda</h2>
      <div className="print-grid">
        <div>
          <span>Escritura</span>
          <strong>{row?.numero_escritura || "—"}</strong>
        </div>
        <div>
          <span>Folio</span>
          <strong>{row?.folio || "—"}</strong>
        </div>
        <div>
          <span>Fecha de escritura</span>
          <strong>{formatDate(row?.fecha_escritura)}</strong>
        </div>
        <div>
          <span>Escribanía</span>
          <strong>{row?.escribania || "—"}</strong>
        </div>
        <div>
          <span>Importe</span>
          <strong>
            {row?.importe_prenda
              ? `${row?.moneda_importe || "$"} ${row.importe_prenda}`
              : "—"}
          </strong>
        </div>
        <div>
          <span>Grado</span>
          <strong>{row?.grado_prenda || "—"}</strong>
        </div>
      </div>
    </section>

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

    <section className="print-section">
      <h2>Garante / Titular</h2>
      <div className="print-grid">
        <div>
          <span>Nombre / Razón social</span>
          <strong>
            {row?.titular_tipo_persona === "JURIDICA"
              ? row?.titular_razon_social || "—"
              : `${row?.titular_apellido || ""} ${
                  row?.titular_nombres || ""
                }`.trim() || "—"}
          </strong>
        </div>
        <div>
          <span>CUIT / CUIL</span>
          <strong>{row?.titular_cuil_cuit || row?.titular_cuit || "—"}</strong>
        </div>
        <div>
          <span>Estado civil</span>
          <strong>{row?.titular_estado_civil || "—"}</strong>
        </div>
        <div>
          <span>Titularidad</span>
          <strong>
            {row?.porcentaje_titular ? `${row.porcentaje_titular}%` : "—"}
          </strong>
        </div>
      </div>
    </section>
  </div>
)}

{printMode === "prenda" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>
      <h1>Ficha Prenda</h1>
      <p>
        Dominio: <strong>{row?.dominio || "—"}</strong>
      </p>
      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    <section className="print-section">
      <h2>Datos del instrumento prendario</h2>

      <div className="print-grid">
        <div>
          <span>Escritura</span>
          <strong>{row?.numero_escritura || "—"}</strong>
        </div>

        <div>
          <span>Folio</span>
          <strong>{row?.folio || "—"}</strong>
        </div>

        <div>
          <span>Fecha de escritura</span>
          <strong>{formatDate(row?.fecha_escritura)}</strong>
        </div>

        <div>
          <span>Escribanía</span>
          <strong>{row?.escribania || "—"}</strong>
        </div>

        <div>
          <span>Moneda</span>
          <strong>{row?.moneda_importe || "—"}</strong>
        </div>

        <div>
  <span>Importe</span>
  <strong>
    {row?.importe_prenda
      ? `${row?.moneda_importe || "$"} ${formatNumberMiles(row.importe_prenda)}`
      : "—"}
  </strong>
</div>

<div>
  <span>Plazo</span>
  <strong>
    {row?.plazo_anios ? `${row.plazo_anios} años` : "—"}
  </strong>
</div>

        <div>
          <span>Grado / orden de prelación</span>
          <strong>{row?.grado_prenda || "—"}</strong>
        </div>
      </div>
    </section>

    <section className="print-section">
      <h2>Datos vinculados al legajo</h2>

      <div className="print-grid">
        <div>
          <span>Tienda</span>
          <strong>{row?.tienda || "—"}</strong>
        </div>

        <div>
          <span>Franquiciado</span>
          <strong>{row?.frq_razon_social || row?.frq || "—"}</strong>
        </div>

        <div>
          <span>CUIT franquiciado</span>
          <strong>{row?.frq_cuit || "—"}</strong>
        </div>

        <div>
          <span>Estado actual</span>
          <strong>{row?.estado || "—"}</strong>
        </div>
      </div>
    </section>
  </div>
)}

{printMode === "dominio" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>
      <h1>Ficha Dominio / Automotor</h1>
      <p>
        Dominio: <strong>{row?.dominio || "—"}</strong>
      </p>
      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

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
  </div>
)}

{printMode === "franquiciado" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>
      <h1>Ficha Franquiciado</h1>
      <p>
        Dominio: <strong>{row?.dominio || "—"}</strong>
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
          <span>Tipo de persona</span>
          <strong>
            {row?.frq_tipo_persona === "HUMANA"
              ? "Persona humana"
              : "Persona jurídica"}
          </strong>
        </div>

        <div>
          <span>Franquiciado / Razón social</span>
          <strong>
            {row?.frq_tipo_persona === "HUMANA"
              ? `${row?.frq_apellido || ""} ${row?.frq_nombres || ""}`.trim() ||
                row?.frq ||
                "—"
              : row?.frq_razon_social || row?.frq || "—"}
          </strong>
        </div>

        <div>
          <span>CUIT / CUIL</span>
          <strong>{row?.frq_cuit || "—"}</strong>
        </div>

        <div>
          <span>Email</span>
          <strong>{row?.frq_email || "—"}</strong>
        </div>

        <div>
          <span>Teléfono</span>
          <strong>{row?.frq_telefono || "—"}</strong>
        </div>

        <div>
          <span>Domicilio</span>
          <strong>{row?.frq_domicilio || "—"}</strong>
        </div>
      </div>
    </section>
  </div>
)}

{printMode === "garante" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>
      <h1>Ficha Garante / Titular</h1>
      <p>
        Dominio: <strong>{row?.dominio || "—"}</strong>
      </p>
      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    <section className="print-section">
      <h2>Titular / Garante</h2>

      <div className="print-grid">
        <div>
          <span>Tipo de persona</span>
          <strong>
            {row?.titular_tipo_persona === "JURIDICA"
              ? "Persona jurídica"
              : "Persona humana"}
          </strong>
        </div>

        <div>
          <span>Nombre / Razón social</span>
          <strong>
            {row?.titular_tipo_persona === "JURIDICA"
              ? row?.titular_razon_social || "—"
              : `${row?.titular_apellido || ""} ${
                  row?.titular_nombres || ""
                }`.trim() || "—"}
          </strong>
        </div>

        <div>
          <span>DNI</span>
          <strong>{row?.titular_dni || "—"}</strong>
        </div>

        <div>
          <span>CUIL / CUIT</span>
          <strong>{row?.titular_cuil_cuit || row?.titular_cuit || "—"}</strong>
        </div>

        <div>
          <span>Estado civil</span>
          <strong>{row?.titular_estado_civil || "—"}</strong>
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

    {row?.titular_estado_civil === "CASADO/A" && (
      <section className="print-section">
        <h2>Cónyuge del titular</h2>

        <div className="print-grid">
          <div>
            <span>Apellido</span>
            <strong>{row?.titular_conyuge_apellido || "—"}</strong>
          </div>

          <div>
            <span>Nombres</span>
            <strong>{row?.titular_conyuge_nombres || "—"}</strong>
          </div>

          <div>
            <span>DNI</span>
            <strong>{row?.titular_conyuge_dni || "—"}</strong>
          </div>

          <div>
            <span>CUIL / CUIT</span>
            <strong>{row?.titular_conyuge_cuil_cuit || "—"}</strong>
          </div>
        </div>
      </section>
    )}

    {Array.isArray(row?.condominos) && row.condominos.length > 0 && (
      <section className="print-section">
        <h2>Condóminos</h2>

        {row.condominos.map((condomino, index) => (
          <div
            key={index}
            style={{
              marginBottom: "14px",
            }}
          >
            <h2
              style={{
                fontSize: "13px",
                margin: "0 0 10px",
              }}
            >
              Condómino {index + 1}
            </h2>

            <div className="print-grid">
              <div>
                <span>Apellido</span>
                <strong>{condomino?.apellido || "—"}</strong>
              </div>

              <div>
                <span>Nombres</span>
                <strong>{condomino?.nombres || "—"}</strong>
              </div>

              <div>
                <span>DNI</span>
                <strong>{condomino?.dni || "—"}</strong>
              </div>

              <div>
                <span>CUIL / CUIT</span>
                <strong>{condomino?.cuil_cuit || "—"}</strong>
              </div>

              <div>
                <span>Estado civil</span>
                <strong>{condomino?.estado_civil || "—"}</strong>
              </div>

              <div>
                <span>Titular desde</span>
                <strong>
                  {condomino?.titular_desde
                    ? formatDate(condomino.titular_desde)
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Porcentaje</span>
                <strong>
                  {condomino?.porcentaje ? `${condomino.porcentaje}%` : "—"}
                </strong>
              </div>

              <div>
                <span>Domicilio</span>
                <strong>{condomino?.domicilio || "—"}</strong>
              </div>
            </div>

            {condomino?.estado_civil === "CASADO/A" && (
              <div style={{ marginTop: "12px" }}>
                <h2
                  style={{
                    fontSize: "13px",
                    margin: "0 0 10px",
                  }}
                >
                  Cónyuge del condómino {index + 1}
                </h2>

                <div className="print-grid">
                  <div>
                    <span>Apellido</span>
                    <strong>{condomino?.conyuge_apellido || "—"}</strong>
                  </div>

                  <div>
                    <span>Nombres</span>
                    <strong>{condomino?.conyuge_nombres || "—"}</strong>
                  </div>

                  <div>
                    <span>DNI</span>
                    <strong>{condomino?.conyuge_dni || "—"}</strong>
                  </div>

                  <div>
                    <span>CUIL / CUIT</span>
                    <strong>{condomino?.conyuge_cuil_cuit || "—"}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
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
        Dominio: <strong>{row?.dominio || "—"}</strong>
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
              {item.titulo || item.title || "Movimiento del legajo"}
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
          No hay movimientos registrados para este legajo.
        </div>
      )}
    </section>
  </div>
)}

{printMode === "trazabilidad" && (
  <div className="print-only print-resumen-legajo">
    <div className="print-header">
      <div className="print-brand">SAKI</div>
      <h1>Trazabilidad del trámite</h1>
      <p>
        Dominio: <strong>{row?.dominio || "—"}</strong>
      </p>
      <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
    </div>

    <section className="print-section">
      <h2>Estado actual</h2>

      <div className="print-grid">
        <div>
          <span>Estado</span>
          <strong>{row?.estado || "—"}</strong>
        </div>

        <div>
          <span>Próxima acción</span>
          <strong>{proximaAccionInfo?.title || "—"}</strong>
        </div>

        <div>
          <span>Dominio</span>
          <strong>{row?.dominio || "—"}</strong>
        </div>

        <div>
          <span>Franquiciado</span>
          <strong>{row?.frq_razon_social || row?.frq || "—"}</strong>
        </div>
      </div>
    </section>

    <section className="print-section">
      <h2>Hitos del circuito operativo</h2>

      {[
        {
          titulo: "Carga inicial",
          fecha: row?.created_at,
          detalle: "La prenda fue cargada en el portal.",
        },
        {
          titulo: "Envío programado",
          fecha: row?.fecha_envio_oficina,
          detalle: "Fecha programada de envío de la documentación.",
        },
        {
          titulo: "Recepción SAKI",
          fecha: row?.fecha_recepcion_inicial_oficina,
          detalle: "SAKI recibió la documentación para su revisión.",
        },
        {
          titulo: "Presentación en Registro",
          fecha: row?.fecha_presentacion_registro,
          detalle: "La prenda fue presentada ante el Registro interviniente.",
        },
        {
          titulo: "Observación",
          fecha: row?.fecha_observacion,
          detalle: "El trámite registró una observación.",
        },
        {
          titulo: "Reingreso subsanado",
          fecha: row?.fecha_reingreso_subsanada,
          detalle: "La documentación subsanada reingresó al circuito.",
        },
        {
          titulo: "Inscripción",
          fecha: row?.fecha_inscripcion,
          detalle: "La prenda fue inscripta.",
        },
        {
          titulo: "Vencimiento",
          fecha: row?.fecha_vencimiento,
          detalle: "Fecha de vencimiento de la inscripción prendaria.",
        },
        {
          titulo: "Disponible para retiro",
          fecha: row?.fecha_disponible_retiro_final,
          detalle: "La documentación quedó disponible para retiro.",
        },
        {
          titulo: "Retiro final",
          fecha: row?.fecha_real_retiro_final,
          detalle: "La documentación fue retirada.",
        },
        {
          titulo: "Cierre de legajo",
          fecha: row?.fecha_cierre_legajo || row?.legajo_cerrado_en,
          detalle: "El legajo fue cerrado operativamente.",
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
        row?.fecha_envio_oficina,
        row?.fecha_recepcion_inicial_oficina,
        row?.fecha_presentacion_registro,
        row?.fecha_observacion,
        row?.fecha_reingreso_subsanada,
        row?.fecha_inscripcion,
        row?.fecha_vencimiento,
        row?.fecha_disponible_retiro_final,
        row?.fecha_real_retiro_final,
        row?.fecha_cierre_legajo || row?.legajo_cerrado_en,
      ].some(Boolean) && (
        <div
          style={{
            fontSize: "12px",
            color: "#374151",
          }}
        >
          Todavía no hay hitos de trazabilidad cargados para este legajo.
        </div>
      )}
    </section>
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
    onClick={handleCancelDatosLegajoEditor}
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
            Cargar / editar datos del legajo
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
            Desde este panel SAKI podrá completar los datos de la prenda,
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
      border: "1px solid rgba(96,165,250,0.18)",
      background:
        "linear-gradient(180deg, rgba(7,31,58,0.72), rgba(3,18,34,0.58))",
      padding: "18px",
    }}
  >
    <div
      style={{
        marginBottom: "14px",
      }}
    >
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
        Prenda
      </div>

      <div
        style={{
          color: "rgba(214,228,245,0.78)",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        Datos propios del instrumento prendario: importe, moneda, plazo,
        grado, escribanía, escritura, folio y fecha.
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
        <label style={modalFieldLabelStyle}>Moneda</label>
        <select
          value={datosLegajoForm.moneda_importe}
          onChange={(e) =>
            handleDatosLegajoChange("moneda_importe", e.target.value)
          }
          style={modalInputStyle}
        >
          <option value="$">$</option>
          <option value="U$S">U$S</option>
        </select>
      </div>

      <div>
        <label style={modalFieldLabelStyle}>Importe</label>
        <input
  style={modalInputStyle}
  value={formatNumberMiles(datosLegajoForm.importe_prenda)}
  onChange={(e) =>
    handleDatosLegajoChange(
      "importe_prenda",
      parseNumberMiles(e.target.value)
    )
  }
  placeholder="Ej. 50.000"
/>
      </div>

      <div>
        <label style={modalFieldLabelStyle}>Plazo en años</label>
        <input
          style={modalInputStyle}
          value={datosLegajoForm.plazo_anios}
          onChange={(e) =>
            handleDatosLegajoChange("plazo_anios", e.target.value)
          }
          placeholder="Ej. 36"
        />
      </div>

      <div>
        <label style={modalFieldLabelStyle}>Grado / orden de prelación</label>
        <select
          value={datosLegajoForm.grado_prenda}
          onChange={(e) =>
            handleDatosLegajoChange("grado_prenda", e.target.value)
          }
          style={modalInputStyle}
        >
          <option value="">Seleccionar</option>
          <option value="1°">1° grado</option>
          <option value="2°">2° grado</option>
          <option value="3°">3° grado</option>
        </select>
      </div>

      <div>
        <label style={modalFieldLabelStyle}>Escribanía</label>
        <input
          style={modalInputStyle}
          value={datosLegajoForm.escribania}
          onChange={(e) =>
            handleDatosLegajoChange(
              "escribania",
              e.target.value.toUpperCase()
            )
          }
          placeholder="Escribanía interviniente"
        />
      </div>

      <div>
        <label style={modalFieldLabelStyle}>Número de escritura</label>
        <input
          style={modalInputStyle}
          value={datosLegajoForm.numero_escritura}
          onChange={(e) =>
            handleDatosLegajoChange("numero_escritura", e.target.value)
          }
          placeholder="Ej. 12345"
        />
      </div>

      <div>
  <label style={modalFieldLabelStyle}>S.T. 03 N°</label>
  <input
    style={modalInputStyle}
    value={datosLegajoForm.st03_numero || ""}
    onChange={(e) =>
      handleDatosLegajoChange("st03_numero", e.target.value)
    }
    placeholder="Ej. 123456"
  />
</div>

<div>
  <label style={modalFieldLabelStyle}>S.T. 02 N°</label>
  <input
    style={modalInputStyle}
    value={datosLegajoForm.st02_numero || ""}
    onChange={(e) =>
      handleDatosLegajoChange("st02_numero", e.target.value)
    }
    placeholder="Ej. 123456"
  />
</div>

      <div>
        <label style={modalFieldLabelStyle}>Folio</label>
        <input
          style={modalInputStyle}
          value={datosLegajoForm.folio}
          onChange={(e) =>
            handleDatosLegajoChange("folio", e.target.value)
          }
          placeholder="Ej. 678"
        />
      </div>

      <div>
        <label style={modalFieldLabelStyle}>Fecha de escritura</label>
        <input
          type="date"
          style={{
            ...modalInputStyle,
            colorScheme: "dark",
          }}
          value={datosLegajoForm.fecha_escritura}
          onChange={(e) =>
            handleDatosLegajoChange("fecha_escritura", e.target.value)
          }
        />
      </div>
      <div>
  <label style={modalFieldLabelStyle}>Fecha de inscripción</label>
  <input
    type="date"
    style={modalInputStyle}
    value={datosLegajoForm.fecha_inscripcion || ""}
    onChange={(e) =>
      handleDatosLegajoChange("fecha_inscripcion", e.target.value)
    }
  />
</div>

<div>
  <label style={modalFieldLabelStyle}>Fecha de reinscripción</label>
  <input
    type="text"
    style={modalInputStyle}
    value={
      datosLegajoForm.fecha_inscripcion
        ? formatDate(addYearsToDateString(datosLegajoForm.fecha_inscripcion, 5))
        : "—"
    }
    readOnly
  />
</div>
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
      />
    </div>
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
      Franquiciado
    </div>

    <div
      style={{
        color: "rgba(214,228,245,0.78)",
        fontSize: "13px",
        lineHeight: 1.5,
      }}
    >
      Datos del franquiciado vinculado al legajo prendario.
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
      <label style={modalFieldLabelStyle}>Tienda</label>
      <input
        style={modalInputStyle}
        value={datosLegajoForm.tienda}
        onChange={(e) =>
          handleDatosLegajoChange("tienda", e.target.value.toUpperCase())
        }
        placeholder="Ej. 8888"
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
      />
    </div>
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
      />
    </div>

    <div style={{ gridColumn: "1 / -1" }}>
  <label style={modalFieldLabelStyle}>Mail</label>
  <input
    type="email"
    style={modalInputStyle}
    value={datosLegajoForm.titular_email || ""}
    onChange={(e) =>
      handleDatosLegajoChange("titular_email", e.target.value)
    }
    placeholder="Mail del titular / garante"
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

function InfoCard({ icon, title, items, action, onClick }) {
  return (
    <div style={infoCardStyle}>
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

      <div style={cardFooterStyle}>
        <button style={linkButtonStyle} onClick={onClick}>
          {action}
        </button>
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

      <div style={{ ...cardFooterStyle, visibility: "hidden" }}>
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
          value="Este panel concentra alertas y novedades operativas vinculadas al trámite de prenda."
          wide
        />

        <FichaDato
          label="Estado actual"
          value="Los avisos automáticos se mostrarán cuando el trámite tenga una acción pendiente o una novedad relevante."
          wide
        />

        <FichaDato
          label="Importante"
          value="Este panel no modifica el estado del trámite. Las acciones operativas se gestionan desde el bloque Estado del trámite."
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
      "SAKI Portal Día | Prendas | Reporte de inconveniente"
    );

    const cuerpo = encodeURIComponent(
      `Hola, necesito reportar un inconveniente en el módulo Prendas.

Módulo: Prendas
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

          <h2 style={credentialNameStyle}>{row?.dominio || "Legajo"}</h2>
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
      (nota.author_role || "").toString().trim().toLowerCase() === "admin";

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
            trámite de prenda: documentación inicial, instrumento prendario,
            rectificaciones, observaciones, inscripción y cierre del legajo.
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
  onPrintResumen,
  onPrintPrenda,
  onPrintDominio,
  onPrintFranquiciado,
  onPrintGarante,
  onPrintHistorial,
  onPrintTrazabilidad,
}) {

  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Printer size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Centro de impresión</div>
          <h2 style={credentialNameStyle}>
            {row?.dominio || "Legajo por completar"}
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
          <div style={printOptionTitleStyle}>Imprimir resumen del legajo</div>
          <div style={printOptionTextStyle}>
            Vista general con datos principales, estado actual, prenda,
            dominio, franquiciado y titularidad.
          </div>
        </button>

        <button
  type="button"
  onClick={onPrintPrenda}
  style={printOptionStyle}
>
  <div style={printOptionTitleStyle}>Imprimir ficha Prenda</div>
  <div style={printOptionTextStyle}>
    Datos del instrumento prendario: escritura, folio, fecha,
    escribanía, importe, moneda, plazo y grado.
  </div>
</button>

        <button
          type="button"
          onClick={onPrintDominio}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>Imprimir ficha Dominio</div>
          <div style={printOptionTextStyle}>
            Datos identificatorios del automotor, motor, chasis, radicación y
            registro interviniente.
          </div>
        </button>

        <button
          type="button"
          onClick={onPrintFranquiciado}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>Imprimir ficha Franquiciado</div>
          <div style={printOptionTextStyle}>
            Tienda, franquiciado, CUIT y datos complementarios cargados por
            SAKI.
          </div>
        </button>

        <button
          type="button"
          onClick={onPrintGarante}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>
            Imprimir ficha Garante / Titular
          </div>
          <div style={printOptionTextStyle}>
            Titular/garante, estado civil, cónyuge, titularidad y condóminos.
          </div>
        </button>

        <button
          type="button"
          onClick={onPrintHistorial}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>Imprimir historial</div>
          <div style={printOptionTextStyle}>
            Movimientos del trámite, cambios de estado, archivos y operaciones
            registradas.
          </div>
        </button>

        <button
          type="button"
          onClick={onPrintTrazabilidad}
          style={printOptionStyle}
        >
          <div style={printOptionTitleStyle}>Imprimir trazabilidad</div>
          <div style={printOptionTextStyle}>
            Línea operativa del trámite con hitos, fechas y estado actual del
            circuito.
          </div>
        </button>
      </div>
    </div>
  );
}

function FichaPrenda({ row }) {
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <ShieldCheck size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Detalle de la prenda</div>

          <h2 style={credentialNameStyle}>
            {row?.numero_escritura
              ? `Escritura ${row.numero_escritura}`
              : "Prenda por completar"}
          </h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato
  label="Instrumento"
  value={
    row?.numero_escritura
      ? `Escritura ${row.numero_escritura}`
      : "Por completar"
  }
/>

<FichaDato
  label="Folio"
  value={row?.folio || "Por completar"}
/>

<FichaDato
  label="Fecha"
  value={formatDate(row?.fecha_escritura) || "Por completar"}
/>

<FichaDato
  label="Importe"
  value={
    row?.importe_prenda
      ? `${row?.moneda_importe || "$"} ${formatNumberMiles(row.importe_prenda)}`
      : "Por completar"
  }
/>

<FichaDato
  label="Grado"
  value={row?.grado_prenda || "Por completar"}
/>

<FichaDato
  label="Plazo"
  value={row?.plazo_anios ? `${row.plazo_anios} años` : "Por completar"}
/>

<FichaDato
  label="Escribanía"
  value={row?.escribania || "Por completar"}
/>

<FichaDato
  label="Fecha de inscripción"
  value={formatDate(row?.fecha_inscripcion) || "—"}
/>

<FichaDato
  label="Fecha de reinscripción"
  value={formatDate(row?.fecha_vencimiento) || "—"}
/>

<FichaDato
  label="S.T. 02 N°"
  value={row?.st02_numero || "—"}
/>

<FichaDato
  label="S.T. 03 N°"
  value={row?.st03_numero || "—"}
/>
        
      </div>
    </div>
  );
}

function FichaHistorial({ row, historyRows }) {

const getHistoryTitle = (item) => {
  if (item?.tipo_evento === "carga_inicial") {
    return "Carga inicial de nueva prenda";
  }

  if (item?.tipo_evento === "reprogramacion_envio") {
    return "Reprogramación de envío";
  }

  if (item?.tipo_evento === "recepcion_inicial_saki") {
    return "Recepción inicial en SAKI";
  }

  if (item?.tipo_evento === "aprobacion_revision") {
    return "Prenda en curso";
  }

  if (item?.tipo_evento === "rectificacion_solicitada") {
    return "Rectificación solicitada";
  }

  if (item?.tipo_evento === "disponible_retiro_correccion") {
    return "Disponible para retiro por corrección";
  }

  if (item?.tipo_evento === "retiro_correccion") {
    return "Retiro para rectificación";
  }

  if (item?.tipo_evento === "reprogramacion_envio_rectificacion") {
    return "Reprogramación de envío por rectificación";
  }

  if (item?.tipo_evento === "reingreso_correccion") {
    return "Reingreso de prenda rectificada";
  }

  if (item?.tipo_evento === "presentacion_registro") {
    return "Presentación en Registro";
  }

  if (item?.tipo_evento === "prenda_observada") {
    return "Prenda observada";
  }

  if (item?.tipo_evento === "retiro_subsanacion") {
    return "Retiro para subsanar observación";
  }

  if (item?.tipo_evento === "reingreso_subsanada") {
    return "Reingreso de observación subsanada";
  }

  if (item?.tipo_evento === "prenda_inscripta") {
    return "Prenda inscripta";
  }

  if (item?.tipo_evento === "disponible_retiro_final") {
    return "Disponible para retiro";
  }

  if (item?.tipo_evento === "prenda_retirada") {
    return "Prenda retirada";
  }

  if (item?.tipo_evento === "legajo_cerrado") {
    return "Legajo cerrado";
  }

  if (item?.tipo_evento === "prenda_anulada") {
    return "Prenda anulada";
  }

  return item?.titulo || "Movimiento del legajo";
};

  const formatHistoryDetail = (item) => {
  const detalle = item?.detalle;
  if (item?.tipo_evento === "nota_agregada" && detalle) {
  const nota = detalle?.nota || "sin texto";
  const autor =
    detalle?.autor ||
    item?.created_by_name ||
    item?.created_by_email ||
    "usuario no identificado";

  return `Nota operativa registrada por ${autor}: ${nota}`;
}

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

  if (item?.tipo_evento === "carga_inicial" && detalle) {
    const fechaInicial = detalle?.fecha_envio_inicial
      ? formatDate(detalle.fecha_envio_inicial)
      : "fecha por completar";

    return `Carga inicial de nueva prenda. Fecha de envío inicial programada para ${fechaInicial}.`;
  }

  if (item?.tipo_evento === "reprogramacion_envio" && detalle) {
    const fechaAnterior = detalle?.fecha_anterior
      ? formatDate(detalle.fecha_anterior)
      : "sin fecha anterior";

    const fechaNueva = detalle?.fecha_nueva
      ? formatDate(detalle.fecha_nueva)
      : "sin fecha nueva";

    return `Se modificó la fecha de envío de ${fechaAnterior} a ${fechaNueva}.`;
  }

  if (item?.tipo_evento === "recepcion_inicial_saki" && detalle) {
    const fechaRecepcion = detalle?.fecha_recepcion
      ? formatDate(detalle.fecha_recepcion)
      : "fecha por completar";

    return `Recepción inicial en SAKI. Fecha de recepción: ${fechaRecepcion}. SAKI recibió físicamente la prenda y comenzó la revisión documental previa al trámite.`;
  }

  if (item?.tipo_evento === "aprobacion_revision" && detalle) {
    const fechaPaseEnCurso = detalle?.fecha_pase_en_curso
      ? formatDate(detalle.fecha_pase_en_curso)
      : "fecha por completar";

    return `Prenda en curso. Fecha de pase a En curso: ${fechaPaseEnCurso}. SAKI verificó la prenda y confirmó que se encuentra apta para continuar el trámite.`;
  }

  if (item?.tipo_evento === "rectificacion_solicitada" && detalle) {
    const tipoRectificacion =
      detalle?.tipo_rectificacion || "tipo por completar";

    const motivoRectificacion =
      detalle?.motivo_rectificacion || "motivo por completar";

    const notaRectificacion = detalle?.nota ? ` Nota: ${detalle.nota}.` : "";

    return `Rectificación solicitada. Tipo: ${tipoRectificacion}. Motivo: ${motivoRectificacion}.${notaRectificacion}`;
  }

  if (item?.tipo_evento === "disponible_retiro_correccion" && detalle) {
    const fechaDisponible = detalle?.fecha_disponible_retiro_correccion
      ? formatDate(detalle.fecha_disponible_retiro_correccion)
      : "fecha por completar";

    return `Disponible para retiro por corrección. Fecha disponible para retiro: ${fechaDisponible}. SAKI dejó la prenda disponible para que Día la retire y gestione la corrección correspondiente.`;
  }

  if (item?.tipo_evento === "retiro_correccion" && detalle) {
    const fechaRetiro = detalle?.fecha_retiro_correccion
      ? formatDate(detalle.fecha_retiro_correccion)
      : "fecha por completar";

    return `Retiro para rectificación. Fecha de retiro: ${fechaRetiro}. Día retiró la prenda de SAKI para gestionar la rectificación solicitada.`;
  }

  if (item?.tipo_evento === "reprogramacion_envio_rectificacion" && detalle) {
    const fechaAnterior = detalle?.fecha_anterior
      ? formatDate(detalle.fecha_anterior)
      : "sin fecha anterior";

    const fechaNueva = detalle?.fecha_nueva
      ? formatDate(detalle.fecha_nueva)
      : "fecha por completar";

    return `Reprogramación de envío por rectificación. Fecha anterior: ${fechaAnterior}. Nueva fecha de envío: ${fechaNueva}. Día informó una nueva fecha de envío de la prenda rectificada.`;
  }

  if (item?.tipo_evento === "reingreso_correccion" && detalle) {
    const fechaReingreso = detalle?.fecha_reingreso_correccion
      ? formatDate(detalle.fecha_reingreso_correccion)
      : "fecha por completar";

    return `Reingreso de prenda rectificada. Fecha de reingreso: ${fechaReingreso}. La prenda volvió a ingresar a SAKI luego de la rectificación solicitada.`;
  }

  if (item?.tipo_evento === "presentacion_registro" && detalle) {
    const fechaPresentacion = detalle?.fecha_presentacion_registro
      ? formatDate(detalle.fecha_presentacion_registro)
      : "fecha por completar";

    return `Presentación en Registro. Fecha de presentación: ${fechaPresentacion}. SAKI presentó la prenda ante el Registro interviniente para su tramitación.`;
  }

  if (item?.tipo_evento === "prenda_observada" && detalle) {
    const fechaObservacion = detalle?.fecha_observacion
      ? formatDate(detalle.fecha_observacion)
      : "fecha por completar";

    const tipoObservacion = detalle?.incidencia_tipo || "tipo por completar";
    const motivoObservacion =
      detalle?.motivo_incidencia || "motivo por completar";
    const notaObservacion = detalle?.nota ? ` Nota: ${detalle.nota}.` : "";

    return `Prenda observada. Fecha de observación: ${fechaObservacion}. Tipo: ${tipoObservacion}. Motivo: ${motivoObservacion}.${notaObservacion}`;
  }

  if (item?.tipo_evento === "retiro_subsanacion" && detalle) {
    const fechaRetiro = detalle?.fecha_retiro_subsanacion
      ? formatDate(detalle.fecha_retiro_subsanacion)
      : "fecha por completar";

    return `Retiro para subsanar observación. Fecha de retiro: ${fechaRetiro}. La documentación fue retirada para subsanar la observación informada por el Registro.`;
  }

  if (item?.tipo_evento === "reingreso_subsanada" && detalle) {
    const fechaReingreso = detalle?.fecha_reingreso_subsanada
      ? formatDate(detalle.fecha_reingreso_subsanada)
      : "fecha por completar";

    return `Reingreso de observación subsanada. Fecha de reingreso: ${fechaReingreso}. La documentación reingresó luego de subsanar la observación informada por el Registro.`;
  }

  if (item?.tipo_evento === "prenda_inscripta" && detalle) {
    const fechaInscripcion = detalle?.fecha_inscripcion
      ? formatDate(detalle.fecha_inscripcion)
      : "fecha por completar";

    const fechaVencimiento = detalle?.fecha_vencimiento
      ? formatDate(detalle.fecha_vencimiento)
      : "fecha por completar";

    return `Prenda inscripta. Fecha de inscripción: ${fechaInscripcion}. Fecha de vencimiento: ${fechaVencimiento}. La prenda fue inscripta correctamente en el Registro.`;
  }

  if (item?.tipo_evento === "disponible_retiro_final" && detalle) {
    const fechaDisponible = detalle?.fecha_disponible_retiro_final
      ? formatDate(detalle.fecha_disponible_retiro_final)
      : "fecha por completar";

    return `Disponible para retiro. Fecha disponible para retiro: ${fechaDisponible}. SAKI dejó la prenda inscripta disponible para retiro de Día.`;
  }

  if (item?.tipo_evento === "prenda_retirada" && detalle) {
    const fechaRetiro = detalle?.fecha_retiro_final
      ? formatDate(detalle.fecha_retiro_final)
      : "fecha por completar";

    return `Prenda retirada. Fecha de retiro: ${fechaRetiro}. Día retiró la prenda inscripta de SAKI.`;
  }

  if (item?.tipo_evento === "legajo_cerrado" && detalle) {
    const fechaCierre = detalle?.fecha_cierre_legajo
      ? formatDate(detalle.fecha_cierre_legajo)
      : "fecha por completar";

    return `Legajo cerrado. Fecha de cierre: ${fechaCierre}. El trámite fue finalizado y el legajo quedó cerrado sin acciones pendientes.`;
  }

  if (item?.tipo_evento === "prenda_anulada" && detalle) {
    const fechaAnulacion = detalle?.anulada_en
      ? formatDate(detalle.anulada_en)
      : "fecha por completar";

    const motivo = detalle?.motivo_anulacion || "motivo por completar";

    return `Prenda anulada. Fecha de anulación: ${fechaAnulacion}. Motivo: ${motivo}. El trámite fue anulado y no continuará su circuito operativo.`;
  }

  if (typeof detalle === "string" && detalle.trim()) {
    return detalle;
  }

if (item?.tipo_evento === "datos_legajo_actualizados") {
  return "SAKI registró cambios administrativos del legajo.";
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
        <h1>Historial del trámite</h1>
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
      <div style={credentialKickerStyle}>Historial del trámite</div>

      <h2 style={credentialNameStyle}>
        {row?.dominio || "Legajo por completar"}
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

function FichaTrazabilidad({ row }) {
  const fecha = (value) => {
    if (!value) return null;
    return formatDate(value);
  };

  const limpiarItems = (items) => items.filter((item) => item?.value);

  const etapas = [
    {
      titulo: "Ingreso y revisión SAKI",
      tag: "Entrada",
      tone: "blue",
      items: limpiarItems([
        {
          label: "Envío inicial programado",
          value: fecha(row?.fecha_envio_oficina),
        },
        {
          label: "Recepción inicial en SAKI",
          value: fecha(row?.fecha_recepcion_inicial_oficina),
        },
        {
          label: "Pase a En curso",
          value: fecha(row?.fecha_pase_en_curso),
        },
      ]),
    },
    {
      titulo: "Rectificación previa",
      tag: "Corrección",
      tone: "amber",
      items: limpiarItems([
        {
          label: "Disponible para retiro por corrección",
          value: fecha(row?.fecha_disponible_retiro_correccion),
        },
        {
          label: "Retiro para rectificación",
          value: fecha(row?.fecha_retiro_correccion),
        },
        {
          label: "Reenvío rectificado",
          value: fecha(row?.fecha_reenvio_oficina),
        },
        {
          label: "Reingreso rectificado",
          value: fecha(row?.fecha_reingreso_correccion),
        },
      ]),
    },
    {
      titulo: "Presentación registral",
      tag: "Registro",
      tone: "blue",
      items: limpiarItems([
        {
          label: "Presentación en Registro",
          value: fecha(row?.fecha_presentacion_registro),
        },
      ]),
    },
    {
      titulo: "Observación y subsanación",
      tag: "Incidencia",
      tone: "red",
      items: limpiarItems([
        {
          label: "Observación registral",
          value: fecha(row?.fecha_observacion),
          note: row?.motivo_incidencia || null,
        },
        {
          label: "Retiro para subsanar",
          value: fecha(row?.fecha_retiro_subsanacion),
        },
        {
          label: "Reingreso subsanado",
          value: fecha(row?.fecha_reingreso_subsanada),
        },
      ]),
    },
    {
      titulo: "Inscripción y retiro final",
      tag: "Resultado",
      tone: "green",
      items: limpiarItems([
        {
          label: "Inscripción",
          value: fecha(row?.fecha_inscripcion),
        },
        {
          label: "Vencimiento",
          value: fecha(row?.fecha_vencimiento),
        },
        {
          label: "Disponible para retiro final",
          value: fecha(row?.fecha_disponible_retiro_final),
        },
        {
          label: "Retiro final",
          value: fecha(row?.fecha_real_retiro_final),
        },
      ]),
    },
    {
      titulo: row?.estado === "Anulada" ? "Anulación" : "Cierre",
      tag: row?.estado === "Anulada" ? "Corte" : "Finalización",
      tone: row?.estado === "Anulada" ? "red" : "green",
      items: limpiarItems([
        {
          label: "Cierre de legajo",
          value: fecha(row?.fecha_cierre_legajo),
        },
        {
          label: "Anulación",
          value: fecha(row?.anulada_en),
          note: row?.motivo_anulacion || null,
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

function FichaDominio({ row }) {
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
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Store size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Franquiciado</div>

          <h2 style={credentialNameStyle}>
            {row?.frq || "Franquiciado por completar"}
          </h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato label="Nombre / Razón social" value={row?.frq || "Por completar"} />

        <FichaDato
          label="CUIT"
          value={formatCuit(row?.frq_cuit) || "Por completar"}
        />

        <FichaDato label="Tienda" value={row?.tienda || "Por completar"} />

        <FichaDato
          label="Mail"
          value={row?.frq_email || row?.frq_mail || "Por completar"}
        />

        <FichaDato
          label="Teléfono"
          value={row?.frq_telefono || "Por completar"}
        />

        <FichaDato
          label="Estado civil"
          value={row?.frq_estado_civil || "Por completar"}
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

function FichaGarante({ row }) {
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
          <div style={credentialKickerStyle}>Garante / Titular</div>
          <h2 style={credentialNameStyle}>{tituloFicha}</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato
          label="Nombre / Razón social"
          value={getNombreTitular()}
        />

        <FichaDato
          label="CUIT"
          value={
            row?.titular_cuil_cuit ||
            row?.titular_cuit ||
            "Por completar"
          }
        />

        <FichaDato
          label="Titularidad"
          value={formatPercent(row?.porcentaje_titular)}
        />

        <FichaDato
          label="Estado civil"
          value={estadoCivilTitular || "Por completar"}
        />

        {row?.titular_dni && (
          <FichaDato label="DNI" value={row.titular_dni} />
        )}

        {row?.titular_desde && (
          <FichaDato
            label="Titular desde"
            value={formatDate(row.titular_desde)}
          />
        )}

{row?.titular_email && (
  <FichaDato
    label="Mail"
    value={row.titular_email}
  />
)}

        {row?.titular_domicilio && (
          <FichaDato
            label="Domicilio"
            value={row.titular_domicilio}
            wide
          />
        )}

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

function FichaEstado({
  row,
  estadoActual,
  estadoActualKey,
  estadoFechaInfo,
  proximaAccionInfo,
  isAdmin,
  canOperatePrendas,
  onReprogramarEnvio,
  onRecibirPrenda,
  onAprobarRevision,
  onSolicitarRectificacion,
  onDisponibleRetiroCorreccion,
  onRetiroCorreccion,
  onReprogramacionRectificacion,
  onReingresoCorreccion,
  onPresentacionRegistro,
  onMarcarObservada,
  onRetiroSubsanacion,
  onReingresoSubsanada,
  onMarcarInscripta,
  onDisponibleRetiroFinal,
  onRetiradaFinal,
  onCerrarLegajo,
  onAnularPrenda,
}) {

  const incidenciaLabel =
    row?.incidencia_tipo === "error_documental"
      ? "Error documental"
      : row?.incidencia_tipo === "observacion_registral"
      ? "Observación registral"
      : estadoActualKey === "OBSERVADA"
      ? "Por completar"
      : "No aplica";

  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Flag size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Estado del trámite</div>

          <h2
            style={{
              ...credentialNameStyle,
              color: estadoActualKey === "OBSERVADA" ? "#ff6b6b" : "#eef5ff",
            }}
          >
            {estadoActual || "Estado por completar"}
          </h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato
          label="Estado actual"
          value={estadoActual || "Por completar"}
        />

        <FichaDato
          label={estadoFechaInfo?.label || "Fecha"}
          value={estadoFechaInfo?.value || "Por completar"}
        />

        <FichaDato
          label="Próxima acción"
          value={proximaAccionInfo?.titulo || "Por completar"}
        />

        <FichaDato
          label="Incidencia"
          value={incidenciaLabel}
        />

        <FichaDato
  label="Detalle"
  value={
    estadoActualKey === "OBSERVADA"
      ? row?.motivo_incidencia ||
        proximaAccionInfo?.texto ||
        "Por completar"
      : proximaAccionInfo?.texto || "Por completar"
  }
  wide
/>

{estadoActualKey === "PENDIENTE DE ENVIO" && canOperatePrendas && (
  <div
    style={{
      ...fichaDatoWideStyle,
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    }}
  >
    <button
      type="button"
      onClick={onReprogramarEnvio}
      style={caseActionButtonStyle}
    >
      Reprogramar envío
    </button>

    {isAdmin && (
      <button
        type="button"
        onClick={onRecibirPrenda}
        style={{
          ...caseActionButtonStyle,
          background: "linear-gradient(180deg, #16a34a, #15803d)",
          boxShadow: "0 10px 20px rgba(22,163,74,0.18)",
        }}
      >
        Recibir prenda
      </button>
    )}
  </div>
)}

{estadoActualKey === "EN REVISION" && isAdmin && (
  <div
    style={{
      ...fichaDatoWideStyle,
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    }}
  >
    <button
      type="button"
      onClick={onAprobarRevision}
      style={{
        ...caseActionButtonStyle,
        background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
        boxShadow: "0 10px 20px rgba(37,99,235,0.20)",
      }}
    >
      Aprobar revisión
    </button>

    <button
      type="button"
      onClick={onSolicitarRectificacion}
      style={{
        ...caseActionButtonStyle,
        background: "linear-gradient(180deg, #f59e0b, #d97706)",
        boxShadow: "0 10px 20px rgba(245,158,11,0.20)",
      }}
    >
      Solicitar rectificación
    </button>
  </div>
)}

{estadoActualKey === "RECTIFICACION SOLICITADA" && isAdmin && (
  <div
    style={{
      ...fichaDatoWideStyle,
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    }}
  >
    {!row?.fecha_disponible_retiro_correccion && (
      <button
        type="button"
        onClick={onDisponibleRetiroCorreccion}
        style={{
          ...caseActionButtonStyle,
          background: "linear-gradient(180deg, #f59e0b, #d97706)",
          boxShadow: "0 10px 20px rgba(245,158,11,0.20)",
        }}
      >
        Disponible para retiro por corrección
      </button>
    )}

    {row?.fecha_disponible_retiro_correccion &&
      !row?.fecha_retiro_correccion && (
        <button
          type="button"
          onClick={onRetiroCorreccion}
          style={{
            ...caseActionButtonStyle,
            background: "linear-gradient(180deg, #f97316, #ea580c)",
            boxShadow: "0 10px 20px rgba(249,115,22,0.20)",
          }}
        >
          Registrar retiro para rectificación
        </button>
      )}

    {row?.fecha_retiro_correccion &&
      !row?.fecha_reenvio_oficina && (
        <button
          type="button"
          onClick={onReprogramacionRectificacion}
          style={{
            ...caseActionButtonStyle,
            background: "linear-gradient(180deg, #f59e0b, #d97706)",
            boxShadow: "0 10px 20px rgba(245,158,11,0.20)",
          }}
        >
          Reprogramar envío rectificado
        </button>
      )}

    {row?.fecha_reenvio_oficina &&
      !row?.fecha_reingreso_correccion && (
        <button
          type="button"
          onClick={onReingresoCorreccion}
          style={{
            ...caseActionButtonStyle,
            background: "linear-gradient(180deg, #16a34a, #15803d)",
            boxShadow: "0 10px 20px rgba(22,163,74,0.18)",
          }}
        >
          Registrar reingreso rectificado
        </button>
      )}

    {row?.fecha_reingreso_correccion && (
      <button
        type="button"
        onClick={onAprobarRevision}
        style={{
          ...caseActionButtonStyle,
          background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
          boxShadow: "0 10px 20px rgba(37,99,235,0.20)",
        }}
      >
        Pasar a En curso
      </button>
    )}
  </div>
)}

{estadoActualKey === "EN CURSO" && isAdmin && (
  <div
    style={{
      ...fichaDatoWideStyle,
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    }}
  >
    <button
      type="button"
      onClick={onPresentacionRegistro}
      style={{
        ...caseActionButtonStyle,
        background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
        boxShadow: "0 10px 20px rgba(37,99,235,0.20)",
      }}
    >
      Presentar en Registro
    </button>

    {row?.fecha_presentacion_registro && (
      <>
        <button
          type="button"
          onClick={onMarcarObservada}
          style={{
            ...caseActionButtonStyle,
            background: "linear-gradient(180deg, #ef4444, #b91c1c)",
            boxShadow: "0 10px 20px rgba(239,68,68,0.20)",
          }}
        >
          Marcar observada
        </button>

        <button
          type="button"
          onClick={onMarcarInscripta}
          style={{
            ...caseActionButtonStyle,
            background: "linear-gradient(180deg, #16a34a, #15803d)",
            boxShadow: "0 10px 20px rgba(22,163,74,0.18)",
          }}
        >
          Marcar inscripta
        </button>
      </>
    )}
  </div>
)}

{estadoActualKey === "OBSERVADA" && isAdmin && (
  <div
    style={{
      ...fichaDatoWideStyle,
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    }}
  >
    {!row?.fecha_retiro_subsanacion && (
      <button
        type="button"
        onClick={onRetiroSubsanacion}
        style={{
          ...caseActionButtonStyle,
          background: "linear-gradient(180deg, #ef4444, #b91c1c)",
          boxShadow: "0 10px 20px rgba(239,68,68,0.20)",
        }}
      >
        Retiro para subsanar
      </button>
    )}

    {row?.fecha_retiro_subsanacion &&
      !row?.fecha_reingreso_subsanada && (
        <button
          type="button"
          onClick={onReingresoSubsanada}
          style={{
            ...caseActionButtonStyle,
            background: "linear-gradient(180deg, #f97316, #ea580c)",
            boxShadow: "0 10px 20px rgba(249,115,22,0.20)",
          }}
        >
          Reingreso subsanada
        </button>
      )}

    {row?.fecha_reingreso_subsanada && (
      <>
        <button
          type="button"
          onClick={onAprobarRevision}
          style={{
            ...caseActionButtonStyle,
            background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
            boxShadow: "0 10px 20px rgba(37,99,235,0.20)",
          }}
        >
          Volver a En curso
        </button>

        <button
          type="button"
          onClick={onMarcarInscripta}
          style={{
            ...caseActionButtonStyle,
            background: "linear-gradient(180deg, #16a34a, #15803d)",
            boxShadow: "0 10px 20px rgba(22,163,74,0.18)",
          }}
        >
          Marcar inscripta
        </button>
      </>
    )}
  </div>
)}

{estadoActualKey === "INSCRIPTA" && isAdmin && (
  <div
    style={{
      ...fichaDatoWideStyle,
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    }}
  >
    <button
      type="button"
      onClick={onDisponibleRetiroFinal}
      style={{
        ...caseActionButtonStyle,
        background: "linear-gradient(180deg, #f59e0b, #d97706)",
        boxShadow: "0 10px 20px rgba(245,158,11,0.20)",
      }}
    >
      Disponible para retiro
    </button>
  </div>
)}

{estadoActualKey === "DISPONIBLE PARA RETIRO" && isAdmin && (
  <div
    style={{
      ...fichaDatoWideStyle,
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    }}
  >
    <button
      type="button"
      onClick={onRetiradaFinal}
      style={{
        ...caseActionButtonStyle,
        background: "linear-gradient(180deg, #f59e0b, #d97706)",
        boxShadow: "0 10px 20px rgba(245,158,11,0.20)",
      }}
    >
      Registrar retiro final
    </button>
  </div>
)}

{estadoActualKey === "RETIRADA" && isAdmin && (
  <div
    style={{
      ...fichaDatoWideStyle,
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    }}
  >
    <button
      type="button"
      onClick={onCerrarLegajo}
      style={{
        ...caseActionButtonStyle,
        background: "linear-gradient(180deg, #16a34a, #15803d)",
        boxShadow: "0 10px 20px rgba(22,163,74,0.18)",
      }}
    >
      Cerrar legajo
    </button>
  </div>
)}

{isAdmin &&
  estadoActualKey !== "LEGAJO CERRADO" &&
  estadoActualKey !== "ANULADA" && (
    <div
      style={{
        ...fichaDatoWideStyle,
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        paddingTop: "10px",
        borderTop: "1px solid rgba(148,163,184,0.12)",
      }}
    >
      <button
        type="button"
        onClick={onAnularPrenda}
        style={{
          ...caseActionButtonStyle,
          background: "linear-gradient(180deg, #991b1b, #7f1d1d)",
          boxShadow: "0 10px 20px rgba(127,29,29,0.22)",
        }}
      >
        Anular prenda
      </button>
    </div>
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

