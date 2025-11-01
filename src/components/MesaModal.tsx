// src/components/MesaModal.tsx
import React from "react";
import { Mesa } from "../types/mesa";
import MesaStatusTimeline from "./MesaStatusTimeline";
import { useNavigate } from "react-router-dom";

interface Props {
  mesa: Mesa | null;
  visible: boolean;
  onClose: () => void;
}

const MesaModal: React.FC<Props> = ({ mesa, visible, onClose }) => {
  const navigate = useNavigate();
  if (!visible || !mesa) return null;

  const renderLibre = () => (
    <>
      <p className="mb-2">
        <strong>{mesa.nombre}</strong>
      </p>
      <p>Capacidad: {mesa.capacidad} personas</p>
    </>
  );

  const renderEsperando = () => (
    <>
      <p className="mb-2">Mesero: {mesa.mesero || "—"}</p>
      <p className="mb-1">
        Tiempo: {mesa.updatedAt ? timeSince(mesa.updatedAt) : "—"}
      </p>
      <p className="mb-2">Monto actual: ${mesa.orden?.montoTotal ?? 0}</p>
      <div className="p-3 bg-yellow-50 border rounded mb-4">
        Cuenta solicitada / Esperando Cuenta
      </div>
      <button
        onClick={() => navigateToOrden()}
        className="px-4 py-2 bg-orange-500 text-white rounded"
      >
        Ver Orden Completa
      </button>
    </>
  );

  const renderOcupada = () => (
    <>
      <p className="mb-2">Mesero: {mesa.mesero || "—"}</p>
      <p className="mb-1">
        Tiempo: {mesa.updatedAt ? timeSince(mesa.updatedAt) : "—"}
      </p>
      <p className="mb-2">Monto actual: ${mesa.orden?.montoTotal ?? 0}</p>

      <div className="space-y-3">
        {mesa.orden?.comensales.map((c) => (
          <div key={c.id} className="border rounded p-3 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{c.nombre}</div>
              <div className="text-sm text-gray-500">${c.montoTotal ?? 0}</div>
            </div>

            <div className="space-y-2">
              {c.platillos.map((p) => (
                <MesaStatusTimeline key={p.id} platillo={p} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => navigateToOrden()}
          className="px-4 py-2 bg-orange-500 text-white rounded"
        >
          Ver Orden Completa
        </button>
      </div>
    </>
  );

  const renderAgrupada = () => (
    <>
      <p className="mb-2">
        Mesas agrupadas: {mesa.grupo ? `Grupo ${mesa.grupo}` : "—"}
      </p>
      <p className="mb-1">
        Capacidad total: {/* example, client can compute */}{" "}
      </p>
      <p className="mb-2">Mesero: {mesa.mesero ?? "—"}</p>

      {/* Reuse ocupada view for combined orders */}
      {renderOcupada()}
    </>
  );

  function timeSince(iso?: string) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    return `${h} h ${min % 60} min`;
  }

  function navigateToOrden() {
    if (!mesa) return; // <-- AÑADE ESTA LÍNEA
    const id = mesa.orden?.id ?? mesa.id;
    onClose();
    navigate(`/ordenes/${id}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg p-6 z-10 w-full max-w-3xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {mesa.nombre} — {mesa.estado}
          </h3>
          <button onClick={onClose} className="text-gray-500">
            Cerrar
          </button>
        </div>

        {mesa.estado === "LIBRE" && renderLibre()}
        {mesa.estado === "OCUPADA" && renderOcupada()}
        {mesa.estado === "ESPERANDO" && renderEsperando()}
        {mesa.estado === "AGRUPADA" && renderAgrupada()}
      </div>
    </div>
  );
};

export default MesaModal;
