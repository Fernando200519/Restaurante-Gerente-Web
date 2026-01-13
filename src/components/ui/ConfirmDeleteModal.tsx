import React, { useEffect } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

interface Props {
  isOpen?: boolean;
  nombre: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<Props> = ({
  isOpen,
  nombre,
  loading,
  onCancel,
  onConfirm,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const btnBase =
    "flex-1 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      {/* 🌫️ Fondo con desenfoque profundo */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] animate-in fade-in duration-300"
        onClick={!loading ? onCancel : undefined}
      />

      {/* 📦 Card del Modal con bordes masivos */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
        {/* ❌ Botón Cerrar Minimalista */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 transition-colors cursor-pointer disabled:hidden"
        >
          <X size={24} strokeWidth={3} />
        </button>

        {/* 📋 Contenido Central */}
        <div className="flex flex-col items-center text-center">
          {/* 🚨 Icono de Peligro Extremo */}
          <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 text-rose-500 shadow-sm border border-rose-100 animate-pulse">
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>

          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic mb-3">
            ¿Eliminar Registro?
          </h3>

          <p className="text-gray-400 text-sm font-bold leading-relaxed mb-8 px-4">
            Estás a punto de borrar{" "}
            <span className="text-gray-900">"{nombre}"</span>. Esta acción es{" "}
            <span className="text-rose-500">irreversible</span> y eliminará
            todos los datos vinculados.
          </p>

          {/* 🛠️ Botones de Acción */}
          <div className="flex gap-4 w-full">
            <button
              onClick={onCancel}
              disabled={loading}
              className={`${btnBase} bg-gray-100 text-gray-500 hover:bg-gray-200`}
            >
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`${btnBase} bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" strokeWidth={3} />
                  <span>Borrando</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} strokeWidth={3} />
                  <span>Confirmar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
