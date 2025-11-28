import { Zona } from "../types/mesa";
import { API_URL } from "../config";

export const getZonas = async (): Promise<Zona[]> => {
  const res = await fetch(`${API_URL}/zones`);
  if (!res.ok) throw new Error("Error obteniendo zonas");

  const data: Zona[] = await res.json();

  return data.filter((z) => z.estado !== "Eliminada");
};

export const addZona = async (nombre: string): Promise<Zona> => {
  const res = await fetch(`${API_URL}/zones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
  });

  if (!res.ok) throw new Error("Error creando zona");
  return await res.json();
};

export const editZona = async (
  id: number,
  nombre?: string,
  estado?: "Activa" | "Inactiva"
): Promise<Zona | null> => {
  // 👈 Ahora puede devolver null
  const res = await fetch(`${API_URL}/zones/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, estado }),
  });

  if (!res.ok) throw new Error("Error editando zona");

  // ✅ CORRECCIÓN: Leemos como texto primero para evitar el crash
  const text = await res.text();

  // Si el texto está vacío, devolvemos null (operación exitosa sin datos de vuelta)
  // Si hay texto, lo convertimos a JSON
  return text ? JSON.parse(text) : null;
};

export const deleteZona = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/zones/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Error borrando zona");
};

export const moverMesasDeZona = async (
  origenZonaId: number,
  destinoZonaId: number
): Promise<void> => {
  const res = await fetch(
    `${API_URL}/zones/${origenZonaId}/move-tables?targetZoneId=${destinoZonaId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!res.ok) throw new Error("Error moviendo mesas a zona existente");
};

export const migrarMesasNuevaZona = async (
  origenZonaId: number,
  nombreNuevaZona: string
): Promise<void> => {
  const res = await fetch(
    `${API_URL}/zones/${origenZonaId}/migrate-tables?newZoneName=${encodeURIComponent(
      nombreNuevaZona
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!res.ok) throw new Error("Error migrando mesas a nueva zona");
};

export const deleteZonaConMesas = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/zones/${id}/with-tables`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Error borrando zona y sus mesas");
};
