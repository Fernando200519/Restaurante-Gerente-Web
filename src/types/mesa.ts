// src/types/mesa.ts

export interface Zona {
  id: number;
  nombre: string;
  estado?: string;
}

export interface Platillo {
  id: number;
  nombre: string;
  precio: number;
  estado: "TOMADO" | "EN_PREPARACION" | "LISTO" | "ENTREGADO" | "RETRASADO";
  requiereAtencion?: boolean;
  tiempoRegistrado?: string;
}

export interface OrdenMesa {
  id: number;
  total: number;
  totalAlertas: number;
  platillos: Platillo[];
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

  orden?: OrdenMesa | null;
  updatedAt?: string;
}
