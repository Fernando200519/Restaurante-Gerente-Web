// src/api/mesasApi.ts
import { Orden, Platillo, Mesa, Comensal } from "../types/mesa";

const now = new Date().toISOString();

const makePlatillo = (
  id: number,
  nombre: string,
  estado: Platillo["estado"]
): Platillo => ({
  id,
  nombre,
  estado,
  tiempoRegistrado: new Date().toISOString(),
});

const comensalExample = (id: number): Comensal => ({
  id,
  nombre: `Comensal ${id}`,
  platillos: [
    {
      id: id * 10 + 1,
      nombre: "Taco al pastor",
      estado: "EN_PREPARACION",
      tiempoRegistrado: now,
    } as Platillo,
    {
      id: id * 10 + 2,
      nombre: "Agua fresca",
      estado: "LISTO",
      tiempoRegistrado: now,
    } as Platillo,
  ],
  montoTotal: 120.5,
});

const ordenExample = (id: number): Orden => ({
  id,
  mesero: "Juan Pérez",
  comensales: [comensalExample(1), comensalExample(2)],
  montoTotal: 241.0,
  startedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
});

let MOCK_MESAS: Mesa[] = [
  { id: 1, nombre: "Mesa 1", capacidad: 2, estado: "LIBRE", updatedAt: now },
  {
    id: 2,
    nombre: "Mesa 2",
    capacidad: 2,
    estado: "OCUPADA",
    mesero: "Luisa",
    orden: ordenExample(101),
    updatedAt: now,
  },
  {
    id: 3,
    nombre: "Mesa 3",
    capacidad: 4,
    estado: "OCUPADA",
    mesero: "Marcos",
    orden: ordenExample(102),
    updatedAt: now,
  },
  {
    id: 4,
    nombre: "Mesa 4",
    capacidad: 8,
    estado: "AGRUPADA",
    grupo: "1",
    principal: true,
    orden: ordenExample(103),
    updatedAt: now,
  },
  {
    id: 5,
    nombre: "Mesa 5",
    capacidad: 4,
    estado: "AGRUPADA",
    grupo: "1",
    orden: ordenExample(103),
    updatedAt: now,
  },
  { id: 6, nombre: "Mesa 6", capacidad: 2, estado: "LIBRE", updatedAt: now },
  { id: 7, nombre: "Mesa 7", capacidad: 2, estado: "LIBRE", updatedAt: now },
  {
    id: 8,
    nombre: "Mesa 8",
    capacidad: 4,
    estado: "OCUPADA",
    orden: ordenExample(104),
    updatedAt: now,
  },
  {
    id: 9,
    nombre: "Mesa 9",
    capacidad: 6,
    estado: "ESPERANDO",
    orden: ordenExample(105),
    updatedAt: now,
  },
  { id: 10, nombre: "Mesa 10", capacidad: 4, estado: "LIBRE", updatedAt: now },
  { id: 11, nombre: "Mesa 11", capacidad: 6, estado: "LIBRE", updatedAt: now },
  {
    id: 12,
    nombre: "Mesa 12",
    capacidad: 2,
    estado: "OCUPADA",
    updatedAt: now,
  },
];

export const getMesas = async (): Promise<Mesa[]> => {
  await wait(300);
  return structuredClone(MOCK_MESAS);
};

export const addMesa = async (capacidad: number): Promise<Mesa> => {
  await wait(200);
  const id = Math.max(...MOCK_MESAS.map((m) => m.id)) + 1;
  const nueva: Mesa = {
    id,
    nombre: `Mesa ${id}`,
    capacidad,
    estado: "LIBRE",
    updatedAt: new Date().toISOString(),
  };
  MOCK_MESAS = [nueva, ...MOCK_MESAS];
  return structuredClone(nueva);
};

export const editMesa = async (
  id: number,
  capacidad: number
): Promise<Mesa | null> => {
  await wait(200);
  MOCK_MESAS = MOCK_MESAS.map((m) =>
    m.id === id ? { ...m, capacidad, updatedAt: new Date().toISOString() } : m
  );
  return structuredClone(MOCK_MESAS.find((m) => m.id === id) || null);
};

export const deleteMesas = async (ids: number[]): Promise<void> => {
  await wait(200);
  MOCK_MESAS = MOCK_MESAS.filter((m) => !ids.includes(m.id));
};

export const getMesaConOrdenes = async (id: number): Promise<Mesa | null> => {
  await wait(200);
  return structuredClone(MOCK_MESAS.find((m) => m.id === id) || null);
};

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
