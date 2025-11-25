// src/types/order.ts

export type OrderStatus =
  | "Solicitado"
  | "En Preparación"
  | "Listo"
  | "Entregado"
  | "Cancelada";

export interface OrderItem {
  name: string;
  category: "Alimento" | "Bebida" | "Auto";
}

// Estructura para cada paso del historial
export interface OrderHistoryStep {
  status: OrderStatus;
  label: string;
  timeStr: string;
  duration: number; // en minutos
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  waiter: string;
  totalTime: string;
  status: OrderStatus;
  timeInStatus: string;
  isLate?: boolean;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM

  // 🔥 NUEVOS CAMPOS
  price: number;
  modifiers: string[];
  history: OrderHistoryStep[];
  guestName: string; // 🔥 El comensal
}
