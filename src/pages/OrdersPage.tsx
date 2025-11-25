// src/components/orders/OrdersPage.tsx
import React, { useState, useMemo, useRef } from "react";
import { Search, X, Calendar } from "lucide-react";
import { StatsHeader } from "../components/orders/StatsHeader";
import { OrdersTable } from "../components/orders/OrdersTable";
import { INITIAL_ORDERS } from "../api/orderApi";
import { OrderStatus } from "../types/order";

const OrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Referencia para controlar el input de fecha manualmente
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Fecha LOCAL correcta
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null
  );

  // 🔥 STATS filtradas por día seleccionado
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    INITIAL_ORDERS.forEach((o) => {
      if (o.date === selectedDate) {
        counts[o.status] = (counts[o.status] || 0) + 1;
      }
    });

    return counts;
  }, [selectedDate]);

  // 🔥 FILTRO + ORDENAMIENTO por fecha y hora (más reciente → más antigua)
  const filteredOrders = useMemo(() => {
    return (
      INITIAL_ORDERS.filter((o) => {
        const q = searchQuery.toLowerCase();

        const matchesSearch =
          o.id.toLowerCase().includes(q) ||
          o.tableId.toLowerCase().includes(q) ||
          o.waiter.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q));

        const matchesStatus = selectedStatus
          ? o.status === selectedStatus
          : true;

        const matchesDate = selectedDate ? o.date === selectedDate : true;

        return matchesSearch && matchesStatus && matchesDate;
      })
        // 🔥 ORDENAMIENTO
        .sort((a, b) => {
          const da = new Date(`${a.date} ${a.time}`);
          const db = new Date(`${b.date} ${b.time}`);
          return db.getTime() - da.getTime(); // Más reciente primero
        })
    );
  }, [searchQuery, selectedStatus, selectedDate]);

  // Función para abrir el calendario
  const handleDateClick = () => {
    if (dateInputRef.current) {
      // showPicker() es el método moderno para abrir el calendario nativo
      // Usamos 'as any' por si tu versión de TypeScript es antigua
      (dateInputRef.current as any).showPicker?.();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <StatsHeader
          counts={statusCounts}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
        />

        {/* Contenedor Flex para Buscador y Fecha */}
        <div className="mb-6 flex gap-4">
          {/* Buscador */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ID, mesa, mesero o ítem..."
              className="w-full pl-12 pr-10 py-4 bg-white rounded-xl shadow-sm text-base outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Selector de Fecha (Ahora clickeable en toda el área) */}
          <div
            className="relative cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleDateClick} // 🔥 Clic en el DIV abre el calendario
          >
            <input
              ref={dateInputRef} // 🔥 Conectamos la referencia
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-full pl-6 pr-4 bg-white rounded-xl shadow-sm text-base text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            />
          </div>
        </div>

        <OrdersTable orders={filteredOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
