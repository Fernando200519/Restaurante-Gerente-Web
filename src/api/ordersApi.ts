import { apiClient } from "./config";
import { Order, OrderStatus } from "../types/order";
import {
  parseBackendIsoToDate,
  formatTimeAmPm,
  formatDateLocalYYYYMMDD,
} from "../utils/time";

export interface OrderItemBackend {
  id: number;
  producto: string;
  estado: string;
  fechaHora: string;
  empleado: string;
  fechaHoraInicioEstado: string;
  mesaId: number;
  fotoPerfilMesero?: string | null;
}

export interface OrderBackend {
  id: number;
  mesaId?: number;
  mesasIds?: number[];
  estadoMesa: string;
  mesero?: string;
  fechaHora?: string | null;
  totalComensales: number;
  detallesOrden?: Array<{
    id: number;
    producto: string;
    estado: string;
    total: number;
    comensal: string;
    fechaHoraInicioEstado: string;
  }>;
}

// 🆕 Nueva interfaz para los metadatos del backend
export interface OrdersResponse {
  total: number;
  totalSolicitado: number;
  totalPreparacion: number;
  totalListoEntrega: number;
  totalEntregado: number;
  totalCancelado: number;
  detallesOrden: OrderItemBackend[];
}

const STATUS_MAP: Record<string, OrderStatus> = {
  Solicitado: "Solicitado",
  "En preparación": "En Preparación",
  "Listo para entregar": "Listo",
  Entregado: "Entregado",
  Cancelado: "Cancelada",
};

const toBackendStatus = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    Solicitado: "Solicitado",
    "En Preparación": "EnPreparacion",
    Listo: "ListoParaEntregar",
    Entregado: "Entregado",
    Cancelada: "Cancelado",
  };
  return map[status];
};

export const getOrders = async (
  page = 1,
  pageSize = 50,
  date?: string,
  status?: OrderStatus
): Promise<{
  orders: Order[];
  stats: Record<string, number>;
  totalItems: number;
}> => {
  let url = `/orders/details?page=${page}&pageSize=${pageSize}&sortBy=id&sortOrder=desc`;

  if (date) url += `&date=${date}`;
  if (status) url += `&status=${toBackendStatus(status)}`;

  try {
    const { data } = await apiClient.get<OrdersResponse>(url);

    const mappedOrders = data.detallesOrden.map((item) => {
      const literalDate = item.fechaHora.split("T")[0];

      return {
        id: item.id?.toString() || Math.random().toString(),
        tableId: item.mesaId?.toString() || "N/A",
        waiter: item.empleado || "Sin asignar",
        waiterPhoto: item.fotoPerfilMesero,
        status: (STATUS_MAP[item.estado] || "Solicitado") as OrderStatus,
        date: literalDate,
        time: formatTimeAmPm(item.fechaHora),
        items: [
          {
            id: item.id,
            name: item.producto || "Producto",
            category: "Auto" as const,
            status: item.estado,
            price: 0,
            comensal: "General",
            fechaHoraInicioEstado: item.fechaHoraInicioEstado || item.fechaHora,
          },
        ],
        price: 0,
        totalComensales: 1,
        guestName: `Ticket #${item.id}`,
        modifiers: [],
        history: [],
        timeInStatus: calculateTimeInStatus(item.fechaHoraInicioEstado),
        totalTime: "0 min",
      };
    });

    const stats = {
      Solicitado: data.totalSolicitado,
      "En Preparación": data.totalPreparacion,
      Listo: data.totalListoEntrega,
      Entregado: data.totalEntregado,
      Cancelada: data.totalCancelado,
    };

    return { orders: mappedOrders, stats, totalItems: data.total };
  } catch (error) {
    console.error("❌ Error en getOrders:", error);
    return {
      orders: [],
      stats: {
        Solicitado: 0,
        "En Preparación": 0,
        Listo: 0,
        Entregado: 0,
        Cancelada: 0,
      },
      totalItems: 0,
    };
  }
};

export const getOrderDetailById = async (id: string): Promise<any> => {
  try {
    const { data } = await apiClient.get(`/orders/details/${id}`);
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("❌ Error al obtener detalle extendido:", error);
    return null;
  }
};

export const getOrderById = async (id: number): Promise<Order | null> => {
  try {
    const { data } = await apiClient.get<OrderBackend>(`/orders/${id}`);

    const dateObj = parseBackendIsoToDate(data.fechaHora ?? "") ?? new Date();

    return {
      id: data.id.toString(),
      tableId: data.mesaId?.toString() || "1",
      waiter: data.mesero || "Sin asignar",
      status: (STATUS_MAP[data.estadoMesa] || "Solicitado") as OrderStatus,
      date: dateObj.toLocaleDateString(),
      time: formatTimeAmPm(data.fechaHora ?? ""),

      totalComensales: data.totalComensales,

      guestName: `Orden #${data.id}`,
      items: (data.detallesOrden || []).map((d) => ({
        id: d.id,
        name: d.producto,
        category: "Auto",
        status: d.estado,
        price: d.total,
        comensal: d.comensal,
        fechaHoraInicioEstado: d.fechaHoraInicioEstado,
      })),

      price: (data.detallesOrden || []).reduce(
        (acc, curr) => acc + curr.total,
        0
      ),
      modifiers: [],
      history: [],
      timeInStatus: "0 min",
      totalTime: "0 min",
    };
  } catch (error) {
    console.error("Error al obtener orden por ID:", error);
    return null;
  }
};

const calculateTimeInStatus = (startTime: string) => {
  if (!startTime) return "0 min";

  // ✅ 1. Normalizamos el string: Si no tiene 'Z', se la agregamos para que JS sepa que es UTC
  const normalizedStart = startTime.endsWith("Z") ? startTime : `${startTime}Z`;

  const start = new Date(normalizedStart).getTime();
  const now = new Date().getTime();

  // ✅ 2. Calculamos la diferencia
  const diffMs = now - start;
  const diffMins = Math.floor(diffMs / (1000 * 60));

  // ✅ 3. Control de errores: Si por desfase de segundos sale negativo, mostrar 0 o 1
  if (diffMins < 0) {
    // Si la diferencia es muy pequeña (pocos minutos), es solo un delay de sincronización
    return "1 min";
  }

  return `${diffMins} min`;
};
