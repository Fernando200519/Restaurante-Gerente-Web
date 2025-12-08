import React, { useEffect } from "react";
import { X, Map } from "lucide-react";
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
  const {
    mesas,
    moverMesasDeZonaContext, // <--- FALTABA ESTO
    migrarMesasNuevaZonaContext, // <--- FALTABA ESTO
  } = useMesas();

  const logic = useZonaLogic({
    zonas,
    mesas,
    crearZona,
    actualizarZona,
    eliminarZona,
    eliminarZonaConMesas,
    toggleEstadoZona,
    moverMesasDeZonaContext, // <--- EXTRAER
    migrarMesasNuevaZonaContext, // <--- EXTRAER
  });

  useEffect(() => {
    // Si visible es true, fija el body para prevenir scroll.
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      // Cuando el modal se cierra, restaura el scroll.
      document.body.style.overflow = "auto";
    }

    // Función de limpieza: Asegura que el scroll se restaure
    // si el componente se desmonta inesperadamente o si 'visible' cambia.
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  if (!visible) return null;

  // 1. ORDENAR ZONAS: "Sin zona" primero, el resto alfabético
  const sortedZonas = [...(zonas ?? [])].sort((a, b) => {
    const nameA = a.nombre.trim().toLowerCase();
    const nameB = b.nombre.trim().toLowerCase();

    if (nameA === "sin zona") return -1; // "Sin zona" sube
    if (nameB === "sin zona") return 1; // "Sin zona" sube
    return nameA.localeCompare(nameB); // El resto A-Z
  });

  // 2. Generar la lista visual basada en el orden
  const uiZonas = sortedZonas.map((z) => z.nombre);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Contenido del Modal */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER DESTACADO (CORREGIDO) */}
        <div className="p-5 bg-[#FA9623] text-white flex justify-between items-center shadow-lg">
          <h2 className="font-extrabold text-xl flex items-center gap-2">
            Gestión de Zonas
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>
        {/* CONTENIDO SCROLLABLE (LISTA DE ZONAS) */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
          <ZonaList
            uiZonas={uiZonas}
            zonas={zonas}
            mesas={mesas} // <--- AGREGA ESTA LÍNEA
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
                title: "Zona",
                message: `Acciones para ${name}`,
                targetZonaId: targetZona?.id,
                tablesCount: tablesCount,
              });
            }}
            toggleEstadoZona={toggleEstadoZona}
          />
        </div>
        {/* ZONA DE CREACIÓN (Parte fija inferior) */}
        <div className="shrink-0 z-10 bg-white relative">
          <ZonaCreate
            newZona={logic.newZona}
            setNewZona={logic.setNewZona}
            handleAddZona={logic.handleAddZona}
          />
        </div>
        {/* Modal Interno para acciones */}
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
