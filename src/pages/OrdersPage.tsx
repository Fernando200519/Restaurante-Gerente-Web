// src/components/orders/OrdersPage.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Calendar } from "lucide-react";
// 1. CORRECCIÓN DE RUTA: Cambiamos '../components/orders/StatsHeader' a './StatsHeader'
import { StatsHeader } from "../components/orders/StatsHeader";
// 2. CORRECCIÓN DE RUTA: Cambiamos '../components/orders/OrdersTable' a './OrdersTable'
import { OrdersTable } from "../components/orders/OrdersTable";
// Asumo que 'types/order' está un nivel arriba (en 'src/types/order')
import { OrderStatus, Order } from "../types/order";
// Asumo que 'api/detailsApi' está un nivel arriba (en 'src/api/detailsApi')
import { getDetails, mapDetailsToOrders } from "../api/detailsApi";

const OrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(50);

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

  // Cargar detalles desde la API
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Asegúrate de que los tipos de page y pageSize coincidan con lo que getDetails espera
        const details = await getDetails(page, pageSize);
        const mapped = mapDetailsToOrders(details);
        if (mounted) setOrders(mapped);
      } catch (error) {
        console.error("Error cargando detalles:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [page, pageSize]);

  // 🔥 STATS filtradas por día seleccionado
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    orders.forEach((o) => {
      if (o.date === selectedDate) {
        counts[o.status] = (counts[o.status] || 0) + 1;
      }
    });

    return counts;
  }, [selectedDate, orders]);

  // 🔥 FILTRO + ORDENAMIENTO por fecha y hora (más reciente → más antigua)
  const filteredOrders = useMemo(() => {
    return (
      orders
        .filter((o) => {
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
  }, [orders, searchQuery, selectedStatus, selectedDate]);

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
        <div className="mb-6 flex gap-4 flex-wrap">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ID, mesa, mesero o ítem..."
              className="w-full pl-12 pr-10 py-4 bg-white rounded-xl shadow-sm text-base outline-none focus:ring-2 focus:ring-[#2563EB] border border-gray-200 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Selector de Fecha • Mejorado */}
          <div
            className="relative cursor-pointer w-full sm:w-[200px]"
            onClick={handleDateClick} // Abre el calendario tocando cualquier parte
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>

            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              // Esto evita que se pueda seleccionar una fecha futura
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                const value = e.target.value;

                // Evitar fechas futuras (doble chequeo)
                const today = new Date().toISOString().split("T")[0];
                if (value > today) return;

                setSelectedDate(value);
              }}
              className="
          w-full pl-12 pr-4 py-4 
          bg-white rounded-xl shadow-sm
          text-base text-gray-700
          outline-none
          focus:ring-2 focus:ring-[#2563EB]
          transition-all cursor-pointer border border-gray-200
        "
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 p-10">
            Cargando órdenes...
          </div>
        ) : (
          <OrdersTable orders={filteredOrders} />
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
