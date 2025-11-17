// src/components/MesaModal.tsx
import React, { useEffect, useState } from "react";
import { Mesa } from "../types/mesa";
import { useMesasContext } from "../context/MesasContext";
import MesaStatusTimeline from "./MesaStatusTimeline";

interface Props {
  mesa: Mesa | null;
  visible: boolean;
  onClose: () => void;
}

const MesaModal: React.FC<Props> = ({ mesa, visible, onClose }) => {
  const { updateMesa, deleteMesa, openMesaById } = useMesasContext();
  const [activeTab, setActiveTab] = useState<"DETALLES" | "EDITAR">("DETALLES");
  const [localMesa, setLocalMesa] = useState<Mesa | null>(mesa);
  const [capacidad, setCapacidad] = useState<number>(mesa?.capacidad ?? 4);
  const [nombre, setNombre] = useState<string>(mesa?.nombre ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalMesa(mesa ?? null);
    setCapacidad(mesa?.capacidad ?? 4);
    setNombre(mesa?.nombre ?? "");
    setActiveTab("DETALLES");
  }, [mesa]);

  // Re-fetch latest mesa with orders when opening details:
  useEffect(() => {
    (async () => {
      if (!mesa) return;
      const fresh = await openMesaById(mesa.id);
      if (fresh) setLocalMesa(fresh);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesa]);

  if (!visible || !localMesa) return null;

  const isEditable = localMesa.estado === "LIBRE";

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateMesa(localMesa.id, capacidad);
      // updateMesa will update context; close modal after
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

        {activeTab === "DETALLES" && (
          <div>
            {localMesa.estado === "LIBRE" && (
              <div className="p-4 bg-gray-50 border rounded">
                Mesa libre. No hay órdenes activas.
              </div>
            )}

            {localMesa.estado === "OCUPADA" && (
              <>
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Mesero</div>
                  <div className="font-medium">{localMesa.mesero ?? "—"}</div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500">Tiempo</div>
                  <div className="font-medium">
                    {localMesa.updatedAt ? timeSince(localMesa.updatedAt) : "—"}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500">Monto actual</div>
                  <div className="font-medium">
                    ${localMesa.orden?.montoTotal ?? 0}
                  </div>
                </div>

                {/* Ordenes / comensales */}
                <div className="space-y-3">
                  {localMesa.orden?.comensales.map((c) => (
                    <div key={c.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{c.nombre}</div>
                        <div className="text-sm text-gray-500">
                          ${c.montoTotal ?? 0}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {c.platillos.map((p) => (
                          <MesaStatusTimeline key={p.id} platillo={p} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {localMesa.estado === "ESPERANDO" && (
              <>
                <div className="p-3 bg-yellow-50 border rounded mb-3">
                  Cuenta solicitada / Esperando cuenta
                </div>
                <div className="mb-3">Mesero: {localMesa.mesero ?? "—"}</div>
                <div className="mb-3">
                  Monto: ${localMesa.orden?.montoTotal ?? 0}
                </div>
              </>
            )}

            {localMesa.estado === "AGRUPADA" && (
              <>
                <div className="mb-3">
                  Mesas agrupadas: {localMesa.grupo ?? "—"}
                </div>
                {/* Reusar vista ocupada para mostrar órdenes combinadas */}
                {localMesa.orden && (
                  <>
                    <div className="mb-3">
                      Monto: ${localMesa.orden.montoTotal}
                    </div>
                    <div className="space-y-2">
                      {localMesa.orden.comensales.map((c) => (
                        <div
                          key={c.id}
                          className="border rounded p-3 bg-gray-50"
                        >
                          <div className="font-medium">{c.nombre}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "EDITAR" && (
          <div>
            {!isEditable && (
              <div className="mb-4 p-3 bg-gray-50 border rounded text-sm text-gray-600">
                No se puede editar una mesa en servicio. Cambia el estado a
                "LIBRE" primero.
              </div>
            )}

            <div className="space-y-3">
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

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Capacidad
                </label>
                <input
                  disabled={!isEditable}
                  type="number"
                  value={capacidad}
                  onChange={(e) => setCapacidad(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

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

function timeSince(iso?: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${min % 60} min`;
}

export default MesaModal;
