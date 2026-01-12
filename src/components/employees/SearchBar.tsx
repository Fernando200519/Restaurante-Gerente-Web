import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar colaborador...",
}) => {
  return (
    <div className="relative group w-full">
      {/* 🔍 ICONO DE BÚSQUEDA DINÁMICO */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        <Search
          size={20}
          strokeWidth={2.5}
          className={`transition-colors duration-300 ${
            value
              ? "text-[#FF8108]"
              : "text-gray-400 group-focus-within:text-[#FF8108]"
          }`}
        />
      </div>

      {/* ⌨️ INPUT PERSONALIZADO */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-14 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-[#FF8108] focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300 shadow-inner"
      />

      {/* ❌ BOTÓN DE LIMPIEZA RÁPIDA */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-gray-200/50 text-gray-500 hover:bg-[#FF8108] hover:text-white transition-all cursor-pointer animate-in fade-in zoom-in duration-200"
          aria-label="Limpiar búsqueda"
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
