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
  const zonaActual = zonas.find((z) => z.nombre === localMesa.zona);
  const initialZonaId = localMesa.zonaId || zonaActual?.id || null;
  const [zonaId, setZonaId] = useState<number | null>(initialZonaId);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isEditingDisabled = isOccupied || isInactive;
  const areInputsDisabled = isOccupied;

  const disabledStyle = "opacity-50 cursor-not-allowed";

  const isDirty =
    capacidad !== localMesa.capacidad || zonaId !== localMesa.zonaId;

  const handleSave = () => {
    if (loading || !isDirty || areInputsDisabled) return;

    onSave({
      capacidad,
      zonaId,
    });
  };

  const currentStatusText = isInactive ? "INACTIVA" : localMesa.estado;

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
        {/* FILA DE INPUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Selector de capacidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Users size={14} className="text-gray-500" />
              Capacidad
            </label>

            <input
              type="number"
              min={1}
              max={32}
              value={capacidad}
              onChange={(e) => setCapacidad(Number(e.target.value))}
              disabled={areInputsDisabled}
              className={`w-full px-4 py-2 border border-gray-300 rounded-xl outline-none 
                          focus:ring-2 focus:ring-[#FA9623]/30 focus:border-[#FA9623] 
                          text-gray-800 transition ${
                            areInputsDisabled ? "bg-gray-200" : "bg-white"
                          }`}
            />
          </div>

          {/* Selector de zona (CUSTOM DESIGN) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <MapPin size={14} className="text-gray-500" />
              Zona Actual
            </label>

            {/* CUSTOM SELECT REPLACEMENT */}
            <div className="relative">
              <button
                // BLOQUEAR DROPDOWN
                onClick={() =>
                  !areInputsDisabled && setDropdownOpen(!dropdownOpen)
                }
                disabled={areInputsDisabled} // <-- DESHABILITAR BOTÓN PRINCIPAL
                className={`w-full px-4 py-2 border border-gray-300 rounded-xl outline-none 
                       bg-white text-gray-800 transition text-left flex justify-between items-center 
                       ${
                         areInputsDisabled
                           ? "bg-gray-200"
                           : "hover:border-[#FA9623]"
                       }`}
              >
                {/* Muestra la zona seleccionada o el valor por defecto */}
                {zonas.find((z) => z.id === zonaId)?.nombre || "Sin Zona"}
                <ChevronDown size={18} className="text-gray-500" />
              </button>

              {dropdownOpen &&
                !areInputsDisabled && ( // <- BLOQUEAR RENDERIZADO DEL DROPDOWN
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {zonas.map((z) => (
                      <div
                        key={z.id}
                        onClick={() => {
                          setZonaId(z.id);
                          setDropdownOpen(false);
                        }}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 transition 
                                    ${
                                      zonaId === z.id
                                        ? "bg-gray-100 font-semibold text-[#FA9623]"
                                        : "text-gray-800"
                                    }`}
                      >
                        {z.nombre}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DE ACCIONES PRINCIPALES */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-4">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
          Guardar
        </h3>

        {/* Guardar Cambios */}
        <button
          onClick={handleSave}
          disabled={loading || !isDirty || isOccupied}
          className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2
                    bg-[#FA9623] hover:bg-[#e0871e] transition shadow-md 
                    ${loading || !isDirty || isOccupied ? disabledStyle : ""}`}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {loading ? "Guardando..." : "Aplicar Configuración"}
        </button>

        <hr className="my-4 border-gray-100" />
        {/* Botones de Cambio de Estado y Eliminación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Habilitar/Inactivar mesa */}
          {isInactive ? (
            <button
              onClick={onEnable}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2
                                bg-green-600 hover:bg-green-700 transition shadow-sm
                                ${loading ? disabledStyle : ""}`}
            >
              <CheckCircle size={20} />
              Habilitar Mesa
            </button>
          ) : (
            <button
              onClick={onDisable}
              disabled={loading || isOccupied}
              title={
                isOccupied ? "No se puede desactivar una mesa ocupada." : ""
              }
              className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2
                                bg-gray-500 hover:bg-gray-600 transition shadow-sm
                                ${loading || isOccupied ? disabledStyle : ""}`}
            >
              <Ban size={20} />
              Desactivar Mesa
            </button>
          )}

          {/* Eliminar */}
          <button
            onClick={onDelete}
            disabled={loading || isOccupied}
            title={isOccupied ? "No se puede eliminar una mesa ocupada." : ""}
            className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2
                            bg-red-600 hover:bg-red-700 transition shadow-sm
                            ${loading || isOccupied ? disabledStyle : ""}`}
          >
            <Trash2 size={20} />
            Eliminar Mesa
          </button>
        </div>
      </div>
    </div>
  );
};
