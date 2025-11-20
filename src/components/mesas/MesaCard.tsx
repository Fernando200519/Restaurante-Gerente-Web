// src/components/mesas/MesaCard.tsx
import React from "react";
import { Mesa } from "../../types/mesa";
import { Clock, DollarSign, Users, MapPin, AlertCircle } from "lucide-react"; // Asegúrate de tener lucide-react instalado

interface Props {
  mesa: Mesa;
}

const formatCurrency = (n?: number) =>
  n == null
    ? "$0.00"
    : n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
      });

export const MesaCard: React.FC<Props> = ({ mesa }) => {
  // --- LÓGICA DE COLORES MODERNOS (Soft UI) ---
  // Usamos fondos suaves (bg-X-50 o 100) y bordes/textos oscuros
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
    DESACTIVADA: {
      border: "border-gray-300",
      bg: "bg-gray-100",
      text: "text-gray-600",
      ring: "ring-gray-100",
    },
  };

  const isSecondaryGrouped = mesa.grupo && !mesa.principal;

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

  // --- DATOS ---
  const minutos = (() => {
    if (!mesa.orden?.startedAt) return null;
    const inicio = new Date(mesa.orden.startedAt);
    return Math.max(0, Math.floor((Date.now() - inicio.getTime()) / 60000));
  })();

  const currentTotal = mesa.orden?.montoTotal ?? 0;
  const alertasActivas = mesa.orden?.totalAlertas || 0;

  // Badge del Estado (Pill shape)
  const EstadoBadge = () => {
    // Colores específicos para el badge pequeño
    const badgeColors: Record<string, string> = {
      LIBRE: "bg-[#22C55E] text-[#FFFFFF]",
      OCUPADA: "bg-[#EF4444] text-[#FFFFFF]",
      ESPERANDO: "bg-[#F59E0B] text-[#FFFFFF]",
      AGRUPADA: "bg-[#A855F7] text-[#FFFFFF]",
      DESACTIVADA: "bg-gray-100 text-gray-500",
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
        hover:shadow-md hover:-translate-y-1 hover:border-opacity-100
        ${mesa.estado === "DESACTIVADA" ? "opacity-60 grayscale" : ""}
      `}
      style={{ minHeight: "130px" }}
    >
      {/* Badge grupo flotante */}
      {mesa.grupo && (
        <div className="absolute -top-2 -left-2 z-10">
          <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm shadow-purple-200">
            {mesa.principal ? `Grupo ${mesa.grupo}` : `Grupo ${mesa.grupo}`}
          </span>
        </div>
      )}

      {/* --- HEADER: Nombre y Estado --- */}
      <div className="flex items-start justify-between mb-4">
        <h3
          className={`text-xl font-bold ${
            isSecondaryGrouped ? "text-gray-400" : "text-gray-800"
          }`}
        >
          {mesa.nombre}
        </h3>
        {!isSecondaryGrouped && <EstadoBadge />}
      </div>

      {/* --- BODY: Grid de 2 columnas (Tiempo y Dinero) --- */}
      {mesa.estado !== "LIBRE" && mesa.estado !== "DESACTIVADA" ? (
        <div className="grid grid-cols-2 gap-4 mb-2">
          {/* Columna Tiempo */}
          <div className="flex flex-col items-start justify-center p-2 rounded-lg bg-gray-50/50 border border-gray-100/50">
            <div className="flex items-center gap-1.5 text-base text-gray-500 font-medium mb-0.5">
              <Clock size={12} />
              Tiempo
            </div>
            <div
              className={`text-lg font-bold tabular-nums ${
                minutos && minutos > 60 ? "text-rose-500" : "text-gray-700"
              }`}
            >
              {minutos ?? 0}
              <span className="text-xs font-normal text-gray-500 ml-0.5">
                min
              </span>
            </div>
          </div>

          {/* Columna Cuenta */}
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
        // Estado vacío elegante para mesas libres
        <div className="h-[62px] flex items-center justify-center text-gray-500 text-base font-medium">
          Disponible
        </div>
      )}

      {/* --- FOOTER: Alertas/Capacidad y Zona --- */}
      <div className="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between">
        {/* Izquierda: Alertas o Capacidad (Para que no se vea vacío) */}
        <div className="flex items-center gap-2">
          {alertasActivas > 0 && (
            <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded text-xs font-bold animate-pulse">
              <AlertCircle size={12} />
              <span>
                {alertasActivas} alerta{alertasActivas !== 1 && "s"}
              </span>
            </div>
          )}
        </div>
        {/* Derecha: Zona */}
        <div className="flex items-center gap-1 text-base font-medium text-gray-500">
          <span className="truncate max-w-32">{mesa.zona || "Sin zona"}</span>
        </div>
      </div>
    </div>
  );
};

export default MesaCard;
