export interface Zona {
  id: number;
  nombre: string;
  estado?: string;
}

export type PlatilloEstado =
  | "Solicitado"
  | "EN_PREPARACION"
  | "LISTO"
  | "SERVIR"
  | "CANCELADO";

export interface OrderDetail {
  id: number;
  producto: string;
  estado: PlatilloEstado;
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
}

export interface OrderBasicInfo {
  id: number;
  montoTotal?: number;
  totalAlertas?: number;
  startedAt?: string;
  total?: number;
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
  zonaId: number | null;
  zona?: string;
  updatedAt?: string;
  orden?: OrderBasicInfo | null;
}
