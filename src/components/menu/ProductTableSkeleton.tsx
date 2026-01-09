import React from "react";

const ProductTableSkeleton: React.FC = () => {
  const rows = Array.from({ length: 5 });

  return (
    <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            {/* Cabeceras espejo con la tabla real */}
            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-200 uppercase tracking-[0.2em]">
              Platillo / Producto
            </th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-200 uppercase tracking-[0.2em]">
              Categoría
            </th>
            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-200 uppercase tracking-[0.2em]">
              Precio (MXN)
            </th>
            <th className="px-8 py-5 text-center text-[10px] font-black text-gray-200 uppercase tracking-[0.2em]">
              Estado
            </th>
            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-200 uppercase tracking-[0.2em]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((_, index) => (
            <tr key={index}>
              {/* Celda Info Principal (Imagen + Textos) */}
              <td className="px-8 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gray-100 border-2 border-gray-50 shrink-0" />
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="h-4 bg-gray-200 rounded-md w-32" />
                    <div className="h-2.5 bg-gray-100 rounded-md w-48" />
                  </div>
                </div>
              </td>

              {/* Celda Categoría */}
              <td className="px-8 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded bg-gray-100 opacity-50" />
                  <div className="h-4 bg-gray-100 rounded-lg w-20" />
                </div>
              </td>

              {/* Celda Precio (Alineada a la derecha) */}
              <td className="px-8 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  {/* Pequeño hint del color de marca en el símbolo de pesos */}
                  <div className="h-3 w-2 bg-orange-100/50 rounded-sm" />
                  <div className="h-6 bg-gray-200 rounded-lg w-16" />
                </div>
              </td>

              {/* Celda Estado (Círculo + Texto) */}
              <td className="px-8 py-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-200" />
                  <div className="h-3 bg-gray-100 rounded w-12" />
                </div>
              </td>

              {/* Celda Acciones (Espejo de los botones Editar/Eliminar) */}
              <td className="px-8 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <div className="h-9 w-9 bg-gray-50 rounded-xl" />
                  <div className="h-9 w-9 bg-gray-50 rounded-xl" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTableSkeleton;
