import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

function getTipoInformeLabel(type) {
  if (type === "informe_dominio") return "Informe de dominio";
  if (type === "certificado_dominio") return "Certificado de dominio";
  if (type === "anotaciones_personales") return "Anotaciones personales";
  if (type === "indice_titularidad") return "Índice de titularidad";
  return type || "Informe";
}

function getReferencia(row) {
  if (row?.dominio) return row.dominio;
  if (row?.identificacion_dni) return `DNI ${row.identificacion_dni}`;
  if (row?.identificacion_cuit) return `CUIT ${row.identificacion_cuit}`;
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

function getEstadoInformeLabel(status) {
  const value = (status || "SOLICITADO").toUpperCase().replace("_", " ");

  if (value === "SOLICITADO") return "SOLICITADO";
  if (value === "EN CURSO") return "EN CURSO";
  if (value === "ENTREGADO") return "ENTREGADO";
  if (value === "ANULADO") return "ANULADO";

  return value;
}

function getResultadoInformeLabel(result) {
  const value = (result || "").toUpperCase();

  if (value === "APROBADO") return "APROBADO";
  if (value === "OBSERVADO") return "OBSERVADO";

  return "";
}

function getResultadoInformeStyle(result) {
  const resultado = getResultadoInformeLabel(result);

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    height: "22px",
    borderRadius: "999px",
    padding: "0 10px",
    fontSize: "11px",
    fontWeight: 740,
    lineHeight: "22px",
    letterSpacing: "0.03em",
    whiteSpace: "nowrap",
  };

  if (resultado === "APROBADO") {
    return {
      ...base,
      color: "#bbf7d0",
      background: "rgba(34,197,94,0.16)",
      border: "1px solid rgba(34,197,94,0.28)",
    };
  }

  if (resultado === "OBSERVADO") {
    return {
      ...base,
      color: "#fde68a",
      background: "rgba(217,119,6,0.20)",
      border: "1px solid rgba(251,191,36,0.34)",
    };
  }

  return base;
}

function getEstadoInformeStyle(status) {
  const estado = getEstadoInformeLabel(status);

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    height: "22px",
    borderRadius: "999px",
    padding: "0 10px",
    fontSize: "11px",
    fontWeight: 740,
    lineHeight: "22px",
    letterSpacing: "0.03em",
    whiteSpace: "nowrap",
  };

  if (estado === "SOLICITADO") {
    return {
      ...base,
      color: "#dbeafe",
      background: "rgba(96,165,250,0.14)",
      border: "1px solid rgba(96,165,250,0.22)",
    };
  }

  if (estado === "EN CURSO") {
    return {
      ...base,
      color: "#ccfbf1",
      background: "rgba(20,184,166,0.16)",
      border: "1px solid rgba(20,184,166,0.28)",
    };
  }

  if (estado === "ENTREGADO") {
    return {
      ...base,
      color: "#bbf7d0",
      background: "rgba(34,197,94,0.16)",
      border: "1px solid rgba(34,197,94,0.28)",
    };
  }

  if (estado === "ANULADO") {
    return {
      ...base,
      color: "#fecaca",
      background: "rgba(185,28,28,0.18)",
      border: "1px solid rgba(248,113,113,0.30)",
    };
  }

  return base;
}

export default function InformeDetalle() {
  const router = useRouter();
  const { id } = router.query;

  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingInformeData, setEditingInformeData] = useState(false);
const [savingInformeData, setSavingInformeData] = useState(false);
const [informeDataError, setInformeDataError] = useState("");
const [informeDataForm, setInformeDataForm] = useState({
  informe_titular_nombre: "",
  informe_titular_documento: "",
  informe_titular_estado_civil: "",
  informe_titular_porcentaje: "",
  informe_titular_tipo_persona: "HUMANA",
informe_titular_apellido: "",
informe_titular_nombres: "",
informe_titular_razon_social: "",
informe_titular_dni: "",
informe_titular_cuil_cuit: "",
informe_titular_desde: "",
informe_titular_domicilio: "",
informe_condominos: [],
informe_titular_conyuge_apellido: "",
informe_titular_conyuge_nombres: "",
informe_titular_conyuge_dni: "",
informe_titular_conyuge_cuil_cuit: "",
  informe_vehiculo_marca: "",
  informe_vehiculo_modelo: "",
  informe_vehiculo_tipo: "",
  informe_vehiculo_anio: "",
  informe_vehiculo_motor: "",
  informe_vehiculo_chasis: "",
  informe_radicacion: "",
  informe_registro_interviniente: "",
  informe_observaciones_registrales: "",
});

  const [notes, setNotes] = useState([]);
const [noteText, setNoteText] = useState("");
const [savingNote, setSavingNote] = useState(false);
const [replyFor, setReplyFor] = useState(null);

const [anulando, setAnulando] = useState(false);
const [motivoAnulacion, setMotivoAnulacion] = useState("");
const [savingAnulacion, setSavingAnulacion] = useState(false);

const [isAdmin, setIsAdmin] = useState(false);

const [entregando, setEntregando] = useState(false);
const [resultadoEntrega, setResultadoEntrega] = useState("");
const [detalleObservacion, setDetalleObservacion] = useState("");
const [savingEntrega, setSavingEntrega] = useState(false);

const fileRef = useRef(null);
const printResumenTriggeredRef = useRef(false);
const [files, setFiles] = useState([]);
const [uploadingFile, setUploadingFile] = useState(false);
const [downloadingFile, setDownloadingFile] = useState(null);
const [selectedFileNames, setSelectedFileNames] = useState([]);

const BUCKET = "dia-requests";

const formatDateOnly = (value) => {
  if (!value) return "—";

  const [year, month, day] = String(value).split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
};

const getInformeTitularDisplayName = (source) => {
  if (!source) return "—";

  if (source.informe_titular_tipo_persona === "JURIDICA") {
    return source.informe_titular_razon_social || "—";
  }

  const apellido = source.informe_titular_apellido || "";
  const nombres = source.informe_titular_nombres || "";

  if (apellido && nombres) return `${apellido}, ${nombres}`;
  if (apellido) return apellido;
  if (nombres) return nombres;

  return source.informe_titular_nombre || "—";
};

const formatDniInput = (value) => {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);

  return digits.replace(/^(\d{1,2})(\d{3})(\d{0,3}).*/, (_, a, b, c) =>
    c ? `${a}.${b}.${c}` : `${a}.${b}`
  );
};

const formatDocumentoInput = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length <= 8) {
    return digits
      .replace(/^(\d{1,2})(\d{3})(\d{0,3}).*/, (_, a, b, c) =>
        c ? `${a}.${b}.${c}` : `${a}.${b}`
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
};

const buildInformeDataForm = (source) => ({
  informe_titular_nombre: source?.informe_titular_nombre || "",
  informe_titular_documento: source?.informe_titular_documento || "",
  informe_titular_estado_civil: source?.informe_titular_estado_civil || "",
  informe_titular_porcentaje:
    source?.informe_titular_porcentaje !== null &&
    source?.informe_titular_porcentaje !== undefined
      ? String(source.informe_titular_porcentaje)
      : "",
      informe_titular_tipo_persona: source?.informe_titular_tipo_persona || "HUMANA",
informe_titular_apellido: source?.informe_titular_apellido || "",
informe_titular_nombres: source?.informe_titular_nombres || "",
informe_titular_razon_social: source?.informe_titular_razon_social || "",
informe_titular_dni: source?.informe_titular_dni || "",
informe_titular_cuil_cuit: source?.informe_titular_cuil_cuit || "",
informe_titular_desde: source?.informe_titular_desde || "",
informe_titular_domicilio: source?.informe_titular_domicilio || "",
informe_condominos: Array.isArray(source?.informe_condominos)
  ? source.informe_condominos
  : [],
informe_titular_conyuge_apellido:
  source?.informe_titular_conyuge_apellido || "",
informe_titular_conyuge_nombres:
  source?.informe_titular_conyuge_nombres || "",
informe_titular_conyuge_dni: source?.informe_titular_conyuge_dni || "",
informe_titular_conyuge_cuil_cuit:
  source?.informe_titular_conyuge_cuil_cuit || "",
  informe_vehiculo_marca: source?.informe_vehiculo_marca || "",
  informe_vehiculo_modelo: source?.informe_vehiculo_modelo || "",
  informe_vehiculo_tipo: source?.informe_vehiculo_tipo || "",
  informe_vehiculo_anio: source?.informe_vehiculo_anio || "",
  informe_vehiculo_motor: source?.informe_vehiculo_motor || "",
  informe_vehiculo_chasis: source?.informe_vehiculo_chasis || "",
  informe_radicacion: source?.informe_radicacion || "",
  informe_registro_interviniente: source?.informe_registro_interviniente || "",
  informe_observaciones_registrales:
    source?.informe_observaciones_registrales || "",
});

const handleStartEditInformeData = () => {
  setInformeDataForm(buildInformeDataForm(informe));
  setEditingInformeData(true);
};

const handleCancelEditInformeData = () => {
  setInformeDataForm(buildInformeDataForm(informe));
  setEditingInformeData(false);
};

const handleInformeDataChange = (field, value) => {
  setInformeDataForm((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const createEmptyCondomino = () => ({
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
});

const handleAddCondomino = () => {
  setInformeDataForm((prev) => ({
    ...prev,
    informe_condominos: [
      ...(Array.isArray(prev.informe_condominos) ? prev.informe_condominos : []),
      createEmptyCondomino(),
    ],
  }));
};

const handleCondominoChange = (index, field, value) => {
  setInformeDataForm((prev) => {
    const condominos = Array.isArray(prev.informe_condominos)
      ? [...prev.informe_condominos]
      : [];

    condominos[index] = {
      ...(condominos[index] || createEmptyCondomino()),
      [field]: value,
    };

    return {
      ...prev,
      informe_condominos: condominos,
    };
  });
};

const handleRemoveCondomino = (index) => {
  setInformeDataForm((prev) => ({
    ...prev,
    informe_condominos: Array.isArray(prev.informe_condominos)
      ? prev.informe_condominos.filter((_, itemIndex) => itemIndex !== index)
      : [],
  }));
};

const parsePorcentaje = (value) => {
  const normalized = String(value || "").replace(",", ".");
  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getTitularidadTotal = (form) => {
  const titularPorcentaje = parsePorcentaje(form.informe_titular_porcentaje);

  const condominosTotal = Array.isArray(form.informe_condominos)
    ? form.informe_condominos.reduce(
        (total, condomino) => total + parsePorcentaje(condomino?.porcentaje),
        0
      )
    : 0;

  return titularPorcentaje + condominosTotal;
};


const handleSaveInformeData = async () => {
  if (!isAdmin || !informe?.id) return;

  setSavingInformeData(true);
  setError("");
  setInformeDataError("");

  const titularidadTotal = getTitularidadTotal(informeDataForm);

if (titularidadTotal !== 100) {
  setSavingInformeData(false);
  setInformeDataError(
    `La titularidad debe sumar 100%. Actualmente suma ${titularidadTotal}%.`
  );
  return;
}

  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    const payload = {
      ...informeDataForm,
      informe_titular_porcentaje:
        informeDataForm.informe_titular_porcentaje === ""
          ? null
          : Number(informeDataForm.informe_titular_porcentaje),
      informe_actualizado_en: new Date().toISOString(),
      informe_actualizado_por: userId,
    };

    const { data, error: updateError } = await supabase
      .from("dia_requests")
      .update(payload)
      .eq("id", informe.id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    setInforme(data);
    setInformeDataForm(buildInformeDataForm(data));
    setEditingInformeData(false);
  } catch (err) {
    setError(err.message || "No se pudieron guardar los datos del informe.");
  } finally {
    setSavingInformeData(false);
  }
};

const fetchNotes = async (requestId) => {
  const { data, error } = await supabase
    .from("dia_notes")
    .select(
      "id, request_id, author_id, note, parent_id, created_at, author:profiles(full_name, role)"
    )
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  if (!error) {
    setNotes(data || []);
  }
};

const fetchFiles = async (requestId) => {
  const { data, error } = await supabase
    .from("dia_request_files")
    .select("*")
    .eq("request_id", requestId)
    .order("id", { ascending: true });

  if (!error) {
    setFiles(data || []);
  }
};


const handleAddNote = async () => {
  const text = (noteText || "").trim();

  if (!text) return;

  setSavingNote(true);

  try {
    const { data: auth } = await supabase.auth.getUser();

  const { error } = await supabase.from("dia_notes").insert({
  request_id: id,
  author_id: auth?.user?.id || null,
  note: text,
  parent_id: replyFor || null,
});

    if (error) throw error;

  setNoteText("");
setReplyFor(null);
await fetchNotes(id);
  } catch (err) {
    setError(err.message || "No se pudo guardar la nota.");
  } finally {
    setSavingNote(false);
  }
};

const handleAnularPedido = async () => {
  const motivo = (motivoAnulacion || "").trim();

  if (!motivo) {
    setError("Indicá el motivo de anulación.");
    return;
  }

  setSavingAnulacion(true);
  setError("");

  try {
    const { data: auth } = await supabase.auth.getUser();

    const patch = {
      status: "ANULADO",
      motivo_anulacion: motivo,
      anulado_en: new Date().toISOString(),
      anulado_por: auth?.user?.id || null,
    };

    const handleChangeStatus = async (nextStatus) => {
  setError("");

 const { data: auth } = await supabase.auth.getUser();

const patch = {
  status: nextStatus,
  updated_at: updatedAt,
};

if (nextStatus === "EN CURSO") {
  patch.en_curso_en = updatedAt;
  patch.en_curso_por = auth?.user?.id || null;
}

const { error } = await supabase
  .from("dia_requests")
  .update(patch)
  .eq("id", id);

  if (error) {
    setError(error.message || "No se pudo cambiar el estado.");
    return;
  }

setInforme((prev) => ({
  ...prev,
  ...patch,
}));
};

const handleEntregarInforme = async () => {
  if (!resultadoEntrega) {
    setError("Seleccioná el resultado de la entrega.");
    return;
  }

  if (resultadoEntrega === "OBSERVADO" && !detalleObservacion.trim()) {
    setError("Indicá el detalle de la observación.");
    return;
  }

  setSavingEntrega(true);
  setError("");

  const patch = {
    status: "ENTREGADO",
    result: resultadoEntrega,
    observed_other:
      resultadoEntrega === "OBSERVADO" ? detalleObservacion.trim() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("dia_requests")
    .update(patch)
    .eq("id", id);

  if (error) {
    setError(error.message || "No se pudo entregar el informe.");
    setSavingEntrega(false);
    return;
  }

  setInforme((prev) => ({
    ...prev,
    ...patch,
  }));

  setEntregando(false);
  setResultadoEntrega("");
  setDetalleObservacion("");
  setSavingEntrega(false);
};

    const { error } = await supabase
      .from("dia_requests")
      .update(patch)
      .eq("id", id);

    if (error) throw error;

    setInforme((prev) => ({
      ...prev,
      ...patch,
    }));

    setAnulando(false);
    setMotivoAnulacion("");
  } catch (err) {
    setError(err.message || "No se pudo anular el pedido.");
  } finally {
    setSavingAnulacion(false);
  }
};

  useEffect(() => {
    if (!id) return;

    async function fetchInforme() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("dia_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message || "No se pudo cargar el informe.");
        setInforme(null);
        setLoading(false);
        return;
      }

      const { data: auth } = await supabase.auth.getUser();

if (auth?.user?.id) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  setIsAdmin((profile?.role || "").toLowerCase() === "admin");
}

      setInforme(data);
      await fetchNotes(id);
      await fetchFiles(id);
      setLoading(false);
    }

    fetchInforme();
  }, [id]);

useEffect(() => {
  if (!informe || editingInformeData) return;

  setInformeDataForm(buildInformeDataForm(informe));
}, [informe, editingInformeData]);

  useEffect(() => {
  if (loading) return;

  if (typeof window !== "undefined") {
    const hash = window.location.hash;

    if (hash === "#notas" || hash === "#archivos") {
      setTimeout(() => {
        const targetBlock = document.getElementById(hash.replace("#", ""));

        if (targetBlock) {
          targetBlock.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  }
}, [loading]);

useEffect(() => {
  if (loading) return;
  if (printResumenTriggeredRef.current) return;

  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const shouldPrintResumen = params.get("print") === "resumen";

  if (!shouldPrintResumen) return;

  printResumenTriggeredRef.current = true;

  setTimeout(() => {
    window.print();
  }, 700);
}, [loading, informe, notes, files]);

  const handleChangeStatus = async (nextStatus) => {
  setError("");

  const updatedAt = new Date().toISOString();

  const { error } = await supabase
    .from("dia_requests")
    .update({
      status: nextStatus,
      updated_at: updatedAt,
    })
    .eq("id", id);

  if (error) {
    setError(error.message || "No se pudo cambiar el estado.");
    return;
  }

  setInforme((prev) => ({
    ...prev,
    status: nextStatus,
    updated_at: updatedAt,
  }));
};

const handleEntregarInforme = async () => {
  if (!resultadoEntrega) {
    setError("Seleccioná el resultado de la entrega.");
    return;
  }

  if (resultadoEntrega === "OBSERVADO" && !detalleObservacion.trim()) {
    setError("Indicá el detalle de la observación.");
    return;
  }

  setSavingEntrega(true);
  setError("");

const updatedAt = new Date().toISOString();

const { data: auth } = await supabase.auth.getUser();

const patch = {
  status: "ENTREGADO",
  result: resultadoEntrega,
  observed_other:
    resultadoEntrega === "OBSERVADO" ? detalleObservacion.trim() : null,
  updated_at: updatedAt,
  entregado_en: updatedAt,
  entregado_por: auth?.user?.id || null,
};

  const { error } = await supabase
    .from("dia_requests")
    .update(patch)
    .eq("id", id);

  if (error) {
    setError(error.message || "No se pudo entregar el informe.");
    setSavingEntrega(false);
    return;
  }

  setInforme((prev) => ({
    ...prev,
    ...patch,
  }));

  setEntregando(false);
  setResultadoEntrega("");
  setDetalleObservacion("");
  setSavingEntrega(false);
};

const handleUploadFile = async () => {
  if (!fileRef.current?.files?.length) {
    setError("Seleccioná uno o más archivos para subir.");
    return;
  }

  const selectedFiles = Array.from(fileRef.current.files);

  setUploadingFile(true);
  setError("");

  try {
    for (const file of selectedFiles) {
      const safeFileName = file.name.replace(/[^\w.\-]/g, "_");

      const filePath = `${id}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}_${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("dia_request_files")
        .insert({
          request_id: id,
          path: filePath,
          filename: file.name,
          size_kb: Math.round((file.size || 0) / 1024),
          content_type: file.type || null,
        });

      if (insertError) throw insertError;
    }

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    setSelectedFileNames([]);

    await fetchFiles(id);
  } catch (err) {
    setError(err.message || "No se pudieron subir los archivos.");
  } finally {
    setUploadingFile(false);
  }
};

const handleOpenFile = async (file) => {
  if (!file?.path) return;

  setError("");

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(file.path, 60);

  if (error) {
    setError(error.message || "No se pudo abrir el archivo.");
    return;
  }

  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
};

const handleDownloadFile = async (file) => {
  if (!file?.path) return;

  setError("");

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(file.path, 60, {
      download: file.filename || true,
    });

  if (error) {
    setError(error.message || "No se pudo descargar el archivo.");
    return;
  }

  const link = document.createElement("a");
  link.href = data.signedUrl;
  link.download = file.filename || "archivo";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handlePrintFile = async (file) => {
  if (!file?.path) return;

  setError("");

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(file.path, 60);

  if (error) {
    setError(error.message || "No se pudo imprimir el archivo.");
    return;
  }

  const printWindow = window.open(data.signedUrl, "_blank", "noopener,noreferrer");

  if (!printWindow) {
    setError("No se pudo abrir la ventana de impresión. Revisá si el navegador bloqueó la ventana emergente.");
    return;
  }

  setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch (printError) {
      console.error("Error al imprimir archivo:", printError);
    }
  }, 1200);
};

const handleDeleteFile = async (file) => {
  if (!isAdmin) return;

  const ok = confirm(`¿Eliminar el archivo "${file.filename}"?`);

  if (!ok) return;

  setError("");

  try {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([file.path]);

    if (storageError) throw storageError;

    const { error: dbError } = await supabase
      .from("dia_request_files")
      .delete()
      .eq("id", file.id);

    if (dbError) throw dbError;

    await fetchFiles(id);
  } catch (err) {
    setError(err.message || "No se pudo eliminar el archivo.");
  }
};

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>Cargando informe...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>Error: {error}</div>
      </div>
    );
  }

  if (!informe) {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>No se encontró el informe.</div>
      </div>
    );
  }

  const rootNotes = notes.filter((note) => !note.parent_id);

const getRepliesForNote = (noteId) => {
  return notes.filter((note) => note.parent_id === noteId);
};

const printDate = new Date().toLocaleDateString("es-AR");

const informeTitularidadTotal =
  Math.round(getTitularidadTotal(informeDataForm) * 100) / 100;

const informeTitularidadFaltante =
  Math.round((100 - informeTitularidadTotal) * 100) / 100;

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <main style={mainPanelStyle}>
            <div className="print-resumen-header">
  <div className="print-brand">SAKI</div>

  <h1>Resumen del legajo {informe?.dominio || informe?.short_code || informe?.id}</h1>

  <p>Fecha de impresión: {printDate}</p>

  <p>
    Solicitado por: {informe?.requester_email || "—"}
  </p>
</div>
          <section style={heroStyle} className="no-print">
            <div>
              <div style={eyebrowStyle}>PORTAL DÍA</div>
              <h1 style={titleStyle}>Detalle del informe</h1>

              <p style={subtitleStyle}>
                Vista operativa del pedido, notas, archivos e historial.
              </p>
            </div>

<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  }}
>
  <button
    type="button"
    onClick={() => {
  window.location.href = `/dia/informes?selected=${id}`;
}}
    style={backButtonStyle}
  >
    Volver al Resumen
  </button>

  <Link href="/dia/informes" style={backButtonStyle}>
    Volver a informes
  </Link>
</div>
          </section>

          <section
  style={{
    ...summaryCardStyle,
    gridTemplateColumns:
      getEstadoInformeLabel(informe.status) === "ENTREGADO" &&
      getResultadoInformeLabel(informe.result)
        ? "repeat(5, minmax(0, 1fr))"
        : "repeat(4, minmax(0, 1fr))",
  }}
>
            <div>
              <div style={labelStyle}>
  {informe.dominio ? "Dominio" : "Identificación"}
</div>
              <div style={mainValueStyle}>{getReferencia(informe)}</div>
            </div>

            <div>
              <div style={labelStyle}>Tipo de informe</div>
              <div style={valueStyle}>{getTipoInformeLabel(informe.type)}</div>
            </div>

            <div style={summaryItemStyle}>
  <div style={labelStyle}>Estado</div>

  <span style={getEstadoInformeStyle(informe.status)}>
    {getEstadoInformeLabel(informe.status)}
  </span>
</div>

{getEstadoInformeLabel(informe.status) === "ENTREGADO" &&
  getResultadoInformeLabel(informe.result) && (
    <div style={summaryItemStyle}>
      <div style={labelStyle}>Resultado</div>

      <span style={getResultadoInformeStyle(informe.result)}>
        {getResultadoInformeLabel(informe.result)}
      </span>
    </div>
  )}
  
<div>
  <div style={labelStyle}>
    {getEstadoInformeLabel(informe.status) === "EN CURSO"
      ? "En curso desde"
      : getEstadoInformeLabel(informe.status) === "ENTREGADO"
      ? "Fecha de entrega"
      : getEstadoInformeLabel(informe.status) === "ANULADO"
      ? "Fecha de anulación"
      : "Fecha de solicitud"}
  </div>

  <div style={valueStyle}>
    {getEstadoInformeLabel(informe.status) === "EN CURSO"
      ? formatDate(informe.en_curso_en || informe.updated_at)
      : getEstadoInformeLabel(informe.status) === "ENTREGADO"
      ? formatDate(informe.entregado_en || informe.updated_at)
      : getEstadoInformeLabel(informe.status) === "ANULADO"
      ? formatDate(informe.anulado_en || informe.updated_at)
      : formatDate(informe.created_at)}
  </div>
</div>
          </section>

{isAdmin && getEstadoInformeLabel(informe.status) === "SOLICITADO" && (
  <section style={adminActionCardStyle}>
    <div style={adminActionRowStyle}>
      <div>
        <h2 style={adminActionTitleStyle}>Gestión SAKI</h2>
        <p style={adminActionTextStyle}>
          Marcá el pedido como EN CURSO cuando SAKI tome la gestión del informe.
        </p>
      </div>

      <button
        type="button"
        style={adminPrimaryButtonStyle}
        onClick={() => handleChangeStatus("EN CURSO")}
      >
        Marcar en curso
      </button>
    </div>
  </section>
)}

{isAdmin && getEstadoInformeLabel(informe.status) === "EN CURSO" && (
  <section style={adminActionCardStyle}>
    {!entregando ? (
      <div style={adminActionRowStyle}>
        <div>
          <h2 style={adminActionTitleStyle}>Entrega del informe</h2>
          <p style={adminActionTextStyle}>
            Cuando el informe esté listo, cargá el resultado de la entrega.
          </p>
        </div>

        <button
          type="button"
          style={adminPrimaryButtonStyle}
          onClick={() => setEntregando(true)}
        >
          Entregar informe
        </button>
      </div>
    ) : (
      <div>
        <h2 style={adminActionTitleStyle}>Resultado de entrega</h2>
        <p style={adminActionTextStyle}>
          Indicá si el informe se entrega aprobado u observado.
        </p>

        <div style={entregaOptionsStyle}>
          <button
            type="button"
            style={
              resultadoEntrega === "APROBADO"
                ? entregaOptionActiveStyle
                : entregaOptionStyle
            }
            onClick={() => setResultadoEntrega("APROBADO")}
          >
            Aprobado
          </button>

          <button
            type="button"
            style={
              resultadoEntrega === "OBSERVADO"
                ? entregaOptionActiveStyle
                : entregaOptionStyle
            }
            onClick={() => setResultadoEntrega("OBSERVADO")}
          >
            Observado
          </button>
        </div>

        {resultadoEntrega === "OBSERVADO" && (
          <textarea
            style={anulacionTextareaStyle}
            placeholder="Detalle de la observación..."
            rows={3}
            value={detalleObservacion}
            onChange={(e) => setDetalleObservacion(e.target.value)}
          />
        )}

        <div style={anulacionActionsStyle}>
          <button
            type="button"
            style={adminPrimaryButtonStyle}
            onClick={handleEntregarInforme}
            disabled={savingEntrega}
          >
            {savingEntrega ? "Guardando..." : "Confirmar entrega"}
          </button>

          <button
            type="button"
            style={cancelAnulacionButtonStyle}
            onClick={() => {
              setEntregando(false);
              setResultadoEntrega("");
              setDetalleObservacion("");
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    )}
  </section>
)}

{informe.status === "SOLICITADO" && (
  <section style={anulacionCardStyle}>
    {!anulando ? (
      <div style={anulacionRowStyle}>
        <div>
          <h2 style={anulacionTitleStyle}>Anulación del pedido</h2>
          <p style={anulacionTextStyle}>
            La anulación está disponible únicamente mientras el pedido permanezca en estado SOLICITADO.
          </p>
        </div>

        <button
          type="button"
          style={anularButtonStyle}
          onClick={() => setAnulando(true)}
        >
          Anular pedido
        </button>
      </div>
    ) : (
      <div>
        <h2 style={anulacionTitleStyle}>Confirmar anulación</h2>
        <p style={anulacionTextStyle}>
          Indicá el motivo. Esta acción dejará el pedido como ANULADO.
        </p>

        <textarea
          style={anulacionTextareaStyle}
          placeholder="Motivo de anulación..."
          rows={3}
          value={motivoAnulacion}
          onChange={(e) => setMotivoAnulacion(e.target.value)}
        />

        <div style={anulacionActionsStyle}>
          <button
            type="button"
            style={anularButtonStyle}
            onClick={handleAnularPedido}
            disabled={savingAnulacion}
          >
            {savingAnulacion ? "Anulando..." : "Confirmar anulación"}
          </button>

          <button
            type="button"
            style={cancelAnulacionButtonStyle}
            onClick={() => {
              setAnulando(false);
              setMotivoAnulacion("");
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    )}
  </section>
)}

{getEstadoInformeLabel(informe.status) === "ENTREGADO" &&
  getResultadoInformeLabel(informe.result) === "OBSERVADO" && (
    <section style={observacionCardStyle}>
      <h2 style={observacionTitleStyle}>Detalle de observación</h2>

      <p style={observacionTextStyle}>
        {informe.observed_other || "No se cargó detalle de la observación."}
      </p>
    </section>
  )}

          <section style={dataCardStyle}>
            <h2 style={sectionTitleStyle}>Datos del pedido</h2>

            <div style={dataGridStyle}>
              <InfoItem label="Tienda" value={informe.tienda} />
              <InfoItem label="Franquiciado" value={informe.franquiciado} />
              <InfoItem label="CUIT / CUIL" value={informe.identificacion_cuit} />
              <InfoItem label="DNI" value={informe.identificacion_dni} />
              <InfoItem label="Titular / Razón social" value={informe.identificacion_nombre} />
              <InfoItem label="Solicitado por" value={informe.requester_email} />
            </div>
          </section>

          <section style={dataCardStyle}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      marginBottom: "18px",
    }}
  >
    <h2 style={sectionTitleStyle}>Datos del informe</h2>
    
    {isAdmin && !editingInformeData && (
      <button
        type="button"
        onClick={handleStartEditInformeData}
        style={{
          border: "1px solid rgba(96, 165, 250, 0.38)",
          background: "rgba(37, 99, 235, 0.16)",
          color: "#bfdbfe",
          borderRadius: "999px",
          padding: "9px 14px",
          fontSize: "13px",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Cargar / editar datos del informe
      </button>
    )}
  </div>

  {editingInformeData ? (
    <>
    {informeDataError && (
  <div
    style={{
      border: "1px solid rgba(248, 113, 113, 0.34)",
      background: "rgba(127, 29, 29, 0.18)",
      color: "#fecaca",
      borderRadius: "16px",
      padding: "12px 14px",
      marginBottom: "14px",
      fontSize: "13px",
      fontWeight: 700,
    }}
  >
    {informeDataError}
  </div>
)}
      <div style={dataGridStyle}>
        <div style={informeDataGroupTitleStyle}>Titular</div>

<select
  style={editInputStyle}
  value={informeDataForm.informe_titular_tipo_persona}
  onChange={(e) =>
    handleInformeDataChange("informe_titular_tipo_persona", e.target.value)
  }
>
  <option value="HUMANA">Persona humana</option>
  <option value="JURIDICA">Persona jurídica</option>
</select>

{informeDataForm.informe_titular_tipo_persona === "JURIDICA" ? (
  <>
    <input
      style={editInputStyle}
      placeholder="Razón social"
      value={informeDataForm.informe_titular_razon_social}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_razon_social",
          e.target.value.toUpperCase()
        )
      }
    />

    <input
      style={editInputStyle}
      placeholder="CUIT"
      value={informeDataForm.informe_titular_cuil_cuit}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_cuil_cuit",
          formatDocumentoInput(e.target.value)
        )
      }
    />
  </>
) : (
  <>
    <input
      style={editInputStyle}
      placeholder="Apellido"
      value={informeDataForm.informe_titular_apellido}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_apellido",
          e.target.value.toUpperCase()
        )
      }
    />

    <input
      style={editInputStyle}
      placeholder="Nombre"
      value={informeDataForm.informe_titular_nombres}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_nombres",
          e.target.value.toUpperCase()
        )
      }
    />

    <input
      style={editInputStyle}
      placeholder="DNI"
      value={informeDataForm.informe_titular_dni}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_dni",
          formatDocumentoInput(e.target.value)
        )
      }
    />

    <input
      style={editInputStyle}
      placeholder="CUIL / CUIT"
      value={informeDataForm.informe_titular_cuil_cuit}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_cuil_cuit",
          formatDocumentoInput(e.target.value)
        )
      }
    />

    <select
      style={editInputStyle}
      value={informeDataForm.informe_titular_estado_civil}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_estado_civil",
          e.target.value
        )
      }
    >
      <option value="">Estado civil</option>
      <option value="SOLTERO/A">Soltero/a</option>
      <option value="CASADO/A">Casado/a</option>
      <option value="DIVORCIADO/A">Divorciado/a</option>
      <option value="VIUDO/A">Viudo/a</option>
        </select>
  </>
)}

<div style={{ position: "relative", width: "100%" }}>
  <input
    style={{
      ...editInputStyle,
      paddingRight: "46px",
      colorScheme: "dark",
    }}
    type="date"
    value={informeDataForm.informe_titular_desde}
    onChange={(e) =>
      handleInformeDataChange("informe_titular_desde", e.target.value)
    }
  />

  <span
    style={{
      position: "absolute",
      right: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#93c5fd",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
    }}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  </span>
</div>

<input
  style={editInputStyle}
  placeholder="Porcentaje de titularidad"
  value={informeDataForm.informe_titular_porcentaje}
  onChange={(e) =>
    handleInformeDataChange("informe_titular_porcentaje", e.target.value)
  }
/>

<input
  style={editInputStyle}
  placeholder="Domicilio"
  value={informeDataForm.informe_titular_domicilio}
  onChange={(e) =>
    handleInformeDataChange(
      "informe_titular_domicilio",
      e.target.value.toUpperCase()
    )
  }
/>

{informeDataForm.informe_titular_estado_civil === "CASADO/A" && (
  <>
    <div style={informeDataGroupTitleStyle}>Cónyuge del titular</div>

    <input
      style={editInputStyle}
      placeholder="Apellido del cónyuge"
      value={informeDataForm.informe_titular_conyuge_apellido}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_conyuge_apellido",
          e.target.value.toUpperCase()
        )
      }
    />

    <input
      style={editInputStyle}
      placeholder="Nombre del cónyuge"
      value={informeDataForm.informe_titular_conyuge_nombres}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_conyuge_nombres",
          e.target.value.toUpperCase()
        )
      }
    />

    <input
      style={editInputStyle}
      placeholder="DNI del cónyuge"
      value={informeDataForm.informe_titular_conyuge_dni}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_conyuge_dni",
          formatDniInput(e.target.value)
        )
      }
    />

    <input
      style={editInputStyle}
      placeholder="CUIL / CUIT del cónyuge"
      value={informeDataForm.informe_titular_conyuge_cuil_cuit}
      onChange={(e) =>
        handleInformeDataChange(
          "informe_titular_conyuge_cuil_cuit",
          formatDocumentoInput(e.target.value)
        )
      }
    />
  </>
)}

{((informeDataForm.informe_titular_porcentaje !== "" &&
  Number(informeDataForm.informe_titular_porcentaje) < 100) ||
  informeDataForm.informe_condominos.length > 0) && (
  <>
    <div style={informeDataGroupTitleStyle}>Condóminos</div>

    {informeDataForm.informe_condominos.length === 0 && (
      <div
        style={{
          gridColumn: "1 / -1",
          color: "rgba(226, 237, 249, 0.68)",
          fontSize: "13px",
          lineHeight: 1.45,
        }}
      >
        La titularidad declarada es menor al 100%. Agregá uno o más condóminos
        hasta completar el total.
      </div>
    )}

    {informeDataForm.informe_condominos.map((condomino, index) => (
      <div
        key={index}
        style={{
  gridColumn: "1 / -1",
  border: "1px solid rgba(109, 45, 212, 0.18)",
  borderLeft: "4px solid rgba(109, 45, 212, 0.55)",
  background:
    "linear-gradient(180deg, rgba(109, 45, 212, 0.18), rgba(3, 18, 34, 0.48))",
  borderRadius: "18px",
  padding: "16px",
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
            onClick={() => handleRemoveCondomino(index)}
            style={{
              border: "1px solid rgba(248, 113, 113, 0.28)",
              background: "rgba(127, 29, 29, 0.18)",
              color: "#fecaca",
              borderRadius: "999px",
              padding: "7px 10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Quitar
          </button>
        </div>

        <input
          style={editInputStyle}
          placeholder="Apellido"
          value={condomino.apellido}
          onChange={(e) =>
            handleCondominoChange(index, "apellido", e.target.value.toUpperCase())
          }
        />

        <input
          style={editInputStyle}
          placeholder="Nombre"
          value={condomino.nombres}
          onChange={(e) =>
            handleCondominoChange(index, "nombres", e.target.value.toUpperCase())
          }
        />

        <input
          style={editInputStyle}
          placeholder="DNI"
          value={condomino.dni}
          onChange={(e) =>
            handleCondominoChange(index, "dni", formatDniInput(e.target.value))
          }
        />

        <input
          style={editInputStyle}
          placeholder="CUIL / CUIT"
          value={condomino.cuil_cuit}
          onChange={(e) =>
            handleCondominoChange(
              index,
              "cuil_cuit",
              formatDocumentoInput(e.target.value)
            )
          }
        />

        <select
          style={editInputStyle}
          value={condomino.estado_civil}
          onChange={(e) =>
            handleCondominoChange(index, "estado_civil", e.target.value)
          }
        >
          <option value="">Estado civil</option>
          <option value="SOLTERO/A">Soltero/a</option>
          <option value="CASADO/A">Casado/a</option>
          <option value="DIVORCIADO/A">Divorciado/a</option>
          <option value="VIUDO/A">Viudo/a</option>
        </select>

        <div style={{ position: "relative", width: "100%" }}>
  <input
    style={{
      ...editInputStyle,
      paddingRight: "46px",
      colorScheme: "dark",
    }}
    type="date"
    value={condomino.titular_desde}
    onChange={(e) =>
      handleCondominoChange(index, "titular_desde", e.target.value)
    }
  />

  <span
    style={{
      position: "absolute",
      right: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#93c5fd",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
    }}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  </span>
</div>

        <input
          style={editInputStyle}
          placeholder="Porcentaje"
          value={condomino.porcentaje}
          onChange={(e) =>
            handleCondominoChange(index, "porcentaje", e.target.value)
          }
        />

        <input
          style={editInputStyle}
          placeholder="Domicilio"
          value={condomino.domicilio}
          onChange={(e) =>
            handleCondominoChange(index, "domicilio", e.target.value.toUpperCase())
          }
        />

        {condomino.estado_civil === "CASADO/A" && (
          <>
            <div style={informeDataGroupTitleStyle}>
              Cónyuge del condómino
            </div>

            <input
              style={editInputStyle}
              placeholder="Apellido del cónyuge"
              value={condomino.conyuge_apellido}
              onChange={(e) =>
                handleCondominoChange(
                  index,
                  "conyuge_apellido",
                  e.target.value.toUpperCase()
                )
              }
            />

            <input
              style={editInputStyle}
              placeholder="Nombre del cónyuge"
              value={condomino.conyuge_nombres}
              onChange={(e) =>
                handleCondominoChange(
                  index,
                  "conyuge_nombres",
                  e.target.value.toUpperCase()
                )
              }
            />

            <input
              style={editInputStyle}
              placeholder="DNI del cónyuge"
              value={condomino.conyuge_dni}
              onChange={(e) =>
                handleCondominoChange(
                  index,
                  "conyuge_dni",
                  formatDniInput(e.target.value)
                )
              }
            />

            <input
              style={editInputStyle}
              placeholder="CUIL / CUIT del cónyuge"
              value={condomino.conyuge_cuil_cuit}
              onChange={(e) =>
                handleCondominoChange(
                  index,
                  "conyuge_cuil_cuit",
                  formatDocumentoInput(e.target.value)
                )
              }
            />
          </>
        )}
      </div>
    ))}

    <button
      type="button"
      onClick={handleAddCondomino}
      style={{
        gridColumn: "1 / -1",
        justifySelf: "flex-start",
        border: "1px solid rgba(96, 165, 250, 0.34)",
        background: "rgba(37, 99, 235, 0.14)",
        color: "#bfdbfe",
        borderRadius: "999px",
        padding: "9px 14px",
        fontSize: "13px",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
<div
  style={{
    gridColumn: "1 / -1",
    border:
      informeTitularidadTotal === 100
        ? "1px solid rgba(34, 197, 94, 0.34)"
        : "1px solid rgba(251, 191, 36, 0.34)",
    background:
      informeTitularidadTotal === 100
        ? "rgba(34, 197, 94, 0.12)"
        : "rgba(217, 119, 6, 0.12)",
    color: informeTitularidadTotal === 100 ? "#bbf7d0" : "#fde68a",
    borderRadius: "16px",
    padding: "12px 14px",
    fontSize: "13px",
    fontWeight: 800,
  }}
>
  {informeTitularidadTotal === 100
    ? "Titularidad completa: 100%."
    : informeTitularidadFaltante > 0
    ? `Titularidad cargada: ${informeTitularidadTotal}%. Falta completar: ${informeTitularidadFaltante}%.`
    : `La titularidad supera el 100%. Actualmente suma ${informeTitularidadTotal}%.`}
</div>

      + Agregar condómino
    </button>
  </>
)}

{Array.isArray(informe.informe_condominos) &&
  informe.informe_condominos.length > 0 && (
    <>
      <div style={informeDataGroupTitleStyle}>Condóminos</div>

      {informe.informe_condominos.map((condomino, index) => (
        <div
          key={index}
          style={{
            gridColumn: "1 / -1",
            border: "1px solid rgba(96, 165, 250, 0.16)",
             background:
    "linear-gradient(180deg, rgba(30, 64, 108, 0.34), rgba(3, 18, 34, 0.48))",
            borderRadius: "18px",
            padding: "14px",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "12px",
          }}
        >
          <div style={informeDataGroupTitleStyle}>
            Condómino {index + 1}
          </div>

          <InfoItem
            label="Apellido, nombre"
            value={
              condomino.apellido || condomino.nombres
                ? `${condomino.apellido || ""}, ${condomino.nombres || ""}`
                : "—"
            }
          />

          <InfoItem label="DNI" value={condomino.dni} />
          <InfoItem label="CUIL / CUIT" value={condomino.cuil_cuit} />
          <InfoItem label="Estado civil" value={condomino.estado_civil} />

          <InfoItem
            label="Titular desde"
            value={formatDateOnly(condomino.titular_desde)}
          />

          <InfoItem
            label="Porcentaje"
            value={condomino.porcentaje ? `${condomino.porcentaje}%` : "—"}
          />

          <InfoItem label="Domicilio" value={condomino.domicilio} />

          {condomino.estado_civil === "CASADO/A" && (
            <>
              <div style={informeDataGroupTitleStyle}>
                Cónyuge del condómino
              </div>

              <InfoItem
                label="Apellido, nombre"
                value={
                  condomino.conyuge_apellido || condomino.conyuge_nombres
                    ? `${condomino.conyuge_apellido || ""}, ${
                        condomino.conyuge_nombres || ""
                      }`
                    : "—"
                }
              />

              <InfoItem label="DNI" value={condomino.conyuge_dni} />

              <InfoItem
                label="CUIL / CUIT"
                value={condomino.conyuge_cuil_cuit}
              />
            </>
          )}
        </div>
      ))}
    </>
  )}

<div style={informeDataGroupTitleStyle}>Automotor</div>

        <input
          style={editInputStyle}
          placeholder="Marca"
          value={informeDataForm.informe_vehiculo_marca}
          onChange={(e) =>
            handleInformeDataChange("informe_vehiculo_marca", e.target.value)
          }
        />

        <input
          style={editInputStyle}
          placeholder="Modelo"
          value={informeDataForm.informe_vehiculo_modelo}
          onChange={(e) =>
            handleInformeDataChange("informe_vehiculo_modelo", e.target.value)
          }
        />

        <input
          style={editInputStyle}
          placeholder="Tipo"
          value={informeDataForm.informe_vehiculo_tipo}
          onChange={(e) =>
            handleInformeDataChange("informe_vehiculo_tipo", e.target.value)
          }
        />

        <input
          style={editInputStyle}
          placeholder="Año"
          value={informeDataForm.informe_vehiculo_anio}
          onChange={(e) =>
            handleInformeDataChange("informe_vehiculo_anio", e.target.value)
          }
        />

        <input
          style={editInputStyle}
          placeholder="Motor"
          value={informeDataForm.informe_vehiculo_motor}
          onChange={(e) =>
            handleInformeDataChange("informe_vehiculo_motor", e.target.value)
          }
        />

        <input
          style={editInputStyle}
          placeholder="Chasis"
          value={informeDataForm.informe_vehiculo_chasis}
          onChange={(e) =>
            handleInformeDataChange("informe_vehiculo_chasis", e.target.value)
          }
        />

<div style={informeDataGroupTitleStyle}>Datos registrales</div>

        <input
          style={editInputStyle}
          placeholder="Radicación"
          value={informeDataForm.informe_radicacion}
          onChange={(e) =>
            handleInformeDataChange("informe_radicacion", e.target.value)
          }
        />

        <input
          style={editInputStyle}
          placeholder="Registro interviniente"
          value={informeDataForm.informe_registro_interviniente}
          onChange={(e) =>
            handleInformeDataChange(
              "informe_registro_interviniente",
              e.target.value
            )
          }
        />
      </div>

      <textarea
        style={{
          ...editInputStyle,
          width: "100%",
          minHeight: "96px",
          resize: "vertical",
          marginTop: "14px",
        }}
        placeholder="Observaciones registrales"
        value={informeDataForm.informe_observaciones_registrales}
        onChange={(e) =>
          handleInformeDataChange(
            "informe_observaciones_registrales",
            e.target.value
          )
        }
      />

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
          onClick={handleCancelEditInformeData}
          disabled={savingInformeData}
          style={{
            border: "1px solid rgba(148, 163, 184, 0.28)",
            background: "rgba(15, 23, 42, 0.35)",
            color: "rgba(226, 237, 249, 0.78)",
            borderRadius: "999px",
            padding: "9px 14px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleSaveInformeData}
          disabled={savingInformeData}
          style={{
            border: "1px solid rgba(96, 165, 250, 0.42)",
            background:
              "linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(29, 78, 216, 0.95))",
            color: "#ffffff",
            borderRadius: "999px",
            padding: "9px 16px",
            fontSize: "13px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {savingInformeData ? "Guardando..." : "Guardar datos"}
        </button>
      </div>
    </>
  ) : (
    <div style={dataGridStyle}>
        <div style={informeDataGroupTitleStyle}>Titular</div>

<InfoItem
  label="Tipo de titular"
  value={
    informe.informe_titular_tipo_persona === "JURIDICA"
      ? "Persona jurídica"
      : "Persona humana"
  }
/>

<InfoItem
  label={
    informe.informe_titular_tipo_persona === "JURIDICA"
      ? "Razón social"
      : "Apellido, nombre"
  }
  value={getInformeTitularDisplayName(informe)}
/>

{informe.informe_titular_tipo_persona !== "JURIDICA" && (
  <InfoItem label="DNI" value={informe.informe_titular_dni} />
)}

<InfoItem label="CUIL / CUIT" value={informe.informe_titular_cuil_cuit} />

{informe.informe_titular_tipo_persona !== "JURIDICA" && (
  <InfoItem label="Estado civil" value={informe.informe_titular_estado_civil} />
)}

<InfoItem
  label="Titular desde"
  value={formatDateOnly(informe.informe_titular_desde)}
/>

<InfoItem
  label="Porcentaje de titularidad"
  value={
    informe.informe_titular_porcentaje !== null &&
    informe.informe_titular_porcentaje !== undefined
      ? `${informe.informe_titular_porcentaje}%`
      : "—"
  }
/>

<InfoItem label="Domicilio" value={informe.informe_titular_domicilio} />
{informe.informe_titular_estado_civil === "CASADO/A" && (
  <>
    <div style={informeDataGroupTitleStyle}>Cónyuge del titular</div>

    <InfoItem
      label="Apellido, nombre"
      value={
        informe.informe_titular_conyuge_apellido ||
        informe.informe_titular_conyuge_nombres
          ? `${informe.informe_titular_conyuge_apellido || ""}, ${
              informe.informe_titular_conyuge_nombres || ""
            }`
          : "—"
      }
    />

    <InfoItem label="DNI" value={informe.informe_titular_conyuge_dni} />

    <InfoItem
      label="CUIL / CUIT"
      value={informe.informe_titular_conyuge_cuil_cuit}
    />
  </>
)}

{Array.isArray(informe.informe_condominos) &&
  informe.informe_condominos.length > 0 && (
    <>
      <div style={informeDataGroupTitleStyle}>Condóminos</div>

      {informe.informe_condominos.map((condomino, index) => (
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
          <div style={informeDataGroupTitleStyle}>
            Condómino {index + 1}
          </div>

          <InfoItem
            label="Apellido, nombre"
            value={
              condomino.apellido || condomino.nombres
                ? `${condomino.apellido || ""}, ${condomino.nombres || ""}`
                : "—"
            }
          />

          <InfoItem label="DNI" value={condomino.dni} />
          <InfoItem label="CUIL / CUIT" value={condomino.cuil_cuit} />
          <InfoItem label="Estado civil" value={condomino.estado_civil} />

          <InfoItem
            label="Titular desde"
            value={formatDateOnly(condomino.titular_desde)}
          />

          <InfoItem
            label="Porcentaje"
            value={condomino.porcentaje ? `${condomino.porcentaje}%` : "—"}
          />

          <InfoItem label="Domicilio" value={condomino.domicilio} />

          {condomino.estado_civil === "CASADO/A" && (
            <>
              <div style={informeDataGroupTitleStyle}>
                Cónyuge del condómino
              </div>

              <InfoItem
                label="Apellido, nombre"
                value={
                  condomino.conyuge_apellido || condomino.conyuge_nombres
                    ? `${condomino.conyuge_apellido || ""}, ${
                        condomino.conyuge_nombres || ""
                      }`
                    : "—"
                }
              />

              <InfoItem label="DNI" value={condomino.conyuge_dni} />

              <InfoItem
                label="CUIL / CUIT"
                value={condomino.conyuge_cuil_cuit}
              />
            </>
          )}
        </div>
      ))}
    </>
  )}

<div style={informeDataGroupTitleStyle}>Automotor</div>

      <InfoItem label="Dominio" value={informe.dominio} />
      <InfoItem label="Marca" value={informe.informe_vehiculo_marca} />
      <InfoItem label="Modelo" value={informe.informe_vehiculo_modelo} />
      <InfoItem label="Tipo" value={informe.informe_vehiculo_tipo} />
      <InfoItem label="Año" value={informe.informe_vehiculo_anio} />
      <InfoItem label="Motor" value={informe.informe_vehiculo_motor} />
      <InfoItem label="Chasis" value={informe.informe_vehiculo_chasis} />

<div style={informeDataGroupTitleStyle}>Datos registrales</div>
      <InfoItem label="Radicación" value={informe.informe_radicacion} />
      <InfoItem
        label="Registro interviniente"
        value={informe.informe_registro_interviniente}
      />
      <InfoItem
        label="Observaciones registrales"
        value={informe.informe_observaciones_registrales}
      />
    </div>
  )}
</section>

<section style={filesCardStyle} id="archivos">
  <div style={notesHeaderStyle}>
    <div>
      <h2 style={sectionTitleStyle}>Archivos del pedido</h2>
      <p style={sectionTextStyle}>
        Documentación vinculada al informe, certificados o constancias adjuntas.
      </p>
    </div>

    {isAdmin && (
      <div style={fileActionsStyle}>
        <input
  type="file"
  ref={fileRef}
  multiple
  style={{ display: "none" }}
  onChange={(e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFileNames(files.map((file) => file.name));
  }}
/>

        <button
          type="button"
          style={fileButtonStyle}
          onClick={() => fileRef.current?.click()}
        >
          Seleccionar archivo
        </button>

        {selectedFileNames.length > 0 && (
  <div style={selectedFileWrapStyle}>
    <span style={selectedFileNameStyle}>
      {selectedFileNames.length === 1
        ? `Archivo seleccionado: ${selectedFileNames[0]}`
        : `${selectedFileNames.length} archivos seleccionados`}
    </span>

    <button
      type="button"
      style={clearSelectedFileButtonStyle}
      onClick={() => {
        setSelectedFileNames([]);

        if (fileRef.current) {
          fileRef.current.value = "";
        }
      }}
    >
      Quitar
    </button>
  </div>
)}

        <button
          type="button"
          style={filePrimaryButtonStyle}
          onClick={handleUploadFile}
          disabled={uploadingFile}
        >
          {uploadingFile ? "Subiendo..." : "Subir archivo"}
        </button>
      </div>
    )}
  </div>

  {files.length === 0 ? (
    <div style={emptyNotesStyle}>No hay archivos adjuntos todavía.</div>
  ) : (
    <div style={fileListStyle}>
      {files.map((file) => (
<div key={file.id || file.path} style={fileItemStyle}>
  <div>
    <div style={fileNameStyle}>{file.filename}</div>
    <div style={fileMetaStyle}>
      {typeof file.size_kb === "number" ? `${file.size_kb} KB` : "Archivo adjunto"}
    </div>
  </div>

<button
  type="button"
  style={{
    ...deleteFileButtonStyle,
    color: "#bfdbfe",
    borderColor: "rgba(147, 197, 253, 0.45)",
    background: "rgba(59, 130, 246, 0.10)",
  }}
  onClick={() => handleOpenFile(file)}
>
  Ver archivo
</button>

  {isAdmin && (
    <button
      type="button"
      style={deleteFileButtonStyle}
      onClick={() => handleDeleteFile(file)}
    >
      Eliminar
    </button>
  )}
</div>
      ))}
    </div>
  )}
</section>

          <section style={notesCardStyle} id="notas">
  <div style={notesHeaderStyle}>
    <div>
      <h2 style={sectionTitleStyle}>Notas del pedido</h2>
      <p style={sectionTextStyle}>
        Conversación operativa vinculada a esta solicitud.
      </p>
    </div>
  </div>

  <div style={notesListStyle}>
    {notes.length === 0 ? (
      <div style={emptyNotesStyle}>No hay notas cargadas todavía.</div>
    ) : (
      rootNotes.map((note) => (
        <div
  key={note.id}
  style={{
    ...noteMessageStyle,
    background:
  note.author?.role === "admin"
    ? "linear-gradient(180deg, rgba(14, 116, 144, 0.36), rgba(8, 47, 73, 0.72))"
    : "rgba(7,30,55,0.58)",
border:
  note.author?.role === "admin"
    ? "1px solid rgba(103, 232, 249, 0.34)"
    : "1px solid rgba(96,165,250,0.14)",
  }}
>
          <div style={noteMetaStyle}>
            <strong>
              {note.author?.role === "admin" ? "SAKI" : "Día"}
            </strong>
            <span>·</span>
            <span>{note.author?.full_name || "Usuario"}</span>
          </div>

          <div style={noteDateStyle}>{formatDate(note.created_at)}</div>

          <div style={noteTextStyle}>{note.note}</div>
          <button
  type="button"
  style={{
    marginTop: "10px",
    border: "1px solid rgba(96,165,250,0.18)",
    borderRadius: "999px",
    background: "rgba(30,64,108,0.46)",
    color: "#dbeafe",
    padding: "7px 11px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  }}
  onClick={() => {
    setNoteText("");
    setReplyFor(note.id);
  }}
>
  Responder
</button>
          {getRepliesForNote(note.id).map((reply) => (
  <div
    key={reply.id}
    style={{
      ...noteMessageStyle,
      marginTop: "12px",
      marginLeft: "32px",
      maxWidth: "78%",
      background:
  reply.author?.role === "admin"
    ? "linear-gradient(180deg, rgba(14, 116, 144, 0.36), rgba(8, 47, 73, 0.72))"
    : "rgba(7,30,55,0.58)",
border:
  reply.author?.role === "admin"
    ? "1px solid rgba(103, 232, 249, 0.34)"
    : "1px solid rgba(96,165,250,0.14)",
    }}
  >
    <div style={noteMetaStyle}>
      <strong>
        {reply.author?.role === "admin" ? "SAKI" : "Día"}
      </strong>
      <span>·</span>
      <span>{reply.author?.full_name || "Usuario"}</span>
    </div>

    <div style={noteDateStyle}>{formatDate(reply.created_at)}</div>

    <div
      style={{
        fontSize: "11px",
        color: "rgba(168,196,232,0.72)",
        marginBottom: "8px",
      }}
    >
      Respuesta a la nota anterior
    </div>

    <div style={noteTextStyle}>{reply.note}</div>
  </div>
))}
        </div>
      ))
    )}
  </div>

  <div style={noteComposerStyle}>
    {replyFor && (
  <div style={replyNoticeStyle}>
    Estás respondiendo una nota. La respuesta quedará vinculada debajo del mensaje original.
    <button
      type="button"
      onClick={() => {
        setReplyFor(null);
        setNoteText("");
      }}
      style={replyCancelButtonStyle}
    >
      Cancelar respuesta
    </button>
  </div>
)}
    <textarea
      style={noteTextareaStyle}
      placeholder={
  replyFor
    ? "Escribir respuesta para esta nota..."
    : "Escribir una nota para este pedido..."
}
      rows={3}
      value={noteText}
      onChange={(e) => setNoteText(e.target.value)}
    />

<button
  type="button"
  style={noteButtonStyle}
  onClick={handleAddNote}
  disabled={savingNote}
>
  {savingNote ? "Guardando..." : replyFor ? "Guardar respuesta" : "Agregar nota"}
</button>
  </div>
</section>
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "22px",
  }}
>
  <button
    type="button"
    onClick={() => {
      if (typeof window !== "undefined") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }}
    style={{
      border: "1px solid rgba(96, 165, 250, 0.32)",
      background: "rgba(37, 99, 235, 0.18)",
      color: "#bfdbfe",
      borderRadius: "999px",
      padding: "10px 16px",
      fontSize: "13px",
      fontWeight: 800,
      cursor: "pointer",
    }}
  >
    ↑ Subir
  </button>
</div>

<style jsx global>{`
  .print-resumen-header {
    display: none;
  }

  @media print {
    body {
      background: #ffffff !important;
    }

    @page {
  margin: 12mm;
}

    .print-resumen-header {
      display: block !important;
      margin-bottom: 22px;
      padding-bottom: 14px;
      border-bottom: 1px solid #d1d5db !important;
      color: #111827 !important;
    }

    .print-brand {
      font-size: 22px !important;
      font-weight: 900 !important;
      letter-spacing: 0.04em !important;
      margin-bottom: 12px !important;
      color: #111827 !important;
    }

    .print-resumen-header h1 {
      font-size: 22px !important;
      margin: 0 0 8px !important;
      color: #111827 !important;
    }

    .print-resumen-header p {
      font-size: 12px !important;
      margin: 4px 0 !important;
      color: #374151 !important;
    }

    button,
    input,
    textarea,
    select {
      display: none !important;
    }

    * {
      box-shadow: none !important;
      text-shadow: none !important;
    }

    main {
      background: #ffffff !important;
      color: #111827 !important;
      padding: 0 !important;
      border: none !important;
    }

  section {
  page-break-inside: auto !important;
  break-inside: auto !important;
  margin-top: 12px !important;
  margin-bottom: 12px !important;
  padding: 14px !important;
}

    h1 {
      font-size: 22px !important;
      color: #111827 !important;
      margin-bottom: 6px !important;
    }

    h2 {
      font-size: 16px !important;
      color: #111827 !important;
      margin-bottom: 10px !important;
    }

    div {
      color: #111827 !important;
    }

    header,
nav,
#__next > header,
#__next > nav,
#__next > div > header,
#__next > div > nav {
  display: none !important;
}

.no-print {
  display: none !important;
}

    [style] {
      background: #ffffff !important;
      border-color: #d1d5db !important;
    }
  }
`}</style>

        </main>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={infoItemStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value || "—"}</div>
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

const backButtonStyle = {
  textDecoration: "none",
  color: "#dbeafe",
  background: "rgba(30,64,108,0.74)",
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "999px",
  padding: "11px 15px",
  fontSize: "14px",
  fontWeight: 750,
};

const summaryCardStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  borderRadius: "22px",
  border: "1px solid rgba(96,165,250,0.14)",
  background:
    "linear-gradient(180deg, rgba(17,55,96,0.50), rgba(8,22,46,0.78))",
  padding: "20px",
  marginBottom: "18px",
};

const editInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid rgba(96, 165, 250, 0.24)",
  background: "rgba(15, 23, 42, 0.44)",
  color: "#e5f0ff",
  borderRadius: "18px",
  padding: "15px 16px",
  fontSize: "14px",
  fontWeight: 700,
  outline: "none",
};

const informeDataGroupTitleStyle = {
  gridColumn: "1 / -1",
  margin: "10px 0 2px",
  color: "#60a5fa",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const dataCardStyle = {
  borderRadius: "22px",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  background: "rgba(8, 22, 46, 0.78)",
  padding: "20px",
};

const sectionTitleStyle = {
  margin: "0 0 16px",
  fontSize: "20px",
  color: "#ffffff",
  fontWeight: 760,
};

const dataGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
};

const infoItemStyle = {
  borderRadius: "16px",
  border: "1px solid rgba(96,165,250,0.12)",
  background: "rgba(3,18,34,0.44)",
  padding: "14px",
};

const labelStyle = {
  color: "rgba(168,196,232,0.80)",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  marginBottom: "6px",
  whiteSpace: "nowrap",
};

const mainValueStyle = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 720,
  lineHeight: 1.15,
};

const valueStyle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 650,
  lineHeight: 1.35,
};

const notesCardStyle = {
  borderRadius: "22px",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  background: "rgba(8, 22, 46, 0.78)",
  padding: "20px",
  marginTop: "18px",
};

const notesHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const sectionTextStyle = {
  margin: "6px 0 0",
  color: "rgba(168,196,232,0.82)",
  fontSize: "14px",
  lineHeight: 1.45,
};

const notesListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  marginBottom: "18px",
};

const emptyNotesStyle = {
  color: "rgba(168,196,232,0.78)",
  fontSize: "14px",
  padding: "14px",
  borderRadius: "14px",
  background: "rgba(3,18,34,0.46)",
  border: "1px solid rgba(96,165,250,0.12)",
};

const noteMessageStyle = {
  maxWidth: "82%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(96,165,250,0.14)",
  background: "rgba(7,30,55,0.58)",
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
  whiteSpace: "pre-wrap",
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

const noteButtonStyle = {
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

const replyNoticeStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  borderRadius: "14px",
  border: "1px solid rgba(95,208,255,0.22)",
  background: "rgba(21,77,140,0.22)",
  color: "#dbeafe",
  padding: "10px 12px",
  fontSize: "13px",
  lineHeight: 1.4,
};

const replyCancelButtonStyle = {
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "999px",
  background: "rgba(30,64,108,0.46)",
  color: "#dbeafe",
  padding: "6px 10px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const anulacionCardStyle = {
  borderRadius: "18px",
  border: "1px solid rgba(248,113,113,0.22)",
  background: "rgba(127,29,29,0.16)",
  padding: "18px 20px",
  marginBottom: "18px",
};

const anulacionRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  flexWrap: "wrap",
};

const anulacionTitleStyle = {
  margin: 0,
  color: "#fecaca",
  fontSize: "16px",
  fontWeight: 760,
};

const anulacionTextStyle = {
  margin: "7px 0 0",
  color: "rgba(254,226,226,0.82)",
  fontSize: "13px",
  lineHeight: 1.45,
};

const anularButtonStyle = {
  border: "1px solid rgba(248,113,113,0.34)",
  borderRadius: "999px",
  background: "rgba(185,28,28,0.36)",
  color: "#fee2e2",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: 750,
  cursor: "pointer",
};

const anulacionTextareaStyle = {
  width: "100%",
  marginTop: "14px",
  resize: "vertical",
  minHeight: "82px",
  borderRadius: "14px",
  border: "1px solid rgba(248,113,113,0.24)",
  background: "rgba(3,18,34,0.72)",
  color: "#ffffff",
  padding: "13px 14px",
  fontSize: "14px",
  lineHeight: 1.45,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const anulacionActionsStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "12px",
};

const cancelAnulacionButtonStyle = {
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: "999px",
  background: "rgba(30,64,108,0.38)",
  color: "#dbeafe",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
};

const summaryItemStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  gap: "8px",
};

const adminActionCardStyle = {
  borderRadius: "18px",
  border: "1px solid rgba(96,165,250,0.18)",
  background: "rgba(30,64,108,0.18)",
  padding: "18px 20px",
  marginBottom: "18px",
};

const adminActionRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  flexWrap: "wrap",
};

const adminActionTitleStyle = {
  margin: 0,
  color: "#dbeafe",
  fontSize: "16px",
  fontWeight: 760,
};

const adminActionTextStyle = {
  margin: "7px 0 0",
  color: "rgba(219,234,254,0.78)",
  fontSize: "13px",
  lineHeight: 1.45,
};

const adminPrimaryButtonStyle = {
  border: "1px solid rgba(147,197,253,0.26)",
  borderRadius: "999px",
  background: "linear-gradient(180deg, rgba(47,109,246,0.92), rgba(29,78,216,0.82))",
  color: "#ffffff",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: 750,
  cursor: "pointer",
};
const entregaOptionsStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const entregaOptionStyle = {
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "999px",
  background: "rgba(30,64,108,0.38)",
  color: "#dbeafe",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
};

const entregaOptionActiveStyle = {
  border: "1px solid rgba(34,197,94,0.34)",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.18)",
  color: "#bbf7d0",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: 760,
  cursor: "pointer",
};

const filesCardStyle = {
  borderRadius: "22px",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  background: "rgba(8, 22, 46, 0.78)",
  padding: "20px",
  marginTop: "18px",
};

const fileActionsStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const fileButtonStyle = {
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "999px",
  background: "rgba(30,64,108,0.38)",
  color: "#dbeafe",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
};

const filePrimaryButtonStyle = {
  border: "1px solid rgba(147,197,253,0.26)",
  borderRadius: "999px",
  background: "linear-gradient(180deg, rgba(47,109,246,0.92), rgba(29,78,216,0.82))",
  color: "#ffffff",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: 750,
  cursor: "pointer",
};

const fileListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const fileItemStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto auto",
  alignItems: "center",
  gap: "10px",
  padding: "18px",
  borderRadius: "16px",
  border: "1px solid rgba(96, 165, 250, 0.12)",
  background: "rgba(3, 18, 34, 0.42)",
};

const fileNameStyle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 700,
};

const fileMetaStyle = {
  marginTop: "4px",
  color: "rgba(168,196,232,0.76)",
  fontSize: "12px",
};

const selectedFileNameStyle = {
  alignSelf: "center",
  color: "rgba(226,237,249,0.82)",
  fontSize: "12px",
  fontWeight: 600,
};

const selectedFileWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
};

const clearSelectedFileButtonStyle = {
  border: "1px solid rgba(248,113,113,0.26)",
  borderRadius: "999px",
  background: "rgba(127,29,29,0.18)",
  color: "#fecaca",
  padding: "7px 10px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
};

const deleteFileButtonStyle = {
  border: "1px solid rgba(248,113,113,0.26)",
  borderRadius: "999px",
  background: "rgba(127,29,29,0.18)",
  color: "#fecaca",
  padding: "8px 11px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const observacionCardStyle = {
  borderRadius: "18px",
  border: "1px solid rgba(251,191,36,0.28)",
  background: "rgba(217,119,6,0.12)",
  padding: "18px 20px",
  marginBottom: "18px",
};

const observacionTitleStyle = {
  margin: 0,
  color: "#fde68a",
  fontSize: "16px",
  fontWeight: 760,
};

const observacionTextStyle = {
  margin: "8px 0 0",
  color: "rgba(254,243,199,0.88)",
  fontSize: "14px",
  lineHeight: 1.45,
  whiteSpace: "pre-wrap",
};