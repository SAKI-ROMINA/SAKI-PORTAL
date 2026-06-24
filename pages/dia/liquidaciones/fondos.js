import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, WalletCards } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function FondosARendir() {
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
        setCanAccess(profile?.role === "admin" || sector.includes("franquicias"));
      } finally {
        setLoading(false);
      }
    }

    verificarAcceso();
  }, []);

  if (loading) {
    return <main className="page"><section className="shell">Verificando acceso...</section><style jsx>{styles}</style></main>;
  }

  if (!canAccess) {
    return (
      <main className="page"><section className="shell card"><h1>Acceso restringido</h1><p>Este módulo está disponible para usuarios administradores y Administración Franquicias.</p><Link href="/dia/liquidaciones" className="backLink">Volver a Liquidaciones</Link></section><style jsx>{styles}</style></main>
    );
  }

  return (
    <main className="page">
      <section className="shell">
        <Link href="/dia/liquidaciones" className="backLink"><ArrowLeft size={16} />Volver a Liquidaciones</Link>
        <section className="card">
          <div className="icon"><WalletCards size={28} /></div>
          <h1>Fondos a rendir</h1>
          <p>Registro de ingresos, egresos, comprobantes y saldos pendientes.</p>
          <div className="notice">Módulo en preparación.</div>
        </section>
      </section>
      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  .page { min-height: 100vh; background: #f4f8fc; color: #1e3a5f; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  .shell { width: min(820px, calc(100% - 40px)); margin: 0 auto; padding: 32px 0 54px; }
  .backLink { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; color: #0b4f8a; padding: 9px 13px; font-size: 13px; font-weight: 700; text-decoration: none; }
  .card { margin-top: 26px; border: 1px solid #dbe5f0; border-radius: 16px; background: #fff; box-shadow: 0 8px 22px rgba(15,71,122,.06); padding: 26px; }
  .icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 14px; background: #eaf3fb; color: #0b63a8; }
  h1 { margin: 18px 0 8px; color: #153d69; font-size: 28px; }
  p { margin: 0; color: #64748b; line-height: 1.55; }
  .notice { margin-top: 22px; border: 1px solid #bfdbfe; border-radius: 10px; background: #eff6ff; color: #1d4ed8; padding: 11px 13px; font-size: 14px; font-weight: 700; }
`;
