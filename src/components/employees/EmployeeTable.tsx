import React from "react";
import {
  Edit3,
  Phone,
  Mail,
  User,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import type { Employee } from "../../types/types";

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
                      <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-white shadow-sm shrink-0">
                        <User size={20} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                          {employee.name}
                        </span>
                        <span className="text-[11px] font-bold text-gray-400">
                          ID: #{employee.id.slice(-4)}
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
    </div>
  );
};

export default EmployeeTable;
