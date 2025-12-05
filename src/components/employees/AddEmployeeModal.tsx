import React, { useState } from "react";
import BaseModal from "../ui/BaseModal";
import type { EmployeeFormData, EmployeeRole, Gender } from "../../types/types";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EmployeeFormData) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    paternalLastName: "",
    maternalLastName: "",
    role: "mesero",
    gender: undefined,
    username: "",
    phone: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof EmployeeFormData, string>>
  >({});

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
      newErrors.firstName = "El nombre es obligatorio";
    }
    if (!formData.paternalLastName.trim()) {
      newErrors.paternalLastName = "El apellido paterno es obligatorio";
    }
    if (!formData.username.trim()) {
      newErrors.username = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = "Ingrese un correo electrónico válido";
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
      firstName: "",
      paternalLastName: "",
      maternalLastName: "",
      role: "mesero",
      gender: undefined,
      username: "",
      phone: "",
    });
    setErrors({});
    onClose();
  };

  // --- CLASES REUTILIZABLES (ESTILO UNIFICADO) ---
  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2 border rounded-lg transition-all outline-none text-gray-700 ${
      hasError
        ? "border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-gray-300 focus:border-[#FA9623] focus:ring-2 focus:ring-[#FA9623]/20"
    }`;

  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Nuevo empleado">
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {/* Primera fila: Nombre y Apellido Paterno */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className={inputClass(!!errors.firstName)}
              placeholder="Ej. Juan"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="paternalLastName" className={labelClass}>
              Apellido paterno <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="paternalLastName"
              value={formData.paternalLastName}
              onChange={(e) => handleChange("paternalLastName", e.target.value)}
              className={inputClass(!!errors.paternalLastName)}
              placeholder="Ej. Pérez"
            />
            {errors.paternalLastName && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.paternalLastName}
              </p>
            )}
          </div>
        </div>

        {/* Segunda fila: Apellido Materno y Puesto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="maternalLastName" className={labelClass}>
              Apellido materno
            </label>
            <input
              type="text"
              id="maternalLastName"
              value={formData.maternalLastName}
              onChange={(e) => handleChange("maternalLastName", e.target.value)}
              className={inputClass(false)}
              placeholder="Opcional"
            />
          </div>

          <div>
            <label htmlFor="role" className={labelClass}>
              Puesto <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className={inputClass(!!errors.role)}
            >
              <option value="mesero">Mesero</option>
              <option value="cocinero">Cocinero</option>
              <option value="cajero">Cajero</option>
            </select>
          </div>
        </div>

        {/* Tercera fila: Género y Usuario (Email) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="gender" className={labelClass}>
              Género
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className={inputClass(false)}
            >
              <option value="">Seleccionar...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="username" className={labelClass}>
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className={inputClass(!!errors.username)}
              placeholder="correo@ejemplo.com"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.username}
              </p>
            )}
          </div>
        </div>

        {/* Cuarta fila: Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="phone" className={labelClass}>
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={inputClass(false)}
              placeholder="10 dígitos (Opcional)"
            />
          </div>
        </div>

        {/* Footer de Botones */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#FA9623] hover:bg-[#e68a1f] text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Guardar
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddEmployeeModal;
