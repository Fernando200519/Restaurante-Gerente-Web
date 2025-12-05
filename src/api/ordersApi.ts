import { API_URL } from "../config";
import { buildFetchHeaders } from "./config";

export interface DetalleOrdenBackend {
  id: number;
  producto: string;
  estado: string;
  fechaHoraInicioEstado?: string | null;
  comensal?: string | null;
  total?: number;
}

export interface OrderBackend {
  id: number;
  mesaId: number;
  estadoMesa: string;
  mesero?: string;
  fechaHora?: string;
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
