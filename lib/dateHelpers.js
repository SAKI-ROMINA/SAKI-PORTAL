// Convierte una fecha a formato YYYY-MM-DD (ideal para usar con Supabase ::date)
export function yyyymmdd(d) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .slice(0, 10);
}

// Devuelve el rango de fechas de los últimos N días (incluye hoy)
export function lastNDays(n) {
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - (n - 1)); // incluye hoy
  return { from: yyyymmdd(from), to: yyyymmdd(today) };
}
