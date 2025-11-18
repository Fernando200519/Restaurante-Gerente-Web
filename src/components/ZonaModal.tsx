import { X, Trash2, Pencil } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useMesasContext } from "../context/MesasContext";

interface Props {
  visible: boolean;
  zonas: string[];
  setZonas: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}

// Configuración para las alertas internas
type InternalModalState = {
  isOpen: boolean;
  type: "alert" | "confirm_delete" | "confirm_move"; // Tipos de mensaje
  title: string;
  message: string;
  targetZona?: string; // Para saber qué borrar cuando confirmen
};

const ZonasModal: React.FC<Props> = ({ visible, zonas, setZonas, onClose }) => {
  const { mesas, updateMesa } = useMesasContext();

  const [newZona, setNewZona] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  // ESTADO PARA LAS ALERTAS MODALES
  const [internalModal, setInternalModal] = useState<InternalModalState>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  // Bloquear scroll
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
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

  // --- FUNCIONES PARA MOSTRAR ALERTAS ---
  const showAlert = (title: string, message: string) => {
    setInternalModal({ isOpen: true, type: "alert", title, message });
  };

  const closeInternal = () => {
    setInternalModal((prev) => ({ ...prev, isOpen: false }));
  };

  // --- LÓGICA PRINCIPAL ---

  const handleAddZona = () => {
    const z = newZona.trim();
    if (z === "") return;
    if (z === "Todas" || z === "Sin zona") {
      showAlert(
        "Nombre Reservado",
        `No puedes usar el nombre reservado "${z}"`
      );
      return;
    }
    if (zonas.includes(z)) {
      showAlert("Duplicado", "Esa zona ya existe");
      return;
    }
    setZonas((prev) => [...prev, z]);
    setNewZona("");
  };

  // Paso 1: Validar click de eliminar y abrir modal de confirmación
  const handleDeleteClick = (zona: string) => {
    if (zona === "Todas" || zona === "Sin zona") {
      showAlert("Acción denegada", `No puedes eliminar la zona '${zona}'`);
      return;
    }

    const mesasDeZona = mesas.filter(
      (m) => (m.zona && m.zona.trim() !== "" ? m.zona : "Sin zona") === zona
    );

    // Caso 1: Zona vacía
    if (mesasDeZona.length === 0) {
      setInternalModal({
        isOpen: true,
        type: "confirm_delete",
        title: "Eliminar Zona",
        message: `¿Seguro que deseas eliminar la zona "${zona}"?`,
        targetZona: zona,
      });
      return;
    }

    // Caso 2: Zona ocupada (Error)
    const hayNoLibres = mesasDeZona.some((m) => m.estado !== "LIBRE");
    if (hayNoLibres) {
      showAlert(
        "No se puede eliminar",
        "No puedes eliminar esta zona porque contiene mesas que no están libres."
      );
      return;
    }

    // Caso 3: Zona con mesas libres (Confirmación mover)
    setInternalModal({
      isOpen: true,
      type: "confirm_move",
      title: "Mover y Eliminar",
      message: `Todas las mesas en "${zona}" están libres. Si eliminas la zona, esas mesas pasarán a "Sin zona". ¿Deseas continuar?`,
      targetZona: zona,
    });
  };

  // Paso 2: Ejecutar acción al confirmar
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

    // Eliminar zona (común para ambos casos)
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      {/* === TU MODAL ORIGINAL (INTACTO) === */}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Gestionar Zonas</h2>

        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
          {zonas.map((zona, i) => (
            <div
              key={zona}
              className="flex items-center justify-between border rounded-lg p-2"
            >
              {editingIndex === i ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
              ) : (
                <span className="text-gray-700">{zona}</span>
              )}

              <div className="flex gap-2">
                {editingIndex === i ? (
                  <button
                    onClick={handleSaveEdit}
                    className="text-blue-600 font-medium text-sm"
                  >
                    Guardar
                  </button>
                ) : (
                  <>
                    {zona !== "Todas" && zona !== "Sin zona" && (
                      <button
                        onClick={() => handleEdit(i)}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                    {zona !== "Todas" && zona !== "Sin zona" && (
                      <button
                        onClick={() => handleDeleteClick(zona)} // 👈 Usamos la nueva función
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <input
            value={newZona}
            onChange={(e) => setNewZona(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddZona()}
            placeholder="Nueva zona..."
            className="w-full border rounded px-3 py-2 text-sm"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 font-medium"
            >
              Cerrar
            </button>
            <button
              onClick={handleAddZona}
              className="px-4 py-2 bg-[#FA9623] text-white rounded font-medium hover:bg-[#e88b1f]"
            >
              Crear nueva zona
            </button>
          </div>
        </div>
      </div>

      {/* === NUEVAS ALERTAS MODALES (Superpuestas) === */}
      {internalModal.isOpen && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-100 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-lg font-bold text-[#000000] mb-2">
                {internalModal.title}
              </h3>

              <p className="text-gray-700 mb-6">{internalModal.message}</p>

              <div className="flex gap-3 w-full">
                {/* Si es solo alerta, botón único */}
                {internalModal.type === "alert" ? (
                  <button
                    onClick={closeInternal}
                    className="w-full py-2.5 bg-gray-100 text-gray-700 rounded font-medium hover:bg-gray-200 transition-colors"
                  >
                    Entendido
                  </button>
                ) : (
                  // Si es confirmación, dos botones
                  <>
                    <button
                      onClick={closeInternal}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmAction}
                      className={`flex-1 py-2.5 text-white rounded font-medium shadow-sm transition-colors ${
                        internalModal.type === "confirm_delete"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-[#FA9623] hover:bg-[#e88b1f]"
                      }`}
                    >
                      {internalModal.type === "confirm_delete"
                        ? "Eliminar"
                        : "Mover y Borrar"}
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
