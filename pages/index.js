import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dia");
  }, [router]);

  return <p>Cargando Portal Día...</p>;
}