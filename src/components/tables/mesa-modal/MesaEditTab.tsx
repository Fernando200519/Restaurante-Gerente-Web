import React, { useState } from "react";
import { Mesa, Zona } from "../../../types/mesa";

interface Props {
  zonas: Zona[];
  localMesa: Mesa;
  isOccupied: boolean;
  isInactive: boolean;
  loading: boolean;
  onDelete: () => void;
  onDisable: () => void;
  onEnable: () => void;
  onSave: (data: { capacidad: number; zonaId: number | null }) => void;
}

export const MesaEditTab: React.FC<Props> = ({
  zonas,
  localMesa,
  isOccupied,
  isInactive,
  loading,
  onDelete,
  onDisable,
  onEnable,
  onSave,
}) => {
  const [capacidad, setCapacidad] = useState(localMesa.capacidad);
  const [zonaId, setZonaId] = useState<number | null>(localMesa.zonaId);

  const disabledStyle = "opacity-50 cursor-not-allowed";

  const handleSave = () => {
    if (loading) return;

    onSave({
      capacidad,
      zonaId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Selector de capacidad */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Capacidad
        </label>

        <input
          type="number"
          min={1}
          max={32}
          value={capacidad}
          onChange={(e) => setCapacidad(Number(e.target.value))}
          className="w-full px-4 py-2 border rounded-lg outline-none 
                     focus:ring-2 focus:ring-[#FA9623]/20 focus:border-[#FA9623] 
                     text-gray-800 transition"
        />
      </div>

      {/* Selector de zona */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Zona
        </label>

        <select
          value={zonaId ?? ""}
          onChange={(e) =>
            setZonaId(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full px-4 py-2 border rounded-lg outline-none 
                     focus:ring-2 focus:ring-[#FA9623]/20 focus:border-[#FA9623] 
                     text-gray-800 transition"
        >
          <option value="">Sin Zona</option>

          {zonas.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Acciones */}
      <div className="space-y-4 pt-2">
        {/* Guardar */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white 
                     bg-[#FA9623] hover:bg-[#e0871e] transition shadow-sm 
                     ${loading ? disabledStyle : ""}`}
        >
          Guardar Cambios
        </button>

        {/* Inactivar mesa */}
        {!isInactive && (
          <button
            onClick={onDisable}
            disabled={loading || isOccupied}
            className={`w-full py-3 rounded-lg font-semibold text-white 
                        bg-gray-500 hover:bg-gray-600 transition shadow-sm
                        ${loading || isOccupied ? disabledStyle : ""}`}
          >
            Desactivar Mesa
          </button>
        )}

        {/* Habilitar mesa */}
        {isInactive && (
          <button
            onClick={onEnable}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white 
                        bg-green-600 hover:bg-green-700 transition shadow-sm
                        ${loading ? disabledStyle : ""}`}
          >
            Habilitar Mesa
          </button>
        )}

        {/* Eliminar */}
        <button
          onClick={onDelete}
          disabled={loading || isOccupied}
          className={`w-full py-3 rounded-lg font-semibold text-white 
                      bg-red-600 hover:bg-red-700 transition shadow-sm
                      ${loading || isOccupied ? disabledStyle : ""}`}
        >
          Eliminar Mesa
        </button>
      </div>
    </div>
  );
};
