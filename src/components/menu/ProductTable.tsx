import React from "react";
import { Edit3, Trash2, ImageIcon, Tag } from "lucide-react";
import type { Product } from "../../types/menu";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  return (
    // ✅ Cambiamos w-full por max-w-full y aseguramos overflow-hidden en el nivel superior
    <div className="max-w-full bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar w-full">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Platillo / Producto
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Categoría
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Precio (MXN)
              </th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Estado
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-orange-50/30 transition-all group"
              >
                {/* Info Principal + Imagen */}
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-gray-50 bg-gray-100 shadow-inner shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-gray-900 text-sm uppercase tracking-tight truncate">
                        {product.name}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium line-clamp-1 italic">
                        {product.description || "Sin descripción detallada"}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Categoría con Badge Sutil */}
                <td className="px-8 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Tag size={14} className="text-[#FF8108] opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {product.categoryName || "General"}
                    </span>
                  </div>
                </td>

                {/* Precio con Estilo Industrial */}
                <td className="px-8 py-4 text-right whitespace-nowrap">
                  <span className="text-lg font-black text-gray-900 tabular-nums">
                    <span className="text-xs text-[#FF8108] mr-1">$</span>
                    {product.price.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </td>

                {/* Estado con Indicador Visual */}
                <td className="px-8 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        product.status === "activo"
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        product.status === "activo"
                          ? "text-emerald-700"
                          : "text-gray-400"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                </td>

                {/* Acciones que aparecen al hacer Hover */}
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-gray-400 hover:text-[#FF8108] hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-orange-100 transition-all active:scale-90"
                      title="Editar platillo"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all active:scale-90"
                      title="Eliminar platillo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
