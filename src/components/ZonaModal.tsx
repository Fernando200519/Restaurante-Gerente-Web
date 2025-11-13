// src/components/ZonasModal.tsx
import React, { useState } from "react";
import { X, Pencil, Trash2, Plus } from "lucide-react";

interface Props {
  visible: boolean;
  zonas: string[];
  setZonas: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}

const ZonasModal: React.FC<Props> = ({ visible, zonas, setZonas, onClose }) => {
  const [editing, setEditing] = useState<string | null>(null);
  const [newZona, setNewZona] = useState("");
  const [tempName, setTempName] = useState("");

  if (!visible) return null;

  const handleSaveEdit = (oldName: string) => {
    if (!tempName.trim()) return;
    setZonas((prev) => prev.map((z) => (z === oldName ? tempName.trim() : z)));
    setEditing(null);
  };

  const handleDelete = (zona: string) => {
    if (zona === "Todas") return alert("No puedes eliminar la zona 'Todas'");
    setZonas((prev) => prev.filter((z) => z !== zona));
  };

  const handleAddZona = () => {
    if (!newZona.trim()) return;
    if (zonas.includes(newZona.trim())) return alert("Esa zona ya existe.");
    setZonas((prev) => [...prev, newZona.trim()]);
    setNewZona("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Gestión de Zonas</h3>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto mb-4">
          {zonas.map((zona) => (
            <div
              key={zona}
              className="flex items-center justify-between border-b py-2"
            >
              {editing === zona ? (
                <input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="border px-2 py-1 rounded w-full mr-2"
                  autoFocus
                />
              ) : (
                <span className="text-gray-800 font-medium">{zona}</span>
              )}

              <div className="flex items-center gap-2">
                {editing === zona ? (
                  <button
                    onClick={() => handleSaveEdit(zona)}
                    className="text-green-600 text-sm font-semibold"
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditing(zona);
                      setTempName(zona);
                    }}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    <Pencil size={18} />
                  </button>
                )}
                {zona !== "Todas" && (
                  <button
                    onClick={() => handleDelete(zona)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            value={newZona}
            onChange={(e) => setNewZona(e.target.value)}
            placeholder="Nombre nueva zona..."
            className="border px-3 py-2 rounded w-full"
          />
          <button
            onClick={handleAddZona}
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold flex items-center gap-1"
          >
            <Plus size={18} /> Crear
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZonasModal;
