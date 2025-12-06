import React from "react";
import { Pencil, Trash2, Eye, EyeOff, Check, X } from "lucide-react";

interface ZonaListProps {
  uiZonas: string[];
  zonas: any[];
  mesas: any[]; // <--- AGREGAR ESTO
  editingId: number | null;
  editingName: string;
  setEditingName: (value: string) => void;
  setEditingId: (id: number | null) => void;
  handleEdit: (zona: any) => void;
  handleSaveEdit: () => void;
  handleDeleteClick: (zonaNombre: string) => void;
  toggleEstadoZona: (zona: any) => void;
}

export const ZonaList: React.FC<ZonaListProps> = ({
  uiZonas,
  zonas,
  mesas, // <--- RECIBIR MESAS
  editingId,
  editingName,
  setEditingName,
  setEditingId,
  handleEdit,
  handleSaveEdit,
  handleDeleteClick,
  toggleEstadoZona,
}) => {
  // Definir qué estados bloquean la desactivación
  const estadosActivos = ["OCUPADA", "ESPERANDO", "AGRUPADA"];

  return (
    <div className="space-y-3">
      {(uiZonas ?? []).map((zonaNombre: string) => {
        const zonaObj = zonas.find((z) => z.nombre === zonaNombre);
        const isSinZona = zonaNombre.trim().toLowerCase() === "sin zona";
        const isDisabled = zonaObj?.estado === "Inactiva";
        const isEditing = zonaObj && zonaObj.id === editingId;

        // 1. Filtrar mesas y detectar estado
        const mesasDeEstaZona = (mesas ?? []).filter(
          (m) => m.zona === zonaNombre
        );

        const tieneMesasOcupadas = mesasDeEstaZona.some((m) =>
          estadosActivos.includes(m.estado)
        );

        // 2. Lógica de Bloqueo

        // Bloqueo Toggle (Ojo): Si está activa y tiene mesas ocupadas
        const isToggleBlocked = !isDisabled && tieneMesasOcupadas;

        // ************ CORRECCIÓN CLAVE ************
        // Bloqueo Delete (Papelera):
        // - Si es "Sin zona": Bloquear si NO hay mesas (nada que limpiar).
        // - Si es zona normal: Bloquear si tiene mesas OCUPADAS (en servicio).
        const isDeleteBlocked = isSinZona
          ? mesasDeEstaZona.length === 0
          : tieneMesasOcupadas;
        // *****************************************

        // Estilos
        const rowStyle = isDisabled
          ? "bg-gray-100 border-gray-300 text-gray-500 opacity-80"
          : "bg-white border-gray-200 text-gray-800 hover:shadow-md hover:border-blue-300 transition-all";

        return (
          <div
            key={zonaNombre}
            className={`group flex items-center justify-between border rounded-xl p-4 ${rowStyle}`}
          >
            {/* === MODO EDICIÓN === */}
            {isEditing ? (
              <div className="flex w-full gap-3 items-center">
                <input
                  className="flex-1 border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 outline-none"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />

                {/* Guardar */}
                <button
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                  onClick={handleSaveEdit}
                >
                  <Check size={18} />
                </button>

                {/* Cancelar */}
                <button
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                  onClick={() => setEditingId(null)}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                {/* === MODO VISUALIZACIÓN === */}
                <div className="flex items-center gap-3">
                  {/* Nombre */}
                  <span
                    className={`font-semibold text-lg ${
                      isDisabled ? "text-gray-500" : "text-gray-800"
                    }`}
                  >
                    {zonaNombre}
                  </span>
                </div>

                {/* Acciones */}
                {zonaObj && (
                  <div className="flex gap-1">
                    {/* 1. Toggle estado (OCULTO SI ES SIN ZONA) */}
                    {!isSinZona && (
                      <button
                        onClick={() =>
                          !isToggleBlocked && toggleEstadoZona(zonaObj)
                        }
                        disabled={isToggleBlocked}
                        className={`p-2 rounded-lg transition 
                          ${
                            isDisabled
                              ? "text-green-600 hover:bg-green-100"
                              : isToggleBlocked
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-red-500 hover:bg-red-100"
                          }`}
                        title={
                          isToggleBlocked
                            ? "No se puede desactivar: Hay mesas ocupadas en esta zona."
                            : isDisabled
                            ? "Activar zona"
                            : "Desactivar zona"
                        }
                      >
                        {isDisabled ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    )}

                    {/* 2. Editar (OCULTO SI ES SIN ZONA) */}
                    {!isSinZona && (
                      <button
                        onClick={() => handleEdit(zonaObj)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition"
                        title="Editar nombre"
                      >
                        <Pencil size={18} />
                      </button>
                    )}

                    {/* Botón Eliminar / Limpiar */}
                    <button
                      onClick={() =>
                        !isDeleteBlocked && handleDeleteClick(zonaNombre)
                      }
                      disabled={isDeleteBlocked}
                      className={`p-2 rounded-lg transition 
                        ${
                          isDeleteBlocked
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-red-500 hover:bg-red-100"
                        }`}
                      title={
                        isDeleteBlocked
                          ? isSinZona
                            ? "No hay mesas para limpiar."
                            : "No se puede eliminar: Hay mesas ocupadas."
                          : isSinZona
                          ? "Limpiar mesas"
                          : "Eliminar zona"
                      }
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
  );
};
