// src/components/mesas/ZonaModal.tsx
import {
  X,
  Trash2,
  Pencil,
  Check,
  Lock,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useMesasContext } from "../../context/MesasContext";

interface Props {
  visible: boolean;
  zonas: string[];
  setZonas: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}

type InternalModalState = {
  isOpen: boolean;
  type: "alert" | "confirm_delete" | "confirm_move";
  title: string;
  message: string;
  targetZona?: string;
};

const ZonasModal: React.FC<Props> = ({ visible, zonas, setZonas, onClose }) => {
  const { mesas, updateMesa } = useMesasContext();

  const [newZona, setNewZona] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const [internalModal, setInternalModal] = useState<InternalModalState>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  // Bloquear scroll
  useEffect(() => {
    if (visible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  // Asegurar "Sin zona"
  useEffect(() => {
    if (visible && !zonas.includes("Sin zona")) {
      setZonas((prev) => {
        const copy = Array.from(prev);
        if (copy.includes("Todas")) {
          const idx = copy.indexOf("Todas");
          copy.splice(idx + 1, 0, "Sin zona");
        } else {
          copy.unshift("Sin zona");
        }
        return Array.from(new Set(copy));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // --- FUNCIONES DE ALERTAS ---
  const showAlert = (title: string, message: string) => {
    setInternalModal({ isOpen: true, type: "alert", title, message });
  };

  const closeInternal = () => {
    setInternalModal((prev) => ({ ...prev, isOpen: false }));
  };

  // --- LÓGICA DE NEGOCIO (Intacta) ---
  const handleAddZona = () => {
    const z = newZona.trim();
    if (z === "") return;
    if (z === "Todas" || z === "Sin zona") {
      showAlert(
        "Nombre Reservado",
        `"${z}" es un nombre protegido por el sistema.`
      );
      return;
    }
    if (zonas.includes(z)) {
      showAlert("Duplicado", "Ya existe una zona con este nombre.");
      return;
    }
    setZonas((prev) => [...prev, z]);
    setNewZona("");
  };

  const handleDeleteClick = (zona: string) => {
    if (zona === "Todas" || zona === "Sin zona") {
      showAlert(
        "Acción denegada",
        "Esta es una zona del sistema y no se puede eliminar."
      );
      return;
    }

    const mesasDeZona = mesas.filter(
      (m) => (m.zona && m.zona.trim() !== "" ? m.zona : "Sin zona") === zona
    );

    if (mesasDeZona.length === 0) {
      setInternalModal({
        isOpen: true,
        type: "confirm_delete",
        title: "Eliminar Zona",
        message: `¿Estás seguro de eliminar "${zona}"?`,
        targetZona: zona,
      });
      return;
    }

    const hayNoLibres = mesasDeZona.some((m) => m.estado !== "LIBRE");
    if (hayNoLibres) {
      showAlert(
        "Zona Ocupada",
        "No puedes eliminar esta zona porque hay mesas ocupadas o con cuentas pendientes."
      );
      return;
    }

    setInternalModal({
      isOpen: true,
      type: "confirm_move",
      title: "Mover y Eliminar",
      message: `La zona "${zona}" tiene  mesas libres. Si la eliminas, estas mesas se moverán a "Sin zona".`,
      targetZona: zona,
    });
  };

  const confirmAction = async () => {
    const { targetZona, type } = internalModal;
    if (!targetZona) return;

    if (type === "confirm_move") {
      const mesasDeZona = mesas.filter(
        (m) =>
          (m.zona && m.zona.trim() !== "" ? m.zona : "Sin zona") === targetZona
      );
      for (const m of mesasDeZona) {
        try {
          await updateMesa(m.id, m.capacidad, "Sin zona");
        } catch (err) {
          console.error("Error moviendo mesa", m.id, err);
        }
      }
    }

    setZonas((prev) => prev.filter((z) => z !== targetZona));
    closeInternal();
  };

  const handleEdit = (index: number) => {
    if (zonas[index] === "Todas" || zonas[index] === "Sin zona") return;
    setEditingIndex(index);
    setEditingName(zonas[index]);
  };

  const handleSaveEdit = () => {
    const name = editingName.trim();
    if (name === "") return;
    if (name === "Todas" || name === "Sin zona") {
      showAlert("Error", "Nombre reservado");
      return;
    }
    if (zonas.includes(name)) {
      showAlert("Error", "Ya existe una zona con ese nombre");
      return;
    }

    const zonaAntigua = zonas[editingIndex as number];
    setZonas((prev) => prev.map((z, i) => (i === editingIndex ? name : z)));

    mesas
      .filter(
        (m) =>
          (m.zona && m.zona.trim() !== "" ? m.zona : "Sin zona") === zonaAntigua
      )
      .forEach(async (m) => {
        try {
          await updateMesa(m.id, m.capacidad, name);
        } catch (err) {
          console.error("Error renombrando", err);
        }
      });

    setEditingIndex(null);
    setEditingName("");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[65vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Gestionar Zonas
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Zonas (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {zonas.map((zona, i) => {
            const isSystem = zona === "Todas" || zona === "Sin zona";
            const isEditing = editingIndex === i;

            return (
              <div
                key={zona}
                className={`group flex items-center justify-between border rounded-xl p-3 transition-all ${
                  isSystem
                    ? "bg-gray-100 border-gray-300"
                    : "bg-white border-gray-300 hover:border-[#FA9623] hover:shadow-sm"
                }`}
              >
                {isEditing ? (
                  <div className="flex flex-1 gap-2 animate-in fade-in zoom-in-95 duration-200">
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border border- rounded-lg px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-orange-200"
                      autoFocus
                      placeholder="Nombre de zona"
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="text-white bg-green-500 hover:bg-green-600 p-1.5 rounded-lg transition"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="text-gray-500 hover:bg-gray-200 p-1.5 rounded-lg transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center">
                      <span
                        className={`font-medium pl-3 text-base ${
                          isSystem ? "text-gray-500" : "text-gray-800"
                        }`}
                      >
                        {zona}
                      </span>
                    </div>

                    {!isSystem && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(i)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Renombrar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(zona)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Crear Nueva */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <label className="block text-base font-medium text-gray-500 mb-2">
            Agregar Nueva Zona
          </label>
          <div className="flex gap-3">
            <input
              value={newZona}
              onChange={(e) => setNewZona(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddZona()}
              placeholder="Ej. Terraza VIP..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
            <button
              onClick={handleAddZona}
              className="px-6 py-2.5 bg-[#FA9623] text-white rounded-lg font-bold text-base hover:bg-[#e68a1f] shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              Crear
            </button>
          </div>
        </div>
      </div>

      {/* === ALERTAS INTERNAS (Visualmente Mejoradas) === */}
      {internalModal.isOpen && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/30 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {internalModal.title}
              </h3>

              <p className="text-gray-500 text-base mb-6 leading-relaxed">
                {internalModal.message}
              </p>

              <div className="flex gap-3 w-full">
                {internalModal.type === "alert" ? (
                  <button
                    onClick={closeInternal}
                    className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Entendido
                  </button>
                ) : (
                  <>
                    <button
                      onClick={closeInternal}
                      className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmAction}
                      className={`flex-1 py-2.5 text-white rounded-xl font-semibold transition-transform active:scale-95 cursor-pointer ${
                        internalModal.type === "confirm_delete"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-[#FA9623] hover:bg-[#e68a1f]"
                      }`}
                    >
                      {internalModal.type === "confirm_delete"
                        ? "Eliminar"
                        : "Confirmar"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZonasModal;
