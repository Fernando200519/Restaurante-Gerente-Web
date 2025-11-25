// src/components/orders/OrdersTable.tsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"; // Iconos para paginación y detalle
import { Order, OrderStatus } from "../../types/order";
import { INITIAL_ORDERS } from "../../api/orderApi";
import { OrderDetailsModal } from "./OrdersDetailModal";

interface OrdersTableProps {
  orders: Order[];
}

const ROWS_PER_PAGE = 10;

// Estilos de badges más refinados
const getStatusStyle = (status: OrderStatus) => {
  const base = "px-3 py-1 rounded-full text-[14px] font-semibold border";
  switch (status) {
    case "Listo":
      return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
    case "En Preparación":
      return `${base} bg-amber-50 text-amber-700 border-amber-200`;
    case "Entregado":
      return `${base} bg-slate-50 text-slate-600 border-slate-200`;
    case "Solicitado":
      return `${base} bg-blue-50 text-blue-700 border-blue-200`;
    case "Cancelada":
      return `${base} bg-red-50 text-red-700 border-red-200`;
    default:
      return base;
  }
};

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(orders.length / ROWS_PER_PAGE);
  const start = (page - 1) * ROWS_PER_PAGE;
  const paginatedOrders = orders.slice(start, start + ROWS_PER_PAGE);
  // Dentro de OrdersTable...
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Función para cerrar
  const closeDetail = () => setSelectedOrder(null);

  if (!orders.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <Eye className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-semibold text-lg mb-1">
          No se encontraron órdenes
        </h3>
        <p className="text-gray-500 text-sm">
          Intenta ajustar los filtros o la fecha de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          {/* HEADER: Estilo SaaS (uppercase, tracking) */}
          <thead className="bg-gray-50 text-base text-gray-500 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Hora</th>
              <th className="px-6 py-4">Mesa</th>
              <th className="px-6 py-4">Ítem</th>
              <th className="px-6 py-4">Mesero</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Tiempo Estado</th>
              <th className="px-6 py-4 text-center">Acción</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-blue-50/30 transition-colors duration-150 group"
              >
                {/* FECHA */}
                <td className="px-6 py-4 text-gray-500 text-base">
                  {order.date}
                </td>

                {/* HORA */}
                <td className="px-6 py-4 text-gray-500 text-[14px]">
                  {order.time ? order.time : "—"}
                </td>

                {/* MESA */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded text-[14px]">
                    {order.tableId}
                  </span>
                </td>

                {/* ÍTEM(S) */}
                <td className="px-6 py-4 text-gray-900 font-medium text-base">
                  {order.items.map((item, i) => (
                    <div key={i}>{item.name}</div>
                  ))}
                </td>

                {/* MESERO */}
                <td className="px-6 py-4 text-gray-600 text-base">
                  {order.waiter}
                </td>

                {/* ESTADO */}
                <td className="px-6 py-4 text-center">
                  <span className={getStatusStyle(order.status)}>
                    {order.status}
                  </span>
                </td>

                {/* TIEMPO EN ESTADO */}
                <td className="px-6 py-4 text-right">
                  {order.status === "Entregado" ||
                  order.status === "Cancelada" ? (
                    <span className="text-gray-700 text-xl font-medium block -mt-1">
                      -
                    </span>
                  ) : (
                    <div className="flex items-center justify-end gap-1 font-medium text-gray-700 text-base">
                      {order.timeInStatus}
                      {order.isLate && (
                        <span
                          className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"
                          title="Tiempo excedido"
                        />
                      )}
                    </div>
                  )}
                </td>

                {/* ACCIÓN (Botón mejorado) */}
                <td className="px-6 py-4 text-center">
                  <button
                    className="text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-all cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <span className="text-[14px] font-medium mr-1">
                      Ver detalles
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN INTEGRADA (Footer de la tabla) */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
        <p className="text-base text-gray-600">
          Mostrando <span className="font-bold text-gray-900">{start + 1}</span>{" "}
          a{" "}
          <span className="font-bold text-gray-900">
            {Math.min(start + ROWS_PER_PAGE, orders.length)}
          </span>{" "}
          de{" "}
          <span className="font-bold text-gray-900">
            {INITIAL_ORDERS.length}
          </span>{" "}
          resultados
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`p-2 rounded-lg border transition-all ${
              page === 1
                ? "bg-white text-gray-300 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:shadow-sm cursor-pointer"
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={`p-2 rounded-lg border transition-all ${
              page === totalPages
                ? "bg-white text-gray-300 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:shadow-sm cursor-pointer"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={closeDetail}
        order={selectedOrder}
      />
    </div>
  );
};
