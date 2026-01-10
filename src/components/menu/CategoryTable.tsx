import React, { useMemo } from "react";
import { Edit3, Trash2, ChevronRight, FolderTree } from "lucide-react";
import type { Category } from "../../types/menu";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  onEdit,
  onDelete,
}) => {
  const organizedCategories = useMemo(() => {
    const result: (Category & { depth: number; hasChildren: boolean })[] = [];
    const addedIds = new Set<string>();

    const childrenMap = new Map<string | null, Category[]>();
    categories.forEach((cat) => {
      const key = cat.parentId || null;
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)?.push(cat);
    });

    const flatten = (parentId: string | null, depth: number) => {
      const children = childrenMap.get(parentId) || [];
      children
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((child) => {
          if (addedIds.has(child.id)) return;

          const subChildren = childrenMap.get(child.id) || [];
          result.push({ ...child, depth, hasChildren: subChildren.length > 0 });
          addedIds.add(child.id);
          flatten(child.id, depth + 1);
        });
    };

    flatten(null, 0);

    categories.forEach((c) => {
      if (!addedIds.has(c.id))
        result.push({ ...c, depth: 0, hasChildren: false });
    });

    return result;
  }, [categories]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Estructura de Menú
            </th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Tipo
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
          {organizedCategories.map((category) => (
            <tr
              key={category.id}
              className="hover:bg-orange-50/30 transition-all group"
            >
              <td className="px-8 py-5 whitespace-nowrap">
                <div
                  className="flex items-center gap-3"
                  style={{ paddingLeft: `${category.depth * 1.5}rem` }}
                >
                  {category.depth > 0 ? (
                    <ChevronRight
                      size={14}
                      className="text-orange-400 opacity-50"
                    />
                  ) : (
                    <FolderTree size={18} className="text-[#FF8108]" />
                  )}
                  <span
                    className={`text-sm ${
                      category.hasChildren
                        ? "font-black text-gray-900"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {category.name}
                  </span>
                </div>
              </td>
              <td className="px-8 py-5">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase ${
                    category.type === "Alimentos"
                      ? "text-orange-600 bg-orange-50 border-orange-100"
                      : category.type === "Bebidas"
                      ? "text-blue-600 bg-blue-50 border-blue-100"
                      : "text-gray-500 bg-gray-50 border-gray-100"
                  }`}
                >
                  {category.type ? category.type.replace(/s$/, "") : "General"}
                </span>
              </td>
              <td className="px-8 py-5 text-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full mx-auto ${
                    category.status === "activo"
                      ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "bg-gray-300"
                  }`}
                />
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={() => onEdit(category)}
                    className="p-2.5 text-gray-400 hover:text-[#FF8108] hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-orange-100 transition-all cursor-pointer"
                  >
                    <Edit3 size={16} strokeWidth={2.5} />
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(category)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all cursor-pointer"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
