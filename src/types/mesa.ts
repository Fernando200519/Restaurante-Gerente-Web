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
  total?: number;
  montoTotal: number;
  totalAlertas: number;
  startedAt?: string;
  platillos: any[];
}

export interface Mesa {
  id: number;
  nombre: string;
  zonaId: number | null;
  zona: string;
  estado:
    | "LIBRE"
    | "OCUPADA"
    | "ESPERANDO"
    | "ESPERANDO_PAGO"
    | "AGRUPADA"
    | "INACTIVA"
    | "DESACTIVADA";
  updatedAt?: string;
  orden: OrderBasicInfo | null;
  grupo: number;
  principal: string;
}
