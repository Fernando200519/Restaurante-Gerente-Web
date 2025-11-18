// src/components/MesaCardAuditoria.tsx
import React from "react";
import { AlertTriangle, Bell, Clock, DollarSign, Settings } from "lucide-react";

interface MesaAuditoria {
  id: number;
  nombre: string;
  capacidad: number;
  estado: string;
  alerta?: "ESPERA" | "PRODUCCION" | "SERVICIO" | "PAGO";
}

const alertStyles: Record<
  string,
  { border: string; icon: React.ReactNode; label: string }
> = {
  ESPERA: {
    border: "border-orange-400",
    icon: <Clock size={18} />,
    label: "ESPERA",
  },
  PRODUCCION: {
    border: "border-yellow-400",
    icon: <Settings size={18} />,
    label: "PRODUCCIÓN",
  },
  SERVICIO: {
    border: "border-red-500",
    icon: <Bell size={18} />,
    label: "SERVICIO",
  },
  PAGO: {
    border: "border-blue-500",
    icon: <DollarSign size={18} />,
    label: "PAGO",
  },
};

export const MesaCardAuditoria: React.FC<{
  mesa: MesaAuditoria;
  onClick: () => void;
}> = ({ mesa, onClick }) => {
  const alerta = mesa.alerta ? alertStyles[mesa.alerta] : null;

  return (
    <div
      onClick={onClick}
      className={`relative border-2 rounded-xl p-4 shadow-sm cursor-pointer transition hover:shadow-md text-center bg-white ${
        alerta ? alerta.border : "border-gray-200"
      }`}
    >
      {/* Indicador de alerta */}
      {alerta && (
        <div className="absolute top-2 left-2 flex items-center gap-1 text-sm font-semibold text-red-600">
          {alerta.icon} <span>{alerta.label}</span>
        </div>
      )}

      <h3 className="font-bold text-lg mt-3">{mesa.nombre}</h3>
      <p className="text-sm text-gray-600">{mesa.capacidad} personas</p>

      {/* Estado base */}
      <div className="mt-3">
        <span
          className={`inline-block text-xs font-semibold text-white px-3 py-1 rounded-full ${
            mesa.estado === "OCUPADA"
              ? "bg-red-500"
              : mesa.estado === "LIBRE"
              ? "bg-green-500"
              : mesa.estado === "ESPERANDO"
              ? "bg-yellow-500"
              : "bg-gray-400"
          }`}
        >
          {mesa.estado}
        </span>
      </div>
    </div>
  );
};
