import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DiaLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedEmail = window.localStorage.getItem("dia_last_email");

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("dia_last_email", cleanEmail);
    }

    setOk(true);
    window.location.href = "/dia";
  };

  if (ok) {
    return (
      <div style={pageStyle}>
        <div style={statusCardStyle}>
          <div style={kickerStyle}>PORTAL DÍA</div>
          <h1 style={statusTitleStyle}>Ingresando...</h1>
          <p style={statusTextStyle}>Redirigiendo al entorno SAKI.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <main style={loginCardStyle}>
        <section style={brandSectionStyle}>
          <div style={kickerStyle}>PORTAL DÍA</div>

          <h1 style={logoStyle}>SAKI</h1>

          <h2 style={titleStyle}>
            Acceso al entorno de gestión y seguimiento
          </h2>

          <p style={subtitleStyle}>
            Ingresá con tu email corporativo y tu contraseña.
          </p>
        </section>

        <form onSubmit={enviar} style={formStyle}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Email corporativo</label>

            <input
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              autoComplete="email"
              inputMode="email"
              required
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Contraseña</label>

            <div style={passwordWrapStyle}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{
                  ...inputStyle,
                  paddingRight: "72px",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                style={showPasswordButtonStyle}
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          {error && <div style={errorStyle}>{error}</div>}

          <div style={moduleLineStyle}>
            <span>Informes registrales</span>
            <span style={dotStyle}>·</span>
            <span>Prendas M&amp;T</span>
            <span style={dotStyle}>·</span>
            <span>Trazabilidad documental</span>
          </div>

          <div style={secureLineStyle}>
            Acceso seguro para usuarios autorizados
          </div>
        </form>
      </main>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 20px",
  boxSizing: "border-box",
  color: "#f8fbff",
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  background:
    "radial-gradient(850px 460px at 24% 8%, rgba(59,130,246,0.20), transparent 58%), radial-gradient(680px 420px at 80% 88%, rgba(14,165,233,0.12), transparent 62%), linear-gradient(180deg, #03122c 0%, #041833 48%, #061327 100%)",
};

const loginCardStyle = {
  width: "min(560px, 100%)",
  padding: "46px 46px 38px",
  boxSizing: "border-box",
  borderRadius: "26px",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  background:
    "linear-gradient(180deg, rgba(8, 30, 60, 0.78), rgba(5, 18, 39, 0.82))",
  boxShadow: "0 28px 90px rgba(0,0,0,0.34)",
  backdropFilter: "blur(16px)",
};

const brandSectionStyle = {
  textAlign: "center",
  marginBottom: "34px",
};

const kickerStyle = {
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.28em",
  color: "#7dd3fc",
  marginBottom: "14px",
};

const logoStyle = {
  margin: 0,
  fontSize: "48px",
  lineHeight: 1,
  fontWeight: 650,
  letterSpacing: "0.10em",
  color: "#ffffff",
};

const titleStyle = {
  margin: "22px 0 0",
  fontSize: "18px",
  lineHeight: 1.35,
  fontWeight: 560,
  color: "#dbeafe",
};

const subtitleStyle = {
  margin: "8px 0 0",
  fontSize: "14px",
  lineHeight: 1.45,
  color: "rgba(205, 220, 238, 0.68)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: 650,
  color: "rgba(226, 237, 249, 0.82)",
};

const inputStyle = {
  width: "100%",
  height: "48px",
  borderRadius: "12px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(3, 18, 34, 0.44)",
  color: "#ffffff",
  padding: "0 14px",
  fontSize: "14px",
  fontWeight: 420,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const passwordWrapStyle = {
  position: "relative",
};

const showPasswordButtonStyle = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  color: "#7dd3fc",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
  padding: "6px",
};

const primaryButtonStyle = {
  width: "62%",
  alignSelf: "center",
  marginTop: "10px",
  height: "46px",
  borderRadius: "12px",
  border: "1px solid rgba(147, 197, 253, 0.24)",
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.96) 0%, rgba(14,165,233,0.90) 100%)",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 16px 30px rgba(37, 99, 235, 0.22)",
};

const errorStyle = {
  padding: "12px 14px",
  borderRadius: "12px",
  background: "rgba(239, 68, 68, 0.10)",
  border: "1px solid rgba(248, 113, 113, 0.22)",
  color: "#fecaca",
  fontSize: "13px",
  lineHeight: 1.4,
};

const moduleLineStyle = {
  marginTop: "6px",
  paddingTop: "16px",
  borderTop: "1px solid rgba(148, 163, 184, 0.10)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "7px",
  flexWrap: "wrap",
  color: "rgba(191, 219, 254, 0.58)",
  fontSize: "11.5px",
  lineHeight: 1.4,
};

const dotStyle = {
  color: "rgba(96, 165, 250, 0.45)",
};

const secureLineStyle = {
  marginTop: "0px",
  textAlign: "center",
  color: "rgba(205, 220, 238, 0.50)",
  fontSize: "11.5px",
};

const statusCardStyle = {
  width: "100%",
  maxWidth: 440,
  background:
    "linear-gradient(180deg, rgba(8, 30, 60, 0.78), rgba(5, 18, 39, 0.82))",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: 24,
  padding: 28,
  boxShadow: "0 24px 80px rgba(0,0,0,0.34)",
};

const statusTitleStyle = {
  margin: 0,
  fontSize: 26,
  fontWeight: 600,
  color: "#ffffff",
};

const statusTextStyle = {
  margin: "8px 0 0",
  color: "rgba(205,220,238,0.68)",
};

// Evita declarar cursor inline con loading fuera del componente.
// Si querés que cambie visualmente al cargar, después lo ajustamos dentro del botón.
const loadingCursorSafe = "pointer";