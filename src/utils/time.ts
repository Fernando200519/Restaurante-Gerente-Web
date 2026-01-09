export function formatTimeAmPm(isoString: string): string {
  if (!isoString) return "--:--";

  const hasZone = /[zZ]$|[+-]\d{2}(:?\d{2})?$/.test(isoString);

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

export function parseBackendIsoToDate(isoString: string): Date | null {
  if (!isoString) return null;
  const hasZone = /[zZ]$|[+-]\d{2}(:?\d{2})?$/.test(isoString);
  const parseable = hasZone ? isoString : `${isoString}Z`;
  const d = new Date(parseable);
  if (isNaN(d.getTime())) return null;
  return d;
}

export function formatDateLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
