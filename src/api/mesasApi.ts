import { Mesa, Zona } from "../types/mesa";
import { API_URL } from "../config";

interface MesaBackend {
  id: number;
  nombre?: string;
  capacidad: number;
  zonaId: number | null;
  estadoMesa?: string;
  estado?: string;
  updatedAt?: string;
}

interface FormDataResponse {
  zonas: Zona[];
}

// --- CORRECCIÓN EN ADAPT MESA (Visual) ---
const adaptMesa = (m: any): Mesa => {
  const rawEstado = m.estado || m.estadoMesa || "LIBRE";
  let estadoNormalizado = String(rawEstado).toUpperCase();
  if (estadoNormalizado === "ACTIVA") estadoNormalizado = "LIBRE";

  const estadosPermitidos = [
    "LIBRE",
    "OCUPADA",
    "ESPERANDO",
    "AGRUPADA",
    "INACTIVA",
    "DESACTIVADA",
    "ACTIVA",
  ];

  const estadoFinal = (
    estadosPermitidos.includes(estadoNormalizado) ? estadoNormalizado : "LIBRE"
  ) as Mesa["estado"];

  // ✅ AQUÍ ESTÁ EL ARREGLO VISUAL:
  // Si zonaId es null, forzamos el texto "Sin Zona".
  const nombreZona =
    m.zonaId === null ? "Sin Zona" : m.zona?.nombre || `Zona ${m.zonaId}`;

  return {
    id: m.id,
    nombre: m.nombre || `Mesa ${m.id}`,
    capacidad: m.capacidad,
    zonaId: m.zonaId,
    zona: nombreZona, // 👈 Usamos la variable corregida
    estado: estadoFinal,
    updatedAt: m.updatedAt,
    orden: m.orden || null,
  };
};

export const getMesas = async (): Promise<Mesa[]> => {
  const res = await fetch(`${API_URL}/tables`);
  if (!res.ok) throw new Error("Error obteniendo mesas");
  const data: MesaBackend[] = await res.json();
  return data.map(adaptMesa);
};

export const getFormData = async (): Promise<FormDataResponse> => {
  try {
    const response = await fetch(`${API_URL}/tables/form-data`);
    if (!response.ok) throw new Error("Error cargando configuración");
    return await response.json();
  } catch (error) {
    console.error("Error getFormData:", error);
    return { zonas: [] };
  }
};

export const addMesa = async (data: {
  capacidad: number;
  zonaId: number;
  // nombre: string; // Tu API POST actual no pedía nombre, pero si lo actualizan, descomenta esto
}): Promise<Mesa> => {
  const res = await fetch(`${API_URL}/tables`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error creando mesa");
  const mesaBack = await res.json();
  return adaptMesa(mesaBack);
};

// --- CORRECCIÓN EN EDIT MESA (Lógica) ---
export const editMesa = async (
  id: number,
  capacidad?: number,
  zonaId?: number | null,
  estadoMesa?: string
): Promise<void> => {
  const bodyData = {
    capacidad,
    // ✅ ASEGURAMOS QUE NULL SE ENVÍE
    // Si zonaId es null, se envía null. Si es undefined, se omite.
    zonaId,
    estado: estadoMesa,
    estadoMesa: estadoMesa,
  };

  // 👇 DEBUG: Mira la consola. Si dice "zonaId": null, está funcionando.
  // Si dice "zonaId" no aparece, es que llegó undefined.
  console.log("PATCH enviando:", bodyData);

  const res = await fetch(`${API_URL}/tables/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  });

  if (!res.ok) throw new Error("Error editando mesa");
};

export const deleteMesas = async (ids: number[]): Promise<void> => {
  const promises = ids.map((id) =>
    fetch(`${API_URL}/tables/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
  );

  const results = await Promise.all(promises);
  const failed = results.some((r) => !r.ok);
  if (failed) throw new Error("Error al eliminar algunas mesas");
};

export const getMesaConOrdenes = async (id: number): Promise<Mesa | null> => {
  const res = await fetch(`${API_URL}/tables/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return adaptMesa(data);
};
