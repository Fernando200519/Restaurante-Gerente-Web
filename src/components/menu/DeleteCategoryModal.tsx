import React, { useState } from "react";
import BaseModal from "../ui/BaseModal";
import type { Category } from "../../types/menu";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  productsCount: number;
  categories: Category[]; // Todas las categorías para el selector
  onDeleteWithoutCategory: () => void;
  onDeleteWithProducts: () => void;
  onMoveProductsToExisting: (targetCategoryId: string) => void; // Opción A: mover a existente
  onMoveProductsToNew: (newCategoryName: string) => void; // Opción B: crear nueva y mover
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

  if (!category) return null;

  // Filtrar categorías disponibles (excluir la que se va a eliminar)
  const availableCategories = categories.filter(
    (cat) => cat.id !== category.id
  );

  const handleConfirm = () => {
    if (selectedOption === "no-category") {
      onDeleteWithoutCategory();
    } else if (selectedOption === "delete-all") {
      onDeleteWithProducts();
    } else if (selectedOption === "move") {
      if (moveSubOption === "existing" && targetCategoryId) {
        onMoveProductsToExisting(targetCategoryId);
      } else if (moveSubOption === "new" && newCategoryName.trim()) {
        onMoveProductsToNew(newCategoryName.trim());
      }
    }
    // Reset state
    setSelectedOption("no-category");
    setMoveSubOption("existing");
    setTargetCategoryId("");
    setNewCategoryName("");
    onClose();
  };

  const isConfirmDisabled = () => {
    if (selectedOption === "move") {
      if (moveSubOption === "existing") {
        return !targetCategoryId;
      } else {
        return !newCategoryName.trim();
      }
    }
    return false;
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Eliminar categoría">
      <div className="space-y-6">
        <p className="text-gray-700 text-lg">
          Esta categoría tiene {productsCount} producto(s).
        </p>

        {/* Opción 1: Sin categoría */}
        <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="deleteOption"
            value="no-category"
            checked={selectedOption === "no-category"}
            onChange={() => setSelectedOption("no-category")}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-800">
              Eliminar solo la categoría pero dejar sus productos como "Sin
              categoría"
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Los productos permanecerán en el sistema sin categoría asignada
              para poder moverlos a otra categoría en el futuro.
            </div>
          </div>
        </label>

        {/* Opción 2: Eliminar todo */}
        <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="deleteOption"
            value="delete-all"
            checked={selectedOption === "delete-all"}
            onChange={() => setSelectedOption("delete-all")}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-800">
              Eliminar la categoría y todos sus productos
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Se eliminarán permanentemente la categoría y todos sus productos
              (activos e inactivos).
            </div>
          </div>
        </label>

        {/* Opción 3: Mover productos */}
        <div
          className={`p-4 border rounded-lg transition-colors ${
            selectedOption === "move"
              ? "border-orange-400 bg-orange-50/50"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="deleteOption"
              value="move"
              checked={selectedOption === "move"}
              onChange={() => setSelectedOption("move")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-800">
                Eliminar la categoría pero mover sus productos a otra categoría
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Los productos se moverán a la categoría seleccionada antes de
                eliminar esta.
              </div>
            </div>
          </label>

          {/* Sub-opciones solo si "move" está seleccionado */}
          {selectedOption === "move" && (
            <div className="mt-4 ml-7 space-y-4">
              {/* Sub-opción A: Categoría existente */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="moveSubOption"
                  value="existing"
                  checked={moveSubOption === "existing"}
                  onChange={() => setMoveSubOption("existing")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-700">
                    Mover a una categoría existente
                  </div>
                  {moveSubOption === "existing" && (
                    <select
                      value={targetCategoryId}
                      onChange={(e) => setTargetCategoryId(e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Seleccionar categoría...</option>
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}{" "}
                          {cat.status === "inactivo" ? "(Inactiva)" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>

              {/* Sub-opción B: Nueva categoría */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="moveSubOption"
                  value="new"
                  checked={moveSubOption === "new"}
                  onChange={() => setMoveSubOption("new")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-700">
                    Crear una nueva categoría
                  </div>
                  {moveSubOption === "new" && (
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nombre de la nueva categoría"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  )}
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2 text-white font-semibold rounded-lg transition-colors bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isConfirmDisabled()}
          >
            Confirmar
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default DeleteCategoryModal;
