import { Mesa, Zona } from "../types/mesa";
import { API_URL } from "../config";
import { buildFetchHeaders } from "./config";

interface MesaBackend {
  id: number;
  nombre?: string;
  capacidad?: number;
  zonaId?: number | null;
  estadoMesa?: string;
  estado?: string;
  updatedAt?: string;
  // Nuevos campos del backend
  orderId?: number | null;
  nombreZona?: string;
  totalCuentaActiva?: number | null;
  ordenFechaHoraInicio?: string | null;
}

interface FormDataResponse {
  zonas: Zona[];
}

// --- MAPEO CORRECTED (Backend → Frontend) ---
const adaptMesa = (m: MesaBackend): Mesa => {
  // 1. MAPEAR ESTADO: "Ocupada" -> "OCUPADA", "Libre" -> "LIBRE"
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

  // 2. MAPEAR ZONA: nombreZona viene como string desde backend
  const nombreZonaFinal =
    m.nombreZona && m.nombreZona.trim() ? m.nombreZona : "Sin Zona";

  // 3. CONSTRUIR ORDEN (si existe orderId)
  let ordenFinal: any = null;
  if (m.orderId && m.orderId > 0) {
    ordenFinal = {
      id: m.orderId,
      total: m.totalCuentaActiva || 0,
      montoTotal: m.totalCuentaActiva || 0,
      totalAlertas: 0,
      startedAt: m.ordenFechaHoraInicio || undefined,
      platillos: [],
    };
  }

  return {
    id: m.id,
    nombre: m.nombre || `Mesa ${m.id}`,
    capacidad: m.capacidad || 2,
    zonaId: m.zonaId ?? null,
    zona: nombreZonaFinal,
    estado: estadoFinal,
    updatedAt: m.updatedAt,
    orden: ordenFinal,
  };
};

export const getMesas = async (): Promise<Mesa[]> => {
  const res = await fetch(`${API_URL}/tables`, {
    headers: buildFetchHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo mesas");
  const data: MesaBackend[] = await res.json();
  return data.map(adaptMesa);
};

export const getFormData = async (): Promise<FormDataResponse> => {
  try {
    const response = await fetch(`${API_URL}/tables/form-data`, {
      headers: buildFetchHeaders(),
    });
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
    headers: buildFetchHeaders(),
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
    headers: buildFetchHeaders(),
    body: JSON.stringify(bodyData),
  });

  if (!res.ok) throw new Error("Error editando mesa");
};

export const deleteMesas = async (ids: number[]): Promise<void> => {
  const promises = ids.map((id) =>
    fetch(`${API_URL}/tables/${id}`, {
      method: "DELETE",
      headers: buildFetchHeaders(),
    })
  );

  const results = await Promise.all(promises);
  const failed = results.some((r) => !r.ok);
  if (failed) throw new Error("Error al eliminar algunas mesas");
};

export const getMesaConOrdenes = async (id: number): Promise<Mesa | null> => {
  const res = await fetch(`${API_URL}/tables/${id}`, {
    headers: buildFetchHeaders(),
  });
  if (!res.ok) return null;
  const data = await res.json();

  // El backend a veces devuelve un array incluso en la ruta /tables/{id}.
  // Manejar ambos casos: objeto o array.
  let item: any = null;
  if (Array.isArray(data)) {
    // Intentar encontrar el elemento con el id correcto
    item =
      data.find((x: any) => Number(x.id) === Number(id)) || data[0] || null;
  } else {
    item = data;
  }

  if (!item) return null;
  return adaptMesa(item);
};
