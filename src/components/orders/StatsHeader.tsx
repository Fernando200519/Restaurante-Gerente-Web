import React from "react";
import { OrderStatus } from "../../types/order";

interface StatCardProps {
  title: string;
  count: number;
  textColorClass: string;
  activeStyleClass: string;
  isActive: boolean;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  textColorClass,
  activeStyleClass,
  isActive,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`
      relative bg-white rounded-xl p-4 shadow-sm border flex flex-col justify-center min-w-40 flex-1 cursor-pointer transition-all duration-200
      ${
        isActive
          ? `${activeStyleClass} `
          : "border-gray-100 hover:border-gray-300 hover:shadow-md"
      }
    `}
  >
    <div
      className={`text-[18px] font-bold mb-1 ${
        isActive ? textColorClass : "text-gray-400"
      }`}
    >
      {title}
    </div>
    <div className={`text-3xl font-bold ${textColorClass}`}>{count}</div>
  </div>
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
    <div className="flex flex-col md:flex-row gap-4 mb-4 overflow-x-auto pb-2 scrollbar-hide">
      <StatCard
        title="Solicitadas"
        count={counts["Solicitado"] || 0}
        textColorClass="text-blue-600"
        // Define aquí el color del contorno específico para azul
        activeStyleClass="border-blue-500 ring-blue-500 bg-blue-50/20"
        isActive={selectedStatus === "Solicitado"}
        onClick={() => toggle("Solicitado")}
      />
      <StatCard
        title="En Preparación"
        count={counts["En Preparación"] || 0}
        textColorClass="text-[#F59E0B]"
        // Define aquí el color del contorno específico para ámbar
        activeStyleClass="border-[#F59E0B] ring-[#F59E0B] bg-[#F59E0B]/10"
        isActive={selectedStatus === "En Preparación"}
        onClick={() => toggle("En Preparación")}
      />
      <StatCard
        title="Listas para Entregar"
        count={counts["Listo"] || 0}
        textColorClass="text-[#22C55E]"
        // Define aquí el color del contorno específico para verde
        activeStyleClass="border-[#22C55E] ring-[#22C55E] bg-[#22C55E]/10"
        isActive={selectedStatus === "Listo"}
        onClick={() => toggle("Listo")}
      />
      <StatCard
        title="Entregadas"
        count={counts["Entregado"] || 0}
        textColorClass="text-gray-700"
        // Define aquí el color del contorno específico para gris
        activeStyleClass="border-gray-500 ring-gray-500 bg-gray-100"
        isActive={selectedStatus === "Entregado"}
        onClick={() => toggle("Entregado")}
      />
      <StatCard
        title="Canceladas"
        count={counts["Cancelada"] || 0}
        textColorClass="text-[#EF4444]"
        // Define aquí el color del contorno específico para rojo
        activeStyleClass="border-[#EF4444] ring-[#EF4444] bg-[#EF4444]/10"
        isActive={selectedStatus === "Cancelada"}
        onClick={() => toggle("Cancelada")}
      />
    </div>
  );
};
