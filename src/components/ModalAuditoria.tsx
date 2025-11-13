// src/components/ModalAuditoria.tsx
import React from "react";
import { X } from "lucide-react";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalAuditoria: React.FC<Props> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[500px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-blue-700 mb-2">
          Resumen - Mesa 5 ⚠️ Alerta de Servicio
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Mesero: <b>Juan Pérez</b> · Comensales: 4 · Ocupada hace 45 min
        </p>

        <div className="space-y-1 text-sm font-mono bg-gray-50 p-3 rounded">
          <p>[ENTREGADO] 2x Cerveza (hace 40 min)</p>
          <p>[ENTREGADO] 1x Sopa (hace 20 min)</p>
          <p>[EN COCINA] 1x Salmón (pedido hace 8 min)</p>
          <p className="text-red-500 font-semibold">
            [LISTO - SIN RECOGER] 2x Tacos (listos hace 4 min) ⬅️ ¡LA ALERTA!
          </p>
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
