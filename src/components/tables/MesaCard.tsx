// src/components/mesas/MesaCard.tsx
import React from "react";
import { Mesa } from "../../types/mesa";
import { Clock, DollarSign, AlertCircle, Ban } from "lucide-react"; // ✅ Agregamos Ban

interface Props {
  mesa: Mesa;
  zonaDeshabilitada?: boolean; // 👈 AGREGA ESTA LÍNEA (el ? la hace opcional)
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
  // --- LÓGICA DE COLORES MODERNOS (Soft UI) ---
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
    // ✅ Estilo específico para INACTIVA (Gris y apagado)
    INACTIVA: {
      border: "border-gray-200",
      bg: "bg-gray-50",
      text: "text-gray-400",
      ring: "ring-gray-100",
    },
    // Mantenemos DESACTIVADA por si acaso tienes datos viejos
    DESACTIVADA: {
      border: "border-gray-200",
      bg: "bg-gray-50",
      text: "text-gray-400",
      ring: "ring-gray-100",
    },
  };

  // --- 2. CÁLCULOS DE ESTADO ---
  const isSecondaryGrouped = mesa.grupo && !mesa.principal;

  // La mesa está visualmente deshabilitada si:
  // A) La Zona entera está cerrada OR
  // B) La mesa individual está Inactiva/Desactivada
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
    const badgeColors: Record<string, string> = {
      LIBRE: "bg-[#22C55E] text-[#FFFFFF]",
      OCUPADA: "bg-[#EF4444] text-[#FFFFFF]",
      ESPERANDO: "bg-[#F59E0B] text-[#FFFFFF]",
      AGRUPADA: "bg-[#A855F7] text-[#FFFFFF]",
      INACTIVA: "bg-gray-200 text-gray-500", // Gris oscuro para badge
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
            ? "opacity-60 grayscale pointer-events-none" // Estilo apagado
            : "hover:shadow-md hover:-translate-y-1 hover:border-opacity-100" // Estilo interactivo
        } 
      `}
      style={{ minHeight: "130px" }}
    >
      {/* 1. Badge de Grupo (Flotante) */}
      {mesa.grupo && (
        <div className="absolute -top-2 -left-2 z-10">
          <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm shadow-purple-200">
            {mesa.principal ? `Grupo ${mesa.grupo}` : `Grupo ${mesa.grupo}`}
          </span>
        </div>
      )}

      {/* 2. HEADER: Nombre y Badge de Estado */}
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

      {/* 3. BODY: Lógica Condicional de Contenido */}

      {/* CASO A: Zona Cerrada o Mesa Inactiva */}
      {isVisuallyDisabled ? (
        <div className="h-[62px] flex flex-col items-center justify-center text-gray-500 bg-gray-100/50 rounded-lg border border-gray-200 border-dashed mb-2">
          <div className="flex items-center gap-2 text-base font-medium">
            <span>{zonaDeshabilitada ? "Zona Cerrada" : "No Disponible"}</span>
          </div>
        </div>
      ) : mesa.estado !== "LIBRE" ? (
        // CASO B: Mesa Ocupada/Esperando (Muestra Tiempo y Dinero)
        <div className="grid grid-cols-2 gap-4 mb-2">
          {/* Columna Tiempo */}
          <div className="flex flex-col items-start justify-center p-2 rounded-lg bg-gray-50/50 border border-gray-100/50">
            <div className="flex items-center gap-1.5 text-base text-gray-500 font-medium mb-0.5">
              <Clock size={12} />
              Tiempo
            </div>
            <div className={"text-lg font-bold tabular-num text-gray-700"}>
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
        // CASO C: Mesa Libre
        <div className="h-[62px] flex items-center justify-center text-gray-400 text-base font-medium mb-2">
          Disponible
        </div>
      )}

      {/* 4. FOOTER: Alertas y Nombre de Zona */}
      <div className="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between">
        {/* Izquierda: Alertas */}
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

        {/* Derecha: Nombre de Zona */}
        <div className="flex items-center gap-1 text-base font-medium text-gray-400">
          <span>{mesa.zona || "Sin zona"}</span>
        </div>
      </div>
    </div>
  );
};

export default MesaCard;
