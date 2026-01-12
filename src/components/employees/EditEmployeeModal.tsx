import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Contact,
  Trash2,
  X,
  Pencil,
  ShieldCheck,
} from "lucide-react";
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
  const [errors, setErrors] = useState<{ username?: string; phone?: string }>(
    {}
  );
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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

  const handleChange = (
    field: "role" | "username" | "phone",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors])
      setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(employee.id, formData);
    onClose();
  };

  const labelStyle =
    "flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] mb-2 ml-1";
  const inputBase =
    "w-full px-5 py-3.5 bg-white border-2 border-gray-100 rounded-2xl outline-none transition-all font-bold text-sm text-gray-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 shadow-inner";
  const readOnlyStyle =
    "w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm text-gray-500 select-none cursor-not-allowed";

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Perfil del Colaborador"
      >
        <form onSubmit={handleSubmit} className="space-y-8 pt-4">
          {/* 👤 SECCIÓN: IDENTIDAD (Estática) */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <Contact size={16} className="text-gray-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                Datos Personales
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Nombre Completo</label>
                <div className={readOnlyStyle}>{employee.name}</div>
              </div>
              <div>
                <label className={labelStyle}>Género</label>
                <div className={readOnlyStyle}>
                  {employee.gender || "No especificado"}
                </div>
              </div>
            </div>
          </div>

          {/* ⚙️ SECCIÓN: CONFIGURACIÓN OPERATIVA (Editable) */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#FF8108]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">
                  Acceso y Función
                </span>
              </div>
              <span className="text-[9px] font-black bg-orange-100 text-[#FF8108] px-2 py-0.5 rounded-md">
                ID: #{employee.id.slice(-6)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Rol siempre editable */}
              <div className="group">
                <label className={labelStyle}>Puesto de Trabajo</label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className={`${inputBase} appearance-none cursor-pointer`}
                  >
                    <option value="mesero">Cuerpo de Meseros</option>
                    <option value="cocinero">Equipo de Cocina</option>
                    <option value="cajero">Área de Cajas</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-[#FF8108]"
                  />
                </div>
              </div>

              {/* Email con Toggle */}
              <div className="group">
                <label className={labelStyle}>Correo Corporativo</label>
                <div className="flex items-center gap-2">
                  {isEditingEmail ? (
                    <input
                      type="email"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      className={inputBase}
                      autoFocus
                    />
                  ) : (
                    <div
                      className={`${readOnlyStyle} bg-white border-gray-100`}
                    >
                      {formData.username}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                    className={`p-3.5 rounded-2xl transition-all shadow-sm border ${
                      isEditingEmail
                        ? "bg-rose-50 text-rose-500 border-rose-100"
                        : "bg-gray-50 text-gray-400 border-gray-100 hover:text-[#FF8108]"
                    }`}
                  >
                    {isEditingEmail ? (
                      <X size={18} strokeWidth={2.5} />
                    ) : (
                      <Pencil size={18} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Teléfono con Toggle */}
            <div className="group max-w-md">
              <label className={labelStyle}>Teléfono de Contacto</label>
              <div className="flex items-center gap-2">
                {isEditingPhone ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={inputBase}
                    autoFocus
                  />
                ) : (
                  <div className={`${readOnlyStyle} bg-white border-gray-100`}>
                    {formData.phone || "Sin teléfono"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(!isEditingPhone)}
                  className={`p-3.5 rounded-2xl transition-all shadow-sm border ${
                    isEditingPhone
                      ? "bg-rose-50 text-rose-500 border-rose-100"
                      : "bg-gray-50 text-gray-400 border-gray-100 hover:text-[#FF8108]"
                  }`}
                >
                  {isEditingPhone ? (
                    <X size={18} strokeWidth={2.5} />
                  ) : (
                    <Pencil size={18} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 🛠️ FOOTER ACCIONES */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="px-6 py-3.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2"
            >
              <Trash2 size={16} strokeWidth={2.5} /> Bajar de Sistema
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all active:scale-95"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-10 py-3.5 bg-[#FF8108] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95"
              >
                Actualizar Perfil
              </button>
            </div>
          </div>
        </form>
      </BaseModal>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          onDelete(employee.id);
          onClose();
        }}
        title="Baja de Colaborador"
        message={`¿Estás seguro de eliminar a ${employee.name}? Esta acción revocará sus accesos al sistema inmediatamente.`}
        confirmText="Confirmar Baja"
        confirmColor="red"
      />
    </>
  );
};

export default EditEmployeeModal;
