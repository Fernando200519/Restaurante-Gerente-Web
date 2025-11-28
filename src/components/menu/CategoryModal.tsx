import React, { useState, useEffect } from 'react';
import BaseModal from '../ui/BaseModal';
import ConfirmModal from '../ui/ConfirmModal';
import type { Category, CategoryFormData, CategoryStatus } from '../../types/menu/types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (data: CategoryFormData) => void;
  onDelete?: (categoryId: string) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category, onSave, onDelete }) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    status: 'activo',
  });

  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name,
        description: category.description || '',
        status: category.status,
      });
      setErrors({});
    } else if (isOpen) {
      setFormData({
        name: '',
        description: '',
        status: 'activo',
      });
      setErrors({});
    }
  }, [category, isOpen]);

  const handleChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la categoría es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      status: 'activo',
    });
    setErrors({});
    setIsDeleteConfirmOpen(false);
    onClose();
  };

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (category && onDelete) {
      onDelete(category.id);
      handleClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={category ? 'Editar categoría' : 'Nueva categoría'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ingrese el nombre de la categoría"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Ingrese una descripción de la categoría (opcional)"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
            Estado
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as CategoryStatus)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className={`flex ${category && onDelete ? 'justify-between' : 'justify-end'} items-center gap-4 pt-4 border-t border-gray-200`}>
          {category && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Eliminar
            </button>
          )}
          <div className="flex gap-4 ml-auto">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: '#FF8108' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FA9623'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF8108'}
            >
              {category ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </div>
      </form>

      {/* Modal de confirmación para eliminar */}
      {category && onDelete && (
        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar eliminación"
          message={`¿Está seguro de que desea eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          confirmColor="red"
        />
      )}
    </BaseModal>
  );
};

export default CategoryModal;

