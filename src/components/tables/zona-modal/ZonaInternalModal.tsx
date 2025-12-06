import React from "react";
import {
  AlertTriangle,
  Trash2,
  ArrowRightLeft,
  Ban,
  X,
  Check,
} from "lucide-react";

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

  const renderContent = () => {
    switch (modalState.type) {
      // CASO 1: CONFIRMAR ELIMINACIÓN SIMPLE
      case "confirm_delete_empty":
        return (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {modalState.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {modalState.message}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition"
                onClick={closeInternal}
              >
                Cancelar
              </button>
              <button
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-md transition flex justify-center items-center gap-2"
                onClick={() => {
                  eliminarZona(modalState.targetZonaId);
                  closeInternal();
                }}
              >
                <Trash2 size={18} />
                Sí, eliminar
              </button>
            </div>
          </>
        );

      // CASO 2: ELEGIR ACCIÓN COMPLEJA (HAY MESAS)
      case "choose_action":
        return (
          <>
            <div className="flex items-start gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mt-1">
                  {modalState.message}. Hay{" "}
                  <strong>{modalState.tablesCount} mesa(s)</strong> afectada(s).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Opción A: Mover a otra zona */}
              <button
                onClick={() => executeComplexAction("MOVE_OTHER")}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition group flex items-center gap-4 cursor-pointer "
              >
                <div>
                  <div className="font-bold text-gray-800 group-hover:text-blue-700">
                    Mover mesas a otra zona
                  </div>
                  <div className="text-xs text-gray-500">
                    Reasigna las mesas y elimina esta zona.
                  </div>
                </div>
              </button>

              {/* Opción B: Mover a Sin Zona */}
              <button
                onClick={() => executeComplexAction("MOVE_NULL")}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition group flex items-center gap-4 cursor-pointer"
              >
                <div>
                  <div className="font-bold text-gray-800">
                    Mover a "Sin zona"
                  </div>
                  <div className="text-xs text-gray-500">
                    Las mesas quedarán sin asignación.
                  </div>
                </div>
              </button>

              {/* Opción C: Eliminar todo */}
              <button
                onClick={() => executeComplexAction("DELETE_ALL")}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition group flex items-center gap-4 cursor-pointer"
              >
                <div>
                  <div className="font-bold text-gray-800 group-hover:text-red-700">
                    Eliminar zona y mesas
                  </div>
                  <div className="text-xs text-gray-500">
                    Acción destructiva. Se borrarán los datos.
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={closeInternal}
              className="mt-4 w-full py-2.5 text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              Cancelar operación
            </button>
          </>
        );

      // CASO 3: SELECCIONAR DESTINO (Para MOVE_OTHER) - Si tu lógica lo usa
      case "select_destiny":
        return (
          <>
            <h3 className="text-xl font-bold mb-2">Seleccionar Nueva Zona</h3>
            <p className="text-gray-500 text-sm mb-4">
              ¿A dónde quieres mover las mesas?
            </p>

            <div className="space-y-3 mb-6">
              <select
                className="w-full border rounded-xl px-4 py-2 bg-white focus:ring-2 focus:ring-[#FA9623] outline-none"
                value={destinyId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setDestinyId(val === "NEW" ? "NEW" : Number(val));
                }}
              >
                <option value="" disabled>
                  Selecciona una zona...
                </option>
                {zonas
                  .filter((z: any) => z.id !== modalState.targetZonaId) // No mostrar la zona actual
                  .map((z: any) => (
                    <option key={z.id} value={z.id}>
                      {z.nombre}
                    </option>
                  ))}
                <option value="NEW">+ Crear nueva zona de migración</option>
              </select>

              {destinyId === "NEW" && (
                <input
                  className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#FA9623] outline-none"
                  placeholder="Nombre de la nueva zona..."
                  value={newZoneNameMigration}
                  onChange={(e) => setNewZoneNameMigration(e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-100 py-2 rounded-xl font-medium"
                onClick={closeInternal}
              >
                Cancelar
              </button>
              <button
                className="flex-1 bg-[#FA9623] text-white py-2 rounded-xl font-bold shadow-md"
                onClick={() => executeComplexAction("CONFIRM_MOVE")}
              >
                Confirmar
              </button>
            </div>
          </>
        );

      // CASO DEFAULT (ALERTAS SIMPLES)
      default:
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              {modalState.title}
            </h3>
            <p className="text-gray-600 mb-6">{modalState.message}</p>
            <button
              onClick={closeInternal}
              className="w-full bg-gray-800 text-white py-2.5 rounded-xl font-medium"
            >
              Entendido
            </button>
          </div>
        );
    }
  };

  return (
    // Z-INDEX 60 para estar encima del ZonaModal (que suele ser z-50)
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop más oscuro */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] animate-in fade-in duration-200"
        onClick={closeInternal}
      />

      {/* Card del Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Botón X de cierre rápido */}
        <button
          onClick={closeInternal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X size={20} />
        </button>

        {renderContent()}
      </div>
    </div>
  );
};
