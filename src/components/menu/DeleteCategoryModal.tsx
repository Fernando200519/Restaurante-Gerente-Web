import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Trash2,
  ArrowRightLeft,
  FileQuestion,
  Plus,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import BaseModal from "../ui/BaseModal";
import type { Category } from "../../types/menu";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  productsCount: number;
  categories: Category[];
  onDeleteWithoutCategory: () => void;
  onDeleteWithProducts: () => void;
  onMoveProductsToExisting: (targetCategoryId: string) => void;
  onMoveProductsToNew: (newCategoryName: string) => void;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  productsCount,
  categories,
  onDeleteWithoutCategory,
  onDeleteWithProducts,
  onMoveProductsToExisting,
  onMoveProductsToNew,
}) => {
  const [selectedOption, setSelectedOption] = useState<
    "no-category" | "delete-all" | "move"
  >("no-category");
  const [moveSubOption, setMoveSubOption] = useState<"existing" | "new">(
    "existing"
  );
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const availableCategories = useMemo(() => {
    if (!category) return [];
    return categories.filter(
      (cat) =>
        cat.id !== category.id &&
        cat.parentId === category.parentId &&
        cat.parentId !== undefined
    );
  }, [categories, category]);

  if (!category) return null;

  const handleConfirm = () => {
    if (selectedOption === "no-category") onDeleteWithoutCategory();
    else if (selectedOption === "delete-all") onDeleteWithProducts();
    else if (selectedOption === "move") {
      if (moveSubOption === "existing" && targetCategoryId)
        onMoveProductsToExisting(targetCategoryId);
      else if (moveSubOption === "new" && newCategoryName.trim())
        onMoveProductsToNew(newCategoryName.trim());
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedOption("no-category");
    setMoveSubOption("existing");
    setTargetCategoryId("");
    setNewCategoryName("");
    setIsDropdownOpen(false);
    onClose();
  };

  const cardBase =
    "w-full text-left p-5 rounded-[2rem] border-2 transition-all group flex items-start gap-4 cursor-pointer mb-3 relative overflow-hidden";
  const labelStyle =
    "text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] mb-2 block ml-1";
  const inputBase =
    "w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none transition-all font-bold text-sm text-gray-700 focus:bg-white focus:ring-4 focus:ring-orange-500/10 shadow-inner";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Gestionar Baja de Categoría"
    >
      <div className="space-y-6 pt-2">
        {/* 🚨 ENCABEZADO DE ADVERTENCIA */}
        <div className="bg-rose-50 border border-rose-100 rounded-4xl p-6 flex gap-4 items-center animate-in fade-in slide-in-from-top-2">
          <div className="bg-white p-3 rounded-2xl shadow-sm text-rose-500">
            <AlertTriangle size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-900">
              Atención Gerencial
            </h4>
            <p className="text-sm font-bold text-rose-800/80 leading-tight">
              Eliminarás{" "}
              <span className="text-rose-900 font-black">
                "{category.name}"
              </span>{" "}
              y afectarás a{" "}
              <span className="font-black text-rose-900">{productsCount}</span>{" "}
              productos.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* 🟦 OPCIÓN 1: DESVINCULAR */}
          <button
            onClick={() => setSelectedOption("no-category")}
            className={`${cardBase} ${
              selectedOption === "no-category"
                ? "border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100"
                : "border-gray-50 hover:border-gray-100 bg-white"
            }`}
          >
            <div
              className={`p-3 rounded-2xl transition-all ${
                selectedOption === "no-category"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <FileQuestion size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="font-black text-gray-900 text-xs uppercase tracking-tight">
                Desvincular productos
              </div>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                Los platillos quedarán sin clasificación asignada.
              </p>
            </div>
            {selectedOption === "no-category" && (
              <CheckCircle2
                size={18}
                className="text-blue-500 absolute top-4 right-4"
              />
            )}
          </button>

          {/* 🟧 OPCIÓN 2: MIGRAR (COMPLEJA) */}
          <div
            className={`rounded-[2.5rem] border-2 transition-all ${
              selectedOption === "move"
                ? "border-orange-500 bg-orange-50/30 shadow-lg shadow-orange-100"
                : "border-gray-50 bg-white"
            }`}
          >
            <button
              onClick={() => setSelectedOption("move")}
              className="w-full flex items-start gap-4 p-5 text-left relative"
            >
              <div
                className={`p-3 rounded-2xl transition-all ${
                  selectedOption === "move"
                    ? "bg-[#FF8108] text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <ArrowRightLeft size={20} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="font-black text-gray-900 text-xs uppercase tracking-tight">
                  Migrar a otra categoría
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                  Mueve el inventario a un nivel hermano o nuevo.
                </p>
              </div>
              {selectedOption === "move" && (
                <CheckCircle2
                  size={18}
                  className="text-[#FF8108] absolute top-4 right-4"
                />
              )}
            </button>

            {selectedOption === "move" && (
              <div className="px-6 pb-6 ml-12 space-y-5 animate-in slide-in-from-top-2 duration-300">
                <div className="flex gap-4 p-1 bg-gray-100 rounded-xl w-fit">
                  <button
                    onClick={() => setMoveSubOption("existing")}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      moveSubOption === "existing"
                        ? "bg-white text-[#FF8108] shadow-sm"
                        : "text-gray-400"
                    }`}
                  >
                    Existente
                  </button>
                  <button
                    onClick={() => setMoveSubOption("new")}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      moveSubOption === "new"
                        ? "bg-white text-[#FF8108] shadow-sm"
                        : "text-gray-400"
                    }`}
                  >
                    Nueva
                  </button>
                </div>

                {moveSubOption === "existing" ? (
                  <div className="relative group">
                    <label className={labelStyle}>Categoría Destino</label>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`${inputBase} flex items-center justify-between group-hover:border-orange-100`}
                    >
                      <span
                        className={
                          targetCategoryId ? "text-gray-700" : "text-gray-300"
                        }
                      >
                        {categories.find((c) => c.id === targetCategoryId)
                          ?.name || "Seleccionar destino..."}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform ${
                          isDropdownOpen ? "rotate-180 text-[#FF8108]" : ""
                        }`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                        <ul className="max-h-40 overflow-y-auto no-scrollbar py-2">
                          {availableCategories.length > 0 ? (
                            availableCategories.map((cat) => (
                              <li key={cat.id}>
                                <button
                                  onClick={() => {
                                    setTargetCategoryId(cat.id);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-5 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-[#FF8108] transition-all"
                                >
                                  {cat.name}
                                </button>
                              </li>
                            ))
                          ) : (
                            <li className="px-5 py-3 text-[10px] font-black text-gray-300 uppercase text-center italic">
                              Sin categorías hermanas
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="group">
                    <label className={labelStyle}>
                      Nombre de Categoría Nueva
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Ej. Platillos de Temporada"
                        className={`${inputBase} group-hover:border-orange-100`}
                        autoFocus
                      />
                      <Plus
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 🟥 OPCIÓN 3: BORRADO TOTAL */}
          <button
            onClick={() => setSelectedOption("delete-all")}
            className={`${cardBase} ${
              selectedOption === "delete-all"
                ? "border-rose-500 bg-rose-50/50 shadow-lg shadow-rose-100"
                : "border-gray-50 hover:border-gray-100 bg-white"
            }`}
          >
            <div
              className={`p-3 rounded-2xl transition-all ${
                selectedOption === "delete-all"
                  ? "bg-rose-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Trash2 size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="font-black text-rose-700 text-xs uppercase tracking-tight">
                Borrado total del sistema
              </div>
              <p className="text-[10px] font-bold text-rose-400 mt-0.5">
                Eliminarás la categoría y sus {productsCount} productos para
                siempre.
              </p>
            </div>
            {selectedOption === "delete-all" && (
              <CheckCircle2
                size={18}
                className="text-rose-500 absolute top-4 right-4"
              />
            )}
          </button>
        </div>

        {/* 🛠️ FOOTER ACCIONES */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 mt-2">
          <button
            onClick={resetAndClose}
            className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              selectedOption === "move" &&
              (moveSubOption === "existing"
                ? !targetCategoryId
                : !newCategoryName.trim())
            }
            className="px-10 py-3.5 bg-[#FF8108] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95 disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
          >
            Confirmar Operación
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default DeleteCategoryModal;
