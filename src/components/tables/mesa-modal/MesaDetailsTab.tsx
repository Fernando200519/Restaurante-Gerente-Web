import React, { useEffect, useState } from "react";
import { PlatilloRow } from "./PlatilloRow";
import { OrderBackend } from "../../../api/ordersApi";
import { Mesa } from "../../../types/mesa";
import { Users, Clock, User, DollarSign } from "lucide-react";

interface Props {
  orderBackend: OrderBackend | null;
  localMesa: Mesa;
}

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
  const [, setTick] = useState(0);

  // Actualizador para el "Hace X min" cada 60s
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // ---------------------------------------------------------
  // 1. CORRECCIÓN DE HORA (La "Hora Rebelde")
  // ---------------------------------------------------------
  const parseUTC = (iso: string) => {
    if (!iso) return new Date();

    // 1. Quitamos espacios extra
    let cleanIso = iso.trim().replace(" ", "T");

    // 2. CORRECCIÓN: Si no termina en Z, se la ponemos SIEMPRE.
    // Tu backend manda: "2025-12-06T23:47:54.306281"
    // Al agregar Z queda: "2025-12-06T23:47:54.306281Z" (Esto es UTC)
    // El navegador detectará que es UTC y le restará las 6 horas de México automáticamente.
    if (!cleanIso.endsWith("Z")) {
      cleanIso += "Z";
    }

    return new Date(cleanIso);
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    });

  const formatFechaConTiempoRelativo = (iso: string) => {
    // Usamos la función corregida
    const d = parseUTC(iso);

    const fechaTexto = d.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Calcular tiempo relativo
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    let textoRelativo = "";
    // Si la diferencia es negativa o muy pequeña (menos de 1 min)
    if (diffMins < 1) textoRelativo = "Hace un momento";
    else if (diffMins < 60) textoRelativo = `Hace ${diffMins} min`;
    else {
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) textoRelativo = `Hace ${diffHours} h`;
      else {
        const diffDays = Math.floor(diffHours / 24);
        textoRelativo = `Hace ${diffDays} días`;
      }
    }

    return `${fechaTexto} (${textoRelativo})`;
  };

  const currentBadgeStyle =
    estadoBadgeStyles[localMesa.estado] || estadoBadgeStyles.LIBRE;

  return (
    <div className="space-y-6">
      {/* Información General (DISEÑO ORIGINAL DE LISTA) */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
        {/* Fila 1: Estado */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="text-gray-600 font-medium text-lg">
            Estado de Mesa:
          </span>
          <span
            className={`px-3 py-1 rounded-full font-bold uppercase text-xs tracking-wider border ${currentBadgeStyle}`}
          >
            {localMesa.estado}
          </span>
        </div>

        {orderBackend && (
          <>
            {/* Fila 2: Comensales */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                Comensales:
              </span>
              <span className="text-gray-800 font-bold text-lg">
                {orderBackend.totalComensales}
              </span>
            </div>

            {/* Fila 3: Mesero */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <User size={16} className="text-blue-500" />
                Mesero Asignado:
              </span>
              <span className="text-gray-800 font-bold">
                {orderBackend.mesero}
              </span>
            </div>

            {/* Fila 4: Hora de Apertura */}
            <div className="flex justify-between items-start">
              <span className="text-gray-600 font-medium flex items-center gap-2 mt-1">
                <Clock size={16} className="text-blue-500" />
                Hora de Apertura:
              </span>
              <span className="text-gray-800 font-bold text-right text-sm sm:text-base">
                {/* Aquí renderizamos la hora corregida */}
                {formatFechaConTiempoRelativo(orderBackend.fechaHora ?? "")}
              </span>
            </div>
          </>
        )}

        {!orderBackend && (
          <div className="text-center text-gray-400 py-2 italic text-sm">
            Sin información de orden.
          </div>
        )}
      </div>

      {/* Lista de platillos */}
      {orderBackend?.detallesOrden?.length ? (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h4 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
            Platillos
          </h4>
          <div className="divide-y divide-gray-50">
            {orderBackend.detallesOrden.map((d) => (
              <PlatilloRow
                key={d.id}
                producto={d.producto ?? "Desconocido"}
                cantidad={d.cantidad || 1}
                comensal={d.comensal ?? "N/A"}
                estado={d.estado}
                total={d.total}
                // También aplicamos la corrección aquí por si acaso se usa dentro
                fechaHora={parseUTC(
                  d.fechaHoraInicioEstado ?? ""
                ).toISOString()}
              />
            ))}
          </div>
        </div>
      ) : orderBackend ? (
        <div className="text-center text-gray-400 py-10">
          La orden está abierta, pero no se han agregado platillos.
        </div>
      ) : null}

      {/* Total */}
      {orderBackend && (
        <div className="bg-[#fff9f4] rounded-xl p-4 border border-[#FA9623]/30 flex justify-between items-center shadow-sm">
          <span className="text-gray-700 font-bold flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" />
            Total de la Cuenta:
          </span>
          <span className="text-3xl font-black text-gray-900 tabular-nums">
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
