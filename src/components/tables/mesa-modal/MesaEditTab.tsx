import React, { useState } from "react";
import { Mesa, Zona } from "../../../types/mesa";
import {
  MapPin,
  Save,
  Ban,
  CheckCircle,
  Trash2,
  Loader2,
  ChevronDown,
  AlertTriangle,
  Settings2,
} from "lucide-react";

interface Props {
  zonas: Zona[];
  localMesa: Mesa;
  loading: boolean;
  isOccupied: boolean;
  isInactive: boolean;
  onDelete: () => void;
  onDisable: () => void;
  onEnable: () => void;
  onSave: (data: { zonaId: number | null }) => Promise<void>;
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

  const isDirty = zonaId !== localMesa.zonaId;

  const handleSave = () => {
    if (loading || !isDirty || isOccupied) return;
    onSave({ zonaId });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ⚠️ BANNER DE BLOQUEO DE SEGURIDAD */}
      {isOccupied && (
        <div className="flex items-center gap-4 p-5 bg-amber-50 border-2 border-amber-100 rounded-3xl text-amber-800 shadow-sm">
          <div className="bg-amber-100 p-2 rounded-xl">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider">
              Mesa en Operación
            </p>
            <p className="text-xs font-bold opacity-80">
              La configuración está bloqueada mientras existan comensales
              activos.
            </p>
          </div>
        </div>
      )}

      {/* 📍 SECCIÓN: UBICACIÓN */}
      {/* 🚀 CAMBIO 1: Cambiamos 'overflow-hidden' por 'overflow-visible' */}
      <div
        className={`bg-white rounded-4xl border border-gray-100 shadow-sm overflow-visible transition-all ${
          isOccupied ? "opacity-60" : ""
        }`}
      >
        {/* 🚀 CAMBIO 2: Añadimos 'rounded-t-4xl' al encabezado gris */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2 rounded-t-4xl">
          <MapPin size={16} className="text-[#FF8108]" strokeWidth={2.5} />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Ubicación de Mesa
          </h4>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
              Zona Asignada
            </label>

            {/* SELECT INDUSTRIAL CUSTOM */}
            <div className="relative">
              <button
                type="button"
                onClick={() => !isOccupied && setDropdownOpen(!dropdownOpen)}
                disabled={isOccupied}
                className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl transition-all flex justify-between items-center group
                  ${
                    isOccupied
                      ? "border-gray-100 cursor-not-allowed"
                      : "border-gray-100 hover:border-[#FF8108]/30 hover:bg-white cursor-pointer"
                  }`}
              >
                <span
                  className={`text-sm font-black ${
                    zonaId ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {zonas.find((z) => z.id === zonaId)?.nombre ||
                    "Sin Zona Específica"}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ✅ Dropdown liberado */}
              {dropdownOpen && !isOccupied && (
                <div className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-100 rounded-3xl shadow-2xl max-h-60 overflow-y-auto p-2 animate-in zoom-in-95 duration-100">
                  {zonas.map((z) => (
                    <div
                      key={z.id}
                      onClick={() => {
                        setZonaId(z.id);
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-3 rounded-xl cursor-pointer transition flex items-center justify-between text-xs font-bold
                        ${
                          zonaId === z.id
                            ? "bg-orange-50 text-[#FF8108]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      {z.nombre}
                      {zonaId === z.id && (
                        <CheckCircle
                          size={14}
                          fill="currentColor"
                          className="text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BOTÓN PRIMARIO: GUARDAR CAMBIOS */}
          <button
            onClick={handleSave}
            disabled={loading || !isDirty || isOccupied}
            className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg
              ${
                loading || !isDirty || isOccupied
                  ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                  : "bg-[#FF8108] text-white hover:bg-[#e67407] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              }`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {loading ? "Sincronizando..." : "Aplicar Cambios"}
          </button>
        </div>
      </div>

      {/* ⚙️ SECCIÓN: ACCIONES DE ESTADO CRÍTICO */}
      <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
          <Settings2 size={16} className="text-gray-400" strokeWidth={2.5} />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Control de Estado
          </h4>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Habilitar / Desactivar */}
          {isInactive ? (
            <button
              onClick={onEnable}
              disabled={loading}
              className="py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-emerald-600 bg-emerald-50 border-2 border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} /> Habilitar Servicio
            </button>
          ) : (
            <button
              onClick={onDisable}
              disabled={loading || isOccupied}
              className="py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-600 bg-gray-50 border-2 border-gray-100 hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <Ban size={16} /> Sacar de Servicio
            </button>
          )}

          {/* Eliminar (Acción Crítica) */}
          <button
            onClick={onDelete}
            disabled={loading || isOccupied}
            className="py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-rose-600 bg-rose-50 border-2 border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <Trash2 size={16} /> Eliminar Mesa
          </button>
        </div>
      </div>
    </div>
  );
};
