import React from "react";

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-pulse flex flex-col h-full">
      {/* 🖼️ Placeholder de Imagen (Aspecto 4/3) */}
      <div className="relative aspect-4/3 bg-gray-100 border-b border-gray-50">
        {/* Simulación del Badge de Estado en la esquina */}
        <div className="absolute top-4 right-4 h-6 w-16 bg-gray-200 rounded-full" />
      </div>

      {/* 📝 Cuerpo del Contenido */}
      <div className="p-6 flex-1 flex flex-col space-y-5">
        <div>
          {/* Simulación de Etiqueta de Categoría (Naranja sutil) */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3 w-3 rounded-sm bg-orange-100/50" />
            <div className="h-2.5 bg-gray-100 rounded-full w-24" />
          </div>

          {/* Título del Platillo */}
          <div className="h-6 bg-gray-200 rounded-lg w-5/6 mb-3" />

          {/* Descripción (Líneas finas) */}
          <div className="space-y-2">
            <div className="h-2.5 bg-gray-100 rounded w-full" />
            <div className="h-2.5 bg-gray-100 rounded w-4/5" />
          </div>
        </div>

        {/* Precio (Bloque prominente) */}
        <div className="flex items-baseline gap-1">
          <div className="h-3 w-2 bg-orange-100/50 rounded-sm" />
          <div className="h-8 bg-gray-200 rounded-xl w-28" />
        </div>

        {/* 🛠️ Secciones de Extras y Preferencias */}
        <div className="space-y-4 pt-5 border-t border-gray-50 mt-auto">
          {/* Bloque de Complementos */}
          <div className="space-y-2">
            <div className="h-2 w-16 bg-gray-100 rounded" />
            <div className="flex flex-wrap gap-1.5">
              <div className="h-5 w-14 bg-orange-50/50 rounded-lg" />
              <div className="h-5 w-20 bg-orange-50/50 rounded-lg" />
            </div>
          </div>

          {/* Bloque de Ingredientes */}
          <div className="space-y-2">
            <div className="h-2 w-20 bg-gray-100 rounded" />
            <div className="flex flex-wrap gap-1.5">
              <div className="h-5 w-16 bg-gray-50 rounded-lg" />
              <div className="h-5 w-12 bg-gray-50 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ Footer de Acciones (Botones duales) */}
      <div className="flex border-t border-gray-50 bg-gray-50/30 p-2 gap-2">
        <div className="flex-1 h-11 bg-white rounded-2xl border border-gray-100 shadow-sm" />
        <div className="flex-1 h-11 bg-white rounded-2xl border border-gray-100 shadow-sm" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
