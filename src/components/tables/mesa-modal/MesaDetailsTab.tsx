import React from "react";
import { PlatilloRow } from "./PlatilloRow";
import { OrderBackend } from "../../../api/ordersApi";
import { Mesa } from "../../../types/mesa";

interface Props {
  orderBackend: OrderBackend | null;
  localMesa: Mesa;
}

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

  return (
    <div className="space-y-6">
      {/* Información General */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Estado:</span>
          <span className="text-gray-800 font-semibold">
            {localMesa.estado}
          </span>
        </div>

        {orderBackend && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Comensales:</span>
              <span className="text-gray-800 font-semibold">
                {orderBackend.totalComensales}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Mesero:</span>
              <span className="text-gray-800 font-semibold">
                {orderBackend.mesero}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Apertura:</span>
              <span className="text-gray-800 font-semibold">
                {formatFecha(orderBackend.fechaHora ?? "")}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Lista de platillos */}
      {orderBackend?.detallesOrden?.length ? (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">
            Platillos
          </h4>{" "}
          <div className="divide-y">
            {orderBackend.detallesOrden.map((d) => (
              <PlatilloRow
                key={d.id}
                // CORRECCIÓN 1: Evita pasar null/undefined a un prop que espera string.
                // Usamos un valor por defecto si es null o undefined.
                producto={d.producto ?? "Desconocido"}
                // Ya manejado con || 1
                cantidad={d.cantidad || 1}
                // CORRECCIÓN 2: Evita pasar null/undefined a un prop que espera string.
                comensal={d.comensal ?? "N/A"}
                // El tipo ya fue corregido en la interfaz.
                estado={d.estado}
                total={d.total}
                // CORRECCIÓN 3: Evita pasar null/undefined a un prop que espera string.
                fechaHora={d.fechaHoraInicioEstado ?? ""}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-10">
          No hay platillos registrados.
        </div>
      )}

      {/* Total */}
      {orderBackend && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
          <span className="text-gray-600 font-medium">Total a pagar:</span>
          <span className="text-2xl font-bold text-gray-900">
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
