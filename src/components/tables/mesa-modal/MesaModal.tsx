// Nuevo MesaModal.tsx (limpio y dividido en componentes)

import React, { useEffect, useState } from "react";
import { Mesa, Zona, OrderDetail } from "../../../types/mesa";
import { useMesas } from "../../../hooks/useMesas";
import { getOrders, getOrderById, OrderBackend } from "../../../api/ordersApi";

import { PlatilloRow } from "./PlatilloRow";
import { MesaDetailsTab } from "./MesaDetailsTab";
import { MesaEditTab } from "./MesaEditTab";

import {
  ConfirmDeleteModal,
  ConfirmDisableModal,
  ConfirmEnableModal,
} from "./modals";

interface Props {
  mesa: Mesa | null;
  visible: boolean;
  zonas: Zona[];
  onClose: () => void;
}

const MesaModal: React.FC<Props> = ({ mesa, visible, zonas, onClose }) => {
  const { actualizarMesa, eliminarMesas, desactivarMesa, habilitarMesa } =
    useMesas();

  const [activeTab, setActiveTab] = useState<"DETALLES" | "EDITAR">("DETALLES");
  const [localMesa, setLocalMesa] = useState<Mesa | null>(mesa);
  const [orderBackend, setOrderBackend] = useState<OrderBackend | null>(null);

  const [loading, setLoading] = useState(false);

  // Mini-modales
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showEnableConfirm, setShowEnableConfirm] = useState(false);

  // Bloqueo scroll al abrir modal
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  // Cargar datos de mesa
  useEffect(() => {
    if (!mesa) return;
    setLocalMesa(mesa);

    setActiveTab(
      mesa.estado === "INACTIVA" || mesa.estado === "DESACTIVADA"
        ? "EDITAR"
        : "DETALLES"
    );
  }, [mesa]);

  // Cargar orden asociada
  useEffect(() => {
    if (!visible || !localMesa) return;

    let mounted = true;
    (async () => {
      try {
        if (localMesa.orden?.id) {
          const o = await getOrderById(localMesa.orden.id);
          if (mounted) setOrderBackend(o);
        } else {
          const all = await getOrders();
          const found = all.find((x) => x.mesaId === localMesa.id) || null;
          if (mounted) setOrderBackend(found);
        }
      } catch {
        if (mounted) setOrderBackend(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [visible, localMesa]);

  if (!visible || !localMesa) return null;

  const isInactive =
    localMesa.estado === "INACTIVA" || localMesa.estado === "DESACTIVADA";

  const isOccupied = ["OCUPADA", "ESPERANDO", "AGRUPADA"].includes(
    localMesa.estado
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Contenido */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#FA9623] text-white p-5 flex justify-between items-center">
          <h3 className="text-2xl font-bold">{localMesa.nombre}</h3>

          <button className="text-white/70 text-2xl" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-6 bg-gray-50 px-6 border-b">
          <button
            className={`py-3 border-b-2 ${
              activeTab === "DETALLES"
                ? "text-[#FA9623] border-[#FA9623]"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("DETALLES")}
          >
            Detalles
          </button>

          <button
            className={`py-3 border-b-2 ${
              activeTab === "EDITAR"
                ? "text-[#FA9623] border-[#FA9623]"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("EDITAR")}
          >
            Configuración
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "DETALLES" && (
            <MesaDetailsTab orderBackend={orderBackend} localMesa={localMesa} />
          )}

          {activeTab === "EDITAR" && (
            <MesaEditTab
              zonas={zonas}
              localMesa={localMesa}
              isOccupied={isOccupied}
              isInactive={isInactive}
              loading={loading}
              onDelete={() => setShowDeleteConfirm(true)}
              onDisable={() => setShowDisableConfirm(true)}
              onEnable={() => setShowEnableConfirm(true)}
              onSave={async (data) => {
                setLoading(true);
                try {
                  await actualizarMesa(
                    localMesa.id,
                    data.capacidad,
                    data.zonaId
                  );
                  onClose();
                } finally {
                  setLoading(false);
                }
              }}
            />
          )}
        </div>

        {/* MODALES */}
        {showDeleteConfirm && (
          <ConfirmDeleteModal
            nombre={localMesa.nombre}
            loading={loading}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={async () => {
              setLoading(true);
              await eliminarMesas([localMesa.id]);
              onClose();
            }}
          />
        )}

        {showDisableConfirm && (
          <ConfirmDisableModal
            nombre={localMesa.nombre}
            loading={loading}
            onCancel={() => setShowDisableConfirm(false)}
            onConfirm={async () => {
              setLoading(true);
              await desactivarMesa(localMesa.id);
              onClose();
            }}
          />
        )}

        {showEnableConfirm && (
          <ConfirmEnableModal
            nombre={localMesa.nombre}
            loading={loading}
            onCancel={() => setShowEnableConfirm(false)}
            onConfirm={async () => {
              setLoading(true);
              await habilitarMesa(localMesa.id);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MesaModal;
