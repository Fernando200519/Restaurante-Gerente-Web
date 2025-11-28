import React, { useState, useEffect } from 'react';
import BaseModal from '../ui/BaseModal';
import ConfirmModal from '../ui/ConfirmModal';
import type { Employee, EmployeeRole, Gender } from '../../types/employees/types';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (employeeId: string, data: { role: EmployeeRole; username: string; phone: string }) => void;
  onDelete: (employeeId: string) => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, employee, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    role: 'mesero' as EmployeeRole,
    username: '',
    phone: '',
  });

  const [errors, setErrors] = useState<{ username?: string; phone?: string }>({});
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Cargar datos del empleado cuando se abre el modal
  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        role: employee.role,
        username: employee.username,
        phone: employee.phone,
      });
      setIsEditingEmail(false);
      setIsEditingPhone(false);
      setErrors({});
    }
  }, [employee, isOpen]);

  if (!employee) return null;

  // Parsear el nombre completo para mostrar apellidos
  const parseName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return {
        firstName: parts[0],
        paternalLastName: parts[1],
        maternalLastName: parts.length > 2 ? parts.slice(2).join(' ') : undefined,
      };
    }
    return {
      firstName: fullName,
      paternalLastName: '',
      maternalLastName: undefined,
    };
  };

  const nameParts = parseName(employee.name);

  const handleChange = (field: 'role' | 'username' | 'phone', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { username?: string; phone?: string } = {};

    if (isEditingEmail) {
      if (!formData.username.trim()) {
        newErrors.username = 'El correo electrónico es obligatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
        newErrors.username = 'Ingrese un correo electrónico válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(employee.id, {
        role: formData.role,
        username: formData.username,
        phone: formData.phone,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      role: 'mesero',
      username: '',
      phone: '',
    });
    setIsEditingEmail(false);
    setIsEditingPhone(false);
    setErrors({});
    onClose();
  };

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(employee.id);
    handleClose();
  };

  const getGenderLabel = (gender?: Gender): string => {
    if (!gender) return 'N/A';
    const genderMap: Record<Gender, string> = {
      masculino: 'Masculino',
      femenino: 'Femenino',
      otro: 'Otro',
    };
    return genderMap[gender] || gender;
  };

  const getRoleLabel = (role: EmployeeRole) => {
    const roleMap: Record<EmployeeRole, string> = {
      mesero: 'Mesero',
      cocinero: 'Cocinero',
      cajero: 'Cajero',
    };
    return roleMap[role] || role;
  };

  return (
    <>
      <BaseModal isOpen={isOpen} onClose={handleClose} title="Detalle empleado">
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de solo lectura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre
            </label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
              {nameParts.firstName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Apellido paterno
            </label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
              {nameParts.paternalLastName || 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Apellido materno
            </label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
              {nameParts.maternalLastName || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Género
            </label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
              {getGenderLabel(employee.gender)}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
            Correo electrónico
          </label>
          <div className="flex items-center gap-2">
            {isEditingEmail ? (
              <>
                <input
                  type="email"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese el correo electrónico"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingEmail(false);
                    setFormData((prev) => ({ ...prev, username: employee.username }));
                    setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Cancelar edición"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {formData.username || 'N/A'}
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="p-2 text-gray-500 hover:text-primary transition-colors"
                  aria-label="Editar correo electrónico"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
          )}
        </div>

        {/* Campos editables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
              Puesto
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value as EmployeeRole)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="mesero">Mesero</option>
              <option value="cocinero">Cocinero</option>
              <option value="cajero">Cajero</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Teléfono
          </label>
          <div className="flex items-center gap-2">
            {isEditingPhone ? (
              <>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ingrese el teléfono"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPhone(false);
                    setFormData((prev) => ({ ...prev, phone: employee.phone }));
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Cancelar edición"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {formData.phone || 'N/A'}
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(true)}
                  className="p-2 text-gray-500 hover:text-primary transition-colors"
                  aria-label="Editar teléfono"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Eliminar
          </button>
          <div className="flex gap-4">
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
              Guardar
            </button>
          </div>
        </div>
        </form>
      </BaseModal>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message={`¿Está seguro de que desea eliminar a ${employee.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColor="red"
      />
    </>
  );
};

export default EditEmployeeModal;

