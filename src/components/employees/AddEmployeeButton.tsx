import React from "react";
import { UserPlus } from "lucide-react";

interface AddEmployeeButtonProps {
  onClick: () => void;
}

const AddEmployeeButton: React.FC<AddEmployeeButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex items-center justify-center gap-3 px-8 py-4 bg-[#FF8108] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-orange-200 cursor-pointer group shadow-lg shadow-orange-100/50 border border-orange-400/20"
    >
      {/* 👤 ICONO CON EFECTO DE GRUPO */}
      <UserPlus
        size={18}
        strokeWidth={3}
        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-12"
      />

      <span>Registrar Colaborador</span>
    </button>
  );
};

export default AddEmployeeButton;
