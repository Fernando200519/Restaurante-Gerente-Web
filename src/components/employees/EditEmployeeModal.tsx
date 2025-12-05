import React, { useState, useEffect } from "react";
import BaseModal from "../ui/BaseModal";
import ConfirmModal from "../ui/ConfirmModal";
import type { Employee, EmployeeRole, Gender } from "../../types/types";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (
    employeeId: string,
    data: { role: EmployeeRole; username: string; phone: string }
  ) => void;
  onDelete: (employeeId: string) => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    role: "mesero" as EmployeeRole,
    username: "",
    phone: "",
  });

  const [errors, setErrors] = useState<{
    username?: string;
    phone?: string;
    role?: string;
  }>({});
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
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return {
        firstName: parts[0],
        paternalLastName: parts[1],
        maternalLastName:
          parts.length > 2 ? parts.slice(2).join(" ") : undefined,
      };
    }
    return {
      firstName: fullName,
      paternalLastName: "",
      maternalLastName: undefined,
    };
  };

  const nameParts = parseName(employee.name);

  const handleChange = (
    field: "role" | "username" | "phone",
    value: string
  ) => {
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
        newErrors.username = "El correo electrónico es obligatorio";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
        newErrors.username = "Ingrese un correo electrónico válido";
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
      role: "mesero",
      username: "",
      phone: "",
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
    if (!gender) return "N/A";
    const genderMap: Record<Gender, string> = {
      masculino: "Masculino",
      femenino: "Femenino",
      otro: "Otro",
    };
    return genderMap[gender] || gender;
  };

  const getRoleLabel = (role: EmployeeRole) => {
    const roleMap: Record<EmployeeRole, string> = {
      mesero: "Mesero",
      cocinero: "Cocinero",
      cajero: "Cajero",
    };
    return roleMap[role] || role;
  };

  // --- CLASES DE ESTILO UNIFICADO (Sin estilos en línea) ---
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  const readOnlyClass =
    "px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium select-none cursor-not-allowed";

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2 border rounded-lg transition-all outline-none text-gray-800 ${
      hasError
        ? "border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-gray-300 focus:border-[#FA9623] focus:ring-2 focus:ring-[#FA9623]/20"
    }`;

  const iconButtonClass =
    "p-2 text-gray-400 hover:text-[#FA9623] hover:bg-orange-50 rounded-lg transition-colors";

  return (
    <>
      <BaseModal isOpen={isOpen} onClose={onClose} title="Detalle empleado">
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Fila 1: Nombre y Apellido Paterno (Solo Lectura) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nombre</label>
              <div className={readOnlyClass}>{nameParts.firstName}</div>
            </div>
            <div>
              <label className={labelClass}>Apellido paterno</label>
              <div className={readOnlyClass}>
                {nameParts.paternalLastName || "N/A"}
              </div>
            </div>
          </div>

          {/* Fila 2: Apellido Materno y Género */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Apellido materno</label>
              <div className={readOnlyClass}>
                {nameParts.maternalLastName || "N/A"}
              </div>
            </div>
            <div>
              <label className={labelClass}>Género</label>
              <div className={readOnlyClass}>
                {employee.gender || "No especificado"}
              </div>
            </div>
          </div>

          {/* Fila 3: Correo Electrónico (Editable) */}
          <div>
            <label htmlFor="username" className={labelClass}>
              Correo electrónico
            </label>
            <div className="flex items-center gap-2">
              {isEditingEmail ? (
                <div className="flex-1 relative">
                  <input
                    type="email"
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className={inputClass(!!errors.username)}
                    placeholder="correo@ejemplo.com"
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className={`flex-1 ${readOnlyClass} bg-white! cursor-text! text-gray-800! border-gray-300!`}
                >
                  {formData.username || "N/A"}
                </div>
              )}

              {/* Botón Toggle Edición */}
              <button
                type="button"
                onClick={() => {
                  if (isEditingEmail) {
                    setFormData((prev) => ({
                      ...prev,
                      username: employee.username,
                    }));
                    setErrors((prev) => ({ ...prev, username: "" }));
                    setIsEditingEmail(false);
                  } else {
                    setIsEditingEmail(true);
                  }
                }}
                className={iconButtonClass}
                title={isEditingEmail ? "Cancelar edición" : "Editar correo"}
              >
                {isEditingEmail ? (
                  // Icono X (Cancelar)
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  // Icono Lápiz (Editar)
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.username}
              </p>
            )}
          </div>

          {/* Fila 4: Puesto y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Puesto (Siempre editable) */}
            <div>
              <label htmlFor="role" className={labelClass}>
                Puesto
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

            {/* Teléfono (Editable con toggle) */}
            <div>
              <label htmlFor="phone" className={labelClass}>
                Teléfono
              </label>
              <div className="flex items-center gap-2">
                {isEditingPhone ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={inputClass(false)}
                    placeholder="Teléfono"
                    autoFocus
                  />
                ) : (
                  <div
                    className={`flex-1 ${readOnlyClass} bg-white! cursor-text! text-gray-800! border-gray-300!`}
                  >
                    {formData.phone || "N/A"}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isEditingPhone) {
                      setFormData((prev) => ({
                        ...prev,
                        phone: employee.phone,
                      }));
                      setIsEditingPhone(false);
                    } else {
                      setIsEditingPhone(true);
                    }
                  }}
                  className={iconButtonClass}
                  title={
                    isEditingPhone ? "Cancelar edición" : "Editar teléfono"
                  }
                >
                  {isEditingPhone ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Eliminar
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#FA9623] hover:bg-[#e68a1f] text-white font-medium rounded-lg transition-colors shadow-sm shadow-orange-200"
              >
                Guardar Cambios
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
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        confirmColor="red"
      />
    </>
  );
};

export default EditEmployeeModal;
