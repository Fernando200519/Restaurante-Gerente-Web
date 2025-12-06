import { MapPin, PlusCircle } from "lucide-react";

export const ZonaCreate = ({ newZona, setNewZona, handleAddZona }: any) => {
  return (
    <div className="p-5 bg-white border-t border-gray-100">
      {/* TÍTULO CON ICONO */}
      <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        Agregar Nueva Zona
      </label>

      <div className="flex gap-3">
        {/* INPUT DE ZONA */}
        <input
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-gray-800 transition 
                     focus:border-[#FA9623] focus:ring-2 focus:ring-[#FA9623]/20 outline-none shadow-sm"
          placeholder="Ej. Terraza VIP, Bar..."
          value={newZona}
          onChange={(e) => setNewZona(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddZona()}
        />

        {/* BOTÓN CREAR */}
        <button
          onClick={handleAddZona}
          className="flex items-center gap-1.5 px-5 py-2 bg-[#FA9623] text-white font-semibold rounded-xl transition 
                     hover:bg-[#e0871e] shadow-md hover:shadow-lg active:scale-[0.98]"
          disabled={!newZona.trim()}
        >
          Crear
        </button>
      </div>
    </div>
  );
};
