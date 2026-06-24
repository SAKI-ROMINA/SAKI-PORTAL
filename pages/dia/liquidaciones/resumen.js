import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

const CONCEPTOS_LIQUIDACION_DIA = [
  "ARANCELES REGISTRO",
  "CORREO",
  "HONORARIOS",
  "HONORARIOS ADICIONALES POR OBSERVACIÓN",
  "HONORARIOS ADICIONALES POR JURISDICCIÓN INTERIOR DE LA PROV. DE BS. AS. (EXCLUYE CONURBANO BONAERENSE)",
  "HONORARIOS ADICIONALES POR JURISDICCIÓN RESTO DE LAS PROVINCIAS",
  "FORMULARIO N° 03",
  "FORMULARIO N° 02",
  "FORMULARIO 59",
];

const SECTORES_DIA_LIQUIDACION = [
  "Adm. Franquicias",
  "Asuntos Jurídicos",
  "Cobranzas y Créditos",
];

export default function ResumenMensualLiquidaciones() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canAccess, setCanAccess] = useState(false);
  const [readOnly, setReadOnly] = useState(true);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipo, setTipo] = useState("todos");

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const [savingLiquidacion, setSavingLiquidacion] = useState(false);
const [liquidacionGuardadaId, setLiquidacionGuardadaId] = useState(null);

const [liquidacionesGuardadas, setLiquidacionesGuardadas] = useState([]);
const [loadingGuardadas, setLoadingGuardadas] = useState(false);

  const [conceptosPorItem, setConceptosPorItem] = useState({});
  const [itemsAbiertos, setItemsAbiertos] = useState({});

  const [editingItemKey, setEditingItemKey] = useState(null);
const [analistasOptions, setAnalistasOptions] = useState([]);

useEffect(() => {
  verificarUsuario();
  cargarAnalistas();
  cargarLiquidacionesGuardadas();
  setFechasMesActual();
}, []);

  function setFechasMesActual() {
    const hoy = new Date();
    const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    setDesde(primero.toISOString().slice(0, 10));
    setHasta(ultimo.toISOString().slice(0, 10));
  }

  async function verificarUsuario() {
    try {
      setLoadingUser(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        setIsAdmin(false);
        setCanAccess(false);
        setReadOnly(true);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, sector, email, full_name, name")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error al verificar perfil:", error);
        setIsAdmin(false);
        setCanAccess(false);
        setReadOnly(true);
        return;
      }

      const sector = String(profile?.sector || "").toLowerCase();
      const esAdmin = profile?.role === "admin";
      const esAdmFranquicias = sector.includes("franquicias");

      setIsAdmin(esAdmin);
      setCanAccess(esAdmin || esAdmFranquicias);
      setReadOnly(!esAdmin);
    } finally {
      setLoadingUser(false);
    }
  }

async function cargarAnalistas() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, name, email, sector, role")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error al cargar analistas:", error);
    return;
  }

  const opciones = (data || [])
    .map((user) => ({
      id: user.id,
      nombre:
        user.full_name ||
        user.name ||
        user.email ||
        "SIN NOMBRE",
      sector: user.sector || "",
    }))
    .filter((user) => user.nombre);

  setAnalistasOptions(opciones);
}

async function cargarLiquidacionesGuardadas() {
  try {
    setLoadingGuardadas(true);

    const { data, error } = await supabase
      .from("dia_liquidaciones")
      .select("id, periodo_desde, periodo_hasta, fecha_emision, estado, total_general, created_at")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Error al cargar liquidaciones guardadas:", error);
      return;
    }

    setLiquidacionesGuardadas(data || []);
  } finally {
    setLoadingGuardadas(false);
  }
}

  async function buscarLiquidables() {
    if (!desde || !hasta) {
      alert("Seleccioná fecha desde y fecha hasta.");
      return;
    }

    try {
      setLoading(true);

      let query = supabase
        .from("dia_liquidables_base")
        .select("*")
        .gte("fecha_entrega", desde)
        .lte("fecha_entrega", hasta)
        .order("fecha_entrega", { ascending: true })
        .order("tienda", { ascending: true })
        .order("dominio", { ascending: true });

      if (tipo !== "todos") {
        query = query.eq("origen_interno", tipo);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error al buscar liquidables:", error);
        alert(`No se pudieron traer los trabajos liquidables: ${error.message}`);
        return;
      }

      const rows = data || [];

setItems(rows);

setConceptosPorItem((prev) => {
  const next = {};

  rows.forEach((item) => {
    const key = getItemKey(item);
    next[key] = prev[key] || [];
  });

  return next;
});
setItemsAbiertos((prev) => {
  const next = {};

  rows.forEach((item) => {
    const key = getItemKey(item);
    next[key] = prev[key] || false;
  });

  return next;
});
    } finally {
      setLoading(false);
    }
  }

  function formatFecha(value) {
    if (!value) return "—";

    return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR");
  }

  function formatTramite(value) {
    const raw = String(value || "").trim();

    const labels = {
      informe_dominio: "INFORME DE DOMINIO",
      certificado_dominio: "CERTIFICADO DE DOMINIO",
      anotaciones_personales: "INFORME DE ANOTACIONES PERSONALES",
      informe_nominal: "INFORME NOMINAL",
      "INSCRIPCIÓN DE PRENDA": "INSCRIPCIÓN DE PRENDA",
    };

    return labels[raw] || raw.replaceAll("_", " ").toLocaleUpperCase("es-AR") || "SIN INFORMAR";
  }

function getItemKey(item) {
  return item.local_id || `${item.origen_interno}-${item.origen_id}`;
}

function parseImporte(value) {
  return Number(String(value || "").replace(/\./g, "").replace(",", ".")) || 0;
}

function formatImporteInput(value) {
  const number = parseImporte(value);

  if (!number) return "";

  return number.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function handleAgregarConcepto(item) {
  const key = getItemKey(item);

  setConceptosPorItem((prev) => ({
    ...prev,
    [key]: [
      ...(prev[key] || []),
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        concepto: "HONORARIOS",
        importe: "",
      },
    ],
  }));

  setItemsAbiertos((prev) => ({
  ...prev,
  [key]: true,
}));
}

function handleCambiarConcepto(item, index, field, value) {
  const key = getItemKey(item);

  setConceptosPorItem((prev) => {
    const rows = [...(prev[key] || [])];

    rows[index] = {
      ...rows[index],
      [field]: value,
    };

    return {
      ...prev,
      [key]: rows,
    };
  });
}

function handleEliminarConcepto(item, index) {
  const key = getItemKey(item);

  setConceptosPorItem((prev) => ({
    ...prev,
    [key]: (prev[key] || []).filter((_, rowIndex) => rowIndex !== index),
  }));
}

function getSubtotalItem(item) {
  const key = getItemKey(item);

  return (conceptosPorItem[key] || []).reduce((total, concepto) => {
    return total + parseImporte(concepto.importe);
  }, 0);
}

function itemEstaAbierto(item) {
  return Boolean(itemsAbiertos[getItemKey(item)]);
}

function handleToggleItem(item) {
  const key = getItemKey(item);

  setItemsAbiertos((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
}

function itemEstaEditando(item) {
  return editingItemKey === getItemKey(item);
}

function handleToggleEditarItem(item) {
  const key = getItemKey(item);

  setEditingItemKey((prev) => (prev === key ? null : key));
}

function handleCambiarItemDato(item, field, value) {
  const key = getItemKey(item);

  setItems((prev) =>
    prev.map((row) =>
      getItemKey(row) === key
        ? {
            ...row,
            [field]:
              field === "fecha_entrega" || field === "sector"
                ? value
                : value.toLocaleUpperCase("es-AR"),
          }
        : row
    )
  );
}

function handleCambiarAnalistaItem(item, value) {
  const key = getItemKey(item);
  const analistaSeleccionado = analistasOptions.find(
    (user) => user.nombre === value
  );

  setItems((prev) =>
    prev.map((row) =>
      getItemKey(row) === key
        ? {
            ...row,
            analista: value,
            sector: row.sector || analistaSeleccionado?.sector || row.sector,
          }
        : row
    )
  );
}

function handleAgregarItemManual(origen) {
  const localId = `manual-${origen}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;

  const nuevoItem = {
    local_id: localId,
    origen_interno: origen,
    origen_id: null,
    fecha_entrega: hasta || new Date().toISOString().slice(0, 10),
    tienda: "",
    dominio: "",
    sector: origen === "prenda" ? "Cobranzas y Créditos" : "",
    analista: "",
    frq: "",
    garante: "",
    tramite:
      origen === "prenda"
        ? "INSCRIPCIÓN DE PRENDA"
        : "INFORME DE DOMINIO",
    is_manual: true,
  };

  setItems((prev) => [nuevoItem, ...prev]);

  setConceptosPorItem((prev) => ({
    ...prev,
    [localId]: [],
  }));

  setItemsAbiertos((prev) => ({
    ...prev,
    [localId]: true,
  }));

  setEditingItemKey(localId);
}

function handleEliminarItemManual(item) {
  const key = getItemKey(item);

  setItems((prev) => prev.filter((row) => getItemKey(row) !== key));

  setConceptosPorItem((prev) => {
    const next = { ...prev };
    delete next[key];
    return next;
  });

  setItemsAbiertos((prev) => {
    const next = { ...prev };
    delete next[key];
    return next;
  });

  if (editingItemKey === key) {
    setEditingItemKey(null);
  }
}

function handleQuitarItemLiquidacion(item) {
  const key = getItemKey(item);

  const confirmar = window.confirm(
    "¿Querés quitar este renglón de la liquidación? No se borra el informe ni la prenda original."
  );

  if (!confirmar) return;

  setItems((prev) => prev.filter((row) => getItemKey(row) !== key));

  setConceptosPorItem((prev) => {
    const next = { ...prev };
    delete next[key];
    return next;
  });

  setItemsAbiertos((prev) => {
    const next = { ...prev };
    delete next[key];
    return next;
  });

  if (editingItemKey === key) {
    setEditingItemKey(null);
  }
}

function handleImprimirLiquidacion() {
  if (items.length === 0) {
    alert("No hay datos para imprimir.");
    return;
  }

  const abiertos = {};

  items.forEach((item) => {
    abiertos[getItemKey(item)] = true;
  });

  setItemsAbiertos(abiertos);

  setTimeout(() => {
    window.print();
  }, 150);
}

async function handleAbrirLiquidacionGuardada(liquidacionId) {
  try {
    setLoading(true);

    const { data: liquidacion, error: liquidacionError } = await supabase
      .from("dia_liquidaciones")
      .select("id, periodo_desde, periodo_hasta, fecha_emision, estado, total_general")
      .eq("id", liquidacionId)
      .single();

    if (liquidacionError) {
      console.error("Error al abrir liquidación:", liquidacionError);
      alert(`No se pudo abrir la liquidación: ${liquidacionError.message}`);
      return;
    }

    const { data: itemsGuardados, error: itemsError } = await supabase
      .from("dia_liquidaciones_items")
      .select("*")
      .eq("liquidacion_id", liquidacionId)
      .order("orden", { ascending: true });

    if (itemsError) {
      console.error("Error al cargar ítems de liquidación:", itemsError);
      alert(`No se pudieron cargar los dominios: ${itemsError.message}`);
      return;
    }

    const itemIds = (itemsGuardados || []).map((item) => item.id);

    let conceptosGuardados = [];

    if (itemIds.length > 0) {
      const { data: conceptosData, error: conceptosError } = await supabase
        .from("dia_liquidaciones_conceptos")
        .select("*")
        .in("item_id", itemIds)
        .order("orden", { ascending: true });

      if (conceptosError) {
        console.error("Error al cargar conceptos:", conceptosError);
        alert(`No se pudieron cargar los conceptos: ${conceptosError.message}`);
        return;
      }

      conceptosGuardados = conceptosData || [];
    }

    const itemsNormalizados = (itemsGuardados || []).map((item) => ({
      local_id: `liquidacion-item-${item.id}`,
      liquidacion_item_id: item.id,
      origen_interno: item.origen,
      origen_id: item.origen_id,
      fecha_pedido: item.fecha_pedido || "",
      fecha_entrega: item.fecha_entrega || "",
      tienda: item.tienda || "",
      dominio: item.dominio || "",
      sector: item.sector || "",
      analista: item.analista || "",
      frq: item.frq || "",
      garante: item.garante || "",
      tramite: item.tramite || "",
      is_manual: !item.origen_id,
      is_guardado: true,
    }));

    const conceptosNormalizados = {};

    itemsNormalizados.forEach((item) => {
      const key = getItemKey(item);

      conceptosNormalizados[key] = conceptosGuardados
        .filter((concepto) => concepto.item_id === item.liquidacion_item_id)
        .map((concepto) => ({
          id: concepto.id,
          concepto: concepto.concepto,
          importe: String(concepto.importe || ""),
        }));
    });

    const abiertosNormalizados = {};

    itemsNormalizados.forEach((item) => {
      abiertosNormalizados[getItemKey(item)] = false;
    });

    setLiquidacionGuardadaId(liquidacion.id);
    setDesde(liquidacion.periodo_desde || "");
    setHasta(liquidacion.periodo_hasta || "");
    setItems(itemsNormalizados);
    setConceptosPorItem(conceptosNormalizados);
    setItemsAbiertos(abiertosNormalizados);
    setEditingItemKey(null);

  } catch (err) {
    console.error("Error inesperado al abrir liquidación:", err);
    alert("Ocurrió un error inesperado al abrir la liquidación.");
  } finally {
    setLoading(false);
  }
}

async function handleGuardarLiquidacion() {
  if (savingLiquidacion) return;

  const itemsConConceptos = items
    .map((item, itemIndex) => {
      const key = getItemKey(item);

      const conceptos = (conceptosPorItem[key] || []).filter(
        (concepto) =>
          concepto.concepto &&
          String(concepto.concepto).trim() &&
          parseImporte(concepto.importe) > 0
      );

      const subtotal = conceptos.reduce(
        (total, concepto) => total + parseImporte(concepto.importe),
        0
      );

      return {
        item,
        itemIndex,
        conceptos,
        subtotal,
      };
    })
    .filter((row) => row.conceptos.length > 0);

  if (itemsConConceptos.length === 0) {
    alert("Cargá al menos un concepto con importe para guardar la liquidación.");
    return;
  }

  if (!desde || !hasta) {
    alert("Seleccioná período desde y hasta.");
    return;
  }

  try {
    setSavingLiquidacion(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const totalAGuardar = itemsConConceptos.reduce(
      (total, row) => total + row.subtotal,
      0
    );

    let liquidacionId = liquidacionGuardadaId;

    if (liquidacionId) {
      const { error: updateError } = await supabase
        .from("dia_liquidaciones")
        .update({
          periodo_desde: desde,
          periodo_hasta: hasta,
          fecha_emision: new Date().toISOString().slice(0, 10),
          titulo: "Detalle de trabajos realizados - Día Argentina",
          estado: "BORRADOR",
          total_general: totalAGuardar,
          updated_by: userId,
        })
        .eq("id", liquidacionId);

      if (updateError) {
        console.error("Error al actualizar liquidación:", updateError);
        alert(`No se pudo actualizar la liquidación: ${updateError.message}`);
        return;
      }

      const { data: itemsActuales, error: itemsActualesError } = await supabase
        .from("dia_liquidaciones_items")
        .select("id")
        .eq("liquidacion_id", liquidacionId);

      if (itemsActualesError) {
        console.error("Error al buscar ítems anteriores:", itemsActualesError);
        alert(`No se pudieron revisar los ítems anteriores: ${itemsActualesError.message}`);
        return;
      }

      const itemIdsActuales = (itemsActuales || []).map((item) => item.id);

      if (itemIdsActuales.length > 0) {
        const { error: conceptosDeleteError } = await supabase
          .from("dia_liquidaciones_conceptos")
          .delete()
          .in("item_id", itemIdsActuales);

        if (conceptosDeleteError) {
          console.error("Error al borrar conceptos anteriores:", conceptosDeleteError);
          alert(`No se pudieron reemplazar los conceptos anteriores: ${conceptosDeleteError.message}`);
          return;
        }
      }

      const { error: itemsDeleteError } = await supabase
        .from("dia_liquidaciones_items")
        .delete()
        .eq("liquidacion_id", liquidacionId);

      if (itemsDeleteError) {
        console.error("Error al borrar ítems anteriores:", itemsDeleteError);
        alert(`No se pudieron reemplazar los dominios anteriores: ${itemsDeleteError.message}`);
        return;
      }
    } else {
      const { data: liquidacionNueva, error: liquidacionError } = await supabase
        .from("dia_liquidaciones")
        .insert({
          periodo_desde: desde,
          periodo_hasta: hasta,
          fecha_emision: new Date().toISOString().slice(0, 10),
          titulo: "Detalle de trabajos realizados - Día Argentina",
          estado: "BORRADOR",
          total_general: totalAGuardar,
          created_by: userId,
          updated_by: userId,
        })
        .select("id")
        .single();

      if (liquidacionError) {
        console.error("Error al crear liquidación:", liquidacionError);
        alert(`No se pudo crear la liquidación: ${liquidacionError.message}`);
        return;
      }

      liquidacionId = liquidacionNueva.id;
    }

    const itemsPayload = itemsConConceptos.map((row, index) => ({
      liquidacion_id: liquidacionId,
      origen: row.item.origen_interno || "informe",
      origen_id: row.item.origen_id || null,
      fecha_pedido: row.item.fecha_pedido || null,
      fecha_entrega: row.item.fecha_entrega || null,
      tienda: row.item.tienda || "",
      dominio: row.item.dominio || "",
      sector: row.item.sector || "",
      analista: row.item.analista || "",
      frq: row.item.frq || "",
      garante: row.item.garante || "",
      tramite: row.item.tramite || "",
      subtotal: row.subtotal,
      orden: index,
      created_by: userId,
      updated_by: userId,
    }));

    const { data: itemsInsertados, error: itemsError } = await supabase
      .from("dia_liquidaciones_items")
      .insert(itemsPayload)
      .select("id, orden");

    if (itemsError) {
      console.error("Error al guardar ítems:", itemsError);
      alert(`No se pudieron guardar los dominios: ${itemsError.message}`);
      return;
    }

    const conceptosPayload = [];

    itemsConConceptos.forEach((row, rowIndex) => {
      const itemInsertado = itemsInsertados.find(
        (insertado) => insertado.orden === rowIndex
      );

      if (!itemInsertado?.id) return;

      row.conceptos.forEach((concepto, conceptoIndex) => {
        conceptosPayload.push({
          item_id: itemInsertado.id,
          concepto: concepto.concepto,
          importe: parseImporte(concepto.importe),
          orden: conceptoIndex,
          created_by: userId,
          updated_by: userId,
        });
      });
    });

    if (conceptosPayload.length > 0) {
      const { error: conceptosError } = await supabase
        .from("dia_liquidaciones_conceptos")
        .insert(conceptosPayload);

      if (conceptosError) {
        console.error("Error al guardar conceptos:", conceptosError);
        alert(`No se pudieron guardar los conceptos: ${conceptosError.message}`);
        return;
      }
    }

    setLiquidacionGuardadaId(liquidacionId);
    await cargarLiquidacionesGuardadas();

    alert(
      liquidacionGuardadaId
        ? "Liquidación actualizada correctamente."
        : "Liquidación guardada correctamente."
    );
  } catch (err) {
    console.error("Error inesperado al guardar liquidación:", err);
    alert("Ocurrió un error inesperado al guardar la liquidación.");
  } finally {
    setSavingLiquidacion(false);
  }
}

  const resumen = useMemo(() => {
    return {
      total: items.length,
      informes: items.filter((item) => item.origen_interno === "informe").length,
      prendas: items.filter((item) => item.origen_interno === "prenda").length,
    };
  }, [items]);

  const totalGeneral = useMemo(() => {
  return items.reduce((total, item) => {
    const key = getItemKey(item);

    return (
      total +
      (conceptosPorItem[key] || []).reduce((subtotal, concepto) => {
        return subtotal + parseImporte(concepto.importe);
      }, 0)
    );
  }, 0);
}, [items, conceptosPorItem]);

  if (loadingUser) {
    return (
      <main className="page">
        <section className="shell">
          <p className="loadingText">Verificando acceso...</p>
        </section>

        <style jsx>{styles}</style>
      </main>
    );
  }

  if (!canAccess) {
    return (
      <main className="page">
        <section className="shell">
          <div className="accessBox">
            <h1>Acceso restringido</h1>
            <p>Este módulo está disponible únicamente para usuarios administradores.</p>

            <Link href="/dia" className="secondaryButton">
              Volver al Workspace
            </Link>
          </div>
        </section>

        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="shell">
        <header className="topbar">
          <div>
            <div className="brand">SAKI</div>
            <div className="brandSub">Liquidaciones Día</div>
          </div>

          <Link href="/dia/liquidaciones" className="backLink">
            Volver a Liquidaciones
          </Link>
        </header>

        <section className="hero">
          <div>
            <span className="eyebrow">MÓDULO INTERNO</span>
            <h1>Resumen mensual de trabajos</h1>
            <p>
              Armá el detalle mensual de trabajos entregados para enviar a Día,
              agrupando cada dominio con sus conceptos e importes.
            </p>
          </div>

          <div className="summaryGrid">
            <div>
              <span>Total</span>
              <strong>{resumen.total}</strong>
            </div>

            <div>
              <span>Informes</span>
              <strong>{resumen.informes}</strong>
            </div>

            <div>
              <span>Prendas</span>
              <strong>{resumen.prendas}</strong>
            </div>
          </div>
        </section>

        <section className="filtersBox">
          <div className="field">
            <label>Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(event) => setDesde(event.currentTarget.value)}
              disabled={readOnly}
            />
          </div>

          <div className="field">
            <label>Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(event) => setHasta(event.currentTarget.value)}
              disabled={readOnly}
            />
          </div>

          <div className="field">
            <label>Tipo</label>
            <select
              value={tipo}
              onChange={(event) => setTipo(event.currentTarget.value)}
              disabled={readOnly}
            >
              <option value="todos">Todos</option>
              <option value="informe">Informes</option>
              <option value="prenda">Prendas</option>
            </select>
          </div>

          {!readOnly && (
          <button
            type="button"
            className="primaryButton"
            onClick={buscarLiquidables}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar entregados"}
          </button>
          )}
          {!readOnly && (
          <button
  type="button"
  className="primaryButton saveButton"
  onClick={handleGuardarLiquidacion}
  disabled={savingLiquidacion || items.length === 0}
>
  {savingLiquidacion
  ? "Guardando..."
  : liquidacionGuardadaId
    ? "Actualizar resumen"
    : "Guardar liquidación"}
</button>
          )}

<button
  type="button"
  className="primaryButton printButton"
  onClick={handleImprimirLiquidacion}
  disabled={items.length === 0}
>
  Imprimir resumen de trabajos
</button>
        </section>

        <section className="savedBox">
  <div className="savedHeader">
    <div>
      <h2>Resúmenes mensuales guardados</h2>
      <p>
        {readOnly
          ? "Consultá o abrí un resumen mensual ya guardado para revisar su detalle e imprimirlo."
          : "Consultá o abrí un resumen mensual ya guardado para revisar, ajustar conceptos e imprimir."}
      </p>
    </div>

    <button
      type="button"
      className="smallButton"
      onClick={cargarLiquidacionesGuardadas}
      disabled={loadingGuardadas}
    >
      {loadingGuardadas ? "Actualizando..." : "Actualizar"}
    </button>
  </div>

  {liquidacionesGuardadas.length === 0 && (
    <div className="emptyBox">
      Todavía no hay liquidaciones guardadas.
    </div>
  )}

  {liquidacionesGuardadas.length > 0 && (
    <div className="savedList">
      {liquidacionesGuardadas.map((liq) => (
        <div key={liq.id} className="savedRow">
          <div>
            <span>PERÍODO</span>
            <strong>
              {formatFecha(liq.periodo_desde)} al {formatFecha(liq.periodo_hasta)}
            </strong>
          </div>

          <div>
            <span>EMISIÓN</span>
            <strong>{formatFecha(liq.fecha_emision)}</strong>
          </div>

          <div>
            <span>ESTADO</span>
            <strong>{liq.estado || "BORRADOR"}</strong>
          </div>

          <div>
            <span>TOTAL</span>
            <strong>{formatMoney(liq.total_general)}</strong>
          </div>

          <button
            type="button"
            className="smallButton"
            onClick={() => handleAbrirLiquidacionGuardada(liq.id)}
          >
            {readOnly
              ? "Ver resumen"
              : String(liq.estado || "").trim().toUpperCase() === "BORRADOR"
                ? "Abrir / editar"
                : "Ver resumen"}
          </button>
        </div>
      ))}
    </div>
  )}
</section>

<section className="printHeader">
  <div>
    <h1>SAKI</h1>
    <h2>Resumen mensual de trabajos — Día Argentina</h2>
    <p>
      Período: {formatFecha(desde)} al {formatFecha(hasta)}
    </p>
    <p>
      Fecha de emisión: {formatFecha(new Date().toISOString().slice(0, 10))}
    </p>
  </div>
</section>

        <section className="tableBox">
          <div className="tableHeader">
  <div>
    <h2>Detalle de trabajos incluidos</h2>
    <p>
      Detalle de trabajos que integran el resumen mensual, con sus conceptos,
      subtotales y total.
    </p>
  </div>

  {!readOnly && (
  <div className="tableActions">
    <button
      type="button"
      className="smallButton"
      onClick={() => handleAgregarItemManual("informe")}
    >
      + Agregar informe manual
    </button>

    <button
      type="button"
      className="smallButton"
      onClick={() => handleAgregarItemManual("prenda")}
    >
      + Agregar prenda manual
    </button>
  </div>
  )}
</div>

          {items.length === 0 && (
            <div className="emptyBox">
              Todavía no hay trabajos cargados para el período seleccionado.
            </div>
          )}

          {items.length > 0 && (
  <div className="liquidacionList">
    {items.map((item) => {
      const editando = !readOnly && itemEstaEditando(item);

      return (
        <article
          key={getItemKey(item)}
          className="liquidacionItem"
        >
          <div className="itemMainLine">
            <div>
              <span>TIENDA</span>
              {editando ? (
                <input
                  className="itemInlineInput"
                  value={item.tienda || ""}
                  onChange={(event) =>
                    handleCambiarItemDato(item, "tienda", event.currentTarget.value)
                  }
                  placeholder="SIN INFORMAR"
                />
              ) : (
                <strong>{item.tienda || "SIN INFORMAR"}</strong>
              )}
            </div>

            <div>
              <span>DOMINIO</span>
              {editando ? (
                <input
                  className="itemInlineInput"
                  value={item.dominio || ""}
                  onChange={(event) =>
                    handleCambiarItemDato(item, "dominio", event.currentTarget.value)
                  }
                  placeholder="SIN DOMINIO"
                />
              ) : (
                <strong>{item.dominio || "SIN DOMINIO"}</strong>
              )}
            </div>

            <div>
  <span>PEDIDO / ENTREGA</span>
  {editando ? (
    <div className="pedidoEntregaEdit">
      <input
        type="date"
        className="itemInlineInput"
        value={item.fecha_pedido || ""}
        onChange={(event) =>
          handleCambiarItemDato(item, "fecha_pedido", event.currentTarget.value)
        }
      />

      <input
        type="date"
        className="itemInlineInput"
        value={item.fecha_entrega || ""}
        onChange={(event) =>
          handleCambiarItemDato(item, "fecha_entrega", event.currentTarget.value)
        }
      />
    </div>
  ) : (
    <strong className="pedidoEntregaText">
      P: {formatFecha(item.fecha_pedido)} · E: {formatFecha(item.fecha_entrega)}
    </strong>
  )}
</div>

            <div>
              <span>SECTOR</span>
              {editando ? (
                <select
                  className="itemInlineSelect"
                  value={item.sector || ""}
                  onChange={(event) =>
                    handleCambiarItemDato(item, "sector", event.currentTarget.value)
                  }
                >
                  <option value="">SIN INFORMAR</option>
                  {SECTORES_DIA_LIQUIDACION.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              ) : (
                <strong>{item.sector || "SIN INFORMAR"}</strong>
              )}
            </div>

            <div>
              <span>ANALISTA</span>
              {editando ? (
                <select
                  className="itemInlineSelect"
                  value={item.analista || ""}
                  onChange={(event) =>
                    handleCambiarAnalistaItem(item, event.currentTarget.value)
                  }
                >
                  <option value="">SIN INFORMAR</option>
                  {analistasOptions.map((user) => (
                    <option key={user.id} value={user.nombre}>
                      {user.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <strong>{item.analista || "SIN INFORMAR"}</strong>
              )}
            </div>

            <div>
              <span>FRQ</span>
              {editando ? (
                <input
                  className="itemInlineInput"
                  value={item.frq || ""}
                  onChange={(event) =>
                    handleCambiarItemDato(item, "frq", event.currentTarget.value)
                  }
                  placeholder="SIN INFORMAR"
                />
              ) : (
                <strong>{item.frq || "SIN INFORMAR"}</strong>
              )}
            </div>

            <div>
              <span>TRÁMITE</span>
              {editando ? (
                <input
                  className="itemInlineInput"
                  value={item.tramite || ""}
                  onChange={(event) =>
                    handleCambiarItemDato(item, "tramite", event.currentTarget.value)
                  }
                  placeholder="SIN INFORMAR"
                />
              ) : (
                <strong>{formatTramite(item.tramite)}</strong>
              )}
            </div>
          </div>

          <div className="itemToggleLine">
            <div className="itemActionGroup">
              <button
                type="button"
                className="toggleItemButton"
                onClick={() => handleToggleItem(item)}
              >
                {itemEstaAbierto(item) ? "Ocultar conceptos" : "Ver conceptos"}
              </button>

              {!readOnly && (
              <button
                type="button"
                className="toggleItemButton"
                onClick={() => handleToggleEditarItem(item)}
              >
                {editando ? "Cerrar edición" : "Editar"}
              </button>
              )}

              {!readOnly && (
              <button
  type="button"
  className="miniDangerButton"
  onClick={() => handleQuitarItemLiquidacion(item)}
>
  Quitar
</button>
              )}

            </div>

            <div className="subtotalPreview">
              <span>Subtotal dominio</span>
              <strong>{formatMoney(getSubtotalItem(item))}</strong>
            </div>
          </div>

          {itemEstaAbierto(item) && (
            <>
              
              <div className="conceptosBox open">
                <div className="conceptosHeader">
                  <strong>Conceptos</strong>

                  {!readOnly && (
                  <button
                    type="button"
                    className="smallButton"
                    onClick={() => handleAgregarConcepto(item)}
                  >
                    + Agregar concepto
                  </button>
                  )}
                </div>

                {(conceptosPorItem[getItemKey(item)] || []).length === 0 && (
                  <p className="emptyConceptos">
                    Todavía no hay conceptos cargados para este dominio.
                  </p>
                )}

                {(conceptosPorItem[getItemKey(item)] || []).map(
                  (concepto, index) => (
                    <div key={concepto.id || index} className="conceptoRow">
                      <select
                        value={concepto.concepto}
                        disabled={readOnly}
                        onChange={(event) =>
                          handleCambiarConcepto(
                            item,
                            index,
                            "concepto",
                            event.currentTarget.value
                          )
                        }
                      >
                        {CONCEPTOS_LIQUIDACION_DIA.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      <div className="importeConceptoWrap">
  <input
    className="conceptoImporte"
    inputMode="decimal"
    value={readOnly ? formatImporteInput(concepto.importe) : concepto.importe}
    disabled={readOnly}
    onChange={(event) =>
      handleCambiarConcepto(
        item,
        index,
        "importe",
        event.currentTarget.value
      )
    }
    placeholder="Importe"
  />

  <span className="conceptoImportePrint">
    {formatMoney(parseImporte(concepto.importe))}
  </span>
</div>

                      {!readOnly && (
                      <button
                        type="button"
                        className="deleteConceptoButton"
                        onClick={() => handleEliminarConcepto(item, index)}
                      >
                        Eliminar
                      </button>
                      )}
                    </div>
                  )
                )}

                <div className="subtotalLine">
                  <span>Subtotal dominio</span>
                  <strong>{formatMoney(getSubtotalItem(item))}</strong>
                </div>
              </div>
            </>
          )}
        </article>
      );
    })}
  </div>
)}
          {items.length > 0 && (
  <div className="totalGeneralBox">
    <span>Total general liquidación</span>
    <strong>{formatMoney(totalGeneral)}</strong>
  </div>
)}
        </section>
      </section>

      <style jsx>{styles}</style>
    </main>
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
    max-width: 1180px;
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

  .backLink,
  .secondaryButton {
    min-height: 38px;
    border-radius: 999px;
    border: 1px solid rgba(96, 165, 250, 0.20);
    background: rgba(15, 23, 42, 0.42);
    color: rgba(219, 234, 254, 0.92);
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    cursor: pointer;
  }

  .hero {
    margin-top: 18px;
    border-radius: 26px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: rgba(3, 18, 34, 0.42);
    padding: 24px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 22px;
    align-items: end;
  }

  .eyebrow {
    color: rgba(125, 211, 252, 0.90);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .hero h1 {
    margin: 8px 0 8px;
    color: #ffffff;
    font-size: 30px;
    line-height: 1.1;
  }

  .hero p,
  .tableHeader p,
  .accessBox p {
    margin: 0;
    color: rgba(191, 219, 254, 0.72);
    font-size: 14px;
    line-height: 1.5;
  }

  .summaryGrid {
    display: grid;
    grid-template-columns: repeat(3, 110px);
    gap: 10px;
  }

  .summaryGrid div {
    border-radius: 18px;
    border: 1px solid rgba(96, 165, 250, 0.16);
    background: rgba(15, 23, 42, 0.42);
    padding: 14px;
  }

  .summaryGrid span,
  .itemMainLine span {
    display: block;
    color: rgba(147, 197, 253, 0.78);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .summaryGrid strong {
    color: #ffffff;
    font-size: 24px;
  }

.filtersBox {
  margin-top: 18px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(3, 18, 34, 0.42);
  padding: 18px;
  display: grid;
  grid-template-columns: 145px 145px 135px 1fr 1fr 160px;
  gap: 12px;
  align-items: end;
}

.filtersBox .primaryButton {
  width: 100%;
  padding: 0 14px;
  white-space: nowrap;
}

  .field {
    display: grid;
    gap: 7px;
  }

  .field label {
    color: rgba(147, 197, 253, 0.82);
    font-size: 12px;
    font-weight: 800;
  }

  input,
  select {
    width: 100%;
    min-height: 44px;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.14);
    background: rgba(2, 8, 23, 0.64);
    color: #e5eefc;
    padding: 0 14px;
    outline: none;
    box-sizing: border-box;
  }

  .primaryButton {
    min-height: 38px;
    border: 1px solid rgba(96, 165, 250, 0.22);
    border-radius: 999px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #ffffff;
    padding: 0 15px;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
  }

  .primaryButton:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .saveButton {
  background: linear-gradient(135deg, #0f766e, #115e59);
  box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
}

  .tableBox {
    margin-top: 18px;
    border-radius: 26px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: rgba(3, 18, 34, 0.42);
    padding: 22px;
  }

  .tableHeader {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 18px;
  }

  .tableHeader h2 {
    margin: 0 0 6px;
    color: #ffffff;
    font-size: 22px;
  }

  .emptyBox,
  .accessBox {
    border-radius: 20px;
    border: 1px dashed rgba(147, 197, 253, 0.24);
    background: rgba(15, 23, 42, 0.30);
    color: rgba(219, 234, 254, 0.82);
    padding: 22px;
  }

  .accessBox {
    margin-top: 40px;
  }

  .accessBox h1 {
    margin-top: 0;
  }

  .liquidacionList {
    display: grid;
    gap: 12px;
  }

  .liquidacionItem {
    border-radius: 20px;
    border: 1px solid rgba(96, 165, 250, 0.14);
    background:
      linear-gradient(180deg, rgba(96, 165, 250, 0.055), rgba(96, 165, 250, 0.015)),
      rgba(2, 8, 23, 0.38);
    padding: 16px;
  }

.itemMainLine {
  display: grid;
  grid-template-columns: 0.75fr 0.75fr 1.1fr 1fr 1.05fr 0.9fr 1.25fr;
  gap: 10px;
  align-items: start;
  width: 100%;
}

  .itemMainLine > div {
  min-width: 0;
}

.itemMainLine strong {
  display: block;
  color: rgba(241, 245, 249, 0.94);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

  .itemMeta {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid rgba(148, 163, 184, 0.10);
    color: rgba(191, 219, 254, 0.64);
    font-size: 12px;
    font-weight: 600;
  }

  .conceptosBox {
  margin-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  padding-top: 14px;
}

.conceptosHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.conceptosHeader strong {
  color: rgba(226, 237, 249, 0.92);
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.smallButton {
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid rgba(96, 165, 250, 0.22);
  background: rgba(30, 64, 175, 0.26);
  color: rgba(219, 234, 254, 0.95);
  padding: 0 11px;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
}

.emptyConceptos {
  margin: 0 0 12px;
  color: rgba(191, 219, 254, 0.62);
  font-size: 13px;
}

.conceptoRow {
  display: grid;
  grid-template-columns: 1fr 160px 90px;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.conceptoImporte {
  text-align: right;
}

.deleteConceptoButton {
  min-height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(248, 113, 113, 0.22);
  background: rgba(69, 10, 10, 0.24);
  color: rgba(254, 202, 202, 0.95);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.subtotalLine,
.totalGeneralBox {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 18px;
  margin-top: 12px;
  color: rgba(219, 234, 254, 0.90);
}

.subtotalLine span,
.totalGeneralBox span {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(147, 197, 253, 0.78);
}

.subtotalLine strong,
.totalGeneralBox strong {
  color: #ffffff;
  font-size: 17px;
}

.totalGeneralBox {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
}

.itemToggleLine {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.10);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.toggleItemButton {
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(96, 165, 250, 0.22);
  background: rgba(30, 64, 175, 0.22);
  color: rgba(219, 234, 254, 0.95);
  padding: 0 14px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.subtotalPreview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.subtotalPreview span {
  color: rgba(147, 197, 253, 0.72);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.subtotalPreview strong {
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
}

.conceptosBox.closed {
  display: none;
}

.tableActions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.itemActionGroup {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.itemInlineInput,
.itemInlineSelect {
  min-height: 34px !important;
  border-radius: 12px !important;
  padding: 0 10px !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  background: rgba(2, 8, 23, 0.46) !important;
  border: 1px solid rgba(148, 163, 184, 0.14) !important;
  color: rgba(241, 245, 249, 0.94) !important;
}

.pedidoEntregaText {
  font-size: 12px !important;
  line-height: 1.45 !important;
  letter-spacing: 0.02em;
}

.pedidoEntregaEdit {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

.pedidoEntregaEdit input {
  min-height: 32px !important;
  font-size: 11px !important;
}

.itemInlineInput::placeholder {
  color: rgba(148, 163, 184, 0.58);
}

.fechaEntregaField {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fechaEntregaField span {
  color: rgba(147, 197, 253, 0.72);
  font-size: 12px;
  font-weight: 800;
}

.fechaEntregaField input {
  width: 150px;
  min-height: 34px;
  border-radius: 12px;
}

.fechaEntregaField input:disabled {
  opacity: 0.70;
  cursor: not-allowed;
}

.miniDangerButton {
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(248, 113, 113, 0.22);
  background: rgba(69, 10, 10, 0.24);
  color: rgba(254, 202, 202, 0.95);
  padding: 0 12px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.savedBox {
  margin-top: 18px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(3, 18, 34, 0.42);
  padding: 18px;
}

.savedHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.savedHeader h2 {
  margin: 0 0 6px;
  color: #ffffff;
  font-size: 20px;
}

.savedHeader p {
  margin: 0;
  color: rgba(191, 219, 254, 0.70);
  font-size: 13px;
  line-height: 1.45;
}

.savedList {
  display: grid;
  gap: 10px;
}

.savedRow {
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 0.75fr 0.85fr auto;
  gap: 12px;
  align-items: center;
  border-radius: 18px;
  border: 1px solid rgba(96, 165, 250, 0.13);
  background: rgba(2, 8, 23, 0.34);
  padding: 14px;
}

.savedRow span {
  display: block;
  color: rgba(147, 197, 253, 0.76);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.savedRow strong {
  color: rgba(241, 245, 249, 0.94);
  font-size: 13px;
  font-weight: 700;
}

.printButton {
  min-height: 34px;
  padding: 0 14px;
  background: rgba(30, 64, 175, 0.34);
  border-color: rgba(96, 165, 250, 0.18);
  font-size: 11px;
  font-weight: 750;
  box-shadow: none;
}

.printHeader {
  display: none;
}

    @media (max-width: 900px) {
    .hero,
    .filtersBox,
    .itemMainLine {
      grid-template-columns: 1fr;
    }

    .summaryGrid {
      grid-template-columns: repeat(3, 1fr);
    }

    .savedRow {
      grid-template-columns: 1fr;
    }

    .tableHeader,
    .savedHeader,
    .itemToggleLine {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .importeConceptoWrap {
  width: 100%;
}

.conceptoImportePrint {
  display: none;
}

  @media print {
    .page {
      background: #ffffff !important;
      color: #111827 !important;
      padding: 0 !important;
      font-family: Arial, sans-serif !important;
    }

    .shell {
      max-width: none !important;
      width: 100% !important;
      margin: 0 !important;
    }

    .topbar,
    .hero,
    .filtersBox,
    .savedBox,
    .tableHeader,
    .itemToggleLine,
    .conceptosHeader button,
    .deleteConceptoButton,
    .backLink,
    .primaryButton,
    .smallButton,
    .miniDangerButton {
      display: none !important;
    }

    .printHeader {
      display: block !important;
      margin-bottom: 18px !important;
      padding-bottom: 12px !important;
      border-bottom: 2px solid #111827 !important;
    }

    .printHeader h1 {
      margin: 0 0 4px !important;
      font-size: 24px !important;
      letter-spacing: 0.18em !important;
      color: #111827 !important;
    }

    .printHeader h2 {
      margin: 0 0 8px !important;
      font-size: 15px !important;
      color: #111827 !important;
    }

    .printHeader p {
      margin: 2px 0 !important;
      font-size: 11px !important;
      color: #374151 !important;
    }

    .tableBox {
      border: none !important;
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .liquidacionList {
      display: block !important;
    }

    .liquidacionItem {
      border: 1px solid #d1d5db !important;
      background: #ffffff !important;
      border-radius: 0 !important;
      padding: 10px 12px !important;
      margin-bottom: 12px !important;
      page-break-inside: avoid !important;
    }

    .itemMainLine {
      display: grid !important;
      grid-template-columns: 60px 72px 118px 105px 110px 70px 1fr !important;
      gap: 7px !important;
      border-bottom: 1px solid #e5e7eb !important;
      padding-bottom: 8px !important;
      margin-bottom: 8px !important;
    }

    .itemMainLine span {
      color: #374151 !important;
      font-size: 8px !important;
      font-weight: 700 !important;
      letter-spacing: 0.04em !important;
    }

    .itemMainLine strong {
      color: #111827 !important;
      font-size: 9.5px !important;
      font-weight: 600 !important;
      line-height: 1.25 !important;
    }

    .conceptosBox,
    .conceptosBox.closed {
      display: block !important;
      border-top: none !important;
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    .emptyConceptos {
      display: none !important;
    }

    .conceptoRow {
      display: grid !important;
      grid-template-columns: 1fr 110px !important;
      gap: 8px !important;
      margin-bottom: 4px !important;
    }

.conceptoRow select {
  border: none !important;
  background: transparent !important;
  color: #111827 !important;
  min-height: auto !important;
  padding: 0 !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  appearance: none !important;
}

.conceptoRow input {
  display: none !important;
}

.conceptoImportePrint {
  display: block !important;
  color: #111827 !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  text-align: right !important;
  white-space: nowrap !important;
}

    .conceptoImporte {
      text-align: right !important;
    }

    .subtotalLine {
      display: flex !important;
      justify-content: flex-end !important;
      gap: 12px !important;
      border-top: 1px solid #e5e7eb !important;
      margin-top: 6px !important;
      padding-top: 6px !important;
    }

    .subtotalLine span,
    .subtotalLine strong {
      color: #111827 !important;
      font-size: 10px !important;
    }

    .totalGeneralBox {
      display: flex !important;
      justify-content: flex-end !important;
      border-top: 2px solid #111827 !important;
      margin-top: 16px !important;
      padding-top: 10px !important;
    }

    .totalGeneralBox span,
    .totalGeneralBox strong {
      color: #111827 !important;
    }

    .totalGeneralBox strong {
      font-size: 15px !important;
    }
  }
`;
