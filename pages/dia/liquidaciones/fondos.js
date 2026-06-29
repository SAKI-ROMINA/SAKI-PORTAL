import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  FileText,
  Plus,
  Printer,
  Search,
  Upload,
  WalletCards,
  X,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET_COMPROBANTES = "dia-fondos-comprobantes";

const TIPO_OPTIONS = ["INGRESO", "EGRESO"];
const ESTADO_OPTIONS = ["ABIERTO", "RENDIDO", "CERRADO", "ANULADO"];

const CONCEPTOS_EGRESO = [
  "Informe de dominio",
  "Certificado de dominio",
  "Aranceles Registro",
  "Formularios",
  "Correo",
  "Sellados",
  "Patentes / infracciones",
  "Verificación",
  "Grabado",
  "Honorarios",
  "Otros",
];

const CONCEPTOS_INGRESO = [
  "Fondo inicial",
  "Refuerzo de fondos",
  "Reintegro",
  "Otro ingreso",
];

const emptyForm = {
  id: null,
  fecha: "",
  tipo: "EGRESO",
  estado: "ABIERTO",
  origen_tipo: "manual",
  origen_id: null,
  tienda: "",
  dominio: "",
  frq_nombre: "",
  frq_cuit: "",
  garante_nombre: "",
  garante_cuit: "",
  concepto: "Honorarios",
  detalle: "",
  importe: "",
  comprobante_url: "",
  comprobante_nombre: "",
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function normalizarTexto(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseImporte(value) {
  const clean = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(clean) || 0;
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatFecha(value) {
  if (!value) return "—";
  return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR");
}

function getConceptosPorTipo(tipo) {
  return tipo === "INGRESO" ? CONCEPTOS_INGRESO : CONCEPTOS_EGRESO;
}

function getDefaultConcepto(tipo) {
  return tipo === "INGRESO" ? "Fondo inicial" : "Honorarios";
}

function safeFileName(name) {
  return String(name || "comprobante")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

function mapInformeResultado(row) {
  const tipoInforme = row?.type === "certificado_dominio" ? "certificado" : "informe";

  return {
    origen_tipo: tipoInforme,
    origen_id: row.id,
    dominio: row.dominio || "",
    tienda: row.tienda || "",
    frq_nombre: row.franquiciado || row.frq || row.frq_razon_social || "",
    frq_cuit: row.frq_cuit || "",
    garante_nombre:
      row.titular_dominio ||
      row.identificacion_nombre ||
      row.titular_razon_social ||
      `${row.titular_apellido || ""} ${row.titular_nombres || ""}`.trim() ||
      "",
    garante_cuit:
      row.titular_cuil_cuit ||
      row.titular_cuit ||
      row.identificacion_cuit ||
      "",
    concepto:
      row?.type === "certificado_dominio"
        ? "Certificado de dominio"
        : "Informe de dominio",
    label: `${tipoInforme === "certificado" ? "Certificado" : "Informe"} · ${
      row.dominio || "SIN DOMINIO"
    }`,
  };
}

function mapPrendaResultado(row) {
  return {
    origen_tipo: "prenda",
    origen_id: row.id,
    dominio: row.dominio || "",
    tienda: row.tienda || "",
    frq_nombre: row.frq || row.franquiciado || "",
    frq_cuit: row.frq_cuit || "",
    garante_nombre: row.titular_dominio || row.garante || "",
    garante_cuit: row.titular_cuit || row.titular_cuil_cuit || "",
    concepto: "Aranceles Registro",
    label: `Prenda · ${row.dominio || "SIN DOMINIO"}`,
  };
}

export default function FondosARendir() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [filtros, setFiltros] = useState({
    desde: "",
    hasta: "",
    tipo: "todos",
    estado: "todos",
    dominio: "",
    frq: "",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm, fecha: getToday() });
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [busquedaDominio, setBusquedaDominio] = useState("");
  const [resultadosTramite, setResultadosTramite] = useState([]);
  const [buscandoTramite, setBuscandoTramite] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    verificarAcceso();
  }, []);

  useEffect(() => {
    if (!canAccess) return;
    cargarMovimientos();
  }, [canAccess]);

  async function verificarAcceso() {
    try {
      setLoadingUser(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      setCurrentUserId(userId || null);

      if (!userId) {
        setCanAccess(false);
        setReadOnly(true);
        setIsAdmin(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, sector")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error verificando acceso a Fondos:", error);
        setCanAccess(false);
        setReadOnly(true);
        setIsAdmin(false);
        return;
      }

      const sector = String(profile?.sector || "").toLowerCase();
      const admin = profile?.role === "admin";
      const admFranquicias = sector.includes("franquicias");

      setIsAdmin(admin);
      setReadOnly(!admin);
      setCanAccess(admin || admFranquicias);
    } finally {
      setLoadingUser(false);
    }
  }

  async function cargarMovimientos(filtrosOverride = filtros) {
    try {
      setLoadingMovimientos(true);

      let query = supabase
        .from("dia_fondos_movimientos")
        .select("*")
        .order("fecha", { ascending: true })
        .order("created_at", { ascending: true });

      if (filtrosOverride.desde) {
        query = query.gte("fecha", filtrosOverride.desde);
      }

      if (filtrosOverride.hasta) {
        query = query.lte("fecha", filtrosOverride.hasta);
      }

      if (filtrosOverride.tipo !== "todos") {
        query = query.eq("tipo", filtrosOverride.tipo);
      }

      if (filtrosOverride.estado !== "todos") {
        query = query.eq("estado", filtrosOverride.estado);
      }

      if (filtrosOverride.dominio.trim()) {
        query = query.ilike("dominio", `%${filtrosOverride.dominio.trim()}%`);
      }

      if (filtrosOverride.frq.trim()) {
        query = query.ilike("frq_nombre", `%${filtrosOverride.frq.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error cargando fondos:", error);
        setFeedback("No se pudieron cargar los movimientos.");
        return;
      }

      setMovimientos(data || []);
    } finally {
      setLoadingMovimientos(false);
    }
  }

  function handleFiltroChange(field, value) {
    setFiltros((prev) => ({
      ...prev,
      [field]: field === "dominio" ? value.toUpperCase() : value,
    }));
  }

  async function limpiarFiltros() {
    const next = {
      desde: "",
      hasta: "",
      tipo: "todos",
      estado: "todos",
      dominio: "",
      frq: "",
    };

    setFiltros(next);
    await cargarMovimientos(next);
  }

  function abrirNuevoMovimiento(tipo) {
    if (readOnly) return;

    setForm({
      ...emptyForm,
      fecha: getToday(),
      tipo,
      concepto: getDefaultConcepto(tipo),
    });
    setBusquedaDominio("");
    setResultadosTramite([]);
    setComprobanteFile(null);
    setFormOpen(true);
  }

  function abrirEditarMovimiento(movimiento) {
    if (readOnly || !movimiento) return;

    setForm({
      ...emptyForm,
      ...movimiento,
      importe:
        movimiento.importe !== null && movimiento.importe !== undefined
          ? String(movimiento.importe)
          : "",
    });
    setBusquedaDominio(movimiento.dominio || "");
    setResultadosTramite([]);
    setComprobanteFile(null);
    setFormOpen(true);
  }

  function cerrarFormulario() {
    setFormOpen(false);
    setForm({ ...emptyForm, fecha: getToday() });
    setBusquedaDominio("");
    setResultadosTramite([]);
    setComprobanteFile(null);
  }

  function setFormField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]:
        ["dominio", "tienda"].includes(field) ? value.toUpperCase() : value,
      ...(field === "tipo" ? { concepto: getDefaultConcepto(value) } : {}),
    }));
  }

  async function buscarTramitePorDominio() {
    const dominio = busquedaDominio.trim().toUpperCase();

    if (!dominio) {
      setFeedback("Ingresá un dominio para buscar.");
      return;
    }

    try {
      setBuscandoTramite(true);
      setFeedback("");

      const [informesRes, prendasRes] = await Promise.all([
        supabase
          .from("dia_requests")
          .select("*")
          .ilike("dominio", `%${dominio}%`)
          .limit(8),
        supabase
          .from("dia_request_prendas")
          .select("*")
          .ilike("dominio", `%${dominio}%`)
          .limit(8),
      ]);

      if (informesRes.error) {
        console.error("Error buscando informes:", informesRes.error);
      }

      if (prendasRes.error) {
        console.error("Error buscando prendas:", prendasRes.error);
      }

      const resultados = [
        ...(informesRes.data || []).map(mapInformeResultado),
        ...(prendasRes.data || []).map(mapPrendaResultado),
      ];

      setResultadosTramite(resultados);

      if (!resultados.length) {
        setFeedback("No encontramos trámites con ese dominio. Podés cargar el egreso manualmente.");
      }
    } finally {
      setBuscandoTramite(false);
    }
  }

  function aplicarTramite(resultado) {
    setForm((prev) => ({
      ...prev,
      origen_tipo: resultado.origen_tipo,
      origen_id: resultado.origen_id,
      tienda: resultado.tienda || prev.tienda,
      dominio: resultado.dominio || prev.dominio,
      frq_nombre: resultado.frq_nombre || prev.frq_nombre,
      frq_cuit: resultado.frq_cuit || prev.frq_cuit,
      garante_nombre: resultado.garante_nombre || prev.garante_nombre,
      garante_cuit: resultado.garante_cuit || prev.garante_cuit,
      concepto: resultado.concepto || prev.concepto,
    }));
    setFeedback("Datos del trámite aplicados. Podés editarlos antes de guardar.");
  }

  async function subirComprobante(movimientoId, file) {
    if (!file || !movimientoId) return null;

    const path = `${movimientoId}/${Date.now()}-${safeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_COMPROBANTES)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    return {
      comprobante_url: path,
      comprobante_nombre: file.name,
    };
  }

  async function guardarMovimiento() {
    if (readOnly || saving) return;

    if (!form.fecha) {
      setFeedback("Completá la fecha del movimiento.");
      return;
    }

    if (!form.concepto.trim()) {
      setFeedback("Completá el concepto.");
      return;
    }

    if (parseImporte(form.importe) <= 0) {
      setFeedback("Completá un importe mayor a cero.");
      return;
    }

    try {
      setSaving(true);
      setFeedback("");

      const payload = {
        fecha: form.fecha,
        tipo: form.tipo,
        estado: form.estado,
        origen_tipo: form.origen_tipo || "manual",
        origen_id: form.origen_id || null,
        tienda: form.tienda || null,
        dominio: form.dominio || null,
        frq_nombre: form.frq_nombre || null,
        frq_cuit: form.frq_cuit || null,
        garante_nombre: form.garante_nombre || null,
        garante_cuit: form.garante_cuit || null,
        concepto: form.concepto.trim(),
        detalle: form.detalle || null,
        importe: parseImporte(form.importe),
        actualizado_por: currentUserId,
      };

      let movimientoId = form.id;
      let savedRow = null;

      if (movimientoId) {
        const { data, error } = await supabase
          .from("dia_fondos_movimientos")
          .update(payload)
          .eq("id", movimientoId)
          .select("*")
          .single();

        if (error) throw error;
        savedRow = data;
      } else {
        const { data, error } = await supabase
          .from("dia_fondos_movimientos")
          .insert({
            ...payload,
            creado_por: currentUserId,
          })
          .select("*")
          .single();

        if (error) throw error;

        savedRow = data;
        movimientoId = data.id;
      }

      if (comprobanteFile) {
        const comprobante = await subirComprobante(movimientoId, comprobanteFile);

        const { data, error } = await supabase
          .from("dia_fondos_movimientos")
          .update({
            ...comprobante,
            actualizado_por: currentUserId,
          })
          .eq("id", movimientoId)
          .select("*")
          .single();

        if (error) throw error;
        savedRow = data;
      }

      setFeedback(form.id ? "Movimiento actualizado." : "Movimiento cargado.");
      cerrarFormulario();
      await cargarMovimientos();

      if (detalle?.id === savedRow?.id) {
        setDetalle(savedRow);
      }
    } catch (error) {
      console.error("Error guardando movimiento:", error);
      setFeedback(error?.message || "No se pudo guardar el movimiento.");
    } finally {
      setSaving(false);
    }
  }

  async function anularMovimiento(movimiento) {
    if (readOnly || !movimiento?.id) return;

    const confirmar = window.confirm("¿Querés anular este movimiento? No sumará al saldo.");

    if (!confirmar) return;

    const { data, error } = await supabase
      .from("dia_fondos_movimientos")
      .update({
        estado: "ANULADO",
        actualizado_por: currentUserId,
      })
      .eq("id", movimiento.id)
      .select("*")
      .single();

    if (error) {
      console.error("Error anulando movimiento:", error);
      setFeedback("No se pudo anular el movimiento.");
      return;
    }

    setFeedback("Movimiento anulado.");
    setDetalle(data);
    await cargarMovimientos();
  }

  async function verComprobante(movimiento) {
    if (!movimiento?.comprobante_url) return;

    const { data, error } = await supabase.storage
      .from(BUCKET_COMPROBANTES)
      .createSignedUrl(movimiento.comprobante_url, 60 * 10);

    if (error) {
      console.error("Error abriendo comprobante:", error);
      setFeedback("No se pudo abrir el comprobante.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  function imprimirRendicion() {
    window.print();
  }

  const movimientosConSaldo = useMemo(() => {
    let saldo = 0;

    return movimientos.map((movimiento) => {
      const anulado = movimiento.estado === "ANULADO";
      const importe = Number(movimiento.importe || 0);

      if (!anulado) {
        saldo += movimiento.tipo === "INGRESO" ? importe : -importe;
      }

      return {
        ...movimiento,
        saldo_acumulado: saldo,
      };
    });
  }, [movimientos]);

  const resumen = useMemo(() => {
    return movimientos.reduce(
      (acc, movimiento) => {
        if (movimiento.estado === "ANULADO") return acc;

        const importe = Number(movimiento.importe || 0);

        if (movimiento.tipo === "INGRESO") {
          acc.ingresos += importe;
        } else {
          acc.egresos += importe;
        }

        acc.saldo = acc.ingresos - acc.egresos;

        return acc;
      },
      { ingresos: 0, egresos: 0, saldo: 0 }
    );
  }, [movimientos]);

  const periodoImpresion =
    filtros.desde || filtros.hasta
      ? `${filtros.desde ? formatFecha(filtros.desde) : "Inicio"} al ${
          filtros.hasta ? formatFecha(filtros.hasta) : "Hoy"
        }`
      : "Sin filtro de fechas";

  if (loadingUser) {
    return (
      <main className="page">
        <section className="shell">Verificando acceso...</section>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (!canAccess) {
    return (
      <main className="page">
        <section className="shell card">
          <h1>Acceso restringido</h1>
          <p>Este módulo está disponible para usuarios administradores y Administración Franquicias.</p>
          <Link href="/dia/liquidaciones" className="backLink">
            Volver a Liquidaciones
          </Link>
        </section>
        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="shell screenOnly">
        <header className="topbar">
          <div>
            <div className="brand">SAKI</div>
            <div className="brandSub">Liquidaciones Día</div>
          </div>

          <Link href="/dia/liquidaciones" className="backLink">
            <ArrowLeft size={16} />
            Volver a Liquidaciones
          </Link>
        </header>

        <section className="hero">
          <div>
            <span className="eyebrow">CUENTA CORRIENTE</span>
            <h1>Fondos a rendir</h1>
            <p>
              Registro de fondos recibidos, gastos realizados, comprobantes y saldo pendiente para rendir.
            </p>
          </div>

          <div className="summaryCards">
            <div>
              <span>Total ingresado</span>
              <strong>{formatMoney(resumen.ingresos)}</strong>
            </div>
            <div>
              <span>Total egresado</span>
              <strong>{formatMoney(resumen.egresos)}</strong>
            </div>
            <div>
              <span>Saldo pendiente</span>
              <strong>{formatMoney(resumen.saldo)}</strong>
            </div>
          </div>
        </section>

        <section className="filtersBox">
          <div className="field">
            <label>Desde</label>
            <input
              type="date"
              value={filtros.desde}
              onChange={(event) => handleFiltroChange("desde", event.currentTarget.value)}
            />
          </div>

          <div className="field">
            <label>Hasta</label>
            <input
              type="date"
              value={filtros.hasta}
              onChange={(event) => handleFiltroChange("hasta", event.currentTarget.value)}
            />
          </div>

          <div className="field">
            <label>Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(event) => handleFiltroChange("tipo", event.currentTarget.value)}
            >
              <option value="todos">Todos</option>
              {TIPO_OPTIONS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Estado</label>
            <select
              value={filtros.estado}
              onChange={(event) => handleFiltroChange("estado", event.currentTarget.value)}
            >
              <option value="todos">Todos</option>
              {ESTADO_OPTIONS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Dominio</label>
            <input
              value={filtros.dominio}
              onChange={(event) => handleFiltroChange("dominio", event.currentTarget.value)}
              placeholder="Dominio"
            />
          </div>

          <div className="field">
            <label>FRQ</label>
            <input
              value={filtros.frq}
              onChange={(event) => handleFiltroChange("frq", event.currentTarget.value)}
              placeholder="Franquiciado"
            />
          </div>

          <div className="filterActions">
            <button type="button" className="primaryButton" onClick={() => cargarMovimientos()} disabled={loadingMovimientos}>
              {loadingMovimientos ? "Buscando..." : "Buscar"}
            </button>
            <button type="button" className="secondaryButton" onClick={limpiarFiltros}>
              Limpiar
            </button>
            <button type="button" className="secondaryButton" onClick={imprimirRendicion}>
              <Printer size={15} />
              Imprimir rendición
            </button>
          </div>
        </section>

        {feedback && <p className="feedback">{feedback}</p>}

        <section className="actionsRow">
          {!readOnly && (
            <>
              <button type="button" className="primaryButton" onClick={() => abrirNuevoMovimiento("INGRESO")}>
                <Plus size={15} />
                Nuevo ingreso
              </button>
              <button type="button" className="primaryButton dangerSoft" onClick={() => abrirNuevoMovimiento("EGRESO")}>
                <Plus size={15} />
                Nuevo egreso
              </button>
            </>
          )}
        </section>

        <section className="tableCard">
          <div className="tableHeader">
            <div>
              <h2>Cuenta corriente</h2>
              <p>Ingresos, egresos, comprobantes y saldo acumulado.</p>
            </div>
          </div>

          <div className="movementTable">
            <div className="movementRow movementHead">
              <span>Fecha</span>
              <span>Tipo</span>
              <span>Dominio</span>
              <span>Concepto</span>
              <span>Importe</span>
              <span>Saldo</span>
              <span>Comprobante</span>
              <span>Detalle</span>
            </div>

            {movimientosConSaldo.length === 0 && (
              <div className="emptyBox">No hay movimientos para los filtros seleccionados.</div>
            )}

            {movimientosConSaldo.map((movimiento) => (
              <div key={movimiento.id} className={`movementRow ${movimiento.estado === "ANULADO" ? "anulado" : ""}`}>
                <span>{formatFecha(movimiento.fecha)}</span>
                <strong className={movimiento.tipo === "INGRESO" ? "ingreso" : "egreso"}>{movimiento.tipo}</strong>
                <span>{movimiento.dominio || "—"}</span>
                <span>{movimiento.concepto || "—"}</span>
                <strong>{formatMoney(movimiento.importe)}</strong>
                <strong>{formatMoney(movimiento.saldo_acumulado)}</strong>
                <span>
                  {movimiento.comprobante_url ? (
                    <button type="button" className="linkButton" onClick={() => verComprobante(movimiento)}>
                      Ver
                    </button>
                  ) : (
                    "—"
                  )}
                </span>
                <span className="rowActions">
                  <button type="button" className="smallButton" onClick={() => setDetalle(movimiento)}>
                    <Eye size={14} />
                    Detalle
                  </button>
                  {!readOnly && (
                    <button type="button" className="smallButton" onClick={() => abrirEditarMovimiento(movimiento)}>
                      Editar
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="printOnly">
        <header>
          <h1>SAKI</h1>
          <h2>Fondos a rendir</h2>
          <p>Período consultado: {periodoImpresion}</p>
          <p>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</p>
        </header>

        <section className="printSummary">
          <div><span>Total ingresos</span><strong>{formatMoney(resumen.ingresos)}</strong></div>
          <div><span>Total egresos</span><strong>{formatMoney(resumen.egresos)}</strong></div>
          <div><span>Saldo final</span><strong>{formatMoney(resumen.saldo)}</strong></div>
        </section>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Dominio</th>
              <th>Concepto</th>
              <th>Detalle</th>
              <th>Importe</th>
              <th>Saldo acumulado</th>
            </tr>
          </thead>
          <tbody>
            {movimientosConSaldo.map((movimiento) => (
              <tr key={movimiento.id}>
                <td>{formatFecha(movimiento.fecha)}</td>
                <td>{movimiento.tipo}</td>
                <td>{movimiento.dominio || "—"}</td>
                <td>{movimiento.concepto || "—"}</td>
                <td>{movimiento.detalle || "—"}</td>
                <td>{formatMoney(movimiento.importe)}</td>
                <td>{formatMoney(movimiento.saldo_acumulado)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer>
          <strong>Total ingresos: {formatMoney(resumen.ingresos)}</strong>
          <strong>Total egresos: {formatMoney(resumen.egresos)}</strong>
          <strong>Saldo final: {formatMoney(resumen.saldo)}</strong>
        </footer>
      </section>

      {formOpen && (
        <div className="modalOverlay screenOnly">
          <section className="modal">
            <header className="modalHeader">
              <div>
                <h2>{form.id ? "Editar movimiento" : `Nuevo ${form.tipo.toLowerCase()}`}</h2>
                <p>Los datos visibles se guardan como snapshot editable para la rendición.</p>
              </div>
              <button type="button" className="iconButton" onClick={cerrarFormulario}>
                <X size={18} />
              </button>
            </header>

            {form.tipo === "EGRESO" && (
              <section className="searchBox">
                <label>Buscar trámite por dominio</label>
                <div className="searchLine">
                  <input
                    value={busquedaDominio}
                    onChange={(event) => setBusquedaDominio(event.currentTarget.value.toUpperCase())}
                    placeholder="Dominio"
                  />
                  <button type="button" className="secondaryButton" onClick={buscarTramitePorDominio} disabled={buscandoTramite}>
                    <Search size={15} />
                    {buscandoTramite ? "Buscando..." : "Buscar"}
                  </button>
                </div>

                {resultadosTramite.length > 0 && (
                  <div className="resultList">
                    {resultadosTramite.map((resultado) => (
                      <button
                        type="button"
                        key={`${resultado.origen_tipo}-${resultado.origen_id}`}
                        onClick={() => aplicarTramite(resultado)}
                      >
                        <strong>{resultado.label}</strong>
                        <span>{resultado.tienda || "Sin tienda"} · {resultado.frq_nombre || "Sin FRQ"}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            <div className="formGrid">
              <label>
                Fecha
                <input type="date" value={form.fecha} onChange={(event) => setFormField("fecha", event.currentTarget.value)} />
              </label>

              <label>
                Tipo
                <select value={form.tipo} onChange={(event) => setFormField("tipo", event.currentTarget.value)}>
                  {TIPO_OPTIONS.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </label>

              <label>
                Estado
                <select value={form.estado} onChange={(event) => setFormField("estado", event.currentTarget.value)}>
                  {ESTADO_OPTIONS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </select>
              </label>

              <label>
                Concepto
                <select value={form.concepto} onChange={(event) => setFormField("concepto", event.currentTarget.value)}>
                  {getConceptosPorTipo(form.tipo).map((concepto) => (
                    <option key={concepto} value={concepto}>{concepto}</option>
                  ))}
                </select>
              </label>

              <label>
                Importe
                <input value={form.importe} onChange={(event) => setFormField("importe", event.currentTarget.value)} placeholder="$ 0,00" />
              </label>

              <label>
                Origen
                <select value={form.origen_tipo} onChange={(event) => setFormField("origen_tipo", event.currentTarget.value)}>
                  <option value="manual">Manual</option>
                  <option value="informe">Informe</option>
                  <option value="certificado">Certificado</option>
                  <option value="prenda">Prenda</option>
                </select>
              </label>

              <label>
                Dominio
                <input value={form.dominio} onChange={(event) => setFormField("dominio", event.currentTarget.value)} />
              </label>

              <label>
                Tienda
                <input value={form.tienda} onChange={(event) => setFormField("tienda", event.currentTarget.value)} />
              </label>

              <label>
                FRQ
                <input value={form.frq_nombre} onChange={(event) => setFormField("frq_nombre", event.currentTarget.value)} />
              </label>

              <label>
                CUIT FRQ
                <input value={form.frq_cuit} onChange={(event) => setFormField("frq_cuit", event.currentTarget.value)} />
              </label>

              <label>
                Garante / titular
                <input value={form.garante_nombre} onChange={(event) => setFormField("garante_nombre", event.currentTarget.value)} />
              </label>

              <label>
                CUIT garante
                <input value={form.garante_cuit} onChange={(event) => setFormField("garante_cuit", event.currentTarget.value)} />
              </label>

              <label className="wide">
                Detalle
                <textarea value={form.detalle} onChange={(event) => setFormField("detalle", event.currentTarget.value)} rows={3} />
              </label>

              <label className="wide">
                Comprobante / recibo
                <input type="file" onChange={(event) => setComprobanteFile(event.currentTarget.files?.[0] || null)} />
                {form.comprobante_nombre && <small>Actual: {form.comprobante_nombre}</small>}
              </label>
            </div>

            <footer className="modalActions">
              <button type="button" className="primaryButton" onClick={guardarMovimiento} disabled={saving}>
                {saving ? "Guardando..." : "Guardar movimiento"}
              </button>
              <button type="button" className="secondaryButton" onClick={cerrarFormulario}>
                Cancelar
              </button>
            </footer>
          </section>
        </div>
      )}

      {detalle && (
        <div className="modalOverlay screenOnly">
          <section className="modal detailModal">
            <header className="modalHeader">
              <div>
                <h2>Detalle del movimiento</h2>
                <p>{detalle.tipo} · {detalle.estado}</p>
              </div>
              <button type="button" className="iconButton" onClick={() => setDetalle(null)}>
                <X size={18} />
              </button>
            </header>

            <div className="detailGrid">
              <Detail label="Tienda" value={detalle.tienda} />
              <Detail label="FRQ" value={detalle.frq_nombre} />
              <Detail label="CUIT FRQ" value={detalle.frq_cuit} />
              <Detail label="Garante / titular" value={detalle.garante_nombre} />
              <Detail label="CUIT garante" value={detalle.garante_cuit} />
              <Detail label="Dominio" value={detalle.dominio} />
              <Detail label="Concepto" value={detalle.concepto} />
              <Detail label="Detalle completo" value={detalle.detalle} />
              <Detail label="Estado" value={detalle.estado} />
              <Detail label="Usuario que cargó" value={detalle.creado_por} />
              <Detail label="Fecha de carga" value={formatFecha(detalle.created_at)} />
              <Detail label="Comprobante" value={detalle.comprobante_nombre || "—"} />
            </div>

            <footer className="modalActions">
              {detalle.comprobante_url && (
                <button type="button" className="secondaryButton" onClick={() => verComprobante(detalle)}>
                  <FileText size={15} />
                  Ver comprobante
                </button>
              )}
              {!readOnly && (
                <>
                  <button type="button" className="primaryButton" onClick={() => abrirEditarMovimiento(detalle)}>
                    Editar
                  </button>
                  {detalle.estado !== "ANULADO" && (
                    <button type="button" className="dangerButton" onClick={() => anularMovimiento(detalle)}>
                      Anular
                    </button>
                  )}
                </>
              )}
            </footer>
          </section>
        </div>
      )}

      <style jsx>{styles}</style>
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

const styles = `
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
    max-width: 1240px;
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

  .backLink,
  .secondaryButton,
  .primaryButton,
  .smallButton,
  .dangerButton,
  .linkButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
  }

  .backLink,
  .secondaryButton {
    min-height: 36px;
    border: 1px solid rgba(147, 197, 253, 0.24);
    background: rgba(15, 23, 42, 0.54);
    color: rgba(219, 234, 254, 0.94);
    padding: 0 14px;
  }

  .primaryButton {
    min-height: 36px;
    border: 1px solid rgba(96, 165, 250, 0.22);
    background: linear-gradient(180deg, rgba(37, 99, 235, 0.78), rgba(29, 78, 216, 0.64));
    color: #ffffff;
    padding: 0 15px;
  }

  .dangerSoft {
    background: linear-gradient(135deg, #0f766e, #115e59);
  }

  .dangerButton {
    min-height: 36px;
    border: 1px solid rgba(248, 113, 113, 0.30);
    background: rgba(127, 29, 29, 0.45);
    color: #fecaca;
    padding: 0 14px;
  }

  button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .hero {
    margin-top: 18px;
    border-radius: 28px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: linear-gradient(135deg, rgba(8, 47, 73, 0.72), rgba(3, 18, 34, 0.72));
    padding: 24px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 20px;
    align-items: end;
  }

  .eyebrow {
    color: rgba(147, 197, 253, 0.92);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.14em;
  }

  h1 {
    margin: 8px 0;
    color: #ffffff;
    font-size: 32px;
    font-weight: 650;
  }

  p {
    margin: 0;
    color: rgba(219, 234, 254, 0.72);
    line-height: 1.5;
  }

  .summaryCards {
    display: grid;
    grid-template-columns: repeat(3, 150px);
    gap: 10px;
  }

  .summaryCards div {
    border-radius: 18px;
    border: 1px solid rgba(96, 165, 250, 0.16);
    background: rgba(2, 8, 23, 0.34);
    padding: 14px;
  }

  .summaryCards span,
  .movementRow span,
  .detailGrid span {
    color: rgba(147, 197, 253, 0.76);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .summaryCards strong {
    display: block;
    margin-top: 7px;
    color: #ffffff;
    font-size: 18px;
  }

  .filtersBox,
  .tableCard {
    margin-top: 18px;
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: rgba(3, 18, 34, 0.42);
    padding: 18px;
  }

  .filtersBox {
    display: grid;
    grid-template-columns: repeat(6, minmax(120px, 1fr));
    gap: 12px;
    align-items: end;
  }

  .field,
  .formGrid label,
  .searchBox {
    display: grid;
    gap: 7px;
  }

  label {
    color: rgba(147, 197, 253, 0.82);
    font-size: 12px;
    font-weight: 800;
  }

  input,
  select,
  textarea {
    width: 100%;
    min-height: 42px;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.14);
    background: rgba(2, 8, 23, 0.64);
    color: #e5eefc;
    padding: 0 13px;
    outline: none;
    box-sizing: border-box;
  }

  textarea {
    padding-top: 10px;
    resize: vertical;
  }

  .filterActions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  .feedback {
    margin-top: 12px;
    border: 1px solid rgba(96, 165, 250, 0.22);
    border-radius: 16px;
    background: rgba(37, 99, 235, 0.14);
    color: rgba(219, 234, 254, 0.95);
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 700;
  }

  .actionsRow {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  .tableHeader {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  .tableHeader h2 {
    margin: 0 0 4px;
    color: #ffffff;
    font-size: 20px;
  }

  .movementTable {
    display: grid;
    gap: 8px;
  }

  .movementRow {
    display: grid;
    grid-template-columns: 92px 76px 100px minmax(150px, 1fr) 110px 110px 100px 170px;
    gap: 10px;
    align-items: center;
    border-radius: 16px;
    border: 1px solid rgba(96, 165, 250, 0.13);
    background: rgba(2, 8, 23, 0.34);
    padding: 12px;
  }

  .movementHead {
    background: rgba(15, 23, 42, 0.70);
  }

  .movementRow strong {
    color: #f8fafc;
    font-size: 13px;
  }

  .ingreso {
    color: #86efac !important;
  }

  .egreso {
    color: #fca5a5 !important;
  }

  .anulado {
    opacity: 0.55;
  }

  .rowActions {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
  }

  .smallButton {
    min-height: 30px;
    border: 1px solid rgba(147, 197, 253, 0.22);
    background: rgba(15, 23, 42, 0.58);
    color: rgba(219, 234, 254, 0.94);
    padding: 0 10px;
    font-size: 11px;
  }

  .linkButton {
    border: none;
    background: transparent;
    color: #93c5fd;
    padding: 0;
  }

  .emptyBox {
    border-radius: 16px;
    border: 1px dashed rgba(147, 197, 253, 0.24);
    color: rgba(219, 234, 254, 0.80);
    padding: 16px;
  }

  .modalOverlay {
    position: fixed;
    inset: 0;
    background: rgba(2, 8, 23, 0.72);
    display: grid;
    place-items: center;
    padding: 18px;
    z-index: 50;
  }

  .modal {
    width: min(960px, 100%);
    max-height: calc(100vh - 36px);
    overflow: auto;
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: #031222;
    padding: 20px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  }

  .detailModal {
    width: min(760px, 100%);
  }

  .modalHeader {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .modalHeader h2 {
    margin: 0 0 4px;
    color: #ffffff;
  }

  .iconButton {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: 1px solid rgba(147, 197, 253, 0.24);
    background: rgba(15, 23, 42, 0.54);
    color: #dbeafe;
    cursor: pointer;
  }

  .searchBox {
    border-radius: 18px;
    border: 1px solid rgba(96, 165, 250, 0.14);
    background: rgba(2, 8, 23, 0.30);
    padding: 14px;
    margin-bottom: 14px;
  }

  .searchLine {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
  }

  .resultList {
    display: grid;
    gap: 8px;
    margin-top: 8px;
  }

  .resultList button {
    border: 1px solid rgba(147, 197, 253, 0.20);
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.52);
    color: #e5eefc;
    padding: 10px 12px;
    text-align: left;
    cursor: pointer;
  }

  .resultList span {
    display: block;
    margin-top: 3px;
    color: rgba(219, 234, 254, 0.70);
    font-size: 12px;
  }

  .formGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .wide {
    grid-column: 1 / -1;
  }

  .modalActions {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  .detailGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .detailGrid div {
    border-radius: 14px;
    border: 1px solid rgba(96, 165, 250, 0.13);
    background: rgba(2, 8, 23, 0.34);
    padding: 12px;
  }

  .detailGrid strong {
    display: block;
    margin-top: 6px;
    color: #f8fafc;
    font-size: 13px;
    white-space: pre-wrap;
  }

  .printOnly {
    display: none;
  }

  @media (max-width: 960px) {
    .hero,
    .filtersBox,
    .formGrid,
    .detailGrid,
    .searchLine {
      grid-template-columns: 1fr;
    }

    .summaryCards {
      grid-template-columns: 1fr;
    }

    .movementRow {
      grid-template-columns: 1fr;
    }

    .filterActions,
    .actionsRow {
      justify-content: stretch;
    }
  }

  @media print {
    @page {
      size: A4 portrait;
      margin: 12mm;
    }

    .screenOnly {
      display: none !important;
    }

    .page {
      background: #ffffff !important;
      color: #111827 !important;
      padding: 0 !important;
      font-family: Arial, sans-serif !important;
    }

    .printOnly {
      display: block !important;
    }

    .printOnly header {
      border-bottom: 2px solid #111827;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }

    .printOnly h1 {
      margin: 0 0 4px;
      color: #111827;
      font-size: 24px;
      letter-spacing: 0.16em;
    }

    .printOnly h2 {
      margin: 0 0 6px;
      color: #111827;
      font-size: 16px;
    }

    .printOnly p {
      color: #374151;
      font-size: 11px;
      margin: 2px 0;
    }

    .printSummary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }

    .printSummary div {
      border: 1px solid #d1d5db;
      padding: 8px;
    }

    .printSummary span {
      display: block;
      color: #374151;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .printSummary strong {
      display: block;
      margin-top: 4px;
      color: #111827;
      font-size: 13px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }

    th,
    td {
      border-bottom: 1px solid #e5e7eb;
      padding: 6px 4px;
      text-align: left;
      vertical-align: top;
    }

    th {
      color: #111827;
      font-size: 9px;
      text-transform: uppercase;
    }

    footer {
      display: flex;
      justify-content: flex-end;
      gap: 14px;
      border-top: 2px solid #111827;
      margin-top: 14px;
      padding-top: 10px;
      color: #111827;
      font-size: 11px;
    }
  }
`;
