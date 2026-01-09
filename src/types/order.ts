export type OrderStatus =
  | "Solicitado"
  | "En Preparación"
  | "Listo"
  | "Entregado"
  | "Cancelada";

export interface OrderItem {
  id: number;
  name: string;
  category: "Alimento" | "Bebida" | "Auto";
  status: string;
  price: number;
  comensal?: string;
  fechaHoraInicioEstado?: string;
}

export interface OrderHistoryStep {
  status: OrderStatus;
  label: string;
  timeStr: string;
  duration: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  waiter: string;
  waiterPhoto?: string | null;
  totalTime: string;
  status: OrderStatus;
  timeInStatus: string;
  isLate?: boolean;
  date: string;
  time: string;
  price: number;
  totalComensales: number;
  modifiers: string[];
  history: OrderHistoryStep[];
  guestName: string;
}
