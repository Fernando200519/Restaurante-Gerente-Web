import React, { useState } from 'react';
import BaseModal from '../ui/BaseModal';
import type { Category } from '../../types/menu/types';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  productsCount: number;
  onDeleteWithoutCategory: () => void;
  onDeleteWithProducts: () => void;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  productsCount,
  onDeleteWithoutCategory,
  onDeleteWithProducts,
}) => {
  if (!category) return null;

  const [selectedOption, setSelectedOption] = useState<'no-category' | 'delete-all' | 'move'>('no-category');

  const handleConfirm = () => {
    if (selectedOption === 'no-category') {
      onDeleteWithoutCategory();
    } else if (selectedOption === 'delete-all') {
      onDeleteWithProducts();
    }
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Eliminar categoría">
      <div className="space-y-6">
        <p className="text-gray-700 text-lg">
          Esta categoría tiene {productsCount} producto(s).
        </p>

        <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg">
          <input
            type="radio"
            name="deleteOption"
            value="no-category"
            checked={selectedOption === 'no-category'}
            onChange={() => setSelectedOption('no-category')}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-800">Eliminar solo la categoría pero dejar sus productos como "Sin categoría"</div>
            <div className="text-sm text-gray-600 mt-1">
              Los productos permanecerán en el sistema sin categoría asignada para poder moverlos a otra categoría en el futuro.
            </div>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="deleteOption"
            value="delete-all"
            checked={selectedOption === 'delete-all'}
            onChange={() => setSelectedOption('delete-all')}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-800">Eliminar la categoría y todos sus productos</div>
            <div className="text-sm text-gray-600 mt-1">Se eliminarán permanentemente la categoría y todos sus productos (activos e inactivos).</div>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg opacity-60 cursor-not-allowed">
          <input
            type="radio"
            name="deleteOption"
            value="move"
            disabled
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-700">Eliminar la categoría pero mover sus productos a otra categoría</div>
            <div className="text-sm text-gray-500 mt-1">No disponible: requiere endpoint para mover productos.</div>
          </div>
        </label>

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
            className="px-6 py-2 text-white font-semibold rounded-lg transition-colors bg-red-600 hover:bg-red-700"
            disabled={selectedOption === 'move'}
          >
            Confirmar
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default DeleteCategoryModal;

