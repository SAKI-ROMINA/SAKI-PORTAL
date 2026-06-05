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

export default function LiquidacionesDia() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipo, setTipo] = useState("todos");

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const [conceptosPorItem, setConceptosPorItem] = useState({});

  useEffect(() => {
    verificarUsuario();
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
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, email, full_name, name")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error al verificar perfil:", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(profile?.role === "admin");
    } finally {
      setLoadingUser(false);
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
    const key = `${item.origen_interno}-${item.origen_id}`;
    next[key] = prev[key] || [];
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
  return `${item.origen_interno}-${item.origen_id}`;
}

function parseImporte(value) {
  return Number(String(value || "").replace(/\./g, "").replace(",", ".")) || 0;
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

  const resumen = useMemo(() => {
    return {
      total: items.length,
      informes: items.filter((item) => item.origen_interno === "informe").length,
      prendas: items.filter((item) => item.origen_interno === "prenda").length,
    };
  }, [items]);

  const totalGeneral = useMemo(() => {
  return items.reduce((total, item) => {
    const key = `${item.origen_interno}-${item.origen_id}`;

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

  if (!isAdmin) {
    return (
      <main className="page">
        <section className="shell">
          <div className="accessBox">
            <h1>Acceso restringido</h1>
            <p>Este módulo está disponible únicamente para usuarios administradores.</p>

            <Link href="/dia/workspace" className="secondaryButton">
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

          <Link href="/dia/workspace" className="backLink">
            Volver al Workspace
          </Link>
        </header>

        <section className="hero">
          <div>
            <span className="eyebrow">MÓDULO INTERNO</span>
            <h1>Liquidación mensual Día</h1>
            <p>
              Generá el detalle mensual de trabajos entregados para facturación,
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
            />
          </div>

          <div className="field">
            <label>Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(event) => setHasta(event.currentTarget.value)}
            />
          </div>

          <div className="field">
            <label>Tipo</label>
            <select
              value={tipo}
              onChange={(event) => setTipo(event.currentTarget.value)}
            >
              <option value="todos">Todos</option>
              <option value="informe">Informes</option>
              <option value="prenda">Prendas</option>
            </select>
          </div>

          <button
            type="button"
            className="primaryButton"
            onClick={buscarLiquidables}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar entregados"}
          </button>
        </section>

        <section className="tableBox">
          <div className="tableHeader">
            <div>
              <h2>Trabajos entregados</h2>
              <p>
                Vista tipo planilla: tienda, dominio, sector, analista, FRQ,
                garante y trámite. No se muestra módulo en impresión.
              </p>
            </div>
          </div>

          {items.length === 0 && (
            <div className="emptyBox">
              Todavía no hay trabajos cargados para el período seleccionado.
            </div>
          )}

          {items.length > 0 && (
            <div className="liquidacionList">
              {items.map((item) => (
                <article
                  key={`${item.origen_interno}-${item.origen_id}`}
                  className="liquidacionItem"
                >
                  <div className="itemMainLine">
                    <div>
                      <span>TIENDA</span>
                      <strong>{item.tienda || "SIN INFORMAR"}</strong>
                    </div>

                    <div>
                      <span>DOMINIO</span>
                      <strong>{item.dominio || "SIN DOMINIO"}</strong>
                    </div>

                    <div>
                      <span>SECTOR</span>
                      <strong>{item.sector || "SIN INFORMAR"}</strong>
                    </div>

                    <div>
                      <span>ANALISTA</span>
                      <strong>{item.analista || "SIN INFORMAR"}</strong>
                    </div>

                    <div>
                      <span>FRQ</span>
                      <strong>{item.frq || "SIN INFORMAR"}</strong>
                    </div>

                    <div>
                      <span>GARANTE</span>
                      <strong>{item.garante || "SIN INFORMAR"}</strong>
                    </div>

                    <div>
                      <span>TRÁMITE</span>
                      <strong>{formatTramite(item.tramite)}</strong>
                    </div>
                  </div>

                  <div className="itemMeta">
  <span>Fecha entrega: {formatFecha(item.fecha_entrega)}</span>
</div>

<div className="conceptosBox">
  <div className="conceptosHeader">
    <strong>Conceptos</strong>

    <button
      type="button"
      className="smallButton"
      onClick={() => handleAgregarConcepto(item)}
    >
      + Agregar concepto
    </button>
  </div>

  {(conceptosPorItem[getItemKey(item)] || []).length === 0 && (
    <p className="emptyConceptos">
      Todavía no hay conceptos cargados para este dominio.
    </p>
  )}

  {(conceptosPorItem[getItemKey(item)] || []).map((concepto, index) => (
    <div key={concepto.id || index} className="conceptoRow">
      <select
        value={concepto.concepto}
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

      <input
        className="conceptoImporte"
        inputMode="decimal"
        value={concepto.importe}
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

      <button
        type="button"
        className="deleteConceptoButton"
        onClick={() => handleEliminarConcepto(item, index)}
      >
        Eliminar
      </button>
    </div>
  ))}

  <div className="subtotalLine">
    <span>Subtotal dominio</span>
    <strong>{formatMoney(getSubtotalItem(item))}</strong>
  </div>
</div>
                </article>
              ))}
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
    grid-template-columns: 180px 180px 180px auto;
    gap: 14px;
    align-items: end;
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
    min-height: 44px;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #ffffff;
    padding: 0 22px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 14px 28px rgba(37, 99, 235, 0.24);
  }

  .primaryButton:disabled {
    opacity: 0.55;
    cursor: not-allowed;
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
    grid-template-columns: 0.7fr 0.9fr 1.2fr 1.3fr 1.3fr 1.5fr 1.5fr;
    gap: 12px;
    align-items: start;
  }

  .itemMainLine strong {
    color: rgba(241, 245, 249, 0.94);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    text-transform: uppercase;
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
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(96, 165, 250, 0.22);
  background: rgba(30, 64, 175, 0.26);
  color: rgba(219, 234, 254, 0.95);
  padding: 0 14px;
  font-size: 12px;
  font-weight: 800;
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

  @media (max-width: 900px) {
    .hero,
    .filtersBox,
    .itemMainLine {
      grid-template-columns: 1fr;
    }

    .summaryGrid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
`;