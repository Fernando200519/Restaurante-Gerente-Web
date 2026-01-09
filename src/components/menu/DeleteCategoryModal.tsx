import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Trash2,
  MoveRight,
  FileQuestion,
  PlusCircle,
  FolderTree,
  Info, // ✅ Nuevo icono para la nota informativa
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
    onClose();
  };

  const isConfirmDisabled = () => {
    if (selectedOption === "move") {
      return moveSubOption === "existing"
        ? !targetCategoryId
        : !newCategoryName.trim();
    }
    return false;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Eliminar Categoría"
    >
      <div className="space-y-6">
        {/* Alerta inicial */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <div>
            <h4 className="text-amber-900 font-bold text-sm">
              Atención necesaria
            </h4>
            <p className="text-amber-700 text-xs mt-1">
              Estás por eliminar <b>"{category.name}"</b> con{" "}
              <b>{productsCount} producto(s)</b>.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Opción 1: Dejar huérfanos */}
          <button
            onClick={() => setSelectedOption("no-category")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              selectedOption === "no-category"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                selectedOption === "no-category"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <FileQuestion size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 text-sm">
                Desvincular productos
              </div>
              <p className="text-gray-500 text-xs mt-0.5">
                Quedarán marcados como "Sin categoría".
              </p>
            </div>
          </button>

          {/* Opción 2: Mover productos (Con Restricción de Nivel) */}
          <div
            className={`rounded-xl border-2 transition-all overflow-hidden ${
              selectedOption === "move"
                ? "border-orange-500 bg-orange-50/30"
                : "border-gray-100"
            }`}
          >
            <button
              onClick={() => setSelectedOption("move")}
              className="w-full flex items-start gap-4 p-4 text-left"
            >
              <div
                className={`p-2 rounded-lg ${
                  selectedOption === "move"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <MoveRight size={20} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-sm">
                  Migrar a otra categoría
                </div>
                <p className="text-gray-500 text-xs mt-0.5">
                  Mueve los productos a una categoría del mismo nivel.
                </p>
              </div>
            </button>

            {selectedOption === "move" && (
              <div className="px-4 pb-4 ml-14 space-y-4 animate-in slide-in-from-top-2">
                {/* ℹ️ NOTA INFORMATIVA */}
                <div className="flex items-center gap-2 text-[10px] text-orange-600 bg-orange-100/50 p-2 rounded-lg">
                  <Info size={14} />
                  <span>
                    Solo puedes migrar productos entre categorías del mismo
                    nivel.
                  </span>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600">
                    <input
                      type="radio"
                      checked={moveSubOption === "existing"}
                      onChange={() => setMoveSubOption("existing")}
                      className="text-orange-500"
                    />
                    Existente
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600">
                    <input
                      type="radio"
                      checked={moveSubOption === "new"}
                      onChange={() => setMoveSubOption("new")}
                      className="text-orange-500"
                    />
                    Nueva
                  </label>
                </div>

                {moveSubOption === "existing" ? (
                  <div className="relative">
                    <FolderTree
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <select
                      value={targetCategoryId}
                      onChange={(e) => setTargetCategoryId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-400/20"
                    >
                      {availableCategories.length > 0 ? (
                        <>
                          <option value="">Selecciona destino...</option>
                          {availableCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </>
                      ) : (
                        <option value="">
                          No hay categorías hermanas disponibles
                        </option>
                      )}
                    </select>
                  </div>
                ) : (
                  <div className="relative">
                    <PlusCircle
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nombre de la nueva categoría"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-400/20"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opción 3: Borrado total */}
          <button
            onClick={() => setSelectedOption("delete-all")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              selectedOption === "delete-all"
                ? "border-red-500 bg-red-50"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                selectedOption === "delete-all"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Trash2 size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-700 text-sm">
                Borrado total
              </div>
              <p className="text-red-400 text-xs mt-0.5">
                Eliminará permanentemente la categoría y sus {productsCount}{" "}
                productos.
              </p>
            </div>
          </button>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={resetAndClose}
            className="px-6 py-2 text-gray-500 font-bold text-sm hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              isConfirmDisabled() ||
              (moveSubOption === "existing" &&
                availableCategories.length === 0 &&
                selectedOption === "move")
            }
            className="px-8 py-2 bg-[#FF8108] hover:bg-[#FF8108]/90 text-white font-bold text-sm rounded-xl shadow-lg disabled:bg-gray-200 disabled:shadow-none transition-all active:scale-95"
          >
            Confirmar Acción
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default DeleteCategoryModal;
