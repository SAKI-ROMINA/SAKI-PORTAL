import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";
import {
  ArrowLeft,
  Car,
  ClipboardList,
  FileText,
  Plus,
  Printer,
  Upload,
  UserRound,
} from "lucide-react";

const CONCEPTOS_POR_CATEGORIA = {
  "ARANCELES / TRÁMITES REGISTRALES": [
    "ACTUALIZACIÓN DE CARROCERÍA",
    "ALTA DE CARROCERÍA",
    "ALTA DE MOTOR PARA VEHÍCULO INSCRIPTO",
    "ALTA DE MOTOR USADO, ARMADO FUERA DE FÁBRICA, GARANTÍA DE FABRICACIÓN",
    "ALTA DE NUEVO MOTOR IMPORTADO",
    "ALTA DE NUEVO MOTOR NACIONAL",
    "ALTA MUNICIPAL",
    "ANOTACIÓN DE ENDOSO",
    "ANOTACIÓN DE LOCACIÓN",
    "ANOTACIONES PERSONALES / OFICIO JUDICIAL / INSCRIPCIÓN DE EMBARGO / INSCRIPCIÓN SUBASTADO",
    "ANULACIÓN DE SOCIEDAD EN FORMACIÓN (SEF)",
    "AUTOMOTOR BAJA TEMPORAL",
    "BAJA DE AUTOMOTOR CON RECUPERACIÓN DE PIEZAS",
    "BAJA DE AUTOMOTOR PARA EXPORTACIÓN DEFINITIVA",
    "BAJA DE AUTOMOTOR POR SINIESTRO, DESTRUCCIÓN O ENVEJECIMIENTO",
    "BAJA DE CARROCERÍA",
    "BAJA DE MOTOR POR OTRAS CAUSAS",
    "BAJA DE MOTOR POR SINIESTRO, DESTRUCCIÓN O ENVEJECIMIENTO",
    "BAJA DE MOTOVEHÍCULO PARA EXPORTACIÓN DEFINITIVA",
    "BAJA DE MOTOVEHÍCULO POR SINIESTRO, DESTRUCCIÓN O ENVEJECIMIENTO",
    "BAJA MUNICIPAL",
    "CAMBIO DE CUADRO O CHASIS",
    "CAMBIO DE DOMICILIO",
    "CAMBIO DE TIPO DE CARROCERÍA",
    "CAMBIO DE TITULAR, DENOMINACIÓN SOCIAL O DESTINO",
    "CAMBIO DE USO",
    "CANCELACIÓN DE CONTRATO DE LEASING",
    "CANCELACIÓN DE LOCACIÓN",
    "CANCELACIÓN DE POSESIÓN O TENENCIA",
    "CANCELACIÓN DE PRENDA",
    "CANCELACIÓN ENDOSO",
    "CERTIFICADO DE CAMBIO DE TITULARIDAD",
    "CERTIFICADO DE DOMINIO",
    "COMUNICACIÓN DE RECUPERO",
    "CONDICIONAMIENTO DE PRENDA POR TRANSFERENCIA 0 KM",
    "CONFIRMACIÓN DE BIENES PARA SOCIEDADES EN FORMACIÓN (SEF)",
    "CONSIGNACIÓN DE AUTOMOTOR FORMULARIO 17",
    "CONSULTA DE LEGAJO",
    "DENUNCIA DE COMPRA Y POSESIÓN",
    "DENUNCIA DE ROBO O HURTO",
    "DENUNCIA DE VENTA",
    "DEVOLUCIÓN DE AUTOMOTOR A TITULAR",
    "DEVOLUCIÓN DE MOTOVEHÍCULO A TITULAR",
    "DUPLICADO DE CÉDULA",
    "DUPLICADO DE CERTIFICADO DE BAJA DE AUTOMOTOR",
    "DUPLICADO DE CERTIFICADO DE BAJA DE CARROCERÍA / CHASIS / CUADRO",
    "DUPLICADO DE CERTIFICADO DE BAJA DE MOTOR",
    "DUPLICADO DE CERTIFICADO DE DENUNCIA DE ROBO / HURTO",
    "DUPLICADO DE CERTIFICADO DE NACIONALIZACIÓN",
    "DUPLICADO DE CERTIFICADO DE RECUPERO",
    "DUPLICADO DE TÍTULO",
    "ESTIPULACIÓN A FAVOR TERCEROS - ACEPTACIÓN (ALTA DE TERCEROS)",
    "ESTIPULACIÓN A FAVOR TERCEROS - REVOCACIÓN (BAJA DE TERCEROS)",
    "EXPEDICIÓN ADICIONAL DE CÉDULA",
    "FOTOCOPIA DE CONSTANCIAS REGISTRALES",
    "INFORME DE DOMINIO",
    "INFORME DE ANOTACIONES PERSONALES",
    "INFORME NOMINAL HISTÓRICO NACIONAL",
    "INFORME NOMINAL NACIONAL",
    "INSCRIPCIÓN DE CONTRATO DE LEASING",
    "INSCRIPCIÓN DE MEDIDA JUDICIAL",
    "INSCRIPCIÓN DE POSESIÓN O TENENCIA",
    "INSCRIPCIÓN DE PRENDA",
    "INSCRIPCIÓN INICIAL DE CERO KILÓMETRO",
    "INSCRIPCIÓN INICIAL DE CERO KILÓMETRO CON PRENDA DIGITAL",
    "INSCRIPCIÓN INICIAL DE SUBASTADO",
    "LEVANTAMIENTO DE ANOTACIONES PERSONALES",
    "LEVANTAMIENTO DE MEDIDA JUDICIAL",
    "MODIFICACIÓN DE ANOTACIONES PERSONALES",
    "MODIFICACIÓN DE CONTRATO DE LEASING",
    "MODIFICACIÓN DE MEDIDA JUDICIAL",
    "MODIFICACIÓN DE PRENDA",
    "PAGO, JUSTIFICACIÓN O NEGATIVA DE PAGO DE INFRACCIONES",
    "PLACA DE IDENTIFICACIÓN ALTERNATIVA METÁLICA PARA TRAILERS",
    "RECTIFICACIÓN DE DATOS",
    "RECUPERACIÓN DE CONSTANCIA DE ASIGNACIÓN DE TÍTULO",
    "REINSCRIPCIÓN DE ANOTACIONES PERSONALES",
    "REINSCRIPCIÓN DE MEDIDA JUDICIAL",
    "REINSCRIPCIÓN DE PRENDA",
    "RENOVACIÓN CONTRATO DE LEASING",
    "REPOSICIÓN DE PLACA METÁLICA",
    "REVOCACIÓN DE CÉDULA PARA AUTORIZADO A CONDUCIR",
    "RPA/RPM PARA CHASIS/CUADRO",
    "RPA/RPM PARA MOTOR",
    "RPA/RPM PARA MOTOR SIMULTÁNEO",
    "TRANSFERENCIA",
    "TRANSFERENCIA PREVIA",
    "TRANSFERENCIA SIMULTÁNEA",
    "ASESORÍA REGISTRAL",
    "OTRO TRÁMITE REGISTRAL",
  ],

  "ARANCELES / ESCRIBANÍA": [
    "CERTIFICACIÓN DE FIRMAS",
    "CERTIFICACIÓN DE COPIAS",
    "CERTIFICACIÓN DE DOCUMENTACIÓN",
    "LEGALIZACIÓN",
    "INTERVENCIÓN NOTARIAL",
    "FIRMA ANTE ESCRIBANO",
    "OTRO ARANCEL DE ESCRIBANÍA",
  ],

  "FORMULARIOS / SOLICITUDES TIPO": [
    "TP",
    "TPM",
    "SOLICITUD TIPO 01",
    "SOLICITUD TIPO 02",
    "SOLICITUD TIPO 03",
    "SOLICITUD TIPO 04",
    "SOLICITUD TIPO 08",
    "SOLICITUD TIPO 11",
    "SOLICITUD TIPO 12",
    "SOLICITUD TIPO 13",
    "SOLICITUD TIPO 15",
    "SOLICITUD TIPO 17",
    "SOLICITUD TIPO 31",
    "SOLICITUD TIPO 59",
    "FORMULARIO DE PRENDA",
    "FORMULARIO DE CANCELACIÓN DE PRENDA",
    "OTRO FORMULARIO / SOLICITUD TIPO",
  ],

  "HONORARIOS SAKI": [
    "HONORARIOS SAKI - GESTIÓN REGISTRAL",
    "HONORARIOS SAKI - ANÁLISIS DOCUMENTAL",
    "HONORARIOS SAKI - ARMADO DE PRESUPUESTO",
    "HONORARIOS SAKI - TRÁMITE URGENTE",
    "HONORARIOS SAKI - SEGUIMIENTO / DILIGENCIAMIENTO",
    "HONORARIOS SAKI - SUBSANACIÓN",
    "OTROS HONORARIOS SAKI",
  ],

  "GASTOS ADMINISTRATIVOS / GESTIÓN": [
    "GASTOS ADMINISTRATIVOS",
    "DILIGENCIAMIENTO",
    "ENVÍO / MENSAJERÍA",
    "IMPRESIONES / COPIAS",
    "GESTIÓN MUNICIPAL",
    "GESTIÓN ANTE REGISTRO SECCIONAL",
    "GESTIÓN ANTE DNRPA",
    "GESTIÓN ANTE ORGANISMO EXTERNO",
    "OTRO GASTO ADMINISTRATIVO",
  ],

  "DEUDAS / REGULARIZACIÓN": [
    "DEUDA DE INFRACCIONES",
    "DEUDA DE PATENTES",
    "DEUDA MUNICIPAL",
    "DEUDA DE RADICACIÓN",
    "REGULARIZACIÓN DOCUMENTAL",
    "OTRA DEUDA / REGULARIZACIÓN",
  ],

  "SELLOS / IMPUESTOS": [
  "SELLOS AGIP",
  "SELLOS ARBA",
  "SELLOS PROVINCIALES",
],
};

const DOCUMENTACION_CATEGORIAS = [
  "DOCUMENTACIÓN INICIAL",
  "DOCUMENTACIÓN PRESENTADA EN REGISTRO",
  "CONSTANCIA / COMPROBANTE DE REGISTRO",
  "COMPROBANTE DE PAGO / ARANCELES",
  "DOCUMENTACIÓN FINAL ESCANEADA",
  "ORIGINALES ENTREGADOS",
  "OTRA DOCUMENTACIÓN",
];

const TRAMITE_ESTADOS = [
  "Trámite solicitado",
  "En revisión SAKI",
  "Presupuestado",
  "En curso",
  "Turno asignado",
  "Pendiente en Registro",
  "Observado",
  "Subsanación en curso",
  "Reingresado en Registro",
  "Inscripto / resultado favorable",
  "Trámite complementario pendiente",
  "Documentación final enviada",
  "Originales entregados",
  "Cerrado",
  "Anulado",
];

const PRESUPUESTO_ESTADOS = [
  "Pendiente de cotización",
  "Presupuesto emitido",
  "Presupuesto aprobado",
  "Presupuesto rechazado / no realizado",
  "Presupuesto vencido",
  "Pendiente de pago",
  "Pagado",
  "Bonificado / sin cargo",
];

const DETALLE_TABS = [
  {
    key: "cliente",
    number: "01",
    label: "Cliente",
    accent: "#38BDF8",
    gradient:
      "linear-gradient(135deg, rgba(14, 165, 233, 0.82), rgba(37, 99, 235, 0.50))",
  },
  {
    key: "unidad",
    number: "02",
    label: "Unidad",
    accent: "#22D3EE",
    gradient:
      "linear-gradient(135deg, rgba(8, 145, 178, 0.62), rgba(12, 74, 110, 0.56))",
  },
  {
    key: "tramite",
    number: "03",
    label: "Trámite",
    accent: "#7DD3FC",
    gradient:
      "linear-gradient(135deg, rgba(14, 116, 144, 0.62), rgba(30, 64, 175, 0.50))",
  },
  {
    key: "documentacion",
    number: "04",
    label: "Documentación",
    accent: "#93C5FD",
    gradient:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.54), rgba(51, 65, 85, 0.58))",
  },
  {
    key: "notas",
    number: "05",
    label: "Notas",
    accent: "#E2E8F0",
    gradient:
      "linear-gradient(135deg, rgba(52, 111, 193, 0.66), rgba(45, 70, 111, 0.62))",
  },
  {
    key: "trazabilidad",
    number: "06",
    label: "Trazabilidad",
    accent: "#BAE6FD",
    gradient:
      "linear-gradient(135deg, rgba(3, 105, 161, 0.58), rgba(30, 41, 59, 0.60))",
  },
  {
    key: "costos",
    number: "07",
    label: "Costos",
    accent: "#60A5FA",
    gradient:
      "linear-gradient(135deg, rgba(37, 99, 235, 0.66), rgba(30, 64, 175, 0.54))",
  },
];

export default function DetalleTramiteProductores() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [legajo, setLegajo] = useState(null);
  const [activeTab, setActiveTab] = useState("cliente");
  const [savingClienteData, setSavingClienteData] = useState(false);

const [clienteData, setClienteData] = useState({
  tipo_persona: "humana",
  condicion_cliente: "",
  apellido: "",
  nombre: "",
  razon_social: "",
  tipo_documento: "DNI",
numero_documento: "",
cliente_cuil_cuit: "",
domicilio: "",
  localidad: "",
  provincia: "",
  codigo_postal: "",
  email: "",
  telefono: "",
});

const [savingUnidadData, setSavingUnidadData] = useState(false);

const [unidadData, setUnidadData] = useState({
  dominio: "",
  tipo_unidad: "",
  marca: "",
  modelo: "",
  modelo_anio: "",
  tipo_vehiculo: "",
  marca_motor: "",
  numero_motor: "",
  marca_chasis_cuadro: "",
  numero_chasis_cuadro: "",
  radicacion_unidad: "",
  registro_interviniente_unidad: "",
  observaciones_registrales_unidad: "",

  titular_registral_coincide: true,
  titular_registral_tipo_persona: "humana",
  titular_registral_apellido: "",
  titular_registral_nombre: "",
  titular_registral_razon_social: "",
  titular_registral_tipo_documento: "DNI",
  titular_registral_numero_documento: "",
  titular_registral_cuil_cuit: "",
titular_registral_domicilio: "",
titular_registral_localidad: "",
titular_registral_provincia: "",
titular_registral_codigo_postal: "",
titular_registral_email: "",
titular_registral_telefono: "",
titular_registral_estado_civil: "",
  titular_registral_porcentaje: "100",
  titular_registral_tipo_bien: "",

  titular_registral_conyuge_apellido: "",
  titular_registral_conyuge_nombre: "",
  titular_registral_conyuge_dni: "",
  titular_registral_conyuge_cuil_cuit: "",
});

const [condominios, setCondominios] = useState([]);
const [condominioAbiertoId, setCondominioAbiertoId] = useState(null);

const [nuevoCondominio, setNuevoCondominio] = useState({
  tipo_persona: "humana",
  apellido: "",
  nombre: "",
  razon_social: "",
  tipo_documento: "DNI",
  numero_documento: "",
  cuil_cuit: "",
  domicilio: "",
  email: "",
  telefono: "",
  estado_civil: "",
  conyuge_apellido: "",
  conyuge_nombre: "",
  conyuge_dni: "",
  conyuge_cuil_cuit: "",
  porcentaje_titularidad: "",
});

const [savingTramiteData, setSavingTramiteData] = useState(false);

const [tramiteData, setTramiteData] = useState({
  tipo_pedido: "",
  prioridad: "",
  fecha_pedido: "",
  detalle_pedido: "",

  compania_aseguradora: "",
  numero_poliza: "",
  numero_siniestro: "",
  fecha_siniestro: "",
  tipo_siniestro: "",
  lugar_hecho: "",

  estado_tramite: "Trámite solicitado",
  fecha_estado_tramite: "",
  observacion_estado_tramite: "",
});

const [savingTurnoData, setSavingTurnoData] = useState(false);

const [turnoData, setTurnoData] = useState({
  turno_fecha: "",
  turno_hora: "",
  turno_registro: "",
  turno_direccion: "",
  turno_documentacion: "",
  turno_aranceles: "",
  turno_observaciones: "",
  turno_estado: "",
});

const [savingPresentacionData, setSavingPresentacionData] = useState(false);

const [presentacionData, setPresentacionData] = useState({
  fecha_presentacion_registro: "",
  registro_presentacion: "",
  numero_tramite_registro: "",
  control_web_presentacion: "",
  observaciones_presentacion_registro: "",
});

const [savingObservacionData, setSavingObservacionData] = useState(false);
const [savingReingresoData, setSavingReingresoData] = useState(false);

const [observacionData, setObservacionData] = useState({
  fecha_observacion_registro: "",
  motivo_observacion_registro: "",
  detalle_observacion_registro: "",
  responsable_subsanacion: "",
  fecha_retiro_subsanar: "",
  observaciones_subsanacion: "",

  fecha_subsanacion: "",
  detalle_subsanacion: "",
  fecha_reingreso_registro: "",
  observaciones_reingreso: "",
});

const [savingResultadoData, setSavingResultadoData] = useState(false);

const [resultadoData, setResultadoData] = useState({
  fecha_resultado_favorable: "",
  resultado_obtenido: "",
  documentacion_obtenida: "",
  observaciones_resultado: "",
});

const [savingComplementarioData, setSavingComplementarioData] = useState(false);

const [complementarioData, setComplementarioData] = useState({
  tipo_tramite: "",
  estado: "PENDIENTE",
  fecha_inicio: "",
  fecha_fin: "",
  observaciones: "",
});

const [tramitesComplementarios, setTramitesComplementarios] = useState([]);
const [editingComplementarioId, setEditingComplementarioId] = useState(null);
const [deletingComplementarioId, setDeletingComplementarioId] = useState(null);

const [savingCierreData, setSavingCierreData] = useState(false);

const [cierreData, setCierreData] = useState({
  fecha_documentacion_final_enviada: "",
  medio_envio_documentacion_final: "",
  fecha_entrega_originales: "",
  persona_recibe_originales: "",
  observaciones_cierre: "",
  fecha_cierre_legajo: "",
  motivo_anulacion: "",
});

const [archivosLegajo, setArchivosLegajo] = useState([]);
const [uploadingDocumento, setUploadingDocumento] = useState(false);
const [deletingDocumentoId, setDeletingDocumentoId] = useState(null);

const [documentoData, setDocumentoData] = useState({
  categoria: "DOCUMENTACIÓN INICIAL",
  descripcion: "",
  archivos: [],
});

const [trazabilidadRows, setTrazabilidadRows] = useState([]);

const [notasLegajo, setNotasLegajo] = useState([]);
const [savingNota, setSavingNota] = useState(false);
const [deletingNotaId, setDeletingNotaId] = useState(null);

const [notaData, setNotaData] = useState({
  tipo_nota: "NOTA DEL LEGAJO",
  nota: "",
  visible_para_productor: true,
});

  const [costos, setCostos] = useState([]);
  const [savingCost, setSavingCost] = useState(false);
  const [editingCostId, setEditingCostId] = useState(null);
const [deletingCostId, setDeletingCostId] = useState(null);
  const [presupuestoEstado, setPresupuestoEstado] = useState("Pendiente de cotización");
const [savingPresupuestoEstado, setSavingPresupuestoEstado] = useState(false);

  const [nuevoCosto, setNuevoCosto] = useState({
    categoria: "ARANCELES / TRÁMITES REGISTRALES",
    concepto: "",
    descripcion: "",
    cantidad: 1,
    moneda: "ARS",
    importe_unitario: "",
    visible_para_productor: true,
  });

  const [savingBaseData, setSavingBaseData] = useState(false);

const [baseData, setBaseData] = useState({
  radicacion_actual: "",
  registro_radicacion_actual: "",
  contempla_futura_radicacion: false,
  futura_radicacion: "",
  registro_futura_radicacion: "",
  lugar_presentacion_tramite: "",
  registro_interviniente_presupuesto: "",

  contempla_base_calculo: false,
  valor_venta: "",
  valor_tabla_dnrpa: "",
  valor_fiscal: "",
  base_calculo_usada: "",
  observacion_base_calculo: "",
});

  useEffect(() => {
    if (!id) return;
    cargarDetalle();
  }, [id]);

  async function cargarDetalle() {
  try {
    setLoading(true);

    const { data: legajoData, error: legajoError } = await supabase
      .from("productores_legajos")
      .select("*")
      .eq("id", id)
      .single();

    if (legajoError) {
      console.error("Error al cargar legajo:", legajoError);
      alert(`No se pudo cargar el legajo: ${legajoError.message}`);
      return;
    }

    const { data: costosData, error: costosError } = await supabase
      .from("productores_costos_conceptos")
      .select("*")
      .eq("legajo_id", id)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true });

    if (costosError) {
      console.error("Error al cargar costos:", costosError);
      alert(`No se pudieron cargar los costos: ${costosError.message}`);
      return;
    }

    const { data: condominiosData, error: condominiosError } = await supabase
      .from("productores_condominios")
      .select("*")
      .eq("legajo_id", id)
      .order("created_at", { ascending: true });

    if (condominiosError) {
      console.error("Error al cargar condominios:", condominiosError);
      alert(`No se pudieron cargar los condominios: ${condominiosError.message}`);
      return;
    }

    const {
  data: tramitesComplementariosData,
  error: tramitesComplementariosError,
} = await supabase
  .from("productores_tramites_complementarios")
  .select("*")
  .eq("legajo_id", id)
  .order("created_at", { ascending: true });

if (tramitesComplementariosError) {
  console.error(
    "Error al cargar trámites complementarios:",
    tramitesComplementariosError
  );
  alert(
    `No se pudieron cargar los trámites complementarios: ${tramitesComplementariosError.message}`
  );
  return;
}

const { data: archivosData, error: archivosError } = await supabase
  .from("productores_archivos")
  .select("*")
  .eq("legajo_id", id)
  .order("created_at", { ascending: false });

if (archivosError) {
  console.error("Error al cargar archivos del legajo:", archivosError);
  alert(`No se pudieron cargar los archivos del legajo: ${archivosError.message}`);
  return;
}

const { data: trazabilidadData, error: trazabilidadError } = await supabase
  .from("productores_trazabilidad")
  .select("*")
  .eq("legajo_id", id)
  .order("fecha_movimiento", { ascending: false })
  .order("created_at", { ascending: false });

if (trazabilidadError) {
  console.error("Error al cargar trazabilidad:", trazabilidadError);
  alert(`No se pudo cargar la trazabilidad: ${trazabilidadError.message}`);
  return;
}

const { data: notasData, error: notasError } = await supabase
  .from("productores_notas")
  .select("*")
  .eq("legajo_id", id)
  .order("created_at", { ascending: false });

if (notasError) {
  console.error("Error al cargar notas:", notasError);
  alert(`No se pudieron cargar las notas del legajo: ${notasError.message}`);
  return;
}

    setLegajo(legajoData);

setClienteData({
  tipo_persona: legajoData.tipo_persona || "humana",
  condicion_cliente: legajoData.condicion_cliente || "",
  apellido: legajoData.apellido || "",
  nombre: legajoData.nombre || "",
  razon_social: legajoData.razon_social || "",
  tipo_documento:
    legajoData.tipo_documento ||
    (legajoData.tipo_persona === "juridica" ? "CUIT" : "DNI"),
  numero_documento: legajoData.numero_documento || "",
cliente_cuil_cuit: legajoData.cliente_cuil_cuit || "",
domicilio: legajoData.domicilio || "",
  localidad: legajoData.localidad || "",
  provincia: legajoData.provincia || "",
  codigo_postal: legajoData.codigo_postal || "",
  email: legajoData.email || "",
  telefono: legajoData.telefono || "",
});

setPresupuestoEstado(
  legajoData.presupuesto_estado || "Pendiente de cotización"
);

    setUnidadData({
      dominio: legajoData.dominio || "",
      tipo_unidad: legajoData.tipo_unidad || "",
      marca: legajoData.marca || "",
      modelo: legajoData.modelo || "",
      modelo_anio: legajoData.modelo_anio || "",
      tipo_vehiculo: legajoData.tipo_vehiculo || "",
      marca_motor: legajoData.marca_motor || "",
      numero_motor: legajoData.numero_motor || "",
      marca_chasis_cuadro: legajoData.marca_chasis_cuadro || "",
      numero_chasis_cuadro: legajoData.numero_chasis_cuadro || "",
      radicacion_unidad: legajoData.radicacion_unidad || "",
      registro_interviniente_unidad:
        legajoData.registro_interviniente_unidad || "",
      observaciones_registrales_unidad:
        legajoData.observaciones_registrales_unidad || "",

      titular_registral_coincide:
        legajoData.titular_registral_coincide !== false,

      titular_registral_tipo_persona:
        legajoData.titular_registral_tipo_persona || "humana",

      titular_registral_apellido:
        legajoData.titular_registral_apellido || "",

      titular_registral_nombre:
        legajoData.titular_registral_nombre || "",

      titular_registral_razon_social:
        legajoData.titular_registral_razon_social || "",

      titular_registral_tipo_documento:
        legajoData.titular_registral_tipo_documento || "DNI",

      titular_registral_numero_documento:
        legajoData.titular_registral_numero_documento || "",

      titular_registral_cuil_cuit:
        legajoData.titular_registral_cuil_cuit || "",

      titular_registral_domicilio:
  legajoData.titular_registral_domicilio || "",

titular_registral_localidad:
  legajoData.titular_registral_localidad || "",

titular_registral_provincia:
  legajoData.titular_registral_provincia || "",

titular_registral_codigo_postal:
  legajoData.titular_registral_codigo_postal || "",

titular_registral_email:
  legajoData.titular_registral_email || "",

titular_registral_telefono:
  legajoData.titular_registral_telefono || "",

      titular_registral_estado_civil:
        legajoData.titular_registral_estado_civil || "",

      titular_registral_porcentaje:
        legajoData.titular_registral_porcentaje != null
          ? String(legajoData.titular_registral_porcentaje)
          : "100",

       titular_registral_tipo_bien:
         legajoData.titular_registral_tipo_bien || "",

      titular_registral_conyuge_apellido:
        legajoData.titular_registral_conyuge_apellido || "",

      titular_registral_conyuge_nombre:
        legajoData.titular_registral_conyuge_nombre || "",

      titular_registral_conyuge_dni:
        legajoData.titular_registral_conyuge_dni || "",

      titular_registral_conyuge_cuil_cuit:
        legajoData.titular_registral_conyuge_cuil_cuit || "",
    });

        setTramiteData({
      tipo_pedido: legajoData.tipo_pedido || "",
      prioridad: legajoData.prioridad || "",
      fecha_pedido: legajoData.fecha_pedido || "",
      detalle_pedido: legajoData.detalle_pedido || "",

      compania_aseguradora: legajoData.compania_aseguradora || "",
      numero_poliza: legajoData.numero_poliza || "",
      numero_siniestro: legajoData.numero_siniestro || "",
      fecha_siniestro: legajoData.fecha_siniestro || "",
      tipo_siniestro: legajoData.tipo_siniestro || "",
      lugar_hecho: legajoData.lugar_hecho || "",

      estado_tramite:
        legajoData.estado_tramite || legajoData.estado || "Trámite solicitado",
      fecha_estado_tramite: legajoData.fecha_estado_tramite || "",
      observacion_estado_tramite: legajoData.observacion_estado_tramite || "",
    });

    setTurnoData({
  turno_fecha: legajoData.turno_fecha || "",
  turno_hora: legajoData.turno_hora || "",
  turno_registro: legajoData.turno_registro || "",
  turno_direccion: legajoData.turno_direccion || "",
  turno_documentacion: legajoData.turno_documentacion || "",
  turno_aranceles: legajoData.turno_aranceles || "",
  turno_observaciones: legajoData.turno_observaciones || "",
  turno_estado: legajoData.turno_estado || "",
});

setPresentacionData({
  fecha_presentacion_registro: legajoData.fecha_presentacion_registro || "",
  registro_presentacion: legajoData.registro_presentacion || "",
  numero_tramite_registro: legajoData.numero_tramite_registro || "",
  control_web_presentacion: legajoData.control_web_presentacion || "",
  observaciones_presentacion_registro: "",
});

setObservacionData({
  fecha_observacion_registro: legajoData.fecha_observacion_registro || "",
  motivo_observacion_registro: legajoData.motivo_observacion_registro || "",
  detalle_observacion_registro: legajoData.detalle_observacion_registro || "",
  responsable_subsanacion: legajoData.responsable_subsanacion || "",
  fecha_retiro_subsanar: legajoData.fecha_retiro_subsanar || "",
  observaciones_subsanacion: legajoData.observaciones_subsanacion || "",

  fecha_subsanacion: legajoData.fecha_subsanacion || "",
  detalle_subsanacion: legajoData.detalle_subsanacion || "",
  fecha_reingreso_registro: legajoData.fecha_reingreso_registro || "",
  observaciones_reingreso: legajoData.observaciones_reingreso || "",
});

setResultadoData({
  fecha_resultado_favorable: legajoData.fecha_resultado_favorable || "",
  resultado_obtenido: legajoData.resultado_obtenido || "",
  documentacion_obtenida: legajoData.documentacion_obtenida || "",
  observaciones_resultado: legajoData.observaciones_resultado || "",
});

setCierreData({
  fecha_documentacion_final_enviada:
    legajoData.fecha_documentacion_final_enviada || "",
  medio_envio_documentacion_final:
    legajoData.medio_envio_documentacion_final || "",
  fecha_entrega_originales:
    legajoData.fecha_entrega_originales || "",
  persona_recibe_originales:
    legajoData.persona_recibe_originales || "",
  observaciones_cierre:
    legajoData.observaciones_cierre || "",
  fecha_cierre_legajo:
    legajoData.fecha_cierre_legajo || "",
  motivo_anulacion:
    legajoData.motivo_anulacion || "",
});

    setBaseData({
      radicacion_actual: legajoData.radicacion_actual || "",
      registro_radicacion_actual: legajoData.registro_radicacion_actual || "",
      contempla_futura_radicacion: Boolean(
        legajoData.contempla_futura_radicacion
      ),
      futura_radicacion: legajoData.futura_radicacion || "",
      registro_futura_radicacion:
        legajoData.registro_futura_radicacion || "",
      lugar_presentacion_tramite:
        legajoData.lugar_presentacion_tramite || "",
      registro_interviniente_presupuesto:
        legajoData.registro_interviniente_presupuesto || "",

      contempla_base_calculo: Boolean(legajoData.contempla_base_calculo),

      valor_venta: legajoData.valor_venta
        ? formatNumberInput(String(legajoData.valor_venta))
        : "",
      valor_tabla_dnrpa: legajoData.valor_tabla_dnrpa
        ? formatNumberInput(String(legajoData.valor_tabla_dnrpa))
        : "",
      valor_fiscal: legajoData.valor_fiscal
        ? formatNumberInput(String(legajoData.valor_fiscal))
        : "",
      base_calculo_usada: legajoData.base_calculo_usada || "",
      observacion_base_calculo:
        legajoData.observacion_base_calculo || "",
    });

    setCostos(costosData || []);
    setCondominios(condominiosData || []);
    setTramitesComplementarios(tramitesComplementariosData || []);
    setArchivosLegajo(archivosData || []);
    setTrazabilidadRows(trazabilidadData || []);
    setNotasLegajo(notasData || []);
  } finally {
    setLoading(false);
  }
}

  const totales = useMemo(() => {
    const resumen = {
  aranceles: 0,
  formularios: 0,
  honorarios: 0,
  gastos: 0,
  deudas: 0,
  sellos: 0,
  total: 0,
};

    costos.forEach((item) => {
      const total = Number(item.importe_total || 0);
      const categoria = item.categoria || "";

      if (
  categoria === "ARANCELES / TRÁMITES REGISTRALES" ||
  categoria === "ARANCELES / ESCRIBANÍA" ||
  categoria === "Aranceles"
) {
  resumen.aranceles += total;
}

if (
  categoria === "FORMULARIOS / SOLICITUDES TIPO" ||
  categoria === "Formularios"
) {
  resumen.formularios += total;
}

if (categoria === "HONORARIOS SAKI" || categoria === "Honorarios") {
  resumen.honorarios += total;
}

if (
  categoria === "GASTOS ADMINISTRATIVOS / GESTIÓN" ||
  categoria === "Gastos adicionales"
) {
  resumen.gastos += total;
}

if (
  categoria === "DEUDAS / REGULARIZACIÓN" ||
  categoria === "Deudas / regularización"
) {
  resumen.deudas += total;
}

if (categoria === "SELLOS / IMPUESTOS") {
  resumen.sellos += total;
}

      resumen.total += total;
    });

    return resumen;
  }, [costos]);

function formatDniInput(value) {
  const onlyNumbers = String(value || "").replace(/\D/g, "").slice(0, 8);

  if (!onlyNumbers) return "";

  return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatCuitCuilInput(value) {
  const onlyNumbers = String(value || "").replace(/\D/g, "").slice(0, 11);

  if (onlyNumbers.length <= 2) return onlyNumbers;
  if (onlyNumbers.length <= 10) {
    return `${onlyNumbers.slice(0, 2)}-${onlyNumbers.slice(2)}`;
  }

  return `${onlyNumbers.slice(0, 2)}-${onlyNumbers.slice(2, 10)}-${onlyNumbers.slice(10)}`;
}

function handleClienteDataChange(event) {
  const { name, value } = event.currentTarget;

  if (name === "tipo_persona") {
    setClienteData((prev) => ({
      ...prev,
      tipo_persona: value,
      apellido: "",
      nombre: "",
      razon_social: "",
      tipo_documento: value === "juridica" ? "CUIT" : "DNI",
      numero_documento: "",
    }));
    return;
  }

  if (name === "tipo_documento") {
    setClienteData((prev) => ({
      ...prev,
      tipo_documento: value,
      numero_documento: "",
    }));
    return;
  }

  const uppercaseFields = [
    "condicion_cliente",
    "apellido",
    "nombre",
    "razon_social",
    "domicilio",
    "localidad",
    "provincia",
    "codigo_postal",
  ];

  setClienteData((prev) => ({
    ...prev,
    [name]: uppercaseFields.includes(name)
      ? value.toLocaleUpperCase("es-AR")
      : value,
  }));
}

function handleClienteDocumentoChange(event) {
  const value = event.currentTarget.value;

  const formattedValue =
    clienteData.tipo_persona === "juridica" || clienteData.tipo_documento !== "DNI"
      ? formatCuitCuilInput(value)
      : formatDniInput(value);

  setClienteData((prev) => ({
    ...prev,
    numero_documento: formattedValue,
  }));
}

function handleClienteCuilCuitChange(event) {
  const value = event.currentTarget.value;

  setClienteData((prev) => ({
    ...prev,
    cliente_cuil_cuit: formatCuitCuilInput(value),
  }));
}

async function handleGuardarClienteData() {
  if (savingClienteData) return;

  try {
    setSavingClienteData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const payload = {
      tipo_persona: clienteData.tipo_persona,
      condicion_cliente: clienteData.condicion_cliente,

      apellido:
        clienteData.tipo_persona === "humana"
          ? clienteData.apellido
          : null,

      nombre:
        clienteData.tipo_persona === "humana"
          ? clienteData.nombre
          : null,

      razon_social:
        clienteData.tipo_persona === "juridica"
          ? clienteData.razon_social
          : null,

      tipo_documento:
        clienteData.tipo_persona === "juridica"
          ? "CUIT"
          : clienteData.tipo_documento,

      numero_documento: clienteData.numero_documento,
cliente_cuil_cuit: clienteData.cliente_cuil_cuit,

domicilio: clienteData.domicilio,
      localidad: clienteData.localidad,
      provincia: clienteData.provincia,
      codigo_postal: clienteData.codigo_postal,
      email: clienteData.email,
      telefono: clienteData.telefono,

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al guardar datos del cliente:", error);
      alert(`No se pudieron guardar los datos del cliente: ${error.message}`);
      return;
    }

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Datos del cliente guardados correctamente.");
  } finally {
    setSavingClienteData(false);
  }
}

function handleUnidadDataChange(event) {
  const { name, value, type, checked, tagName } = event.currentTarget;

  if (type === "checkbox") {
    setUnidadData((prev) => ({
      ...prev,
      [name]: checked,
    }));
    return;
  }

  if (name === "titular_registral_tipo_persona") {
    setUnidadData((prev) => ({
      ...prev,
      titular_registral_tipo_persona: value,
      titular_registral_apellido: "",
      titular_registral_nombre: "",
      titular_registral_razon_social: "",
      titular_registral_tipo_documento: value === "juridica" ? "CUIT" : "DNI",
      titular_registral_numero_documento: "",
      titular_registral_cuil_cuit: "",
      titular_registral_estado_civil: "",
      titular_registral_conyuge_apellido: "",
      titular_registral_conyuge_nombre: "",
      titular_registral_conyuge_dni: "",
      titular_registral_conyuge_cuil_cuit: "",
    }));
    return;
  }

  if (name === "titular_registral_tipo_documento") {
    setUnidadData((prev) => ({
      ...prev,
      titular_registral_tipo_documento: value,
      titular_registral_numero_documento: "",
    }));
    return;
  }

  if (name === "titular_registral_estado_civil" && value !== "CASADO/A") {
    setUnidadData((prev) => ({
      ...prev,
      titular_registral_estado_civil: value,
      titular_registral_conyuge_apellido: "",
      titular_registral_conyuge_nombre: "",
      titular_registral_conyuge_dni: "",
      titular_registral_conyuge_cuil_cuit: "",
    }));
    return;
  }

  const keepOriginal = tagName === "SELECT" || name.includes("email");

  setUnidadData((prev) => ({
    ...prev,
    [name]: keepOriginal ? value : value.toLocaleUpperCase("es-AR"),
  }));
}

function handleUnidadDocumentoChange(event) {
  const { name, value } = event.currentTarget;

  let formattedValue = value;

  if (name === "titular_registral_numero_documento") {
    formattedValue =
      unidadData.titular_registral_tipo_documento === "DNI"
        ? formatDniInput(value)
        : formatCuitCuilInput(value);
  }

  if (
    name === "titular_registral_cuil_cuit" ||
    name === "titular_registral_conyuge_cuil_cuit"
  ) {
    formattedValue = formatCuitCuilInput(value);
  }

  if (name === "titular_registral_conyuge_dni") {
    formattedValue = formatDniInput(value);
  }

  setUnidadData((prev) => ({
    ...prev,
    [name]: formattedValue,
  }));
}

async function handleGuardarUnidadData() {
  if (savingUnidadData) return;

  try {
    setSavingUnidadData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const titularCoincide = unidadData.titular_registral_coincide;

    const payload = {
      // Datos unidad
      dominio: unidadData.dominio,
      tipo_unidad: unidadData.tipo_unidad,
      marca: unidadData.marca,
      modelo: unidadData.modelo,
      modelo_anio: unidadData.modelo_anio || null,
      tipo_vehiculo: unidadData.tipo_vehiculo,
      marca_motor: unidadData.marca_motor,
      numero_motor: unidadData.numero_motor,
      marca_chasis_cuadro: unidadData.marca_chasis_cuadro,
      numero_chasis_cuadro: unidadData.numero_chasis_cuadro,
      radicacion_unidad: unidadData.radicacion_unidad,
      registro_interviniente_unidad: unidadData.registro_interviniente_unidad,
      observaciones_registrales_unidad:
        unidadData.observaciones_registrales_unidad,

      // Titular registral
      titular_registral_coincide: titularCoincide,

      titular_registral_tipo_persona: titularCoincide
        ? clienteData.tipo_persona
        : unidadData.titular_registral_tipo_persona,

      titular_registral_apellido: titularCoincide
        ? clienteData.tipo_persona === "humana"
          ? clienteData.apellido
          : null
        : unidadData.titular_registral_tipo_persona === "humana"
          ? unidadData.titular_registral_apellido
          : null,

      titular_registral_nombre: titularCoincide
        ? clienteData.tipo_persona === "humana"
          ? clienteData.nombre
          : null
        : unidadData.titular_registral_tipo_persona === "humana"
          ? unidadData.titular_registral_nombre
          : null,

      titular_registral_razon_social: titularCoincide
        ? clienteData.tipo_persona === "juridica"
          ? clienteData.razon_social
          : null
        : unidadData.titular_registral_tipo_persona === "juridica"
          ? unidadData.titular_registral_razon_social
          : null,

      titular_registral_tipo_documento: titularCoincide
        ? clienteData.tipo_persona === "juridica"
          ? "CUIT"
          : clienteData.tipo_documento
        : unidadData.titular_registral_tipo_persona === "juridica"
          ? "CUIT"
          : unidadData.titular_registral_tipo_documento,

      titular_registral_numero_documento: titularCoincide
        ? clienteData.numero_documento
        : unidadData.titular_registral_numero_documento,

titular_registral_cuil_cuit: titularCoincide
  ? clienteData.tipo_persona === "juridica"
    ? clienteData.numero_documento
    : clienteData.cliente_cuil_cuit
  : unidadData.titular_registral_cuil_cuit,

      titular_registral_domicilio: titularCoincide
  ? clienteData.domicilio
  : unidadData.titular_registral_domicilio,

titular_registral_localidad: titularCoincide
  ? clienteData.localidad
  : unidadData.titular_registral_localidad,

titular_registral_provincia: titularCoincide
  ? clienteData.provincia
  : unidadData.titular_registral_provincia,

titular_registral_codigo_postal: titularCoincide
  ? clienteData.codigo_postal || null
  : unidadData.titular_registral_codigo_postal || null,

titular_registral_email: titularCoincide
  ? clienteData.email
  : unidadData.titular_registral_email,

titular_registral_telefono: titularCoincide
  ? clienteData.telefono
  : unidadData.titular_registral_telefono,

      titular_registral_estado_civil:
        unidadData.titular_registral_tipo_persona === "juridica"
          ? ""
          : unidadData.titular_registral_estado_civil,

      titular_registral_porcentaje:
        Number(unidadData.titular_registral_porcentaje || 0) || 0,

        titular_registral_tipo_bien:
  unidadData.titular_registral_tipo_bien,

      titular_registral_conyuge_apellido:
        unidadData.titular_registral_estado_civil === "CASADO/A"
          ? unidadData.titular_registral_conyuge_apellido
          : "",

      titular_registral_conyuge_nombre:
        unidadData.titular_registral_estado_civil === "CASADO/A"
          ? unidadData.titular_registral_conyuge_nombre
          : "",

      titular_registral_conyuge_dni:
        unidadData.titular_registral_estado_civil === "CASADO/A"
          ? unidadData.titular_registral_conyuge_dni
          : "",

      titular_registral_conyuge_cuil_cuit:
        unidadData.titular_registral_estado_civil === "CASADO/A"
          ? unidadData.titular_registral_conyuge_cuil_cuit
          : "",

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al guardar datos de unidad:", error);
      alert(`No se pudieron guardar los datos de la unidad: ${error.message}`);
      return;
    }

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Datos del dominio guardados correctamente.");
  } finally {
    setSavingUnidadData(false);
  }
}

function resetNuevoCondominio() {
  setNuevoCondominio({
    tipo_persona: "humana",
    apellido: "",
    nombre: "",
    razon_social: "",
    tipo_documento: "DNI",
    numero_documento: "",
    cuil_cuit: "",
    domicilio: "",
    email: "",
    telefono: "",
    estado_civil: "",
    conyuge_apellido: "",
    conyuge_nombre: "",
    conyuge_dni: "",
    conyuge_cuil_cuit: "",
    porcentaje_titularidad: "",
  });
}

function handleNuevoCondominioChange(event) {
  const { name, value, tagName } = event.currentTarget;

  if (name === "tipo_persona") {
    setNuevoCondominio((prev) => ({
      ...prev,
      tipo_persona: value,
      apellido: "",
      nombre: "",
      razon_social: "",
      tipo_documento: value === "juridica" ? "CUIT" : "DNI",
      numero_documento: "",
      cuil_cuit: "",
      estado_civil: "",
      conyuge_apellido: "",
      conyuge_nombre: "",
      conyuge_dni: "",
      conyuge_cuil_cuit: "",
    }));
    return;
  }

  if (name === "tipo_documento") {
    setNuevoCondominio((prev) => ({
      ...prev,
      tipo_documento: value,
      numero_documento: "",
    }));
    return;
  }

  if (name === "estado_civil" && value !== "CASADO/A") {
    setNuevoCondominio((prev) => ({
      ...prev,
      estado_civil: value,
      conyuge_apellido: "",
      conyuge_nombre: "",
      conyuge_dni: "",
      conyuge_cuil_cuit: "",
    }));
    return;
  }

  const keepOriginal = tagName === "SELECT" || name.includes("email");

  setNuevoCondominio((prev) => ({
    ...prev,
    [name]: keepOriginal ? value : value.toLocaleUpperCase("es-AR"),
  }));
}

function handleNuevoCondominioDocumentoChange(event) {
  const { name, value } = event.currentTarget;

  let formattedValue = value;

if (name === "numero_documento") {
  formattedValue =
    nuevoCondominio.tipo_persona === "juridica"
      ? formatCuitCuilInput(value)
      : formatDniInput(value);
}

  if (name === "cuil_cuit" || name === "conyuge_cuil_cuit") {
    formattedValue = formatCuitCuilInput(value);
  }

  if (name === "conyuge_dni") {
    formattedValue = formatDniInput(value);
  }

  setNuevoCondominio((prev) => ({
    ...prev,
    [name]: formattedValue,
  }));
}

async function handleAgregarCondominio() {
  const porcentaje = Number(nuevoCondominio.porcentaje_titularidad || 0);

  if (porcentaje <= 0) {
    alert("Cargá el porcentaje de titularidad del condómino.");
    return;
  }

  if (porcentaje > porcentajeTitularidadRestante) {
    alert(
      `El porcentaje cargado supera el restante. Resta cargar ${porcentajeTitularidadRestante}%.`
    );
    return;
  }

  if (
    nuevoCondominio.tipo_persona === "humana" &&
    (!nuevoCondominio.apellido || !nuevoCondominio.nombre)
  ) {
    alert("Cargá apellido y nombre del condómino.");
    return;
  }

  if (
    nuevoCondominio.tipo_persona === "juridica" &&
    !nuevoCondominio.razon_social
  ) {
    alert("Cargá la razón social del condómino.");
    return;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const { data: condominioInsertado, error } = await supabase
  .from("productores_condominios")
  .insert({
      legajo_id: id,

      tipo_persona: nuevoCondominio.tipo_persona,

      apellido:
        nuevoCondominio.tipo_persona === "humana"
          ? nuevoCondominio.apellido
          : null,

      nombre:
        nuevoCondominio.tipo_persona === "humana"
          ? nuevoCondominio.nombre
          : null,

      razon_social:
        nuevoCondominio.tipo_persona === "juridica"
          ? nuevoCondominio.razon_social
          : null,

      tipo_documento:
        nuevoCondominio.tipo_persona === "juridica"
          ? "CUIT"
          : nuevoCondominio.tipo_documento,

      numero_documento: nuevoCondominio.numero_documento,
      cuil_cuit: nuevoCondominio.cuil_cuit,
      domicilio: nuevoCondominio.domicilio,
      email: nuevoCondominio.email,
      telefono: nuevoCondominio.telefono,

      estado_civil:
        nuevoCondominio.tipo_persona === "humana"
          ? nuevoCondominio.estado_civil
          : "",

      conyuge_apellido:
        nuevoCondominio.estado_civil === "CASADO/A"
          ? nuevoCondominio.conyuge_apellido
          : "",

      conyuge_nombre:
        nuevoCondominio.estado_civil === "CASADO/A"
          ? nuevoCondominio.conyuge_nombre
          : "",

      conyuge_dni:
        nuevoCondominio.estado_civil === "CASADO/A"
          ? nuevoCondominio.conyuge_dni
          : "",

      conyuge_cuil_cuit:
        nuevoCondominio.estado_civil === "CASADO/A"
          ? nuevoCondominio.conyuge_cuil_cuit
          : "",

      porcentaje_titularidad: porcentaje,

  created_by: userId,
updated_by: userId,
})
.select("*")
.single();

    if (error) {
      console.error("Error al agregar condómino:", error);
      alert(`No se pudo agregar el condómino: ${error.message}`);
      return;
    }

if (condominioInsertado) {
  setCondominios((prev) => [...prev, condominioInsertado]);
} else {
  await cargarDetalle();
}

resetNuevoCondominio();

setTimeout(() => {
  document
    .getElementById("condominios-block")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}, 100);
  } catch (err) {
    console.error("Error inesperado al agregar condómino:", err);
    alert("Ocurrió un error inesperado al agregar el condómino.");
  }
}

async function handleEliminarCondominio(item) {
  const confirmar = window.confirm(
    "¿Seguro querés eliminar este condómino?"
  );

  if (!confirmar) return;

  const { error } = await supabase
    .from("productores_condominios")
    .delete()
    .eq("id", item.id)
    .eq("legajo_id", id);

  if (error) {
    console.error("Error al eliminar condómino:", error);
    alert(`No se pudo eliminar el condómino: ${error.message}`);
    return;
  }

  await cargarDetalle();
}

function handleTramiteDataChange(event) {
  const { name, value, tagName, type } = event.currentTarget;

  const keepOriginal =
    tagName === "SELECT" ||
    type === "date" ||
    name.includes("fecha");

  setTramiteData((prev) => ({
    ...prev,
    [name]: keepOriginal ? value : value.toLocaleUpperCase("es-AR"),
  }));
}

async function registrarTrazabilidad({
  tipo_movimiento,
  estado_anterior = "",
  estado_nuevo = "",
  titulo,
  detalle = "",
  userId = null,
}) {
  const { error } = await supabase.from("productores_trazabilidad").insert({
    legajo_id: id,
    tipo_movimiento,
    estado_anterior,
    estado_nuevo,
    titulo,
    detalle,
    fecha_movimiento: new Date().toISOString(),
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    console.error("Error al registrar trazabilidad:", error);
    throw error;
  }
}

async function handleGuardarTramiteData() {
  if (savingTramiteData) return;

  try {
    setSavingTramiteData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const estadoNuevo =
      tramiteData.estado_tramite || "Trámite solicitado";

    const cambioEstado = estadoAnterior !== estadoNuevo;
    const now = new Date().toISOString();

    const payload = {
      tipo_pedido: tramiteData.tipo_pedido,
      prioridad: tramiteData.prioridad,
      fecha_pedido: tramiteData.fecha_pedido || null,
      detalle_pedido: tramiteData.detalle_pedido,

      compania_aseguradora: tramiteData.compania_aseguradora,
      numero_poliza: tramiteData.numero_poliza,
      numero_siniestro: tramiteData.numero_siniestro,
      fecha_siniestro: tramiteData.fecha_siniestro || null,
      tipo_siniestro: tramiteData.tipo_siniestro,
      lugar_hecho: tramiteData.lugar_hecho,

      estado_tramite: estadoNuevo,
      fecha_estado_tramite: cambioEstado
        ? now
        : tramiteData.fecha_estado_tramite || legajo?.fecha_estado_tramite || now,
      observacion_estado_tramite: tramiteData.observacion_estado_tramite,

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al guardar datos del trámite:", error);
      alert(`No se pudieron guardar los datos del trámite: ${error.message}`);
      return;
    }

    if (cambioEstado) {
      await registrarTrazabilidad({
        tipo_movimiento: "cambio_estado_tramite",
        estado_anterior: estadoAnterior,
        estado_nuevo: estadoNuevo,
        titulo: `Estado actualizado: ${estadoNuevo}`,
        detalle:
          tramiteData.observacion_estado_tramite ||
          `El trámite pasó de "${estadoAnterior}" a "${estadoNuevo}".`,
        userId,
      });
    }

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTramiteData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Datos del trámite guardados correctamente.");
  } catch (err) {
    console.error("Error inesperado al guardar trámite:", err);
    alert("Ocurrió un error inesperado al guardar los datos del trámite.");
  } finally {
    setSavingTramiteData(false);
  }
}

function handleTurnoDataChange(event) {
  const { name, value, type, tagName } = event.currentTarget;

  const keepOriginal =
    tagName === "SELECT" ||
    type === "date" ||
    type === "time" ||
    name.includes("fecha") ||
    name.includes("hora");

  setTurnoData((prev) => ({
    ...prev,
    [name]: keepOriginal ? value : value.toLocaleUpperCase("es-AR"),
  }));
}

async function handleGuardarTurnoData() {
  if (savingTurnoData) return;

  try {
    setSavingTurnoData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const payload = {
      turno_fecha: turnoData.turno_fecha || null,
      turno_hora: turnoData.turno_hora,
      turno_registro: turnoData.turno_registro,
      turno_direccion: turnoData.turno_direccion,
      turno_documentacion: turnoData.turno_documentacion,
      turno_aranceles: turnoData.turno_aranceles,
      turno_observaciones: turnoData.turno_observaciones,
      turno_estado: turnoData.turno_estado || "Turno cargado",

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al guardar turno:", error);
      alert(`No se pudieron guardar los datos del turno: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "turno_guardado",
      titulo: "Datos de turno guardados",
      detalle: `Turno: ${turnoData.turno_fecha || "sin fecha"} ${
        turnoData.turno_hora || ""
      } - ${turnoData.turno_registro || "sin registro"}.`,
      userId,
    });

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTurnoData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Datos del turno guardados correctamente.");
  } catch (err) {
    console.error("Error inesperado al guardar turno:", err);
    alert("Ocurrió un error inesperado al guardar los datos del turno.");
  } finally {
    setSavingTurnoData(false);
  }
}

function construirTextoTurnoWhatsapp() {
  const cliente =
    clienteNombre || "cliente / asegurado";

  const dominio =
    legajo?.dominio || unidadData?.dominio || "dominio no informado";

  const fechaTurno = turnoData.turno_fecha
    ? new Date(`${turnoData.turno_fecha}T00:00:00`).toLocaleDateString("es-AR")
    : "fecha a confirmar";

  const horaTurno = turnoData.turno_hora || "horario a confirmar";

  const registro = turnoData.turno_registro || "registro / lugar a confirmar";
  const direccion = turnoData.turno_direccion || "dirección a confirmar";

  const documentacion =
    turnoData.turno_documentacion || "documentación a confirmar";

  const aranceles =
    turnoData.turno_aranceles || "importes / aranceles a confirmar";

  const observaciones =
    turnoData.turno_observaciones || "";

  return `Hola, te informamos que el trámite del dominio ${dominio} tiene turno asignado.

Cliente / asegurado: ${cliente}

Fecha: ${fechaTurno}
Horario: ${horaTurno}
Registro / lugar de presentación: ${registro}
Dirección: ${direccion}

Documentación a presentar:
${documentacion}

Aranceles / importes a abonar:
${aranceles}

${observaciones ? `Observaciones:\n${observaciones}\n\n` : ""}Por favor, verificar la documentación antes de concurrir.

SAKI`;
}

async function handleCopiarTurnoWhatsapp() {
  const texto = construirTextoTurnoWhatsapp();

  try {
    await navigator.clipboard.writeText(texto);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    await registrarTrazabilidad({
      tipo_movimiento: "turno_whatsapp_copiado",
      titulo: "Texto de turno copiado para WhatsApp",
      detalle: "Se generó y copió el texto de aviso de turno para enviar por WhatsApp.",
      userId,
    });

    alert("Texto para WhatsApp copiado correctamente.");
  } catch (err) {
    console.error("Error al copiar texto de WhatsApp:", err);
    alert("No se pudo copiar el texto. Revisá los permisos del navegador.");
  }
}

function handlePresentacionDataChange(event) {
  const { name, value, type } = event.currentTarget;

  const keepOriginal =
    type === "date" ||
    name.includes("fecha");

  setPresentacionData((prev) => ({
    ...prev,
    [name]: keepOriginal ? value : value.toLocaleUpperCase("es-AR"),
  }));
}

function handleObservacionDataChange(event) {
  const { name, value, type, tagName } = event.currentTarget;

  const keepOriginal =
    tagName === "SELECT" ||
    type === "date" ||
    name.includes("fecha");

  setObservacionData((prev) => ({
    ...prev,
    [name]: keepOriginal ? value : value.toLocaleUpperCase("es-AR"),
  }));
}

function handleResultadoDataChange(event) {
  const { name, value, type } = event.currentTarget;

  const keepOriginal =
    type === "date" ||
    name.includes("fecha");

  setResultadoData((prev) => ({
    ...prev,
    [name]: keepOriginal ? value : value.toLocaleUpperCase("es-AR"),
  }));
}

function handleComplementarioDataChange(event) {
  const { name, value, type } = event.currentTarget;

  const keepOriginal =
    type === "date" ||
    name.includes("fecha");

  setComplementarioData((prev) => ({
    ...prev,
    [name]: keepOriginal ? value : value.toLocaleUpperCase("es-AR"),
  }));
}

function resetComplementarioForm() {
  setEditingComplementarioId(null);

  setComplementarioData({
    tipo_tramite: "",
    estado: "PENDIENTE",
    fecha_inicio: "",
    fecha_fin: "",
    observaciones: "",
  });
}

function handleEditarComplementario(item) {
  setEditingComplementarioId(item.id);

  setComplementarioData({
    tipo_tramite: item.tipo_tramite || "",
    estado: item.estado || "PENDIENTE",
    fecha_inicio: item.fecha_inicio || "",
    fecha_fin: item.fecha_fin || "",
    observaciones: item.observaciones || "",
  });
}

async function handleGuardarComplementarioData() {
  if (savingComplementarioData) return;

  if (!complementarioData.tipo_tramite) {
    alert("Seleccioná el tipo de trámite complementario.");
    return;
  }

  try {
    setSavingComplementarioData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const payload = {
      legajo_id: id,
      tipo_tramite: complementarioData.tipo_tramite,
      estado: complementarioData.estado || "PENDIENTE",
      fecha_inicio: complementarioData.fecha_inicio || null,
      fecha_fin: complementarioData.fecha_fin || null,
      observaciones: complementarioData.observaciones,
      updated_by: userId,
    };

    let error;

    if (editingComplementarioId) {
      const response = await supabase
        .from("productores_tramites_complementarios")
        .update(payload)
        .eq("id", editingComplementarioId)
        .eq("legajo_id", id);

      error = response.error;
    } else {
      const response = await supabase
        .from("productores_tramites_complementarios")
        .insert({
          ...payload,
          created_by: userId,
        });

      error = response.error;
    }

    if (error) {
      console.error("Error al guardar trámite complementario:", error);
      alert(`No se pudo guardar el trámite complementario: ${error.message}`);
      return;
    }

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const debePasarAComplementario =
      payload.estado === "PENDIENTE" || payload.estado === "EN GESTIÓN";

    if (debePasarAComplementario) {
      const estadoNuevo = "Trámite complementario pendiente";
      const now = new Date().toISOString();

      const detalleEstado =
        payload.observaciones ||
        `Se registró trámite complementario: ${payload.tipo_tramite}.`;

      const { error: estadoError } = await supabase
        .from("productores_legajos")
        .update({
          estado_tramite: estadoNuevo,
          fecha_estado_tramite: now,
          observacion_estado_tramite: detalleEstado,
          updated_by: userId,
        })
        .eq("id", id);

      if (estadoError) {
        console.error("Error al actualizar estado del legajo:", estadoError);
        alert(
          `El trámite complementario fue guardado, pero no se pudo actualizar el estado del legajo: ${estadoError.message}`
        );
        return;
      }

      setLegajo((prev) => ({
        ...prev,
        estado_tramite: estadoNuevo,
        fecha_estado_tramite: now,
        observacion_estado_tramite: detalleEstado,
      }));

      setTramiteData((prev) => ({
        ...prev,
        estado_tramite: estadoNuevo,
        fecha_estado_tramite: now,
        observacion_estado_tramite: detalleEstado,
      }));
    }

    await registrarTrazabilidad({
      tipo_movimiento: editingComplementarioId
        ? "tramite_complementario_editado"
        : "tramite_complementario_agregado",
      estado_anterior: estadoAnterior,
      estado_nuevo: debePasarAComplementario
        ? "Trámite complementario pendiente"
        : estadoAnterior,
      titulo: editingComplementarioId
        ? "Trámite complementario editado"
        : "Trámite complementario agregado",
      detalle:
        payload.observaciones ||
        `${payload.tipo_tramite} - ${payload.estado || "PENDIENTE"}.`,
      userId,
    });

    resetComplementarioForm();
await cargarDetalle();

setTimeout(() => {
  document
    .getElementById("tramites-complementarios-block")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}, 100);

alert(
  editingComplementarioId
    ? "Trámite complementario actualizado correctamente."
    : "Trámite complementario agregado correctamente."
);
  } catch (err) {
    console.error("Error inesperado al guardar trámite complementario:", err);
    alert("Ocurrió un error inesperado al guardar el trámite complementario.");
  } finally {
    setSavingComplementarioData(false);
  }
}

async function handleEliminarComplementario(item) {
  if (deletingComplementarioId) return;

  const confirmar = window.confirm(
    `¿Seguro querés eliminar el trámite complementario "${item.tipo_tramite}"?`
  );

  if (!confirmar) return;

  try {
    setDeletingComplementarioId(item.id);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const { error } = await supabase
      .from("productores_tramites_complementarios")
      .delete()
      .eq("id", item.id)
      .eq("legajo_id", id);

    if (error) {
      console.error("Error al eliminar trámite complementario:", error);
      alert(`No se pudo eliminar el trámite complementario: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "tramite_complementario_eliminado",
      titulo: "Trámite complementario eliminado",
      detalle: item.tipo_tramite || "Se eliminó un trámite complementario.",
      userId,
    });

    if (editingComplementarioId === item.id) {
      resetComplementarioForm();
    }

    await cargarDetalle();

setTimeout(() => {
  document
    .getElementById("tramites-complementarios-block")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}, 100);

alert("Trámite complementario eliminado correctamente.");
  } catch (err) {
    console.error("Error inesperado al eliminar trámite complementario:", err);
    alert("Ocurrió un error inesperado al eliminar el trámite complementario.");
  } finally {
    setDeletingComplementarioId(null);
  }
}

async function handleMarcarResultadoFavorable() {
  if (savingResultadoData) return;

  if (!resultadoData.fecha_resultado_favorable) {
    alert("Cargá la fecha del resultado favorable / inscripción.");
    return;
  }

  if (!resultadoData.resultado_obtenido.trim()) {
    alert("Cargá el resultado obtenido.");
    return;
  }

  try {
    setSavingResultadoData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const estadoNuevo = "Inscripto / resultado favorable";
    const now = new Date().toISOString();

    const detalleResultado =
  resultadoData.resultado_obtenido ||
  resultadoData.documentacion_obtenida ||
  "El trámite obtuvo resultado favorable.";

    const payload = {
      fecha_resultado_favorable:
        resultadoData.fecha_resultado_favorable || null,
      resultado_obtenido: resultadoData.resultado_obtenido,
      documentacion_obtenida: resultadoData.documentacion_obtenida,
      observaciones_resultado: "",

      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalleResultado,

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al marcar resultado favorable:", error);
      alert(`No se pudo marcar el resultado favorable: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "resultado_favorable",
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      titulo: "Trámite inscripto / resultado favorable",
      detalle: detalleResultado,
      userId,
    });

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTramiteData((prev) => ({
      ...prev,
      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalleResultado,
    }));

    setResultadoData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Resultado favorable registrado correctamente.");
  } catch (err) {
    console.error("Error inesperado al marcar resultado favorable:", err);
    alert("Ocurrió un error inesperado al marcar el resultado favorable.");
  } finally {
    setSavingResultadoData(false);
  }
}

async function handleGuardarPresentacionData() {
  if (savingPresentacionData) return;

  if (!presentacionData.fecha_presentacion_registro) {
    alert("Cargá la fecha de presentación en Registro.");
    return;
  }

  try {
    setSavingPresentacionData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const estadoNuevo = "Pendiente en Registro";
    const now = new Date().toISOString();

    const detallePresentacion = [
  presentacionData.numero_tramite_registro
    ? `Recibo: ${presentacionData.numero_tramite_registro}`
    : "",
  presentacionData.control_web_presentacion
    ? `Control web: ${presentacionData.control_web_presentacion}`
    : "",
]
  .filter(Boolean)
  .join(" · ");

const payload = {
  fecha_presentacion_registro:
    presentacionData.fecha_presentacion_registro || null,
  registro_presentacion: "",
  numero_tramite_registro: presentacionData.numero_tramite_registro,
  control_web_presentacion: presentacionData.control_web_presentacion,
  observaciones_presentacion_registro: "",

  estado_tramite: estadoNuevo,
  fecha_estado_tramite: now,
  observacion_estado_tramite:
    detallePresentacion || "Trámite presentado en Registro.",

  updated_by: userId,
};

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al guardar presentación en Registro:", error);
      alert(`No se pudo guardar la presentación: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "presentacion_registro",
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      titulo: "Trámite presentado en Registro",
      detalle:
  detallePresentacion || "El trámite fue presentado en Registro.",
      userId,
    });

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTramiteData((prev) => ({
      ...prev,
      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite:
        payload.observacion_estado_tramite,
    }));

    setPresentacionData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Presentación en Registro guardada correctamente.");
  } catch (err) {
    console.error("Error inesperado al guardar presentación:", err);
    alert("Ocurrió un error inesperado al guardar la presentación.");
  } finally {
    setSavingPresentacionData(false);
  }
}

async function handleMarcarObservado() {
  if (savingObservacionData) return;

  if (!observacionData.fecha_observacion_registro) {
    alert("Cargá la fecha de observación del Registro.");
    return;
  }

  if (!observacionData.motivo_observacion_registro.trim()) {
    alert("Cargá el motivo de la observación.");
    return;
  }

  try {
    setSavingObservacionData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const estadoNuevo = "Observado";
    const now = new Date().toISOString();

 const detalleObservacion =
  observacionData.motivo_observacion_registro ||
  "Trámite observado por el Registro.";

    const payload = {
  fecha_observacion_registro:
    observacionData.fecha_observacion_registro || null,
  motivo_observacion_registro:
    observacionData.motivo_observacion_registro,
  detalle_observacion_registro: "",
  responsable_subsanacion:
    observacionData.responsable_subsanacion,
  fecha_retiro_subsanar: null,
  observaciones_subsanacion: "",

  estado_tramite: estadoNuevo,
  fecha_estado_tramite: now,
  observacion_estado_tramite: detalleObservacion,

  updated_by: userId,
};

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al marcar observado:", error);
      alert(`No se pudo marcar el trámite como observado: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "observacion_registro",
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      titulo: "Trámite observado por el Registro",
      detalle: detalleObservacion,
      userId,
    });

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTramiteData((prev) => ({
      ...prev,
      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalleObservacion,
    }));

    setObservacionData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Trámite marcado como observado correctamente.");
  } catch (err) {
    console.error("Error inesperado al marcar observado:", err);
    alert("Ocurrió un error inesperado al marcar el trámite como observado.");
  } finally {
    setSavingObservacionData(false);
  }
}

async function handleMarcarSubsanacionEnCurso() {
  if (savingObservacionData) return;

  if (!observacionData.responsable_subsanacion) {
    alert("Seleccioná quién queda responsable de subsanar la observación.");
    return;
  }

  try {
    setSavingObservacionData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const estadoNuevo = "Subsanación en curso";
    const now = new Date().toISOString();

    const detalleSubsanacion =
      observacionData.observaciones_subsanacion ||
      `La subsanación queda a cargo de ${observacionData.responsable_subsanacion}.`;

    const payload = {
      responsable_subsanacion: observacionData.responsable_subsanacion,
      fecha_retiro_subsanar: observacionData.fecha_retiro_subsanar || null,
      observaciones_subsanacion: observacionData.observaciones_subsanacion,

      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalleSubsanacion,

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al marcar subsanación en curso:", error);
      alert(`No se pudo marcar la subsanación en curso: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "subsanacion_en_curso",
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      titulo: "Subsanación en curso",
      detalle: detalleSubsanacion,
      userId,
    });

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTramiteData((prev) => ({
      ...prev,
      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalleSubsanacion,
    }));

    setObservacionData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Subsanación en curso registrada correctamente.");
  } catch (err) {
    console.error("Error inesperado al marcar subsanación:", err);
    alert("Ocurrió un error inesperado al marcar la subsanación en curso.");
  } finally {
    setSavingObservacionData(false);
  }
}

async function handleMarcarReingresadoRegistro() {
  if (savingReingresoData) return;

  if (!observacionData.fecha_reingreso_registro) {
    alert("Cargá la fecha de reingreso en Registro.");
    return;
  }

  try {
    setSavingReingresoData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const estadoNuevo = "Reingresado en Registro";
    const now = new Date().toISOString();

    const detalleReingreso =
      observacionData.observaciones_reingreso ||
      observacionData.detalle_subsanacion ||
      "El trámite fue subsanado y reingresado en Registro.";

    const payload = {
      fecha_subsanacion: observacionData.fecha_subsanacion || null,
      detalle_subsanacion: observacionData.detalle_subsanacion,
      fecha_reingreso_registro:
        observacionData.fecha_reingreso_registro || null,
      observaciones_reingreso: observacionData.observaciones_reingreso,

      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalleReingreso,

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al marcar reingreso en Registro:", error);
      alert(`No se pudo marcar el reingreso en Registro: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "reingreso_registro",
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      titulo: "Trámite reingresado en Registro",
      detalle: detalleReingreso,
      userId,
    });

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTramiteData((prev) => ({
      ...prev,
      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalleReingreso,
    }));

    setObservacionData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Reingreso en Registro registrado correctamente.");
  } catch (err) {
    console.error("Error inesperado al marcar reingreso:", err);
    alert("Ocurrió un error inesperado al marcar el reingreso en Registro.");
  } finally {
    setSavingReingresoData(false);
  }
}

function handleDocumentoDataChange(event) {
  const { name, value } = event.currentTarget;

  setDocumentoData((prev) => ({
    ...prev,
    [name]:
      name === "descripcion"
        ? value.toLocaleUpperCase("es-AR")
        : value,
  }));
}

function handleDocumentoFilesChange(event) {
  const files = Array.from(event.currentTarget.files || []);

  if (files.length === 0) return;

  setDocumentoData((prev) => ({
    ...prev,
    archivos: [...prev.archivos, ...files],
  }));

  event.currentTarget.value = "";
}

function handleQuitarDocumentoSeleccionado(indexToRemove) {
  setDocumentoData((prev) => ({
    ...prev,
    archivos: prev.archivos.filter((_, index) => index !== indexToRemove),
  }));
}

function handleLimpiarDocumentosSeleccionados() {
  setDocumentoData((prev) => ({
    ...prev,
    archivos: [],
  }));
}

function normalizarNombreStorage(value) {
  return String(value || "archivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function handleSubirDocumentosLegajo() {
  if (uploadingDocumento) return;

  if (!documentoData.archivos.length) {
    alert("Seleccioná al menos un archivo para subir.");
    return;
  }

  try {
    setUploadingDocumento(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const categoriaSlug = normalizarNombreStorage(documentoData.categoria);

    for (const file of documentoData.archivos) {
      const nombreOriginal = file.name;
      const nombreBase = normalizarNombreStorage(nombreOriginal);
      const uniqueSuffix = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      const storagePath = `${id}/${categoriaSlug}/${uniqueSuffix}-${nombreBase}`;

      const { error: uploadError } = await supabase.storage
        .from("productores-archivos")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error al subir archivo:", uploadError);
        alert(`No se pudo subir el archivo ${nombreOriginal}: ${uploadError.message}`);
        return;
      }

      const { error: insertError } = await supabase
        .from("productores_archivos")
        .insert({
          legajo_id: id,
          tipo_documentacion: documentoData.categoria,
          nombre_archivo: nombreBase,
          nombre_original: nombreOriginal,
          storage_path: storagePath,
          mime_type: file.type || null,
          size_bytes: file.size || null,
          observaciones: documentoData.descripcion,
          created_by: userId,
          updated_by: userId,
        });

      if (insertError) {
        console.error("Error al registrar archivo:", insertError);
        alert(
          `El archivo ${nombreOriginal} se subió al bucket, pero no se pudo registrar en la tabla: ${insertError.message}`
        );
        return;
      }
    }

    await registrarTrazabilidad({
      tipo_movimiento: "documentacion_subida",
      titulo: "Documentación subida al legajo",
      detalle: `${documentoData.archivos.length} archivo(s) subido(s) como ${documentoData.categoria}.`,
      userId,
    });

    setDocumentoData({
      categoria: "DOCUMENTACIÓN INICIAL",
      descripcion: "",
      archivos: [],
    });

    await cargarDetalle();

    alert("Documentación subida correctamente.");
  } catch (err) {
    console.error("Error inesperado al subir documentación:", err);
    alert("Ocurrió un error inesperado al subir la documentación.");
  } finally {
    setUploadingDocumento(false);
  }
}

async function handleVerDocumentoLegajo(archivo) {
  if (!archivo?.storage_path) {
    alert("El archivo no tiene ruta de almacenamiento.");
    return;
  }

  const { data, error } = await supabase.storage
    .from("productores-archivos")
    .createSignedUrl(archivo.storage_path, 60);

  if (error) {
    console.error("Error al abrir archivo:", error);
    alert(`No se pudo abrir el archivo: ${error.message}`);
    return;
  }

  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

async function handleDescargarDocumentoLegajo(archivo) {
  if (!archivo?.storage_path) {
    alert("El archivo no tiene ruta de almacenamiento.");
    return;
  }

  const nombreDescarga =
    archivo.nombre_original || archivo.nombre_archivo || "documento";

  const { data, error } = await supabase.storage
    .from("productores-archivos")
    .createSignedUrl(archivo.storage_path, 60, {
      download: nombreDescarga,
    });

  if (error) {
    console.error("Error al descargar archivo:", error);
    alert(`No se pudo descargar el archivo: ${error.message}`);
    return;
  }

  const link = document.createElement("a");
  link.href = data.signedUrl;
  link.download = nombreDescarga;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function handleEliminarDocumentoLegajo(archivo) {
  if (deletingDocumentoId) return;

  const nombreArchivo =
    archivo?.nombre_original || archivo?.nombre_archivo || "este archivo";

  const confirmar = window.confirm(
    `¿Seguro querés eliminar "${nombreArchivo}" del legajo?`
  );

  if (!confirmar) return;

  try {
    setDeletingDocumentoId(archivo.id);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    if (archivo.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("productores-archivos")
        .remove([archivo.storage_path]);

      if (storageError) {
        console.error("Error al eliminar archivo del bucket:", storageError);
        alert(`No se pudo eliminar el archivo del bucket: ${storageError.message}`);
        return;
      }
    }

    const { error: deleteError } = await supabase
      .from("productores_archivos")
      .delete()
      .eq("id", archivo.id)
      .eq("legajo_id", id);

    if (deleteError) {
      console.error("Error al eliminar registro del archivo:", deleteError);
      alert(`No se pudo eliminar el archivo del legajo: ${deleteError.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "documentacion_eliminada",
      titulo: "Documentación eliminada del legajo",
      detalle: `Se eliminó el archivo: ${nombreArchivo}.`,
      userId,
    });

    await cargarDetalle();

    alert("Archivo eliminado correctamente.");
  } catch (err) {
    console.error("Error inesperado al eliminar archivo:", err);
    alert("Ocurrió un error inesperado al eliminar el archivo.");
  } finally {
    setDeletingDocumentoId(null);
  }
}

function handleCierreDataChange(event) {
  const { name, value, type, tagName } = event.currentTarget;

  const keepOriginal =
    tagName === "SELECT" ||
    type === "date" ||
    name.includes("fecha");

  setCierreData((prev) => ({
    ...prev,
    [name]: keepOriginal ? value : value.toLocaleUpperCase("es-AR"),
  }));
}

async function handleMarcarDocumentacionFinalEnviada() {
  if (savingCierreData) return;

  if (!cierreData.fecha_documentacion_final_enviada) {
    alert("Cargá la fecha de envío de la documentación final.");
    return;
  }

  if (!cierreData.medio_envio_documentacion_final) {
    alert("Seleccioná el medio de envío de la documentación final.");
    return;
  }

  try {
    setSavingCierreData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const estadoNuevo = "Documentación final enviada";
    const now = new Date().toISOString();

    const detalle =
      cierreData.observaciones_cierre ||
      `Documentación final enviada por ${cierreData.medio_envio_documentacion_final}.`;

    const payload = {
      fecha_documentacion_final_enviada:
        cierreData.fecha_documentacion_final_enviada || null,
      medio_envio_documentacion_final:
        cierreData.medio_envio_documentacion_final,
      observaciones_cierre: cierreData.observaciones_cierre,

      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalle,

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al marcar documentación final enviada:", error);
      alert(`No se pudo guardar el envío documental: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "documentacion_final_enviada",
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      titulo: "Documentación final enviada",
      detalle,
      userId,
    });

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTramiteData((prev) => ({
      ...prev,
      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalle,
    }));

    setCierreData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Documentación final enviada registrada correctamente.");
  } catch (err) {
    console.error("Error inesperado al marcar documentación final enviada:", err);
    alert("Ocurrió un error inesperado al guardar el envío documental.");
  } finally {
    setSavingCierreData(false);
  }
}

async function handleMarcarOriginalesEntregados() {
  if (savingCierreData) return;

  if (!cierreData.fecha_entrega_originales) {
    alert("Cargá la fecha de entrega de originales.");
    return;
  }

  if (!cierreData.persona_recibe_originales.trim()) {
    alert("Cargá quién recibe los originales.");
    return;
  }

  try {
    setSavingCierreData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const estadoNuevo = "Originales entregados";
    const now = new Date().toISOString();

    const detalle =
      cierreData.observaciones_cierre ||
      `Originales entregados a ${cierreData.persona_recibe_originales}.`;

    const payload = {
      fecha_entrega_originales: cierreData.fecha_entrega_originales || null,
      persona_recibe_originales: cierreData.persona_recibe_originales,
      observaciones_cierre: cierreData.observaciones_cierre,

      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalle,

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al marcar originales entregados:", error);
      alert(`No se pudo guardar la entrega de originales: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "originales_entregados",
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      titulo: "Originales entregados",
      detalle,
      userId,
    });

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTramiteData((prev) => ({
      ...prev,
      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalle,
    }));

    setCierreData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Entrega de originales registrada correctamente.");
  } catch (err) {
    console.error("Error inesperado al marcar originales entregados:", err);
    alert("Ocurrió un error inesperado al guardar la entrega de originales.");
  } finally {
    setSavingCierreData(false);
  }
}

async function handleCerrarLegajo() {
  if (savingCierreData) return;

  if (!cierreData.fecha_cierre_legajo) {
    alert("Cargá la fecha de cierre del legajo.");
    return;
  }

  try {
    setSavingCierreData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const estadoNuevo = "Cerrado";
    const now = new Date().toISOString();

    const detalle =
      cierreData.observaciones_cierre ||
      "Legajo cerrado por SAKI.";

    const payload = {
      fecha_cierre_legajo: cierreData.fecha_cierre_legajo || null,
      observaciones_cierre: cierreData.observaciones_cierre,

      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalle,

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al cerrar legajo:", error);
      alert(`No se pudo cerrar el legajo: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "legajo_cerrado",
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      titulo: "Legajo cerrado",
      detalle,
      userId,
    });

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTramiteData((prev) => ({
      ...prev,
      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalle,
    }));

    setCierreData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Legajo cerrado correctamente.");
  } catch (err) {
    console.error("Error inesperado al cerrar legajo:", err);
    alert("Ocurrió un error inesperado al cerrar el legajo.");
  } finally {
    setSavingCierreData(false);
  }
}

async function handleAnularLegajo() {
  if (savingCierreData) return;

  if (!cierreData.motivo_anulacion.trim()) {
    alert("Cargá el motivo de anulación del legajo.");
    return;
  }

  const confirmar = window.confirm(
    "¿Seguro querés anular este legajo? Esta acción dejará el trámite en estado Anulado."
  );

  if (!confirmar) return;

  try {
    setSavingCierreData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const estadoAnterior =
      legajo?.estado_tramite || legajo?.estado || "Trámite solicitado";

    const estadoNuevo = "Anulado";
    const now = new Date().toISOString();

    const detalle = cierreData.motivo_anulacion;

    const payload = {
      motivo_anulacion: cierreData.motivo_anulacion,
      observaciones_cierre: cierreData.observaciones_cierre,

      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalle,

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al anular legajo:", error);
      alert(`No se pudo anular el legajo: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "legajo_anulado",
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      titulo: "Legajo anulado",
      detalle,
      userId,
    });

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    setTramiteData((prev) => ({
      ...prev,
      estado_tramite: estadoNuevo,
      fecha_estado_tramite: now,
      observacion_estado_tramite: detalle,
    }));

    setCierreData((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Legajo anulado correctamente.");
  } catch (err) {
    console.error("Error inesperado al anular legajo:", err);
    alert("Ocurrió un error inesperado al anular el legajo.");
  } finally {
    setSavingCierreData(false);
  }
}

function handleNotaDataChange(event) {
  const { name, value, type, checked, tagName } = event.currentTarget;

  if (type === "checkbox") {
    setNotaData((prev) => ({
      ...prev,
      [name]: checked,
    }));
    return;
  }

  const keepOriginal = tagName === "SELECT";

  setNotaData((prev) => ({
    ...prev,
    [name]: keepOriginal ? value : value.toLocaleUpperCase("es-AR"),
  }));
}

async function handleGuardarNotaLegajo() {
  if (savingNota) return;

  if (!notaData.nota.trim()) {
    alert("Escribí una nota para guardar.");
    return;
  }

  try {
    setSavingNota(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const payload = {
      legajo_id: id,
      tipo_nota: notaData.tipo_nota,
      origen: "MANUAL",
      nota: notaData.nota,
      visible_para_productor: notaData.visible_para_productor,
      created_by: userId,
      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_notas")
      .insert(payload);

    if (error) {
      console.error("Error al guardar nota:", error);
      alert(`No se pudo guardar la nota: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "nota_agregada",
      titulo: "Nota agregada al legajo",
      detalle: notaData.nota,
      userId,
    });

    setNotaData({
      tipo_nota: "NOTA DEL LEGAJO",
      nota: "",
      visible_para_productor: true,
    });

    await cargarDetalle();

    alert("Nota guardada correctamente.");
  } catch (err) {
    console.error("Error inesperado al guardar nota:", err);
    alert("Ocurrió un error inesperado al guardar la nota.");
  } finally {
    setSavingNota(false);
  }
}

async function handleEliminarNotaLegajo(nota) {
  if (deletingNotaId) return;

  const confirmar = window.confirm(
    "¿Seguro querés eliminar esta nota del legajo?"
  );

  if (!confirmar) return;

  try {
    setDeletingNotaId(nota.id);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const { error } = await supabase
      .from("productores_notas")
      .delete()
      .eq("id", nota.id)
      .eq("legajo_id", id);

    if (error) {
      console.error("Error al eliminar nota:", error);
      alert(`No se pudo eliminar la nota: ${error.message}`);
      return;
    }

    await registrarTrazabilidad({
      tipo_movimiento: "nota_eliminada",
      titulo: "Nota eliminada del legajo",
      detalle: nota.nota || "Se eliminó una nota del legajo.",
      userId,
    });

    await cargarDetalle();

    alert("Nota eliminada correctamente.");
  } catch (err) {
    console.error("Error inesperado al eliminar nota:", err);
    alert("Ocurrió un error inesperado al eliminar la nota.");
  } finally {
    setDeletingNotaId(null);
  }
}

  function formatMoney(value) {
    const number = Number(value || 0);

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(number);
  }

function normalizarLugarPresentacion(value) {
  if (value === "Radicación") return "Registro de radicación actual";
  if (value === "Futura radicación") return "Registro de futura radicación";

  return value || "";
}

function formatLugarPresentacion(value) {
  return normalizarLugarPresentacion(value) || "No informado";
}

function getTramiteEstadoPillClass(estado) {
  const value = estado || "Trámite solicitado";

  if (
    value === "Observado" ||
    value === "Anulado"
  ) {
    return "danger";
  }

  if (
    value === "Inscripto / resultado favorable" ||
    value === "Documentación final enviada" ||
    value === "Originales entregados" ||
    value === "Cerrado"
  ) {
    return "success";
  }

  if (
    value === "Trámite solicitado" ||
    value === "Presupuestado" ||
    value === "Trámite complementario pendiente"
  ) {
    return "pending";
  }

  return "process";
}

function getTurnoEstadoPillClass(estado) {
  const value = estado || "Seleccionar";

  if (value === "Turno cancelado") {
    return "danger";
  }

  if (value === "Turno asignado") {
    return "success";
  }

  if (value === "Turno reprogramado") {
    return "pending";
  }

  return "process";
}

  function formatCategoriaPresupuesto(categoria) {
  const labels = {
    "ARANCELES / TRÁMITES REGISTRALES": "Aranceles / Trámites registrales",
    "ARANCELES / ESCRIBANÍA": "Aranceles / Escribanía",
    "FORMULARIOS / SOLICITUDES TIPO": "Formularios / Solicitudes tipo",
    "HONORARIOS SAKI": "Honorarios SAKI",
    "GASTOS ADMINISTRATIVOS / GESTIÓN": "Gastos administrativos / Gestión",
    "DEUDAS / REGULARIZACIÓN": "Deudas / Regularización",
    "SELLOS / IMPUESTOS": "Sellos / Impuestos",

    // Compatibilidad con categorías viejas ya cargadas
    Aranceles: "Aranceles",
    Formularios: "Formularios",
    Honorarios: "Honorarios",
    "Gastos adicionales": "Gastos adicionales",
    "Deudas / regularización": "Deudas / Regularización",
  };

  return labels[categoria] || categoria || "Sin categoría";
}

function handleCostoChange(event) {
  const { name, value, type, checked } = event.currentTarget;

  if (name === "categoria") {
    setNuevoCosto((prev) => ({
      ...prev,
      categoria: value,
      concepto: "",
    }));
    return;
  }

  const shouldUppercase = ["descripcion"].includes(name);

  setNuevoCosto((prev) => ({
    ...prev,
    [name]:
      type === "checkbox"
        ? checked
        : shouldUppercase
          ? value.toLocaleUpperCase("es-AR")
          : value,
  }));
}

function resetFormularioCosto() {
  setEditingCostId(null);

  setNuevoCosto({
    categoria: "ARANCELES / TRÁMITES REGISTRALES",
    concepto: "",
    descripcion: "",
    cantidad: 1,
    moneda: "ARS",
    importe_unitario: "",
    visible_para_productor: true,
  });
}

  function formatNumberInput(value) {
  const onlyNumbers = String(value || "").replace(/\D/g, "");

  if (!onlyNumbers) return "";

  return new Intl.NumberFormat("es-AR").format(Number(onlyNumbers));
}

function cleanNumberInput(value) {
  return Number(String(value || "").replace(/\./g, "").replace(/,/g, ".")) || 0;
}

async function actualizarTotalPresupuesto(userId = null) {
  const { data, error } = await supabase
    .from("productores_costos_conceptos")
    .select("importe_total")
    .eq("legajo_id", id);

  if (error) {
    console.error("Error al recalcular total del presupuesto:", error);
    throw error;
  }

  const totalPresupuesto = (data || []).reduce((acc, item) => {
    return acc + Number(item.importe_total || 0);
  }, 0);

  const { error: updateError } = await supabase
    .from("productores_legajos")
    .update({
      presupuesto_total: totalPresupuesto,
      updated_by: userId,
    })
    .eq("id", id);

  if (updateError) {
    console.error("Error al actualizar presupuesto_total:", updateError);
    throw updateError;
  }

  setLegajo((prev) => ({
    ...prev,
    presupuesto_total: totalPresupuesto,
  }));
}

function handleBaseDataChange(event) {
  const { name, value, tagName, type, checked } = event.currentTarget;

  if (type === "checkbox") {
  if (name === "contempla_futura_radicacion") {
    setBaseData((prev) => ({
      ...prev,
      contempla_futura_radicacion: checked,
      futura_radicacion: checked ? prev.futura_radicacion : "",
      registro_futura_radicacion: checked ? prev.registro_futura_radicacion : "",
      lugar_presentacion_tramite:
        !checked && prev.lugar_presentacion_tramite === "Registro de futura radicación"
          ? "Registro de radicación actual"
          : prev.lugar_presentacion_tramite,
    }));
    return;
  }

  setBaseData((prev) => ({
    ...prev,
    [name]: checked,
  }));
  return;
}

  const shouldKeepOriginalValue = tagName === "SELECT";

  setBaseData((prev) => ({
    ...prev,
    [name]: shouldKeepOriginalValue
      ? value
      : value.toLocaleUpperCase("es-AR"),
  }));
}

function handleBaseMoneyChange(event) {
  const { name, value } = event.currentTarget;

  setBaseData((prev) => ({
    ...prev,
    [name]: formatNumberInput(value),
  }));
}

async function handleGuardarBaseData() {
  if (savingBaseData) return;

  try {
    setSavingBaseData(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const payload = {
  radicacion_actual: baseData.radicacion_actual,
  registro_radicacion_actual: baseData.registro_radicacion_actual,
  contempla_futura_radicacion: baseData.contempla_futura_radicacion,
  futura_radicacion: baseData.contempla_futura_radicacion
    ? baseData.futura_radicacion
    : "",
  registro_futura_radicacion: baseData.contempla_futura_radicacion
    ? baseData.registro_futura_radicacion
    : "",
      lugar_presentacion_tramite: normalizarLugarPresentacion(baseData.lugar_presentacion_tramite),
      registro_interviniente_presupuesto:
        baseData.registro_interviniente_presupuesto,

      contempla_base_calculo: baseData.contempla_base_calculo,

valor_venta: baseData.contempla_base_calculo
  ? cleanNumberInput(baseData.valor_venta)
  : 0,
valor_tabla_dnrpa: baseData.contempla_base_calculo
  ? cleanNumberInput(baseData.valor_tabla_dnrpa)
  : 0,
valor_fiscal: baseData.contempla_base_calculo
  ? cleanNumberInput(baseData.valor_fiscal)
  : 0,
base_calculo_usada: baseData.contempla_base_calculo
  ? baseData.base_calculo_usada
  : "",
observacion_base_calculo: baseData.contempla_base_calculo
  ? baseData.observacion_base_calculo
  : "",

      updated_by: userId,
    };

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al guardar base de cálculo:", error);
      alert(`No se pudieron guardar los datos: ${error.message}`);
      return;
    }

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Datos registrales y base de cálculo guardados correctamente.");
  } finally {
    setSavingBaseData(false);
  }
}

async function handleGuardarEstadoPresupuesto() {
  if (savingPresupuestoEstado) return;

  try {
    setSavingPresupuestoEstado(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const now = new Date().toISOString();

    const payload = {
      presupuesto_estado: presupuestoEstado,
      updated_by: userId,
    };

    if (
      presupuestoEstado === "Presupuesto emitido" &&
      !legajo?.presupuesto_emitido_at
    ) {
      payload.presupuesto_emitido_at = now;
      payload.presupuesto_fecha_emision = now;
      payload.presupuesto_emitido_by = userId;
    }

    const { error } = await supabase
      .from("productores_legajos")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error al guardar estado del presupuesto:", error);
      alert(`No se pudo guardar el estado del presupuesto: ${error.message}`);
      return;
    }

    setLegajo((prev) => ({
      ...prev,
      ...payload,
    }));

    alert("Estado del presupuesto guardado correctamente.");
  } finally {
    setSavingPresupuestoEstado(false);
  }
}

  async function handleAgregarCosto() {
    if (savingCost) return;

    if (!nuevoCosto.concepto.trim()) {
      alert("Cargá el concepto del costo.");
      return;
    }

    try {
      setSavingCost(true);

      const cantidad = Number(nuevoCosto.cantidad || 1);
      const importeUnitario = Number(nuevoCosto.importe_unitario || 0);
      const importeTotal = cantidad * importeUnitario;

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;

            const { error } = await supabase
        .from("productores_costos_conceptos")
        .insert({
          legajo_id: id,
          categoria: nuevoCosto.categoria,
          concepto: nuevoCosto.concepto.toLocaleUpperCase("es-AR"),
          descripcion: nuevoCosto.descripcion.toLocaleUpperCase("es-AR"),
          cantidad,
          moneda: nuevoCosto.moneda,
          importe_unitario: importeUnitario,
          importe_total: importeTotal,
          visible_para_productor: nuevoCosto.visible_para_productor,
          estado: "Pendiente",
          orden: costos.length + 1,
          created_by: userId,
          updated_by: userId,
        });

      if (error) {
        console.error("Error al agregar costo:", error);
        alert(`No se pudo agregar el costo: ${error.message}`);
        return;
      }

      const totalActual = costos.reduce((acc, item) => {
        return acc + Number(item.importe_total || 0);
      }, 0);

      const nuevoTotalPresupuesto = totalActual + importeTotal;

      const { error: totalError } = await supabase
        .from("productores_legajos")
        .update({
          presupuesto_total: nuevoTotalPresupuesto,
          updated_by: userId,
        })
        .eq("id", id);

      if (totalError) {
        console.error("Error al actualizar total del presupuesto:", totalError);
        alert(
          `El concepto fue agregado, pero no se pudo actualizar el total del presupuesto: ${totalError.message}`
        );
        return;
      }

      setNuevoCosto({
        categoria: "ARANCELES / TRÁMITES REGISTRALES",
        concepto: "",
        descripcion: "",
        cantidad: 1,
        moneda: "ARS",
        importe_unitario: "",
        visible_para_productor: true,
      });

      await cargarDetalle();
    } finally {
      setSavingCost(false);
    }
  }

function normalizarCategoriaCostoParaEditar(categoria) {
  const equivalencias = {
    Aranceles: "ARANCELES / TRÁMITES REGISTRALES",
    Formularios: "FORMULARIOS / SOLICITUDES TIPO",
    Honorarios: "HONORARIOS SAKI",
    "Gastos adicionales": "GASTOS ADMINISTRATIVOS / GESTIÓN",
    "Deudas / regularización": "DEUDAS / REGULARIZACIÓN",
  };

  return equivalencias[categoria] || categoria || "ARANCELES / TRÁMITES REGISTRALES";
}

function handleEditarCosto(item) {
  const categoriaNormalizada = normalizarCategoriaCostoParaEditar(item.categoria);

  setEditingCostId(item.id);

  setNuevoCosto({
    categoria: categoriaNormalizada,
    concepto: item.concepto || "",
    descripcion: item.descripcion || "",
    cantidad: item.cantidad || 1,
    moneda: item.moneda || "ARS",
    importe_unitario: item.importe_unitario || "",
    visible_para_productor: Boolean(item.visible_para_productor),
  });
}

async function handleActualizarCosto() {
  if (savingCost || !editingCostId) return;

  if (!nuevoCosto.concepto.trim()) {
    alert("Cargá el concepto del costo.");
    return;
  }

  try {
    setSavingCost(true);

    const cantidad = Number(nuevoCosto.cantidad || 1);
    const importeUnitario = Number(nuevoCosto.importe_unitario || 0);
    const importeTotal = cantidad * importeUnitario;

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const { error } = await supabase
      .from("productores_costos_conceptos")
      .update({
        categoria: nuevoCosto.categoria,
        concepto: nuevoCosto.concepto.toLocaleUpperCase("es-AR"),
        descripcion: nuevoCosto.descripcion.toLocaleUpperCase("es-AR"),
        cantidad,
        moneda: nuevoCosto.moneda,
        importe_unitario: importeUnitario,
        importe_total: importeTotal,
        visible_para_productor: nuevoCosto.visible_para_productor,
        updated_by: userId,
      })
      .eq("id", editingCostId)
      .eq("legajo_id", id);

    if (error) {
      console.error("Error al actualizar concepto:", error);
      alert(`No se pudo actualizar el concepto: ${error.message}`);
      return;
    }

    await actualizarTotalPresupuesto(userId);

    resetFormularioCosto();
    await cargarDetalle();
  } finally {
    setSavingCost(false);
  }
}

async function handleEliminarCosto(item) {
  if (deletingCostId) return;

  const confirmar = window.confirm(
    `¿Seguro querés eliminar el concepto "${item.concepto}"? Esta acción no se puede deshacer.`
  );

  if (!confirmar) return;

  try {
    setDeletingCostId(item.id);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const { error } = await supabase
      .from("productores_costos_conceptos")
      .delete()
      .eq("id", item.id)
      .eq("legajo_id", id);

    if (error) {
      console.error("Error al eliminar concepto:", error);
      alert(`No se pudo eliminar el concepto: ${error.message}`);
      return;
    }

    await actualizarTotalPresupuesto(userId);

    if (editingCostId === item.id) {
      resetFormularioCosto();
    }

    await cargarDetalle();
  } finally {
    setDeletingCostId(null);
  }
}

  function handleImprimirPresupuesto() {
    window.print();
  }

  if (loading) {
    return (
      <main className="page">
        <section className="shell">
          <p className="loadingText">Cargando legajo...</p>
        </section>
      </main>
    );
  }

  if (!legajo) {
    return (
      <main className="page">
        <section className="shell">
          <p className="loadingText">No se encontró el legajo.</p>
        </section>
      </main>
    );
  }

  const clienteNombre =
    legajo.tipo_persona === "juridica"
      ? legajo.razon_social
      : `${legajo.apellido || ""} ${legajo.nombre || ""}`.trim();

      const porcentajeTitularPrincipal =
  Number(unidadData.titular_registral_porcentaje || 0) || 0;

const porcentajeCondominios = condominios.reduce((total, item) => {
  return total + Number(item.porcentaje_titularidad || 0);
}, 0);

const porcentajeTitularidadTotal =
  porcentajeTitularPrincipal + porcentajeCondominios;

const porcentajeTitularidadRestante = Math.max(
  0,
  100 - porcentajeTitularidadTotal
);

const debeCargarCondominios =
  porcentajeTitularPrincipal > 0 && porcentajeTitularPrincipal < 100;

  return (
    <main className="page">
      <section className="shell">
        <header className="topbar noPrint">
          <div>
            <div className="brand">SAKI</div>
            <div className="brandSub">Portal Empresas</div>
          </div>

          <Link href="/empresas/productores" className="backLink">
            <ArrowLeft size={16} />
            Workspace
          </Link>
        </header>

        <section className="legajoHeaderBlock noPrint">
  <div className="legajoHeaderText">
    <div className="eyebrow">GESTIÓN DEL LEGAJO</div>

    <h1 className="moduleTitle">
      Detalle del legajo
      <span className="moduleDivider">|</span>
      <span className="moduleSuffix">Productores</span>
    </h1>

    <p>
      Consulta y gestión integral del trámite, documentación, notas, trazabilidad y presupuesto.
    </p>
  </div>

  <div className="compactSummaryGrid">
    <div className="summaryCard">
      <span>Cliente / asegurado</span>
      <strong>{clienteNombre || "Sin completar"}</strong>
    </div>

    <div className="summaryCard">
      <span>Dominio</span>
      <strong>{legajo.dominio || "Sin dominio"}</strong>
    </div>

    <div className="summaryCard">
      <span>Trámite</span>
      <strong>{legajo.tipo_pedido || "Sin trámite"}</strong>
    </div>

    <div className="summaryCard">
      <span>Estado del trámite</span>
      <strong>{legajo.estado_tramite || "Trámite solicitado"}</strong>
    </div>
  </div>

  <section className="detailStepper" aria-label="Fichas del legajo">
    {DETALLE_TABS.map((tab, index) => {
      const isActive = activeTab === tab.key;

      return (
        <button
          key={tab.key}
          type="button"
          className={`detailStepCard ${index === 0 ? "first" : ""} ${
            index === DETALLE_TABS.length - 1 ? "last" : ""
          } ${isActive ? "active" : ""}`}
          style={{
            "--accent": tab.accent,
            "--card-bg": tab.gradient,
          }}
          onClick={() => setActiveTab(tab.key)}
        >
          <div className="detailStepNumber">{tab.number}</div>
          <div className="detailStepLabel">{tab.label}</div>
        </button>
      );
    })}
  </section>
</section>

{activeTab !== "costos" && (
  <section className="detailPanel">
    {activeTab === "cliente" && (
  <form className="formPanel" onSubmit={(event) => event.preventDefault()}>
    <div className="panelSlide">
      <div className="formHeader">
        <div
          className="formIcon"
          style={{
            color: "#38BDF8",
            borderColor: "#38BDF866",
            background: "#38BDF822",
          }}
        >
          <UserRound size={25} />
        </div>

        <div>
          <h2>Cliente / asegurado</h2>
          <p>Completá los datos del cliente o asegurado vinculado al trámite.</p>
        </div>
      </div>

      <div className="divider" />

      <div className="clienteGrid">
        <Field label="Tipo de persona" className="span2">
          <select
            name="tipo_persona"
            value={clienteData.tipo_persona}
            onChange={handleClienteDataChange}
          >
            <option value="humana">Persona humana</option>
            <option value="juridica">Persona jurídica</option>
          </select>
        </Field>

        <Field label="Condición" className="span2">
          <select
            name="condicion_cliente"
            value={clienteData.condicion_cliente}
            onChange={handleClienteDataChange}
          >
            <option value="">Seleccionar condición</option>
            <option value="Asegurado">Asegurado</option>
            <option value="Titular registral">Titular registral</option>
            <option value="Tercero">Tercero</option>
            <option value="Autorizado">Autorizado</option>
          </select>
        </Field>

        {clienteData.tipo_persona === "humana" && (
          <>
            <Field label="Apellido">
              <input
                name="apellido"
                value={clienteData.apellido}
                onChange={handleClienteDataChange}
                placeholder="Apellido"
              />
            </Field>

            <Field label="Nombre">
              <input
                name="nombre"
                value={clienteData.nombre}
                onChange={handleClienteDataChange}
                placeholder="Nombre"
              />
            </Field>

            <Field label="Tipo de documento">
              <select
                name="tipo_documento"
                value={clienteData.tipo_documento}
                onChange={handleClienteDataChange}
              >
                <option value="DNI">DNI</option>
<option value="LC">LC</option>
<option value="LE">LE</option>
              </select>
            </Field>

            <Field label="N° de documento">
              <input
                inputMode="numeric"
                name="numero_documento"
                value={clienteData.numero_documento}
                onChange={handleClienteDocumentoChange}
                placeholder={
                  clienteData.tipo_documento === "DNI"
                    ? "12.345.678"
                    : "20-12345678-4"
                }
              />
            </Field>

            <Field label="CUIL / CUIT">
  <input
    inputMode="numeric"
    name="cliente_cuil_cuit"
    value={clienteData.cliente_cuil_cuit}
    onChange={handleClienteCuilCuitChange}
    placeholder="20-12345678-4"
  />
</Field>
          </>
        )}

        {clienteData.tipo_persona === "juridica" && (
          <>
            <Field label="Razón social" className="span3">
              <input
                name="razon_social"
                value={clienteData.razon_social}
                onChange={handleClienteDataChange}
                placeholder="Razón social"
              />
            </Field>

            <Field label="CUIT">
              <input
                inputMode="numeric"
                name="numero_documento"
                value={clienteData.numero_documento}
                onChange={handleClienteDocumentoChange}
                placeholder="30-12345678-9"
              />
            </Field>
          </>
        )}

        <Field label="Domicilio" className="span2">
          <input
            name="domicilio"
            value={clienteData.domicilio}
            onChange={handleClienteDataChange}
            placeholder="Calle, número, piso, depto."
          />
        </Field>

        <Field label="Localidad">
          <input
            name="localidad"
            value={clienteData.localidad}
            onChange={handleClienteDataChange}
            placeholder="Localidad"
          />
        </Field>

        <Field label="Provincia">
          <input
            name="provincia"
            value={clienteData.provincia}
            onChange={handleClienteDataChange}
            placeholder="Provincia"
          />
        </Field>

        <Field label="Código postal">
          <input
            name="codigo_postal"
            value={clienteData.codigo_postal}
            onChange={handleClienteDataChange}
            placeholder="CP"
          />
        </Field>

        <Field label="Email" className="span2">
          <input
            type="email"
            name="email"
            value={clienteData.email}
            onChange={handleClienteDataChange}
            placeholder="Ej.: nombre@empresa.com"
          />
        </Field>

        <Field label="Teléfono" className="span2">
          <input
            name="telefono"
            value={clienteData.telefono}
            onChange={handleClienteDataChange}
            placeholder="Ej.: 11 1234 5678"
          />
        </Field>
      </div>

      <div className="actions">
        <div />

        <div className="rightActions">
          <button
            type="button"
            className="primaryButton"
            onClick={handleGuardarClienteData}
            disabled={savingClienteData}
          >
            {savingClienteData ? "Guardando..." : "Guardar datos del cliente"}
          </button>
        </div>
      </div>
    </div>
  </form>
)}

{activeTab === "unidad" && (
  <form className="formPanel" onSubmit={(event) => event.preventDefault()}>
    <div className="panelSlide">
      <div className="formHeader">
        <div
          className="formIcon"
          style={{
            color: "#22D3EE",
            borderColor: "#22D3EE66",
            background: "#22D3EE22",
          }}
        >
          <Car size={25} />
        </div>

        <div>
          <h2>Dominio / Titular de dominio</h2>
          <p>Completá los datos registrales de la unidad y su titularidad.</p>
        </div>
      </div>

      <div className="divider" />

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>Datos del Dominio</h3>
          <p>Información técnica y registral del auto, moto o unidad vinculada al trámite.</p>
        </div>

        <div className="clienteGrid">
          <Field label="Dominio">
            <input
              name="dominio"
              value={unidadData.dominio}
              onChange={handleUnidadDataChange}
              placeholder="AB123CD"
            />
          </Field>

          <Field label="Tipo de unidad">
            <select
              name="tipo_unidad"
              value={unidadData.tipo_unidad}
              onChange={handleUnidadDataChange}
            >
              <option value="">Seleccionar tipo</option>
              <option value="AUTOMOTOR">Automotor</option>
              <option value="MOTOVEHÍCULO">Motovehículo</option>
              <option value="MAQUINARIA">Maquinaria</option>
              <option value="NO APLICA">No aplica</option>
            </select>
          </Field>

          <Field label="Marca">
            <input
              name="marca"
              value={unidadData.marca}
              onChange={handleUnidadDataChange}
              placeholder="TOYOTA"
            />
          </Field>

          <Field label="Modelo">
            <input
              name="modelo"
              value={unidadData.modelo}
              onChange={handleUnidadDataChange}
              placeholder="COROLLA"
            />
          </Field>

          <Field label="Modelo año">
            <input
              name="modelo_anio"
              value={unidadData.modelo_anio}
              onChange={handleUnidadDataChange}
              placeholder="2024"
            />
          </Field>

          <Field label="Tipo de vehículo">
            <input
              name="tipo_vehiculo"
              value={unidadData.tipo_vehiculo}
              onChange={handleUnidadDataChange}
              placeholder="SEDÁN / PICK-UP / MOTO"
            />
          </Field>

          <Field label="Marca motor">
            <input
              name="marca_motor"
              value={unidadData.marca_motor}
              onChange={handleUnidadDataChange}
              placeholder="Marca motor"
            />
          </Field>

          <Field label="N° motor">
            <input
              name="numero_motor"
              value={unidadData.numero_motor}
              onChange={handleUnidadDataChange}
              placeholder="Número de motor"
            />
          </Field>

          <Field label="Marca chasis / cuadro">
            <input
              name="marca_chasis_cuadro"
              value={unidadData.marca_chasis_cuadro}
              onChange={handleUnidadDataChange}
              placeholder="Marca chasis / cuadro"
            />
          </Field>

          <Field label="N° chasis / cuadro">
            <input
              name="numero_chasis_cuadro"
              value={unidadData.numero_chasis_cuadro}
              onChange={handleUnidadDataChange}
              placeholder="Número de chasis / cuadro"
            />
          </Field>

          <Field label="Radicación">
            <input
              name="radicacion_unidad"
              value={unidadData.radicacion_unidad}
              onChange={handleUnidadDataChange}
              placeholder="CABA / PBA / CÓRDOBA"
            />
          </Field>

          <Field label="Registro interviniente">
            <input
              name="registro_interviniente_unidad"
              value={unidadData.registro_interviniente_unidad}
              onChange={handleUnidadDataChange}
              placeholder="REGISTRO SECCIONAL"
            />
          </Field>

<div className="observacionesDominioField">
  <Field label="Observaciones registrales">
    <textarea
      className="textareaWide"
      name="observaciones_registrales_unidad"
      value={unidadData.observaciones_registrales_unidad}
      onChange={handleUnidadDataChange}
      placeholder="Observaciones técnicas o registrales de la unidad..."
    />
  </Field>
</div>
        </div>
      </section>

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>Titular Registral</h3>
          <p>Datos del titular registral, estado civil, cónyuge y porcentaje de titularidad.</p>
        </div>

        <label className="checkLine full">
          <input
            type="checkbox"
            name="titular_registral_coincide"
            checked={unidadData.titular_registral_coincide}
            onChange={handleUnidadDataChange}
          />
          El titular registral coincide con el cliente / asegurado
        </label>

        {unidadData.titular_registral_coincide && (
  <div className="titularResumenBox">
    <div className="titularResumenHeader">
      <span>Datos Titular Registral</span>

      <button
        type="button"
        className="secondaryButton"
        onClick={() => setActiveTab("cliente")}
      >
        Editar datos del cliente
      </button>
    </div>

    <div className="clienteGrid titularDatosClienteGrid">
      <Field label="Tipo de persona">
        <input
          readOnly
          value={
            clienteData.tipo_persona === "juridica"
              ? "Persona jurídica"
              : "Persona humana"
          }
        />
      </Field>

      <Field
        label={
          clienteData.tipo_persona === "juridica"
            ? "Razón social"
            : "Apellido"
        }
      >
        <input
          readOnly
          value={
            clienteData.tipo_persona === "juridica"
              ? clienteData.razon_social || ""
              : clienteData.apellido || ""
          }
        />
      </Field>

      <Field label="Nombre">
        <input
          readOnly
          value={
            clienteData.tipo_persona === "juridica"
              ? "NO APLICA"
              : clienteData.nombre || ""
          }
        />
      </Field>

      <Field label="Tipo de documento">
        <input
          readOnly
          value={
            clienteData.tipo_persona === "juridica"
              ? "CUIT"
              : clienteData.tipo_documento || "DNI"
          }
        />
      </Field>

      <Field label="N° de documento">
        <input readOnly value={clienteData.numero_documento || ""} />
      </Field>

      <Field label="CUIL / CUIT">
  <input
    readOnly
    value={
      clienteData.tipo_persona === "juridica"
        ? clienteData.numero_documento || ""
        : clienteData.cliente_cuil_cuit || ""
    }
  />
</Field>

      <Field label="Domicilio">
        <input readOnly value={clienteData.domicilio || ""} />
      </Field>

      <Field label="Localidad">
        <input readOnly value={clienteData.localidad || ""} />
      </Field>

      <Field label="Provincia">
        <input readOnly value={clienteData.provincia || ""} />
      </Field>

      <Field label="Código postal">
        <input readOnly value={clienteData.codigo_postal || ""} />
      </Field>

      <Field label="Email">
        <input readOnly value={clienteData.email || ""} />
      </Field>

      <Field label="Teléfono">
        <input readOnly value={clienteData.telefono || ""} />
      </Field>
    </div>

  <div className="titularDatosPropios">

        <div className="clienteGrid titularDatosPropiosGrid">
        <Field label="Estado civil">
          <select
            name="titular_registral_estado_civil"
            value={unidadData.titular_registral_estado_civil}
            onChange={handleUnidadDataChange}
            disabled={clienteData.tipo_persona === "juridica"}
          >
            <option value="">Seleccionar</option>
            <option value="SOLTERO/A">Soltero/a</option>
            <option value="CASADO/A">Casado/a</option>
            <option value="DIVORCIADO/A">Divorciado/a</option>
            <option value="VIUDO/A">Viudo/a</option>
            <option value="NO APLICA">No aplica</option>
          </select>
        </Field>

        <Field label="% titularidad">
          <input
            type="number"
            min="0"
            max="100"
            name="titular_registral_porcentaje"
            value={unidadData.titular_registral_porcentaje}
            onChange={handleUnidadDataChange}
            placeholder="100"
          />
        </Field>

        <Field label="Tipo de bien">
          <select
            name="titular_registral_tipo_bien"
            value={unidadData.titular_registral_tipo_bien}
            onChange={handleUnidadDataChange}
          >
            <option value="">Seleccionar</option>
            <option value="PROPIO">Propio</option>
            <option value="GANANCIAL">Ganancial</option>
          </select>
        </Field>
      </div>
    </div>
  </div>
)}

{!unidadData.titular_registral_coincide && (
  <div className="titularRegistralGrid">
    <div className="titularLine titularLine4">
      <Field label="Tipo de Persona">
        <select
          name="titular_registral_tipo_persona"
          value={unidadData.titular_registral_tipo_persona}
          onChange={handleUnidadDataChange}
        >
          <option value="humana">Persona humana</option>
          <option value="juridica">Persona jurídica</option>
        </select>
      </Field>

      {unidadData.titular_registral_tipo_persona === "humana" && (
        <>
          <Field label="Apellido">
            <input
              name="titular_registral_apellido"
              value={unidadData.titular_registral_apellido}
              onChange={handleUnidadDataChange}
              placeholder="Apellido"
            />
          </Field>

          <Field label="Nombre">
            <input
              name="titular_registral_nombre"
              value={unidadData.titular_registral_nombre}
              onChange={handleUnidadDataChange}
              placeholder="Nombre"
            />
          </Field>

          <Field label="Tipo de documento">
            <select
              name="titular_registral_tipo_documento"
              value={unidadData.titular_registral_tipo_documento}
              onChange={handleUnidadDataChange}
            >
              <option value="DNI">DNI</option>
<option value="LC">LC</option>
<option value="LE">LE</option>
            </select>
          </Field>
        </>
      )}

      {unidadData.titular_registral_tipo_persona === "juridica" && (
        <>
          <Field label="Razón social">
            <input
              name="titular_registral_razon_social"
              value={unidadData.titular_registral_razon_social}
              onChange={handleUnidadDataChange}
              placeholder="Razón social"
            />
          </Field>

          <Field label="Tipo de documento">
            <input value="CUIT" readOnly />
          </Field>
        </>
      )}
    </div>

    <div className="titularLine titularLine3">
      <Field label="N° de documento">
        <input
          inputMode="numeric"
          name="titular_registral_numero_documento"
          value={unidadData.titular_registral_numero_documento}
          onChange={handleUnidadDocumentoChange}
          placeholder={
  unidadData.titular_registral_tipo_persona === "juridica"
    ? "30-12345678-9"
    : "12.345.678"
}
        />
      </Field>

      <Field label="CUIL / CUIT">
        <input
          inputMode="numeric"
          name="titular_registral_cuil_cuit"
          value={unidadData.titular_registral_cuil_cuit}
          onChange={handleUnidadDocumentoChange}
          placeholder="20-12345678-4"
        />
      </Field>

      <Field label="Estado civil">
        <select
          name="titular_registral_estado_civil"
          value={unidadData.titular_registral_estado_civil}
          onChange={handleUnidadDataChange}
          disabled={unidadData.titular_registral_tipo_persona === "juridica"}
        >
          <option value="">Seleccionar</option>
          <option value="SOLTERO/A">Soltero/a</option>
          <option value="CASADO/A">Casado/a</option>
          <option value="DIVORCIADO/A">Divorciado/a</option>
          <option value="VIUDO/A">Viudo/a</option>
          <option value="NO APLICA">No aplica</option>
        </select>
      </Field>
    </div>

    <div className="titularLine titularLine3">
      <Field label="Domicilio">
        <input
          name="titular_registral_domicilio"
          value={unidadData.titular_registral_domicilio}
          onChange={handleUnidadDataChange}
          placeholder="Calle, número, piso, depto."
        />
      </Field>

      <Field label="Localidad">
  <input
    name="titular_registral_localidad"
    value={unidadData.titular_registral_localidad}
    onChange={handleUnidadDataChange}
    placeholder="Localidad"
  />
</Field>

<Field label="Provincia">
  <input
    name="titular_registral_provincia"
    value={unidadData.titular_registral_provincia}
    onChange={handleUnidadDataChange}
    placeholder="Provincia"
  />
</Field>

<Field label="Código postal">
  <input
    name="titular_registral_codigo_postal"
    value={unidadData.titular_registral_codigo_postal}
    onChange={handleUnidadDataChange}
    placeholder="CP"
  />
</Field>

      <Field label="Email">
        <input
          type="email"
          name="titular_registral_email"
          value={unidadData.titular_registral_email}
          onChange={handleUnidadDataChange}
          placeholder="Ej.: nombre@empresa.com"
        />
      </Field>

      <Field label="Teléfono">
        <input
          name="titular_registral_telefono"
          value={unidadData.titular_registral_telefono}
          onChange={handleUnidadDataChange}
          placeholder="Ej.: 11 1234 5678"
        />
      </Field>
    </div>

    <div className="titularLine titularLine2">
      <Field label="% titularidad">
        <input
          type="number"
          min="0"
          max="100"
          name="titular_registral_porcentaje"
          value={unidadData.titular_registral_porcentaje}
          onChange={handleUnidadDataChange}
          placeholder="100"
        />
      </Field>

      <Field label="Tipo de bien">
        <select
          name="titular_registral_tipo_bien"
          value={unidadData.titular_registral_tipo_bien}
          onChange={handleUnidadDataChange}
        >
          <option value="">Seleccionar</option>
          <option value="PROPIO">Propio</option>
          <option value="GANANCIAL">Ganancial</option>
        </select>
      </Field>
    </div>
  </div>
)}

        {unidadData.titular_registral_estado_civil === "CASADO/A" && (
          <div className="clienteGrid conyugeGrid">
            <Field label="Apellido cónyuge">
              <input
                name="titular_registral_conyuge_apellido"
                value={unidadData.titular_registral_conyuge_apellido}
                onChange={handleUnidadDataChange}
                placeholder="Apellido"
              />
            </Field>

            <Field label="Nombre cónyuge">
              <input
                name="titular_registral_conyuge_nombre"
                value={unidadData.titular_registral_conyuge_nombre}
                onChange={handleUnidadDataChange}
                placeholder="Nombre"
              />
            </Field>

            <Field label="DNI cónyuge">
              <input
                inputMode="numeric"
                name="titular_registral_conyuge_dni"
                value={unidadData.titular_registral_conyuge_dni}
                onChange={handleUnidadDocumentoChange}
                placeholder="12.345.678"
              />
            </Field>

            <Field label="CUIL / CUIT cónyuge">
              <input
                inputMode="numeric"
                name="titular_registral_conyuge_cuil_cuit"
                value={unidadData.titular_registral_conyuge_cuil_cuit}
                onChange={handleUnidadDocumentoChange}
                placeholder="20-12345678-4"
              />
            </Field>
          </div>
        )}
        {debeCargarCondominios && (
  <section id="condominios-block" className="condominiosBox">
    <div className="subsectionHeader">
      <h3>Condominios</h3>
      <p>
        Como la titularidad principal es menor al 100%, cargá los condóminos
        hasta completar la titularidad registral.
      </p>
    </div>

    <div className="titularidadResumenGrid">
      <div>
        <span>Titular principal</span>
        <strong>{porcentajeTitularPrincipal}%</strong>
      </div>

      <div>
        <span>Condominios cargados</span>
        <strong>{porcentajeCondominios}%</strong>
      </div>

      <div>
        <span>Total cargado</span>
        <strong>{porcentajeTitularidadTotal}%</strong>
      </div>

      <div className={porcentajeTitularidadRestante === 0 ? "ok" : "pending"}>
        <span>Resta cargar</span>
        <strong>{porcentajeTitularidadRestante}%</strong>
      </div>
    </div>

    {condominios.length > 0 && (
  <div className="condominiosList">
    {condominios.map((item) => {
      const nombreCondominio =
        item.tipo_persona === "juridica"
          ? item.razon_social
          : `${item.apellido || ""} ${item.nombre || ""}`.trim();

      const estaAbierto = condominioAbiertoId === item.id;

      return (
        <div key={item.id} className="condominioItem">
          <button
            type="button"
            className="condominioRowButton"
            onClick={() =>
              setCondominioAbiertoId((prev) =>
                prev === item.id ? null : item.id
              )
            }
          >
            <div>
              <strong>{nombreCondominio || "Sin nombre"}</strong>
              <span>
                {item.tipo_documento || "DNI"}{" "}
                {item.numero_documento || "Sin documento"} ·{" "}
                {item.porcentaje_titularidad || 0}% ·{" "}
                {item.tipo_bien || "Tipo de bien sin cargar"}
              </span>
            </div>

            <em>{estaAbierto ? "Ocultar" : "Ver detalle"}</em>
          </button>

          <button
            type="button"
            className="tableDangerButton"
            onClick={() => handleEliminarCondominio(item)}
          >
            Eliminar
          </button>

          {estaAbierto && (
            <div className="condominioDetalle">
              <div>
                <span>Tipo de persona</span>
                <strong>
                  {item.tipo_persona === "juridica"
                    ? "Persona jurídica"
                    : "Persona humana"}
                </strong>
              </div>

              <div>
                <span>Tipo documento</span>
                <strong>{item.tipo_documento || "DNI"}</strong>
              </div>

              <div>
                <span>N° documento</span>
                <strong>{item.numero_documento || "Sin cargar"}</strong>
              </div>

              <div>
                <span>CUIL / CUIT</span>
                <strong>{item.cuil_cuit || "Sin cargar"}</strong>
              </div>

              <div>
                <span>Domicilio</span>
                <strong>{item.domicilio || "Sin cargar"}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{item.email || "Sin cargar"}</strong>
              </div>

              <div>
                <span>Teléfono</span>
                <strong>{item.telefono || "Sin cargar"}</strong>
              </div>

              <div>
                <span>Estado civil</span>
                <strong>{item.estado_civil || "Sin cargar"}</strong>
              </div>

              <div>
                <span>% titularidad</span>
                <strong>{item.porcentaje_titularidad || 0}%</strong>
              </div>

              <div>
                <span>Tipo de bien</span>
                <strong>{item.tipo_bien || "Sin cargar"}</strong>
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
)}

    {porcentajeTitularidadRestante > 0 && (
      <div className="clienteGrid condominioFormGrid">
        <Field label="Tipo de persona" className="span2">
          <select
            name="tipo_persona"
            value={nuevoCondominio.tipo_persona}
            onChange={handleNuevoCondominioChange}
          >
            <option value="humana">Persona humana</option>
            <option value="juridica">Persona jurídica</option>
          </select>
        </Field>

        {nuevoCondominio.tipo_persona === "humana" && (
          <>
            <Field label="Apellido">
              <input
                name="apellido"
                value={nuevoCondominio.apellido}
                onChange={handleNuevoCondominioChange}
                placeholder="Apellido"
              />
            </Field>

            <Field label="Nombre">
              <input
                name="nombre"
                value={nuevoCondominio.nombre}
                onChange={handleNuevoCondominioChange}
                placeholder="Nombre"
              />
            </Field>

            <Field label="Tipo de documento">
              <select
                name="tipo_documento"
                value={nuevoCondominio.tipo_documento}
                onChange={handleNuevoCondominioChange}
              >
                <option value="DNI">DNI</option>
<option value="LC">LC</option>
<option value="LE">LE</option>
              </select>
            </Field>

            <Field label="N° de documento">
              <input
                inputMode="numeric"
                name="numero_documento"
                value={nuevoCondominio.numero_documento}
                onChange={handleNuevoCondominioDocumentoChange}
                placeholder={
  nuevoCondominio.tipo_persona === "juridica"
    ? "30-12345678-9"
    : "12.345.678"
}
              />
            </Field>

            <Field label="CUIL / CUIT">
              <input
                inputMode="numeric"
                name="cuil_cuit"
                value={nuevoCondominio.cuil_cuit}
                onChange={handleNuevoCondominioDocumentoChange}
                placeholder="20-12345678-4"
              />
            </Field>
          </>
        )}

        {nuevoCondominio.tipo_persona === "juridica" && (
          <>
            <Field label="Razón social" className="span3">
              <input
                name="razon_social"
                value={nuevoCondominio.razon_social}
                onChange={handleNuevoCondominioChange}
                placeholder="Razón social"
              />
            </Field>

            <Field label="CUIT">
              <input
                inputMode="numeric"
                name="numero_documento"
                value={nuevoCondominio.numero_documento}
                onChange={handleNuevoCondominioDocumentoChange}
                placeholder="30-12345678-9"
              />
            </Field>
          </>
        )}

        <Field label="Domicilio" className="span2">
          <input
            name="domicilio"
            value={nuevoCondominio.domicilio}
            onChange={handleNuevoCondominioChange}
            placeholder="Calle, número, piso, depto."
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            name="email"
            value={nuevoCondominio.email}
            onChange={handleNuevoCondominioChange}
            placeholder="Ej.: nombre@empresa.com"
          />
        </Field>

        <Field label="Teléfono">
          <input
            name="telefono"
            value={nuevoCondominio.telefono}
            onChange={handleNuevoCondominioChange}
            placeholder="Ej.: 11 1234 5678"
          />
        </Field>

        {nuevoCondominio.tipo_persona === "humana" && (
          <>
            <Field label="Estado civil">
              <select
                name="estado_civil"
                value={nuevoCondominio.estado_civil}
                onChange={handleNuevoCondominioChange}
              >
                <option value="">Seleccionar</option>
                <option value="SOLTERO/A">Soltero/a</option>
                <option value="CASADO/A">Casado/a</option>
                <option value="DIVORCIADO/A">Divorciado/a</option>
                <option value="VIUDO/A">Viudo/a</option>
                <option value="NO APLICA">No aplica</option>
              </select>
            </Field>

            <Field label="% titularidad">
              <input
                type="number"
                min="0"
                max={porcentajeTitularidadRestante}
                name="porcentaje_titularidad"
                value={nuevoCondominio.porcentaje_titularidad}
                onChange={handleNuevoCondominioChange}
                placeholder={String(porcentajeTitularidadRestante)}
              />
            </Field>
          </>
        )}

        {nuevoCondominio.tipo_persona === "juridica" && (
          <Field label="% titularidad">
            <input
              type="number"
              min="0"
              max={porcentajeTitularidadRestante}
              name="porcentaje_titularidad"
              value={nuevoCondominio.porcentaje_titularidad}
              onChange={handleNuevoCondominioChange}
              placeholder={String(porcentajeTitularidadRestante)}
            />
          </Field>
        )}

        {nuevoCondominio.estado_civil === "CASADO/A" && (
          <>
            <Field label="Apellido cónyuge">
              <input
                name="conyuge_apellido"
                value={nuevoCondominio.conyuge_apellido}
                onChange={handleNuevoCondominioChange}
                placeholder="Apellido"
              />
            </Field>

            <Field label="Nombre cónyuge">
              <input
                name="conyuge_nombre"
                value={nuevoCondominio.conyuge_nombre}
                onChange={handleNuevoCondominioChange}
                placeholder="Nombre"
              />
            </Field>

            <Field label="DNI cónyuge">
              <input
                inputMode="numeric"
                name="conyuge_dni"
                value={nuevoCondominio.conyuge_dni}
                onChange={handleNuevoCondominioDocumentoChange}
                placeholder="12.345.678"
              />
            </Field>

            <Field label="CUIL / CUIT cónyuge">
              <input
                inputMode="numeric"
                name="conyuge_cuil_cuit"
                value={nuevoCondominio.conyuge_cuil_cuit}
                onChange={handleNuevoCondominioDocumentoChange}
                placeholder="20-12345678-4"
              />
            </Field>
          </>
        )}

        <div className="condominioActions">
          <button
            type="button"
            className="secondaryButton"
            onClick={resetNuevoCondominio}
          >
            Limpiar condómino
          </button>

          <button
            type="button"
            className="primaryButton"
            onClick={handleAgregarCondominio}
          >
            Agregar condómino
          </button>
        </div>
      </div>
    )}

    {porcentajeTitularidadRestante === 0 && (
      <div className="titularidadOk">
        Titularidad completa: 100%.
      </div>
    )}
  </section>
)}
      </section>

      <div className="actions">
        <div />

        <div className="rightActions">
          <button
            type="button"
            className="primaryButton"
            onClick={handleGuardarUnidadData}
            disabled={savingUnidadData}
          >
            {savingUnidadData ? "Guardando..." : "Guardar datos de la unidad"}
          </button>
        </div>
      </div>
    </div>
  </form>
)}

    {activeTab === "tramite" && (
  <form className="formPanel" onSubmit={(event) => event.preventDefault()}>
    <div className="panelSlide">
      <div className="formHeader">
        <div
          className="formIcon"
          style={{
            color: "#7DD3FC",
            borderColor: "#7DD3FC66",
            background: "#7DD3FC22",
          }}
        >
          <ClipboardList size={25} />
        </div>

        <div className="formHeaderText">
  <div className="formTitleLine">
    <h2>Trámite</h2>

    <span
      className={`estadoTramitePill ${getTramiteEstadoPillClass(
        tramiteData.estado_tramite
      )}`}
    >
      {(tramiteData.estado_tramite || "Trámite solicitado").toUpperCase()}
    </span>
  </div>

  <p>Gestioná los datos principales del pedido y su avance operativo.</p>
</div>
      </div>

      <div className="divider" />

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>DATOS DEL PEDIDO</h3>
          <p>
            Información cargada al iniciar el trámite. SAKI puede corregirla o completarla.
          </p>
        </div>

        <div className="clienteGrid">
          <Field label="Tipo de trámite / pedido" className="span2">
            <input
              name="tipo_pedido"
              value={tramiteData.tipo_pedido}
              onChange={handleTramiteDataChange}
              placeholder="Ej.: TRANSFERENCIA / DENUNCIA DE ROBO / BAJA"
            />
          </Field>

          <Field label="Prioridad">
            <select
              name="prioridad"
              value={tramiteData.prioridad}
              onChange={handleTramiteDataChange}
            >
              <option value="">Seleccionar</option>
              <option value="NORMAL">Normal</option>
              <option value="URGENTE">Urgente</option>
              <option value="ALTA">Alta</option>
            </select>
          </Field>

          <Field label="Fecha del pedido">
            <input
              type="date"
              name="fecha_pedido"
              value={tramiteData.fecha_pedido || ""}
              onChange={handleTramiteDataChange}
            />
          </Field>

        </div>
      </section>

            <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>SEGURO / SINIESTRO</h3>
          <p>
            Datos vinculados a la compañía aseguradora, póliza y siniestro informado.
          </p>
        </div>

        <div className="clienteGrid">
          <Field label="Compañía aseguradora" className="span2">
            <input
              name="compania_aseguradora"
              value={tramiteData.compania_aseguradora}
              onChange={handleTramiteDataChange}
              placeholder="Compañía aseguradora"
            />
          </Field>

          <Field label="N° de póliza">
            <input
              name="numero_poliza"
              value={tramiteData.numero_poliza}
              onChange={handleTramiteDataChange}
              placeholder="N° de póliza"
            />
          </Field>

          <Field label="N° de siniestro">
            <input
              name="numero_siniestro"
              value={tramiteData.numero_siniestro}
              onChange={handleTramiteDataChange}
              placeholder="N° de siniestro"
            />
          </Field>

          <Field label="Tipo de siniestro">
            <input
              name="tipo_siniestro"
              value={tramiteData.tipo_siniestro}
              onChange={handleTramiteDataChange}
              placeholder="ROBO / HURTO / DESTRUCCIÓN / OTRO"
            />
          </Field>

          <Field label="Fecha del siniestro">
            <input
              type="date"
              name="fecha_siniestro"
              value={tramiteData.fecha_siniestro || ""}
              onChange={handleTramiteDataChange}
            />
          </Field>

          <Field label="Lugar del hecho" className="span2">
            <input
              name="lugar_hecho"
              value={tramiteData.lugar_hecho}
              onChange={handleTramiteDataChange}
              placeholder="Lugar del hecho"
            />
          </Field>
        </div>
      </section>

            <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>DETALLE / NOTAS INICIALES DEL PEDIDO</h3>
          <p>
            Aclaraciones operativas, observaciones iniciales o información que SAKI deba tener en cuenta.
          </p>
        </div>

        <div className="clienteGrid">
          <div className="detallePedidoWide">
  <Field label="Detalle del pedido">
    <textarea
      className="textareaWide"
      name="detalle_pedido"
      value={tramiteData.detalle_pedido}
      onChange={handleTramiteDataChange}
      placeholder="Detalle del pedido, aclaraciones operativas o información que SAKI deba tener en cuenta."
    />
  </Field>
</div>
        </div>
      </section>

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>ESTADO OPERATIVO</h3>
          <p>
            El estado indica dónde está parado hoy el legajo. La trazabilidad guarda la historia fechada de movimientos.
          </p>
        </div>

        <div className="clienteGrid">
          <Field label="Estado actual" className="span2">
            <select
              name="estado_tramite"
              value={tramiteData.estado_tramite}
              onChange={handleTramiteDataChange}
            >
              {TRAMITE_ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Fecha del último estado">
            <input
              readOnly
              value={
                tramiteData.fecha_estado_tramite
                  ? new Date(tramiteData.fecha_estado_tramite).toLocaleDateString("es-AR")
                  : "Sin registrar"
              }
            />
          </Field>

          <div className="estadoObservacionWide">
  <CollapsibleTextarea
    title="Observación interna del estado"
    name="observacion_estado_tramite"
    value={tramiteData.observacion_estado_tramite}
    onChange={handleTramiteDataChange}
    placeholder="Agregá una observación interna sobre el estado actual o el cambio realizado."
  />
</div>
        </div>
      </section>

            <section className="formSubsection">
        <div className="subsectionHeader turnoHeader">
  <div>
    <h3>TURNO REGISTRO</h3>
    <p>
      Cargá los datos del turno asignado, la documentación que debe presentarse y los importes a abonar.
    </p>
  </div>

  <select
    name="turno_estado"
    value={turnoData.turno_estado}
    onChange={handleTurnoDataChange}
    className={`turnoEstadoPill ${getTurnoEstadoPillClass(
      turnoData.turno_estado
    )}`}
  >
    <option value="">Seleccionar</option>
    <option value="Turno cargado">Turno cargado</option>
    <option value="Turno asignado">Turno asignado</option>
    <option value="Turno reprogramado">Turno reprogramado</option>
    <option value="Turno cancelado">Turno cancelado</option>
  </select>
</div>

        <div className="clienteGrid">
          <Field label="Fecha del turno">
            <input
              type="date"
              name="turno_fecha"
              value={turnoData.turno_fecha || ""}
              onChange={handleTurnoDataChange}
            />
          </Field>

          <Field label="Hora del turno">
            <input
              type="time"
              name="turno_hora"
              value={turnoData.turno_hora || ""}
              onChange={handleTurnoDataChange}
            />
          </Field>

          <Field label="Registro / lugar de presentación" className="span2">
            <input
              name="turno_registro"
              value={turnoData.turno_registro}
              onChange={handleTurnoDataChange}
              placeholder="REGISTRO SECCIONAL / ORGANISMO"
            />
          </Field>

          <Field label="Dirección del Registro" className="span2">
            <input
              name="turno_direccion"
              value={turnoData.turno_direccion}
              onChange={handleTurnoDataChange}
              placeholder="CALLE, NÚMERO, LOCALIDAD"
            />
          </Field>
          
          <div className="turnoTextareasStack">
  <CollapsibleTextarea
  title="Documentación que debe presentarse"
  name="turno_documentacion"
  value={turnoData.turno_documentacion}
  onChange={handleTurnoDataChange}
  placeholder="Indicá la documentación que debe llevar el cliente, productor o compañía."
/>

<CollapsibleTextarea
  title="Aranceles / importes a abonar"
  name="turno_aranceles"
  value={turnoData.turno_aranceles}
  onChange={handleTurnoDataChange}
  placeholder="Indicá importes, aranceles o gastos que deban abonarse al presentarse."
/>

  <CollapsibleTextarea
  title="Observaciones del turno"
  name="turno_observaciones"
  value={turnoData.turno_observaciones}
  onChange={handleTurnoDataChange}
  placeholder="Agregá aclaraciones internas sobre el turno."
/>
</div>
       
        </div>

        <div className="adminActions">
  <button
    type="button"
    className="secondaryButton"
    onClick={handleCopiarTurnoWhatsapp}
  >
    Copiar texto para WhatsApp
  </button>

  <button
    type="button"
    className="primaryButton"
    onClick={handleGuardarTurnoData}
    disabled={savingTurnoData}
  >
    {savingTurnoData ? "Guardando..." : "Guardar turno"}
  </button>
</div>
      </section>

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>PRESENTACION EN REGISTRO</h3>
          <p>
            Registrá la fecha en que SAKI presentó el trámite y dejá el legajo como pendiente de resolución registral.
          </p>
        </div>

        <div className="clienteGrid presentacionRegistroGrid">
  <Field label="Fecha de presentación">
    <input
      type="date"
      name="fecha_presentacion_registro"
      value={presentacionData.fecha_presentacion_registro || ""}
      onChange={handlePresentacionDataChange}
    />
  </Field>

  <Field label="N° de recibo">
    <input
      name="numero_tramite_registro"
      value={presentacionData.numero_tramite_registro}
      onChange={handlePresentacionDataChange}
      placeholder="N° DE RECIBO"
    />
  </Field>

  <Field label="Control web">
    <input
      name="control_web_presentacion"
      value={presentacionData.control_web_presentacion}
      onChange={handlePresentacionDataChange}
      placeholder="CONTROL WEB"
    />
  </Field>
</div>

        <div className="adminActions">
          <button
            type="button"
            className="primaryButton"
            onClick={handleGuardarPresentacionData}
            disabled={savingPresentacionData}
          >
            {savingPresentacionData
              ? "Guardando..."
              : "Marcar presentado en Registro"}
          </button>
        </div>
      </section>

                  <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>Observación / subsanación / reingreso</h3>
          <p>
            Registrá observaciones del Registro, responsable de subsanar, fecha de subsanación y reingreso.
          </p>
        </div>

        <div className="clienteGrid observacionRegistroGrid">
  <Field label="Fecha de observación">
    <input
      type="date"
      name="fecha_observacion_registro"
      value={observacionData.fecha_observacion_registro || ""}
      onChange={handleObservacionDataChange}
    />
  </Field>

  <Field label="Responsable de subsanar">
    <select
      name="responsable_subsanacion"
      value={observacionData.responsable_subsanacion}
      onChange={handleObservacionDataChange}
    >
      <option value="">Seleccionar</option>
      <option value="SAKI">SAKI</option>
      <option value="PRODUCTOR">Productor</option>
      <option value="CLIENTE">Cliente</option>
      <option value="COMPAÑÍA">Compañía</option>
      <option value="ESCRIBANÍA">Escribanía</option>
      <option value="OTRO">Otro</option>
    </select>
  </Field>

  <Field label="Fecha de reingreso en Registro">
    <input
      type="date"
      name="fecha_reingreso_registro"
      value={observacionData.fecha_reingreso_registro || ""}
      onChange={handleObservacionDataChange}
    />
  </Field>

  <div className="motivoObservacionWide">
  <CollapsibleTextarea
    title="Motivo de observación"
    name="motivo_observacion_registro"
    value={observacionData.motivo_observacion_registro}
    onChange={handleObservacionDataChange}
    placeholder="Indicá el motivo de la observación, qué requiere el Registro o qué debe tenerse en cuenta para subsanar."
  />
</div>
</div>

        <div className="adminActions">
          <button
            type="button"
            className="secondaryButton"
            onClick={handleMarcarObservado}
            disabled={savingObservacionData}
          >
            Marcar observado
          </button>

          <button
            type="button"
            className="secondaryButton"
            onClick={handleMarcarSubsanacionEnCurso}
            disabled={savingObservacionData}
          >
            Marcar subsanación en curso
          </button>

          <button
            type="button"
            className="primaryButton"
            onClick={handleMarcarReingresadoRegistro}
            disabled={savingReingresoData}
          >
            {savingReingresoData ? "Guardando..." : "Marcar reingresado"}
          </button>
        </div>
      </section>

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>Resultado favorable / inscripción</h3>
          <p>
            Registrá el resultado favorable obtenido en Registro y la documentación emitida.
          </p>
        </div>

        <div className="clienteGrid resultadoRegistroGrid">
  <Field label="Fecha de resultado favorable">
    <input
      type="date"
      name="fecha_resultado_favorable"
      value={resultadoData.fecha_resultado_favorable || ""}
      onChange={handleResultadoDataChange}
    />
  </Field>

  <Field label="Resultado obtenido" className="span3">
    <input
      name="resultado_obtenido"
      value={resultadoData.resultado_obtenido}
      onChange={handleResultadoDataChange}
      placeholder="INSCRIPTO / BAJA INSCRIPTA / TRANSFERENCIA INSCRIPTA / RESULTADO FAVORABLE"
    />
  </Field>

  <div className="documentacionResultadoWide">
  <CollapsibleTextarea
    title="Documentación obtenida"
    name="documentacion_obtenida"
    value={resultadoData.documentacion_obtenida}
    onChange={handleResultadoDataChange}
    placeholder="Indicá la documentación obtenida o emitida por el Registro. Ej.: TÍTULO DIGITAL, CÉDULA, CERTIFICADO, CONSTANCIA, BAJA, INFORME, DENUNCIA, ETC."
  />
</div>
</div>

        <div className="adminActions">
          <button
            type="button"
            className="primaryButton"
            onClick={handleMarcarResultadoFavorable}
            disabled={savingResultadoData}
          >
            {savingResultadoData
              ? "Guardando..."
              : "Marcar inscripto / resultado favorable"}
          </button>
        </div>
      </section>

<section id="tramites-complementarios-block" className="formSubsection">
  <div className="subsectionHeader">
    <h3>TRAMITES COMPLEMENTARIOS</h3>
    <p>
      Agregá una o más gestiones complementarias vinculadas al legajo, como baja municipal, alta municipal, libre deuda u otra intervención externa.
    </p>
  </div>

  {tramitesComplementarios.length > 0 && (
    <div className="complementariosList">
      {tramitesComplementarios.map((item) => (
        <div key={item.id} className="complementarioRow">
          <div>
            <span>Tipo</span>
            <strong>{item.tipo_tramite || "Sin tipo"}</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>{item.estado || "PENDIENTE"}</strong>
          </div>

          <div>
            <span>Inicio</span>
            <strong>
              {item.fecha_inicio
                ? new Date(`${item.fecha_inicio}T00:00:00`).toLocaleDateString("es-AR")
                : "—"}
            </strong>
          </div>

          <div>
            <span>Fin</span>
            <strong>
              {item.fecha_fin
                ? new Date(`${item.fecha_fin}T00:00:00`).toLocaleDateString("es-AR")
                : "—"}
            </strong>
          </div>

          <div className="complementarioObs">
            <span>Observaciones</span>
            <strong>{item.observaciones || "—"}</strong>
          </div>

          <div className="complementarioActions">
            <button
              type="button"
              className="tableActionButton"
              onClick={() => handleEditarComplementario(item)}
            >
              Editar
            </button>

            <button
              type="button"
              className="tableDangerButton"
              onClick={() => handleEliminarComplementario(item)}
              disabled={deletingComplementarioId === item.id}
            >
              {deletingComplementarioId === item.id ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  )}

  {tramitesComplementarios.length === 0 && (
    <div className="emptyComplementarios">
      Todavía no hay trámites complementarios cargados.
    </div>
  )}

  <div className="clienteGrid unidadExtraGrid">
    <Field label="Tipo de trámite complementario" className="span2">
      <select
        name="tipo_tramite"
        value={complementarioData.tipo_tramite}
        onChange={handleComplementarioDataChange}
      >
        <option value="">Seleccionar</option>
        <option value="BAJA MUNICIPAL">Baja municipal</option>
        <option value="ALTA MUNICIPAL">Alta municipal</option>
        <option value="LIBRE DEUDA / INFRACCIONES">
          Libre deuda / infracciones
        </option>
        <option value="GESTIÓN ANTE ORGANISMO EXTERNO">
          Gestión ante organismo externo
        </option>
        <option value="OTRO TRÁMITE COMPLEMENTARIO">
          Otro trámite complementario
        </option>
      </select>
    </Field>

    <Field label="Estado">
      <select
        name="estado"
        value={complementarioData.estado}
        onChange={handleComplementarioDataChange}
      >
        <option value="PENDIENTE">Pendiente</option>
        <option value="EN GESTIÓN">En gestión</option>
        <option value="FINALIZADO">Finalizado</option>
        <option value="NO REALIZADO">No realizado</option>
      </select>
    </Field>

    <Field label="Fecha de inicio">
      <input
        type="date"
        name="fecha_inicio"
        value={complementarioData.fecha_inicio || ""}
        onChange={handleComplementarioDataChange}
      />
    </Field>

    <Field label="Fecha de finalización">
      <input
        type="date"
        name="fecha_fin"
        value={complementarioData.fecha_fin || ""}
        onChange={handleComplementarioDataChange}
      />
    </Field>

<div className="complementarioObservacionesWide">
  <CollapsibleTextarea
    title="Observaciones"
    name="observaciones"
    value={complementarioData.observaciones}
    onChange={handleComplementarioDataChange}
    placeholder="Agregá observaciones sobre la gestión complementaria."
  />
</div>
  </div>

  <div className="adminActions">
    {editingComplementarioId && (
      <button
        type="button"
        className="secondaryButton"
        onClick={resetComplementarioForm}
        disabled={savingComplementarioData}
      >
        Cancelar edición
      </button>
    )}

    <button
      type="button"
      className="primaryButton"
      onClick={handleGuardarComplementarioData}
      disabled={savingComplementarioData}
    >
      {savingComplementarioData
        ? "Guardando..."
        : editingComplementarioId
          ? "Guardar cambios"
          : "Agregar trámite complementario"}
    </button>
  </div>
</section>

      <div className="actions">
        <div />

        <div className="rightActions">
          <button
            type="button"
            className="primaryButton"
            onClick={handleGuardarTramiteData}
            disabled={savingTramiteData}
          >
            {savingTramiteData ? "Guardando..." : "Guardar datos del trámite"}
          </button>
        </div>
      </div>
    </div>
  </form>
)}

    {activeTab === "documentacion" && (
  <form className="formPanel" onSubmit={(event) => event.preventDefault()}>
    <div className="panelSlide">
      <div className="formHeader">
        <div
          className="formIcon"
          style={{
            color: "#93C5FD",
            borderColor: "#93C5FD66",
            background: "#93C5FD22",
          }}
        >
          <FileText size={25} />
        </div>

        <div>
          <h2>Documentación</h2>
          <p>
            Centralizá archivos iniciales, documentación presentada, constancias,
            comprobantes y documentación final del legajo.
          </p>
        </div>
      </div>

      <div className="divider" />

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>Archivos del legajo</h3>
          <p>
            Documentación actualmente cargada y vinculada a este trámite.
          </p>
        </div>

        {archivosLegajo.length === 0 && (
          <div className="emptyComplementarios">
            Todavía no hay archivos cargados para este legajo.
          </div>
        )}

        {archivosLegajo.length > 0 && (
          <div className="documentosList">
            {archivosLegajo.map((archivo) => (
              <div key={archivo.id} className="documentoRow">
                <div className="documentoIcon">
                  <FileText size={18} />
                </div>

                <div className="documentoInfo">
                  <strong>
                    {archivo.nombre_original ||
                      archivo.nombre_archivo ||
                      "Archivo sin nombre"}
                  </strong>

                  <span>
                    {archivo.tipo_documentacion || "SIN CATEGORÍA"}
                    {archivo.created_at
                      ? ` · ${new Date(archivo.created_at).toLocaleDateString("es-AR")}`
                      : ""}
                  </span>

                  {archivo.observaciones && (
                    <p>{archivo.observaciones}</p>
                  )}
                </div>
                <div className="documentoActions">
  <button
    type="button"
    className="tableActionButton"
    onClick={() => handleVerDocumentoLegajo(archivo)}
  >
    Ver
  </button>

  <button
    type="button"
    className="tableActionButton"
    onClick={() => handleDescargarDocumentoLegajo(archivo)}
  >
    Descargar
  </button>

  <button
    type="button"
    className="tableDangerButton"
    onClick={() => handleEliminarDocumentoLegajo(archivo)}
    disabled={deletingDocumentoId === archivo.id}
  >
    {deletingDocumentoId === archivo.id ? "Eliminando..." : "Eliminar"}
  </button>
</div>
  
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>Subir documentación</h3>
          <p>
            Seleccioná una categoría, agregá una descripción si corresponde y subí uno o más archivos.
          </p>
        </div>

        <div className="clienteGrid">
          <Field label="Categoría documental" className="span2">
            <select
              name="categoria"
              value={documentoData.categoria}
              onChange={handleDocumentoDataChange}
            >
              {DOCUMENTACION_CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Descripción / observaciones" className="span2">
            <input
              name="descripcion"
              value={documentoData.descripcion}
              onChange={handleDocumentoDataChange}
              placeholder="OBSERVACIONES SOBRE LA DOCUMENTACIÓN"
            />
          </Field>

          <Field label="Archivo" full>
            <label className="uploadBox">
              <Upload size={18} />
              <span>Seleccionar archivo(s)</span>
              <input
                type="file"
                multiple
                onChange={handleDocumentoFilesChange}
              />
            </label>
          </Field>
        </div>

        {documentoData.archivos.length > 0 && (
          <div className="selectedFilesBox">
            <div className="selectedFilesHeader">
              <strong>Archivos seleccionados</strong>

              <button
                type="button"
                className="secondaryButton"
                onClick={handleLimpiarDocumentosSeleccionados}
              >
                Limpiar selección
              </button>
            </div>

            <div className="selectedFilesList">
              {documentoData.archivos.map((file, index) => (
                <div key={`${file.name}-${index}`} className="selectedFileItem">
                  <span>{file.name}</span>

                  <button
                    type="button"
                    className="tableDangerButton"
                    onClick={() => handleQuitarDocumentoSeleccionado(index)}
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="adminActions">
          <button
            type="button"
            className="primaryButton"
            onClick={handleSubirDocumentosLegajo}
            disabled={uploadingDocumento}
          >
            {uploadingDocumento ? "Subiendo..." : "Subir documentación"}
          </button>
        </div>
      </section>
            <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>Cierre documental</h3>
          <p>
            Registrá el envío de documentación final, entrega de originales,
            cierre documental o anulación del legajo.
          </p>
        </div>

        <div className="clienteGrid">
          <Field label="Fecha documentación final enviada">
            <input
              type="date"
              name="fecha_documentacion_final_enviada"
              value={cierreData.fecha_documentacion_final_enviada || ""}
              onChange={handleCierreDataChange}
            />
          </Field>

          <Field label="Medio de envío" className="span2">
            <select
              name="medio_envio_documentacion_final"
              value={cierreData.medio_envio_documentacion_final}
              onChange={handleCierreDataChange}
            >
              <option value="">Seleccionar</option>
              <option value="MAIL">Mail</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PORTAL">Portal</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="OTRO">Otro</option>
            </select>
          </Field>

          <Field label="Fecha entrega de originales">
            <input
              type="date"
              name="fecha_entrega_originales"
              value={cierreData.fecha_entrega_originales || ""}
              onChange={handleCierreDataChange}
            />
          </Field>

          <Field label="Persona que recibe originales" className="span2">
            <input
              name="persona_recibe_originales"
              value={cierreData.persona_recibe_originales}
              onChange={handleCierreDataChange}
              placeholder="APELLIDO Y NOMBRE / SECTOR / EMPRESA"
            />
          </Field>

          <Field label="Fecha de cierre del legajo">
            <input
              type="date"
              name="fecha_cierre_legajo"
              value={cierreData.fecha_cierre_legajo || ""}
              onChange={handleCierreDataChange}
            />
          </Field>

          <Field label="Observaciones documentales / cierre" full>
            <textarea
              name="observaciones_cierre"
              value={cierreData.observaciones_cierre}
              onChange={handleCierreDataChange}
              placeholder="Agregá observaciones sobre envío, entrega de originales o cierre documental."
            />
          </Field>

          <Field label="Motivo de anulación" full>
            <textarea
              name="motivo_anulacion"
              value={cierreData.motivo_anulacion}
              onChange={handleCierreDataChange}
              placeholder="Completar solo si corresponde anular el legajo."
            />
          </Field>
        </div>

        <div className="adminActions">
          <button
            type="button"
            className="secondaryButton"
            onClick={handleMarcarDocumentacionFinalEnviada}
            disabled={savingCierreData}
          >
            Documentación final enviada
          </button>

          <button
            type="button"
            className="secondaryButton"
            onClick={handleMarcarOriginalesEntregados}
            disabled={savingCierreData}
          >
            Originales entregados
          </button>

          <button
            type="button"
            className="primaryButton"
            onClick={handleCerrarLegajo}
            disabled={savingCierreData}
          >
            Cerrar legajo
          </button>

          <button
            type="button"
            className="tableDangerButton"
            onClick={handleAnularLegajo}
            disabled={savingCierreData}
          >
            Anular legajo
          </button>
        </div>
      </section>
    </div>
  </form>
)}

    {activeTab === "notas" && (
  <form className="formPanel" onSubmit={(event) => event.preventDefault()}>
    <div className="panelSlide">
      <div className="formHeader">
        <div
          className="formIcon"
          style={{
            color: "#E2E8F0",
            borderColor: "#E2E8F066",
            background: "#E2E8F022",
          }}
        >
          <FileText size={25} />
        </div>

        <div>
          <h2>Notas</h2>
          <p>
            Centralizá notas iniciales, comentarios internos y comunicaciones relevantes del legajo.
          </p>
        </div>
      </div>

      <div className="divider" />

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>Nueva nota</h3>
          <p>
            Agregá una nota al legajo. Podés definir si será visible para productor / compañía o solo interna de SAKI.
          </p>
        </div>

        <div className="clienteGrid">
          <Field label="Tipo de nota" className="span2">
            <select
              name="tipo_nota"
              value={notaData.tipo_nota}
              onChange={handleNotaDataChange}
            >
              <option value="NOTA DEL LEGAJO">Nota del legajo</option>
              <option value="NOTA INTERNA SAKI">Nota interna SAKI</option>
              <option value="COMENTARIO DEL PRODUCTOR">Comentario del productor</option>
              <option value="ACLARACIÓN DOCUMENTAL">Aclaración documental</option>
              <option value="OBSERVACIÓN OPERATIVA">Observación operativa</option>
            </select>
          </Field>

          <label className="checkLine full">
            <input
              type="checkbox"
              name="visible_para_productor"
              checked={notaData.visible_para_productor}
              onChange={handleNotaDataChange}
            />
            Visible para productor / compañía
          </label>

          <Field label="Nota" full>
            <textarea
              name="nota"
              value={notaData.nota}
              onChange={handleNotaDataChange}
              placeholder="Escribí la nota del legajo..."
            />
          </Field>
        </div>

        <div className="adminActions">
          <button
            type="button"
            className="primaryButton"
            onClick={handleGuardarNotaLegajo}
            disabled={savingNota}
          >
            {savingNota ? "Guardando..." : "Guardar nota"}
          </button>
        </div>
      </section>

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>Notas del legajo</h3>
          <p>
            Historial de notas y comentarios registrados para este trámite.
          </p>
        </div>

        {notasLegajo.length === 0 && (
          <div className="emptyComplementarios">
            Todavía no hay notas cargadas para este legajo.
          </div>
        )}

        {notasLegajo.length > 0 && (
          <div className="notasList">
            {notasLegajo.map((nota) => (
              <div key={nota.id} className="notaCard">
                <div className="notaHeader">
                  <div>
                    <span>{nota.tipo_nota || "NOTA DEL LEGAJO"}</span>
                    <strong>
                      {nota.created_at
                        ? new Date(nota.created_at).toLocaleString("es-AR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "Sin fecha"}
                    </strong>
                  </div>

                  <div className="notaBadges">
                    <em>
                      {nota.visible_para_productor
                        ? "Visible para productor"
                        : "Solo SAKI"}
                    </em>

                    <button
                      type="button"
                      className="tableDangerButton"
                      onClick={() => handleEliminarNotaLegajo(nota)}
                      disabled={deletingNotaId === nota.id}
                    >
                      {deletingNotaId === nota.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>

                <p>{nota.nota}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  </form>
)}

    {activeTab === "trazabilidad" && (
  <form className="formPanel" onSubmit={(event) => event.preventDefault()}>
    <div className="panelSlide">
      <div className="formHeader">
        <div
          className="formIcon"
          style={{
            color: "#BAE6FD",
            borderColor: "#BAE6FD66",
            background: "#BAE6FD22",
          }}
        >
          <ClipboardList size={25} />
        </div>

        <div>
          <h2>Trazabilidad</h2>
          <p>
            Línea de tiempo del legajo con todos los movimientos registrados por SAKI.
          </p>
        </div>
      </div>

      <div className="divider" />

      <section className="formSubsection">
        <div className="subsectionHeader">
          <h3>Movimientos del legajo</h3>
          <p>
            Registro cronológico de cambios de estado, turnos, documentación,
            observaciones, reingresos, cierres y demás acciones relevantes.
          </p>
        </div>

        {trazabilidadRows.length === 0 && (
          <div className="emptyComplementarios">
            Todavía no hay movimientos registrados para este legajo.
          </div>
        )}

        {trazabilidadRows.length > 0 && (
          <div className="timelineList">
            {trazabilidadRows.map((row) => (
              <div key={row.id} className="timelineItem">
                <div className="timelineDot" />

                <div className="timelineCard">
                  <div className="timelineTop">
                    <div>
                      <span>Movimiento</span>
                      <strong>
                        {row.titulo || row.tipo_movimiento || "Movimiento del legajo"}
                      </strong>
                    </div>

                    <time>
                      {row.fecha_movimiento
                        ? new Date(row.fecha_movimiento).toLocaleString("es-AR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "Sin fecha"}
                    </time>
                  </div>

                  {(row.estado_anterior || row.estado_nuevo) && (
                    <div className="timelineStates">
                      {row.estado_anterior && (
                        <span className="statePill">
                          Antes: {row.estado_anterior}
                        </span>
                      )}

                      {row.estado_nuevo && (
                        <span className="statePill active">
                          Ahora: {row.estado_nuevo}
                        </span>
                      )}
                    </div>
                  )}

                  {row.detalle && <p>{row.detalle}</p>}

                  {row.tipo_movimiento && (
                    <small>{row.tipo_movimiento}</small>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  </form>
)}
  </section>
)}

        {activeTab === "costos" && (
           <section className="budgetPanel">
          <div className="panelHeader">
            <div>
              <h2>Costos / Presupuesto</h2>
              <p>
                Módulo interno de SAKI. El productor y el cliente solo verán el
                presupuesto emitido.
              </p>
            </div>

            <button
              type="button"
              className="printButton"
              onClick={handleImprimirPresupuesto}
            >
              <Printer size={16} />
              Imprimir presupuesto
            </button>
          </div>

          <section className="adminBox noPrint">
            <div className="adminBoxHeader">
              <div>
                <h3>Estado del presupuesto</h3>
                <p>
                  Definí el estado operativo del presupuesto para seguimiento interno y futura vista del productor.
                </p>
              </div>

              <span>Solo SAKI</span>
            </div>

            <div className="costFormGrid">
              <Field label="Estado actual">
                <select
                  value={presupuestoEstado}
                  onChange={(event) => setPresupuestoEstado(event.currentTarget.value)}
                >
                  {PRESUPUESTO_ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="adminActions">
              <button
                type="button"
                className="primaryButton"
                onClick={handleGuardarEstadoPresupuesto}
                disabled={savingPresupuestoEstado}
              >
                {savingPresupuestoEstado ? "Guardando..." : "Guardar estado"}
              </button>
            </div>
          </section>

<section className="adminBox noPrint">
  <div className="adminBoxHeader">
    <div>
      <h3>Datos registrales del trámite</h3>
      <p>
        Información técnica utilizada por SAKI para definir la radicación, el registro interviniente y, si corresponde, la base de cálculo del presupuesto.
      </p>
    </div>

    <span>Solo SAKI</span>
  </div>

  <div className="costFormGrid">
    <Field label="Radicación actual">
      <input
        name="radicacion_actual"
        value={baseData.radicacion_actual}
        onChange={handleBaseDataChange}
        placeholder="Ej.: CABA / PBA / Córdoba"
      />
    </Field>

    <label className="checkLine full">
  <input
    type="checkbox"
    name="contempla_futura_radicacion"
    checked={baseData.contempla_futura_radicacion}
    onChange={handleBaseDataChange}
  />
  Contemplar futura radicación en el presupuesto
</label>

    {baseData.contempla_futura_radicacion && (
  <>
    <Field label="Futura radicación">
      <input
        name="futura_radicacion"
        value={baseData.futura_radicacion}
        onChange={handleBaseDataChange}
        placeholder="Ej.: CABA / PBA / Córdoba"
      />
    </Field>

    <Field label="Registro de futura radicación">
      <input
        name="registro_futura_radicacion"
        value={baseData.registro_futura_radicacion}
        onChange={handleBaseDataChange}
        placeholder="Ej.: Registro Seccional N° ..."
      />
    </Field>
  </>
)}

<Field label="Lugar de presentación">
  <select
    name="lugar_presentacion_tramite"
    value={baseData.lugar_presentacion_tramite}
    onChange={handleBaseDataChange}
  >
    <option value="">Seleccionar</option>
    <option value="Registro de radicación actual">
      Registro de radicación actual
    </option>

    {baseData.contempla_futura_radicacion && (
      <option value="Registro de futura radicación">
        Registro de futura radicación
      </option>
    )}
  </select>
</Field>

    <Field label="Registro interviniente / de presentación">
      <input
        name="registro_interviniente_presupuesto"
        value={baseData.registro_interviniente_presupuesto}
        onChange={handleBaseDataChange}
        placeholder="Registro donde se calcula o presenta"
      />
    </Field>

    <label className="checkLine full">
  <input
    type="checkbox"
    name="contempla_base_calculo"
    checked={baseData.contempla_base_calculo}
    onChange={handleBaseDataChange}
  />
  Contemplar base de cálculo en el presupuesto
</label>
    
{baseData.contempla_base_calculo && (
  <>
    <Field label="Valor de venta declarado">
      <input
        type="text"
        inputMode="numeric"
        name="valor_venta"
        value={baseData.valor_venta}
        onChange={handleBaseMoneyChange}
        placeholder="Ej.: 15.000.000"
      />
    </Field>

    <Field label="Valor tabla DNRPA">
      <input
        type="text"
        inputMode="numeric"
        name="valor_tabla_dnrpa"
        value={baseData.valor_tabla_dnrpa}
        onChange={handleBaseMoneyChange}
        placeholder="Ej.: 18.500.000"
      />
    </Field>

    <Field label="Valor fiscal">
      <input
        type="text"
        inputMode="numeric"
        name="valor_fiscal"
        value={baseData.valor_fiscal}
        onChange={handleBaseMoneyChange}
        placeholder="Ej.: 16.000.000"
      />
    </Field>

    <Field label="Base utilizada para el cálculo">
      <select
        name="base_calculo_usada"
        value={baseData.base_calculo_usada}
        onChange={handleBaseDataChange}
      >
        <option value="">Seleccionar</option>
        <option value="Valor de venta">Valor de venta</option>
        <option value="Valor tabla DNRPA">Valor tabla DNRPA</option>
        <option value="Valor fiscal">Valor fiscal</option>
        <option value="Mayor valor entre venta / tabla / fiscal">
          Mayor valor entre venta / tabla / fiscal
        </option>
        <option value="No aplica">No aplica</option>
      </select>
    </Field>

    <Field label="Observación de base de cálculo" full>
      <textarea
        name="observacion_base_calculo"
        value={baseData.observacion_base_calculo}
        onChange={handleBaseDataChange}
        placeholder="Ej.: se toma valor tabla DNRPA por ser superior al valor de venta declarado."
      />
    </Field>
  </>
)}
  </div>

  <div className="adminActions">
    <button
      type="button"
      className="primaryButton"
      onClick={handleGuardarBaseData}
      disabled={savingBaseData}
    >
      {savingBaseData ? "Guardando..." : "Guardar datos registrales"}
    </button>
  </div>
</section>

          <section className="adminBox noPrint">
            <div className="adminBoxHeader">
              <div>
                <h3>{editingCostId ? "Editar concepto" : "Agregar concepto"}</h3>
<p>
  {editingCostId
    ? "Modificá el concepto seleccionado y guardá los cambios."
    : "Cargá aranceles, formularios, honorarios, deudas o gastos."}
</p>
              </div>

              <span>Solo SAKI</span>
            </div>

            <div className="costFormGrid">
              <Field label="Categoría">
  <select
    name="categoria"
    value={nuevoCosto.categoria}
    onChange={handleCostoChange}
  >
    {Object.keys(CONCEPTOS_POR_CATEGORIA).map((categoria) => (
      <option key={categoria} value={categoria}>
        {categoria}
      </option>
    ))}
  </select>
</Field>

<Field label="Concepto">
  <select
    name="concepto"
    value={nuevoCosto.concepto}
    onChange={handleCostoChange}
  >
    <option value="">Seleccionar concepto</option>

    {(CONCEPTOS_POR_CATEGORIA[nuevoCosto.categoria] || []).map((concepto) => (
      <option key={concepto} value={concepto}>
        {concepto}
      </option>
    ))}
  </select>
</Field>

              <Field label="Cantidad">
                <input
                  type="number"
                  min="1"
                  name="cantidad"
                  value={nuevoCosto.cantidad}
                  onChange={handleCostoChange}
                />
              </Field>

              <Field label="Importe unitario">
                <input
                  type="number"
                  min="0"
                  name="importe_unitario"
                  value={nuevoCosto.importe_unitario}
                  onChange={handleCostoChange}
                  placeholder="0"
                />
              </Field>

              <Field label="Descripción" full>
                <textarea
                  name="descripcion"
                  value={nuevoCosto.descripcion}
                  onChange={handleCostoChange}
                  placeholder="Detalle interno del concepto..."
                />
              </Field>

              <label className="checkLine full">
                <input
                  type="checkbox"
                  name="visible_para_productor"
                  checked={nuevoCosto.visible_para_productor}
                  onChange={handleCostoChange}
                />
                Visible para productor / cliente
              </label>
            </div>

            <div className="adminActions">
              <button
  type="button"
  className="primaryButton"
  onClick={editingCostId ? handleActualizarCosto : handleAgregarCosto}
  disabled={savingCost}
>
  <Plus size={16} />
  {savingCost
    ? editingCostId
      ? "Guardando..."
      : "Agregando..."
    : editingCostId
      ? "Guardar cambios"
      : "Agregar concepto"}
</button>

{editingCostId && (
  <button
    type="button"
    className="secondaryButton"
    onClick={resetFormularioCosto}
    disabled={savingCost}
  >
    Cancelar edición
  </button>
)}
            </div>
          </section>

          <section className="printSheet">
            <div className="printHeader">
              <div>
                <div className="printBrand">SAKI</div>
                <div className="printSub">Presupuesto / Liquidación</div>
              </div>

              <div className="printMeta">
                <span>Legajo</span>
                <strong>{legajo.id}</strong>
              </div>
            </div>

            <div className="clientBlock">
              <div>
                <span>Cliente / asegurado</span>
                <strong>{clienteNombre || "Sin completar"}</strong>
              </div>

              <div>
                <span>Dominio</span>
                <strong>{legajo.dominio || "Sin dominio"}</strong>
              </div>

              <div>
                <span>Trámite</span>
                <strong>{legajo.tipo_pedido || "Sin pedido"}</strong>
              </div>

              <div>
                <span>Estado</span>
                <strong>{legajo.presupuesto_estado || "Pendiente de cotización"}</strong>
              </div>
            </div>

            <div className="calculationBlock">
  <div className="calculationTitle">
  Datos registrales del trámite
</div>

  <div className="calculationGrid">
    <div>
      <span>Radicación actual</span>
      <strong>{legajo.radicacion_actual || "No informado"}</strong>
    </div>

    {legajo.contempla_futura_radicacion && (
  <>
    <div>
      <span>Futura radicación</span>
      <strong>{legajo.futura_radicacion || "No informado"}</strong>
    </div>
  </>
)}

    <div>
      <span>Lugar de presentación</span>
<strong>{formatLugarPresentacion(legajo.lugar_presentacion_tramite)}</strong>
    </div>

    <div>
      <span>Registro interviniente</span>
      <strong>{legajo.registro_interviniente_presupuesto || "No informado"}</strong>
    </div>

    {legajo.contempla_base_calculo && (
  <>
    <div>
      <span>Valor de venta declarado</span>
      <strong>{formatMoney(legajo.valor_venta)}</strong>
    </div>

    <div>
      <span>Valor tabla DNRPA</span>
      <strong>{formatMoney(legajo.valor_tabla_dnrpa)}</strong>
    </div>

    <div>
      <span>Valor fiscal</span>
      <strong>{formatMoney(legajo.valor_fiscal)}</strong>
    </div>

    <div>
      <span>Base utilizada</span>
      <strong>{legajo.base_calculo_usada || "No informado"}</strong>
    </div>
  </>
)}
  </div>

  {legajo.contempla_base_calculo && legajo.observacion_base_calculo && (
  <div className="calculationObservation">
      <span>Observación</span>
      <p>{legajo.observacion_base_calculo}</p>
    </div>
  )}
</div>

            <table className="costTable">
              <thead>
                <tr>
  <th>Concepto</th>
  <th>Categoría</th>
  <th>Cant.</th>
  <th>Unitario</th>
  <th>Total</th>
  <th className="noPrint">Acciones</th>
</tr>
              </thead>

              <tbody>
                {costos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="emptyCell">
                      Todavía no hay conceptos cargados.
                    </td>
                  </tr>
                )}

                {costos.map((item) => {
  const isEditing = editingCostId === item.id;
  const conceptosDisponibles =
    CONCEPTOS_POR_CATEGORIA[nuevoCosto.categoria] || [];

  const conceptoActualNoCatalogado =
    isEditing &&
    nuevoCosto.concepto &&
    !conceptosDisponibles.includes(nuevoCosto.concepto);

  return (
    <tr key={item.id} className={isEditing ? "editingRow" : ""}>
      <td>
        {isEditing ? (
          <>
            <select
              name="concepto"
              value={nuevoCosto.concepto}
              onChange={handleCostoChange}
            >
              <option value="">Seleccionar concepto</option>

              {conceptoActualNoCatalogado && (
                <option value={nuevoCosto.concepto}>
                  {nuevoCosto.concepto}
                </option>
              )}

              {conceptosDisponibles.map((concepto) => (
                <option key={concepto} value={concepto}>
                  {concepto}
                </option>
              ))}
            </select>

            <textarea
              name="descripcion"
              value={nuevoCosto.descripcion}
              onChange={handleCostoChange}
              placeholder="Detalle / aclaración..."
            />
          </>
        ) : (
          <>
            <strong>{item.concepto}</strong>
            {item.descripcion && <small>{item.descripcion}</small>}
          </>
        )}
      </td>

      <td>
        {isEditing ? (
          <select
            name="categoria"
            value={nuevoCosto.categoria}
            onChange={handleCostoChange}
          >
            {Object.keys(CONCEPTOS_POR_CATEGORIA).map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        ) : (
          formatCategoriaPresupuesto(item.categoria)
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            type="number"
            min="1"
            name="cantidad"
            value={nuevoCosto.cantidad}
            onChange={handleCostoChange}
          />
        ) : (
          item.cantidad
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            type="number"
            min="0"
            name="importe_unitario"
            value={nuevoCosto.importe_unitario}
            onChange={handleCostoChange}
          />
        ) : (
          formatMoney(item.importe_unitario)
        )}
      </td>

      <td>
        {isEditing ? (
          <strong className="inlineTotal">
            {formatMoney(
              Number(nuevoCosto.cantidad || 1) *
                Number(nuevoCosto.importe_unitario || 0)
            )}
          </strong>
        ) : (
          formatMoney(item.importe_total)
        )}
      </td>

      <td className="noPrint actionCell">
        {isEditing ? (
          <>
            <button
              type="button"
              className="tableActionButton"
              onClick={handleActualizarCosto}
              disabled={savingCost}
            >
              {savingCost ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              className="tableDangerButton"
              onClick={resetFormularioCosto}
              disabled={savingCost}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="tableActionButton"
              onClick={() => handleEditarCosto(item)}
            >
              Editar
            </button>

            <button
              type="button"
              className="tableDangerButton"
              onClick={() => handleEliminarCosto(item)}
              disabled={deletingCostId === item.id}
            >
              {deletingCostId === item.id ? "Eliminando..." : "Eliminar"}
            </button>
          </>
        )}
      </td>
    </tr>
  );
})}
              </tbody>
            </table>

            <section className="totalsGrid">
              <div>
                <span>Aranceles</span>
                <strong>{formatMoney(totales.aranceles)}</strong>
              </div>

              <div>
                <span>Formularios</span>
                <strong>{formatMoney(totales.formularios)}</strong>
              </div>

              <div>
                <span>Honorarios</span>
                <strong>{formatMoney(totales.honorarios)}</strong>
              </div>

              <div>
                <span>Gastos adicionales</span>
                <strong>{formatMoney(totales.gastos)}</strong>
              </div>

              <div>
  <span>Deudas / regularización</span>
  <strong>{formatMoney(totales.deudas)}</strong>
</div>

<div>
  <span>Sellos / Impuestos</span>
  <strong>{formatMoney(totales.sellos)}</strong>
</div>

<div className="totalFinal">
  <span>Total general</span>
  <strong>{formatMoney(totales.total)}</strong>
</div>
            </section>

            <p className="budgetNote">
              Presupuesto sujeto a revisión según documentación, estado registral
              del dominio, aranceles vigentes, deudas, infracciones, patentes y
              observaciones del trámite.
            </p>
          </section>
        </section>
        )}
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

        .loadingText {
          color: #dbeafe;
          font-size: 15px;
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

        .eyebrow {
  color: #5fd0ff;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.moduleTitle {
  margin: 0;
  color: #ffffff;
  font-size: 25px;
  font-weight: 600;
  letter-spacing: -0.018em;
  line-height: 1.18;
}

.moduleDivider {
  color: #8fb9e8;
  font-weight: 400;
  margin: 0 7px;
}

.moduleSuffix {
  color: #e6f0ff;
  font-weight: 600;
}

.legajoHeaderBlock {
  margin: 30px 0 30px;
  padding: 0;
}

.legajoHeaderText {
  margin: 0 0 28px;
  padding: 0;
}

.legajoHeaderText p {
  margin: 9px 0 0;
  max-width: 760px;
  color: rgba(226, 237, 249, 0.72);
  font-size: 13px;
  line-height: 1.5;
}

.compactSummaryGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 0 0 26px;
}

.compactSummaryGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 0 0 18px;
}

        .summaryCard {
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          background: rgba(2, 8, 18, 0.30);
          padding: 15px;
        }

        .summaryCard span {
          display: block;
          color: rgba(203, 213, 225, 0.62);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

   .summaryCard strong {
  color: rgba(255, 255, 255, 0.88);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

        .detailStepper {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0;
  margin: 0;
  filter: drop-shadow(0 16px 28px rgba(0, 0, 0, 0.20));
}

.detailStepCard {
  position: relative;
  min-height: 62px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: var(--card-bg);
  color: rgba(226, 232, 240, 0.88);
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 12px 8px 25px;
  cursor: pointer;
  text-align: left;
  margin-left: -13px;
  font-family: inherit;
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

.detailStepCard.first {
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

.detailStepCard.last {
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

.detailStepCard:hover {
  z-index: 4;
  filter: brightness(1.12);
  transform: translateY(-1px);
}

.detailStepCard.active {
  z-index: 6;
  color: #ffffff;
  filter: brightness(1.16);
  border-color: var(--accent);
background: var(--card-bg);
  box-shadow:
    0 0 0 1px var(--accent),
    0 0 24px rgba(14, 165, 233, 0.24),
    inset 0 0 0 1px rgba(255,255,255,0.08),
    inset 0 -18px 28px rgba(0, 0, 0, 0.10);
}

.detailStepCard.active::after {
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

.detailStepNumber {
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
  font-size: 13px;
  font-weight: 800;
}

.detailStepLabel {
  min-width: 0;
  color: rgba(226, 232, 240, 0.90);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  letter-spacing: -0.015em;
  line-height: 1.05;
}

.detailPanel {
  border-radius: 25px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  background: linear-gradient(180deg, rgba(8, 22, 46, 0.76), rgba(3, 18, 34, 0.58));
  padding: 24px;
  box-shadow: 0 20px 56px rgba(0, 0, 0, 0.18);
}

.placeholderBox {
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.24);
  padding: 22px;
}

.placeholderBox span {
  display: block;
  color: rgba(96, 165, 250, 0.82);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.placeholderBox h2 {
  margin: 0;
  color: #ffffff;
  font-size: 22px;
  font-weight: 650;
}

.placeholderBox p {
  margin: 8px 0 0;
  color: rgba(168, 196, 232, 0.74);
  font-size: 13px;
  line-height: 1.45;
}

.span2 {
  grid-column: span 2;
}

.span3 {
  grid-column: span 3;
}

.span4 {
  grid-column: span 4;
}

.observacionesDominioField {
  grid-column: 1 / -1;
}

.textareaWide {
  width: 100%;
  min-height: 130px !important;
  resize: vertical;
}

.estadoObservacionWide {
  grid-column: 1 / -1 !important;
  width: 100%;
}

.estadoObservacionWide textarea {
  width: 100%;
  min-height: 118px;
}

.estadoTramitePill {
  flex: 0 0 auto;
  min-width: 128px;
  min-height: 26px;
  border-radius: 999px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.075em;
  line-height: 1;
  white-space: nowrap;
  text-transform: uppercase;
  border: 1px solid rgba(56, 189, 248, 0.24);
  background:
    linear-gradient(180deg, rgba(56,189,248,0.13), rgba(56,189,248,0.04)),
    rgba(8, 47, 73, 0.38);
  color: rgba(202, 240, 255, 0.88);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    0 8px 18px rgba(0,0,0,0.13);
}

.estadoTramitePill.pending {
  border-color: rgba(245, 158, 11, 0.28);
  background:
    linear-gradient(180deg, rgba(245,158,11,0.15), rgba(245,158,11,0.055)),
    rgba(39, 29, 10, 0.35);
  color: rgba(253, 230, 138, 0.88);
}

.estadoTramitePill.process {
  border-color: rgba(56, 189, 248, 0.24);
  background:
    linear-gradient(180deg, rgba(56,189,248,0.13), rgba(56,189,248,0.04)),
    rgba(8, 47, 73, 0.38);
  color: rgba(202, 240, 255, 0.88);
}

.estadoTramitePill.success {
  border-color: rgba(34, 197, 94, 0.30);
  background:
    linear-gradient(180deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06)),
    rgba(5, 46, 22, 0.42);
  color: rgba(187, 247, 208, 0.90);
}

.estadoTramitePill.danger {
  border-color: rgba(248, 113, 113, 0.30);
  background:
    linear-gradient(180deg, rgba(248,113,113,0.16), rgba(248,113,113,0.055)),
    rgba(69, 10, 10, 0.36);
  color: rgba(254, 202, 202, 0.90);
}

.turnoHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.turnoHeader > div {
  min-width: 0;
}

.turnoEstadoPill {
  flex: 0 0 auto;
  width: 178px !important;
  max-width: 178px;
  min-height: 26px;
  border-radius: 999px;
  padding: 0 34px 0 14px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.075em;
  line-height: 1;
  white-space: nowrap;
  text-transform: uppercase;
  border: 1px solid rgba(56, 189, 248, 0.24);
  background:
    linear-gradient(180deg, rgba(56,189,248,0.13), rgba(56,189,248,0.04)),
    rgba(8, 47, 73, 0.38);
  color: rgba(202, 240, 255, 0.88);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    0 8px 18px rgba(0,0,0,0.13);
  cursor: pointer;
}

.turnoEstadoPill.pending {
  border-color: rgba(245, 158, 11, 0.28);
  background:
    linear-gradient(180deg, rgba(245,158,11,0.15), rgba(245,158,11,0.055)),
    rgba(39, 29, 10, 0.35);
  color: rgba(253, 230, 138, 0.88);
}

.turnoEstadoPill.process {
  border-color: rgba(56, 189, 248, 0.28);
  background:
    linear-gradient(180deg, rgba(56,189,248,0.15), rgba(56,189,248,0.055)),
    rgba(8, 47, 73, 0.35);
  color: rgba(186, 230, 253, 0.88);
}

.turnoEstadoPill.success {
  border-color: rgba(34, 197, 94, 0.28);
  background:
    linear-gradient(180deg, rgba(34,197,94,0.15), rgba(34,197,94,0.055)),
    rgba(5, 46, 22, 0.35);
  color: rgba(187, 247, 208, 0.88);
}

.turnoEstadoPill.danger {
  border-color: rgba(248, 113, 113, 0.30);
  background:
    linear-gradient(180deg, rgba(248,113,113,0.16), rgba(248,113,113,0.055)),
    rgba(69, 10, 10, 0.36);
  color: rgba(254, 202, 202, 0.90);
}

.turnoTextareasStack {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.turnoTextareasStack textarea {
  width: 100%;
  min-height: 118px;
  resize: vertical;
}

.turnoTextareasStack .field {
  gap: 8px;
}

.detallePedidoWide {
  grid-column: 1 / -1;
}

.detallePedidoWide textarea {
  width: 100%;
  min-height: 135px;
}

.titularRegistralGrid {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-top: 16px;
}

.titularLine {
  display: grid;
  gap: 18px;
}

.titularLine4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.titularLine3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.titularLine2 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.titularLine2 > :global(.field) {
  max-width: 100%;
}

:global(.titularRegistralGrid label) {
  color: rgba(203, 213, 225, 0.68) !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
}

:global(.titularRegistralGrid .field) {
  gap: 7px !important;
}

:global(.titularRegistralGrid input),
:global(.titularRegistralGrid select) {
  font-size: 13.5px !important;
}

.detailPanel {
  border: none;
  background: transparent;
  padding: 0;
  box-shadow: none;
}

.formPanel {
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  background: linear-gradient(
    180deg,
    rgba(8, 22, 46, 0.78),
    rgba(3, 18, 34, 0.60)
  );
  padding: 24px;
  box-shadow: 0 20px 56px rgba(0, 0, 0, 0.18);
}

.panelSlide {
  width: 100%;
}

.formHeader {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.formHeaderText {
  flex: 1;
  min-width: 0;
}

.formTitleLine {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.formIcon {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.38);
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.formHeader h2 {
  margin: 0;
  color: #ffffff;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.08;
}

.formHeader p {
  margin: 8px 0 0;
  color: rgba(191, 219, 254, 0.82);
  font-size: 14px;
  line-height: 1.45;
}

.divider {
  height: 1px;
  background: rgba(148, 163, 184, 0.16);
  margin: 24px 0 22px;
}

.clienteGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.clienteGrid .field {
  gap: 7px;
}

:global(.clienteGrid label) {
  color: rgba(203, 213, 225, 0.68) !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  line-height: 1.15 !important;
}

:global(.clienteGrid input),
:global(.clienteGrid select) {
  height: 47px !important;
  font-size: 13px !important;
  border-radius: 14px !important;
}

.clienteGrid input,
.clienteGrid select {
  height: 49px;
  border-radius: 15px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(2, 8, 18, 0.72);
  color: rgba(226, 232, 240, 0.92);
  font-size: 13px;
  padding: 0 14px;
}

.span2 {
  grid-column: span 2;
}

.span3 {
  grid-column: span 3;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  margin-top: 28px;
  padding-top: 22px;
}

.rightActions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.formSubsection {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.18);
  padding: 18px;
  margin-top: 18px;
}

.formSubsection:first-of-type {
  margin-top: 0;
}

.subsectionHeader {
  margin-bottom: 16px;
}

.subsectionHeader h3 {
  margin: 0;
  color: #ffffff;
  font-size: 17px;
  font-weight: 650;
}

.subsectionHeader p {
  margin: 5px 0 0;
  color: rgba(168, 196, 232, 0.72);
  font-size: 12.5px;
  line-height: 1.4;
}

.titularResumenBox {
  border-radius: 16px;
  border: 1px solid rgba(56, 189, 248, 0.20);
  background: rgba(8, 145, 178, 0.10);
  padding: 14px;
  margin: 14px 0 0;
}

.titularResumenBox span {
  display: block;
  color: rgba(191, 219, 254, 0.70);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.titularResumenBox strong {
  display: block;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
}

.titularResumenBox p {
  margin: 5px 0 0;
  color: rgba(226, 232, 240, 0.76);
  font-size: 12px;
}

.titularResumenHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.titularResumenHeader span {
  color: rgba(191, 219, 254, 0.72);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}

.titularDatosClienteGrid {
  margin-top: 6px;
}

.titularDatosClienteGrid input[readonly] {
  color: rgba(226, 237, 249, 0.76);
  background: rgba(2, 8, 18, 0.24);
  cursor: default;
}

.titularDatosPropios {
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
}

.titularDatosPropiosGrid {
  margin-top: 14px;
}

.unidadExtraGrid,
.conyugeGrid {
  margin-top: 14px;
}

.condominiosBox {
  border-radius: 18px;
  border: 1px solid rgba(56, 189, 248, 0.16);
  background: rgba(8, 145, 178, 0.08);
  padding: 18px;
  margin-top: 18px;
}

.titularidadResumenGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.titularidadResumenGrid div {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.24);
  padding: 12px;
}

.titularidadResumenGrid span {
  display: block;
  color: rgba(203, 213, 225, 0.66);
  font-size: 10.5px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
}

.titularidadResumenGrid strong {
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
}

.titularidadResumenGrid .ok {
  border-color: rgba(34, 197, 94, 0.28);
  background: rgba(34, 197, 94, 0.08);
}

.titularidadResumenGrid .pending {
  border-color: rgba(251, 191, 36, 0.28);
  background: rgba(251, 191, 36, 0.08);
}

.condominiosList {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.condominioItem {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: start;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.22);
  padding: 14px;
}

.condominioRowButton {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  color: inherit;
  font-family: inherit;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  cursor: pointer;
}

.condominioRowButton strong {
  display: block;
  color: rgba(255, 255, 255, 0.88);
  font-size: 12.5px;
  font-weight: 550;
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

.condominioRowButton span {
  display: block;
  margin-top: 5px;
  color: rgba(203, 213, 225, 0.64);
  font-size: 11.5px;
  line-height: 1.35;
}

.condominioRowButton em {
  color: rgba(125, 211, 252, 0.78);
  font-size: 11.5px;
  font-style: normal;
  font-weight: 600;
  white-space: nowrap;
}

.condominioDetalle {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  margin-top: 12px;
  padding-top: 14px;
}

.condominioDetalle div {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.10);
  background: rgba(2, 8, 18, 0.20);
  padding: 10px;
}

.condominioDetalle span {
  display: block;
  color: rgba(203, 213, 225, 0.58);
  font-size: 9.5px;
  font-weight: 650;
  text-transform: uppercase;
  margin-bottom: 5px;
  letter-spacing: 0.03em;
}

.condominioDetalle strong {
  color: rgba(255, 255, 255, 0.80);
  font-size: 11.5px;
  font-weight: 450;
  line-height: 1.35;
}

.condominioItem strong {
  display: block;
  color: #ffffff;
  font-size: 13px;
}

.condominioItem span {
  display: block;
  margin-top: 3px;
  color: rgba(203, 213, 225, 0.68);
  font-size: 11.5px;
}

.condominioFormGrid {
  margin-top: 12px;
}

.condominioActions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.titularidadOk {
  border-radius: 14px;
  border: 1px solid rgba(34, 197, 94, 0.28);
  background: rgba(34, 197, 94, 0.08);
  color: #bbf7d0;
  padding: 12px;
  font-size: 12.5px;
  font-weight: 700;
}

.complementariosList {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
}

.complementarioRow {
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.8fr 0.8fr 1.5fr auto;
  gap: 10px;
  align-items: center;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.24);
  padding: 12px;
}

.complementarioRow span,
.emptyComplementarios {
  display: block;
  color: rgba(203, 213, 225, 0.64);
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.complementarioRow strong {
  display: block;
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 650;
  word-break: break-word;
}

.complementarioObs strong {
  line-height: 1.35;
}

.complementarioActions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  white-space: nowrap;
}

.emptyComplementarios {
  border-radius: 16px;
  border: 1px dashed rgba(148, 163, 184, 0.18);
  background: rgba(2, 8, 18, 0.16);
  padding: 14px;
  margin-bottom: 18px;
  text-transform: none;
  letter-spacing: 0;
  font-size: 12px;
}

.documentosList {
  display: grid;
  gap: 10px;
}

.documentoRow {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.24);
  padding: 12px;
}

.documentoIcon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid rgba(147, 197, 253, 0.22);
  background: rgba(147, 197, 253, 0.10);
  color: #93c5fd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.documentoInfo strong {
  display: block;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.documentoInfo span {
  display: block;
  margin-top: 3px;
  color: rgba(203, 213, 225, 0.66);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.documentoInfo p {
  margin: 5px 0 0;
  color: rgba(226, 232, 240, 0.72);
  font-size: 12px;
  line-height: 1.35;
}

.documentoActions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.timelineList {
  display: grid;
  gap: 14px;
}

.timelineItem {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 12px;
  align-items: flex-start;
}

.timelineDot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #38bdf8;
  box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.10);
  margin-top: 18px;
}

.timelineCard {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.24);
  padding: 15px;
}

.timelineTop {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.timelineTop span {
  display: block;
  color: rgba(203, 213, 225, 0.62);
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
}

.timelineTop strong {
  display: block;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}

.timelineTop time {
  color: rgba(191, 219, 254, 0.78);
  font-size: 11.5px;
  font-weight: 650;
  white-space: nowrap;
}

.timelineStates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.statePill {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.68);
  color: rgba(226, 232, 240, 0.78);
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 650;
}

.statePill.active {
  border-color: rgba(56, 189, 248, 0.30);
  background: rgba(8, 145, 178, 0.16);
  color: #e0f2fe;
}

.timelineCard p {
  margin: 12px 0 0;
  color: rgba(226, 232, 240, 0.76);
  font-size: 12.5px;
  line-height: 1.45;
}

.timelineCard small {
  display: inline-block;
  margin-top: 10px;
  color: rgba(148, 163, 184, 0.70);
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.notasList {
  display: grid;
  gap: 12px;
}

.notaCard {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 8, 18, 0.24);
  padding: 15px;
}

.notaHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
}

.notaHeader span {
  display: block;
  color: rgba(203, 213, 225, 0.62);
  font-size: 10.5px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
}

.notaHeader strong {
  display: block;
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
}

.notaBadges {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.notaBadges em {
  border-radius: 999px;
  border: 1px solid rgba(56, 189, 248, 0.24);
  background: rgba(8, 145, 178, 0.12);
  color: #dbeafe;
  padding: 5px 9px;
  font-size: 10.5px;
  font-style: normal;
  font-weight: 700;
  white-space: nowrap;
}

.notaCard p {
  margin: 0;
  color: rgba(226, 232, 240, 0.78);
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}

        .budgetPanel {
          border-radius: 25px;
          border: 1px solid rgba(148, 163, 184, 0.13);
          background: linear-gradient(180deg, rgba(8, 22, 46, 0.76), rgba(3, 18, 34, 0.58));
          padding: 24px;
          box-shadow: 0 20px 56px rgba(0, 0, 0, 0.18);
        }

        .panelHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .panelHeader h2 {
          margin: 0;
          color: #ffffff;
          font-size: 22px;
          font-weight: 650;
        }

        .panelHeader p {
          margin: 5px 0 0;
          color: rgba(168, 196, 232, 0.72);
          font-size: 13px;
        }

        .printButton,
        .primaryButton {
          height: 40px;
          border-radius: 999px;
          border: 1px solid rgba(147, 197, 253, 0.22);
          background: linear-gradient(180deg, rgba(47, 109, 246, 0.96), rgba(29, 78, 216, 0.86));
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 15px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
        }

        .adminBox,
        .printSheet {
          border-radius: 20px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          background: rgba(2, 8, 18, 0.24);
          padding: 18px;
          margin-bottom: 18px;
        }

        .adminBoxHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 16px;
        }

        .adminBoxHeader h3 {
          margin: 0;
          color: #ffffff;
          font-size: 16px;
          font-weight: 650;
        }

        .adminBoxHeader p {
          margin: 4px 0 0;
          color: rgba(168, 196, 232, 0.68);
          font-size: 12px;
        }

        .adminBoxHeader span {
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

        .costFormGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field.full,
        .full {
          grid-column: 1 / -1;
        }

        label {
          color: rgba(203, 213, 225, 0.72);
          font-size: 12px;
          font-weight: 500;
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
          min-height: 82px;
          padding-top: 11px;
          resize: vertical;
        }

        select option {
          background: #071326;
          color: #e5eefc;
        }

        .checkLine {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: rgba(203, 213, 225, 0.74);
          font-size: 12px;
        }

        .checkLine input {
          width: 15px;
          height: 15px;
          accent-color: #38bdf8;
        }

.adminActions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.secondaryButton {
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(15, 23, 42, 0.72);
  color: rgba(226, 232, 240, 0.88);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.actionCell {
  min-width: 150px;
  white-space: nowrap;
}

.tableActionButton,
.tableDangerButton {
  height: 30px;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  margin-right: 6px;
}

.tableActionButton {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}

.tableDangerButton {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

        .printSheet {
          background: #ffffff;
          color: #0f172a;
        }

        .printHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 14px;
          margin-bottom: 14px;
        }

        .printBrand {
          color: #0f172a;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .printSub {
          margin-top: 4px;
          color: #475569;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .printMeta {
          text-align: right;
          max-width: 340px;
        }

        .printMeta span,
        .clientBlock span,
        .totalsGrid span {
          display: block;
          color: #64748b;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }

        .printMeta strong,
        .clientBlock strong {
          color: #0f172a;
          font-size: 12px;
          font-weight: 700;
          word-break: break-word;
        }

        .clientBlock {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .calculationBlock {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 13px;
  margin-bottom: 16px;
}

.calculationTitle {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.calculationGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.calculationGrid div {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 10px;
}

.calculationGrid span,
.calculationObservation span {
  display: block;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.calculationGrid strong {
  color: #0f172a;
  font-size: 11.5px;
  font-weight: 700;
  word-break: break-word;
}

.calculationObservation {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 10px;
  margin-top: 10px;
}

.calculationObservation p {
  margin: 0;
  color: #0f172a;
  font-size: 11.5px;
  line-height: 1.45;
}

        .clientBlock div,
        .totalsGrid div {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 11px;
        }

        .costTable {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }

        .costTable th {
          background: #f1f5f9;
          color: #334155;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: left;
          padding: 10px;
          border-bottom: 1px solid #cbd5e1;
        }

        .costTable td {
          color: #0f172a;
          font-size: 12px;
          padding: 10px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
        }

        .costTable td strong {
          display: block;
          color: #0f172a;
          font-size: 12.5px;
        }

        .costTable td small {
          display: block;
          margin-top: 4px;
          color: #64748b;
          font-size: 11px;
        }

        .editingRow td {
  background: #f8fafc;
}

.costTable input,
.costTable select,
.costTable textarea {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  color-scheme: light;
  border-radius: 10px;
  font-size: 11.5px;
  font-family: inherit;
  box-sizing: border-box;
}

.costTable input,
.costTable select {
  height: 34px;
  padding: 0 8px;
}

.costTable textarea {
  min-height: 52px;
  padding: 8px;
  margin-top: 6px;
  resize: vertical;
}

.costTable select option {
  background: #ffffff;
  color: #0f172a;
}

.inlineTotal {
  color: #0f172a;
  font-weight: 800;
}

        .emptyCell {
          text-align: center;
          color: #64748b !important;
          padding: 18px !important;
        }

        .totalsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .totalsGrid strong {
          color: #0f172a;
          font-size: 16px;
          font-weight: 800;
        }

        .totalFinal {
          background: #e0f2fe !important;
          border-color: #7dd3fc !important;
        }

        .budgetNote {
          margin: 16px 0 0;
          color: #475569;
          font-size: 11.5px;
          line-height: 1.45;
        }

        @media (max-width: 900px) {
.compactSummaryGrid,
.summaryGrid,
.clientBlock,
.calculationGrid,
.costFormGrid,
.clienteGrid,
.totalsGrid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detailStepper {
  overflow-x: auto;
  grid-template-columns: repeat(7, 170px);
  padding-bottom: 6px;
}

          .panelHeader {
            flex-direction: column;
          }
        }

        @media (max-width: 640px) {
.compactSummaryGrid,
.summaryGrid,
.clientBlock,
.calculationGrid,
.costFormGrid,
.clienteGrid,
.totalsGrid {
  grid-template-columns: 1fr;
}
}

        @media print {
          .page {
            background: #ffffff;
            color: #0f172a;
            padding: 0;
          }

          .shell {
            max-width: none;
            width: 100%;
            margin: 0;
          }

          .noPrint,
          .hero,
          .summaryGrid,
          .adminBox,
          .panelHeader {
            display: none !important;
          }

          .budgetPanel {
            border: none;
            box-shadow: none;
            padding: 0;
            background: #ffffff;
          }

          .printSheet {
            border: none;
            padding: 0;
            margin: 0;
          }
          
        }
        .turnoHeader select.turnoEstadoPill {
  width: 165px !important;
  max-width: 165px !important;
  min-width: 165px !important;
  height: 26px !important;
  min-height: 26px !important;
  flex: 0 0 165px !important;
  align-self: flex-start !important;
  box-sizing: border-box !important;
}
.presentacionRegistroGrid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.observacionRegistroGrid {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
}

.motivoObservacionWide {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  min-width: 0 !important;
}

.motivoObservacionWide textarea {
  width: 100% !important;
  min-height: 130px !important;
  resize: vertical;
}

.resultadoRegistroGrid {
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
}

.documentacionResultadoWide {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  min-width: 0 !important;
}

.documentacionResultadoWide textarea {
  width: 100% !important;
  min-height: 130px !important;
  resize: vertical;
}

.complementarioRow strong {
  font-size: 13px !important;
  font-weight: 500 !important;
  letter-spacing: 0.015em !important;
  line-height: 1.25 !important;
  color: rgba(226, 237, 249, 0.90) !important;
}

.complementarioRow span {
  font-size: 11px !important;
  font-weight: 600 !important;
  letter-spacing: 0.065em !important;
  color: rgba(147, 197, 253, 0.74) !important;
}

.complementarioObs strong {
  font-weight: 500 !important;
  color: rgba(226, 237, 249, 0.82) !important;
}

:global(.collapsibleTextareaBox) {
  width: 100%;
  min-width: 0;
}

:global(.collapsibleTextareaHeader) {
  width: 100%;
  min-height: 42px;
  border-radius: 16px;
  border: 1px solid rgba(56, 189, 248, 0.22);
  background:
    linear-gradient(180deg, rgba(56,189,248,0.10), rgba(56,189,248,0.025)),
    rgba(8, 47, 73, 0.22);
  color: rgba(191, 219, 254, 0.92);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  cursor: pointer;
  text-align: left;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.045),
    0 8px 18px rgba(0,0,0,0.10);
}

:global(.collapsibleTextareaHeader span) {
  color: rgba(125, 211, 252, 0.95);
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
}

:global(.collapsibleTextareaHeader strong) {
  color: rgba(186, 230, 253, 0.94);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

:global(.collapsibleTextareaHeader em) {
  color: rgba(148, 163, 184, 0.88);
  font-size: 11px;
  font-style: normal;
  font-weight: 500;
  white-space: nowrap;
}

:global(.collapsibleTextareaHeader.hasValue) {
  border-color: rgba(34, 197, 94, 0.24);
  background:
    linear-gradient(180deg, rgba(34,197,94,0.12), rgba(34,197,94,0.03)),
    rgba(5, 46, 22, 0.24);
}

:global(.collapsibleTextareaHeader.hasValue strong),
:global(.collapsibleTextareaHeader.hasValue span) {
  color: rgba(187, 247, 208, 0.92);
}

:global(.collapsibleTextareaBody) {
  margin-top: 12px;
}

:global(.collapsibleTextareaBody textarea) {
  width: 100% !important;
  min-height: 130px !important;
  resize: vertical;
  border-radius: 16px !important;
  border: 1px solid rgba(148, 163, 184, 0.24) !important;
  background:
    linear-gradient(180deg, rgba(148, 163, 184, 0.20), rgba(100, 116, 139, 0.12)),
    rgba(30, 41, 59, 0.50) !important;
  color: rgba(241, 245, 249, 0.96) !important;
  padding: 14px 16px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 1.45 !important;
  outline: none !important;
  box-sizing: border-box !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.05),
    0 8px 18px rgba(0,0,0,0.10) !important;
}

:global(.collapsibleTextareaBody textarea::placeholder) {
  color: rgba(148, 163, 184, 0.72) !important;
}

:global(.collapsibleTextareaBody textarea:focus) {
  border-color: rgba(56, 189, 248, 0.34) !important;
  box-shadow:
    0 0 0 3px rgba(56, 189, 248, 0.08),
    inset 0 1px 0 rgba(255,255,255,0.035) !important;
}

.documentacionResultadoWide {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  min-width: 0 !important;
}

.complementarioObservacionesWide {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  min-width: 0 !important;
}
      `}</style>
    </main>
  );
}

function FichaPlaceholder({ title, text }) {
  return (
    <div className="placeholderBox">
      <div>
        <span>Ficha del legajo</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
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

function CollapsibleTextarea({
  title,
  name,
  value,
  onChange,
  placeholder,
  className = "",
}) {
  const hasValue = String(value || "").trim().length > 0;
  const [open, setOpen] = useState(hasValue);

  useEffect(() => {
    if (hasValue) {
      setOpen(true);
    }
  }, [hasValue]);

  return (
    <div className={`collapsibleTextareaBox ${className}`.trim()}>
      <button
        type="button"
        className={`collapsibleTextareaHeader ${open ? "open" : ""} ${
          hasValue ? "hasValue" : ""
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{open ? "−" : "+"}</span>

        <strong>{title}</strong>

        <em>{hasValue ? "Con información cargada" : "Sin cargar"}</em>
      </button>

      {open && (
        <div className="collapsibleTextareaBody">
          <textarea
            className="textareaWide"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>
      )}
    </div>
  );
}