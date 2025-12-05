// src/types/mesa.ts

export interface Zona {
  id: number;
  nombre: string;
  estado?: string;
}

// En src/types/mesa.ts

export type PlatilloEstado =
  | "Solicitado"
  | "EN_PREPARACION"
  | "LISTO"
  | "SERVIR"
  | "CANCELADO";

// También necesitarás las interfaces para OrderDetail y Order:

export interface OrderDetail {
  id: number;
  producto: string;
  estado: PlatilloEstado; // Usa el tipo exportado
  fechaHoraInicioEstado: string;
  comensal: string;
  total: number;
}

export interface Order {
  id: number;
  mesaId: number;
  estadoMesa: string;
  mesero: string;
  fechaHora: string;
  totalComensales: number;
  detallesOrden: OrderDetail[];
  // totalAlertas: number; (Este lo estás calculando en el frontend/adaptMesa)
  // montoTotal: number; (Este lo calcularás sumando detallesOrden)
}

export interface OrderBasicInfo {
  id: number;
  // Las propiedades que usas para el KPI en MesaCard:
  montoTotal?: number; // El total de la cuenta activa
  totalAlertas?: number; // Total de alertas activas
  startedAt?: string; // Fecha de inicio de la orden
  total?: number; // Propiedad total (si la usas, aunque montoTotal sea más específico)
  // Agrega cualquier otra propiedad que uses directamente desde mesa.orden
}

export interface Mesa {
  id: number;
  nombre: string;
  estado:
    | "LIBRE"
    | "OCUPADA"
    | "ESPERANDO"
    | "AGRUPADA"
    | "INACTIVA"
    | "ACTIVA"
    | "DESACTIVADA";
  capacidad: number;

  zonaId: number | null;

  zona?: string;

  updatedAt?: string;

  // ************ CORRECCIÓN CLAVE ************
  // Añade la propiedad 'orden' a la interfaz Mesa:
  orden?: OrderBasicInfo | null; // Usamos la interfaz OrderBasicInfo o Order completa.
  // ******************************************
}
