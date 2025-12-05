import React from "react";
import { PlatilloEstado } from "../../../types/mesa"; // Ajusta si tu tipo está en otra ruta

interface PlatilloRowProps {
  producto: string;
  cantidad: number;
  comensal?: string;
  estado: PlatilloEstado;
  total: number;
  fechaHora: string;
}

export const PlatilloRow: React.FC<PlatilloRowProps> = ({
  producto,
  cantidad,
  comensal,
  estado,
  total,
  fechaHora,
}) => {
  const getEstadoColor = (estado: PlatilloEstado) => {
    switch (estado) {
      case "Solicitado":
        return "text-blue-500";
      case "EN_PREPARACION":
        return "text-orange-500";
      case "LISTO":
        return "text-green-600";
      case "SERVIR":
        return "text-gray-500";
      case "CANCELADO":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    });

  const formatHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-none">
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800">{producto}</span>
        <span className="text-gray-500 text-sm">
          {cantidad}× — {comensal || "Sin comensal"}
        </span>
        <span className={`text-sm font-medium ${getEstadoColor(estado)}`}>
          {estado}
        </span>
      </div>

      <div className="text-right">
        <div className="text-gray-600 text-sm">{formatHora(fechaHora)}</div>
        <div className="font-bold text-gray-800">{formatCurrency(total)}</div>
      </div>
    </div>
  );
};
