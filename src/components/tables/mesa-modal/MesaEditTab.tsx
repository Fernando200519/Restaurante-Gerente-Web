import React, { useState } from "react";
import { Mesa, Zona } from "../../../types/mesa";
import {
  Users,
  MapPin,
  Save,
  Ban,
  CheckCircle,
  Trash2,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface Props {
  zonas: Zona[];
  localMesa: Mesa;
  isOccupied: boolean;
  isInactive: boolean;
  loading: boolean;
  onDelete: () => void;
  onDisable: () => void;
  onEnable: () => void;
  onSave: (data: { zonaId: number | null }) => void;
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
  const zonaActual = zonas.find((z) => z.nombre === localMesa.zona);
  const initialZonaId = localMesa.zonaId || zonaActual?.id || null;
  const [zonaId, setZonaId] = useState<number | null>(initialZonaId);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const areInputsDisabled = isOccupied;

  const disabledStyle = "opacity-50 cursor-not-allowed";

  // Solo verificamos si cambió la zona
  const isDirty = zonaId !== localMesa.zonaId;

  const handleSave = () => {
    if (loading || !isDirty || areInputsDisabled) return;
    // Solo enviamos zonaId
    onSave({ zonaId });
  };

  return (
    <div className="space-y-8">
      {/* Mensaje de Bloqueo Global si está Ocupada */}
      {isOccupied && (
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-xl text-sm font-semibold text-yellow-800 flex items-center gap-2">
          La configuración de la mesa no se puede editar mientras esté ocupada.
        </div>
      )}

      {/* 1. SECCIÓN DE CONFIGURACIÓN BÁSICA */}
      <div
        className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-5 ${
          areInputsDisabled ? "opacity-70" : ""
        }`}
      >
        {/* FILA DE INPUTS (Ahora solo Zona) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            Cambiar Zona
          </label>

          {/* CUSTOM SELECT */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                !areInputsDisabled && setDropdownOpen(!dropdownOpen)
              }
              disabled={areInputsDisabled}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl outline-none 
                     bg-white text-gray-800 transition text-left flex justify-between items-center 
                     ${
                       areInputsDisabled
                         ? "bg-gray-100 cursor-not-allowed"
                         : "hover:border-[#FA9623] cursor-pointer"
                     }`}
            >
              <span
                className={
                  zonaId ? "text-gray-900 font-medium" : "text-gray-500"
                }
              >
                {zonas.find((z) => z.id === zonaId)?.nombre || "Sin Zona"}
              </span>
              <ChevronDown size={18} className="text-gray-500" />
            </button>

            {dropdownOpen && !areInputsDisabled && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                {zonas.map((z) => (
                  <div
                    key={z.id}
                    onClick={() => {
                      setZonaId(z.id);
                      setDropdownOpen(false);
                    }}
                    className={`px-4 py-2.5 cursor-pointer transition text-sm flex items-center justify-between
                      ${
                        zonaId === z.id
                          ? "bg-[#FFF8F0] text-[#FA9623] font-bold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    {z.nombre}
                    {zonaId === z.id && (
                      <span className="w-2 h-2 rounded-full bg-[#FA9623]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DE ACCIONES */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-4">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
          Acciones
        </h3>

        {/* Guardar Cambios */}
        <button
          onClick={handleSave}
          disabled={loading || !isDirty || isOccupied}
          className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2
                  bg-[#FA9623] hover:bg-[#e0871e] transition shadow-md cursor-pointer
                  ${loading || !isDirty || isOccupied ? disabledStyle : ""}`}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>

        <hr className="my-4 border-gray-100" />

        {/* Botones de Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isInactive ? (
            <button
              onClick={onEnable}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2
                          bg-green-600 hover:bg-green-700 transition shadow-sm cursor-pointer
                          ${loading ? disabledStyle : ""}`}
            >
              <CheckCircle size={20} />
              Habilitar
            </button>
          ) : (
            <button
              onClick={onDisable}
              disabled={loading || isOccupied}
              className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2
                          bg-gray-500 hover:bg-gray-600 transition shadow-sm cursor-pointer
                          ${loading || isOccupied ? disabledStyle : ""}`}
            >
              <Ban size={20} />
              Desactivar
            </button>
          )}

          <button
            onClick={onDelete}
            disabled={loading || isOccupied}
            className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2
                        bg-red-600 hover:bg-red-700 transition shadow-sm cursor-pointer
                        ${loading || isOccupied ? disabledStyle : ""}`}
          >
            <Trash2 size={20} />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
