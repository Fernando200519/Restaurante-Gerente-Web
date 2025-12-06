import { useState } from "react";
import { Zona } from "../../../../types/mesa";
import { useMesas } from "../../../../hooks/useMesas";

export const useZonaLogic = ({
  zonas,
  mesas,
  crearZona,
  actualizarZona,
  eliminarZona,
  eliminarZonaConMesas,
  toggleEstadoZona,
  moverMesasDeZonaContext, // <--- RECIBIR ESTO
  migrarMesasNuevaZonaContext, // <--- RECIBIR ESTO
}: any) => {
  const [newZona, setNewZona] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
    targetZonaId: undefined as number | undefined,
    tablesCount: undefined as number | undefined,
  });

  const [selectedOption, setSelectedOption] = useState<
    "DELETE_ALL" | "MOVE_OTHER" | "MOVE_NULL" | null
  >(null);
  const [destinyId, setDestinyId] = useState<number | "NEW" | null>(null);
  const [newZoneNameMigration, setNewZoneNameMigration] = useState("");

  const executeComplexAction = async (action: string) => {
    // ID de la zona que queremos borrar
    const originId = modalState.targetZonaId;
    if (!originId) return;

    try {
      switch (action) {
        // CASO 1: ELIMINAR TODO (Ya lo tenías)
        case "DELETE_ALL":
          await eliminarZonaConMesas(originId);
          closeInternal();
          break;

        // CASO 2: MOVER A "SIN ZONA"
        case "MOVE_NULL":
          // Buscamos el ID de "Sin zona" (o "Sin Zona")
          const sinZona = zonas.find(
            (z: any) => z.nombre.toLowerCase() === "sin zona"
          );
          if (sinZona) {
            await moverMesasDeZonaContext(originId, sinZona.id);
            closeInternal();
          } else {
            // Si por alguna razón no existe (raro), podrías intentar ID 5 o mostrar error
            console.error("No se encontró la zona 'Sin zona'");
          }
          break;

        // CASO 3: MOVER A OTRA ZONA (ABRIR SUB-MENÚ)
        case "MOVE_OTHER":
          // Cambiamos el tipo de modal para mostrar el SELECT
          setModalState((prev) => ({ ...prev, type: "select_destiny" }));
          break;

        // CASO 4: CONFIRMAR MOVIMIENTO (Desde el sub-menú)
        case "CONFIRM_MOVE":
          if (!destinyId) return;

          if (destinyId === "NEW") {
            // Sub-caso: Crear nueva zona
            if (!newZoneNameMigration.trim()) return;
            await migrarMesasNuevaZonaContext(originId, newZoneNameMigration);
          } else {
            // Sub-caso: Mover a zona existente seleccionada
            await moverMesasDeZonaContext(originId, Number(destinyId));
          }
          closeInternal();
          break;
      }
    } catch (error) {
      console.error("Error en acción compleja:", error);
      // showAlert("Error", "Ocurrió un problema al procesar la solicitud");
    }
  };

  const showAlert = (title: string, message: string) =>
    setModalState({
      isOpen: true,
      type: "alert",
      title,
      message,
      targetZonaId: undefined,
      tablesCount: undefined,
    });

  const closeInternal = () => {
    setModalState((p) => ({ ...p, isOpen: false }));
    setSelectedOption(null);
    setDestinyId(null);
    setNewZoneNameMigration("");
  };

  const handleAddZona = async () => {
    const name = newZona.trim();
    if (!name) return;

    if (["Todas", "Sin zona"].includes(name)) {
      showAlert("Nombre reservado", `"${name}" no puede usarse.`);
      return;
    }

    if (
      zonas.some((z: Zona) => z.nombre.toLowerCase() === name.toLowerCase())
    ) {
      showAlert("Duplicado", "Ya existe una zona con ese nombre.");
      return;
    }

    try {
      await crearZona(name);
      setNewZona("");
    } catch {
      showAlert("Error", "No se pudo crear la zona.");
    }
  };

  const handleEdit = (zona: Zona) => {
    setEditingId(zona.id);
    setEditingName(zona.nombre);
  };

  const handleSaveEdit = async () => {
    const name = editingName.trim();

    if (!name) return;
    if (["Todas", "Sin zona"].includes(name)) {
      showAlert("Nombre reservado", "No puedes usar ese nombre.");
      return;
    }

    if (
      zonas.some(
        (z: Zona) =>
          z.nombre.toLowerCase() === name.toLowerCase() && z.id !== editingId
      )
    ) {
      showAlert("Duplicado", "Ya existe una zona con ese nombre.");
      return;
    }

    try {
      await actualizarZona(editingId!, name);
      setEditingId(null);
    } catch {
      showAlert("Error", "No se pudo actualizar.");
    }
  };

  return {
    newZona,
    setNewZona,
    editingId,
    setEditingId, // <--- EXPONER LA FUNCIÓN
    editingName,
    setEditingName,
    handleEdit,
    handleSaveEdit,
    // ************ ¡ESTO ES LO QUE FALTA! ************
    executeComplexAction,
    // ************************************************

    modalState,
    setModalState,
    showAlert,
    closeInternal,

    selectedOption,
    setSelectedOption,

    destinyId,
    setDestinyId,

    newZoneNameMigration,
    setNewZoneNameMigration,

    handleAddZona,
  };
};
