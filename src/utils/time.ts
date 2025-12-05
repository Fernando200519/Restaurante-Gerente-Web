/**
 * Procesa la cadena de fecha ISO 8601 (sin zona horaria) del backend
 * y la convierte a un formato local (AM/PM) sin aplicar conversiones
 * de zona horaria del navegador. Si la cadena incluye zona (Z o +hh:mm)
 * se respetará la hora resultante al parsear el tiempo.
 *
 * @param isoString Fecha y hora del backend (ej: "2025-12-05T00:58:27.308247")
 * @returns La hora formateada (ej: "12:58 AM" o "6:58 PM")
 */
export function formatTimeAmPm(isoString: string): string {
  if (!isoString) return "--:--";

  // Detectamos si la cadena incluye información de zona (Z o ±HH:MM)
  const hasZone = /[zZ]$|[+-]\d{2}(:?\d{2})?$/.test(isoString);

  // Si NO tiene zona, la tratamos como UTC (añadimos 'Z') porque el backend
  // nos está devolviendo el instante en UTC sin indicar zona.
  const parseable = hasZone ? isoString : `${isoString}Z`;

  const d = new Date(parseable);
  if (isNaN(d.getTime())) return "--:--";

  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m < 10 ? `0${m}` : String(m);
  return `${h12}:${mm} ${ampm}`;
}

export default formatTimeAmPm;

/**
 * Parsea una cadena ISO recibida del backend (posiblemente sin zona)
 * y devuelve un objeto Date válido en el tiempo correcto.
 * Si la cadena no contiene información de zona, se asume UTC (se añade 'Z').
 */
export function parseBackendIsoToDate(isoString: string): Date | null {
  if (!isoString) return null;
  const hasZone = /[zZ]$|[+-]\d{2}(:?\d{2})?$/.test(isoString);
  const parseable = hasZone ? isoString : `${isoString}Z`;
  const d = new Date(parseable);
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Formatea una Date local a YYYY-MM-DD
 */
export function formatDateLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
