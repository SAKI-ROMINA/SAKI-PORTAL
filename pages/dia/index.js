import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import {
  Search,
  FileText,
  ShieldCheck,
  Bell,
  Clock3,
  AlertCircle,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

function getInitials(nameOrEmail) {
  const value = (nameOrEmail || "").toString().trim();

  if (!value) return "US";

  const cleanValue = value.includes("@") ? value.split("@")[0] : value;

  const parts = cleanValue
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function formatDate(value) {
  if (!value) return "Sin fecha";

  const raw = String(value).trim();
  const onlyDate = raw.slice(0, 10);
  const match = onlyDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }

  return raw;
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function rowMatchesSearch(row, term) {
  const normalizedTerm = normalizeSearchText(term);

  if (!normalizedTerm) return false;

  const searchableText = normalizeSearchText(
    Object.values(row || {})
      .map((value) => {
        if (value === null || value === undefined) return "";

        if (typeof value === "object") {
          try {
            return JSON.stringify(value);
          } catch {
            return "";
          }
        }

        return String(value);
      })
      .join(" ")
  );

  return searchableText.includes(normalizedTerm);
}

function getWorkspaceInformeTipoLabel(type) {
  const value = (type || "").toString().trim();

  if (value === "informe_dominio") return "Informe de dominio";
  if (value === "certificado_dominio") return "Certificado de dominio";
  if (value === "anotaciones_personales") return "Anotaciones personales";
  if (value === "informe_nominal") return "Informe nominal";
  if (value === "indice_titularidad") return "Índice de titularidad";

  return value ? value.replaceAll("_", " ") : "Informe";
}

function getWorkspaceInformeTitle(item) {
  const tipo = (item?.type || "").toString().trim();

  const esInformePersonal =
    tipo === "anotaciones_personales" ||
    tipo === "informe_nominal" ||
    tipo === "indice_titularidad";

  const personaConsultada =
    item?.titular_dominio ||
    item?.identificacion_nombre ||
    item?.titular_razon_social ||
    `${item?.titular_apellido || ""} ${item?.titular_nombres || ""}`.trim();

  if (esInformePersonal) {
    return personaConsultada || getWorkspaceInformeTipoLabel(tipo) || "Informe";
  }

  return (
    item?.dominio ||
    personaConsultada ||
    getWorkspaceInformeTipoLabel(tipo) ||
    "Informe"
  );
}

export default function PanelPreview() {
    const router = useRouter();
const [userEmail, setUserEmail] = useState("");
const [userProfile, setUserProfile] = useState(null);
const [showUserMenu, setShowUserMenu] = useState(false);
const [checkingSession, setCheckingSession] = useState(true);

const [isAdmin, setIsAdmin] = useState(false);

const [ultimosMovimientos, setUltimosMovimientos] = useState([]);
const [pendientesResumen, setPendientesResumen] = useState({
  prendasObservadas: 0,
  informesEnCurso: 0,
  prendasDisponibles: 0,
});
const [loadingWorkspace, setLoadingWorkspace] = useState(false);

const [searchTerm, setSearchTerm] = useState("");
const [searchResults, setSearchResults] = useState([]);
const [searchingLegajos, setSearchingLegajos] = useState(false);

const [showNovedadModal, setShowNovedadModal] = useState(false);
const [savingNovedad, setSavingNovedad] = useState(false);
const [novedadesPortal, setNovedadesPortal] = useState([]);

const [novedadFiltro, setNovedadFiltro] = useState("Todas");
const [selectedNovedad, setSelectedNovedad] = useState(null);

const [novedadForm, setNovedadForm] = useState({
  tipo: "Comunicado",
  sector: "Todos",
  asunto: "",
  mensaje: "",
  cc: "",
  enviarMail: false,
});

useEffect(() => {
  let active = true;

  async function checkSession() {
    const { data, error } = await supabase.auth.getSession();

    if (!active) return;

    if (error || !data?.session) {
      router.replace("/dia/login");
      return;
    }

    const user = data.session.user;

setUserEmail(user?.email || "");

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role, name, full_name, sector, avatar_url, email")
  .eq("id", user.id)
  .maybeSingle();

if (!active) return;

if (profileError) {
  console.error("Error cargando perfil del usuario:", profileError);
  setIsAdmin(false);
  setUserProfile(null);
} else {
  const role = (profile?.role || "").toString().trim().toLowerCase();

  const sector = (profile?.sector || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const userIsAdmin = role === "admin";

  setIsAdmin(userIsAdmin);
  setUserProfile(profile || null);
}

const displayName =
  userProfile?.full_name ||
  userProfile?.name ||
  userEmail ||
  "Usuario";

const displaySector = isAdmin
  ? "Admin SAKI"
  : userProfile?.sector || "Usuario Día";

const avatarUrl = userProfile?.avatar_url || "";

const displayInitials = getInitials(displayName);

setCheckingSession(false);
  }

  checkSession();

  return () => {
    active = false;
  };
}, [router]);

useEffect(() => {
  if (checkingSession) return;

  let active = true;

  async function fetchWorkspaceData() {
    try {
      setLoadingWorkspace(true);

      const { data: informesData, error: informesError } = await supabase
        .from("dia_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (informesError) throw informesError;

      const { data: prendasData, error: prendasError } = await supabase
        .from("dia_request_prendas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (prendasError) throw prendasError;

      if (!active) return;

      const informesMovimientos = (informesData || []).map((item) => {
        const estadoInforme = item.status || item.estado || "Sin estado";
        const estadoKey = estadoInforme.toString().trim().toUpperCase();

        const tipo =
          item.type === "certificado_dominio"
            ? "Certificado"
            : item.type === "anotaciones_personales"
            ? "Anotaciones"
            : item.type === "indice_titularidad"
            ? "Índice"
            : "Informe";

        const fechaMovimiento =
          item.datos_legajo_actualizado_en ||
          item.updated_at ||
          item.created_at;

        return {
          id: `informe-${item.id}`,
          type: tipo,
       title: getWorkspaceInformeTitle(item),
          detail: `${tipo} · ${formatDate(fechaMovimiento)}`,
          status: estadoInforme,
          danger: estadoKey === "ANULADO" || item.result === "OBSERVADO",
          success: estadoKey === "ENTREGADO" && item.result !== "OBSERVADO",
          date: fechaMovimiento,
        };
      });

      const prendasMovimientos = (prendasData || []).map((item) => {
        const estadoPrenda = item.estado || "Sin estado";
        const estadoKey = estadoPrenda.toString().trim().toUpperCase();

        const fechaMovimiento =
          item.updated_at ||
          item.fecha_observacion ||
          item.fecha_inscripcion ||
          item.fecha_disponible_retiro_final ||
          item.fecha_real_retiro_final ||
          item.created_at;

        return {
          id: `prenda-${item.id}`,
          type: "Prenda",
       title: item.dominio || "Sin dominio",
          detail: `Prenda · ${formatDate(fechaMovimiento)}`,
          status: estadoPrenda,
          danger:
            estadoKey.includes("OBSERVADA") ||
            estadoKey.includes("RECTIFICACION") ||
            estadoKey.includes("SUBSAN") ||
            estadoKey.includes("ANULADA"),
          success:
            estadoKey.includes("INSCRIPTA") ||
            estadoKey.includes("RETIRADA") ||
            estadoKey.includes("LEGAJO CERRADO"),
          date: fechaMovimiento,
        };
      });

      const movimientosCombinados = [
        ...informesMovimientos,
        ...prendasMovimientos,
      ]
        .filter((item) => item.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

      const prendasObservadas = (prendasData || []).filter((item) => {
        const estado = (item.estado || "").toString().toUpperCase();

        return (
          estado.includes("OBSERVADA") ||
          estado.includes("RECTIFICACION") ||
          estado.includes("SUBSAN")
        );
      }).length;

      const informesEnCurso = (informesData || []).filter((item) => {
        const estado = (item.status || item.estado || "")
          .toString()
          .toUpperCase();

        return estado === "EN CURSO";
      }).length;

      const prendasDisponibles = (prendasData || []).filter((item) => {
        const estado = (item.estado || "").toString().toUpperCase();

        return estado.includes("DISPONIBLE PARA RETIRO");
      }).length;

      setUltimosMovimientos(movimientosCombinados);
      setPendientesResumen({
        prendasObservadas,
        informesEnCurso,
        prendasDisponibles,
      });
    } catch (error) {
      console.error("Error cargando datos del workspace:", error);
      setUltimosMovimientos([]);
    } finally {
      if (active) {
        setLoadingWorkspace(false);
      }
    }
  }

  fetchWorkspaceData();

  return () => {
    active = false;
  };
}, [checkingSession]);

useEffect(() => {
  if (checkingSession) return;

  const term = searchTerm.trim();

const hayFiltroFecha = Boolean(fechaDesde || fechaHasta);

if (!hayFiltroFecha && term.length < 2) {
  setSearchResults([]);
  setSearchingLegajos(false);
  return;
}

  let active = true;

  const timer = setTimeout(async () => {
    try {
      setSearchingLegajos(true);

      const { data: informesData, error: informesError } = await supabase
        .from("dia_requests")
        .select("*")
        .limit(300);

      if (informesError) throw informesError;

      const { data: prendasData, error: prendasError } = await supabase
        .from("dia_request_prendas")
        .select("*")
        .limit(300);

      if (prendasError) throw prendasError;

      if (!active) return;

      const informesResults = (informesData || [])
        .filter((item) => rowMatchesSearch(item, term))
        .map((item) => ({
          id: `informe-${item.id}`,
          modulo: "Informe",
          titulo: getWorkspaceInformeTitle(item),
          subtitulo: getWorkspaceInformeTipoLabel(item.type),
          detalle: [
            item.tienda ? `Tienda ${item.tienda}` : null,
            item.franquiciado || item.frq_razon_social || item.frq || null,
            item.frq_cuit || item.identificacion_cuit || null,
          ]
            .filter(Boolean)
            .join(" · "),
          estado: item.status || item.estado || "Sin estado",
          href: `/dia/informes/detalle-preview-real?id=${item.id}`,
          fecha:
  item.fecha_pedido_real ||
  item.created_at,
            
        }));

      const prendasResults = (prendasData || [])
        .filter((item) => rowMatchesSearch(item, term))
        .map((item) => ({
          id: `prenda-${item.id}`,
          modulo: "Prenda",
          titulo: item.dominio || "Sin dominio",
          subtitulo: "Prenda registral",
          detalle: [
            item.tienda ? `Tienda ${item.tienda}` : null,
            item.frq || item.franquiciado || item.frq_razon_social || null,
            item.frq_cuit || item.titular_cuit || null,
          ]
            .filter(Boolean)
            .join(" · "),
          estado: item.estado || "Sin estado",
          href: `/dia/prendas/detalle-preview-real?id=${item.id}`,
          fecha: item.fecha_envio_oficina || item.created_at,
        }));

      const combinedResults = [...informesResults, ...prendasResults]
        .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
        .slice(0, 12);

      setSearchResults(combinedResults);
    } catch (error) {
      console.error("Error buscando legajos:", error);
      setSearchResults([]);
    } finally {
      if (active) {
        setSearchingLegajos(false);
      }
    }
  }, 280);

  return () => {
    active = false;
    clearTimeout(timer);
  };
}, [searchTerm, fechaDesde, fechaHasta, fechaOrden, checkingSession]);

useEffect(() => {
  if (checkingSession) return;

  let active = true;

  async function fetchNovedadesPortal() {
    const { data, error } = await supabase
      .from("dia_novedades")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (!active) return;

    if (error) {
      console.error("Error cargando novedades:", error);
      setNovedadesPortal([]);
      return;
    }

    setNovedadesPortal(data || []);
  }

  fetchNovedadesPortal();

  return () => {
    active = false;
  };
}, [checkingSession]);

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.replace("/dia/login");
};

function handleNovedadChange(field, value) {
  setNovedadForm((prev) => ({
    ...prev,
    [field]: value,
  }));
}

async function handleGuardarNovedad() {
  if (!isAdmin) {
    alert("Solo un usuario administrador puede crear novedades.");
    return;
  }

  if (!novedadForm.asunto.trim()) {
    alert("Completá el asunto de la novedad.");
    return;
  }

  if (!novedadForm.mensaje.trim()) {
    alert("Completá el mensaje de la novedad.");
    return;
  }

  try {
    setSavingNovedad(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("dia_novedades")
      .insert({
        tipo: novedadForm.tipo,
        sector: novedadForm.sector,
        asunto: novedadForm.asunto.trim(),
        mensaje: novedadForm.mensaje.trim(),
        cc: novedadForm.cc.trim() || null,
        enviar_mail: !!novedadForm.enviarMail,
        enviado_mail: false,
        created_by: user?.id || null,
        created_by_email: user?.email || userEmail || null,
      })
      .select("*")
      .single();

    if (error) throw error;

    setNovedadesPortal((prev) => [data, ...(prev || [])].slice(0, 3));

    setNovedadForm({
      tipo: "Comunicado",
      sector: "Todos",
      asunto: "",
      mensaje: "",
      cc: "",
      enviarMail: false,
    });

    setShowNovedadModal(false);

    if (novedadForm.enviarMail) {
      alert(
        "Novedad guardada en el portal. El envío por mail desde SAKI lo conectamos en el próximo paso."
      );
    } else {
      alert("Novedad guardada en el portal.");
    }
  } catch (error) {
    console.error("Error guardando novedad:", error);
    alert(error?.message || "No se pudo guardar la novedad.");
  } finally {
    setSavingNovedad(false);
  }
}

const novedadesFiltradas =
  novedadFiltro === "Todas"
    ? novedadesPortal
    : novedadesPortal.filter((item) => item.tipo === novedadFiltro);

    const displayName =
  userProfile?.full_name ||
  userProfile?.name ||
  userEmail ||
  "Usuario";

const displaySector = isAdmin
  ? "Admin SAKI"
  : userProfile?.sector || "Usuario Día";

const avatarUrl = userProfile?.avatar_url || "";

const displayInitials = getInitials(displayName);

if (checkingSession) {
  return (
    <div style={pageStyle}>
      <div style={shellStyle}>Cargando...</div>
    </div>
  );
}

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <main style={mainPanelStyle}>
          <section style={heroStyle}>
  <div style={heroHeaderRowStyle}>
    <div>
      <div style={eyebrowStyle}>PORTAL DÍA</div>

      <h1 style={titleStyle}>Workspace</h1>

      <p style={subtitleStyle}>
        El portal que nos conecta. Gestión centralizada de legajos.
      </p>
    </div>

<div style={topUtilityStyle}>
  <div style={userProfileWrapStyle}>
    <button
      type="button"
      style={userProfileHeaderStyle}
      onClick={() => setShowUserMenu((prev) => !prev)}
    >
      {avatarUrl ? (
  <img
    src={avatarUrl}
    alt={displayName}
    style={userAvatarStyle}
  />
) : (
  <div style={userInitialsAvatarStyle}>
    {displayInitials}
  </div>
)}

      <div style={userProfileInfoStyle}>
        <strong style={userProfileNameStyle}>{displayName}</strong>
        <span style={userProfileSectorStyle}>
          <span style={userProfileSectorStyle}>{displaySector}</span>
        </span>
      </div>

      <span style={userChevronStyle}>⌄</span>
    </button>

    {showUserMenu && (
      <div style={userDropdownStyle}>
        <button
          type="button"
          style={userDropdownItemStyle}
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    )}
  </div>
</div>
  </div>
</section>

          <section style={searchCardStyle}>
            <div style={searchHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Buscar legajo</h2>
                <p style={sectionTextStyle}>
                  Buscá por dominio, tienda, franquiciado, CUIT o ID interno.
                </p>
              </div>

              <div style={resultBadgeStyle}>Búsqueda general</div>
            </div>

            <div style={searchInputWrapStyle}>
              <Search size={22} />

              <input
  style={searchInputStyle}
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      router.push(searchResults[0].href);
    }
  }}
  placeholder="Ejemplo: Mazzeo, AA555AA, 10020, CUIT o ID..."
/>
            </div>

            {(searchTerm.trim().length >= 2 || fechaDesde || fechaHasta) && (
  <div style={searchResultsBoxStyle}>
    {searchingLegajos ? (
      <div style={searchEmptyStyle}>Buscando legajos...</div>
    ) : searchResults.length > 0 ? (
      searchResults.map((item) => (
        <SearchResultItem
          key={item.id}
          item={item}
          onClick={() => router.push(item.href)}
        />
      ))
    ) : (
      <div style={searchEmptyStyle}>
        No se encontraron legajos para esa búsqueda.
      </div>
    )}
  </div>
)}
          </section>

          <section style={moduleGridStyle}>
            <ModuleCard
              icon={<FileText size={30} />}
              title="Informes"
              description="Solicitudes de informes de dominio, certificados, anotaciones personales e índice de titularidad."
              href="/dia/informes"
              action="Entrar a informes"
            />

            <ModuleCard
              icon={<ShieldCheck size={30} />}
              title="Prendas"
              description="Gestión y seguimiento de prendas registrales, estados, observaciones, notas y trazabilidad."
              href="/dia/prendas"
              action="Entrar a prendas"
            />
          </section>

          <section style={dashboardGridStyle}>
            <div style={activityCardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <h2 style={sectionTitleStyle}>Últimos movimientos</h2>
                  <p style={sectionTextStyle}>Actividad reciente del portal.</p>
                </div>

                <Clock3 size={22} color="#60a5fa" />
              </div>

                            {loadingWorkspace ? (
                <div style={emptyDashboardTextStyle}>
                  Cargando últimos movimientos...
                </div>
              ) : ultimosMovimientos.length > 0 ? (
                ultimosMovimientos.map((item) => (
                  <ActivityItem
                    key={item.id}
                    type={item.type}
                    title={item.title}
                    detail={item.detail}
                    status={item.status}
                    danger={item.danger}
                    success={item.success}
                  />
                ))
              ) : (
                <div style={emptyDashboardTextStyle}>
                  Sin movimientos recientes cargados.
                </div>
              )}
            </div>

            <div style={pendingCardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <h2 style={sectionTitleStyle}>Pendientes</h2>
                  <p style={sectionTextStyle}>
                    Alertas y acciones que requieren atención.
                  </p>
                </div>

                <Bell size={22} color="#60a5fa" />
              </div>

                            <PendingItem
                icon={<AlertCircle size={18} />}
                title={`${pendientesResumen.prendasObservadas} observaciones pendientes`}
                text="Prendas con documentación a subsanar o rectificar."
              />

              <PendingItem
                icon={<ClipboardList size={18} />}
                title={`${pendientesResumen.informesEnCurso} informes en curso`}
                text="Solicitudes registrales pendientes de entrega."
              />

              <PendingItem
                icon={<ShieldCheck size={18} />}
                title={`${pendientesResumen.prendasDisponibles} prendas disponibles`}
                text="Legajos listos para retiro o coordinación."
              />
            </div>
          </section>
          <section style={novedadesCardStyle}>
  <div>
    <div style={novedadesKickerStyle}>Centro operativo</div>

    <h2 style={sectionTitleStyle}>Novedades</h2>

    <p style={sectionTextStyle}>
      Comunicados generales, recordatorios y actualizaciones normativas no
      asociadas a un dominio, informe o prenda puntual.
    </p>

    <div style={novedadesTagsStyle}>
  {[
    { label: "Todas", value: "Todas" },
    { label: "Comunicados", value: "Comunicado" },
    { label: "Normativa DNRPA", value: "Novedad normativa" },
    { label: "Recordatorios", value: "Recordatorio" },
  ].map((item) => (
    <button
      key={item.value}
      type="button"
      onClick={() => setNovedadFiltro(item.value)}
      style={
        novedadFiltro === item.value
          ? novedadesTagActiveStyle
          : novedadesTagStyle
      }
    >
      {item.label}
    </button>
  ))}
</div>

{novedadesFiltradas.length > 0 && (
  <div style={novedadesListStyle}>
    {novedadesFiltradas.map((item) => (
      <button
        key={item.id}
        type="button"
        style={novedadMiniItemButtonStyle}
        onClick={() => setSelectedNovedad(item)}
      >
        <div style={novedadMiniTopStyle}>
          <span>{item.tipo}</span>
          <small>{formatDate(item.created_at)}</small>
        </div>

        <div style={novedadMiniTitleStyle}>{item.asunto}</div>

        <div style={novedadMiniTextStyle}>
          {item.sector}
          {item.enviar_mail
            ? " · marcado para envío por mail"
            : " · solo portal"}
        </div>
      </button>
    ))}
  </div>
)}
  </div>

  {isAdmin && (
  <button
    type="button"
    style={novedadesButtonStyle}
    onClick={() => setShowNovedadModal(true)}
  >
    Crear novedad
  </button>
)}
</section>
        </main>

        {showNovedadModal && (
<NovedadModal
  form={novedadForm}
  saving={savingNovedad}
  onChange={handleNovedadChange}
  onClose={() => setShowNovedadModal(false)}
  onSave={handleGuardarNovedad}
/>
)}

{selectedNovedad && (
  <NovedadDetalleModal
    novedad={selectedNovedad}
    onClose={() => setSelectedNovedad(null)}
  />
)}

      </div>
    </div>
  );
}

function NovedadDetalleModal({ novedad, onClose }) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={novedadModalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={novedadModalHeaderStyle}>
          <div>
            <div style={novedadesKickerStyle}>{novedad.tipo}</div>

            <h2 style={novedadModalTitleStyle}>{novedad.asunto}</h2>

            <p style={novedadModalTextStyle}>
              Sector: {novedad.sector || "Todos"} ·{" "}
              {formatDate(novedad.created_at)}
            </p>
          </div>

          <button type="button" onClick={onClose} style={modalCloseButtonStyle}>
            ×
          </button>
        </div>

        <div style={novedadDetalleBoxStyle}>
          {novedad.mensaje}
        </div>

        <div style={novedadModalActionsStyle}>
          <button type="button" style={secondaryButtonStyle} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function NovedadModal({ form, saving, onChange, onClose, onSave }) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={novedadModalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={novedadModalHeaderStyle}>
          <div>
            <div style={novedadesKickerStyle}>Nueva novedad</div>

            <h2 style={novedadModalTitleStyle}>
              Comunicado / actualización general
            </h2>

            <p style={novedadModalTextStyle}>
              Usá este espacio para avisos operativos, vencimientos generales,
              cambios de disposición DNRPA o novedades no vinculadas a un
              legajo puntual.
            </p>
          </div>

          <button type="button" onClick={onClose} style={modalCloseButtonStyle}>
            ×
          </button>
        </div>

        <div style={novedadFormGridStyle}>
          <div>
            <label style={modalLabelStyle}>Tipo</label>
            <select
              style={modalInputStyle}
              value={form.tipo}
              onChange={(e) => onChange("tipo", e.target.value)}
            >
              <option value="Comunicado">Comunicado</option>
              <option value="Novedad normativa">Novedad normativa</option>
              <option value="Recordatorio">Recordatorio</option>
              <option value="Sistema">Sistema</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label style={modalLabelStyle}>Sector destinatario</label>
            <select
              style={modalInputStyle}
              value={form.sector}
              onChange={(e) => onChange("sector", e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Legales">Legales</option>
              <option value="Créditos y Cobranzas">
                Créditos y Cobranzas
              </option>
              <option value="Administración de Franquicias">
                Administración de Franquicias
              </option>
              <option value="Otro / mail manual">Otro / mail manual</option>
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={modalLabelStyle}>Asunto</label>
            <input
              style={modalInputStyle}
              value={form.asunto}
              onChange={(e) => onChange("asunto", e.target.value)}
              placeholder="Ej. Próximo vencimiento de legajo único"
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={modalLabelStyle}>Mensaje</label>
            <textarea
              style={modalTextareaStyle}
              value={form.mensaje}
              onChange={(e) => onChange("mensaje", e.target.value)}
              placeholder="Redactá el comunicado o la novedad normativa..."
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={modalLabelStyle}>CC / destinatarios adicionales</label>
            <input
              style={modalInputStyle}
              value={form.cc}
              onChange={(e) => onChange("cc", e.target.value)}
              placeholder="Opcional. Ej. legales@..., cobranzas@..."
            />
          </div>

          <label style={checkboxRowStyle}>
  <input
    type="checkbox"
    checked={form.enviarMail}
    onChange={(e) => onChange("enviarMail", e.target.checked)}
  />
  Enviar también por mail desde SAKI
</label>
        </div>

        <div style={novedadModalActionsStyle}>
          <button type="button" style={secondaryButtonStyle} onClick={onClose}>
            Cancelar
          </button>

          <button
  type="button"
  style={{
    ...primaryButtonStyle,
    opacity: saving ? 0.65 : 1,
    cursor: saving ? "not-allowed" : "pointer",
  }}
  disabled={saving}
  onClick={onSave}
>
  {saving ? "Guardando..." : "Guardar novedad"}
</button>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ icon, title, description, href, action }) {
  return (
    <Link href={href} style={moduleCardStyle}>
      <div style={moduleIconStyle}>{icon}</div>

      <div>
        <h2 style={moduleTitleStyle}>{title}</h2>
        <p style={moduleTextStyle}>{description}</p>
      </div>

      <div style={moduleActionStyle}>
        {action}
        <ArrowRight size={17} />
      </div>
    </Link>
  );
}

function ActivityItem({ type, title, detail, status, danger, success }) {
  const badgeStyle = danger
    ? badgeDangerStyle
    : success
    ? badgeSuccessStyle
    : badgeDefaultStyle;

  return (
    <div style={activityItemStyle}>
      <div>
        <div style={activityTypeStyle}>{type}</div>
        <div style={activityTitleStyle}>{title}</div>
        <div style={activityDetailStyle}>{detail}</div>
      </div>

      <span style={badgeStyle}>
  {(status || "Sin estado").toString().toUpperCase()}
</span>
    </div>
  );
}

function SearchResultItem({ item, onClick }) {
  const isInforme = item.modulo === "Informe";

  return (
    <button type="button" style={searchResultItemStyle} onClick={onClick}>
      <div style={searchResultIconStyle}>
        {isInforme ? <FileText size={18} /> : <ShieldCheck size={18} />}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={searchResultTopStyle}>
          <span style={searchResultModuleStyle}>{item.modulo}</span>
          <span style={searchResultStatusStyle}>
            {(item.estado || "Sin estado").toString().toUpperCase()}
          </span>
        </div>

        <div style={searchResultTitleStyle}>{item.titulo}</div>

        <div style={searchResultDetailStyle}>
          {item.subtitulo}
          {item.detalle ? ` · ${item.detalle}` : ""}
        </div>
      </div>
    </button>
  );
}

function PendingItem({ icon, title, text }) {
  return (
    <div style={pendingItemStyle}>
      <div style={pendingIconStyle}>{icon}</div>

      <div>
        <div style={pendingTitleStyle}>{title}</div>
        <div style={pendingTextStyle}>{text}</div>
      </div>
    </div>
  );
}

/* ===================== ESTILOS ===================== */

const workspaceBgTest = "#E3EAF2";

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
  width: "100%",
  marginBottom: "22px",
};

const heroHeaderRowStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "18px",
};

const topUtilityStyle = {
  marginLeft: "auto",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  justifyContent: "flex-end",
};

const userProfileWrapStyle = {
  position: "relative",
};

const userProfileHeaderStyle = {
  border: "1px solid rgba(96,165,250,0.16)",
  background:
    "linear-gradient(180deg, rgba(15,44,78,0.42), rgba(8,22,46,0.52))",
  boxShadow: "0 12px 26px rgba(0,0,0,0.16)",
  display: "flex",
  alignItems: "center",
  gap: "11px",
  padding: "7px 10px 7px 8px",
  borderRadius: "999px",
  cursor: "pointer",
  minWidth: "285px",
};

const userAvatarStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  objectFit: "cover",
  border: "1px solid rgba(96,165,250,0.34)",
  boxShadow: "0 0 0 3px rgba(37,99,235,0.12)",
  flexShrink: 0,
};

const userInitialsAvatarStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, #1d4ed8, #0f172a)",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 900,
  border: "1px solid rgba(96,165,250,0.26)",
  boxShadow: "0 0 0 3px rgba(37,99,235,0.10)",
  flexShrink: 0,
};

const userProfileInfoStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  minWidth: 0,
  flex: 1,
  textAlign: "left",
};

const userProfileNameStyle = {
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 850,
  lineHeight: 1.1,
  whiteSpace: "nowrap",
};

const userProfileSectorStyle = {
  color: "rgba(168,196,232,0.76)",
  fontSize: "11px",
  fontWeight: 650,
  lineHeight: 1.1,
  whiteSpace: "nowrap",
};

const userChevronStyle = {
  color: "rgba(219,234,254,0.72)",
  fontSize: "18px",
  fontWeight: 800,
  lineHeight: 1,
  padding: "0 2px",
};

const userDropdownStyle = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  minWidth: "190px",
  borderRadius: "14px",
  border: "1px solid rgba(96,165,250,0.16)",
  background: "rgba(5,18,38,0.98)",
  boxShadow: "0 18px 42px rgba(0,0,0,0.34)",
  padding: "7px",
  zIndex: 50,
};

const userDropdownItemStyle = {
  width: "100%",
  height: "36px",
  border: "none",
  borderRadius: "10px",
  background: "transparent",
  color: "#dbeafe",
  fontSize: "12px",
  fontWeight: 750,
  textAlign: "left",
  padding: "0 10px",
  cursor: "pointer",
};

const userInlineBadgeStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  padding: "10px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(96,165,250,0.16)",
  background: "rgba(15,44,78,0.34)",
  minWidth: "220px",
};

const userInlineLabelStyle = {
  color: "rgba(168,196,232,0.72)",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const userInlineValueStyle = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#ffffff",
  lineHeight: 1.2,
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
  fontSize: "34px",
  fontWeight: 760,
  letterSpacing: "-0.04em",
  lineHeight: 1.05,
};

const subtitleStyle = {
  margin: "10px 0 0",
  color: "rgba(226,237,249,0.78)",
  fontSize: "16px",
  lineHeight: 1.45,
};

const userBadgeStyle = {
  border: "1px solid rgba(96,165,250,0.20)",
  background: "rgba(15,44,78,0.62)",
  borderRadius: "16px",
  padding: "12px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  color: "#ffffff",
};

const heroActionsStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "10px",
};

const userBadgeLabelStyle = {
  color: "rgba(168,196,232,0.78)",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const userBadgeValueStyle = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#ffffff",
};

const searchCardStyle = {
  background: "rgba(8, 22, 46, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "22px",
  padding: "20px 22px",
  boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
  marginBottom: "18px",
};

const searchHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "16px",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "20px",
  color: "#ffffff",
  fontWeight: 760,
};

const sectionTextStyle = {
  margin: "6px 0 0",
  color: "rgba(168,196,232,0.82)",
  fontSize: "14px",
  lineHeight: 1.45,
};

const resultBadgeStyle = {
  borderRadius: "999px",
  padding: "10px 14px",
  background: "rgba(30,64,108,0.74)",
  border: "1px solid rgba(96,165,250,0.18)",
  color: "#dbeafe",
  fontSize: "13px",
  fontWeight: 700,
};

const searchInputWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  borderRadius: "18px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3,18,34,0.78)",
  padding: "0 16px",
  color: "#60a5fa",
};

const searchInputStyle = {
  width: "100%",
  height: "58px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#ffffff",
  fontSize: "16px",
};

const searchResultsBoxStyle = {
  marginTop: "14px",
  borderRadius: "18px",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  background: "rgba(3,18,34,0.62)",
  overflow: "hidden",
};

const searchResultItemStyle = {
  width: "100%",
  border: "none",
  borderTop: "1px solid rgba(148,163,184,0.10)",
  background: "transparent",
  color: "#ffffff",
  display: "grid",
  gridTemplateColumns: "42px 1fr",
  gap: "12px",
  alignItems: "center",
  padding: "13px 14px",
  textAlign: "left",
  cursor: "pointer",
};

const searchResultIconStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#60a5fa",
  background: "rgba(37,99,235,0.14)",
};

const searchResultTopStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "4px",
};

const searchResultModuleStyle = {
  fontSize: "10px",
  fontWeight: 850,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#60a5fa",
};

const searchResultStatusStyle = {
  fontSize: "10px",
  fontWeight: 850,
  letterSpacing: "0.05em",
  color: "rgba(226,237,249,0.76)",
  whiteSpace: "nowrap",
};

const searchResultTitleStyle = {
  fontSize: "15px",
  fontWeight: 800,
  color: "#ffffff",
  marginBottom: "3px",
};

const searchResultDetailStyle = {
  fontSize: "12px",
  color: "rgba(168,196,232,0.78)",
  lineHeight: 1.4,
};

const searchEmptyStyle = {
  padding: "14px",
  fontSize: "13px",
  color: "rgba(168,196,232,0.78)",
};

const moduleGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "18px",
  marginBottom: "18px",
};

const moduleCardStyle = {
  textDecoration: "none",
  color: "#ffffff",
  borderRadius: "22px",
  border: "1px solid rgba(96,165,250,0.16)",
  background:
    "linear-gradient(180deg, rgba(17,55,96,0.62), rgba(8,22,46,0.82))",
  padding: "20px",
  minHeight: "170px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
};

const moduleIconStyle = {
  width: "50px",
  height: "50px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#60a5fa",
  background: "rgba(37,99,235,0.16)",
  border: "1px solid rgba(96,165,250,0.16)",
};

const moduleTitleStyle = {
  margin: "18px 0 8px",
  fontSize: "24px",
  fontWeight: 800,
};

const moduleTextStyle = {
  margin: 0,
  color: "rgba(226,237,249,0.80)",
  fontSize: "14px",
  lineHeight: 1.5,
};

const moduleActionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "22px",
  color: "#60a5fa",
  fontSize: "14px",
  fontWeight: 700,
};

const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px",
};

const novedadesCardStyle = {
  marginTop: "18px",
  borderRadius: "22px",
  border: "1px solid rgba(96,165,250,0.16)",
  background:
    "linear-gradient(180deg, rgba(17,55,96,0.56), rgba(8,22,46,0.82))",
  padding: "20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
};

const novedadesKickerStyle = {
  color: "#60a5fa",
  fontSize: "11px",
  fontWeight: 850,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: "7px",
};

const novedadesTagsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const novedadesTagStyle = {
  borderRadius: "999px",
  border: "1px solid rgba(96,165,250,0.15)",
  background: "rgba(37,99,235,0.10)",
  color: "#bfdbfe",
  padding: "6px 10px",
  fontSize: "11px",
  fontWeight: 750,
};

const novedadesTagActiveStyle = {
  ...novedadesTagStyle,
  background: "rgba(37,99,235,0.26)",
  border: "1px solid rgba(96,165,250,0.34)",
  color: "#ffffff",
};

const novedadesButtonStyle = {
  height: "36px",
  border: "none",
  borderRadius: "999px",
  background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
  color: "#ffffff",
  padding: "0 14px",
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "0 10px 22px rgba(37,99,235,0.18)",
};

const novedadesListStyle = {
  marginTop: "16px",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px",
};

const novedadMiniItemStyle = {
  borderRadius: "14px",
  border: "1px solid rgba(148,163,184,0.12)",
  background: "rgba(3,18,34,0.36)",
  padding: "11px 12px",
  minWidth: 0,
};

const novedadDetalleBoxStyle = {
  borderRadius: "18px",
  border: "1px solid rgba(148,163,184,0.14)",
  background: "rgba(3,18,34,0.50)",
  color: "rgba(226,237,249,0.90)",
  padding: "16px",
  fontSize: "14px",
  lineHeight: 1.65,
  whiteSpace: "pre-wrap",
};

const novedadMiniItemButtonStyle = {
  ...novedadMiniItemStyle,
  width: "100%",
  textAlign: "left",
  cursor: "pointer",
};

const novedadMiniTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  alignItems: "center",
  marginBottom: "6px",
  color: "#60a5fa",
  fontSize: "10px",
  fontWeight: 850,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const novedadMiniTitleStyle = {
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 800,
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const novedadMiniTextStyle = {
  marginTop: "5px",
  color: "rgba(168,196,232,0.78)",
  fontSize: "11px",
  lineHeight: 1.35,
};

const activityCardStyle = {
  background: "rgba(8, 22, 46, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "22px",
  padding: "20px",
};

const pendingCardStyle = {
  background: "rgba(8, 22, 46, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "22px",
  padding: "20px",
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "18px",
};

const emptyDashboardTextStyle = {
  padding: "16px 0",
  borderTop: "1px solid rgba(148,163,184,0.10)",
  color: "rgba(168,196,232,0.78)",
  fontSize: "13px",
};

const activityItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  padding: "14px 0",
  borderTop: "1px solid rgba(148,163,184,0.10)",
};

const activityTypeStyle = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#60a5fa",
  fontWeight: 700,
};

const activityTitleStyle = {
  marginTop: "4px",
  fontSize: "15px",
  fontWeight: 700,
  color: "#ffffff",
};

const activityDetailStyle = {
  marginTop: "4px",
  color: "rgba(168,196,232,0.78)",
  fontSize: "13px",
};

const badgeDefaultStyle = {
  borderRadius: "999px",
  padding: "5px 9px",
  background: "rgba(20,184,166,0.09)",
  border: "1px solid rgba(20,184,166,0.16)",
  color: "#99f6e4",
  fontSize: "10px",
  fontWeight: 750,
  letterSpacing: "0.045em",
  whiteSpace: "nowrap",
  lineHeight: 1,
};

const badgeDangerStyle = {
  ...badgeDefaultStyle,
  background: "rgba(245,158,11,0.09)",
  border: "1px solid rgba(245,158,11,0.16)",
  color: "#fde68a",
};

const badgeSuccessStyle = {
  ...badgeDefaultStyle,
  background: "rgba(34,197,94,0.08)",
  border: "1px solid rgba(34,197,94,0.15)",
  color: "#bbf7d0",
};

const pendingItemStyle = {
  display: "flex",
  gap: "12px",
  padding: "14px 0",
  borderTop: "1px solid rgba(148,163,184,0.10)",
};

const pendingIconStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#60a5fa",
  background: "rgba(37,99,235,0.14)",
  flexShrink: 0,
};

const pendingTitleStyle = {
  fontSize: "14px",
  fontWeight: 760,
  color: "#ffffff",
};

const pendingTextStyle = {
  marginTop: "4px",
  fontSize: "13px",
  color: "rgba(168,196,232,0.78)",
  lineHeight: 1.45,
};

const logoutButtonStyle = {
  height: "40px",
  border: "1px solid rgba(96,165,250,0.16)",
  borderRadius: "999px",
  background: "rgba(30,64,108,0.22)",
  color: "#dbeafe",
  padding: "0 14px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,8,18,0.66)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  zIndex: 10000,
};

const novedadModalStyle = {
  width: "min(760px, 100%)",
  borderRadius: "24px",
  border: "1px solid rgba(148,163,184,0.16)",
  background:
    "linear-gradient(180deg, rgba(18,52,91,0.98), rgba(10,31,58,0.98))",
  boxShadow: "0 34px 90px rgba(0,0,0,0.46)",
  padding: "24px",
};

const novedadModalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  alignItems: "flex-start",
  marginBottom: "20px",
};

const novedadModalTitleStyle = {
  margin: 0,
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: 800,
  letterSpacing: "-0.03em",
};

const novedadModalTextStyle = {
  margin: "10px 0 0",
  color: "rgba(214,228,245,0.78)",
  fontSize: "13px",
  lineHeight: 1.5,
  maxWidth: "620px",
};

const modalCloseButtonStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(255,255,255,0.04)",
  color: "#dbeafe",
  fontSize: "22px",
  lineHeight: "30px",
  cursor: "pointer",
};

const novedadFormGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "13px",
};

const modalLabelStyle = {
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
  colorScheme: "dark",
};

const modalTextareaStyle = {
  ...modalInputStyle,
  height: "130px",
  padding: "12px 13px",
  resize: "vertical",
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  lineHeight: 1.45,
};

const checkboxRowStyle = {
  gridColumn: "1 / -1",
  display: "flex",
  alignItems: "center",
  gap: "9px",
  color: "rgba(214,228,245,0.82)",
  fontSize: "13px",
  fontWeight: 650,
};

const novedadModalActionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "22px",
};

const secondaryButtonStyle = {
  height: "42px",
  padding: "0 15px",
  borderRadius: "12px",
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(255,255,255,0.03)",
  color: "#dbeafe",
  fontSize: "13px",
  fontWeight: 750,
  cursor: "pointer",
};

const primaryButtonStyle = {
  height: "42px",
  padding: "0 17px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 850,
  cursor: "pointer",
};