import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      {/* Imagen placeholder */}
      <div className="aspect-video bg-gray-200" />

      {/* Contenido */}
      <div className="p-5">
        {/* Título */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        {/* Descripción */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
        {/* Precio */}
        <div className="h-7 bg-gray-200 rounded w-1/3" />
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
