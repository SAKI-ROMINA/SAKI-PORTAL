import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

function EyeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const href = typeof window !== "undefined" ? window.location.href : "";
    const search = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const hashParams = new URLSearchParams((hash || "").replace(/^#/, ""));

    const hasCode = search.has("code");
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");
    const hasTokens = !!(access_token && refresh_token);

    let hasVerifier = false;
    try {
      hasVerifier = !!localStorage.getItem("sb-pkce-code-verifier");
    } catch (_) {}

    if (!hasCode && !hasTokens) {
      setErr("Este enlace no es válido o ya fue usado. Pedí uno nuevo.");
      return;
    }

    if (hasCode && !hasVerifier) {
      setErr(
        "Este enlace no puede confirmarse en este navegador. Pedí uno nuevo y abrilo desde este mismo navegador."
      );
      return;
    }

    (async () => {
      try {
        if (hasCode && hasVerifier) {
          const { error } = await supabase.auth.exchangeCodeForSession(href);
          if (error) throw error;
        } else if (hasTokens) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
        }
        setReady(true);
      } catch (e) {
        setErr(e?.message || "No se pudo validar el enlace de recuperación.");
      }
    })();
  }, [router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setSaving(true);

    const { error } = await supabase.auth.updateUser({ password: pwd });

    setSaving(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setMsg("Contraseña actualizada. Ya podés ingresar.");
    setTimeout(() => router.replace("/dia/login"), 1200);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, rgba(10,30,60,1) 0%, rgba(10,45,80,1) 40%, rgba(12,60,100,1) 100%)",
        color: "white",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h1 style={{ marginTop: 0 }}>Restablecer contraseña</h1>

        {!ready && !err && <p>Validando enlace…</p>}
        {err && <p style={{ color: "salmon" }}>{err}</p>}

        {ready && (
          <form onSubmit={onSubmit}>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input
                type={showPwd ? "text" : "password"}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Nueva contraseña"
                required
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <button
              type="submit"
              disabled={saving || !pwd}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "linear-gradient(90deg,#0aa,#0bd)",
                color: "white",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}

        {msg && <p style={{ color: "#7CFC98", marginTop: 12 }}>{msg}</p>}
      </div>
    </div>
  );
}