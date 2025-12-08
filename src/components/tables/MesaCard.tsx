// src/components/mesas/MesaCard.tsx
import React, { useState, useEffect } from "react";
import { Mesa } from "../../types/mesa";
import { Clock, DollarSign, AlertCircle, Ban } from "lucide-react";

interface Props {
  mesa: Mesa;
  zonaDeshabilitada?: boolean;
}

const formatCurrency = (n?: number) =>
  n == null
    ? "$0.00"
    : n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
      });

export const MesaCard: React.FC<Props> = ({ mesa, zonaDeshabilitada }) => {
  // Estado para forzar la actualización del reloj cada minuto
  const [, setTick] = useState(0);

  useEffect(() => {
    // Solo activamos el intervalo si la mesa NO está libre
    if (mesa.estado === "LIBRE") return;

    const timer = setInterval(() => setTick((t) => t + 1), 60000); // Cada 60 seg
    return () => clearInterval(timer);
  }, [mesa.estado]);

  // ---------------------------------------------------------
  // LÓGICA DE TIEMPO (Cronómetro)
  // ---------------------------------------------------------
  const getTiempoTranscurrido = () => {
    if (!mesa.orden?.startedAt) return "0 min";

    // 1. Corrección UTC (Igual que en el modal)
    let iso = mesa.orden.startedAt.trim().replace(" ", "T");
    if (!iso.endsWith("Z")) iso += "Z";

    const inicio = new Date(iso);
    const ahora = new Date();

    // Diferencia en minutos
    const diffMins = Math.floor((ahora.getTime() - inicio.getTime()) / 60000);

    if (diffMins < 1) return "1 min"; // Mínimo mostrar 1 min
    if (diffMins < 60) return `${diffMins} min`;

    // Formato horas y minutos (ej: 1h 20m)
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return `${h}h ${m}m`;
  };

  const tiempoTexto = getTiempoTranscurrido();

  const estadoStyles: Record<
    string,
    { border: string; bg: string; text: string; ring: string }
  > = {
    LIBRE: {
      border: "border-green-300",
      bg: "bg-green-100",
      text: "text-green-600",
      ring: "ring-green-100",
    },
    OCUPADA: {
      border: "border-red-300",
      bg: "bg-red-100",
      text: "text-red-600",
      ring: "ring-red-100",
    },
    ESPERANDO: {
      border: "border-yellow-300",
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      ring: "ring-yellow-100",
    },
    AGRUPADA: {
      border: "border-purple-300",
      bg: "bg-purple-100",
      text: "text-purple-600",
      ring: "ring-purple-100",
    },
    ACTIVA: {
      border: "border-green-300",
      bg: "bg-green-100",
      text: "text-green-600",
      ring: "ring-green-100",
    },
    INACTIVA: {
      border: "border-gray-200",
      bg: "bg-gray-50",
      text: "text-gray-400",
      ring: "ring-gray-100",
    },
    DESACTIVADA: {
      border: "border-gray-200",
      bg: "bg-gray-50",
      text: "text-gray-400",
      ring: "ring-gray-100",
    },
  };

  const isSecondaryGrouped = mesa.grupo && !mesa.principal;

  const isVisuallyDisabled =
    zonaDeshabilitada ||
    mesa.estado === "INACTIVA" ||
    mesa.estado === "DESACTIVADA";

  const style = isSecondaryGrouped
    ? {
        border: "border-gray-200",
        bg: "bg-gray-50",
        text: "text-gray-400",
        ring: "ring-gray-100",
      }
    : estadoStyles[mesa.estado] || {
        border: "border-gray-200",
        bg: "bg-white",
        text: "text-gray-700",
        ring: "ring-gray-100",
      };

  const minutos = (() => {
    if (!mesa.orden?.startedAt) return null;
    const inicio = new Date(mesa.orden.startedAt);
    return Math.max(0, Math.floor((Date.now() - inicio.getTime()) / 60000));
  })();

  const currentTotal = mesa.orden?.montoTotal ?? 0;
  const alertasActivas = mesa.orden?.totalAlertas || 0;

  const EstadoBadge = () => {
    const badgeColors: Record<string, string> = {
      LIBRE: "bg-[#22C55E] text-[#FFFFFF]",
      OCUPADA: "bg-[#EF4444] text-[#FFFFFF]",
      ESPERANDO: "bg-[#F59E0B] text-[#FFFFFF]",
      AGRUPADA: "bg-[#A855F7] text-[#FFFFFF]",
      INACTIVA: "bg-gray-200 text-gray-500",
      DESACTIVADA: "bg-gray-200 text-gray-500",
    };
    const colorClass = badgeColors[mesa.estado] || "bg-gray-100 text-gray-600";

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${colorClass}`}
      >
        {mesa.estado}
      </span>
    );
  };

  return (
    <div
      className={`relative rounded-2xl p-5 shadow-sm cursor-pointer transition-all duration-200 
        border ${style.border} ${style.bg} 
        ${
          isVisuallyDisabled
            ? "opacity-60 grayscale pointer-events-none"
            : "hover:shadow-md hover:-translate-y-1 hover:border-opacity-100"
        } 
      `}
      style={{ minHeight: "130px" }}
    >
      {mesa.grupo && (
        <div className="absolute -top-2 -left-2 z-10">
          <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm shadow-purple-200">
            {mesa.principal ? `Grupo ${mesa.grupo}` : `Grupo ${mesa.grupo}`}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <h3
          className={`text-xl font-bold ${
            isSecondaryGrouped || isVisuallyDisabled
              ? "text-gray-400"
              : "text-gray-800"
          }`}
        >
          {mesa.nombre}
        </h3>
        {!isSecondaryGrouped && <EstadoBadge />}
      </div>

      {isVisuallyDisabled ? (
        <div className="h-[62px] flex flex-col items-center justify-center text-gray-500 bg-gray-100/50 rounded-lg border border-gray-200 border-dashed mb-2">
          <div className="flex items-center gap-2 text-base font-medium">
            <span>{zonaDeshabilitada ? "Zona Cerrada" : "No Disponible"}</span>
          </div>
        </div>
      ) : mesa.estado !== "LIBRE" ? (
        <div className="grid grid-cols-2 gap-4 mb-2">
          {/* BLOQUE DE TIEMPO (Mejorado) */}
          <div className="flex flex-col items-start justify-center p-2 rounded-lg bg-gray-50/50 border border-gray-100/50">
            <div className="flex items-center gap-1.5 text-base text-gray-500 font-medium mb-0.5">
              <Clock size={12} />
              Tiempo
            </div>
            {/* Aquí mostramos el texto formateado (ej: 1h 20m) */}
            <div className="text-lg font-bold tabular-nums text-gray-700">
              {tiempoTexto}
            </div>
          </div>

          <div className="flex flex-col items-end justify-center p-2 rounded-lg bg-gray-50/50 border border-gray-100/50">
            <div className="flex items-center gap-1.5 text-base text-gray-500 font-medium mb-0.5">
              Cuenta
              <DollarSign size={12} />
            </div>
            <div
              className={`text-lg font-bold tabular-nums ${
                currentTotal > 0 ? "text-emerald-600" : "text-gray-500"
              }`}
            >
              {currentTotal > 0 ? formatCurrency(currentTotal) : "—"}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[62px] flex items-center justify-center text-gray-400 text-base font-medium mb-2">
          Disponible
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {alertasActivas > 0 && !isVisuallyDisabled && (
            <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded text-[14px] font-bold animate-pulse">
              <AlertCircle size={12} />
              <span>
                {alertasActivas} alerta{alertasActivas !== 1 && "s"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-base font-medium text-gray-400">
          <span>{mesa.zona || "Sin zona"}</span>
        </div>
      </div>
    </div>
  );
};

export default MesaCard;
