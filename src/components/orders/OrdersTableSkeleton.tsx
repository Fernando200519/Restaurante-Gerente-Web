// src/components/orders/OrdersTableSkeleton.tsx
import React from "react";

const OrdersTableSkeleton = () => {
  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      {/* 🦴 Header de la tabla (más claro para indicar estado inactivo) */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50/30 border-b border-gray-50">
            <tr>
              {[
                "Registro",
                "Ubicación",
                "Comanda",
                "Responsable",
                "Estado",
                "Permanencia",
                "Detalles",
              ].map((header, i) => (
                <th
                  key={i}
                  className={`px-8 py-5 text-left text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ${
                    i >= 5 ? "text-right" : i === 4 ? "text-center" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* 🦴 Cuerpo de la tabla con filas fantasma */}
          <tbody className="divide-y divide-gray-50">
            {[...Array(8)].map((_, index) => (
              <tr key={index}>
                {/* Registro */}
                <td className="px-8 py-6">
                  <div className="h-4 w-24 bg-gray-200/70 rounded-md mb-2"></div>
                  <div className="h-3 w-16 bg-gray-100 rounded-md"></div>
                </td>
                {/* Ubicación (Badge) */}
                <td className="px-8 py-6">
                  <div className="h-9 w-20 bg-gray-100 rounded-xl"></div>
                </td>
                {/* Comanda */}
                <td className="px-8 py-6 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                    <div className="h-4 w-40 bg-gray-200/70 rounded-md"></div>
                  </div>
                </td>
                {/* Responsable (Avatar + Nombre) */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    <div className="h-4 w-28 bg-gray-200/70 rounded-md"></div>
                  </div>
                </td>
                {/* Estado (Badge centrado) */}
                <td className="px-8 py-6 text-center">
                  <div className="h-9 w-32 bg-gray-100 rounded-full mx-auto"></div>
                </td>
                {/* Permanencia */}
                <td className="px-8 py-6 text-right">
                  <div className="h-4 w-16 bg-gray-200/70 rounded-md ml-auto"></div>
                </td>
                {/* Detalles (Botón) */}
                <td className="px-8 py-6 text-right">
                  <div className="h-11 w-11 bg-gray-100 rounded-2xl ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🦴 Footer de paginación fantasma */}
      <div className="border-t border-gray-50 bg-gray-50/30 px-8 py-5 flex items-center justify-between">
        <div className="h-4 w-48 bg-gray-200/50 rounded-md"></div>
        <div className="flex gap-4">
          <div className="h-11 w-11 bg-gray-100 rounded-xl"></div>
          <div className="h-11 w-11 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default OrdersTableSkeleton;
