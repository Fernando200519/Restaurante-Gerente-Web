import { Zona } from "../types/mesa";
import { API_URL } from "../config";
import { buildFetchHeaders } from "./config";

export const getZonas = async (): Promise<Zona[]> => {
  const res = await fetch(`${API_URL}/zones`, { headers: buildFetchHeaders() });
  if (!res.ok) throw new Error("Error obteniendo zonas");

  const data: Zona[] = await res.json();

  return data.filter((z) => z.estado !== "Eliminada");
};

export const addZona = async (nombre: string): Promise<Zona> => {
  const res = await fetch(`${API_URL}/zones`, {
    method: "POST",
    headers: buildFetchHeaders(),
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
    headers: buildFetchHeaders(),
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
    headers: buildFetchHeaders(),
  });

  if (!res.ok) throw new Error("Error borrando zona");
};

// Mover mesas a una zona EXISTENTE
export const moverMesasDeZona = async (
  idOrigen: number,
  targetZoneId: number
) => {
  const res = await fetch(
    `${API_URL}/zones/${idOrigen}/move-tables?targetZoneId=${targetZoneId}`,
    {
      method: "POST",
      headers: buildFetchHeaders(),
    }
  );
  if (!res.ok) throw new Error("Error al mover mesas");
  return true;
};

// Migrar mesas a una NUEVA zona
export const migrarMesasNuevaZona = async (
  idOrigen: number,
  newZoneName: string
) => {
  const res = await fetch(
    `${API_URL}/zones/${idOrigen}/migrate-tables?newZoneName=${encodeURIComponent(
      newZoneName
    )}`,
    {
      method: "POST",
      headers: buildFetchHeaders(),
    }
  );
  if (!res.ok) throw new Error("Error al migrar mesas");
  return true;
};

export const deleteZonaConMesas = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/zones/${id}/with-tables`, {
    method: "DELETE",
    headers: buildFetchHeaders(),
  });
  if (!res.ok) throw new Error("Error borrando zona y sus mesas");
};
