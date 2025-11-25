// src/api/mesasApi.ts
import {
  Orden,
  Platillo,
  Mesa,
  Comensal,
  HistorialEstado,
} from "../types/mesa";

const now = new Date().toISOString();

// Helper para restar minutos (para simular tiempos pasados)
const subMinutes = (min: number) =>
  new Date(Date.now() - 1000 * 60 * min).toISOString();

// --- GENERADORES DE DATOS FALSOS ---

const makeHistorial = (estadoActual: string): HistorialEstado[] => {
  const logs: HistorialEstado[] = [
    { estado: "TOMADO", timestamp: subMinutes(45), responsable: "Mesero Juan" },
  ];
  if (estadoActual !== "TOMADO") {
    logs.push({
      estado: "EN_PREPARACION",
      timestamp: subMinutes(30),
      responsable: "Cocina",
    });
  }
  if (estadoActual === "LISTO" || estadoActual === "ENTREGADO") {
    logs.push({
      estado: "LISTO",
      timestamp: subMinutes(10),
      responsable: "Chef Mario",
    });
  }
  return logs;
};

const makePlatillo = (
  id: number,
  nombre: string,
  precio: number,
  estado: Platillo["estado"],
  estacion: "Cocina" | "Bar",
  atrasado: boolean = false
): Platillo => ({
  id,
  nombre,
  precio,
  estado,
  estacion,
  notas: atrasado ? "Sin cebolla (URGENTE)" : "Sin cebolla",
  tiempoRegistrado: subMinutes(atrasado ? 50 : 15), // Si está atrasado, fue hace mucho
  requiereAtencion: atrasado,
  historial: makeHistorial(estado),
});

const comensalExample = (id: number, hasAlert: boolean = false): Comensal => {
  const platillos = [
    makePlatillo(
      id * 10 + 1,
      "Tacos al Pastor",
      120,
      hasAlert ? "RETRASADO" : "EN_PREPARACION",
      "Cocina",
      hasAlert
    ),
    makePlatillo(id * 10 + 2, "Cerveza Modelo", 60, "ENTREGADO", "Bar"),
  ];

  // Calcular total del comensal
  const total = platillos.reduce((acc, p) => acc + p.precio, 0);

  return {
    id,
    nombre: `Comensal ${id}`,
    platillos,
    montoTotal: total,
  };
};

const ordenExample = (
  id: number,
  mesero: string,
  hasAlert: boolean = false,
  bigCheck: boolean = false
): Orden => {
  const c1 = comensalExample(1, hasAlert);
  const c2 = bigCheck
    ? {
        ...comensalExample(2),
        platillos: [
          ...comensalExample(2).platillos,
          makePlatillo(99, "Botella Champagne", 1500, "ENTREGADO", "Bar"),
        ],
      }
    : comensalExample(2);

  // Recalcular montos del comensal 2 si es bigCheck
  c2.montoTotal = c2.platillos.reduce((acc, p) => acc + p.precio, 0);

  const comensales = [c1, c2];

  // Cálculos globales de la orden
  const montoTotal = comensales.reduce(
    (acc, c) => acc + (c.montoTotal || 0),
    0
  );

  // Contar alertas totales buscando en todos los platillos
  const totalAlertas = comensales
    .flatMap((c) => c.platillos)
    .filter((p) => p.requiereAtencion).length;

  return {
    id,
    mesero,
    comensales,
    montoTotal,
    totalAlertas,
    startedAt: subMinutes(hasAlert ? 60 : 25), // Si tiene alerta, lleva más tiempo abierta
  };
};

// --- ORDEN PERSONALIZADA MESA 2 (MUCHOS ITEMS) ---
const ordenMesa2: Orden = {
  id: 200,
  mesero: "Luisa",
  startedAt: subMinutes(64),
  totalAlertas: 1,
  montoTotal: 0, // Se calcula abajo
  comensales: [
    {
      id: 1,
      nombre: "Comensal 1",
      platillos: [
        makePlatillo(201, "Tacos al Pastor", 120, "RETRASADO", "Cocina", true),
        makePlatillo(202, "Cerveza Victoria", 45, "ENTREGADO", "Bar"),
      ],
    },
    {
      id: 2,
      nombre: "Comensal 2",
      platillos: [
        makePlatillo(203, "Guacamole c/ Totopos", 95, "LISTO", "Cocina"),
        makePlatillo(204, "Limonada Mineral", 35, "ENTREGADO", "Bar"),
      ],
    },
    {
      id: 3,
      nombre: "Comensal 3",
      platillos: [
        makePlatillo(205, "Arrachera 300g", 280, "EN_PREPARACION", "Cocina"),
        makePlatillo(206, "Copa Vino Tinto", 110, "ENTREGADO", "Bar"),
      ],
    },
    {
      id: 4,
      nombre: "Comensal 4",
      platillos: [
        makePlatillo(207, "Pastel de Chocolate", 85, "TOMADO", "Cocina"),
        makePlatillo(208, "Café Americano", 40, "TOMADO", "Bar"),
      ],
    },
  ],
};
// Calculamos el total de la Mesa 2 automáticamente
ordenMesa2.montoTotal = ordenMesa2.comensales.reduce(
  (acc, c) => acc + c.platillos.reduce((pAcc, p) => pAcc + p.precio, 0),
  0
);

// --- BASE DE DATOS MOCK ---

let MOCK_MESAS: Mesa[] = [
  {
    id: 1,
    nombre: "Mesa 1",
    capacidad: 2,
    zona: "Salón Principal",
    estado: "LIBRE",
    updatedAt: now,
  },
  {
    id: 2,
    nombre: "Mesa 2",
    capacidad: 4,
    zona: "Terraza",
    estado: "OCUPADA",
    meseroActual: "Luisa",
    // USAMOS LA ORDEN GRANDE AQUÍ 👇
    orden: ordenMesa2,
    updatedAt: now,
  },
  {
    id: 3,
    nombre: "Mesa 3",
    capacidad: 4,
    zona: "Patio",
    estado: "OCUPADA",
    meseroActual: "Marcos",
    orden: ordenExample(102, "Marcos"),
    updatedAt: now,
  },
  {
    id: 4,
    nombre: "Mesa 4",
    capacidad: 8,
    zona: "Salón Principal",
    estado: "AGRUPADA",
    grupo: "1",
    principal: true,
    orden: ordenExample(103, "Ana"),
    updatedAt: now,
  },
  {
    id: 5,
    nombre: "Mesa 5",
    capacidad: 4,
    zona: "Salón Principal",
    estado: "AGRUPADA",
    grupo: "1",
    // La mesa secundaria comparte la orden de la principal visualmente o es null
    orden: null,
    updatedAt: now,
  },
  {
    id: 8,
    nombre: "Mesa 8",
    capacidad: 6,
    zona: "Patio",
    estado: "OCUPADA",
    meseroActual: "Pedro",
    // MESA VIP (Cuenta Grande)
    orden: ordenExample(104, "Pedro", false, true),
    updatedAt: now,
  },
  {
    id: 9,
    nombre: "Mesa 9",
    capacidad: 2,
    zona: "Patio",
    estado: "ESPERANDO",
    orden: ordenExample(105, "Sofia"),
    updatedAt: now,
  },
  // Rellenar el resto
  ...[6, 7, 10, 11, 12].map((id) => ({
    id,
    nombre: `Mesa ${id}`,
    capacidad: id % 2 === 0 ? 4 : 2,
    zona: id > 10 ? "Barra" : "Terraza",
    estado: "LIBRE" as const,
    updatedAt: now,
  })),
];

// --- FUNCIONES API ---

export const getMesas = async (): Promise<Mesa[]> => {
  await wait(300);
  return structuredClone(MOCK_MESAS);
};

export const addMesa = async (data: {
  nombre: string;
  capacidad: number;
  zona: string;
}): Promise<Mesa> => {
  await wait(200);

  const id = Math.max(...MOCK_MESAS.map((m) => m.id), 0) + 1;

  const nueva: Mesa = {
    id,
    nombre: data.nombre,
    capacidad: data.capacidad,
    zona: data.zona,
    estado: "LIBRE",
    updatedAt: new Date().toISOString(),
  };

  MOCK_MESAS = [...MOCK_MESAS, nueva];
  return structuredClone(nueva);
};

export const editMesa = async (
  id: number,
  capacidad: number,
  zona: string,
  nombre?: string // Agregué nombre opcional por si el modal lo envía
): Promise<Mesa | null> => {
  await wait(200);

  MOCK_MESAS = MOCK_MESAS.map((m) =>
    m.id === id
      ? {
          ...m,
          capacidad,
          zona,
          nombre: nombre ?? m.nombre,
          updatedAt: new Date().toISOString(),
        }
      : m
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

// Helpers internos
function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
