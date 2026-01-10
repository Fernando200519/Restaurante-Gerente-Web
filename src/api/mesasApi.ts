import { Mesa, Zona } from "../types/mesa";
import { apiClient } from "./config";
import { parseBackendIsoToDate } from "../utils/time";

interface MesaBackend {
  id: number;
  zona?: string | { id: number; nombre: string; estado: string };
  nombre?: string;
  estado?: string;
  ordenId?: number | null;
  totalCuentaActiva?: number | null;
  fechaHoraInicioOcupacion?: string | null;
  zonaId?: number | null;
  area?: { id: number; nombre: string; estado: string };
  grupo?: number;
  principal?: string;
}

interface FormDataResponse {
  zonas: Zona[];
}

const adaptMesa = (m: MesaBackend): Mesa => {
  const rawEstado = m.estado || "LIBRE";
  let estadoNormalizado = String(rawEstado).toUpperCase();

  if (estadoNormalizado === "ACTIVA") {
    estadoNormalizado = "LIBRE";
  } else if (estadoNormalizado === "PENDIENTE DE PAGO") {
    estadoNormalizado = "ESPERANDO_PAGO";
  } else if (estadoNormalizado === "POR LIBERAR") {
    estadoNormalizado = "POR_LIBERAR";
  }

  const estadosPermitidos = [
    "LIBRE",
    "OCUPADA",
    "ESPERANDO",
    "ESPERANDO_PAGO",
    "POR_LIBERAR",
    "AGRUPADA",
    "INACTIVA",
    "DESACTIVADA",
  ];

  const estadoFinal = (
    estadosPermitidos.includes(estadoNormalizado) ? estadoNormalizado : "LIBRE"
  ) as Mesa["estado"];

  let nombreZonaFinal = "Sin Zona";
  if (typeof m.zona === "string") {
    nombreZonaFinal = m.zona;
  } else if (m.zona && typeof m.zona === "object" && "nombre" in m.zona) {
    nombreZonaFinal = m.zona.nombre;
  } else if (m.area && m.area.nombre) {
    nombreZonaFinal = m.area.nombre;
  }

  let ordenFinal = null;
  if (m.ordenId || (m.totalCuentaActiva && m.totalCuentaActiva > 0)) {
    const dateObj = parseBackendIsoToDate(m.fechaHoraInicioOcupacion || "");

    ordenFinal = {
      id: m.ordenId || 0,
      total: m.totalCuentaActiva || 0,
      montoTotal: m.totalCuentaActiva || 0,
      totalAlertas: 0,
      startedAt: dateObj ? dateObj.toISOString() : undefined,
      platillos: [],
    };
  }

  return {
    id: m.id,
    nombre: m.nombre || `Mesa ${m.id}`,
    zonaId: m.zonaId ?? null,
    zona: nombreZonaFinal,
    estado: estadoFinal,
    orden: ordenFinal,
    grupo: m.grupo ?? 0,
    principal: m.principal ?? "",
  };
};

export const getMesas = async (zoneId?: number): Promise<Mesa[]> => {
  const url = zoneId ? `/tables?zoneId=${zoneId}` : "/tables";
  const { data } = await apiClient.get<MesaBackend[]>(url);
  return data.map(adaptMesa);
};

export const getFormData = async (): Promise<FormDataResponse> => {
  try {
    const { data } = await apiClient.get<FormDataResponse>("/tables/form-data");
    return data;
  } catch (error) {
    console.error("Error getFormData:", error);
    return { zonas: [] };
  }
};

export const addMesa = async (data: { zonaId: number }): Promise<Mesa> => {
  const { data: mesaBack } = await apiClient.post<MesaBackend>("/tables", data);
  return adaptMesa(mesaBack);
};

export const editMesa = async (
  id: number,
  zonaId?: number | null,
  estadoMesa?: string
): Promise<void> => {
  const bodyData: Record<string, any> = {};
  if (zonaId !== undefined) bodyData.zonaId = zonaId;
  if (estadoMesa !== undefined) bodyData.estadoMesa = estadoMesa;

  await apiClient.patch(`/tables/${id}`, bodyData);
};

export const deleteMesas = async (ids: number[]): Promise<void> => {
  const promises = ids.map((id) => apiClient.delete(`/tables/${id}`));
  await Promise.all(promises);
};

export const getMesaConOrdenes = async (id: number): Promise<Mesa | null> => {
  try {
    const { data } = await apiClient.get<MesaBackend>(`/tables/${id}`);

    if (!data) return null;
    return adaptMesa(data);
  } catch (error) {
    console.error(`Error al obtener detalle de mesa ${id}:`, error);
    return null;
  }
};
