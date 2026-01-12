import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  ChevronDown,
  AlertCircle,
  Contact,
  Users2,
} from "lucide-react";
import BaseModal from "../ui/BaseModal";
import type { EmployeeFormData } from "../../types/types";

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

  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const GENDER_OPTIONS = [
    { value: "masculino", label: "Masculino" },
    { value: "femenino", label: "Femenino" },
    { value: "otro", label: "Otro" },
  ];

  const selectedGenderLabel =
    GENDER_OPTIONS.find((g) => g.value === formData.gender)?.label ||
    "No especificado";

  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const ROLE_OPTIONS = [
    { value: "mesero", label: "Cuerpo de Meseros" },
    { value: "cocinero", label: "Equipo de Cocina" },
    { value: "cajero", label: "Área de Cajas" },
  ];

  const selectedRoleLabel =
    ROLE_OPTIONS.find((r) => r.value === formData.role)?.label ||
    "Seleccionar puesto...";

  const [errors, setErrors] = useState<
    Partial<Record<keyof EmployeeFormData, string>>
  >({});

  const handleChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "El nombre es requerido";
    if (!formData.paternalLastName.trim())
      newErrors.paternalLastName = "El apellido es requerido";
    if (!formData.username.trim()) {
      newErrors.username = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = "Formato de correo inválido";
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

  const labelStyle =
    "flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] mb-2 ml-1";
  const inputBase =
    "w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none transition-all font-bold text-sm text-gray-700 focus:bg-white focus:ring-4 focus:ring-orange-500/10 shadow-inner placeholder:text-gray-300";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Colaborador"
    >
      <form onSubmit={handleSubmit} className="space-y-8 pt-4">
        {/* 👤 SECCIÓN: IDENTIDAD */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <Contact size={16} className="text-[#FF8108]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">
              Información Personal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group">
              <label className={labelStyle}>
                Nombre <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className={`${inputBase} ${
                  errors.firstName
                    ? "border-rose-200 bg-rose-50/30"
                    : "group-hover:border-gray-100"
                }`}
                placeholder="Ej. Carlos"
              />
              {errors.firstName && (
                <p className="mt-2 text-[10px] font-black text-rose-500 flex items-center gap-1 ml-1 uppercase animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={12} /> {errors.firstName}
                </p>
              )}
            </div>

            <div className="group">
              <label className={labelStyle}>
                Apellido Paterno <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={formData.paternalLastName}
                onChange={(e) =>
                  handleChange("paternalLastName", e.target.value)
                }
                className={`${inputBase} ${
                  errors.paternalLastName
                    ? "border-rose-200 bg-rose-50/30"
                    : "group-hover:border-gray-100"
                }`}
                placeholder="Ej. González"
              />
              {errors.paternalLastName && (
                <p className="mt-2 text-[10px] font-black text-rose-500 flex items-center gap-1 ml-1 uppercase animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={12} /> {errors.paternalLastName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group">
              <label className={labelStyle}>Apellido Materno</label>
              <input
                type="text"
                value={formData.maternalLastName}
                onChange={(e) =>
                  handleChange("maternalLastName", e.target.value)
                }
                className={`${inputBase} group-hover:border-gray-100`}
                placeholder="Opcional"
              />
            </div>

            <div className="group relative">
              <label className={labelStyle}>Género</label>

              {/* 🎯 GENDER TRIGGER BUTTON */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsGenderOpen(!isGenderOpen)}
                  className={`${inputBase} flex items-center justify-between appearance-none cursor-pointer ${
                    isGenderOpen
                      ? "border-[#FF8108] bg-white ring-4 ring-orange-50"
                      : "group-hover:border-gray-100"
                  }`}
                >
                  <span
                    className={`text-sm font-bold ${
                      !formData.gender ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {selectedGenderLabel}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-300 ${
                      isGenderOpen ? "rotate-180 text-[#FF8108]" : ""
                    }`}
                  />
                </button>

                {/* 📋 LISTA DE OPCIONES (Sustituye al <select> nativo) */}
                {isGenderOpen && (
                  <>
                    {/* Capa invisible para cerrar al hacer clic fuera */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsGenderOpen(false)}
                    />

                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-4xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <ul className="py-2">
                        {/* Mapeo de opciones reales */}
                        {GENDER_OPTIONS.map((opt) => (
                          <li key={opt.value}>
                            <button
                              type="button"
                              onClick={() => {
                                handleChange("gender", opt.value);
                                setIsGenderOpen(false);
                              }}
                              className={`w-full text-left px-6 py-3.5 text-sm font-bold transition-all flex items-center gap-3 cursor-pointer ${
                                formData.gender === opt.value
                                  ? "bg-orange-50 text-[#FF8108]"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  formData.gender === opt.value
                                    ? "bg-[#FF8108] scale-125"
                                    : "bg-gray-200"
                                }`}
                              />
                              {opt.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 💼 SECCIÓN: PERFIL OPERATIVO */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <Briefcase size={16} className="text-[#FF8108]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">
              Configuración de Cuenta
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group relative">
              <label className={labelStyle}>
                Puesto de Trabajo <span className="text-orange-500">*</span>
              </label>

              <div className="relative">
                {/* 🎯 TRIGGER DEL SELECTOR PERSONALIZADO */}
                <button
                  type="button"
                  onClick={() => setIsRoleOpen(!isRoleOpen)}
                  className={`${inputBase} flex items-center justify-between appearance-none cursor-pointer transition-all ${
                    isRoleOpen
                      ? "border-[#FF8108] bg-white ring-4 ring-orange-50"
                      : "group-hover:border-gray-100"
                  }`}
                >
                  <span
                    className={`text-sm font-bold ${
                      !formData.role ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {selectedRoleLabel}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-300 ${
                      isRoleOpen ? "rotate-180 text-[#FF8108]" : ""
                    }`}
                  />
                </button>

                {/* 📋 LISTA DE ROLES (Sustituye al <select> nativo) */}
                {isRoleOpen && (
                  <>
                    {/* Capa para cerrar al hacer clic fuera */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsRoleOpen(false)}
                    />

                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-4xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <ul className="py-2">
                        {/* Mapeo de opciones operativas */}
                        {ROLE_OPTIONS.map((opt) => (
                          <li key={opt.value}>
                            <button
                              type="button"
                              onClick={() => {
                                handleChange("role", opt.value);
                                setIsRoleOpen(false);
                              }}
                              className={`w-full text-left px-6 py-4 text-sm font-bold transition-all flex items-center justify-between group cursor-pointer ${
                                formData.role === opt.value
                                  ? "bg-orange-50 text-[#FF8108]"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                                    formData.role === opt.value
                                      ? "bg-[#FF8108] scale-125"
                                      : "bg-gray-200"
                                  }`}
                                />
                                {opt.label}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="group">
              <label className={labelStyle}>
                Correo Corporativo <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className={`${inputBase} ${
                    errors.username
                      ? "border-rose-200 bg-rose-50/30"
                      : "group-hover:border-gray-100"
                  }`}
                  placeholder="usuario@mesalibre.com"
                />
                <Mail
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-[10px] font-black text-rose-500 flex items-center gap-1 ml-1 uppercase animate-in fade-in slide-in-from-left-2">
                  <AlertCircle size={12} /> {errors.username}
                </p>
              )}
            </div>
          </div>

          <div className="group max-w-md">
            <label className={labelStyle}>Teléfono de Contacto</label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`${inputBase} group-hover:border-gray-100`}
                placeholder="10 dígitos"
              />
              <Phone
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* 🛠️ FOOTER ACCIONES */}
        <div className="flex justify-end gap-4 pt-8 border-t border-gray-100 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-10 py-3.5 bg-[#FF8108] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Guardar Colaborador
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddEmployeeModal;
