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

export default function PanelPreview() {
    const router = useRouter();
const [userEmail, setUserEmail] = useState("");
const [checkingSession, setCheckingSession] = useState(true);

useEffect(() => {
  let active = true;

  async function checkSession() {
    const { data, error } = await supabase.auth.getSession();

    if (!active) return;

    if (error || !data?.session) {
      router.replace("/dia/login");
      return;
    }

    setUserEmail(data.session.user?.email || "");
    setCheckingSession(false);
  }

  checkSession();

  return () => {
    active = false;
  };
}, [router]);

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.replace("/dia/login");
};

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
            <div>
              <div style={eyebrowStyle}>PORTAL DÍA</div>

              <h1 style={titleStyle}>Workspace</h1>

              <p style={subtitleStyle}>
  El portal que nos une. Gestión centralizada de legajos.
</p>
            </div>

<div style={userBadgeStyle}>
  <span style={userBadgeLabelStyle}>Usuario activo</span>
  <strong style={userBadgeValueStyle}>{userEmail}</strong>
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
                placeholder="Ejemplo: AAAAAA25, 10020, Prueba1, CUIT o ID..."
              />
            </div>
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

              <ActivityItem
                type="Prenda"
                title="AAAAAA25 observada"
                detail="Pendiente de subsanación · 12/03/2026"
                status="Observada"
                danger
              />

              <ActivityItem
                type="Informe"
                title="AB456CS en curso"
                detail="Informe de dominio solicitado · 11/03/2026"
                status="En curso"
              />

              <ActivityItem
                type="Certificado"
                title="AC384MD entregado"
                detail="Certificado de dominio finalizado · 10/03/2026"
                status="Entregado"
                success
              />
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
                title="2 observaciones pendientes"
                text="Prendas con documentación a subsanar."
              />

              <PendingItem
                icon={<ClipboardList size={18} />}
                title="4 informes en curso"
                text="Solicitudes registrales pendientes de entrega."
              />

              <PendingItem
                icon={<ShieldCheck size={18} />}
                title="1 prenda disponible"
                text="Legajo listo para retiro o coordinación."
              />
            </div>
          </section>
        </main>
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

      <span style={badgeStyle}>{status}</span>
    </div>
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
  gap: "18px",
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
  gridTemplateColumns: "1.25fr 0.85fr",
  gap: "18px",
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
  padding: "7px 11px",
  background: "rgba(20,184,166,0.16)",
  border: "1px solid rgba(20,184,166,0.24)",
  color: "#ccfbf1",
  fontSize: "11px",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const badgeDangerStyle = {
  ...badgeDefaultStyle,
  background: "rgba(245,158,11,0.16)",
  border: "1px solid rgba(245,158,11,0.26)",
  color: "#fde68a",
};

const badgeSuccessStyle = {
  ...badgeDefaultStyle,
  background: "rgba(34,197,94,0.14)",
  border: "1px solid rgba(34,197,94,0.24)",
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
  marginTop: "8px",
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "999px",
  background: "rgba(30,64,108,0.42)",
  color: "#dbeafe",
  padding: "8px 11px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
};