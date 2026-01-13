import React, { useMemo } from "react";
import { Utensils, GlassWater, LayoutGrid, Tag } from "lucide-react";
import type { Category, Product } from "../../types/menu";

interface ProductFiltersProps {
  categories: Category[];
  products: Product[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  products,
  selectedCategoryId,
  onCategoryChange,
}) => {
  const visibleCategories = useMemo(() => {
    const parentNames = new Set(
      categories.map((c) => c.parentName).filter(Boolean)
    );

    const leafCategories = categories.filter(
      (cat) => !parentNames.has(cat.name)
    );

    return leafCategories.sort((a, b) => {
      if (String(a.id) === "3") return -1;
      if (String(b.id) === "3") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

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

        {/* BOTONES SIGUIENTES: CATEGORÍAS (Iniciando con "Sin categoría") */}
        {visibleCategories.map((category) => {
          const isActive = selectedCategoryId === category.id;
          const count = counts[category.id] || 0;
          const isUncategorized = String(category.id) === "3";

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`group relative flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                isActive
                  ? "bg-[#FF8108] text-white shadow-xl shadow-orange-200 -translate-y-1"
                  : isUncategorized
                  ? "bg-orange-50/50 text-[#FF8108] border border-orange-100 hover:bg-orange-100" // Estilo sutil para diferenciarla
                  : "bg-white text-gray-400 border border-gray-100 hover:border-orange-200 hover:text-[#FF8108]"
              }`}
            >
              {/* Icono dinámico: Tag para Sin Categoría, Glass para Bebidas, Utensils para el resto */}
              {isUncategorized ? (
                <Tag size={16} />
              ) : category.type === "Bebidas" ? (
                <GlassWater size={16} />
              ) : (
                <Utensils size={16} />
              )}

              <span>{category.name}</span>

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
