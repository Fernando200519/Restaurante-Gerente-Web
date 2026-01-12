// src/components/employees/EmployeeStats.tsx
import React from "react";
import { Users, ChefHat, HandCoins, Activity, UserCheck } from "lucide-react";
import type { EmployeeStats as EmployeeStatsType } from "../../types/types";

interface EmployeeStatsProps {
  stats: EmployeeStatsType;
}

export const EmployeeStats: React.FC<EmployeeStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 📊 TOTAL Y ASISTENCIA */}
      <StatCard
        icon={<Users size={20} />}
        label="Plantilla Total"
        value={stats.total}
        subValue={`Activos: ${stats.asistencia}`}
        color="bg-blue-500"
        lightBg="bg-blue-50/50"
      />

      {/* 🤵 MESEROS */}
      <StatCard
        icon={<UserCheck size={20} />}
        label="Cuerpo de Meseros"
        value={stats.meseros}
        color="bg-[#FF8108]"
        lightBg="bg-orange-50/50"
      />

      {/* 👨‍🍳 COCINA */}
      <StatCard
        icon={<ChefHat size={20} />}
        label="Equipo de Cocina"
        value={stats.cocineros}
        color="bg-rose-500"
        lightBg="bg-rose-50/50"
      />

      {/* 💰 CAJEROS */}
      <StatCard
        icon={<HandCoins size={20} />}
        label="Área de Cajas"
        value={stats.cajeros}
        color="bg-emerald-500"
        lightBg="bg-emerald-50/50"
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subValue?: string;
  color: string;
  lightBg: string;
}

const StatCard = ({
  icon,
  label,
  value,
  subValue,
  color,
  lightBg,
}: StatCardProps) => (
  <div className="p-6 rounded-[2.5rem] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
    {/* Decoración de fondo corregida */}
    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-gray-900">
      {React.isValidElement(icon) &&
        React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
          size: 120,
        })}
    </div>

    <div className="relative z-10 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${color} text-white shadow-lg`}>
          {icon}
        </div>
        {subValue && (
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            {subValue}
          </span>
        )}
      </div>

      <div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">
          {label}
        </p>
        <h4 className="text-4xl font-black text-gray-900 tabular-nums tracking-tighter italic">
          {value}
        </h4>
      </div>
    </div>
  </div>
);

export default EmployeeStats;
