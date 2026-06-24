import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ReceiptText, WalletCards } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function LiquidacionesHome() {
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    async function verificarAcceso() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;

        if (!userId) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, sector")
          .eq("id", userId)
          .single();

        const sector = String(profile?.sector || "").toLowerCase();
        setCanAccess(
          profile?.role === "admin" || sector.includes("franquicias")
        );
      } finally {
        setLoading(false);
      }
    }

    verificarAcceso();
  }, []);

  if (loading) {
    return <main className="page"><section className="shell"><p className="status">Verificando acceso...</p></section><style jsx>{styles}</style></main>;
  }

  if (!canAccess) {
    return (
      <main className="page">
        <section className="shell">
          <div className="accessBox">
            <h1>Acceso restringido</h1>
            <p>Este módulo está disponible para usuarios administradores y Administración Franquicias.</p>
            <Link href="/dia" className="backLink">Volver al Workspace Día</Link>
          </div>
        </section>
        <style jsx>{styles}</style>
      </main>
    );
  }

  const cards = [
    { href: "/dia/liquidaciones/resumen", icon: <FileText size={25} />, title: "Resumen mensual de trabajos", description: "Detalle de trabajos entregados, conceptos, subtotales y total mensual.", action: "Ver resumen mensual" },
    { href: "/dia/liquidaciones/emitidas", icon: <ReceiptText size={25} />, title: "Liquidaciones emitidas", description: "Circuito de OC, EM, factura, e-cheq, comprobantes y estado de cobro.", action: "Ver liquidaciones emitidas" },
    { href: "/dia/liquidaciones/fondos", icon: <WalletCards size={25} />, title: "Fondos a rendir", description: "Registro de ingresos, egresos, comprobantes y saldos pendientes.", action: "Ver fondos a rendir" },
  ];

  return (
    <main className="page">
      <section className="shell">
        <header className="topbar">
          <div><div className="brand">SAKI</div><p>Liquidaciones Día</p></div>
          <Link href="/dia" className="backLink"><ArrowLeft size={16} />Volver al Workspace Día</Link>
        </header>
        <section className="hero"><span>GESTIÓN ADMINISTRATIVA</span><h1>Liquidaciones</h1><p>Elegí el circuito que necesitás consultar o gestionar.</p></section>
        <section className="cards">
          {cards.map((card) => <Link key={card.href} href={card.href} className="card"><div className="icon">{card.icon}</div><h2>{card.title}</h2><p>{card.description}</p><strong>{card.action} →</strong></Link>)}
        </section>
      </section>
      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  .page { min-height: 100vh; background: radial-gradient(circle at top left, rgba(26,78,154,.20), transparent 28%), linear-gradient(180deg, #03122c 0%, #05152f 45%, #071327 100%); color: #e5eefc; font-family: Aptos, "Segoe UI", Roboto, Arial, sans-serif; }
  .shell { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 24px 0 40px; }
  .topbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; min-height: 58px; padding: 14px 20px; border: 1px solid rgba(148,163,184,.12); border-radius: 22px; background: rgba(3,18,34,.46); box-shadow: 0 14px 42px rgba(0,0,0,.20); }
  .brand { color: #fff; font-size: 20px; font-weight: 900; letter-spacing: .12em; }
  .topbar p, .hero p, .card p { margin: 0; color: rgba(191,219,254,.72); }
  .topbar p { margin-top: 3px; font-size: 13px; }
  .backLink { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 38px; padding: 0 16px; border: 1px solid rgba(96,165,250,.20); border-radius: 999px; background: rgba(15,23,42,.42); color: rgba(219,234,254,.92); font-size: 13px; font-weight: 700; text-decoration: none; }
  .hero { margin-top: 16px; margin-bottom: 16px; padding: 20px 22px; border: 1px solid rgba(148,163,184,.12); border-radius: 24px; background: rgba(3,18,34,.42); }
  .hero span { color: rgba(125,211,252,.90); font-size: 11px; font-weight: 800; letter-spacing: .12em; }
  .hero h1 { margin: 7px 0 6px; color: #fff; font-size: 30px; line-height: 1.1; }
  .cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .card { min-height: 164px; padding: 20px; border: 1px solid rgba(96,165,250,.16); border-radius: 22px; background: linear-gradient(180deg, rgba(17,55,96,.62), rgba(8,22,46,.82)); box-shadow: 0 18px 50px rgba(0,0,0,.16); color: #fff; text-decoration: none; transition: transform .16s ease, border-color .16s ease; }
  .card:hover { transform: translateY(-2px); border-color: rgba(96,165,250,.34); }
  .icon { display: grid; width: 42px; height: 42px; place-items: center; border: 1px solid rgba(96,165,250,.16); border-radius: 14px; background: rgba(37,99,235,.16); color: #60a5fa; }
  .card h2 { margin: 16px 0 7px; color: #fff; font-size: 18px; }
  .card p { min-height: 62px; font-size: 14px; line-height: 1.5; }
  .card strong { display: block; margin-top: 14px; color: #93c5fd; font-size: 13px; }
  .accessBox, .status { border: 1px dashed rgba(147,197,253,.24); border-radius: 20px; background: rgba(15,23,42,.30); color: rgba(219,234,254,.82); padding: 22px; }
  .accessBox h1 { margin-top: 0; color: #fff; }
  .accessBox p { margin-bottom: 18px; color: rgba(191,219,254,.72); }
  @media (max-width: 800px) { .shell { width: min(100% - 28px, 1180px); padding-top: 16px; } .topbar { align-items: flex-start; flex-direction: column; } .cards { grid-template-columns: 1fr; } }
`;
