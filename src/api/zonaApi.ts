import { Zona } from "../types/mesa";
import { apiClient } from "./config";

export const getZonas = async (): Promise<Zona[]> => {
  const { data } = await apiClient.get<Zona[]>("/zones");
  return data.filter((z) => z.estado !== "Eliminada");
};

export const getZona = async (id: number): Promise<Zona> => {
  const { data } = await apiClient.get<Zona>(`/zones/${id}`);
  return data;
};

export const addZona = async (nombre: string): Promise<Zona> => {
  const { data } = await apiClient.post<Zona>("/zones", { nombre });
  return data;
};

export const editZona = async (
  id: number,
  nombre?: string,
  estado?: "Activa" | "Inactiva"
): Promise<Zona> => {
  const body: Record<string, any> = {};

  if (nombre !== undefined) body.nombre = nombre;
  if (estado !== undefined) body.estado = estado;

  const { data } = await apiClient.patch<Zona>(`/zones/${id}`, body);
  return data;
};

export const deleteZona = async (id: number): Promise<void> => {
  await apiClient.delete(`/zones/${id}`);
};

export const moverMesasDeZona = async (
  idOrigen: number,
  targetZoneId: number
) => {
  await apiClient.post(`/zones/${idOrigen}/move-tables`, null, {
    params: { targetZoneId },
  });
  return true;
};

export const migrarMesasNuevaZona = async (
  idOrigen: number,
  newZoneName: string
) => {
  await apiClient.post(`/zones/${idOrigen}/migrate-tables`, null, {
    params: { newZoneName },
  });
  return true;
};

export const deleteZonaConMesas = async (id: number): Promise<void> => {
  await apiClient.delete(`/zones/${id}/with-tables`);
};
