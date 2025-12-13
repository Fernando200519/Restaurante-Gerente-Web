import { Mesa, Zona } from "../types/mesa";
import { apiClient } from "./config";

interface MesaBackend {
  id: number;
  zona?: string;
  area?: { id: number; nombre: string; estado: string };
  zonaId?: number | null;
  estado?: string;
  totalCuentaActiva?: number | null;
  ordenId?: number | null;
  fechaHoraInicioOcupacion?: string | null;

  nombre?: string;
  updatedAt?: string;
}

interface FormDataResponse {
  zonas: Zona[];
}

const adaptMesa = (m: MesaBackend): Mesa => {
  const rawEstado = m.estado || "LIBRE";
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

  let nombreZonaFinal = "Sin Zona";

  if (typeof m.zona === "string") {
    nombreZonaFinal = m.zona;
  } else if (m.area && m.area.nombre) {
    nombreZonaFinal = m.area.nombre;
  }

  const zonaIdFinal = m.zonaId ?? null;

  let ordenFinal: any = null;

  if ((m.ordenId && m.ordenId > 0) || m.totalCuentaActiva != null) {
    ordenFinal = {
      id: m.ordenId || 0,
      total: m.totalCuentaActiva || 0,
      montoTotal: m.totalCuentaActiva || 0,
      totalAlertas: 0,
      startedAt: m.fechaHoraInicioOcupacion || undefined,
      platillos: [],
    };
  }

  return {
    id: m.id,
    nombre: m.nombre || `Mesa ${m.id}`,
    zonaId: zonaIdFinal,
    zona: nombreZonaFinal,
    estado: estadoFinal,
    updatedAt: m.updatedAt,
    orden: ordenFinal,
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

// PATCH /tables/{id}
export const editMesa = async (
  id: number,
  zonaId?: number | null,
  estadoMesa?: string
): Promise<void> => {
  // 1. Construimos un objeto dinámico "limpio"
  // Solo agregamos las propiedades si NO son undefined
  const bodyData: Record<string, any> = {};

  if (zonaId !== undefined) {
    bodyData.zonaId = zonaId;
  }

  if (estadoMesa !== undefined) {
    bodyData.estadoMesa = estadoMesa;
  }

  console.log("PATCH enviando limpio:", bodyData);

  // 2. Enviamos solo lo necesario (ej: { "zonaId": 5 })
  // Esto evita que el backend resetee el estado por recibir un null
  await apiClient.patch(`/tables/${id}`, bodyData);
};

export const deleteMesas = async (ids: number[]): Promise<void> => {
  const promises = ids.map((id) => apiClient.delete(`/tables/${id}`));
  await Promise.all(promises);
};

export const getMesaConOrdenes = async (id: number): Promise<Mesa | null> => {
  try {
    const { data } = await apiClient.get(`/tables/${id}`);

    let item: any = null;
    if (Array.isArray(data)) {
      item = data.find((x: any) => Number(x.id) === Number(id)) || data[0];
    } else {
      item = data;
    }

    if (!item) return null;
    return adaptMesa(item);
  } catch (error) {
    return null;
  }
};
