import React, { useEffect, useState } from "react";
import { Mesa, Zona } from "../../../types/mesa";
import { Order } from "../../../types/order";
import { useMesasContext } from "../../../context/MesasContext";
import { getOrderById } from "../../../api/ordersApi";
import {
  X,
  Table,
  Settings,
  ClipboardList,
  Users,
  Receipt,
  DollarSign,
} from "lucide-react";

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
    useMesasContext();

  const [activeTab, setActiveTab] = useState<"DETALLES" | "EDITAR">("DETALLES");
  const [localMesa, setLocalMesa] = useState<Mesa | null>(mesa);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showEnableConfirm, setShowEnableConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (visible && mesa?.orden?.id) {
      setLoading(true);
      getOrderById(mesa.orden.id)
        .then((data) => {
          if (isMounted) setOrderData(data);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setOrderData(null);
    }

    if (mesa?.estado === "INACTIVA" || mesa?.estado === "DESACTIVADA") {
      setActiveTab("EDITAR");
    } else {
      setActiveTab("DETALLES");
    }

    return () => {
      isMounted = false;
    };
  }, [visible, mesa]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [visible]);

  if (!visible || !localMesa) return null;

  const statusColors: Record<string, string> = {
    LIBRE: "bg-emerald-500",
    OCUPADA: "bg-rose-500",
    ESPERANDO: "bg-amber-500",
    ESPERANDO_PAGO: "bg-yellow-500",
    AGRUPADA: "bg-purple-600",
    INACTIVA: "bg-gray-600",
    DESACTIVADA: "bg-gray-600",
  };

  const isInactive =
    localMesa.estado === "INACTIVA" || localMesa.estado === "DESACTIVADA";
  // ✅ Incluimos ESPERANDO_PAGO como estado ocupado para las opciones de edición
  const isOccupied = [
    "OCUPADA",
    "ESPERANDO",
    "AGRUPADA",
    "ESPERANDO_PAGO",
  ].includes(localMesa.estado);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 🌑 Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
        {/* 🔥 HEADER ADAPTADO */}
        <div
          className={`shrink-0 pt-10 pb-18 px-10 flex justify-between items-start transition-colors duration-500 ${
            statusColors[localMesa.estado] || "bg-gray-800"
          } text-white relative overflow-hidden`}
        >
          <div className="relative z-20">
            <h3 className="text-5xl font-black tracking-tighter uppercase flex items-center gap-3 mb-8 leading-none">
              {localMesa.nombre}
              {/* ✅ ICONO DINÁMICO SEGÚN ESTADO */}
              {localMesa.estado === "ESPERANDO_PAGO" && (
                <Receipt
                  size={40}
                  strokeWidth={3}
                  className="text-white animate-pulse"
                />
              )}
            </h3>

            {/* 🏷️ BADGES REFORZADOS */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2 rounded-2xl text-[11px] font-black shadow-xl border border-white">
                <Table size={16} strokeWidth={3} className="text-rose-500" />
                <span className="uppercase tracking-widest">
                  {localMesa.zona}
                </span>
              </div>

              {orderData && (
                <div className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-2xl text-[11px] font-black shadow-xl border border-gray-700">
                  <Users size={16} strokeWidth={3} className="text-[#FF8108]" />
                  <span className="uppercase tracking-widest">
                    {orderData.guestName}
                  </span>
                </div>
              )}

              {/* 🆕 BADGE DE PRIORIDAD DE COBRO */}
              {localMesa.estado === "ESPERANDO_PAGO" && (
                <div className="flex items-center gap-2 bg-white/20 text-white px-5 py-2 rounded-2xl text-[11px] font-black backdrop-blur-md border border-white/30 animate-bounce">
                  <DollarSign size={16} strokeWidth={3} />
                  <span className="uppercase tracking-widest">
                    Cuenta Pedida
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="relative z-30 bg-white/20 hover:bg-white text-white hover:text-gray-900 p-4 rounded-3xl transition-all shadow-xl active:scale-90 cursor-pointer group"
          >
            <X
              size={32}
              strokeWidth={3}
              className="group-hover:rotate-90 transition-transform duration-300"
            />

            {/* ICONO DE FONDO DINÁMICO */}
            {localMesa.estado === "ESPERANDO_PAGO" ? (
              <DollarSign
                className="absolute -right-16 -bottom-16 text-white/10 pointer-events-none"
                size={280}
              />
            ) : (
              <Table
                className="absolute -right-16 -bottom-16 text-white/10 pointer-events-none"
                size={280}
              />
            )}
          </button>

          <Table
            className="absolute -right-16 -bottom-16 text-white/10 pointer-events-none"
            size={280}
          />
        </div>

        {/* 🧭 NAVEGACIÓN: También con flex-shrink-0 y margen negativo para el efecto Pro */}
        <div className="shrink-0 flex px-10 bg-white border-b border-gray-100 relative z-30 -mt-10 rounded-t-[2.5rem] shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <TabButton
            active={activeTab === "DETALLES"}
            label="Detalle de Cuenta"
            icon={<ClipboardList size={18} />}
            onClick={() => setActiveTab("DETALLES")}
          />
          <TabButton
            active={activeTab === "EDITAR"}
            label="Administrar Mesa"
            icon={<Settings size={18} />}
            onClick={() => setActiveTab("EDITAR")}
          />
        </div>

        {/* 📋 CUERPO: Este es el ÚNICO que puede encogerse y tener scroll */}
        <div className="flex-1 overflow-y-auto p-10 bg-gray-50/50">
          {activeTab === "DETALLES" ? (
            <MesaDetailsTab orderData={orderData} loading={loading} />
          ) : (
            <MesaEditTab
              zonas={zonas}
              localMesa={localMesa}
              loading={loading}
              isOccupied={isOccupied}
              isInactive={isInactive}
              onDelete={() => setShowDeleteConfirm(true)}
              onDisable={() => setShowDisableConfirm(true)}
              onEnable={() => setShowEnableConfirm(true)}
              onSave={async (data) => {
                setLoading(true);
                await actualizarMesa(localMesa.id, data.zonaId);
                setLoading(false);
                onClose();
              }}
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-white px-8 py-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span
            className={`flex items-center gap-2 ${
              localMesa.estado === "ESPERANDO_PAGO"
                ? "text-yellow-600"
                : "text-gray-900"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                statusColors[localMesa.estado]
              }`}
            />
            Estado:{" "}
            {localMesa.estado === "ESPERANDO_PAGO"
              ? "Esperando Pago"
              : localMesa.estado}
          </span>
        </div>
      </div>

      {/* MODALES DE CONFIRMACIÓN */}
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          nombre={localMesa.nombre}
          loading={loading}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            setLoading(true);
            await eliminarMesas([localMesa.id]);
            setLoading(false);
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
            setLoading(false);
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
            setLoading(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};

const TabButton = ({ active, label, icon, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 py-5 px-4 border-b-4 transition-all text-xs font-black uppercase tracking-widest cursor-pointer
      ${
        active
          ? "border-[#FF8108] text-gray-900"
          : "border-transparent text-gray-400 hover:text-gray-600"
      }`}
  >
    {icon} {label}
  </button>
);

export default MesaModal;
