import React, { useState } from 'react';
import BaseModal from '../ui/BaseModal';
import type { EmployeeFormData, EmployeeRole, Gender } from '../../types/employees/types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EmployeeFormData) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    paternalLastName: '',
    maternalLastName: '',
    role: 'mesero',
    gender: undefined,
    username: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  const handleChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }
    if (!formData.paternalLastName.trim()) {
      newErrors.paternalLastName = 'El apellido paterno es obligatorio';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = 'Ingrese un correo electrónico válido';
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
      firstName: '',
      paternalLastName: '',
      maternalLastName: '',
      role: 'mesero',
      gender: undefined,
      username: '',
      phone: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Nuevo empleado">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primera fila: Nombre y Apellido Paterno */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese el nombre"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="paternalLastName" className="block text-sm font-semibold text-gray-700 mb-2">
              Apellido paterno <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="paternalLastName"
              value={formData.paternalLastName}
              onChange={(e) => handleChange('paternalLastName', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.paternalLastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese el apellido paterno"
            />
            {errors.paternalLastName && (
              <p className="mt-1 text-sm text-red-500">{errors.paternalLastName}</p>
            )}
          </div>
        </div>

        {/* Segunda fila: Apellido Materno y Puesto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="maternalLastName" className="block text-sm font-semibold text-gray-700 mb-2">
              Apellido materno
            </label>
            <input
              type="text"
              id="maternalLastName"
              value={formData.maternalLastName || ''}
              onChange={(e) => handleChange('maternalLastName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ingrese el apellido materno (opcional)"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
              Puesto <span className="text-red-500">*</span>
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

        {/* Tercera fila: Género y Nombre de usuario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
              Género
            </label>
            <select
              id="gender"
              value={formData.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value as Gender)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Seleccione un género</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese el correo electrónico"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>
        </div>

        {/* Cuarta fila: Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ingrese el teléfono (opcional)"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
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
      </form>
    </BaseModal>
  );
};

export default AddEmployeeModal;

