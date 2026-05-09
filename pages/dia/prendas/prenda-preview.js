import { useState } from "react";
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
} from "lucide-react";

export default function PreviewPrenda() {
  const [activeFicha, setActiveFicha] = useState(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [avisosOpen, setAvisosOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const estadoActual = "OBSERVADA";
  const fechaEstadoActual = "12/03/2026";
  const fechaVencimiento = "12/03/2031";

  const moneda = "USD";
const importePrenda = "50.000";

  const mostrarVencimiento = estadoActual === "INSCRIPTA";

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

<NavItem active icon={<Home size={22} />} label="Resumen" />
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
  onClick={() => setActiveFicha("notas")}
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
        label="Imprimir ficha"
        onClick={() => window.print()}
      />

      <ToolItem
        icon={<Download size={17} />}
        label="Descargar resumen"
        onClick={() => setActiveFicha("herramientas")}
      />

      <ToolItem
        icon={<Copy size={17} />}
        label="Copiar datos"
        onClick={() => setActiveFicha("herramientas")}
      />

      <ToolItem
        icon={<Share2 size={17} />}
        label="Compartir legajo"
        onClick={() => setActiveFicha("herramientas")}
      />
    </div>
  )}
</div>

<button style={backButtonStyle} title="Volver al listado">
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
<div style={topMenuWrapperStyle}>
  <button
    type="button"
    style={topIconButtonStyle}
    onClick={() => setAvisosOpen((prev) => !prev)}
    title="Avisos del trámite"
  >
    <Bell size={21} />
    <span style={avisosBadgeStyle}>3</span>
  </button>

  {avisosOpen && (
    <div style={avisosDropdownStyle}>
      <div style={avisosHeaderStyle}>Avisos del trámite</div>

      <button type="button" style={avisoItemStyle} onClick={() => setActiveFicha("estado")}>
        <span style={{ ...avisoDotStyle, background: "#ff5d68" }} />
        <span>
          <strong style={avisoTitleStyle}>Observación pendiente</strong>
          <small style={avisoTextStyle}>El trámite requiere subsanación.</small>
        </span>
      </button>

      <button type="button" style={avisoItemStyle} onClick={() => setActiveFicha("historial")}>
        <span style={{ ...avisoDotStyle, background: "#f8c744" }} />
        <span>
          <strong style={avisoTitleStyle}>Estado actualizado</strong>
          <small style={avisoTextStyle}>Observada desde 12/03/2026.</small>
        </span>
      </button>

      <button type="button" style={avisoItemStyle} onClick={() => setActiveFicha("estado")}>
        <span style={{ ...avisoDotStyle, background: "#3b82f6" }} />
        <span>
          <strong style={avisoTitleStyle}>Próxima acción</strong>
          <small style={avisoTextStyle}>Ver detalle de la observación.</small>
        </span>
      </button>

      <div style={topDropdownDividerStyle} />

      <button type="button" style={avisosFooterStyle} onClick={() => setActiveFicha("avisos")}>
        Ver todos los avisos →
      </button>
    </div>
  )}
</div>

  <div style={topMenuWrapperStyle}>
    <button
      type="button"
      style={topIconButtonStyle}
      onClick={() => setTopMenuOpen((prev) => !prev)}
      title="Opciones"
    >
      <MoreVertical size={21} />
    </button>

    {topMenuOpen && (
      <div style={topDropdownStyle}>
        <button type="button" style={topDropdownItemStyle}>
          Inicio
        </button>

        <button type="button" style={topDropdownItemStyle}>
          Panel
        </button>

        <button
          type="button"
          style={topDropdownItemStyle}
          onClick={() => setActiveFicha("reporte")}
        >
          Reportar inconveniente
        </button>

        <div style={topDropdownDividerStyle} />

        <button type="button" style={topDropdownDangerItemStyle}>
          Cerrar sesión
        </button>
      </div>
    )}
  </div>
</div>
        </div>

        <section style={contextCardStyle}>
          <ContextItem icon={<Store size={30} />} label="TIENDA" value="10020" />
          <ContextItem
            icon={<UserRound size={30} />}
            label="FRANQUICIADO"
            value="Prueba1 Prueba2"
          />
          <ContextItem icon={<Car size={32} />} label="DOMINIO" value="AAAAAA25" />
        </section>

<section style={caseOverviewStyle}>
  <div style={caseOverviewTopStyle}>
    <div>
      <div style={caseLabelStyle}>DOMINIO</div>
      <div style={caseDomainStyle}>AAAAAAA25</div>

      <div style={caseMoneyPillStyle}>
  <span style={caseMoneyIconStyle}>
    <CircleDollarSign size={16} />
  </span>
  <span>Importe {moneda} {importePrenda}</span>
  <span style={caseDotStyle}>·</span>
  <span>Orden de Prelación 1° Grado</span>
  <span style={caseDotStyle}>·</span>
  <span>Plazo 36 meses</span>
</div>
    </div>
  </div>

  <div style={caseOverviewDividerStyle} />

  <div style={caseOverviewBottomStyle}>
    <div style={caseStatusBlockStyle}>
      <div style={caseStatusRowStyle}>
        <span style={caseStatusDotStyle} />
        <span style={caseStatusTextStyle}>{estadoActual}</span>
      </div>

      <div style={caseStatusSubStyle}>Pendiente de subsanación</div>

      <div style={caseDateStyle}>
        Desde <strong>{fechaEstadoActual}</strong>
      </div>

      {mostrarVencimiento && (
        <div style={caseDateStyle}>
          Vencimiento <strong>{fechaVencimiento}</strong>
        </div>
      )}
    </div>

    <div style={caseActionBlockStyle}>
      <div style={caseLabelStyle}>PRÓXIMA ACCIÓN</div>

      <div style={caseActionTitleStyle}>Subsanar observación</div>

      <div style={caseActionTextStyle}>
        El trámite presenta observaciones pendientes de subsanación.
      </div>
    </div>

    <div style={caseActionButtonWrapStyle}>
      <button style={caseActionButtonStyle} onClick={() => setActiveFicha("estado")}>
        Ver detalle de la observación →
      </button>
    </div>
  </div>
</section>
        <section style={cardsGridStyle}>
          <InfoCard
  icon={<ShieldCheck size={30} />}
  title="PRENDA"
  items={[
    ["Instrumento", "Escritura 12345"],
    ["Folio", "678"],
    ["Fecha", "10/02/2026"],
    ["Escribanía", "Pérez"],
  ]}
  action="Ver ficha →"
  onClick={() => setActiveFicha("prenda")}
/>

          <InfoCard
            icon={<Store size={30} />}
            title="FRANQUICIADO"
            items={[
              ["Nombre", "Prueba1 Prueba2"],
              ["CUIT", "20-02000000-0"],
              ["Tienda", "10020"],
            ]}
            action="Ver ficha →"
            onClick={() => setActiveFicha("frq")}
          />

          <InfoCard
            icon={<UserRound size={30} />}
            title="GARANTE / TITULAR"
            items={[
              ["Nombre", "Juan Pérez"],
              ["CUIT", "20-11111111-1"],
              ["Titularidad", "70%"],
            ]}
            action="Ver ficha →"
            onClick={() => setActiveFicha("garante")}
          />

          <TimelineCard onClick={() => setActiveFicha("estado")} />
        </section>
      </main>

      {activeFicha && (
        <div style={overlayStyle} onClick={() => setActiveFicha(null)}>
          <div style={floatingCardStyle} onClick={(e) => e.stopPropagation()}>
            <button style={closeButtonStyle} onClick={() => setActiveFicha(null)}>
              ×
            </button>

            {activeFicha === "prenda" && <FichaPrenda />}
{activeFicha === "dominio" && <FichaDominio />}
{activeFicha === "frq" && <FichaFrq />}
{activeFicha === "garante" && <FichaGarante />}
{activeFicha === "estado" && <FichaEstado />}
{activeFicha === "notas" && <FichaNotas />}
{activeFicha === "historial" && <FichaHistorial />}
{activeFicha === "trazabilidad" && <FichaTrazabilidad />}
{activeFicha === "avisos" && <FichaAvisos />}
{activeFicha === "reporte" && <FichaReporte />}
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
`}</style>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div
      style={active ? navItemActiveStyle : navItemStyle}
      onClick={onClick}
      title={label}
    >
      <span style={navIconStyle}>{icon}</span>

      <span className="sidebar-label" style={active ? navLabelActiveStyle : navLabelStyle}>
        {label}
      </span>
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
        {items.map(([label, value]) => (
          <div key={label}>
            <div style={smallLabelStyle}>{label}</div>
            <div style={smallValueStyle}>{value}</div>
          </div>
        ))}
      </div>

      <div style={cardFooterStyle}>
        <button style={linkButtonStyle} onClick={onClick}>
          {action}
        </button>
      </div>
    </div>
  );
}

function TimelineCard({ onClick }) {
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
          color="#ff5d68"
          title="Observada"
          date="12/03/2026"
          text="Pendiente de subsanación"
        />
        <TimelineItem
          color="#f8c744"
          title="En análisis"
          date="05/03/2026"
          text="Documentación en revisión"
        />
        <TimelineItem
          color="#21c985"
          title="Ingresada"
          date="28/02/2026"
          text="Trámite ingresado al sistema"
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
          <h2 style={credentialNameStyle}>Novedades pendientes</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato
          label="Observación"
          value="El trámite presenta observaciones pendientes de subsanación."
          wide
        />
        <FichaDato
          label="Estado"
          value="Observada desde 12/03/2026."
          wide
        />
        <FichaDato
          label="Acción sugerida"
          value="Revisar el detalle de la observación y cargar la documentación correspondiente."
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
      </div>
    </div>
  );
}

function FichaNotas() {
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <MessagesSquare size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Notas del legajo</div>
          <h2 style={credentialNameStyle}>Conversación operativa</h2>
        </div>
      </div>

      <div style={notesContentStyle}>
        <div style={notesListStyle}>
          <NoteMessage
            author="Día"
            sector="Créditos y Cobranzas"
            date="12/03/2026 · 10:32"
            text="¿Podrían indicar qué documentación falta para subsanar la observación?"
          />

          <NoteMessage
            author="SAKI"
            sector="Admin"
            date="12/03/2026 · 11:05"
            text="La observación corresponde a la falta de certificación correcta en la escritura. Se debe adjuntar copia rectificada."
            saki
          />

          <NoteMessage
            author="Día"
            sector="Créditos y Cobranzas"
            date="12/03/2026 · 11:40"
            text="Perfecto, se gestiona con el franquiciado."
          />
        </div>

        <div style={helpBoxStyle}>
          <div>
            <div style={helpTitleStyle}>Ayuda SAKI</div>
            <div style={helpTextStyle}>
              ¿Necesitás asistencia sobre este legajo? Podés contactar al equipo
              SAKI por WhatsApp para consultas operativas rápidas.
            </div>
            <div style={helpDisclaimerStyle}>
              Las definiciones formales deben quedar registradas en Notas del legajo.
            </div>
          </div>

          <a
            href="https://wa.me/5491157714212"
            target="_blank"
            rel="noreferrer"
            style={whatsappButtonStyle}
          >
            WhatsApp SAKI
          </a>
        </div>

        <div style={noteComposerStyle}>
          <textarea
            style={noteTextareaStyle}
            placeholder="Escribir una nota para este legajo..."
            rows={3}
          />

          <button type="button" style={noteSendButtonStyle}>
            Agregar nota
          </button>
        </div>
      </div>
    </div>
  );
}

function FichaPrenda() {
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <ShieldCheck size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Detalle de la prenda</div>
          <h2 style={credentialNameStyle}>Escritura 12345</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato label="Instrumento" value="Escritura 12345" />
        <FichaDato label="Folio" value="678" />
        <FichaDato label="Fecha" value="10/02/2026" />

        <FichaDato label="Escribanía" value="Pérez" />
        <FichaDato label="Importe" value="USD 50.000" />
        <FichaDato label="Grado" value="1° grado" />

        <FichaDato label="Plazo" value="36 meses" />
        <FichaDato label="Radicación" value="CABA" />
        <FichaDato label="Registro interviniente" value="Registro Seccional N° 0001" />
      </div>
    </div>
  );
}

function FichaHistorial() {
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Clock3 size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Historial del trámite</div>
          <h2 style={credentialNameStyle}>AAAAAA25</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato label="28/02/2026" value="Trámite ingresado al sistema." wide />
        <FichaDato label="05/03/2026" value="Documentación en revisión." wide />
        <FichaDato label="12/03/2026" value="El trámite fue observado y queda pendiente de subsanación." wide />
      </div>
    </div>
  );
}

function FichaTrazabilidad() {
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <Network size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Trazabilidad operativa</div>
          <h2 style={credentialNameStyle}>Seguimiento del legajo</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato label="Origen" value="Carga inicial de prenda" />
        <FichaDato label="Sector actual" value="SAKI" />
        <FichaDato label="Estado actual" value="Observada" />

        <FichaDato label="Último movimiento" value="12/03/2026" />
        <FichaDato label="Próxima acción" value="Subsanar observación" />
        <FichaDato label="Responsable" value="Admin SAKI" />

        <FichaDato
          label="Detalle"
          value="La trazabilidad permite visualizar el recorrido operativo del legajo, sus cambios de estado y las acciones pendientes."
          wide
        />
      </div>
    </div>
  );
}

function FichaDominio() {
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
  <Car size={34} />
</div>
        <div>
          <div style={credentialKickerStyle}>Ficha técnica del dominio</div>
          <h2 style={credentialNameStyle}>AAAAAA25</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato label="Marca" value="Toyota" />
        <FichaDato label="Modelo" value="Yaris" />
        <FichaDato label="Tipo" value="Sedán" />

        <FichaDato label="Marca motor" value="Toyota" />
        <FichaDato label="N° motor" value="123456789" />
        <FichaDato label="Marca chasis" value="Toyota" />

        <FichaDato label="N° chasis" value="987654321" />
        <FichaDato label="Modelo año" value="2025" />
        <FichaDato label="Radicación" value="CABA" />

        <FichaDato
          label="Registro interviniente"
          value="Registro Seccional N° 0001"
          wide
        />
      </div>
    </div>
  );
}

function FichaFrq() {
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
  <Store size={34} />
</div>
        <div>
          <div style={credentialKickerStyle}>Franquiciado</div>
          <h2 style={credentialNameStyle}>Prueba1 Prueba2</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato label="DNI" value="30.000.000" />
        <FichaDato label="CUIT" value="20-02000000-0" />
        <FichaDato label="Nacimiento" value="01/01/1985" />
        <FichaDato label="Mail" value="contacto@prueba.com" />
        <FichaDato label="Teléfono" value="11-1234-5678" />
        <FichaDato label="Estado civil" value="Casado" />
        <FichaDato
          label="Domicilio"
          value="Av. Siempre Viva 123, Piso 5, Depto B, CP 1425, CABA, Buenos Aires"
          wide
        />
      </div>
    </div>
  );
}

function FichaGarante() {
  const estadoCivilTitular = "Casado";
  const titularidadTitular = 70;

  const condominos = [
    {
      nombre: "Ana Gómez",
      dni: "33.333.333",
      cuit: "27-33333333-3",
      nacimiento: "15/08/1982",
      mail: "anagomez@mail.com",
      telefono: "11-9876-5432",
      domicilio: "Av. Siempre Viva 123, Piso 5, Depto B, CP 1425, CABA, Buenos Aires",
      estadoCivil: "Casado",
      titularidad: 30,
      conyuge: {
        nombre: "Carlos Ruiz",
        dni: "34.444.444",
        cuil: "20-34444444-4",
      },
    },
  ];

  const nombreTitular = "Juan Pérez";
const hayCondominos = condominos.length > 0;
const tituloFichaGarante = hayCondominos
  ? `${nombreTitular} y otro/s`
  : nombreTitular;

  const totalTitularidad =
    titularidadTitular +
    condominos.reduce((acc, item) => acc + Number(item.titularidad || 0), 0);

  const titularidadRestante = 100 - totalTitularidad;
  const necesitaCondominos = titularidadTitular < 100;
  const mostrarConyugeTitular = estadoCivilTitular === "Casado";

  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
          <UserRound size={34} />
        </div>

        <div>
          <div style={credentialKickerStyle}>Garante / Titular</div>
          <h2 style={credentialNameStyle}>{tituloFichaGarante}</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato label="DNI" value="11.111.111" />
        <FichaDato label="CUIT" value="20-11111111-1" />
        <FichaDato label="Nacimiento" value="20/02/1980" />

        <FichaDato label="Mail" value="juanperez@mail.com" />
        <FichaDato label="Teléfono" value="11-1234-5678" />
        <FichaDato label="Estado civil" value={estadoCivilTitular} />

        <FichaDato label="Titularidad" value={`${titularidadTitular}%`} />

        <FichaDato
          label="Domicilio"
          value="Av. Siempre Viva 123, Piso 5, Depto B, CP 1425, CABA, Buenos Aires"
          wide
        />

        {mostrarConyugeTitular && (
          <>
            <div style={fichaSectionTitleStyle}>CÓNYUGE DEL TITULAR</div>

            <FichaDato label="Nombre y apellido" value="María López" />
            <FichaDato label="DNI" value="22.222.222" />
            <FichaDato label="CUIL" value="27-22222222-2" />
          </>
        )}

        {necesitaCondominos && (
          <>
            <div style={fichaSectionTitleStyle}>CONDÓMINOS</div>

            <div style={titularidadSummaryStyle}>
              <div>
                <span style={titularidadSummaryLabelStyle}>Titular</span>
                <strong style={titularidadSummaryValueStyle}>
                  {titularidadTitular}%
                </strong>
              </div>

              <div>
                <span style={titularidadSummaryLabelStyle}>Condóminos</span>
                <strong style={titularidadSummaryValueStyle}>
                  {totalTitularidad - titularidadTitular}%
                </strong>
              </div>

              <div>
                <span style={titularidadSummaryLabelStyle}>Total</span>
                <strong
                  style={{
                    ...titularidadSummaryValueStyle,
                    color:
                      totalTitularidad === 100
                        ? "#7dd3fc"
                        : totalTitularidad > 100
                        ? "#ff7d7d"
                        : "#f8c744",
                  }}
                >
                  {totalTitularidad}%
                </strong>
              </div>
            </div>

            {totalTitularidad < 100 && (
              <div style={titularidadWarningStyle}>
                Falta completar el {titularidadRestante}% restante de titularidad.
              </div>
            )}

            {totalTitularidad > 100 && (
              <div style={titularidadErrorStyle}>
                La titularidad total no puede superar el 100%.
              </div>
            )}

            {condominos.map((condomino, index) => {
              const mostrarConyugeCondomino = condomino.estadoCivil === "Casado";

              return (
                <div key={index} style={condominoCardStyle}>
                  <div style={condominoHeaderStyle}>
                    <div>
                      <div style={condominoKickerStyle}>
                        CONDÓMINO {index + 1}
                      </div>
                      <div style={condominoNameStyle}>{condomino.nombre}</div>
                    </div>

                    <div style={condominoPercentStyle}>
                      {condomino.titularidad}%
                    </div>
                  </div>

                  <div style={condominoGridStyle}>
                    <FichaDato label="DNI" value={condomino.dni} />
                    <FichaDato label="CUIT" value={condomino.cuit} />
                    <FichaDato label="Nacimiento" value={condomino.nacimiento} />

                    <FichaDato label="Mail" value={condomino.mail} />
                    <FichaDato label="Teléfono" value={condomino.telefono} />
                    <FichaDato label="Estado civil" value={condomino.estadoCivil} />

                    <FichaDato
                      label="Domicilio"
                      value={condomino.domicilio}
                      wide
                    />

                    {mostrarConyugeCondomino && (
                      <>
                        <div style={fichaSubSectionTitleStyle}>
                          CÓNYUGE DEL CONDÓMINO
                        </div>

                        <FichaDato
                          label="Nombre y apellido"
                          value={condomino.conyuge.nombre}
                        />
                        <FichaDato label="DNI" value={condomino.conyuge.dni} />
                        <FichaDato label="CUIL" value={condomino.conyuge.cuil} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function FichaEstado() {
  return (
    <div style={credentialStyle}>
      <div style={credentialTopStyle}>
        <div style={avatarStyle}>
  <Flag size={34} />
</div>
        <div>
          <div style={credentialKickerStyle}>Estado del trámite</div>
          <h2 style={{ ...credentialNameStyle, color: "#ff6b6b" }}>Observada</h2>
        </div>
      </div>

      <div style={credentialInfoGridStyle}>
        <FichaDato label="Tipo" value="Observación registral" />
        <FichaDato label="Fecha" value="12/03/2026" />
        <FichaDato label="Motivo" value="Falta documentación" />
        <FichaDato label="Responsable" value="SAKI" />
        <FichaDato
          label="Detalle"
          value="Se requiere presentación de documentación adicional para continuar con la inscripción."
          wide
        />
      </div>
    </div>
  );
}

function FichaDato({ label, value, wide }) {
  return (
    <div style={wide ? fichaDatoWideStyle : {}}>
      <div style={fichaDatoLabelStyle}>{label}</div>
      <div style={fichaDatoValueStyle}>{value}</div>
    </div>
  );
}

/* ===================== ESTILOS ===================== */

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
  marginTop: "auto",
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
  fontSize: "12px",
  lineHeight: 1.45,
  color: "rgba(226,237,249,0.82)",
  marginBottom: "10px",
};

const caseDateStyle = {
  fontSize: "12px",
  color: "rgba(206,220,238,0.74)",
  display: "flex",
  gap: "7px",
  alignItems: "center",
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

