import React from "react";
import {
  Edit3,
  Trash2,
  Tag,
  ListPlus,
  Leaf,
  Image as ImageIcon,
  DollarSign,
} from "lucide-react";
import type { Product } from "../../types/menu";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const hasImage = Boolean(product.imageUrl);

  return (
    <div className="group bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 overflow-hidden flex flex-col h-full">
      {/* 🖼️ SECCIÓN: IMAGEN Y ESTADO */}
      <div className="relative aspect-4/3 bg-gray-100 overflow-hidden border-b border-gray-50">
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <ImageIcon size={48} strokeWidth={1} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Sin Imagen
            </span>
          </div>
        )}

        {/* Badge de estado Industrial */}
        <div className="absolute top-4 right-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg border ${
              product.status === "activo"
                ? "bg-emerald-500/90 border-emerald-400/50 text-white"
                : "bg-gray-700/90 border-gray-600/50 text-white"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full bg-white ${
                product.status === "activo" ? "animate-pulse" : ""
              }`}
            />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {product.status}
            </span>
          </div>
        </div>
      </div>

      {/* 📝 SECCIÓN: INFORMACIÓN PRINCIPAL */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-[#FF8108] mb-2">
          <Tag size={12} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {product.categoryName || "General"}
          </span>
        </div>

        <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 capitalize group-hover:text-[#FF8108] transition-colors">
          {product.name}
        </h3>

        <p className="text-xs text-gray-400 font-medium line-clamp-2 mb-4 leading-relaxed italic">
          {product.description ||
            "Este platillo no cuenta con una descripción detallada todavía."}
        </p>

        {/* Precio Industrial */}
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-xs font-black text-[#FF8108]">$</span>
          <span className="text-3xl font-black text-gray-900 tracking-tighter tabular-nums">
            {product.price.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* 🛠️ EXTRAS Y COMPLEMENTOS */}
        <div className="space-y-4 pt-5 border-t border-gray-50 mt-auto">
          {/* Complementos */}
          {product.complementos && product.complementos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <ListPlus size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Adicionales
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.complementos.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-orange-50 text-[#FF8108] text-[9px] font-black rounded-lg border border-orange-100 uppercase tracking-tighter"
                  >
                    +{c.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredientes Opcionales */}
          {product.ingredientes && product.ingredientes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Leaf size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Preferencias
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.ingredientes.map((ing, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[9px] font-bold rounded-lg border border-gray-100 uppercase tracking-tighter"
                  >
                    {ing.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ⚡ FOOTER: ACCIONES RÁPIDAS */}
      <div className="flex border-t border-gray-50 bg-gray-50/30 p-2 gap-2">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-orange-50 text-gray-600 hover:text-[#FF8108] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-gray-100 shadow-sm active:scale-95 cursor-pointer"
        >
          <Edit3 size={14} strokeWidth={3} />
          Editar
        </button>

        <button
          onClick={() => onDelete(product.id)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-gray-100 shadow-sm active:scale-95 cursor-pointer"
        >
          <Trash2 size={14} strokeWidth={3} />
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
