import React, { useState, useEffect } from "react";
import { Mesa } from "../../types/mesa";
// ✅ Añadimos Receipt para el icono de cuenta
import {
  Clock,
  DollarSign,
  AlertCircle,
  Ban,
  Star,
  Receipt,
} from "lucide-react";

interface Props {
  mesa: Mesa;
  zonaDeshabilitada?: boolean;
  isNew?: boolean;
}

const formatCurrency = (n?: number) =>
  n == null
    ? "$0.00"
    : n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
      });

export const MesaCard: React.FC<Props> = ({
  mesa,
  zonaDeshabilitada,
  isNew,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (mesa.estado === "LIBRE") return;
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, [mesa.estado]);

  const getTiempoTranscurrido = () => {
    if (!mesa.orden?.startedAt) return "0 min";
    let iso = mesa.orden.startedAt.trim().replace(" ", "T");
    if (!iso.endsWith("Z")) iso += "Z";

    const inicio = new Date(iso);
    const ahora = new Date();
    const diffMins = Math.floor((ahora.getTime() - inicio.getTime()) / 60000);

    if (diffMins < 1) return "1 min";
    if (diffMins < 60) return `${diffMins} min`;
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return `${h}h ${m}m`;
  };

  const tiempoTexto = getTiempoTranscurrido();

  const estadoStyles: Record<
    string,
    { border: string; bg: string; accent: string }
  > = {
    LIBRE: {
      border: "border-emerald-100",
      bg: "bg-white",
      accent: "bg-emerald-500",
    },
    OCUPADA: {
      border: "border-rose-100",
      bg: "bg-white",
      accent: "bg-rose-500",
    },
    ESPERANDO: {
      border: "border-amber-100",
      bg: "bg-white",
      accent: "bg-amber-500",
    },
    ESPERANDO_PAGO: {
      border: "border-yellow-400",
      bg: "bg-yellow-50/30",
      accent: "bg-yellow-500",
    },
    AGRUPADA: {
      border: "border-purple-100",
      bg: "bg-white",
      accent: "bg-purple-500",
    },
    INACTIVA: {
      border: "border-gray-200",
      bg: "bg-gray-50",
      accent: "bg-gray-400",
    },
  };

  const isSecondaryGrouped = mesa.grupo && !mesa.principal;
  const isSpecialState =
    isNew || mesa.estado === "ESPERANDO_PAGO" || mesa.grupo;
  const isVisuallyDisabled =
    zonaDeshabilitada ||
    mesa.estado === "INACTIVA" ||
    mesa.estado === "DESACTIVADA";

  const style = isSecondaryGrouped
    ? { border: "border-gray-200", bg: "bg-gray-50", accent: "bg-gray-300" }
    : estadoStyles[mesa.estado] || estadoStyles.INACTIVA;

  const currentTotal = mesa.orden?.montoTotal ?? 0;
  const alertasActivas = mesa.orden?.totalAlertas || 0;

  return (
    <div
      className={`relative rounded-[2.5rem] p-5 border-2 transition-all duration-300 
        ${style.border} ${style.bg} 
        ${
          isVisuallyDisabled
            ? "opacity-50 grayscale pointer-events-none"
            : "hover:shadow-xl hover:border-[#FF8108]/30 hover:-translate-y-1"
        } 
        ${isNew ? "shine-effect ring-4 ring-orange-100 z-10" : "shadow-sm"}
        ${mesa.estado === "ESPERANDO_PAGO" ? "ring-4 ring-yellow-100/50" : ""}
      `}
      style={{ minHeight: "150px" }}
    >
      {/* 🏷️ BADGES SUPERIORES */}
      <div className="absolute top-4 right-6 flex flex-col items-end gap-2 z-20">
        {isNew && (
          <span className="bg-[#FF8108] text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce ring-2 ring-white">
            <Star size={10} fill="white" />{" "}
            <span className="tracking-widest">NUEVA</span>
          </span>
        )}
        {/* ✅ Badge de Pago Pendiente */}
        {mesa.estado === "ESPERANDO_PAGO" && (
          <span className="bg-yellow-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg ring-2 ring-white uppercase tracking-widest flex items-center gap-1 animate-pulse">
            <Receipt size={10} strokeWidth={3} /> Por Cobrar
          </span>
        )}
        {mesa.grupo && (
          <span className="bg-purple-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg ring-2 ring-white uppercase tracking-widest">
            Grupo {mesa.grupo}
          </span>
        )}
      </div>

      {/* HEADER: Ajustamos el padding derecho (pr-16) para que el nombre de la mesa 
          no choque con el badge si es muy largo */}
      <div className="flex items-center justify-between mb-4 pr-16">
        <div className="flex items-center gap-2">
          <h3
            className={`text-2xl font-black leading-none tracking-tighter uppercase ${
              isSecondaryGrouped ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {mesa.nombre}
          </h3>
        </div>
      </div>

      {/* CONTENIDO CENTRAL */}
      <div className="space-y-3">
        {isVisuallyDisabled ? (
          <div className="py-4 flex flex-col items-center justify-center bg-gray-100/50 rounded-2xl border border-dashed border-gray-200">
            <Ban size={20} className="text-gray-300 mb-1" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Fuera de Servicio
            </span>
          </div>
        ) : mesa.estado === "LIBRE" ? (
          <div className="py-4 flex items-center justify-center bg-emerald-50/30 rounded-2xl border border-emerald-100 border-dashed">
            <span className="text-sm font-black text-emerald-600 uppercase tracking-tight">
              Disponible
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {/* Bloque Tiempo */}
            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Clock size={12} strokeWidth={2.5} />
                <span className="text-[9px] font-black uppercase tracking-wider">
                  Tiempo
                </span>
              </div>
              <p className="text-sm font-black text-gray-700 tabular-nums">
                {tiempoTexto}
              </p>
            </div>

            {/* ✅ Resaltamos la cuenta si está pendiente de pago */}
            <div
              className={`${
                mesa.estado === "ESPERANDO_PAGO"
                  ? "bg-yellow-100/50 border-yellow-200"
                  : "bg-gray-50/80 border-gray-100"
              } p-3 rounded-2xl border text-right transition-colors`}
            >
              <div className="flex items-center justify-end gap-1.5 text-gray-400 mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider">
                  Total
                </span>
                <DollarSign size={12} strokeWidth={2.5} />
              </div>
              <p
                className={`text-sm font-black tabular-nums ${
                  mesa.estado === "ESPERANDO_PAGO"
                    ? "text-yellow-700"
                    : "text-emerald-600"
                }`}
              >
                {formatCurrency(currentTotal)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: Alertas Dinámicas */}
      {!isVisuallyDisabled && alertasActivas > 0 && (
        <div className="mt-4 flex items-center gap-2 bg-rose-50 p-2.5 rounded-xl border border-rose-100 animate-pulse">
          <AlertCircle size={14} className="text-rose-600" strokeWidth={3} />
          <span className="text-[10px] font-black text-rose-700 uppercase tracking-wide">
            {alertasActivas}{" "}
            {alertasActivas === 1 ? "Petición pendiente" : "Peticiones activas"}
          </span>
        </div>
      )}
    </div>
  );
};

export default MesaCard;
