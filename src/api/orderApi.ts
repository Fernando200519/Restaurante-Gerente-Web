// src/api/orderApi.ts
import { Order, OrderStatus, OrderHistoryStep } from "../types/order";

const getDateStr = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split("T")[0];
};

const randomDate = (i: number) => {
  const offset = i % 3;
  return getDateStr(offset);
};

// 🔥 Función auxiliar para generar el historial
const generateHistory = (
  targetStatus: OrderStatus,
  startTimeStr: string
): OrderHistoryStep[] => {
  const stepsFlow = [
    { status: "Solicitado", duration: 5, label: "Orden recibida" },
    { status: "En Preparación", duration: 12, label: "Cocinando" },
    { status: "Listo", duration: 4, label: "Esperando mesero" },
    { status: "Entregado", duration: 0, label: "En mesa" },
  ];

  let steps: any[] = [];

  if (targetStatus === "Cancelada") {
    steps = [
      stepsFlow[0],
      { status: "Cancelada", duration: 0, label: "Orden Cancelada" },
    ];
  } else {
    const index = stepsFlow.findIndex((s) => s.status === targetStatus);
    steps = index >= 0 ? stepsFlow.slice(0, index + 1) : [stepsFlow[0]];
  }

  const [startHour, startMin] = startTimeStr.split(":").map(Number);
  let currentMinutes = startHour * 60 + startMin;

  return steps.map((step) => {
    const h = Math.floor(currentMinutes / 60) % 24;
    const m = currentMinutes % 60;
    const ampm = h >= 12 ? "p.m." : "a.m.";
    const h12 = h % 12 || 12;
    const timeStr = `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;

    currentMinutes += step.duration;

    return {
      status: step.status as OrderStatus,
      label: step.label,
      duration: step.duration,
      timeStr: timeStr,
    };
  });
};

export const INITIAL_ORDERS: Order[] = [
  // --- Órdenes manuales ---
  {
    id: "ORD-001",
    tableId: "Mesa 2",
    items: [{ name: "Hamburguesa Clásica", category: "Alimento" }],
    waiter: "Ana García",
    totalTime: "19 min",
    status: "Listo",
    timeInStatus: "7 min",
    isLate: false,
    date: getDateStr(0),
    time: "14:30",
    price: 185.5,
    modifiers: ["Sin cebolla", "Término medio"],
    history: generateHistory("Listo", "14:30"),
    guestName: "Juan Pérez", // 🔥 Nuevo
  },
  {
    id: "ORD-002",
    tableId: "Mesa 2",
    items: [{ name: "Cerveza Corona", category: "Bebida" }],
    waiter: "Ana García",
    totalTime: "19 min",
    status: "Entregado",
    timeInStatus: "16 min",
    date: getDateStr(0),
    time: "14:35",
    price: 45.0,
    modifiers: [],
    history: generateHistory("Entregado", "14:35"),
    guestName: "Juan Pérez",
  },
  {
    id: "ORD-003",
    tableId: "Mesa 3",
    items: [{ name: "Ensalada César", category: "Alimento" }],
    waiter: "Carlos López",
    totalTime: "13 min",
    status: "Listo",
    timeInStatus: "6 min",
    isLate: false,
    date: getDateStr(1),
    time: "13:15",
    price: 120.0,
    modifiers: ["Aderezo aparte"],
    history: generateHistory("Listo", "13:15"),
    guestName: "Luisa Lane",
  },
  {
    id: "ORD-004",
    tableId: "Mesa 8",
    items: [{ name: "Tacos al Pastor", category: "Alimento" }],
    waiter: "María Rodríguez",
    totalTime: "9 min",
    status: "En Preparación",
    timeInStatus: "7 min",
    date: getDateStr(2),
    time: "20:10",
    price: 95.0,
    modifiers: ["Con todo"],
    history: generateHistory("En Preparación", "20:10"),
    guestName: "Pedro Picapiedra",
  },
  {
    id: "ORD-005",
    tableId: "Mesa 8",
    items: [{ name: "Margarita", category: "Bebida" }],
    waiter: "María Rodríguez",
    totalTime: "9 min",
    status: "En Preparación",
    timeInStatus: "6 min",
    date: getDateStr(1),
    time: "20:15",
    price: 110.0,
    modifiers: ["Escarchada con sal"],
    history: generateHistory("En Preparación", "20:15"),
    guestName: "Vilma Picapiedra",
  },

  // --- Generación automática ---
  ...Array.from({ length: 45 }).map((_, i) => {
    const num = i + 16;
    const mesas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
    const items = [
      "Café",
      "Jugo",
      "Sopa",
      "Panini",
      "Agua Mineral",
      "Té",
      "Crepas",
    ];
    const waiters = [
      "Ana García",
      "Carlos López",
      "María Rodríguez",
      "Pedro Santos",
      "Laura Martínez",
    ];
    const statuses: OrderStatus[] = [
      "Solicitado",
      "En Preparación",
      "Listo",
      "Entregado",
      "Cancelada",
    ];
    const guests = [
      "Comensal 1",
      "Fernando ",
      "Comensal 2",
      "Alejandra",
      "Comensal 3",
    ];

    const hour = Math.floor(Math.random() * 11) + 12;
    const min = Math.floor(Math.random() * 60);
    const timeStr = `${hour}:${min.toString().padStart(2, "0")}`;
    const category = Math.random() < 0.5 ? "Alimento" : "Bebida";
    const status = statuses[i % statuses.length];
    const possibleMods = [
      "Sin hielo",
      "Poco dulce",
      "Extra caliente",
      "Para llevar",
    ];
    const hasMods = Math.random() > 0.7;
    const mods = hasMods ? [possibleMods[i % possibleMods.length]] : [];

    return {
      id: `ORD-${String(num).padStart(3, "0")}`,
      tableId: `Mesa ${mesas[i % mesas.length]}`,
      items: [{ name: items[i % items.length], category: category as any }],
      waiter: waiters[i % waiters.length],
      totalTime: `${5 + (i % 40)} min`,
      status: status,
      timeInStatus: `${1 + (i % 20)} min`,
      isLate: false,
      date: randomDate(i),
      time: timeStr,
      price: 45 + Math.floor(Math.random() * 150),
      modifiers: mods,
      history: generateHistory(status, timeStr),
      guestName: guests[i % guests.length], // 🔥 Nuevo
    };
  }),
];
