import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  Bell,
  Clock3,
  FileText,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";

const tramitesMock = [
  {
    legajo: "TR-000128",
    fecha: "28/05/2026",
    cliente: "Juan Pérez",
    documento: "20-17616670-4",
    unidad: "AB123CD · Toyota Corolla",
    tramite: "Denuncia de robo / hurto",
    compania: "Sancor Seguros",
    poliza: "POL-45892",
    siniestro: "SIN-99120",
    estado: "En análisis documental",
    documentacion: "Pendiente",
    proximoPaso: "Subir denuncia policial",
  },
  {
    legajo: "TR-000129",
    fecha: "27/05/2026",
    cliente: "María González",
    documento: "27-28444555-8",
    unidad: "AC456EF · Fiat Cronos",
    tramite: "Baja por siniestro",
    compania: "Federación Patronal",
    poliza: "POL-77821",
    siniestro: "SIN-10452",
    estado: "Turno programado",
    documentacion: "Completa",
    proximoPaso: "Turno 03/06 - Registro Seccional",
  },
  {
    legajo: "TR-000130",
    fecha: "25/05/2026",
    cliente: "Transportes Norte SRL",
    documento: "30-71122334-9",
    unidad: "AE789GH · Ford Ranger",
    tramite: "Informe de dominio",
    compania: "Integrity Seguros",
    poliza: "POL-11209",
    siniestro: "—",
    estado: "Finalizado",
    documentacion: "Completa",
    proximoPaso: "Documentación final disponible",
  },
];

const companias = ["Todas", "Sancor Seguros", "Federación Patronal", "Integrity Seguros"];
const estados = ["Todos", "En análisis documental", "Turno programado", "Finalizado"];
const tipos = ["Todos", "Denuncia de robo / hurto", "Baja por siniestro", "Informe de dominio"];

function mostrarMayus(value) {
  const texto = (value || "—").toString().trim();
  if (!texto) return "—";
  return texto.toLocaleUpperCase("es-AR");
}

function getDominioListado(item) {
  const dominio =
    item?.dominio ||
    item?.unidad?.split("·")?.[0]?.trim() ||
    "—";

  return mostrarMayus(dominio);
}

export default function ProductoresPanel() {
  const [busqueda, setBusqueda] = useState("");
  const [compania, setCompania] = useState("Todas");
  const [estado, setEstado] = useState("Todos");
  const [tipo, setTipo] = useState("Todos");
  const [topMenuOpen, setTopMenuOpen] = useState(false);

  const tramitesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return tramitesMock.filter((item) => {
      const coincideBusqueda =
        !q ||
        [
          item.legajo,
          item.cliente,
          item.documento,
          item.unidad,
          item.tramite,
          item.compania,
          item.poliza,
          item.siniestro,
          item.estado,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const coincideCompania = compania === "Todas" || item.compania === compania;
      const coincideEstado = estado === "Todos" || item.estado === estado;
      const coincideTipo = tipo === "Todos" || item.tramite === tipo;

      return coincideBusqueda && coincideCompania && coincideEstado && coincideTipo;
    });
  }, [busqueda, compania, estado, tipo]);

  const totalTramites = tramitesMock.length;

  const totalEnCurso = tramitesMock.filter(
    (t) => t.estado !== "Finalizado" && t.estado !== "Inscripto"
  ).length;

  const totalObservados = tramitesMock.filter(
    (t) =>
      t.documentacion === "Pendiente" ||
      t.estado === "Observado" ||
      t.estado === "En análisis documental"
  ).length;

  const totalInscriptos = tramitesMock.filter(
    (t) => t.estado === "Finalizado" || t.estado === "Inscripto"
  ).length;

  return (
    <main className="page">
      <section className="shell">
        <header className="topbar">
          <div>
            <div className="brand">SAKI</div>
            <div className="brandSub">Portal Empresas</div>
          </div>

          <div className="topActions">
  <button type="button" className="iconButton" title="Avisos">
    <Bell size={17} />
    <span>3</span>
  </button>

  <div className="topMenuWrapper">
    <button
      type="button"
      className="iconButton"
      title="Opciones"
      onClick={() => setTopMenuOpen((prev) => !prev)}
    >
      <MoreVertical size={17} />
    </button>

    {topMenuOpen && (
      <div className="topDropdown">
        <button
          type="button"
          onClick={() => {
            setTopMenuOpen(false);

            const mensaje = encodeURIComponent(
              "Hola SAKI, quiero reportar un inconveniente en el Portal Empresas.\n\nMódulo: Productores asesores de seguros\nDetalle:"
            );

            window.open(`https://wa.me/5491157714212?text=${mensaje}`, "_blank");
          }}
        >
          Reportar inconveniente
        </button>

        <div className="topDropdownDivider" />

        <button
          type="button"
          onClick={() => {
            setTopMenuOpen(false);
            alert("El cierre de sesión se conectará cuando activemos usuarios reales.");
          }}
        >
          Cerrar sesión
        </button>
      </div>
    )}
  </div>
</div>
        </header>

        <section className="hero">
  <div className="heroContent">
    <div className="eyebrow">MANAGEMENT &amp; TRACKING</div>

    <h1 className="moduleTitle">
      Productores
      <span className="moduleDivider">|</span>
      <span className="moduleSuffix">M&amp;T</span>
    </h1>

    <div className="heroSubRow">
      <p>
        Gestión, seguimiento e inscripción de trámites registrales.
      </p>

      <Link href="/empresas/productores/tramites/nuevo" className="topNewButton">
        + Nuevo trámite
      </Link>
    </div>
  </div>
</section>

<section className="searchPanel">
  <div className="searchHeader">
    <div>
      <h2>Buscador</h2>
      <p>
        Buscá por cliente, documento, dominio, trámite, compañía,
        póliza, siniestro o legajo.
      </p>
    </div>
  </div>

  <div className="searchBox">
    <Search size={20} />
    <input
      value={busqueda}
      onChange={(event) => setBusqueda(event.target.value)}
      placeholder="Buscar por cliente, dominio, póliza, siniestro, compañía o legajo..."
    />
  </div>

  <div className="filtersGrid">
    <label>
      <span>Compañía aseguradora</span>
      <select value={compania} onChange={(event) => setCompania(event.target.value)}>
        {companias.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>

    <label>
      <span>Estado</span>
      <select value={estado} onChange={(event) => setEstado(event.target.value)}>
        {estados.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>

    <label>
      <span>Tipo de trámite</span>
      <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
        {tipos.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>

    <label>
      <span>Orden</span>
      <select defaultValue="recientes">
        <option value="recientes">Más recientes primero</option>
        <option value="antiguos">Más antiguos primero</option>
      </select>
    </label>
  </div>
</section>

        <section style={summaryGridStyle}>
          <SummaryCard
            icon={<FileText size={25} />}
            label="Trámites"
            value={totalTramites}
            text="Solicitudes registrales."
            active={estado === "Todos" && tipo === "Todos" && compania === "Todas"}
            onClick={() => {
              setBusqueda("");
              setCompania("Todas");
              setEstado("Todos");
              setTipo("Todos");
            }}
          />

          <SummaryCard
            icon={<Clock3 size={25} />}
            label="En curso"
            value={totalEnCurso}
            text="Trámites en gestión."
            active={estado === "En análisis documental" || estado === "Turno programado"}
            onClick={() => {
              setBusqueda("");
              setCompania("Todas");
              setEstado("En análisis documental");
              setTipo("Todos");
            }}
          />

          <SummaryCard
            icon={<AlertCircle size={25} />}
            label="Observados"
            value={totalObservados}
            text="Pendientes u observados."
            active={busqueda === "observados"}
            onClick={() => {
              setBusqueda("observados");
              setCompania("Todas");
              setEstado("Todos");
              setTipo("Todos");
            }}
          />

          <SummaryCard
            icon={<Bell size={25} />}
            label="Inscriptos"
            value={totalInscriptos}
            text="Con cierre registral positivo."
            active={estado === "Finalizado"}
            onClick={() => {
              setBusqueda("");
              setCompania("Todas");
              setEstado("Finalizado");
              setTipo("Todos");
            }}
          />
        </section>

        <section className="tablePanel">
          <div className="tableHeader tableHeaderOnlyResults">
  <span>{tramitesFiltrados.length} resultado/s</span>
</div>

          <div className="productoresTableHeader">
  <span>Cliente</span>
  <span>Dominio</span>
  <span>Documento</span>
  <span>Trámite</span>
  <span>Póliza</span>
  <span>Compañía</span>
  <span>Detalle</span>
</div>

<div className="productoresTableBody">
  {tramitesFiltrados.map((item) => (
    <Link
      key={item.legajo}
      href={`/empresas/productores/tramites/${item.legajo}`}
      className="productoresTableRow"
    >
      <span>{mostrarMayus(item.cliente)}</span>
      <span>{getDominioListado(item)}</span>
      <span>{mostrarMayus(item.documento)}</span>
      <span>{mostrarMayus(item.tramite)}</span>
      <span>{mostrarMayus(item.poliza)}</span>
      <span>{mostrarMayus(item.compania)}</span>
      <span className="detailButton">DETALLE</span>
    </Link>
  ))}
</div>
        </section>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 12% 10%, rgba(37, 99, 235, 0.18), transparent 32%),
            radial-gradient(circle at 88% 4%, rgba(14, 165, 233, 0.14), transparent 30%),
            linear-gradient(180deg, #031225 0%, #06172e 54%, #07111f 100%);
          color: #e5eefc;
          font-family: Aptos, "Segoe UI", Roboto, Arial, sans-serif;
        }

  .shell {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 26px 0 42px;
  box-sizing: border-box;
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

        .topActions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  color: #eaf2ff;
}

.iconButton {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: rgba(234, 242, 255, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  outline: none;
}

.iconButton:hover {
  background: rgba(37, 99, 235, 0.12);
}

.iconButton span {
  position: absolute;
  top: -5px;
  right: -3px;
  width: 15px;
  height: 15px;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px rgba(3, 18, 34, 0.95);
}

.topMenuWrapper {
  position: relative;
}

.topDropdown {
  position: absolute;
  top: 40px;
  right: 0;
  width: 270px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(96, 165, 250, 0.18);
  background: linear-gradient(
    180deg,
    rgba(7, 30, 55, 0.98),
    rgba(3, 18, 34, 0.98)
  );
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.36);
  z-index: 60;
}

.topDropdown button {
  width: 100%;
  border: none;
  background: transparent;
  color: rgba(231, 238, 248, 0.92);
  padding: 10px 10px;
  border-radius: 9px;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.topDropdown button:hover {
  background: rgba(37, 99, 235, 0.16);
  color: #ffffff;
}

.topDropdownDivider {
  height: 1px;
  background: rgba(148, 163, 184, 0.14);
  margin: 6px 4px;
}

.heroActions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  min-width: 176px;
}

.topNewButton {
  justify-self: end;
  height: 36px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.18);
  border: 1px solid rgba(96, 165, 250, 0.34);
  color: #bfdbfe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.16);
}

.topNewButton:hover {
  background: rgba(37, 99, 235, 0.28);
  border-color: rgba(96, 165, 250, 0.50);
  color: #ffffff;
}

.backLink {
  min-width: 146px;
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
  padding: 22px 0 18px;
}

.heroContent {
  width: 100%;
}

.heroSubRow {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  margin-top: 10px;
  padding-right: 26px;
  box-sizing: border-box;
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

        h1 {
          margin: 0;
          color: rgba(248, 250, 252, 0.96);
          font-size: clamp(27px, 3vw, 38px);
          line-height: 1.12;
          font-weight: 600;
          letter-spacing: -0.018em;
        }

.hero p {
  margin: 0;
  max-width: 620px;
  color: rgba(226, 237, 249, 0.78);
  font-size: 15px;
  line-height: 1.45;
}

        .newButton {
          height: 42px;
          border-radius: 15px;
          background: linear-gradient(180deg, #2563eb, #1d4ed8);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 18px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 650;
          white-space: nowrap;
          box-shadow: 0 16px 34px rgba(37, 99, 235, 0.22);
        }

        .searchPanel,
        .tablePanel {
          margin-top: 16px;
          border-radius: 25px;
          border: 1px solid rgba(148, 163, 184, 0.13);
          background: rgba(3, 18, 34, 0.46);
          padding: 22px;
          box-shadow: 0 20px 56px rgba(0, 0, 0, 0.18);
        }

        .searchHeader h2,
        .tableHeader h2 {
          margin: 0;
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .searchHeader p {
          margin: 6px 0 0;
          color: rgba(168, 196, 232, 0.72);
          font-size: 13px;
          line-height: 1.5;
        }

        .searchBox {
          height: 48px;
          margin-top: 16px;
          border-radius: 17px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(2, 8, 18, 0.30);
          color: rgba(147, 197, 253, 0.85);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 15px;
        }

        .searchBox input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #ffffff;
          font-size: 14px;
          font-family: inherit;
        }

        .searchBox input::placeholder {
          color: rgba(148, 163, 184, 0.64);
        }

        .filtersGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        label span {
          display: block;
          margin-bottom: 7px;
          color: rgba(226, 232, 240, 0.70);
          font-size: 10.8px;
          font-weight: 650;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

select {
  width: 100%;
  height: 43px;
  border-radius: 15px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(2, 8, 18, 0.72);
  color: rgba(226, 232, 240, 0.92);
  padding: 0 12px;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  color-scheme: dark;
  cursor: pointer;
}

select:focus {
  border-color: rgba(96, 165, 250, 0.48);
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.18),
    0 0 22px rgba(37, 99, 235, 0.16);
}

select option {
  background: #071326;
  color: #e5eefc;
  font-size: 13px;
}

select option:checked {
  background: #1d4ed8;
  color: #ffffff;
}

:global(.productoresTableHeader) {
  display: grid;
  grid-template-columns: 1.25fr 0.8fr 1fr 1.35fr 0.85fr 1.1fr 0.65fr;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  color: #608fd5;
  background: rgba(255, 255, 255, 0.02);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  font-weight: 700;
}

:global(.productoresTableBody) {
  display: flex;
  flex-direction: column;
}

:global(.productoresTableRow) {
  display: grid;
  grid-template-columns: 1.25fr 0.8fr 1fr 1.35fr 0.85fr 1.1fr 0.65fr;
  gap: 14px;
  align-items: center;
  padding: 15px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  color: #e5eefc !important;
  font-size: 13px;
  line-height: 1.3;
  text-decoration: none !important;
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease;
}

:global(.productoresTableRow:hover) {
  background: linear-gradient(
    90deg,
    rgba(37, 99, 235, 0.18),
    rgba(14, 165, 233, 0.08)
  );
  box-shadow: inset 3px 0 0 rgba(96, 165, 250, 0.9);
}

:global(.productoresTableRow span) {
  color: rgba(226, 232, 240, 0.88) !important;
  text-decoration: none !important;
}

:global(.productoresTableRow .cellStrong) {
  color: rgba(226, 232, 240, 0.88) !important;
  font-weight: 500;
}

:global(.productoresTableRow .detailButton) {
  justify-self: start;
  min-width: 74px;
  padding: 6px 10px;
  border-radius: 999px;
  text-decoration: none !important;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #dbeafe !important;
  background: rgba(59, 130, 246, 0.10);
  border: 1px solid rgba(59, 130, 246, 0.18);
  white-space: nowrap;
}

        .tableHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .tableHeader span {
          color: rgba(168, 196, 232, 0.68);
          font-size: 12px;
        }

         .detailButton {
          height: 32px;
          border-radius: 12px;
          border: 1px solid rgba(96, 165, 250, 0.18);
          background: rgba(37, 99, 235, 0.12);
          color: #bfdbfe;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 650;
        }
:global(.heroSubRow) {
  width: 100% !important;
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  align-items: center !important;
  gap: 24px !important;
  margin-top: 10px !important;
  padding-right: 34px !important;
  box-sizing: border-box !important;
}

:global(.topNewButton) {
  justify-self: end !important;
  height: 36px !important;
  border-radius: 999px !important;
  background: rgba(37, 99, 235, 0.18) !important;
  border: 1px solid rgba(96, 165, 250, 0.34) !important;
  color: #bfdbfe !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 15px !important;
  text-decoration: none !important;
  font-size: 13px !important;
  font-weight: 650 !important;
  white-space: nowrap !important;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.16) !important;
}

:global(.topNewButton:hover) {
  background: rgba(37, 99, 235, 0.28) !important;
  border-color: rgba(96, 165, 250, 0.50) !important;
  color: #ffffff !important;
}
        @media (max-width: 1040px) {
          .statsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .filtersGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 640px) {
          .shell {
            width: min(100% - 28px, 1240px);
          }

          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .statsGrid,
          .filtersGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const summaryCardStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  borderRadius: "18px",
  border: "1px solid rgba(96,165,250,0.14)",
  background: "rgba(8, 22, 46, 0.66)",
  padding: "14px",
};

const summaryIconStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#60a5fa",
  background: "rgba(37,99,235,0.14)",
  flexShrink: 0,
};

const summaryLabelStyle = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(168,196,232,0.80)",
  fontWeight: 700,
};

const summaryValueStyle = {
  fontSize: "22px",
  fontWeight: 800,
  color: "#ffffff",
  marginTop: "2px",
};

const summaryTextStyle = {
  fontSize: "12px",
  color: "rgba(168,196,232,0.76)",
  marginTop: "2px",
  lineHeight: 1.35,
};

function SummaryCard({ icon, label, value, text, onClick, active }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        ...summaryCardStyle,
        cursor: onClick ? "pointer" : "default",
        border: active
          ? "1px solid rgba(96, 165, 250, 0.85)"
          : summaryCardStyle.border,
        boxShadow: active
          ? "0 18px 45px rgba(37, 99, 235, 0.22)"
          : summaryCardStyle.boxShadow,
      }}
    >
      <div style={summaryIconStyle}>{icon}</div>

      <div>
        <div style={summaryLabelStyle}>{label}</div>
        <div style={summaryValueStyle}>{value}</div>
        <div style={summaryTextStyle}>{text}</div>
      </div>
    </div>
  );
}

function DocPill({ estado }) {
  if (estado === "Completa") {
    return <span className="pill green">{estado}</span>;
  }

  return <span className="pill amber">{estado}</span>;
}