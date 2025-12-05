import React from 'react';

const ProductTableSkeleton: React.FC = () => {
  const rows = Array.from({ length: 8 });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Imagen
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Precio
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((_, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              {/* Imagen */}
              <td className="px-4 py-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              </td>

              {/* Nombre */}
              <td className="px-4 py-3">
                <div className="max-w-xs">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </td>

              {/* Categoría */}
              <td className="px-4 py-3">
                <div className="h-5 bg-gray-200 rounded-full w-20" />
              </td>

              {/* Precio */}
              <td className="px-4 py-3 text-right">
                <div className="h-4 bg-gray-200 rounded w-16 ml-auto" />
              </td>

              {/* Estado */}
              <td className="px-4 py-3">
                <div className="h-5 bg-gray-200 rounded-full w-16 mx-auto" />
              </td>

              {/* Acciones */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
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
