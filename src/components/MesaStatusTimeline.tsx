// src/components/MesaStatusTimeline.tsx
import React from "react";
import { Platillo } from "../types/mesa";

const fases = ["TOMADO", "EN_PREPARACION", "LISTO", "ENTREGADO"] as const;

const colorFor = (estado: Platillo["estado"]) => {
  switch (estado) {
    case "TOMADO":
      return "bg-gray-200";
    case "EN_PREPARACION":
      return "bg-yellow-300";
    case "LISTO":
      return "bg-green-300";
    case "ENTREGADO":
      return "bg-blue-300";
    case "RETRASADO":
      return "bg-red-400";
    default:
      return "bg-gray-200";
  }
};

const MesaStatusTimeline: React.FC<{ platillo: Platillo }> = ({ platillo }) => {
  const currentIndex = fases.indexOf(
    platillo.estado === "RETRASADO"
      ? "EN_PREPARACION"
      : (platillo.estado as any)
  );

  return (
    <div className="border rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{platillo.nombre}</div>
        <div className="text-xs px-2 py-1 rounded" style={{ background: "" }}>
          {platillo.estado}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {fases.map((f, i) => (
          <div key={f} className="flex-1">
            <div
              className={`h-2 rounded ${
                i <= currentIndex ? "bg-orange-400" : "bg-gray-200"
              }`}
            />
            <div
              className={`text-xs mt-1 text-center ${
                i <= currentIndex ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {f.replace("_", " ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MesaStatusTimeline;
