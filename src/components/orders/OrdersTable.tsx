import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  User,
  Hash,
  SearchX,
  ShoppingBag,
} from "lucide-react";
import { Order } from "../../types/order";

interface OrdersTableProps {
  orders: Order[];
  currentPage: number;
  onPageChange: (newPage: number) => void;
  pageSize: number;
  onViewOrder: (order: Order) => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> =
  {
    solicitado: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    enpreparacion: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      dot: "bg-orange-500",
    },
    listo: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    entregado: { bg: "bg-gray-100", text: "text-gray-900", dot: "bg-gray-500" },
    cancelada: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  };
export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  currentPage,
  onPageChange,
  pageSize,
  onViewOrder,
}) => {
  const hasNextPage = orders.length === pageSize;

  if (!orders.length && currentPage === 1) {
    return (
      <div className="bg-white rounded-[3rem] border-4 border-dashed border-gray-50 p-20 text-center flex flex-col items-center animate-in fade-in duration-500">
        <div className="bg-orange-50 p-6 rounded-full mb-6">
          <SearchX className="h-12 w-12 text-[#FF8108] opacity-40" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
          Sin historial de órdenes
        </h3>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">
          Prueba ajustando los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Registro
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Ubicación
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Comanda
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Responsable
              </th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Estado
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Tiempo
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Detalles
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => {
              const statusKey = order.status
                .toLowerCase()
                .trim()
                .replace(/\s/g, "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

              const config =
                STATUS_CONFIG[statusKey] || STATUS_CONFIG.solicitado;

              const isFinalized =
                statusKey === "entregado" || statusKey === "cancelada";

              const tooltipMessage =
                statusKey === "entregado"
                  ? "Entrega finalizada"
                  : statusKey === "cancelada"
                  ? "Pedido cancelado"
                  : "";

              const shouldPulse = [
                "solicitado",
                "enpreparacion",
                "listoparaentregar",
              ].includes(statusKey);
              return (
                <tr
                  key={order.id}
                  className="hover:bg-orange-50/30 transition-all group"
                >
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900 tabular-nums">
                        {order.date.split("-").reverse().join("/")}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock size={12} />
                        <span className="text-[11px] font-bold tabular-nums">
                          {order.time || "--:--"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-5">
                    {order.tableId && order.tableId !== "N/A" ? (
                      /* 🪑 VISTA PARA MESA: Se mantiene el estilo industrial con el # */
                      <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 shadow-inner">
                        <Hash size={12} className="text-gray-400" />
                        <span className="font-black text-gray-800 text-sm">
                          {order.tableId}
                        </span>
                      </div>
                    ) : (
                      /* 🛍️ VISTA PARA LLEVAR: Estilo llamativo en azul para diferenciar del salón */
                      <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm text-blue-600 animate-in fade-in duration-300">
                        <ShoppingBag size={12} strokeWidth={3} />
                        <span className="font-black text-[10px] uppercase tracking-widest">
                          Para Llevar
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="px-8 py-5 min-w-[200px]">
                    <div className="flex flex-col gap-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-[#FF8108] shadow-[0_0_8px_rgba(255,129,8,0.4)]" />
                          <span className="text-sm font-black text-gray-900 uppercase tracking-tight italic">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold uppercase text-gray-600 tracking-tight">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border-2 border-white shadow-sm shrink-0">
                        {order.waiterPhoto ? (
                          <img
                            src={order.waiterPhoto}
                            alt={order.waiter}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <User size={16} strokeWidth={2.5} />
                        )}
                      </div>
                      <span className="truncate max-w-[120px]">
                        {order.waiter}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-5 text-center">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-current ${config.bg} ${config.text}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${config.dot} ${
                          shouldPulse
                            ? "animate-pulse shadow-[0_0_8px_currentColor]"
                            : ""
                        }`}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {order.status}
                      </span>
                    </div>
                  </td>

                  {/* 🎯 CELDA DE PERMANENCIA CON TOOLTIP */}
                  <td
                    className={`px-8 py-5 text-right whitespace-nowrap font-black tabular-nums transition-colors cursor-help ${
                      isFinalized ? "text-gray-300" : "text-gray-700"
                    }`}
                    title={tooltipMessage}
                  >
                    {isFinalized ? "--" : order.timeInStatus}
                  </td>

                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => onViewOrder(order)}
                      className="p-2.5 text-gray-400 hover:text-[#FF8108] hover:bg-white rounded-2xl shadow-sm border border-transparent hover:border-orange-100 transition-all cursor-pointer"
                    >
                      <Eye size={20} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 🛠️ FOOTER DE PAGINACIÓN */}
      <div className="border-t border-gray-200 bg-gray-50/50 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF8108]" />
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Página <span className="text-gray-900">{currentPage}</span> —{" "}
            {orders.length} registros cargados
          </p>
        </div>

        <div className="flex gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2.5 rounded-xl border-2 bg-white border-gray-100 text-gray-400 disabled:opacity-30 hover:border-[#FF8108]/30 hover:text-[#FF8108] transition-all cursor-pointer"
          >
            <ChevronLeft size={18} strokeWidth={3} />
          </button>

          <button
            disabled={!hasNextPage}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2.5 rounded-xl border-2 bg-white border-gray-100 text-gray-400 disabled:opacity-30 hover:border-[#FF8108]/30 hover:text-[#FF8108] transition-all cursor-pointer"
          >
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};
