import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function LiquidacionesDia() {
const [loadingUser, setLoadingUser] = useState(true);
const [isAdmin, setIsAdmin] = useState(false);
const [canAccess, setCanAccess] = useState(false);
const [readOnly, setReadOnly] = useState(true);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipo, setTipo] = useState("todos");

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const [loadingGuardadas, setLoadingGuardadas] = useState(false);
const [liquidacionesGuardadas, setLiquidacionesGuardadas] = useState([]);

useEffect(() => {
  verificarUsuario();
  setFechasMesActual();
  cargarLiquidacionesGuardadas();
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

async function cargarLiquidacionesGuardadas() {
  try {
    setLoadingGuardadas(true);

    const { data, error } = await supabase
      .from("dia_liquidaciones")
      .select("id, periodo_desde, periodo_hasta, fecha_emision, titulo, estado, total_general, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar liquidaciones guardadas:", error);
      alert(`No se pudieron cargar las liquidaciones guardadas: ${error.message}`);
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

      setItems(data || []);
    } finally {
      setLoading(false);
    }
  }

  function imprimirDetalle() {
  window.print();
}

  function formatFecha(value) {
    if (!value) return "—";

    return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR");
  }

  function formatMes(value) {
  if (!value) return "SIN MES";

  return new Date(`${value}T00:00:00`)
    .toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    })
    .toLocaleUpperCase("es-AR");
}

function formatMoney(value) {
  const number = Number(value || 0);

  return number.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
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

  const resumen = useMemo(() => {
    return {
      total: items.length,
      informes: items.filter((item) => item.origen_interno === "informe").length,
      prendas: items.filter((item) => item.origen_interno === "prenda").length,
    };
  }, [items]);

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
            <p>
  Este módulo está disponible para usuarios administradores y Administración Franquicias.
</p>

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

<div className="filtersActions">
  <button
    type="button"
    className="sakiAction sakiActionPrimary"
    onClick={buscarLiquidables}
    disabled={loading}
  >
    <span className="actionDot" />
    {loading ? "Buscando..." : "Buscar entregados"}
  </button>

  <button
    type="button"
    className="sakiAction sakiActionSecondary"
    onClick={imprimirDetalle}
  >
    <span className="actionIcon">⎙</span>
    Imprimir detalle
  </button>
</div>
        </section>

        <section className="savedBox">
  <div className="savedHeader">
    <div>
      <h2>Liquidaciones</h2>
      <p>
        Liquidaciones mensuales ya generadas para revisar, emitir, imprimir o continuar el circuito de OC, EM, factura y pago.
      </p>
    </div>

    <button
      type="button"
      className="smallGhostButton"
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
        <article key={liq.id} className="savedItem">
          <div>
            <span>MES</span>
            <strong>{formatMes(liq.periodo_desde)}</strong>
            <small>
              {formatFecha(liq.periodo_desde)} al {formatFecha(liq.periodo_hasta)}
            </small>
          </div>

          <div>
            <span>EMISIÓN</span>
            <strong>{formatFecha(liq.fecha_emision)}</strong>
          </div>

          <div>
            <span>ESTADO</span>
            <strong>{liq.estado || "SIN ESTADO"}</strong>
          </div>

          <div>
            <span>TOTAL</span>
            <strong>{formatMoney(liq.total_general)}</strong>
          </div>

          <div className="savedActionCell">
            <button type="button" className="smallActionButton">
  Detalle
</button>
          </div>
        </article>
      ))}
    </div>
  )}
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
                </article>
              ))}
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
    grid-template-columns: 150px 150px 150px minmax(240px, 1fr);
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
    min-height: 42px;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.14);
    background: rgba(2, 8, 23, 0.64);
    color: #e5eefc;
    padding: 0 14px;
    outline: none;
    box-sizing: border-box;
  }

  .filtersActions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sakiAction {
    min-height: 31px;
    border-radius: 999px;
    border: 1px solid rgba(96, 165, 250, 0.22);
    padding: 0 12px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    white-space: nowrap;
    color: rgba(255, 255, 255, 0.94);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
  }

  .sakiAction:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .sakiActionPrimary {
    background:
      linear-gradient(180deg, rgba(37, 99, 235, 0.78), rgba(29, 78, 216, 0.64)),
      rgba(15, 23, 42, 0.50);
  }

  .sakiActionSecondary {
    background:
      linear-gradient(180deg, rgba(96, 165, 250, 0.10), rgba(30, 64, 175, 0.06)),
      rgba(2, 8, 23, 0.42);
    color: rgba(219, 234, 254, 0.88);
  }

  .actionDot {
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: rgba(191, 219, 254, 0.90);
    box-shadow: 0 0 0 2px rgba(191, 219, 254, 0.10);
  }

  .actionIcon {
    color: rgba(147, 197, 253, 0.75);
    font-size: 10px;
    line-height: 1;
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
    font-size: 21px;
  }

  .savedHeader p {
    margin: 0;
    color: rgba(191, 219, 254, 0.72);
    font-size: 13px;
    line-height: 1.45;
  }

  .savedList {
    display: grid;
    gap: 10px;
  }

  .savedItem {
    border-radius: 18px;
    border: 1px solid rgba(96, 165, 250, 0.14);
    background: rgba(2, 8, 23, 0.34);
    padding: 14px;
    display: grid;
    grid-template-columns: 1.4fr 0.8fr 0.9fr 1fr auto;
    gap: 14px;
    align-items: center;
  }

  .savedItem span {
    display: block;
    color: rgba(147, 197, 253, 0.78);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .savedItem strong {
    display: block;
    color: rgba(241, 245, 249, 0.96);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .savedItem small {
    display: block;
    margin-top: 4px;
    color: rgba(191, 219, 254, 0.58);
    font-size: 11px;
    font-weight: 600;
  }

  .savedActionCell {
    display: flex;
    justify-content: flex-end;
  }

  .smallGhostButton,
  .smallActionButton {
    min-height: 32px;
    border-radius: 999px;
    border: 1px solid rgba(96, 165, 250, 0.24);
    background: rgba(15, 23, 42, 0.42);
    color: rgba(219, 234, 254, 0.94);
    padding: 0 14px;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
    white-space: nowrap;
  }

  .smallActionButton {
    background: rgba(30, 64, 175, 0.42);
  }

  .smallGhostButton:disabled {
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

  @media (max-width: 900px) {
    .hero,
.filtersBox,
.itemMainLine {
  grid-template-columns: 1fr;
}

.filtersActions {
  justify-content: flex-start;
}

    .summaryGrid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

    @media print {
    @page {
      size: A4 landscape;
      margin: 10mm;
    }

    html,
    body {
      background: #ffffff !important;
      color: #000000 !important;
    }

    .page {
      min-height: auto !important;
      background: #ffffff !important;
      color: #000000 !important;
      padding: 0 !important;
      font-family: Arial, sans-serif !important;
    }

    .shell {
      max-width: none !important;
      width: 100% !important;
      margin: 0 !important;
      display: block !important;
    }

    .topbar,
    .hero,
    .filtersBox,
    .summaryGrid,
    .backLink,
    .secondaryButton,
    .primaryButton,
    .filtersActions,
    .sakiAction {
      display: none !important;
    }

    .tableBox {
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
    }

    .tableHeader {
      display: block !important;
      margin-bottom: 10px !important;
      border-bottom: 1px solid #111827 !important;
      padding-bottom: 8px !important;
    }

    .tableHeader h2 {
      color: #000000 !important;
      font-size: 18px !important;
      margin: 0 0 4px !important;
    }

    .tableHeader p {
      color: #374151 !important;
      font-size: 11px !important;
      margin: 0 !important;
    }

    .emptyBox {
      border: 1px solid #d1d5db !important;
      background: #ffffff !important;
      color: #111827 !important;
      padding: 12px !important;
      border-radius: 0 !important;
    }

    .liquidacionList {
      display: grid !important;
      gap: 6px !important;
    }

    .liquidacionItem {
      border: 1px solid #d1d5db !important;
      border-radius: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      padding: 0 !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      box-shadow: none !important;
    }

    .itemMainLine {
      display: grid !important;
      grid-template-columns: 0.8fr 0.9fr 1fr 1.2fr 1fr 1.2fr 1.5fr !important;
      gap: 0 !important;
      align-items: stretch !important;
    }

    .itemMainLine > div {
      border-right: 1px solid #d1d5db !important;
      padding: 6px 7px !important;
      min-height: 34px !important;
    }

    .itemMainLine > div:last-child {
      border-right: 0 !important;
    }

    .itemMainLine span {
      display: block !important;
      color: #111827 !important;
      font-size: 7.5px !important;
      font-weight: 700 !important;
      letter-spacing: 0.04em !important;
      text-transform: uppercase !important;
      margin: 0 0 3px !important;
    }

    .itemMainLine strong {
      color: #000000 !important;
      font-size: 8.5px !important;
      font-weight: 600 !important;
      line-height: 1.2 !important;
      text-transform: uppercase !important;
      word-break: break-word !important;
    }

    .itemMeta {
      margin: 0 !important;
      padding: 5px 7px !important;
      border-top: 1px solid #d1d5db !important;
      color: #374151 !important;
      font-size: 8px !important;
      font-weight: 500 !important;
    }
  }
`;