import React from "react";

import { Mesa } from "../types/mesa";

interface Props {
  mesa: Mesa;
}

export const MesaCard: React.FC<Props> = ({ mesa }) => {
  const estadoStyles: Record<
    string,
    { border: string; bg: string; text: string }
  > = {
    LIBRE: {
      border: "border-green-500",

      bg: "bg-green-500",

      text: "text-green-700",
    },

    OCUPADA: {
      border: "border-red-500",

      bg: "bg-red-500",

      text: "text-red-700",
    },

    ESPERANDO: {
      border: "border-yellow-500",

      bg: "bg-yellow-500",

      text: "text-yellow-700",
    },

    AGRUPADA: {
      border: "border-purple-500",

      bg: "bg-purple-500",

      text: "text-purple-700",
    },
  };

  // Si la mesa está agrupada como secundaria, se muestra gris

  const color =
    mesa.grupo && !mesa.principal
      ? {
          border: "border-gray-400",

          bg: "bg-gray-400",

          text: "text-gray-700",
        }
      : estadoStyles[mesa.estado] || {
          border: "border-gray-300",

          bg: "bg-gray-300",

          text: "text-gray-700",
        };

  return (
    <div
      className={`relative border-2 rounded-xl p-4 shadow-sm cursor-pointer transition transform hover:scale-[1.02] hover:shadow-md text-center bg-white ${color.border}`}
      style={{ minHeight: "120px" }}
    >
      {/* Grupo */}

      {mesa.grupo && (
        <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
          Grupo {mesa.grupo}
        </span>
      )}

      <h3 className="font-bold text-lg mt-2 mb-1">{mesa.nombre}</h3>

      <div className="mb-1">
        <span
          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full text-white ${color.bg}`}
        >
          {mesa.estado}
        </span>
      </div>

      {/* Etiqueta de principal */}

      {mesa.principal && <div className="mt-2"></div>}
    </div>
  );
};
