import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useRef } from "react";
import { supabase } from "../../../../lib/supabaseClient";

import {
  ArrowLeft,
  Car,
  ClipboardList,
  FolderOpen,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const steps = [
  {
    key: "cliente",
    number: "01",
    label: "Cliente",
    title: "Cliente / asegurado",
    text: "Completá los datos del cliente o asegurado vinculado al trámite.",
    icon: UserRound,
    accent: "#38BDF8",
    gradient:
      "linear-gradient(135deg, rgba(14, 165, 233, 0.82), rgba(37, 99, 235, 0.50))",
  },
  {
    key: "unidad",
    number: "02",
    label: "Unidad",
    title: "Unidad / vehículo",
    text: "Datos de identificación registral de la unidad.",
    icon: Car,
    accent: "#22D3EE",
    gradient:
      "linear-gradient(135deg, rgba(8, 145, 178, 0.62), rgba(12, 74, 110, 0.56))",
  },
  {
    key: "tramite",
    number: "03",
    label: "Trámite",
    title: "Trámite registral",
    text: "Tipo de gestión solicitada y notas iniciales para SAKI.",
    icon: ClipboardList,
    accent: "#7DD3FC",
    gradient:
      "linear-gradient(135deg, rgba(14, 116, 144, 0.62), rgba(30, 64, 175, 0.50))",
  },
  {
    key: "seguro",
    number: "04",
    label: "Seguro",
    title: "Seguro / siniestro",
    text: "Información de compañía aseguradora, póliza y siniestro.",
    icon: ShieldCheck,
    accent: "#60A5FA",
    gradient:
      "linear-gradient(135deg, rgba(37, 99, 235, 0.66), rgba(30, 64, 175, 0.54))",
  },
  {
    key: "documentacion",
    number: "05",
    label: "Documentación",
    title: "Documentación inicial",
    text: "Carga preliminar de documentación vinculada al trámite.",
    icon: FolderOpen,
    accent: "#93C5FD",
    gradient:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.54), rgba(51, 65, 85, 0.58))",
  },
];

export default function NuevoTramiteProductores() {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [draftLegajoId, setDraftLegajoId] = useState(null);
  const [initialNoteId, setInitialNoteId] = useState(null);
const [selectedFileName, setSelectedFileName] = useState("Ningún archivo seleccionado");
const [selectedDocumentFiles, setSelectedDocumentFiles] = useState([]);
const [uploadedDocumentFiles, setUploadedDocumentFiles] = useState([]);
const documentFileInputRef = useRef(null);
const [tipoPersonaCliente, setTipoPersonaCliente] = useState("humana");
const [tipoDocumentoCliente, setTipoDocumentoCliente] = useState("DNI");
const [tipoPersonaTitular, setTipoPersonaTitular] = useState("humana");
const [tipoDocumentoTitular, setTipoDocumentoTitular] = useState("DNI");

const [savingDraft, setSavingDraft] = useState(false);

const [formData, setFormData] = useState({
  condicion_cliente: "",
  apellido: "",
  nombre: "",
  razon_social: "",
  numero_documento: "",
  domicilio: "",
  localidad: "",
  provincia: "",
  codigo_postal: "",
  email: "",
  telefono: "",
  observaciones_cliente: "",

  dominio: "",
tipo_unidad: "",
marca: "",
modelo: "",

titular_registral_coincide: true,
titular_registral_apellido: "",
titular_registral_nombre: "",
titular_registral_razon_social: "",
titular_registral_numero_documento: "",
titular_registral_telefono: "",
titular_registral_email: "",

tipo_pedido: "",
prioridad: "normal",
fecha_pedido: "",
detalle_pedido: "",

compania_aseguradora: "",
numero_poliza: "",
numero_siniestro: "",
fecha_siniestro: "",
tipo_siniestro: "",
lugar_hecho: "",

tipo_documentacion: "",
observaciones_documentacion: "",

});

  const currentStep = steps[activeStep];
  const CurrentIcon = currentStep.icon;

  function forceUppercase(event) {
    event.currentTarget.value = event.currentTarget.value.toLocaleUpperCase("es-AR");
  }

function handleFieldChange(event) {
  const { name, value, type, checked } = event.currentTarget;

  setFormData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
}

function handleUppercaseFieldChange(event) {
  const { name, value } = event.currentTarget;
  const upperValue = value.toLocaleUpperCase("es-AR");

  event.currentTarget.value = upperValue;

  setFormData((prev) => ({
    ...prev,
    [name]: upperValue,
  }));
}

  function formatDni(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
}

function formatCuitCuil(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

function formatDocumentoCliente(event) {
  const value = event.currentTarget.value;
  const formattedValue =
    tipoDocumentoCliente === "DNI" ? formatDni(value) : formatCuitCuil(value);

  event.currentTarget.value = formattedValue;

  setFormData((prev) => ({
    ...prev,
    numero_documento: formattedValue,
  }));
}

function formatCuitJuridica(event) {
  const formattedValue = formatCuitCuil(event.currentTarget.value);

  event.currentTarget.value = formattedValue;

  setFormData((prev) => ({
    ...prev,
    numero_documento: formattedValue,
  }));
}

function formatDocumentoTitular(event) {
  const value = event.currentTarget.value;
  const formattedValue =
    tipoDocumentoTitular === "DNI" ? formatDni(value) : formatCuitCuil(value);

  event.currentTarget.value = formattedValue;

  setFormData((prev) => ({
    ...prev,
    titular_registral_numero_documento: formattedValue,
  }));
}

function formatCuitTitularJuridica(event) {
  const formattedValue = formatCuitCuil(event.currentTarget.value);

  event.currentTarget.value = formattedValue;

  setFormData((prev) => ({
    ...prev,
    titular_registral_numero_documento: formattedValue,
  }));
}

function tieneDatosCargados() {
  const camposConDatos = [
    formData.condicion_cliente,
    formData.apellido,
    formData.nombre,
    formData.razon_social,
    formData.numero_documento,
    formData.domicilio,
    formData.localidad,
    formData.provincia,
    formData.codigo_postal,
    formData.email,
    formData.telefono,
    formData.observaciones_cliente,
    formData.dominio,
    formData.tipo_unidad,
    formData.marca,
    formData.modelo,
    formData.tipo_pedido,
    formData.fecha_pedido,
    formData.detalle_pedido,
    formData.compania_aseguradora,
    formData.numero_poliza,
    formData.numero_siniestro,
    formData.fecha_siniestro,
    formData.tipo_siniestro,
    formData.lugar_hecho,
    formData.tipo_documentacion,
    formData.observaciones_documentacion,
  ];

  return (
    camposConDatos.some((value) => String(value || "").trim()) ||
    selectedDocumentFiles.length > 0 ||
    uploadedDocumentFiles.length > 0 ||
    Boolean(draftLegajoId)
  );
}

async function handleSubmit(event) {
  event.preventDefault();
  await handleGuardarAvance({ finalizar: true });
}

async function handleGuardarAvance({ finalizar = false, mostrarAlerta = true } = {}) {
  if (savingDraft) return false;

  if (!finalizar && !tieneDatosCargados()) {
    return true;
  }

  try {
    setSavingDraft(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const payload = {
      estado: finalizar ? "Trámite solicitado" : "Borrador",
      estado_interno: "Pendiente de revisión SAKI",

      // Cliente / asegurado
      tipo_persona: tipoPersonaCliente,
      condicion_cliente: formData.condicion_cliente,

      apellido: tipoPersonaCliente === "humana" ? formData.apellido : null,
      nombre: tipoPersonaCliente === "humana" ? formData.nombre : null,
      razon_social: tipoPersonaCliente === "juridica" ? formData.razon_social : null,

      tipo_documento: tipoPersonaCliente === "humana" ? tipoDocumentoCliente : "CUIT",
      numero_documento: formData.numero_documento,

      domicilio: formData.domicilio,
      localidad: formData.localidad,
      provincia: formData.provincia,
      codigo_postal: formData.codigo_postal,

      email: formData.email,
      telefono: formData.telefono,
      observaciones_cliente: formData.observaciones_cliente,

      // Unidad / vehículo
      dominio: formData.dominio,
      tipo_unidad: formData.tipo_unidad,
      marca: formData.marca,
      modelo: formData.modelo,

      // Trámite / pedido
      tipo_pedido: formData.tipo_pedido,
      prioridad: formData.prioridad,
      fecha_pedido: formData.fecha_pedido || null,
      detalle_pedido: formData.detalle_pedido,

      // Seguro / siniestro
      compania_aseguradora: formData.compania_aseguradora,
      numero_poliza: formData.numero_poliza,
      numero_siniestro: formData.numero_siniestro,
      fecha_siniestro: formData.fecha_siniestro || null,
      tipo_siniestro: formData.tipo_siniestro,
      lugar_hecho: formData.lugar_hecho,

      updated_by: userId,
    };

    let legajoId = draftLegajoId;

    if (legajoId) {
      const { error: updateError } = await supabase
        .from("productores_legajos")
        .update(payload)
        .eq("id", legajoId);

      if (updateError) {
        console.error("Error al actualizar avance:", updateError);
        alert(`No se pudo guardar el avance: ${updateError.message}`);
        return false;
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("productores_legajos")
        .insert({
          ...payload,
          created_by: userId,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error al crear borrador:", insertError);
        alert(`No se pudo crear el trámite: ${insertError.message}`);
        return false;
      }

      legajoId = data.id;
      setDraftLegajoId(data.id);
    }

    if (selectedDocumentFiles.length > 0) {
      const uploadedFilesForPreview = [];

      for (const [index, file] of selectedDocumentFiles.entries()) {
        const safeFileName = file.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9._-]/g, "_");

        const filePath = `${legajoId}/${Date.now()}-${index}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("productores-archivos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || undefined,
          });

        if (uploadError) {
          console.error("Error al subir archivo:", uploadError);
          alert(`El avance se guardó, pero no se pudo subir el archivo: ${uploadError.message}`);
          return false;
        }

        const { error: archivoError } = await supabase
          .from("productores_archivos")
          .insert({
            legajo_id: legajoId,
            tipo_documentacion: formData.tipo_documentacion,
            nombre_archivo: file.name,
            nombre_original: file.name,
            storage_path: filePath,
            mime_type: file.type || null,
            size_bytes: file.size || null,
            observaciones: formData.observaciones_documentacion,
            created_by: userId,
            updated_by: userId,
          });

        if (archivoError) {
          console.error("Error al registrar archivo:", archivoError);
          alert(`El archivo se subió, pero no se pudo registrar: ${archivoError.message}`);
          return false;
        }

        uploadedFilesForPreview.push({
          nombre: file.name,
          tipo: formData.tipo_documentacion,
          observaciones: formData.observaciones_documentacion,
          path: filePath,
        });
      }

      setUploadedDocumentFiles((prev) => [...uploadedFilesForPreview, ...prev]);
      setSelectedDocumentFiles([]);
      setSelectedFileName("Ningún archivo seleccionado");

      if (documentFileInputRef.current) {
        documentFileInputRef.current.value = "";
      }
    }

const notasIniciales = [
  formData.observaciones_cliente?.trim()
    ? `CLIENTE / ASEGURADO:\n${formData.observaciones_cliente.trim()}`
    : "",
  formData.detalle_pedido?.trim()
    ? `TRÁMITE / PEDIDO:\n${formData.detalle_pedido.trim()}`
    : "",
  formData.observaciones_documentacion?.trim()
    ? `DOCUMENTACIÓN INICIAL:\n${formData.observaciones_documentacion.trim()}`
    : "",
]
  .filter(Boolean)
  .join("\n\n");

    if (notasIniciales) {
      const notaAuthorName =
        tipoPersonaCliente === "juridica"
          ? formData.razon_social || "Productor / Compañía"
          : `${formData.apellido || ""} ${formData.nombre || ""}`.trim() ||
            "Productor / Compañía";

      if (initialNoteId) {
        const { error: notaUpdateError } = await supabase
          .from("productores_notas")
          .update({
            author_name: notaAuthorName,
            author_email: formData.email || null,
            nota: notasIniciales,
            mensaje: notasIniciales,
            updated_by: userId,
          })
          .eq("id", initialNoteId)
          .eq("legajo_id", legajoId);

        if (notaUpdateError) {
          console.error("Error al actualizar notas iniciales:", notaUpdateError);
          alert(`El avance se guardó, pero no se pudieron actualizar las notas iniciales: ${notaUpdateError.message}`);
          return false;
        }
      } else {
        const { data: notaGuardada, error: notaError } = await supabase
          .from("productores_notas")
          .insert({
            legajo_id: legajoId,
            parent_id: null,
            author_name: notaAuthorName,
            author_email: formData.email || null,
            author_role: "productor",
            nota: notasIniciales,
            mensaje: notasIniciales,
            created_by: userId,
            updated_by: userId,
          })
          .select("id")
          .single();

        if (notaError) {
          console.error("Error al guardar notas iniciales:", notaError);
          alert(`El avance se guardó, pero no se pudieron guardar las notas iniciales: ${notaError.message}`);
          return false;
        }

        setInitialNoteId(notaGuardada?.id || null);
      }
    }

    if (finalizar) {
      alert("Trámite guardado correctamente.");
      router.push("/empresas/productores");
      return true;
    }

    if (mostrarAlerta) {
      alert("Avance guardado correctamente.");
    }

    return true;
  } catch (err) {
    console.error("Error inesperado al guardar avance:", err);
    alert("Ocurrió un error inesperado al guardar el avance.");
    return false;
  } finally {
    setSavingDraft(false);
  }
}

  async function cambiarFicha(index) {
  if (index === activeStep || savingDraft) return;

  const guardado = await handleGuardarAvance({
    finalizar: false,
    mostrarAlerta: false,
  });

  if (guardado) {
    setActiveStep(index);
  }
}

async function goPrev() {
  if (activeStep > 0) {
    await cambiarFicha(activeStep - 1);
  }
}

async function goNext() {
  if (activeStep < steps.length - 1) {
    await cambiarFicha(activeStep + 1);
  }
}

  return (
    <main className="page">
      <section className="shell">
        <header className="topbar">
          <div>
            <div className="brand">SAKI</div>
            <div className="brandSub">Portal Empresas</div>
          </div>

          <Link href="/empresas/productores" className="backLink">
            <ArrowLeft size={16} />
            Volver al listado
          </Link>
        </header>

        <section className="hero">
          <div className="eyebrow">MANAGEMENT &amp; TRACKING</div>

          <h1 className="moduleTitle">
            Nuevo trámite
            <span className="moduleDivider">|</span>
            <span className="moduleSuffix">Productores</span>
          </h1>

          <p>
            Carga inicial de gestión registral para clientes, unidades aseguradas,
            pólizas, siniestros y documentación vinculada.
          </p>
        </section>

        <section className="stepper" aria-label="Pasos del trámite">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isDone = index < activeStep;

            return (
              <button
                key={step.key}
                type="button"
                className={`stepCard ${index === 0 ? "first" : ""} ${
                  index === steps.length - 1 ? "last" : ""
                } ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                style={{
                  "--accent": step.accent,
                  "--card-bg": step.gradient,
                }}
                onClick={() => cambiarFicha(index)}
              >
                <div className="stepIcon">
                  <Icon size={18} />
                </div>

                <div className="stepInfo">
                  <div className="stepNumber">{step.number}</div>
                  <div className="stepLabel">{step.label}</div>
                </div>
              </button>
            );
          })}
        </section>

        <form className="formPanel" onSubmit={handleSubmit}>
          <div key={currentStep.key} className="panelSlide">
            <div className="formHeader">
              <div
                className="formIcon"
                style={{
                  color: currentStep.accent,
                  borderColor: `${currentStep.accent}66`,
                  background: `${currentStep.accent}22`,
                }}
              >
                <CurrentIcon size={25} />
              </div>

              <div>
                <h2>{currentStep.title}</h2>
                <p>{currentStep.text}</p>
              </div>
            </div>

            <div className="divider" />

{currentStep.key === "cliente" && (
  <div className="clienteGrid">
    <Field label="Tipo de persona" className="span2">
      <select
        value={tipoPersonaCliente}
        onChange={(e) => setTipoPersonaCliente(e.target.value)}
      >
        <option value="humana">Persona humana</option>
        <option value="juridica">Persona jurídica</option>
      </select>
    </Field>

    <Field label="Condición" className="span2">
      <select
  name="condicion_cliente"
  value={formData.condicion_cliente}
  onChange={handleFieldChange}
>
  <option value="" disabled>
    Seleccionar condición
  </option>
  <option value="Asegurado">Asegurado</option>
  <option value="Titular registral">Titular registral</option>
  <option value="Tercero">Tercero</option>
  <option value="Autorizado">Autorizado</option>
</select>
    </Field>

    {tipoPersonaCliente === "humana" && (
      <>
        <Field label="Apellido">
          <input
  name="apellido"
  value={formData.apellido}
  onChange={handleUppercaseFieldChange}
  placeholder="Apellido"
/>
        </Field>

        <Field label="Nombre">
          <input
  name="nombre"
  value={formData.nombre}
  onChange={handleUppercaseFieldChange}
  placeholder="Nombre"
/>
        </Field>

        <Field label="Tipo de documento">
          <select
            value={tipoDocumentoCliente}
            onChange={(e) => setTipoDocumentoCliente(e.target.value)}
          >
            <option value="DNI">DNI</option>
            <option value="CUIL">CUIL</option>
            <option value="CUIT">CUIT</option>
          </select>
        </Field>

        <Field label="N° de documento">
          <input
  inputMode="numeric"
  name="numero_documento"
  value={formData.numero_documento}
  onChange={formatDocumentoCliente}
  placeholder={tipoDocumentoCliente === "DNI" ? "12.345.678" : "20-12345678-4"}
/>
        </Field>
      </>
    )}

    {tipoPersonaCliente === "juridica" && (
      <>
        <Field label="Razón social" className="span3">
          <input
  name="razon_social"
  value={formData.razon_social}
  onChange={handleUppercaseFieldChange}
  placeholder="Razón social"
/>
        </Field>

        <Field label="CUIT">
          <input
  inputMode="numeric"
  name="numero_documento"
  value={formData.numero_documento}
  onChange={formatCuitJuridica}
  placeholder="30-12345678-9"
/>
        </Field>
      </>
    )}

    <Field label="Domicilio" className="span2">
      <input
  name="domicilio"
  value={formData.domicilio}
  onChange={handleUppercaseFieldChange}
  placeholder="Calle, número, piso, depto."
/>
    </Field>

    <Field label="Localidad">
      <input
  name="localidad"
  value={formData.localidad}
  onChange={handleUppercaseFieldChange}
  placeholder="Localidad"
/>
    </Field>

    <Field label="Provincia">
      <input
  name="provincia"
  value={formData.provincia}
  onChange={handleUppercaseFieldChange}
  placeholder="Provincia"
/>
    </Field>

    <Field label="Código postal">
      <input
  name="codigo_postal"
  value={formData.codigo_postal}
  onChange={handleUppercaseFieldChange}
  placeholder="CP"
/>
    </Field>

    <Field label="Email" className="span2">
      <input
  type="email"
  name="email"
  value={formData.email}
  onChange={handleFieldChange}
  placeholder="Ej.: nombre@empresa.com"
/>
    </Field>

    <Field label="Teléfono" className="span2">
      <input
  name="telefono"
  value={formData.telefono}
  onChange={handleFieldChange}
  placeholder="Ej.: 11 1234 5678"
/>
    </Field>

<Field label="Notas iniciales" full className="observacionesCliente">
  <textarea
    name="observaciones_cliente"
    value={formData.observaciones_cliente}
    onChange={handleUppercaseFieldChange}
    placeholder="Agregá datos adicionales del cliente o asegurado que SAKI deba tener en cuenta."
  />
</Field>
  </div>
)}

            {currentStep.key === "unidad" && (
  <div className="unidadContent">
    <section className="innerSection">
      <div className="innerSectionHeader">
        <div>
          <h3>Datos de la unidad</h3>
          <p>Información de carga para inicio del legajo.</p>
        </div>
      </div>

      <div className="unidadGrid">
        <Field label="Dominio">
          <input
  name="dominio"
  value={formData.dominio}
  onChange={handleUppercaseFieldChange}
  placeholder="AB123CD"
/>
        </Field>

        <Field label="Tipo de unidad">
          <select
  name="tipo_unidad"
  value={formData.tipo_unidad}
  onChange={handleFieldChange}
>
  <option value="" disabled>
    Seleccionar tipo
  </option>
  <option value="Automotor">Automotor</option>
  <option value="Motovehículo">Motovehículo</option>
  <option value="Maquinaria">Maquinaria</option>
  <option value="No aplica">No aplica</option>
</select>
        </Field>

        <Field label="Marca">
          <input
  name="marca"
  value={formData.marca}
  onChange={handleUppercaseFieldChange}
  placeholder="TOYOTA"
/>
        </Field>

        <Field label="Modelo">
          <input
  name="modelo"
  value={formData.modelo}
  onChange={handleUppercaseFieldChange}
  placeholder="COROLLA"
/>
        </Field>
      </div>
    </section>

    <section className="innerSection">
  <div className="innerSectionHeader">
    <div>
      <h3>Titular registral</h3>
      <p>
        Indicá si el titular registral coincide con el cliente / asegurado o cargá sus datos.
      </p>
    </div>
  </div>

  <div className="adminCheckRow">
    <label className="checkLine">
      <input
        type="checkbox"
        name="titular_registral_coincide"
        checked={formData.titular_registral_coincide}
        onChange={handleFieldChange}
      />
      <span>El titular registral coincide con el cliente / asegurado</span>
    </label>
  </div>

  {formData.titular_registral_coincide ? (
    <div className="clienteGrid">
      <Field label="Tipo de persona" className="span2">
        <input
          readOnly
          value={tipoPersonaCliente === "juridica" ? "Persona jurídica" : "Persona humana"}
        />
      </Field>

      {tipoPersonaCliente === "humana" && (
        <>
          <Field label="Apellido">
            <input readOnly value={formData.apellido} placeholder="Apellido" />
          </Field>

          <Field label="Nombre">
            <input readOnly value={formData.nombre} placeholder="Nombre" />
          </Field>

          <Field label="Tipo de documento">
            <input readOnly value={tipoDocumentoCliente} />
          </Field>

          <Field label="N° de documento">
            <input readOnly value={formData.numero_documento} />
          </Field>
        </>
      )}

      {tipoPersonaCliente === "juridica" && (
        <>
          <Field label="Razón social" className="span3">
            <input readOnly value={formData.razon_social} placeholder="Razón social" />
          </Field>

          <Field label="CUIT">
            <input readOnly value={formData.numero_documento} />
          </Field>
        </>
      )}

      <Field label="Email" className="span2">
        <input readOnly value={formData.email} placeholder="Email" />
      </Field>

      <Field label="Teléfono" className="span2">
        <input readOnly value={formData.telefono} placeholder="Teléfono" />
      </Field>
    </div>
  ) : (
    <div className="clienteGrid">
      <Field label="Tipo de persona" className="span2">
        <select
          value={tipoPersonaTitular}
          onChange={(e) => {
            setTipoPersonaTitular(e.target.value);
                      }}
        >
          <option value="humana">Persona humana</option>
          <option value="juridica">Persona jurídica</option>
        </select>
      </Field>

      {tipoPersonaTitular === "humana" && (
        <>
          <Field label="Apellido">
            <input
              name="titular_registral_apellido"
              value={formData.titular_registral_apellido}
              onChange={handleUppercaseFieldChange}
              placeholder="Apellido"
            />
          </Field>

          <Field label="Nombre">
            <input
              name="titular_registral_nombre"
              value={formData.titular_registral_nombre}
              onChange={handleUppercaseFieldChange}
              placeholder="Nombre"
            />
          </Field>

          <Field label="Tipo de documento">
            <select
              value={tipoDocumentoTitular}
              onChange={(e) => {
                setTipoDocumentoTitular(e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  titular_registral_numero_documento: "",
                }));
              }}
            >
              <option value="DNI">DNI</option>
              <option value="CUIL">CUIL</option>
              <option value="CUIT">CUIT</option>
            </select>
          </Field>

          <Field label="N° de documento">
            <input
              inputMode="numeric"
              name="titular_registral_numero_documento"
              value={formData.titular_registral_numero_documento}
              onChange={formatDocumentoTitular}
              placeholder={tipoDocumentoTitular === "DNI" ? "12.345.678" : "20-12345678-4"}
            />
          </Field>
        </>
      )}

      {tipoPersonaTitular === "juridica" && (
        <>
          <Field label="Razón social" className="span3">
            <input
              name="titular_registral_razon_social"
              value={formData.titular_registral_razon_social}
              onChange={handleUppercaseFieldChange}
              placeholder="Razón social"
            />
          </Field>

          <Field label="CUIT">
            <input
              inputMode="numeric"
              name="titular_registral_numero_documento"
              value={formData.titular_registral_numero_documento}
              onChange={formatCuitTitularJuridica}
              placeholder="30-12345678-9"
            />
          </Field>
        </>
      )}

      <Field label="Email" className="span2">
        <input
          type="email"
          name="titular_registral_email"
          value={formData.titular_registral_email}
          onChange={handleFieldChange}
          placeholder="Ej.: nombre@empresa.com"
        />
      </Field>

      <Field label="Teléfono" className="span2">
        <input
          name="titular_registral_telefono"
          value={formData.titular_registral_telefono}
          onChange={handleFieldChange}
          placeholder="Ej.: 11 1234 5678"
        />
      </Field>
    </div>
  )}
</section>
  </div>
)}

            {currentStep.key === "seguro" && (
  <div className="fieldsGrid">
    <Field label="Compañía aseguradora">
      <input
        name="compania_aseguradora"
        value={formData.compania_aseguradora}
        onChange={handleUppercaseFieldChange}
        placeholder="SANCOR SEGUROS"
      />
    </Field>

    <Field label="N° de póliza">
      <input
        name="numero_poliza"
        value={formData.numero_poliza}
        onChange={handleUppercaseFieldChange}
        placeholder="POL-000000"
      />
    </Field>

    <Field label="N° de siniestro">
      <input
        name="numero_siniestro"
        value={formData.numero_siniestro}
        onChange={handleUppercaseFieldChange}
        placeholder="SIN-000000"
      />
    </Field>

    <Field label="Fecha del siniestro">
      <input
        type="date"
        name="fecha_siniestro"
        value={formData.fecha_siniestro}
        onChange={handleFieldChange}
      />
    </Field>

    <Field label="Tipo de siniestro">
      <select
        name="tipo_siniestro"
        value={formData.tipo_siniestro}
        onChange={handleFieldChange}
      >
        <option value="" disabled>
          Seleccionar tipo
        </option>
        <option value="Robo / hurto">Robo / hurto</option>
        <option value="Destrucción total">Destrucción total</option>
        <option value="Recupero">Recupero</option>
        <option value="Otro">Otro</option>
      </select>
    </Field>

    <Field label="Lugar del hecho">
      <input
        name="lugar_hecho"
        value={formData.lugar_hecho}
        onChange={handleUppercaseFieldChange}
        placeholder="Localidad / provincia"
      />
    </Field>
  </div>
)}

            {currentStep.key === "tramite" && (
  <div className="tramiteContent">
    <section className="innerSection">
      <div className="innerSectionHeader">
        <div>
          <h3>Pedido solicitado</h3>
          <p>
            Información que carga el productor o la compañía según la gestión que necesita iniciar.
          </p>
        </div>
      </div>

      <div className="tramiteGrid">
<Field label="Tipo de pedido" className="span2">
  <select
    name="tipo_pedido"
    value={formData.tipo_pedido}
    onChange={handleFieldChange}
  >
    <option value="" disabled>
      Seleccionar pedido
    </option>
    <option>Denuncia de robo / hurto</option>
    <option>Baja por destrucción total</option>
    <option>Baja por destrucción total con recupero de piezas</option>
    <option>Transferencia</option>
    <option>Informe de dominio</option>
    <option>Certificado de dominio</option>
    <option>Cancelación de prenda</option>
    <option>Levantamiento de medidas cautelares</option>
    <option>Asesoramiento registral</option>
    <option>Otro pedido registral</option>
  </select>
</Field>

        <Field label="Prioridad">
  <select
    name="prioridad"
    value={formData.prioridad}
    onChange={handleFieldChange}
  >
    <option value="normal">Normal</option>
    <option value="alta">Alta</option>
    <option value="urgente">Urgente</option>
  </select>
</Field>

        <Field label="Fecha del pedido">
          <input
  type="date"
  name="fecha_pedido"
  value={formData.fecha_pedido}
  onChange={handleFieldChange}
/>
        </Field>

<Field label="Notas iniciales" full>
  <textarea
    name="detalle_pedido"
    value={formData.detalle_pedido}
    onChange={handleUppercaseFieldChange}
    placeholder="Agregá aclaraciones del pedido o información operativa que SAKI deba tener en cuenta. Ej.: caso urgente, baja municipal, presupuesto previo, documentación pendiente, etc."
  />
</Field>
        
      </div>
    </section>
 
  </div>
)}

            {currentStep.key === "documentacion" && (
  <div className="fieldsGrid">
    <Field label="Tipo de documentación">
      <select
        name="tipo_documentacion"
        value={formData.tipo_documentacion}
        onChange={handleFieldChange}
      >
        <option value="" disabled>
          Seleccionar tipo
        </option>
        <option value="Denuncia policial">Denuncia policial</option>
        <option value="Póliza">Póliza</option>
        <option value="Constancia de siniestro">Constancia de siniestro</option>
        <option value="Documentación del titular">Documentación del titular</option>
        <option value="Documentación del vehículo">Documentación del vehículo</option>
        <option value="Otro">Otro</option>
      </select>
    </Field>

    <Field label="Archivo">
      <div className="fileUploadBox">
        <label className="fileUploadTrigger">
          <input
  ref={documentFileInputRef}
  type="file"
  multiple
  className="fileUploadInput"
  onChange={(e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      setSelectedFileName("Ningún archivo seleccionado");
      return;
    }

    setSelectedDocumentFiles((prev) => [...prev, ...files]);
    setSelectedFileName(
      files.length === 1
        ? files[0].name
        : `${files.length} archivos seleccionados`
    );

    if (documentFileInputRef.current) {
      documentFileInputRef.current.value = "";
    }
  }}
/>
          <span className="fileUploadButton">Seleccionar archivo</span>
        </label>

        <span className="fileUploadName">{selectedFileName}</span>
      </div>
    </Field>

<Field label="Notas iniciales" full className="notasInicialesField">
  <textarea
    name="observaciones_documentacion"
    value={formData.observaciones_documentacion}
    onChange={handleUppercaseFieldChange}
    placeholder="Agregá aclaraciones sobre la documentación inicial que SAKI deba tener en cuenta. Ej.: falta documentación, se adjunta denuncia, archivo pendiente, documentación a completar, etc."
  />
</Field>

    {selectedDocumentFiles.length > 0 && (
  <div className="uploadedFilesPreview">
    <div className="uploadedFilesHeader">
      <div>
        <span>Archivos seleccionados</span>
        <strong>{selectedDocumentFiles.length} archivo/s listo/s para subir</strong>
      </div>

      <button
        type="button"
        className="removeFileButton"
        onClick={() => {
          setSelectedDocumentFiles([]);
          setSelectedFileName("Ningún archivo seleccionado");

          if (documentFileInputRef.current) {
            documentFileInputRef.current.value = "";
          }
        }}
      >
        Quitar todos
      </button>
    </div>

    <div className="uploadedFilesList">
      {selectedDocumentFiles.map((file, index) => (
        <div className="uploadedFileItem" key={`${file.name}-${file.lastModified}-${index}`}>
          <div>
            <strong>{file.name}</strong>
            <small>
              {formData.tipo_documentacion || "Tipo de documentación pendiente"}
            </small>
          </div>

          <button
            type="button"
            className="removeFileButton"
            onClick={() => {
              setSelectedDocumentFiles((prev) => {
                const next = prev.filter((_, fileIndex) => fileIndex !== index);

                setSelectedFileName(
                  next.length === 0
                    ? "Ningún archivo seleccionado"
                    : `${next.length} archivo/s seleccionado/s`
                );

                return next;
              });
            }}
          >
            Quitar
          </button>
        </div>
      ))}
    </div>
  </div>
)}

{uploadedDocumentFiles.length > 0 && (
  <div className="uploadedFilesPreview uploadedFilesSaved">
    <div className="uploadedFilesHeader">
      <div>
        <span>Archivos subidos</span>
        <strong>{uploadedDocumentFiles.length} archivo/s guardado/s en el legajo</strong>
      </div>
    </div>

    <div className="uploadedFilesList">
      {uploadedDocumentFiles.map((file, index) => (
        <div className="uploadedFileItem" key={`${file.path}-${index}`}>
          <div>
            <strong>{file.nombre}</strong>
            <small>{file.tipo || "Sin tipo de documentación"}</small>

            {file.observaciones && (
              <small>{file.observaciones}</small>
            )}
          </div>

          <span className="uploadedSavedBadge">Subido</span>
        </div>
      ))}
    </div>
  </div>
)}
  </div>
)}
            
            <div className="actions">
              <button
                type="button"
                className="textButton"
                onClick={goPrev}
                disabled={activeStep === 0}
              >
                ← Anterior
              </button>

              <div className="rightActions">
                <button
  type="button"
  className="secondaryButton"
  onClick={() => handleGuardarAvance({ finalizar: false, mostrarAlerta: true })}
  disabled={savingDraft}
>
  {savingDraft ? "Guardando..." : "Guardar avance"}
</button>

{activeStep < steps.length - 1 ? (
  <button
    type="button"
    className="primaryButton"
    onClick={goNext}
    disabled={savingDraft}
  >
    {savingDraft ? "Guardando..." : "Siguiente →"}
  </button>
) : (
  <button
    type="submit"
    className="primaryButton"
    disabled={savingDraft}
  >
    {savingDraft ? "Guardando..." : "Guardar trámite"}
  </button>
)}
              </div>
            </div>
          </div>
        </form>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(26, 78, 154, 0.20), transparent 28%),
            linear-gradient(180deg, #03122c 0%, #05152f 45%, #071327 100%);
          color: #e5eefc;
          font-family: Aptos, "Segoe UI", Roboto, Arial, sans-serif;
          padding: 24px 20px 40px;
          box-sizing: border-box;
        }

        .shell {
          max-width: 1120px;
          width: 100%;
          margin: 0 auto;
        }

        .topbar {
          min-height: 58px;
          border-radius: 22px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          background: rgba(3, 18, 34, 0.46);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 14px 20px;
          box-shadow: 0 14px 42px rgba(0, 0, 0, 0.20);
        }

        .brand {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.16em;
          line-height: 1;
        }

        .brandSub {
          margin-top: 7px;
          color: rgba(191, 219, 254, 0.58);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .backLink {
          height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(96, 165, 250, 0.18);
          background: rgba(30, 64, 108, 0.74);
          color: #dbeafe;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 14px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .hero {
          padding: 26px 0 18px;
        }

        .eyebrow {
          color: #5fd0ff;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .moduleTitle {
          margin: 0;
          color: #ffffff;
          font-size: 32px;
          font-weight: 650;
          letter-spacing: -0.025em;
          line-height: 1.08;
        }

        .moduleDivider {
          color: #8fb9e8;
          font-weight: 400;
          margin: 0 8px;
        }

        .moduleSuffix {
          color: #e6f0ff;
          font-weight: 650;
        }

        .hero p {
          margin: 10px 0 0;
          max-width: 760px;
          color: rgba(226, 237, 249, 0.78);
          font-size: 15px;
          line-height: 1.45;
        }

.stepper {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0;
  margin: 28px 0 18px;
  filter: drop-shadow(0 16px 28px rgba(0, 0, 0, 0.20));
}

        .stepCard {
          position: relative;
          min-height: 62px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: var(--card-bg);
          color: rgba(226, 232, 240, 0.88);
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px 8px 24px;
          cursor: pointer;
          text-align: left;
          margin-left: -13px;
          clip-path: polygon(
            0 0,
            calc(100% - 20px) 0,
            100% 50%,
            calc(100% - 20px) 100%,
            0 100%,
            20px 50%
          );
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.025),
            inset 0 -14px 22px rgba(0, 0, 0, 0.12);
          transition:
            transform 0.16s ease,
            filter 0.16s ease,
            box-shadow 0.16s ease;
        }

        .stepCard.first {
          margin-left: 0;
          border-top-left-radius: 14px;
          border-bottom-left-radius: 14px;
          clip-path: polygon(
            0 0,
            calc(100% - 20px) 0,
            100% 50%,
            calc(100% - 20px) 100%,
            0 100%
          );
        }

        .stepCard.last {
          border-top-right-radius: 14px;
          border-bottom-right-radius: 14px;
          clip-path: polygon(
            0 0,
            100% 0,
            100% 100%,
            0 100%,
            20px 50%
          );
        }

        .stepCard:hover {
          z-index: 4;
          filter: brightness(1.12);
          transform: translateY(-1px);
        }

        .stepCard.active {
          z-index: 6;
          color: #ffffff;
          filter: brightness(1.16);
          border-color: var(--accent);
          box-shadow:
            0 0 0 1px var(--accent),
            0 0 24px rgba(14, 165, 233, 0.24),
            inset 0 0 0 1px rgba(255,255,255,0.08),
            inset 0 -18px 28px rgba(0, 0, 0, 0.10);
        }

        .stepCard.active::after {
          content: "";
          position: absolute;
          left: 28px;
          right: 34px;
          bottom: 0;
          height: 3px;
          border-radius: 999px 999px 0 0;
          background: #ffffff;
          opacity: 0.72;
        }

        .stepIcon {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(3, 18, 34, 0.32);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stepInfo {
          min-width: 0;
        }

        .stepNumber {
          font-size: 16px;
          font-weight: 750;
          line-height: 1;
          color: #ffffff;
        }

.stepLabel {
  margin-top: 4px;
  font-size: 11.5px;
  color: rgba(226, 232, 240, 0.88);
  white-space: nowrap;
  letter-spacing: -0.015em;
  line-height: 1.05;
}

        .formPanel {
          min-height: 500px;
          border-radius: 25px;
          border: 1px solid rgba(148, 163, 184, 0.13);
          background: linear-gradient(180deg, rgba(8, 22, 46, 0.76), rgba(3, 18, 34, 0.58));
          padding: 28px;
          box-shadow: 0 20px 56px rgba(0, 0, 0, 0.18);
        }

        .panelSlide {
          animation: panelSlideIn 0.26s ease;
        }

        @keyframes panelSlideIn {
          from {
            opacity: 0;
            transform: translateX(14px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .formHeader {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .formIcon {
          width: 50px;
          height: 50px;
          border-radius: 17px;
          border: 1px solid rgba(96, 165, 250, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .formHeader h2 {
          margin: 0;
          color: #ffffff;
          font-size: 22px;
          font-weight: 650;
          letter-spacing: -0.01em;
        }

        .formHeader p {
          margin: 5px 0 0;
          color: rgba(168, 196, 232, 0.76);
          font-size: 13px;
          line-height: 1.4;
        }

        .divider {
          height: 1px;
          background: rgba(148, 163, 184, 0.14);
          margin: 18px 0;
        }

        .fieldsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .clienteGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.span2 {
  grid-column: span 2;
}

.span3 {
  grid-column: span 3;
}

.unidadContent {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.innerSection {
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.11);
  background: rgba(2, 8, 18, 0.18);
  padding: 18px;
}

.innerSectionHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.innerSectionHeader h3 {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.innerSectionHeader p {
  margin: 5px 0 0;
  color: rgba(168, 196, 232, 0.68);
  font-size: 12px;
  line-height: 1.35;
}

.innerSectionHeader.withBadge {
  align-items: center;
}

.adminOnlyBlock {
  border-color: rgba(148, 163, 184, 0.12);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(2, 8, 18, 0.32));
}

.readOnlyBlock {
  opacity: 0.78;
}

.adminBadge {
  height: 26px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(15, 23, 42, 0.72);
  color: rgba(203, 213, 225, 0.82);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.unidadGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.tramiteContent {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.tramiteGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.costosContent {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.costosTableWrap {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.32);
}

.costosTable {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.costosTable th {
  color: rgba(203, 213, 225, 0.70);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-align: left;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.costosTable td {
  color: rgba(226, 232, 240, 0.72);
  font-size: 12.5px;
  padding: 13px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.costosTable tbody tr:last-child td {
  border-bottom: none;
}

.costosNote {
  margin: 12px 0 0;
  color: rgba(168, 196, 232, 0.62);
  font-size: 12px;
  line-height: 1.4;
}

.costosSummaryGrid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.costSummaryCard {
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.30);
  padding: 14px;
}

.costSummaryCard span {
  display: block;
  color: rgba(203, 213, 225, 0.64);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.costSummaryCard strong {
  display: block;
  margin-top: 8px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

.costSummaryCard.total {
  border-color: rgba(96, 165, 250, 0.28);
  background: linear-gradient(180deg, rgba(30, 64, 108, 0.44), rgba(15, 23, 42, 0.52));
}

.costosEstadoGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.notasContent {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.notasGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.notasGrid textarea {
  min-height: 110px;
}

.notasActions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.notesThread {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.noteBubble {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  padding: 14px 16px;
  background: rgba(2, 8, 18, 0.30);
}

.noteBubble.producer {
  border-color: rgba(96, 165, 250, 0.16);
  background: linear-gradient(180deg, rgba(30, 64, 108, 0.30), rgba(2, 8, 18, 0.30));
}

.noteBubble.saki {
  border-color: rgba(45, 212, 191, 0.28);
  background:
    linear-gradient(180deg, rgba(13, 148, 136, 0.22), rgba(2, 8, 18, 0.34));
  box-shadow: inset 3px 0 0 rgba(45, 212, 191, 0.55);
}

.noteBubble.saki .noteMeta span {
  color: #99f6e4;
}

.readOnlyNote {
  opacity: 0.72;
}

.noteMeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.noteMeta span {
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 650;
}

.noteMeta small {
  color: rgba(168, 196, 232, 0.62);
  font-size: 11px;
}

.noteBubble p {
  margin: 0;
  color: rgba(226, 232, 240, 0.72);
  font-size: 12.5px;
  line-height: 1.45;
}

.adminCheckRow {
  margin: -4px 0 16px;
}

.checkLine {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: rgba(203, 213, 225, 0.72);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  cursor: default;
}

.checkLine input {
  width: 15px;
  height: 15px;
  accent-color: #38bdf8;
}

.readOnlyBlock input,
.readOnlyBlock select,
.readOnlyBlock textarea {
  background: rgba(15, 23, 42, 0.52) !important;
  border-color: rgba(148, 163, 184, 0.10) !important;
  color: rgba(148, 163, 184, 0.68) !important;
  cursor: not-allowed;
}

.readOnlyBlock input::placeholder,
.readOnlyBlock textarea::placeholder {
  color: rgba(148, 163, 184, 0.42) !important;
}

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field.full {
  grid-column: 1 / -1;
}

.clienteGrid .field.full {
  grid-column: 1 / -1;
}

label {
  color: rgba(203, 213, 225, 0.72);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  line-height: 1.15;
}

        input,
select,
textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(2, 8, 18, 0.72);
  color: rgba(226, 232, 240, 0.90);
  padding: 0 12px;
  outline: none;
  font-family: inherit;
  font-size: 12.5px;
  box-sizing: border-box;
  color-scheme: dark;
}

        input,
select {
  height: 40px;
}

textarea {
  min-height: 90px;
  padding-top: 11px;
  resize: vertical;
}

.clienteGrid textarea {
  min-height: 104px;
}

        input:focus,
        select:focus,
        textarea:focus {
          border-color: rgba(96, 165, 250, 0.48);
          box-shadow:
            0 0 0 1px rgba(96, 165, 250, 0.18),
            0 0 22px rgba(37, 99, 235, 0.16);
        }

input::placeholder,
textarea::placeholder {
  color: rgba(148, 163, 184, 0.56);
  font-size: 12px;
}

        select option {
          background: #071326;
          color: #e5eefc;
        }

.fileUploadBox {
  height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(2, 8, 18, 0.72);
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 9px;
  box-sizing: border-box;
  overflow: hidden;
}

.fileUploadBox:focus-within {
  border-color: rgba(96, 165, 250, 0.48);
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.18),
    0 0 22px rgba(37, 99, 235, 0.16);
}

.fileUploadTrigger {
  position: relative;
  margin: 0;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
}

.fileUploadInput {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.fileUploadButton {
  height: 26px;
  border-radius: 9px;
  border: 1px solid rgba(96, 165, 250, 0.22);
  background: rgba(30, 64, 108, 0.48);
  color: #dbeafe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-transform: uppercase;
}

.fileUploadName {
  min-width: 0;
  color: rgba(226, 232, 240, 0.68);
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.uploadedFilesPreview {
  grid-column: 1 / -1;
  border-radius: 16px;
  border: 1px solid rgba(96, 165, 250, 0.18);
  background: rgba(30, 64, 108, 0.24);
  padding: 13px 14px;
}

.uploadedFilesHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.uploadedFilesHeader span {
  display: block;
  color: rgba(203, 213, 225, 0.62);
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.uploadedFilesHeader strong {
  display: block;
  color: #ffffff;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.25;
}

.uploadedFilesList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploadedFileItem {
  border-radius: 13px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.30);
  padding: 10px 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.uploadedFileItem strong {
  display: block;
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 650;
  line-height: 1.25;
  word-break: break-word;
}

.uploadedFileItem small {
  display: block;
  margin-top: 4px;
  color: rgba(168, 196, 232, 0.68);
  font-size: 11px;
}

.removeFileButton {
  height: 30px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.20);
  background: rgba(15, 23, 42, 0.54);
  color: rgba(226, 232, 240, 0.78);
  padding: 0 12px;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
}

.uploadedFilesSaved {
  border-color: rgba(45, 212, 191, 0.22);
  background: rgba(13, 148, 136, 0.12);
}

.uploadedSavedBadge {
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(45, 212, 191, 0.26);
  background: rgba(13, 148, 136, 0.18);
  color: #99f6e4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 11px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
}

        .actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid rgba(148, 163, 184, 0.12);
          margin-top: 22px;
          padding-top: 18px;
        }

        .rightActions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .textButton,
        .secondaryButton,
        .primaryButton {
          height: 42px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 18px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          font-family: inherit;
        }

        .textButton {
          border: none;
          background: transparent;
          color: #60a5fa;
        }

        .textButton:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .secondaryButton {
          border: 1px solid rgba(96, 165, 250, 0.22);
          background: rgba(30, 64, 108, 0.34);
          color: #bfdbfe;
        }

        .primaryButton {
          border: 1px solid rgba(147, 197, 253, 0.22);
          background: linear-gradient(180deg, rgba(47, 109, 246, 0.96), rgba(29, 78, 216, 0.86));
          color: #ffffff;
          box-shadow: 0 16px 30px rgba(37, 99, 235, 0.20);
        }

        @media (max-width: 1080px) {
          .stepper {
  overflow-x: auto;
  grid-template-columns: repeat(5, 170px);
  padding-bottom: 6px;
}

          .unidadGrid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.tramiteGrid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.costosSummaryGrid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.costosEstadoGrid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

          .fieldsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .clienteGrid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
        }
          
        @media (max-width: 640px) {
          .page {
            padding: 18px 14px 34px;
          }

          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .costosSummaryGrid,
.costosEstadoGrid {
  grid-template-columns: 1fr;
}

          .tramiteGrid {
  grid-template-columns: 1fr;
}

          .unidadGrid {
  grid-template-columns: 1fr;
}

.innerSectionHeader,
.innerSectionHeader.withBadge {
  flex-direction: column;
  align-items: flex-start;
}

          .fieldsGrid {
            grid-template-columns: 1fr;
          }

          .clienteGrid {
  grid-template-columns: 1fr;
}

.span2,
.span3 {
  grid-column: 1 / -1;
}

          .actions,
          .rightActions {
            align-items: stretch;
            flex-direction: column;
          }

          .textButton,
          .secondaryButton,
          .primaryButton {
            width: 100%;
          }
        }
          /* OVERRIDE FINAL - Formularios */
:global(.field label) {
  font-size: 12px !important;
  font-weight: 500 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  line-height: 1.1 !important;
  color: rgba(203, 213, 225, 0.68) !important;
}

:global(.field input),
:global(.field select),
:global(.field textarea) {
  font-size: 12.5px !important;
  color: rgba(226, 232, 240, 0.90) !important;
}

/* Campos ancho completo */
:global(.clienteGrid .field.full),
:global(.clienteGrid .observacionesCliente),
:global(.tramiteGrid .field.full),
:global(.fieldsGrid .field.full),
:global(.fieldsGrid .notasInicialesField),
:global(.costosEstadoGrid .field.full),
:global(.notasGrid .field.full) {
  grid-column: 1 / -1 !important;
  width: 100% !important;
}

:global(.clienteGrid .field.full textarea),
:global(.clienteGrid .observacionesCliente textarea),
:global(.tramiteGrid .field.full textarea),
:global(.fieldsGrid .field.full textarea),
:global(.fieldsGrid .notasInicialesField textarea),
:global(.costosEstadoGrid .field.full textarea),
:global(.notasGrid .field.full textarea) {
  width: 100% !important;
  min-height: 104px !important;
}

      `}</style>
    </main>
  );
}

function Field({ label, children, full = false, className = "" }) {
  const fieldClassName = `${full ? "field full" : "field"} ${className}`.trim();

  return (
    <div className={fieldClassName}>
      <label>{label}</label>
      {children}
    </div>
  );
}