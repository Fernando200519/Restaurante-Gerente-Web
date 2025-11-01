// src/components/MesaCard.tsx
import React from "react";
import { Mesa } from "../types/mesa";

interface Props {
  mesa: Mesa;
}

export const MesaCard: React.FC<Props> = ({ mesa }) => {
  const estadoStyles: Record<string, string> = {
    LIBRE: "border-green-400 bg-green-50",
    OCUPADA: "border-red-400 bg-red-50",
    ESPERANDO: "border-yellow-400 bg-yellow-50",
    AGRUPADA: "border-purple-400 bg-purple-50",
  };

  return (
    <div
      className={`border-2 rounded-xl p-4 shadow-sm ${
        estadoStyles[mesa.estado]
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{mesa.nombre}</h3>
          <p className="text-sm text-gray-600">{mesa.capacidad} personas</p>
        </div>
        {mesa.principal && (
          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
            PRINCIPAL
          </span>
        )}
      </div>

      <div className="mt-4">
        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white shadow">
          {mesa.estado}
        </span>
      </div>

      {mesa.grupo && (
        <div className="mt-3">
          <span className="inline-block text-xs font-medium px-2 py-1 rounded bg-purple-600 text-white">
            Grupo {mesa.grupo}
          </span>
        </div>
      )}
    </div>
  );
};
