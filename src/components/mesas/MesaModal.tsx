// src/components/MesaModal.tsx
import React, { useEffect, useState } from "react";
import { Mesa } from "../../types/mesa";
import { useMesasContext } from "../../context/MesasContext";
import MesaStatusTimeline from "./MesaStatusTimeline";

interface Props {
  mesa: Mesa | null;
  visible: boolean;
  onClose: () => void;
  zonas?: string[]; // <= Necesario para selector de zonas
}

const predefined = [2, 4, 6, 8];

const MesaModal: React.FC<Props> = ({ mesa, visible, onClose, zonas = [] }) => {
  const { updateMesa, deleteMesa, openMesaById } = useMesasContext();

  const [activeTab, setActiveTab] = useState<"DETALLES" | "EDITAR">("DETALLES");
  const [localMesa, setLocalMesa] = useState<Mesa | null>(mesa);

  // --- Nombre ---
  const [nombre, setNombre] = useState(mesa?.nombre ?? "");

  // --- Capacidad con lógica nueva ---
  const [capacidad, setCapacidad] = useState<number | "otro">(4);
  const [otroValor, setOtroValor] = useState<number | "">("");

  // --- Zona ---
  const [zona, setZona] = useState(mesa?.zona ?? "Sin zona");

  const [loading, setLoading] = useState(false);

  // --- NUEVO: Bloquear scroll del body cuando el modal está visible ---
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
  // -------------------------------------------------------------------

  useEffect(() => {
    if (!mesa) return;

    setLocalMesa(mesa);
    setNombre(mesa.nombre);

    // Capacidad
    if (predefined.includes(mesa.capacidad)) {
      setCapacidad(mesa.capacidad);
      setOtroValor("");
    } else {
      setCapacidad("otro");
      setOtroValor(mesa.capacidad);
    }

    // Zona
    setZona(mesa.zona ?? "Sin zona");

    setActiveTab("DETALLES");
  }, [mesa]);

  // Recargar datos frescos
  useEffect(() => {
    (async () => {
      if (!mesa) return;
      const fresh = await openMesaById(mesa.id);
      if (fresh) setLocalMesa(fresh);
    })();
  }, [mesa]);

  if (!visible || !localMesa) return null;

  const isEditable = localMesa.estado === "LIBRE";

  const handleSave = async () => {
    if (!isEditable) return;

    let finalCapacidad =
      capacidad === "otro" ? Number(otroValor) : (capacidad as number);

    if (finalCapacidad > 100) finalCapacidad = 100;
    if (finalCapacidad < 1) finalCapacidad = 1;

    setLoading(true);
    try {
      await updateMesa(localMesa.id, finalCapacidad, zona, nombre);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditable) return;
    if (
      !confirm(
        `¿Eliminar ${localMesa.nombre}? Esta acción no se puede deshacer.`
      )
    )
      return;

    setLoading(true);
    try {
      await deleteMesa(localMesa.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg p-6 z-10 w-full max-w-3xl max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {localMesa.nombre} — {localMesa.estado}
          </h3>
          <button onClick={onClose} className="text-gray-500">
            Cerrar
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("DETALLES")}
              className={`pb-2 ${
                activeTab === "DETALLES"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Detalles
            </button>

            <button
              onClick={() => setActiveTab("EDITAR")}
              className={`pb-2 ${
                activeTab === "EDITAR"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Editar mesa
            </button>
          </nav>
        </div>

        {/* ---------------------- DETALLES ---------------------- */}
        {activeTab === "DETALLES" && (
          <div>{/* ... TU BLOQUE DE DETALLES SIN CAMBIOS ... */}</div>
        )}

        {/* ---------------------- EDITAR ---------------------- */}
        {activeTab === "EDITAR" && (
          <div>
            {!isEditable && (
              <div className="mb-4 p-3 bg-gray-50 border rounded text-sm text-gray-600">
                No se puede editar una mesa en servicio. Cambia el estado a
                "LIBRE" primero.
              </div>
            )}

            <div className="space-y-3">
              {/* Nombre */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Nombre
                </label>
                <input
                  disabled={!isEditable}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Capacidad */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Capacidad
                </label>
                <select
                  disabled={!isEditable}
                  value={capacidad}
                  onChange={(e) =>
                    setCapacidad(
                      e.target.value === "otro"
                        ? "otro"
                        : Number(e.target.value)
                    )
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  {predefined.map((n) => (
                    <option key={n} value={n}>
                      {n} personas
                    </option>
                  ))}
                  <option value="otro">Otro</option>
                </select>

                {capacidad === "otro" && (
                  <input
                    disabled={!isEditable}
                    type="number"
                    value={otroValor}
                    placeholder="Máximo 100"
                    min={1}
                    max={100}
                    className="w-full border rounded px-3 py-2 mt-2"
                    onKeyDown={(e) => {
                      if (["e", "E", "-", "+", "."].includes(e.key))
                        e.preventDefault();
                    }}
                    onChange={(e) => {
                      const valStr = e.target.value;
                      if (valStr === "") return setOtroValor("");

                      let val = parseInt(valStr, 10);
                      if (val > 100) val = 100;
                      if (val < 1) val = 1;
                      setOtroValor(val);
                    }}
                  />
                )}
              </div>

              {/* ZONA */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Zona</label>
                <select
                  disabled={!isEditable}
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  {zonas.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              {/* BOTONES */}
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={onClose} className="px-4 py-2 border rounded">
                  Cancelar
                </button>

                <button
                  onClick={handleSave}
                  disabled={!isEditable || loading}
                  className={`px-4 py-2 rounded ${
                    isEditable
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  Guardar
                </button>

                <button
                  onClick={handleDelete}
                  disabled={!isEditable || loading}
                  className={`px-4 py-2 rounded ${
                    isEditable
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MesaModal;
