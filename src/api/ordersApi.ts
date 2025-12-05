import { API_URL } from "../config";
import { buildFetchHeaders } from "./config";

// El tipo 'PlatilloEstado' debe ser compatible con lo que envía el backend ("Solicitado")
// y los otros estados que manejas. Si el backend envía un string simple,
// debes permitirlo.
export type PlatilloEstado =
  | "Solicitado"
  | "EN_PREPARACION"
  | "LISTO"
  | "SERVIR";

// Interfaz para los detalles de la orden:
export interface DetalleOrdenBackend {
  id: number;

  // CORRECCIÓN para manejar null/undefined:
  producto?: string | null; // Puede ser string, null, o undefined
  comensal?: string | null; // Puede ser string, null, o undefined
  fechaHoraInicioEstado?: string | null; // Puede ser string, null, o undefined

  cantidad?: number; // Asumiendo que es opcional/no existe en el payload
  total: number;

  // CORRECCIÓN para el estado (si el backend lo envía como string):
  estado: PlatilloEstado;
}

export interface OrderBackend {
  id: number;
  mesaId: number;
  estadoMesa: string;
  mesero?: string;
  fechaHora?: string | null;
  totalComensales?: number;
  detallesOrden?: DetalleOrdenBackend[];
}

export const getOrders = async (): Promise<OrderBackend[]> => {
  const res = await fetch(`${API_URL}/orders`, {
    headers: buildFetchHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo órdenes");
  const data: OrderBackend[] = await res.json();
  return data;
};

export const getOrderById = async (
  id: number
): Promise<OrderBackend | null> => {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: buildFetchHeaders(),
  });
  if (!res.ok) return null;
  const data: OrderBackend = await res.json();
  return data;
};
