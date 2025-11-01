// src/types/Mesa.ts
export type EstadoMesa = "LIBRE" | "OCUPADA" | "ESPERANDO" | "AGRUPADA";

export interface Platillo {
  id: number;
  nombre: string;
  estado: "TOMADO" | "EN_PREPARACION" | "LISTO" | "ENTREGADO" | "RETRASADO";
  tiempoRegistrado?: string; // ISO string
}

export interface Comensal {
  id: number;
  nombre: string;
  platillos: Platillo[];
  montoTotal?: number;
}

export interface Orden {
  id: number;
  mesero?: string;
  comensales: Comensal[];
  montoTotal: number;
  startedAt?: string; // ISO
}

export interface Mesa {
  id: number;
  nombre: string;
  capacidad: number;
  estado: EstadoMesa;
  grupo?: string;
  principal?: boolean;
  mesero?: string;
  orden?: Orden | null;
  updatedAt?: string; // ISO, para calcular tiempo transcurrido
}
