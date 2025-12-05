import React from "react";

interface Props {
  nombre: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<Props> = ({
  nombre,
  loading,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative z-10">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminar Mesa</h3>

        <p className="text-gray-600 mb-6">
          ¿Seguro que deseas eliminar la mesa <b>{nombre}</b>? Esta acción no se
          puede deshacer.
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition 
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
