import React from "react";

interface Props {
  nombre: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmEnableModal: React.FC<Props> = ({
  nombre,
  loading,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative z-10">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Habilitar Mesa</h3>

        <p className="text-gray-600 mb-6">
          ¿Deseas habilitar nuevamente la mesa <b>{nombre}</b>? Podrá volver a
          utilizarse inmediatamente.
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
            className={`px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Habilitar
          </button>
        </div>
      </div>
    </div>
  );
};
