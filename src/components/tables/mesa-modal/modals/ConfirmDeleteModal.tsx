import React from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

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
    // Z-INDEX ALTO (70) para estar encima de MesaModal (50) o ZonaModal (60)
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Fondo con desenfoque */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Card del Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 overflow-hidden transform transition-all scale-100">
        {/* Botón Cerrar (X) */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Contenido Central */}
        <div className="flex flex-col items-center text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¿Eliminar Mesa?
          </h3>

          <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2">
            Estás a punto de eliminar la mesa{" "}
            <span className="font-bold text-gray-800">"{nombre}"</span>.
            <br />
            Esta acción es permanente y no se puede deshacer.
          </p>

          {/* Botones de Acción */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Borrando...</span>
                </>
              ) : (
                <span>Sí, Eliminar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
