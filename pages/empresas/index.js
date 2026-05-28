import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Users,
  FolderCheck,
} from "lucide-react";

const accesosEmpresas = [
  {
    title: "Concesionarias",
    text: "Para agencias, concesionarios y canales comerciales que gestionan operaciones sobre automotores o motovehículos.",
    href: "/empresas/login?tipo=concesionaria",
    icon: Building2,
  },
  {
    title: "Productores asesores de seguros",
    text: "Para productores, sociedades de productores y organizadores que derivan trámites registrales vinculados a asegurados, siniestros o documentación vehicular.",
    href: "/empresas/login?tipo=productores-seguros",
    icon: Users,
  },
  {
    title: "Compañías aseguradoras",
    text: "Para aseguradoras que necesitan consultar, controlar o acompañar trámites vinculados a siniestros, recuperos, bajas, documentación registral o gestiones sobre unidades aseguradas.",
    href: "/empresas/login?tipo=companias-aseguradoras",
    icon: ShieldCheck,
  },
  {
    title: "Clientes particulares",
    text: "Para personas que desean consultar el avance de sus propios trámites.",
    href: "/clientes/login",
    icon: Users,
  },
];

export default function PortalEmpresas() {
  return (
    <main className="page">
      <section className="shell">
        <header className="topbar">
          <div>
            <div className="brand">SAKI</div>
            <div className="brandSub">Portal Empresas / Clientes</div>
          </div>

          <div className="topBadge">
            <FolderCheck size={16} />
            Accesos con validación de usuario
          </div>
        </header>

        <section className="intro">
          <div className="kicker">Centro de accesos</div>

          <h1>Acceso privado a gestiones registrales</h1>

<p>
  Seleccioná el perfil correspondiente para ingresar al entorno privado
  de gestión, seguimiento documental y trazabilidad operativa.
</p>
        </section>

        <section className="block">
          <div className="blockHeader">
            <span>Empresas y canales profesionales</span>
          </div>

          <div className="grid">
            {accesosEmpresas.map((item) => {
  const Icon = item.icon;

  return (
    <Link href={item.href} className="card" key={item.title}>
      <div className="iconBox">
        <Icon size={23} />
      </div>

      <h2>{item.title}</h2>

      <p>{item.text}</p>
    </Link>
  );
})}
          </div>
        </section>
        
        <section className="corporateWrap">
          <article className="corporateCard">
            <Building2 size={20} />
            <span>Acceso corporativo</span>
          </article>
        </section>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 12% 10%, rgba(37, 99, 235, 0.2), transparent 32%),
            radial-gradient(circle at 88% 4%, rgba(14, 165, 233, 0.16), transparent 30%),
            linear-gradient(180deg, #031225 0%, #06172e 54%, #07111f 100%);
          color: #e5eefc;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .shell {
          width: min(1160px, calc(100% - 40px));
          margin: 0 auto;
          padding: 28px 0 42px;
        }

.topbar {
  min-height: 56px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(3, 18, 34, 0.44);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 20px;
  box-shadow: 0 14px 42px rgba(0, 0, 0, 0.20);
  backdrop-filter: blur(16px);
}

.brand {
  color: #ffffff;
  font-size: 25px;
  font-weight: 900;
  letter-spacing: 0.13em;
  line-height: 1;
}

.brandSub {
  margin-top: 6px;
  color: rgba(191, 219, 254, 0.62);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

        .topBadge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          border: 1px solid rgba(96, 165, 250, 0.24);
          background: rgba(37, 99, 235, 0.14);
          color: #bfdbfe;
          padding: 10px 13px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

.intro {
  padding: 24px 0 22px;
  max-width: 720px;
}

        .kicker {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          border: 1px solid rgba(96, 165, 250, 0.24);
          background: rgba(37, 99, 235, 0.14);
          color: #bfdbfe;
          padding: 9px 13px;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

h1 {
  margin: 0;
  color: #ffffff;
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.12;
  font-weight: 780;
  letter-spacing: -0.025em;
}

.intro p {
  margin: 10px 0 0;
  color: rgba(214, 228, 245, 0.68);
  font-size: 13.5px;
  line-height: 1.55;
  max-width: 640px;
}

        .block {
          margin-top: 18px;
        }

        .secondaryBlock {
          margin-top: 20px;
        }

        .blockHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 13px;
          color: rgba(226, 232, 240, 0.86);
          font-size: 13px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
        }

.card {
  min-height: 245px;
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  background:
    linear-gradient(180deg, rgba(9, 32, 60, 0.68), rgba(3, 18, 34, 0.54));
  padding: 21px;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 20px 56px rgba(0, 0, 0, 0.18);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease;
}

.card:hover {
  transform: translateY(-3px);
  border-color: rgba(96, 165, 250, 0.72);
  background:
    linear-gradient(180deg, rgba(16, 48, 88, 0.84), rgba(5, 24, 46, 0.70));
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.34),
    0 0 28px rgba(37, 99, 235, 0.28),
    0 24px 64px rgba(0, 0, 0, 0.28);
  text-decoration: none;
}

.card,
.card:hover,
.card:focus,
.card:active,
.card:visited {
  text-decoration: none;
  color: inherit;
}

.card:hover h2,
.card:hover p {
  text-decoration: none;
}

.card:hover .iconBox {
  background: rgba(37, 99, 235, 0.26);
  border-color: rgba(96, 165, 250, 0.32);
  color: #bfdbfe;
}

        .iconBox {
          width: 46px;
          height: 46px;
          border-radius: 17px;
          background: rgba(37, 99, 235, 0.16);
          border: 1px solid rgba(96, 165, 250, 0.18);
          color: #93c5fd;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          flex-shrink: 0;
        }

.card h2,
.clientCard h2 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
  line-height: 1.18;
  font-weight: 850;
  letter-spacing: -0.02em;
}

.clientCard h2 {
  font-size: 21px;
}

.card p,
.clientCard p {
  margin: 11px 0 0;
  color: rgba(168, 196, 232, 0.78);
  font-size: 13px;
  line-height: 1.55;
}

.clientCard p {
  font-size: 14px;
  max-width: 720px;
}

.clientCard {
  min-height: 132px;
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  background:
    linear-gradient(180deg, rgba(9, 32, 60, 0.66), rgba(3, 18, 34, 0.52));
  padding: 26px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 20px 56px rgba(0, 0, 0, 0.16);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease;
}

.clientCard:hover {
  transform: translateY(-3px);
  border-color: rgba(96, 165, 250, 0.72);
  background:
    linear-gradient(180deg, rgba(16, 48, 88, 0.82), rgba(5, 24, 46, 0.68));
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.34),
    0 0 28px rgba(37, 99, 235, 0.26),
    0 24px 64px rgba(0, 0, 0, 0.26);
  text-decoration: none;
}

.clientCard,
.clientCard:hover,
.clientCard:focus,
.clientCard:active,
.clientCard:visited {
  text-decoration: none;
  color: inherit;
}

.clientCard:hover h2,
.clientCard:hover p {
  text-decoration: none;
}

.clientCard:hover .iconBox {
  background: rgba(37, 99, 235, 0.26);
  border-color: rgba(96, 165, 250, 0.32);
  color: #bfdbfe;
}

.clientContent {
  display: flex;
  align-items: center;
  gap: 20px;
}

        .clientContent .iconBox {
          margin-bottom: 0;
        }

        .corporateWrap {
          margin-top: 20px;
          display: flex;
          justify-content: flex-start;
        }

        .corporateCard {
          min-height: 58px;
          border-radius: 20px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          background: rgba(3, 18, 34, 0.42);
          color: rgba(214, 228, 245, 0.78);
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 800;
        }

:global(a.card),
:global(a.card:link),
:global(a.card:visited),
:global(a.card:hover),
:global(a.card:active),
:global(a.card:focus) {
  text-decoration: none !important;
  color: inherit !important;
  outline: none;
}

:global(a.card *) {
  text-decoration: none !important;
}

:global(a.card h2) {
  color: #ffffff !important;
}

:global(a.card p) {
  color: rgba(168, 196, 232, 0.78) !important;
}

:global(a.card:hover) {
  transform: translateY(-3px);
  border-color: rgba(96, 165, 250, 0.78) !important;
  background:
    linear-gradient(180deg, rgba(16, 48, 88, 0.88), rgba(5, 24, 46, 0.72)) !important;
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.42),
    0 0 30px rgba(37, 99, 235, 0.34),
    0 24px 64px rgba(0, 0, 0, 0.30) !important;
}

:global(a.card:hover .iconBox) {
  background: rgba(37, 99, 235, 0.28) !important;
  border-color: rgba(96, 165, 250, 0.42) !important;
  color: #bfdbfe !important;
}

:global(a.clientCard),
:global(a.clientCard:link),
:global(a.clientCard:visited),
:global(a.clientCard:hover),
:global(a.clientCard:active),
:global(a.clientCard:focus) {
  text-decoration: none !important;
  color: inherit !important;
  outline: none;
}

:global(a.clientCard *) {
  text-decoration: none !important;
}

:global(a.clientCard h2) {
  color: #ffffff !important;
}

:global(a.clientCard p) {
  color: rgba(168, 196, 232, 0.78) !important;
}

:global(a.clientCard:hover) {
  transform: translateY(-3px);
  border-color: rgba(96, 165, 250, 0.78) !important;
  background:
    linear-gradient(180deg, rgba(16, 48, 88, 0.86), rgba(5, 24, 46, 0.70)) !important;
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.42),
    0 0 30px rgba(37, 99, 235, 0.32),
    0 24px 64px rgba(0, 0, 0, 0.28) !important;
}

:global(a.clientCard:hover .iconBox) {
  background: rgba(37, 99, 235, 0.28) !important;
  border-color: rgba(96, 165, 250, 0.42) !important;
  color: #bfdbfe !important;
}

        @media (max-width: 980px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .card {
            min-height: 250px;
          }
        }

        @media (max-width: 680px) {
          .shell {
            width: min(100% - 28px, 1160px);
            padding-top: 18px;
          }

          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .topBadge {
            white-space: normal;
          }

          .intro {
            padding-top: 38px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .clientCard {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}