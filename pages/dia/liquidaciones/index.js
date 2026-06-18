import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function LiquidacionesHomeDia() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    verificarUsuario();
  }, []);

  async function verificarUsuario() {
    try {
      setLoadingUser(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        setCanAccess(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, sector, email, full_name, name")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error al verificar perfil:", error);
        setCanAccess(false);
        return;
      }

      const sector = String(profile?.sector || "").toLowerCase();

      setCanAccess(
        profile?.role === "admin" ||
        sector.includes("franquicias")
      );
    } finally {
      setLoadingUser(false);
    }
  }

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
              Este módulo está disponible para usuarios administradores y
              Administración Franquicias.
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
      <div className="shell">
        <header className="topbar">
          <div>
            <div className="brand">SAKI</div>
            <div className="brandSub">Liquidaciones Día</div>
          </div>

          <Link href="/dia/workspace" className="backLink">
            Volver al Workspace
          </Link>
        </header>

<div className="introCompact">
  <span className="eyebrow">MÓDULO DÍA</span>
  <h1>Liquidaciones / Facturación</h1>
  <p>
    Consultá liquidaciones emitidas y fondos a rendir. Las liquidaciones
    mensuales y la cuenta corriente de fondos se gestionan por separado.
  </p>
</div>

        <section className="cardsGrid">
          <Link href="/dia/liquidaciones/emitidas" className="moduleCard">
            <div className="iconBox">📄</div>

            <div>
              <h2>Liquidaciones emitidas</h2>
              <p>
                Detalle mensual de trabajos entregados para facturación,
                agrupados por dominio, trámite, tienda, sector y analista.
              </p>
            </div>

            <span className="cardAction">Entrar a liquidaciones emitidas →</span>
          </Link>

          <Link href="/dia/liquidaciones/fondos" className="moduleCard">
            <div className="iconBox">💰</div>

            <div>
              <h2>Fondos a rendir</h2>
              <p>
                Cuenta corriente manual de ingresos y egresos: fondos recibidos,
                gastos por dominio, comprobantes, recibos y saldo disponible.
              </p>
            </div>

            <span className="cardAction">Entrar a fondos a rendir →</span>
          </Link>
        </section>
      </div>

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
    display: block !important;
  }

  .shell {
    max-width: 1180px;
    width: 100%;
    margin: 0 auto;
    display: block !important;
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

   .introCompact {
    margin-top: 18px !important;
    margin-bottom: 0 !important;
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: rgba(3, 18, 34, 0.42);
    padding: 16px 24px 18px !important;
    min-height: 0 !important;
    height: auto !important;
    max-height: 130px !important;
    overflow: hidden !important;
    display: block !important;
    box-sizing: border-box !important;
  }

  .eyebrow {
    color: rgba(125, 211, 252, 0.90);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .introCompact h1 {
    margin: 6px 0 6px;
    color: #ffffff;
    font-size: 30px;
    line-height: 1.1;
  }

  .introCompact p,
  .moduleCard p,
  .accessBox p {
    margin: 0;
    color: rgba(191, 219, 254, 0.72);
    font-size: 14px;
    line-height: 1.5;
  }

  .cardsGrid {
    margin-top: 14px !important;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .moduleCard {
    min-height: 230px;
    border-radius: 24px;
    border: 1px solid rgba(96, 165, 250, 0.18);
    background:
      linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(15, 23, 42, 0.18)),
      rgba(3, 18, 34, 0.46);
    padding: 24px;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 16px 38px rgba(0, 0, 0, 0.18);
    transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }

  .moduleCard:hover {
    transform: translateY(-2px);
    border-color: rgba(96, 165, 250, 0.34);
    background:
      linear-gradient(180deg, rgba(37, 99, 235, 0.22), rgba(15, 23, 42, 0.20)),
      rgba(3, 18, 34, 0.52);
  }

  .iconBox {
    width: 50px;
    height: 50px;
    border-radius: 16px;
    border: 1px solid rgba(96, 165, 250, 0.28);
    background: rgba(37, 99, 235, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 23px;
  }

  .moduleCard h2 {
    margin: 22px 0 8px;
    color: #ffffff;
    font-size: 25px;
    line-height: 1.15;
  }

  .cardAction {
    margin-top: 20px;
    color: #60a5fa;
    font-size: 14px;
    font-weight: 800;
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

  @media (max-width: 800px) {
    .cardsGrid {
      grid-template-columns: 1fr;
    }
  }
`;