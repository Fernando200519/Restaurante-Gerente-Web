// src/components/zones/ZonaInternalModal.tsx
import {
  Trash2,
  X,
  Layers,
  AlertTriangle,
  ChevronDown,
  Eraser,
  MapPin,
  ArrowRightLeft,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";

export const ZonaInternalModal = ({
  modalState,
  closeInternal,
  eliminarZona,
  executeComplexAction,
  zonas,
  destinyId,
  setDestinyId,
  newZoneNameMigration,
  setNewZoneNameMigration,
}: any) => {
  if (!modalState.isOpen) return null;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [modalState.type]);

  const targetZona = zonas.find(
    (z: any) => String(z.id) === String(modalState.targetZonaId)
  );
  const isSinZona = targetZona?.nombre?.trim().toLowerCase() === "sin zona";

  const selectedZone = zonas.find(
    (z: any) => String(z.id) === String(destinyId)
  );
  const displayValue =
    destinyId === "NEW"
      ? "+ Crear nueva zona de destino"
      : selectedZone?.nombre || "Selecciona una zona destino...";

  const btnBase =
    "flex-1 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer";
  const cardBase =
    "w-full text-left p-5 rounded-[2rem] border-2 transition-all group flex items-start gap-4 cursor-pointer mb-3";

  const renderContent = () => {
    switch (modalState.type) {
      case "confirm_delete_empty":
        return (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mb-5 text-rose-500 shadow-sm border border-rose-100">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic mb-3">
                {modalState.title}
              </h3>
              <p className="text-gray-400 text-sm font-bold leading-relaxed">
                {modalState.message}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                className={`${btnBase} bg-gray-100 text-gray-500 hover:bg-gray-200`}
                onClick={closeInternal}
              >
                Cancelar
              </button>
              <button
                className={`${btnBase} bg-rose-500 text-white shadow-lg shadow-rose-200`}
                onClick={() => {
                  eliminarZona(modalState.targetZonaId);
                  closeInternal();
                }}
              >
                <Trash2 size={16} strokeWidth={3} /> Sí, eliminar
              </button>
            </div>
          </div>
        );

      case "choose_action":
        return (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
              <div className="p-2 bg-orange-50 rounded-xl text-[#FF8108]">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Zona Detectada
                </h4>
                <p className="text-sm font-black text-gray-900 uppercase italic">
                  {targetZona?.nombre} — {modalState.tablesCount} Mesa(s)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => executeComplexAction("MOVE_OTHER")}
                className={`${cardBase} border-blue-50 bg-white hover:border-blue-200 hover:bg-blue-50/50 group`}
              >
                <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                  <ArrowRightLeft size={20} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <div className="font-black text-gray-900 text-xs uppercase tracking-tight group-hover:text-blue-700">
                    Mover mesas a otra zona
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                    Reasigna el flujo de trabajo a una zona existente.
                  </div>
                </div>
              </button>

              {isSinZona ? (
                <button
                  onClick={() => executeComplexAction("CLEAR_ZONE")}
                  className={`${cardBase} border-rose-50 bg-white hover:border-rose-200 hover:bg-rose-50/50 group`}
                >
                  <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform">
                    <Eraser size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-gray-900 text-xs uppercase tracking-tight group-hover:text-rose-700">
                      Eliminar todas las mesas
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                      Acción destructiva. Se borrarán los registros.
                    </div>
                  </div>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => executeComplexAction("MOVE_NULL")}
                    className={`${cardBase} border-orange-50 bg-white hover:border-orange-200 hover:bg-orange-50/50 group`}
                  >
                    <div className="p-3 bg-orange-100 rounded-2xl text-[#FF8108] group-hover:scale-110 transition-transform">
                      <Layers size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-gray-900 text-xs uppercase tracking-tight group-hover:text-orange-700">
                        Mover a "Sin zona"
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                        Las mesas quedan libres para nueva asignación.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => executeComplexAction("DELETE_ALL")}
                    className={`${cardBase} border-rose-50 bg-white hover:border-rose-200 hover:bg-rose-50/50 group`}
                  >
                    <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform">
                      <Trash2 size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-gray-900 text-xs uppercase tracking-tight group-hover:text-rose-700">
                        Borrar zona y mesas
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                        Limpieza total de la base de datos de esta zona.
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>

            <button
              onClick={closeInternal}
              className="mt-6 w-full py-3 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-gray-600 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer"
            >
              Cancelar Operación
            </button>
          </div>
        );

      case "select_destiny":
        return (
          <div className="space-y-4 mb-8 relative animate-in fade-in duration-300">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] mb-2 ml-1">
              Zona de Aterrizaje
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between pl-5 pr-4 py-4 bg-gray-50 border-2 transition-all rounded-2xl outline-none ${
                  isDropdownOpen
                    ? "border-[#FF8108] bg-white ring-4 ring-orange-50"
                    : "border-transparent hover:border-gray-100"
                }`}
              >
                <span
                  className={`text-sm font-bold ${
                    !destinyId ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {displayValue}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180 text-[#FF8108]" : ""
                  }`}
                />
              </button>

              {/* 📋 LISTA DE OPCIONES PERSONALIZADA */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-4xl shadow-2xl z-70 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <ul className="max-h-60 overflow-y-auto no-scrollbar py-2">
                    {/* 🆕 1. OPCIÓN ESPECIAL AL INICIO: CREAR NUEVA */}
                    <li>
                      <button
                        onClick={() => {
                          setDestinyId("NEW");
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-4 text-sm font-black transition-all flex items-center gap-3 cursor-pointer ${
                          destinyId === "NEW"
                            ? "bg-orange-50 text-[#FF8108]"
                            : "text-[#FF8108] hover:bg-orange-50"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg ${
                            destinyId === "NEW"
                              ? "bg-white shadow-sm"
                              : "bg-orange-100"
                          }`}
                        >
                          <Plus size={16} strokeWidth={3} />
                        </div>
                        <span>+ CREAR NUEVA ZONA</span>
                      </button>
                    </li>

                    {/* 🏷️ 2. ENCABEZADO SEPARADOR */}
                    <li className="px-5 py-3 text-[10px] font-black text-gray-300 uppercase tracking-widest border-t border-b border-gray-50 bg-gray-50/30">
                      Zonas Disponibles para Migrar
                    </li>

                    {/* 📋 3. LISTADO DE ZONAS EXISTENTES */}
                    {zonas
                      .filter(
                        (z: any) =>
                          String(z.id) !== String(modalState.targetZonaId)
                      )
                      .map((z: any) => (
                        <li key={z.id}>
                          <button
                            onClick={() => {
                              setDestinyId(z.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3.5 text-sm font-bold transition-all flex items-center justify-between group cursor-pointer ${
                              String(destinyId) === String(z.id)
                                ? "bg-orange-50 text-[#FF8108]"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  String(destinyId) === String(z.id)
                                    ? "bg-[#FF8108] scale-125"
                                    : "bg-gray-200 group-hover:bg-[#FF8108]/40"
                                }`}
                              />
                              {z.nombre}
                            </div>
                            {String(destinyId) === String(z.id) && (
                              <div className="text-[9px] font-black uppercase tracking-tighter bg-white px-2 py-0.5 rounded-md shadow-sm border border-orange-100">
                                Seleccionada
                              </div>
                            )}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {destinyId === "NEW" && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <input
                  className="w-full px-5 py-4 bg-white border-2 border-orange-100 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-[#FF8108] outline-none font-bold text-sm shadow-inner placeholder:text-gray-300"
                  placeholder="Nombre de la nueva zona..."
                  value={newZoneNameMigration}
                  onChange={(e) => setNewZoneNameMigration(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                className={`${btnBase} bg-gray-100 text-gray-500`}
                onClick={closeInternal}
              >
                Cancelar
              </button>
              <button
                className={`${btnBase} bg-[#FF8108] text-white shadow-lg shadow-orange-200`}
                disabled={
                  !destinyId || (destinyId === "NEW" && !newZoneNameMigration)
                }
                onClick={() => executeComplexAction("CONFIRM_MOVE")}
              >
                Confirmar
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] animate-in fade-in duration-300"
        onClick={closeInternal}
      />
      {/* 🛡️ IMPORTANTE: Quitamos overflow-hidden para que el dropdown no se corte */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
        <button
          onClick={closeInternal}
          className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <X size={24} strokeWidth={3} />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};
