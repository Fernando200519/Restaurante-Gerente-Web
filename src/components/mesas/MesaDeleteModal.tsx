// src/components/MesaDeleteModal.tsx
import React from "react";
import { useMesasContext } from "../../context/MesasContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const MesaDeleteModal: React.FC<Props> = ({ visible, onClose }) => {
  const { selectedIds, deleteSelected } = useMesasContext();

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Eliminar mesas</h3>
        <p className="mb-4">
          ¿Seguro que deseas eliminar <strong>{selectedIds.length}</strong>{" "}
          mesa(s) seleccionada(s)?
        </p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Cancelar
          </button>
          <button
            onClick={async () => {
              await deleteSelected();
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Eliminar seleccionadas
          </button>
        </div>
      </div>
    </div>
  );
};

export default MesaDeleteModal;
