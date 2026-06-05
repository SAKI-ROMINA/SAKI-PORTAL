import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Building2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const perfiles = {
  "concesionaria": {
    label: "Concesionarias",
    description:
      "Acceso al entorno de gestión y seguimiento para operaciones registrales.",
    tags: "Operaciones · Documentación · Seguimiento registral",
  },
  "productores-seguros": {
    label: "Productores asesores de seguros",
    description:
      "Acceso al entorno de gestión y seguimiento para trámites registrales.",
    tags: "Siniestros · Documentación · Seguimiento operativo",
  },
  "companias-aseguradoras": {
    label: "Compañías aseguradoras",
    description:
      "Acceso institucional al entorno de consulta y seguimiento de gestiones.",
    tags: "Siniestros · Recuperos · Documentación registral",
  },
};

export default function LoginEmpresas() {
  const router = useRouter();
  const tipo = router.query?.tipo;
  const perfil = perfiles[tipo] || {
    label: "Portal Empresas",
    description: "Acceso al entorno privado de gestión registral.",
    tags: "Trámites · Documentación · Trazabilidad",
  };

  function handleSubmit(event) {
    event.preventDefault();
    alert("La validación de usuarios se conectará en el próximo paso.");
  }

  return (
    <main className="page">
      <section className="shell">
        <header className="topbar">
          <div>
            <div className="brand">SAKI</div>
            <div className="brandSub">Portal Empresas</div>
          </div>

          <Link href="/empresas" className="backLink">
            <ArrowLeft size={16} />
            Volver a accesos
          </Link>
        </header>

        <section className="loginWrap">
          <div className="copy">
            <div className="kicker">
              <Building2 size={16} />
              Acceso privado
            </div>

            <h1>{perfil.label}</h1>

            <p>{perfil.description}</p>

            <div className="tags">{perfil.tags}</div>
          </div>

          <form className="loginCard" onSubmit={handleSubmit}>
            <div className="lockBox">
              <LockKeyhole size={24} />
            </div>

            <h2>Acceso al portal</h2>

            <p className="loginText">
              Ingresá con tu usuario y contraseña.
            </p>

            <label className="field">
              <span>Usuario</span>
              <div className="inputWrap">
                <UserRound size={17} />
                <input
                  type="text"
                  name="usuario"
                  placeholder="Ingresá tu usuario"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="field">
              <span>Contraseña</span>
              <div className="inputWrap">
                <ShieldCheck size={17} />
                <input
                  type="password"
                  name="password"
                  placeholder="Ingresá tu contraseña"
                  autoComplete="current-password"
                />
              </div>
            </label>

            <button type="submit" className="submitButton">
              Ingresar
            </button>

            <div className="safeText">
              Acceso seguro para usuarios autorizados.
            </div>
          </form>
        </section>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 12% 10%, rgba(37, 99, 235, 0.22), transparent 32%),
            radial-gradient(circle at 88% 4%, rgba(14, 165, 233, 0.16), transparent 30%),
            linear-gradient(180deg, #031225 0%, #06172e 54%, #07111f 100%);
          color: #e5eefc;
          font-family:
  Aptos,
  "Segoe UI",
  Roboto,
  Arial,
  sans-serif;
        }

        .shell {
          width: min(1080px, calc(100% - 40px));
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
          border-radius: 13px;
          border: 1px solid rgba(96, 165, 250, 0.18);
          background: rgba(37, 99, 235, 0.10);
          color: #bfdbfe;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 13px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        }

        .loginWrap {
          min-height: calc(100vh - 150px);
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 42px;
          align-items: center;
          padding: 34px 0 24px;
        }

        .copy {
          max-width: 590px;
        }

        .kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          border: 1px solid rgba(96, 165, 250, 0.24);
          background: rgba(37, 99, 235, 0.14);
          color: #bfdbfe;
          padding: 9px 13px;
          font-size: 12px;
          font-weight: 650;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

h1 {
  margin: 0;
  color: rgba(248, 250, 252, 0.96);
  font-size: clamp(24px, 2.4vw, 32px);
  line-height: 1.16;
  font-weight: 600;
  letter-spacing: -0.015em;
}
.copy p {
  margin: 12px 0 0;
  color: rgba(214, 228, 245, 0.70);
  font-size: 14px;
  line-height: 1.55;
  max-width: 470px;
}

.tags {
  margin-top: 20px;
  color: rgba(147, 197, 253, 0.78);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

        .loginCard {
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background:
    linear-gradient(180deg, rgba(9, 32, 60, 0.78), rgba(3, 18, 34, 0.64));
  padding: 24px;
          box-shadow:
            0 0 0 1px rgba(96, 165, 250, 0.08),
            0 26px 78px rgba(0, 0, 0, 0.30);
        }

        .lockBox {
          width: 44px;
          height: 44px;
          border-radius: 18px;
          background: rgba(37, 99, 235, 0.18);
          border: 1px solid rgba(96, 165, 250, 0.20);
          color: #93c5fd;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

.loginCard h2 {
  margin: 0;
  color: rgba(248, 250, 252, 0.96);
  font-size: 20px;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.01em;
}

        .loginText {
          margin: 8px 0 22px;
          color: rgba(214, 228, 245, 0.68);
          font-size: 13.5px;
          line-height: 1.55;
        }

        .field {
          display: block;
          margin-top: 15px;
        }

 .field span {
  display: block;
  margin-bottom: 7px;
  color: rgba(226, 232, 240, 0.72);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

        .inputWrap {
          height: 48px;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(2, 8, 18, 0.30);
          color: rgba(147, 197, 253, 0.85);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
        }

        .inputWrap:focus-within {
          border-color: rgba(96, 165, 250, 0.65);
          box-shadow:
            0 0 0 1px rgba(96, 165, 250, 0.24),
            0 0 24px rgba(37, 99, 235, 0.20);
        }

        input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #ffffff;
          font-size: 14px;
          font-family: inherit;
        }

        input::placeholder {
          color: rgba(148, 163, 184, 0.60);
        }

.submitButton {
  width: 100%;
  height: 46px;
  margin-top: 22px;
  border: none;
  border-radius: 15px;
  background: linear-gradient(180deg, #2563eb, #1d4ed8);
  color: #ffffff;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.22);
}

        .submitButton:hover {
          background: linear-gradient(180deg, #3b82f6, #2563eb);
          box-shadow:
            0 0 0 1px rgba(96, 165, 250, 0.28),
            0 0 28px rgba(37, 99, 235, 0.30);
        }

        .safeText {
          margin-top: 16px;
          text-align: center;
          color: rgba(168, 196, 232, 0.62);
          font-size: 12px;
          line-height: 1.45;
        }

        @media (max-width: 860px) {
.loginWrap {
  min-height: calc(100vh - 130px);
  display: grid;
  grid-template-columns: 0.9fr 380px;
  gap: 28px;
  align-items: center;
  padding: 22px 0 18px;
}

          .copy {
            max-width: 100%;
          }

          .loginCard {
            max-width: 480px;
          }
        }

        @media (max-width: 620px) {
          .shell {
            width: min(100% - 28px, 1080px);
            padding-top: 18px;
          }

          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .loginCard {
            padding: 24px;
          }
        }
      `}</style>
    </main>
  );
}