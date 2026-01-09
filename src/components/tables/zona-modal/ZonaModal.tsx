import React, { useEffect } from "react";
import { X, Map, LayoutGrid, AlertCircle, Info } from "lucide-react"; // ✅ Agregamos iconos
import { useZonaLogic } from "./hooks/useZonaLogic";
import { ZonaList } from "./ZonaList";
import { ZonaCreate } from "./ZonaCreate";
import { ZonaInternalModal } from "./ZonaInternalModal";
import { useMesas } from "../../../hooks/useMesas";
import { Zona } from "../../../types/mesa";

interface ZonaModalProps {
  visible: boolean;
  onClose: () => void;
  zonas: Zona[];
  crearZona: (nombre: string) => Promise<Zona>;
  actualizarZona: (
    id: number,
    nombre: string,
    estado?: "Activa" | "Inactiva"
  ) => Promise<void>;
  eliminarZona: (id: number) => Promise<void>;
  eliminarZonaConMesas: (id: number) => Promise<void>;
  toggleEstadoZona: (zona: Zona) => Promise<void>;
}

const ZonaModal: React.FC<ZonaModalProps> = ({
  visible,
  onClose,
  zonas,
  crearZona,
  actualizarZona,
  eliminarZona,
  eliminarZonaConMesas,
  toggleEstadoZona,
}) => {
  const { mesas, moverMesasDeZonaContext, migrarMesasNuevaZonaContext } =
    useMesas();

  const logic = useZonaLogic({
    zonas,
    mesas,
    crearZona,
    actualizarZona,
    eliminarZona,
    eliminarZonaConMesas,
    toggleEstadoZona,
    moverMesasDeZonaContext,
    migrarMesasNuevaZonaContext,
  });

  const orphanTables = mesas.filter(
    (m) => m.zona?.toLowerCase() === "sin zona"
  );
  const hasOrphans = orphanTables.length > 0;

  useEffect(() => {
    if (visible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  if (!visible) return null;

  const sortedZonas = [...(zonas ?? [])].sort((a, b) => {
    const nameA = a.nombre.trim().toLowerCase();
    const nameB = b.nombre.trim().toLowerCase();
    if (nameA === "sin zona") return -1;
    if (nameB === "sin zona") return 1;
    return nameA.localeCompare(nameB);
  });

  const uiZonas = sortedZonas.map((z) => z.nombre);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 relative animate-in zoom-in-95 duration-300">
        {/* 🎨 HEADER CORPORATIVO (#FF8108) */}
        <div className="p-6 bg-[#FF8108] text-white flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <LayoutGrid size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight leading-none uppercase">
                Configuración de Áreas
              </h2>
              <span className="text-[10px] font-bold text-orange-100 uppercase tracking-widest opacity-80">
                Mapa del Restaurante
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-black/10 hover:bg-black/20 p-2 rounded-full transition-all cursor-pointer active:scale-90"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* 🚨 NOTA INFORMATIVA DE MESAS HUÉRFANAS (NUEVO) */}
        {hasOrphans && (
          <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-2 duration-500">
            <div className="bg-rose-500 p-2 rounded-xl text-white shadow-lg shadow-rose-200 shrink-0">
              <AlertCircle size={18} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest">
                Atención Requerida
              </p>
              <p className="text-[11px] text-rose-600 font-bold leading-tight mt-1">
                Tienes{" "}
                <span className="underline">
                  {orphanTables.length}{" "}
                  {orphanTables.length === 1 ? "mesa" : "mesas"}
                </span>{" "}
                sin zona asignada. Favor de moverlas a una zona activa para
                habilitar su servicio.
              </p>
            </div>
          </div>
        )}

        {/* 📋 LISTADO DE ZONAS */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 no-scrollbar">
          <div className="mb-4 flex items-center gap-2 text-gray-400">
            <Map size={16} />
            <span className="text-xs font-black uppercase tracking-widest">
              Zonas registradas ({zonas.length})
            </span>
          </div>

          <ZonaList
            uiZonas={uiZonas}
            zonas={zonas}
            mesas={mesas}
            editingId={logic.editingId}
            editingName={logic.editingName}
            setEditingName={logic.setEditingName}
            setEditingId={logic.setEditingId}
            handleEdit={logic.handleEdit}
            handleSaveEdit={logic.handleSaveEdit}
            handleDeleteClick={(name: string) => {
              const targetZona = zonas.find((z) => z.nombre === name);
              const tablesCount = mesas.filter((m) => m.zona === name).length;
              logic.setModalState({
                isOpen: true,
                type: "choose_action",
                title: "Gestionar Zona",
                message: `¿Qué deseas hacer con el área "${name}"?`,
                targetZonaId: targetZona?.id,
                tablesCount: tablesCount,
              });
            }}
            toggleEstadoZona={toggleEstadoZona}
          />
        </div>

        {/* ➕ FOOTER: CREACIÓN DE ZONA */}
        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <ZonaCreate
            newZona={logic.newZona}
            setNewZona={logic.setNewZona}
            handleAddZona={logic.handleAddZona}
          />
        </div>

        <ZonaInternalModal
          {...logic}
          eliminarZona={eliminarZona}
          zonas={zonas}
        />
      </div>
    </div>
  );
};

export default ZonaModal;
