import React from "react";
import { PlatilloRow } from "./PlatilloRow";
import { OrderBackend } from "../../../api/ordersApi";
import { Mesa } from "../../../types/mesa";
import { Users, Clock, Utensils, DollarSign, User, Zap } from "lucide-react";
interface Props {
  orderBackend: OrderBackend | null;
  localMesa: Mesa;
}

// Lógica de estilos de estado para el badge
const estadoBadgeStyles: Record<string, string> = {
  LIBRE: "bg-green-100 text-green-700 border-green-300",
  OCUPADA: "bg-red-100 text-red-700 border-red-300",
  ESPERANDO: "bg-yellow-100 text-yellow-700 border-yellow-300",
  AGRUPADA: "bg-purple-100 text-purple-700 border-purple-300",
  INACTIVA: "bg-gray-100 text-gray-500 border-gray-300",
  DESACTIVADA: "bg-gray-100 text-gray-500 border-gray-300",
};

export const MesaDetailsTab: React.FC<Props> = ({
  orderBackend,
  localMesa,
}) => {
  const formatCurrency = (n: number) =>
    n.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    });

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener estilos del estado de la mesa
  const currentBadgeStyle =
    estadoBadgeStyles[localMesa.estado] || estadoBadgeStyles.LIBRE;

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN DE ESTADO Y RESUMEN OPERACIONAL */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-4">
        {/* Estado (Destacado) */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-gray-600 font-medium text-lg flex items-center gap-2">
            Estado de Mesa:
          </span>
          <span
            className={`px-3 py-1 rounded-full font-bold uppercase text-sm border ${currentBadgeStyle}`}
          >
            {localMesa.estado}
          </span>
        </div>

        {orderBackend ? (
          <div className="space-y-3">
            {/* Comensales */}
            <div className="flex justify-between items-center text-base">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                Comensales:
              </span>
              <span className="text-gray-800 font-bold">
                {orderBackend.totalComensales}
              </span>
            </div>

            {/* Mesero */}
            <div className="flex justify-between items-center text-base">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <User size={16} className="text-blue-500" />
                Mesero Asignado:
              </span>
              <span className="text-gray-800 font-bold">
                {orderBackend.mesero}
              </span>
            </div>

            {/* Apertura */}
            <div className="flex justify-between items-center text-base">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                Hora de Apertura:
              </span>
              <span className="text-gray-800 font-bold">
                {formatFecha(orderBackend.fechaHora ?? "---")}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            Mesa Libre. No hay orden activa.
          </div>
        )}
      </div>

      {/* 2. SECCIÓN DE PLATILLOS */}
      {orderBackend?.detallesOrden?.length ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
          <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2 border-b pb-3">
            <Utensils size={20} className="text-orange-500" />
            Detalles de la Orden
          </h4>{" "}
          <div className="divide-y divide-gray-100">
            {orderBackend.detallesOrden.map((d) => (
              <PlatilloRow
                key={d.id}
                producto={d.producto ?? "Desconocido"}
                cantidad={d.cantidad || 1}
                comensal={d.comensal ?? "N/A"}
                estado={d.estado}
                total={d.total}
                fechaHora={d.fechaHoraInicioEstado ?? ""}
              />
            ))}
          </div>
        </div>
      ) : orderBackend ? (
        <div className="text-center text-gray-500 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          La orden está abierta, pero no se han agregado platillos.
        </div>
      ) : null}

      {/* 3. SECCIÓN DE TOTAL (Destacado) */}
      {orderBackend && (
        <div className="bg-[#fff9f4] rounded-2xl p-6 border border-[#FA9623]/40 flex justify-between items-center shadow-lg">
          <span className="text-xl text-gray-700 font-semibold flex items-center gap-2">
            <DollarSign size={24} className="text-green-600" />
            Total de la Cuenta:
          </span>
          <span className="text-3xl font-extrabold text-gray-900">
            {formatCurrency(
              (orderBackend.detallesOrden ?? []).reduce(
                (acc, d) => acc + d.total,
                0
              )
            )}
          </span>
        </div>
      )}
    </div>
  );
};
