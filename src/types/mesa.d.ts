// src/types/Mesa.ts

export type EstadoMesa =
  | "LIBRE"
  | "OCUPADA"
  | "ESPERANDO"
  | "AGRUPADA"
  | "DESACTIVADA";

// Agregamos esto para el Timeline vertical
export interface HistorialEstado {
  estado: string; // "Solicitado", "En Preparación", "Listo"
  timestamp: string; // ISO string
  responsable?: string; // "Cocina", "Mesero Juan"
}

export interface Platillo {
  id: number;
  nombre: string;
  precio: number; // <--- NUEVO: Vital para auditoría
  notas?: string; // <--- NUEVO: "Sin cebolla"
  estacion: "Cocina" | "Bar"; // <--- NUEVO: Para filtrar o asignar
  estado:
    | "TOMADO"
    | "EN_PREPARACION"
    | "LISTO"
    | "ENTREGADO"
    | "RETRASADO"
    | "CANCELADO";

  tiempoRegistrado: string; // ISO string (Hora de solicitud)
  historial?: HistorialEstado[]; // <--- NUEVO: Para el modal de Timeline
  requiereAtencion?: boolean; // <--- NUEVO: Para pintar rojo en la UI
}

export interface Comensal {
  id: number;
  nombre: string; // "Asiento 1" o nombre real
  platillos: Platillo[];
  montoTotal?: number; // Suma de sus platillos
}

export interface Orden {
  id: number;
  mesero?: string;
  comensales: Comensal[];
  montoTotal: number; // Suma total de la mesa
  startedAt?: string; // ISO

  // Contadores rápidos para los Badges de la UI
  totalAlertas?: number; // Cantidad de platillos retrasados/atención
}

export interface Mesa {
  id: number;
  nombre: string;
  capacidad: number;
  estado: EstadoMesa;
  zona?: string;
  grupo?: string;
  principal?: boolean; // Si es parte de un grupo, ¿es la principal?

  // Datos "planos" para mostrar rápido en la tarjeta de Mesa
  meseroActual?: string;
  orden?: Orden | null;

  updatedAt?: string;
}
