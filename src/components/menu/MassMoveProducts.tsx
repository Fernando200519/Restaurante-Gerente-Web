import React, { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRightLeft, ChevronDown, Check } from "lucide-react";
import BaseModal from "../ui/BaseModal";
import type { Category } from "../../types/menu";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onConfirm: (targetId: string) => void;
  loading: boolean;
}

const MassMoveProductsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categories,
  onConfirm,
  loading,
}) => {
  const [targetId, setTargetId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const validDestinations = categories.filter((c) => String(c.id) !== "3");

  // 🎯 LÓGICA DE FILTRADO: Solo categorías que NO son padres
  const organizedOptions = useMemo(() => {
    // 1. Identificamos qué IDs están siendo usados como parentId por otras categorías
    const parentIds = new Set(
      categories.map((c) => c.parentId).filter(Boolean)
    );

    const result: (Category & { parentName?: string })[] = [];
    const list = categories.filter((c) => String(c.id) !== "3");

    // 2. Buscamos las hojas de forma recursiva para mantener el orden lógico
    const flatten = (parentId: string | null) => {
      list
        .filter((c) => (c.parentId || null) === parentId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((cat) => {
          // 🎯 Solo es una "hoja" si su ID no aparece en el Set de parentIds
          const isLeaf = !parentIds.has(cat.id);

          if (isLeaf) {
            // Obtenemos el nombre del padre para dar contexto en la lista plana
            const parent = categories.find((p) => p.id === cat.parentId);
            result.push({ ...cat, parentName: parent?.name });
          }

          flatten(cat.id);
        });
    };

    flatten(null);
    return result;
  }, [categories]);

  const handleConfirm = () => {
    if (targetId) onConfirm(targetId);
  };

  const selectedCategoryName = categories.find((c) => c.id === targetId)?.name;

  const getDropdownStyle = (): React.CSSProperties => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      position: "fixed",
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999,
    };
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Clasificar Inventario Huérfano"
    >
      {/* 🎯 Añadimos pb-20 para dar espacio al dropdown absoluto y evitar el recorte */}
      <div className="space-y-6 pb-24">
        <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-6 flex gap-4 items-center">
          <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-500">
            <ArrowRightLeft size={24} strokeWidth={2.5} />
          </div>
          <p className="text-sm font-bold text-blue-800/80 leading-tight">
            Selecciona el destino para{" "}
            <span className="font-black text-blue-900">reubicar</span> todo el
            inventario sin clasificar.
          </p>
        </div>

        <div className="relative group">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block ml-1">
            Categoría de Destino
          </label>

          {/* Botón Trigger con Ref */}
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full px-6 py-4 border-2 rounded-2xl flex justify-between items-center transition-all bg-gray-50 cursor-pointer
              ${
                isDropdownOpen
                  ? "border-[#FF8108] bg-white ring-4 ring-orange-50"
                  : "border-transparent hover:border-gray-200"
              }`}
          >
            <span
              className={`font-bold ${
                targetId ? "text-gray-800" : "text-gray-400"
              }`}
            >
              {selectedCategoryName || "Seleccionar..."}
            </span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180 text-[#FF8108]" : ""
              }`}
            />
          </button>

          {/* 📋 LISTA DESPLEGABLE USANDO PORTAL */}
          {isDropdownOpen &&
            createPortal(
              <>
                {/* Capa invisible para cerrar al hacer clic fuera */}
                <div
                  className="fixed inset-0 z-9998"
                  onClick={() => setIsDropdownOpen(false)}
                />

                <div
                  style={getDropdownStyle()}
                  className="bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                >
                  <ul className="max-h-72 overflow-y-auto custom-scrollbar p-3">
                    {organizedOptions.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => {
                            setTargetId(cat.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all flex flex-col group mb-1
                          ${
                            targetId === cat.id
                              ? "bg-orange-50 text-[#FF8108]"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold truncate">
                              {cat.name}
                            </span>
                            {targetId === cat.id && (
                              <Check
                                size={16}
                                strokeWidth={4}
                                className="text-[#FF8108]"
                              />
                            )}
                          </div>
                          {cat.parentName && (
                            <span className="text-[9px] opacity-40 uppercase tracking-tighter font-black">
                              Subcategoría de {cat.parentName}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>,
              document.body // Se inyecta en la raíz del documento para no ser cortado
            )}
        </div>

        {/* ⚡ ACCIONES FINALES EN EL FOOTER DEL MODAL */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!targetId || loading}
            className="px-10 py-3.5 bg-[#FF8108] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-100 disabled:opacity-50 active:scale-95 transition-all hover:scale-105"
          >
            {loading ? "Procesando..." : "Confirmar Movimiento"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default MassMoveProductsModal;
