import React from "react";
import {
  ClipboardList,
  ChefHat,
  CheckCircle2,
  PackageCheck,
  XCircle,
  LucideIcon,
} from "lucide-react";
import { OrderStatus } from "../../types/order";

interface StatCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  colorClass: string;
  bgLight: string;
  borderClass: string;
  isActive: boolean;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  icon: Icon,
  colorClass,
  bgLight,
  borderClass,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`
      relative transition-all duration-300 group
      rounded-4xl p-5 border-2 flex items-center gap-4 min-w-[200px] flex-1 cursor-pointer
      ${
        isActive
          ? `bg-white ${colorClass} border-current scale-[1.05] z-20 shadow-xl shadow-gray-200/50`
          : `bg-white ${borderClass} ${colorClass} opacity-60 hover:opacity-100 z-10 hover:scale-[1.02] hover:shadow-md`
      }
    `}
  >
    {/* Fondo sutil siempre presente, más intenso si es activo */}
    <div
      className={`absolute inset-0 ${bgLight} rounded-4xl pointer-events-none ${
        isActive ? "opacity-20" : "opacity-40"
      }`}
    />

    <div
      className={`relative z-10 p-3 rounded-2xl transition-all duration-300 ${
        isActive
          ? `${colorClass.replace("text", "bg")} text-white`
          : `${bgLight} ${colorClass}`
      }`}
    >
      <Icon size={22} strokeWidth={isActive ? 3 : 2.5} />
    </div>

    <div className="relative z-10 flex flex-col items-start text-left min-w-0">
      <p
        className={`text-[10px] font-black uppercase tracking-[0.15em] leading-tight truncate ${
          isActive ? "text-current" : "opacity-60"
        }`}
      >
        {title}
      </p>
      <p
        className={`text-3xl font-black tabular-nums tracking-tighter ${
          isActive ? "text-gray-900" : "text-current"
        }`}
      >
        {count}
      </p>
    </div>
  </button>
);

interface StatsHeaderProps {
  counts: Record<string, number>;
  selectedStatus: OrderStatus | null;
  onSelectStatus: (status: OrderStatus | null) => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  counts,
  selectedStatus,
  onSelectStatus,
}) => {
  const toggle = (status: OrderStatus) =>
    onSelectStatus(selectedStatus === status ? null : status);

  return (
    <div className="relative z-30">
      <div className="flex items-stretch gap-5 overflow-x-auto no-scrollbar pt-2 pb-8 px-6 -mx-6">
        <StatCard
          title="Solicitadas"
          count={counts["Solicitado"] || 0}
          icon={ClipboardList}
          colorClass="text-blue-600"
          bgLight="bg-blue-50"
          borderClass="border-blue-100"
          isActive={selectedStatus === "Solicitado"}
          onClick={() => toggle("Solicitado")}
        />
        <StatCard
          title="En Cocina"
          count={counts["En Preparación"] || 0}
          icon={ChefHat}
          colorClass="text-amber-500"
          bgLight="bg-amber-50"
          borderClass="border-amber-100"
          isActive={selectedStatus === "En Preparación"}
          onClick={() => toggle("En Preparación")}
        />
        <StatCard
          title="Listas"
          count={counts["Listo"] || 0}
          icon={CheckCircle2}
          colorClass="text-emerald-500"
          bgLight="bg-emerald-50"
          borderClass="border-emerald-100"
          isActive={selectedStatus === "Listo"}
          onClick={() => toggle("Listo")}
        />
        <StatCard
          title="Entregadas"
          count={counts["Entregado"] || 0}
          icon={PackageCheck}
          colorClass="text-gray-600"
          bgLight="bg-gray-100"
          borderClass="border-gray-200"
          isActive={selectedStatus === "Entregado"}
          onClick={() => toggle("Entregado")}
        />
        <StatCard
          title="Canceladas"
          count={counts["Cancelada"] || 0}
          icon={XCircle}
          colorClass="text-rose-500"
          bgLight="bg-rose-50"
          borderClass="border-rose-100"
          isActive={selectedStatus === "Cancelada"}
          onClick={() => toggle("Cancelada")}
        />
      </div>

      {/* Degradado lateral para scroll en móviles */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-gray-50 to-transparent pointer-events-none md:hidden" />
    </div>
  );
};
