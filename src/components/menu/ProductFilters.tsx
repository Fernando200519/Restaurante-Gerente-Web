import React, { useMemo } from "react";
import { Utensils, GlassWater, LayoutGrid } from "lucide-react";
import type { Category, Product } from "../../types/menu"; //

interface ProductFiltersProps {
  categories: Category[];
  products: Product[]; // 🆕 Recibimos la lista completa de productos
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  products,
  selectedCategoryId,
  onCategoryChange,
}) => {
  // 1. Identificamos categorías hoja (sin hijos)
  const visibleCategories = useMemo(() => {
    const parentNames = new Set(
      categories.map((c) => c.parentName).filter(Boolean)
    );
    return categories.filter((cat) => !parentNames.has(cat.name));
  }, [categories]);

  // 🎯 2. Calculamos los contadores por ID de categoría
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    });
    return map;
  }, [products]);

  return (
    <div className="relative w-full max-w-full">
      <div className="flex items-center gap-3 overflow-x-auto py-4 no-scrollbar scroll-smooth w-full translate-z-0">
        {/* BOTÓN TODOS */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`group relative flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
            selectedCategoryId === null
              ? "bg-[#FF8108] text-white shadow-xl shadow-orange-200 -translate-y-1"
              : "bg-white text-gray-400 border border-gray-100 hover:border-orange-200 hover:text-[#FF8108]"
          }`}
        >
          <LayoutGrid size={16} strokeWidth={3} />
          <span>Todos</span>
          {/* BADGE GLOBAL */}
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-lg text-[9px] font-black ${
              selectedCategoryId === null
                ? "bg-white/20 text-white"
                : "bg-gray-100 text-gray-400 group-hover:bg-orange-50 group-hover:text-[#FF8108]"
            }`}
          >
            {products.length}
          </span>
        </button>

        {/* CATEGORÍAS INDIVIDUALES */}
        {visibleCategories.map((category) => {
          const isActive = selectedCategoryId === category.id;
          const count = counts[category.id] || 0; //

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`group relative flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                isActive
                  ? "bg-[#FF8108] text-white shadow-xl shadow-orange-200 -translate-y-1"
                  : "bg-white text-gray-400 border border-gray-100 hover:border-orange-200 hover:text-[#FF8108]"
              }`}
            >
              {category.type === "Bebidas" ? (
                <GlassWater size={16} />
              ) : (
                <Utensils size={16} />
              )}
              <span>{category.name}</span>

              {/* ✅ BADGE DE CONTEO */}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-lg text-[9px] font-black transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-400 group-hover:bg-orange-50 group-hover:text-[#FF8108]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default ProductFilters;
