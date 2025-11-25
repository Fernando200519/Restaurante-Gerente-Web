// src/components/orders/OrderDetailsModal.tsx
import React from "react";
import { X } from "lucide-react";
import { Order } from "../../types/order";
import { useEffect } from "react";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!isOpen || !order) return null;

  // Calculamos el total sumando las duraciones que YA vienen en el historial
  const totalDuration = order.history.reduce(
    (acc, step) => acc + step.duration,
    0
  );

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* --- HEADER --- */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {/* MESA */}
              <span className="px-2.5 py-0.5 rounded-md bg-[#F59E0B] text-white text-base font-semibold">
                {order.tableId}
              </span>

              {/* CATEGORÍA */}
              <span className="text-base text-gray-500 font-medium">
                {order.items[0].category}
              </span>

              {/* 🔥 FECHA AGREGADA */}
              <div className="flex items-center gap-1.5 text-gray-500">
                <span className="text-base font-medium">{order.date}</span>
              </div>
            </div>

            {/* NOMBRE DEL PLATILLO */}
            <h2 className="text-3xl mt-2 font-bold text-gray-900 leading-tight">
              {order.items.map((i) => i.name).join(" + ")}
            </h2>

            {/* 🔥 COMENSAL AGREGADO */}
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              Para:{" "}
              <span className="text-gray-900 font-semibold">
                {order.guestName}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- COLUMNA IZQUIERDA: Detalles --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Grid de Métricas */}
            <div className="grid grid-cols-2 gap-2">
              {/* PRECIO (Viene de la API) */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <span className="text-base font-semibold">Precio Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${order.price.toFixed(2)}
                </p>
              </div>

              {/* TIEMPO TOTAL (Calculado del historial) */}
              <div className="p-4 rounded-xl bg-white border border-[#F59E0B]">
                <div className="flex items-center gap-2 text-[#F59E0B] mb-1">
                  <span className="text-base font-semibold">Tiempo Total</span>
                </div>
                <p className="text-2xl font-bold text-[#F59E0B]">
                  {totalDuration} min
                </p>
              </div>
            </div>

            {/* Modificadores (Vienen de la API) */}
            {order.modifiers.length > 0 && (
              <div>
                <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                  Notas Adicionales
                </h4>
                <div className="rounded-xl p-2">
                  <ul className="space-y-2">
                    {order.modifiers.map((mod, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-amber-800 text-sm font-medium"
                      >
                        <span className="rounded-full bg-[#F59E0B] w-2.5 h-2.5 inline-block"></span>
                        {mod}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Información del Mesero */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-base text-gray-600 font-semibold">Mesero</p>
                <p className="text-gray-900 font-medium">{order.waiter}</p>
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: Timeline Vertical --- */}
          <div className="lg:col-span-1 border-l border-gray-100 pl-4">
            <h4 className="text-[18px] font-bold text-gray-900 mb-6">
              Historial de Estado
            </h4>

            <div className="relative space-y-0">
              {/* Línea vertical conectora */}
              <div className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-gray-100 -z-10" />

              {/* Renderizamos el historial directamente del objeto order */}
              {order.history.map((step, index) => {
                const isLast = index === order.history.length - 1;

                return (
                  <div
                    key={index}
                    className="relative flex gap-4 pb-8 pl-4 last:pb-0"
                  >
                    {/* Contenido */}
                    <div className="-mt-1">
                      <span className="text-[14px] text-gray-400 font-mono block mb-0.5">
                        {step.timeStr}
                      </span>
                      <p
                        className={`text-base font-bold ${
                          isLast ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.status}
                      </p>
                      {/* Solo mostramos duración si es mayor a 0 */}
                      {step.duration > 0 && (
                        <p className="text-[14px] text-gray-400 mt-1">
                          Duración:{" "}
                          <span className="font-medium text-gray-600">
                            {step.duration} min
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer del timeline (si está entregada) */}
            {order.status === "Entregado" && (
              <div className="mt-8 p-3 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2">
                <span className="text-[14px] font-bold text-green-700">
                  Orden completada
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
