import React, { useState, useEffect } from "react";
import {
  Edit3,
  Phone,
  Mail,
  User,
  ShieldCheck,
  UserCircle,
  X,
  Hash,
  Smartphone,
  Venus,
  Mars,
  Briefcase,
} from "lucide-react";
import type { Employee } from "../../types/employee";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
}

const ROLE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  mesero: {
    label: "Mesero",
    icon: <User size={12} />,
    color: "text-orange-600 bg-orange-50 border-orange-100",
  },
  cocinero: {
    label: "Cocinero",
    icon: <User size={12} />,
    color: "text-rose-600 bg-rose-50 border-rose-100",
  },
  cajero: {
    label: "Cajero",
    icon: <User size={12} />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  admin: {
    label: "Administrador",
    icon: <ShieldCheck size={12} />,
    color: "text-purple-600 bg-purple-50 border-purple-100",
  },
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onEdit,
}) => {
  const [selectedForPreview, setSelectedForPreview] = useState<Employee | null>(
    null
  );

  useEffect(() => {
    if (selectedForPreview) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedForPreview]);

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Colaborador
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Contacto
              </th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Rol / Función
              </th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Estado
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Gestión
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((employee) => {
              const role = ROLE_CONFIG[employee.role.toLowerCase()] || {
                label: employee.role,
                icon: <User size={12} />,
                color: "text-gray-600 bg-gray-50 border-gray-100",
              };
              const isActive = employee.status === "activo";

              return (
                <tr
                  key={employee.id}
                  className="hover:bg-orange-50/30 transition-all group"
                >
                  {/* 👤 COLABORADOR */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {/* 🎯 Avatar clickeable para abrir el preview */}
                      <button
                        onClick={() => setSelectedForPreview(employee)}
                        className="h-12 w-12 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 border-2 border-white shadow-sm shrink-0 group/avatar relative cursor-pointer active:scale-90 transition-transform"
                      >
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                          />
                        ) : (
                          <User
                            size={22}
                            strokeWidth={2.5}
                            className="opacity-50"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                          <UserCircle size={16} className="text-white" />
                        </div>
                      </button>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight truncate max-w-[150px]">
                          {employee.name}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          ID: #{employee.id.toString().slice(-4)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 📱 CONTACTO */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={12} className="text-[#FF8108]" />
                        <span className="text-xs font-bold">
                          {employee.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone size={12} />
                        <span className="text-[11px] font-medium tabular-nums">
                          {formatPhone(employee.phone)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 🏷️ ROL */}
                  <td className="px-8 py-5 text-center">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${role.color}`}
                    >
                      {role.icon}
                      {role.label}
                    </span>
                  </td>

                  {/* 🟢 ESTADO */}
                  <td className="px-8 py-5 text-center">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-50 text-gray-400 border-gray-200"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isActive
                            ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {isActive ? "En Turno" : "Fuera"}
                      </span>
                    </div>
                  </td>

                  {/* ⚙️ ACCIONES */}
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => onEdit(employee)}
                      className="p-3 text-gray-400 hover:text-[#FF8108] hover:bg-white rounded-2xl shadow-sm border border-transparent hover:border-orange-100 transition-all cursor-pointer"
                    >
                      <Edit3 size={18} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 📋 MODAL DE VISTA PREVIA */}
      {selectedForPreview && (
        <EmployeePreviewModal
          employee={selectedForPreview}
          onClose={() => setSelectedForPreview(null)}
        />
      )}
    </div>
  );
};

const EmployeePreviewModal = ({
  employee,
  onClose,
}: {
  employee: Employee;
  onClose: () => void;
}) => {
  const role = ROLE_CONFIG[employee.role.toLowerCase()];

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden border border-white/20">
        {/* Banner Superior Decorativo */}
        <div
          className={`h-32 w-full bg-linear-to-br opacity-20 absolute top-0 ${
            role?.color.split(" ")[1]
          }`}
        />

        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors z-20 cursor-pointer"
        >
          <X size={28} strokeWidth={3} />
        </button>

        <div className="p-10 pt-16 relative flex flex-col items-center">
          {/* Avatar Expandido */}
          <div className="h-32 w-32 rounded-[2.5rem] bg-gray-100 border-4 border-white shadow-2xl overflow-hidden mb-6">
            {employee.avatar ? (
              <img
                src={employee.avatar}
                alt={employee.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-300 bg-gray-50">
                <User size={48} strokeWidth={1.5} />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic text-center leading-tight mb-2">
            {employee.name}
          </h2>

          <div className="flex gap-3 mb-8">
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${role?.color}`}
            >
              {role?.icon} {role?.label}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-100 bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-widest">
              <Hash size={10} /> ID: {employee.id}
            </span>
          </div>

          {/* Grid de Información Detallada */}
          <div className="w-full grid grid-cols-2 gap-4">
            <InfoBlock
              icon={<Mail className="text-orange-500" />}
              label="Correo Institucional"
              value={employee.username}
              className="lowercase"
            />
            <InfoBlock
              icon={<Smartphone className="text-blue-500" />}
              label="Teléfono de Contacto"
              value={employee.phone}
            />
            <InfoBlock
              icon={
                employee.gender === "femenino" ? (
                  <Venus className="text-rose-500" />
                ) : (
                  <Mars className="text-sky-500" />
                )
              }
              label="Género"
              value={employee.gender || "No especificado"}
            />
            <InfoBlock
              icon={<Briefcase className="text-emerald-500" />}
              label="Disponibilidad"
              value={employee.status === "activo" ? "En Turno" : "Inactivo"}
            />
          </div>

          <button
            onClick={onClose}
            className="mt-10 w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-gray-800 transition-all active:scale-95 cursor-pointer"
          >
            Cerrar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoBlock = ({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) => (
  <div className="p-4 rounded-3xl bg-gray-50/50 border border-gray-100 flex flex-col gap-1">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">
        {label}
      </span>
    </div>
    <span
      className={`text-[11px] font-bold text-gray-700 wrap-break-word ${className}`}
    >
      {value}
    </span>
  </div>
);

export default EmployeeTable;
