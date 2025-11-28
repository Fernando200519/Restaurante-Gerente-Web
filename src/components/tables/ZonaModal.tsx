import { X, Trash2, Pencil, Check, Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useMesas } from "../../hooks/useMesas";
import { Zona } from "../../types/mesa";

interface Props {
  visible: boolean;
  onClose: () => void;

  zonas: Zona[];
  crearZona: (nombre: string) => Promise<void>;
  actualizarZona: (
    id: number,
    nombre: string,
    estado?: "Activa" | "Inactiva"
  ) => Promise<void>;

  eliminarZona: (id: number) => Promise<void>;
  eliminarZonaConMesas: (id: number) => Promise<void>;
  toggleEstadoZona: (zona: Zona) => Promise<void>;
}

type InternalModalState = {
  isOpen: boolean;
  // support multiple modal flows
  type:
    | "alert"
    | "confirm_delete_empty"
    | "choose_action"
    | "select_destination";
  title: string;
  message: string;
  targetZonaId?: number;
  // number of tables contained in the target zone (optional)
  tablesCount?: number;
};

const ZonasModal: React.FC<Props> = ({
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
    moverMesasDeZonaContext,
    migrarMesasNuevaZonaContext,
    actualizarMesa,
  } = useMesas();

  const [newZona, setNewZona] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const [modalState, setModalState] = useState<InternalModalState>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  // Selection / flow state for complex actions
  const [selectedOption, setSelectedOption] = useState<
    "DELETE_ALL" | "MOVE_OTHER" | "MOVE_NULL" | null
  >(null);
  const [destinyId, setDestinyId] = useState<number | "NEW" | null>(null);
  const [newZoneNameMigration, setNewZoneNameMigration] = useState("");

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  // --- PREPARAR LISTA VISUAL (ORDENADA) ---
  const uiZonas = [
    "Todas", // 1. "Todas" siempre va primero fijo
    ...[...zonas] // Creamos una copia para no mutar el original
      .sort((a, b) => {
        const nombreA = a.nombre.trim().toLowerCase();
        const nombreB = b.nombre.trim().toLowerCase();

        // 2. "Sin zona" va justo después de Todas
        if (nombreA === "sin zona") return -1;
        if (nombreB === "sin zona") return 1;

        // 3. El resto mantiene su orden original (o usa return nombreA.localeCompare(nombreB) para alfabético)
        return 0;
      })
      .map((z) => z.nombre),
  ];

  const showAlert = (title: string, message: string) => {
    setModalState({ isOpen: true, type: "alert", title, message });
  };

  const closeInternal = () => {
    setModalState((p) => ({ ...p, isOpen: false }));
    setSelectedOption(null);
    setDestinyId(null);
    setNewZoneNameMigration("");
  };

  const handleAddZona = async () => {
    const z = newZona.trim();
    if (!z) return;

    const reservados = ["Todas", "Sin zona"];

    if (reservados.includes(z)) {
      showAlert("Nombre reservado", `"${z}" no se puede usar.`);
      return;
    }

    if (zonas.some((x) => x.nombre.toLowerCase() === z.toLowerCase())) {
      showAlert("Duplicado", "Ya existe una zona con ese nombre.");
      return;
    }

    try {
      await crearZona(z);
      setNewZona("");
    } catch {
      showAlert("Error", "No se pudo crear la zona.");
    }
  };

  const handleDeleteClick = (zonaName: string) => {
    if (zonaName === "Todas" || zonaName === "Sin zona") {
      showAlert("Denegado", "Esta zona no puede eliminarse.");
      return;
    }

    const zonaObj = zonas.find((z) => z.nombre === zonaName);
    if (!zonaObj) return;

    const mesasDeZona = mesas.filter((m) => m.zonaId === zonaObj.id);

    if (mesasDeZona.length === 0) {
      setModalState({
        isOpen: true,
        type: "confirm_delete_empty",
        title: "Eliminar Zona",
        message: `¿Eliminar "${zonaName}"?`,
        targetZonaId: zonaObj.id,
      });
      return;
    }

    if (mesasDeZona.some((m) => m.estado !== "LIBRE")) {
      showAlert(
        "Zona ocupada",
        "No puedes eliminar esta zona porque contiene mesas activas."
      );
      return;
    }

    setModalState({
      isOpen: true,
      type: "choose_action",
      title: "Zona con mesas libres",
      message: `Esta zona contiene ${mesasDeZona.length} mesas libres. ¿Qué deseas hacer?`,
      tablesCount: mesasDeZona.length,
      targetZonaId: zonaObj.id,
    });
  };

  const confirmAction = async () => {
    const { type, targetZonaId } = modalState;
    if (!targetZonaId) return;

    try {
      if (type === "confirm_delete_empty") {
        await eliminarZona(targetZonaId);
      } else {
        // default fallback
        await eliminarZona(targetZonaId);
      }
    } catch {
      showAlert("Error", "No se pudo eliminar la zona.");
    }

    closeInternal();
  };

  const handleEdit = (zonaName: string) => {
    if (zonaName === "Todas" || zonaName === "Sin zona") return;

    const zonaObj = zonas.find((z) => z.nombre === zonaName);
    if (!zonaObj) return;

    setEditingId(zonaObj.id);
    setEditingName(zonaObj.nombre);
  };

  const handleSaveEdit = async () => {
    const name = editingName.trim();
    if (!name) return;

    if (["Todas", "Sin zona"].includes(name)) {
      showAlert("Error", "Nombre reservado.");
      return;
    }

    if (
      zonas.some(
        (z) =>
          z.nombre.toLowerCase() === name.toLowerCase() && z.id !== editingId
      )
    ) {
      showAlert("Error", "Ya existe una zona con ese nombre.");
      return;
    }

    try {
      await actualizarZona(editingId!, name);
      setEditingId(null);
      setEditingName("");
    } catch {
      showAlert("Error", "No se pudo actualizar la zona.");
    }
  };

  const executeComplexAction = async (forcedOption?: string) => {
    const { targetZonaId } = modalState;
    if (!targetZonaId) return;

    // 1. Prioridad al argumento forzado (del clic) sobre el estado
    const optionToUse = forcedOption || selectedOption;

    console.log("Ejecutando acción:", optionToUse); // Ahora debería decir "MOVE_NULL"

    try {
      // OPCIÓN A: Eliminar todo
      if (optionToUse === "DELETE_ALL") {
        await eliminarZonaConMesas(targetZonaId);
      }

      // OPCIÓN B: Mover a otra zona (Flujo de 2 pasos)
      else if (optionToUse === "MOVE_OTHER") {
        if (destinyId === "NEW") {
          if (!newZoneNameMigration.trim()) return alert("Nombre requerido");
          await migrarMesasNuevaZonaContext(targetZonaId, newZoneNameMigration);
        } else {
          await moverMesasDeZonaContext(targetZonaId, Number(destinyId));
        }
        await eliminarZona(targetZonaId);
      }

      // OPCIÓN C: Mover a "Sin Zona"
      else if (optionToUse === "MOVE_NULL") {
        // Buscar ID real de "Sin Zona" (insensible a mayúsculas)
        const sinZonaReal = zonas.find(
          (z) => z.nombre.trim().toLowerCase() === "sin zona"
        );

        if (!sinZonaReal) {
          alert(
            "Error crítico: No encuentro la zona 'Sin Zona' en la base de datos."
          );
          return;
        }

        // Movemos las mesas una por una al ID de "Sin Zona"
        const mesasAMover = mesas.filter((m) => m.zonaId === targetZonaId);

        await Promise.all(
          mesasAMover.map((m) =>
            actualizarMesa(m.id, m.capacidad, sinZonaReal.id)
          )
        );

        await eliminarZona(targetZonaId);
      }

      closeInternal();
    } catch (error) {
      console.error("Error executeComplexAction:", error);
      alert("Ocurrió un error al procesar la solicitud.");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop Principal */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* === MODAL PRINCIPAL (LISTA DE ZONAS) === */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[65vh] transform transition-all scale-100">
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

        {/* Lista de Zonas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {uiZonas.map((zonaNombre) => {
            // ⚠️ AJUSTE AQUÍ:
            const isSystem =
              zonaNombre === "Todas" || zonaNombre === "Sin zona";
            const zonaObj = zonas.find((z) => z.nombre === zonaNombre);
            const isEditing = zonaObj && editingId === zonaObj.id;
            // Estado visual: Si está inactiva la mostramos "apagada"
            const isDisabled = zonaObj ? zonaObj.estado === "Inactiva" : false;

            return (
              <div
                key={zonaNombre}
                className={`group flex items-center justify-between border rounded-xl p-3 transition-all ${
                  isSystem
                    ? "bg-gray-100 border-gray-300"
                    : isDisabled
                    ? "bg-gray-50 border-gray-200 opacity-75"
                    : "bg-white border-gray-300 hover:border-[#FA9623] hover:shadow-sm"
                }`}
              >
                {isEditing ? (
                  /* --- MODO EDICIÓN --- */
                  <div className="flex flex-1 gap-2 animate-in fade-in zoom-in-95 duration-200">
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-orange-200"
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
                      onClick={() => setEditingId(null)}
                      className="text-gray-500 hover:bg-gray-200 p-1.5 rounded-lg transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  /* --- MODO VISUALIZACIÓN --- */
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-medium text-base ${
                          isSystem
                            ? "text-gray-500"
                            : isDisabled
                            ? "text-gray-400 line-through decoration-gray-300"
                            : "text-gray-800"
                        }`}
                      >
                        {zonaNombre}
                      </span>
                    </div>

                    {!isSystem && zonaObj && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Botón Toggle Estado (Ojo/Ojo Tachado) */}
                        <button
                          onClick={() => toggleEstadoZona(zonaObj)}
                          className={`p-2 rounded-lg transition cursor-pointer ${
                            isDisabled
                              ? "text-gray-400 hover:text-green-600 hover:bg-green-50"
                              : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          }`}
                          title={
                            isDisabled ? "Activar zona" : "Desactivar zona"
                          }
                        >
                          {isDisabled ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => handleEdit(zonaNombre)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Renombrar"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(zonaNombre)}
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
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
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

      {/* === MODAL INTERNO DINÁMICO (Las 3 Opciones) === */}
      {modalState.isOpen && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/30 backdrop-blur-[1px] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100 flex flex-col max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              {modalState.title}
            </h3>
            <p className="text-gray-800 text-center mb-6 text-base">
              {modalState.message}
            </p>

            {/* CASO 1: CONFIRMAR BORRADO SIMPLE (ZONA VACÍA) */}
            {modalState.type === "confirm_delete_empty" && (
              <div className="flex gap-3">
                <button
                  onClick={closeInternal}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      await eliminarZona(modalState.targetZonaId!);
                    } catch {
                      showAlert("Error", "No se pudo eliminar la zona.");
                    }
                    closeInternal();
                  }}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg"
                >
                  Sí, Eliminar
                </button>
              </div>
            )}

            {/* CASO 2: MENÚ DE 3 OPCIONES (ZONA CON MESAS) */}
            {modalState.type === "choose_action" && (
              <div className="space-y-3">
                {/* Opción 1: Eliminar Todo */}
                <button
                  // ✅ Pasa el string explícito aquí
                  onClick={() => executeComplexAction("DELETE_ALL")}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl flex items-center gap-3 text-left transition-all group cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-lg">Eliminar todo</div>
                    <div className="text-base">
                      Borra la zona y sus {modalState.tablesCount} mesas.
                    </div>
                  </div>
                </button>

                {/* Opción 2: Mover a Otra Zona */}
                <button
                  onClick={() => {
                    setSelectedOption("MOVE_OTHER");
                    setModalState((p) => ({
                      ...p,
                      type: "select_destination",
                      title: "Mover Mesas",
                    }));
                  }}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl flex items-center gap-3 text-left transition-all group cursor-pointer"
                >
                  {/* Usa Pencil o ArrowRightLeft si tienes */}
                  <div>
                    <div className="font-bold text-lg">Mover a otra zona</div>
                    <div className="text-base">
                      Elige una zona existente o crea una.
                    </div>
                  </div>
                </button>

                {/* Opción 3: Mover a Sin Zona */}
                <button
                  // ✅ AHORA (Correcto):
                  // Pasamos el string directo a la función. No dependemos del estado.
                  onClick={() => executeComplexAction("MOVE_NULL")}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl flex items-center gap-3 text-left transition-all group cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-lg">Mover a "Sin Zona"</div>
                    <div className="text-base">Las mesas quedarán sueltas.</div>
                  </div>
                </button>

                <button
                  onClick={closeInternal}
                  className="w-full py-2 text-gray-400 font-bold mt-2 hover:text-gray-600 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* CASO 3: SELECCIONAR DESTINO (Sub-paso de Mover) */}
            {modalState.type === "select_destination" && (
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                  Selecciona el destino:
                </label>
                <select
                  className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
                  onChange={(e) => {
                    const v = e.target.value;
                    setDestinyId(v === "NEW" ? "NEW" : Number(v));
                  }}
                  value={destinyId ?? ""}
                >
                  <option value="" disabled>
                    Selecciona una opción...
                  </option>
                  <option value="NEW" className="font-bold text-blue-600">
                    + Crear Nueva Zona
                  </option>
                  <hr />
                  {zonas
                    .filter(
                      (z) =>
                        z.id !== modalState.targetZonaId &&
                        z.estado !== "Inactiva"
                    )
                    .map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.nombre}
                      </option>
                    ))}
                </select>

                {destinyId === "NEW" && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <input
                      placeholder="Nombre de la nueva zona"
                      className="w-full p-3 border-2 border-blue-100 rounded-xl outline-none focus:border-blue-300"
                      value={newZoneNameMigration}
                      onChange={(e) => setNewZoneNameMigration(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      setModalState((p) => ({ ...p, type: "choose_action" }))
                    }
                    className="flex-1 py-2.5 text-gray-500 font-bold bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
                    Atrás
                  </button>
                  <button
                    // ✅ CORRECCIÓN AQUÍ:
                    // Usamos () => executeComplexAction() para no pasar el evento del click por error.
                    // Al no pasar nada, la función usará el 'selectedOption' que ya está guardado en el estado ("MOVE_OTHER").
                    onClick={() => executeComplexAction()}
                    disabled={
                      !destinyId ||
                      (destinyId === "NEW" && !newZoneNameMigration)
                    }
                    className="flex-1 py-2.5 bg-[#FA9623] hover:bg-[#e68a1f] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    Confirmar Mover
                  </button>
                </div>
              </div>
            )}

            {/* CASO 4: ALERTA SIMPLE */}
            {modalState.type === "alert" && (
              <button
                onClick={closeInternal}
                className="w-full py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl mt-4 hover:bg-gray-200"
              >
                Entendido
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZonasModal;
