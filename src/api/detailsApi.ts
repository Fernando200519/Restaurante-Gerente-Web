import { API_URL } from "../config";
import { buildFetchHeaders } from "./config";
import { Order, OrderHistoryStep } from "../types/order";
import {
  formatTimeAmPm,
  parseBackendIsoToDate,
  formatDateLocalYYYYMMDD,
} from "../utils/time";

export interface DetailBackend {
  id: number;
  producto: string;
  estado: string;
  fechaHoraInicioEstado?: string | null;
  fechaHora?: string | null;
  mesaId: number;
  empleado?: string | null;
}

export const getDetails = async (
  page: number = 1,
  pageSize: number = 50
): Promise<DetailBackend[]> => {
  const res = await fetch(
    `${API_URL}/details?page=${page}&pageSize=${pageSize}`,
    { headers: buildFetchHeaders() }
  );
  if (!res.ok) throw new Error("Error obteniendo detalles");
  const data: DetailBackend[] = await res.json();
  return data;
};

// Mapear los detalles a la estructura mínima que espera la UI de Orders
export const mapDetailsToOrders = (details: DetailBackend[]): Order[] => {
  return details.map((d) => {
    // Parseamos la fecha/hora del backend teniendo en cuenta que puede venir
    // sin zona. parseBackendIsoToDate devuelve una Date válida o null.
    const parsed = d.fechaHora ? parseBackendIsoToDate(d.fechaHora) : null;

    const dateStr = parsed
      ? formatDateLocalYYYYMMDD(parsed)
      : new Date().toISOString().split("T")[0];

    // Formateamos la hora a AM/PM a partir de la Date parseada (si existe).
    const timeStr = parsed ? formatTimeAmPm(d.fechaHora) : "--:--";

    // Historia mínima: un único paso con el estado actual
    const history: OrderHistoryStep[] = [
      {
        status: (d.estado as any) || ("Solicitado" as any),
        label: d.estado || "Solicitado",
        timeStr: timeStr || "",
        duration: 0,
      },
    ];

    return {
      id: `DET-${d.id}`,
      tableId: `Mesa ${d.mesaId}`,
      items: [{ name: d.producto, category: "Alimento" }],
      waiter: d.empleado || "",
      totalTime: "",
      status: d.estado as any,
      timeInStatus: "",
      isLate: false,
      date: dateStr,
      time: timeStr || "",
      price: 0,
      modifiers: [],
      history,
      guestName: d.empleado || "",
    } as Order;
  });
};
