import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  Clock,
  DollarSign,
  User,
  History,
  Hash,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Order } from "../../types/order";
import { formatTimeAmPm } from "../../utils/time";
import { useOrders } from "../../hooks/useOrders";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { fetchOrderDetail } = useOrders(); // ✅ Asegúrate que useOrders exporte esta función
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🛡️ FIX SCROLL: Bloqueo agresivo del fondo
  useEffect(() => {
    const lockScroll = () => {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden"; // Bloqueo extra para navegadores modernos
    };

    const unlockScroll = () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };

    if (isOpen) lockScroll();
    else unlockScroll();

    return unlockScroll; // Limpieza al desmontar
  }, [isOpen]);

  // 🔄 CARGA DE DATOS: Trazabilidad
  useEffect(() => {
    const getTrazabilidad = async () => {
      if (isOpen && order?.id) {
        setLoading(true);
        setDetail(null); // Limpiamos datos viejos antes de cargar
        const data = await fetchOrderDetail(order.id);

        // 🎯 NOTA: getOrderDetailById ya devuelve el objeto data[0]
        setDetail(data);
        setLoading(false);
      }
    };
    getTrazabilidad();
  }, [isOpen, order?.id, fetchOrderDetail]);

  const processTime = useMemo(() => {
    if (!detail?.historialEstados || detail.historialEstados.length < 2)
      return 0;
    const start = new Date(detail.historialEstados[0].fechaHora).getTime();
    const end = new Date(
      detail.historialEstados[detail.historialEstados.length - 1].fechaHora
    ).getTime();
    return Math.max(0, Math.floor((end - start) / (1000 * 60)));
  }, [detail]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-[1px] animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#FF8108] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-100">
                <Hash size={12} className="inline mr-1" /> Mesa {order.tableId}
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-gray-100">
                <Calendar size={12} className="inline mr-1" /> {order.date}
              </div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter">
              {order.items[0].name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-white text-gray-400 hover:text-[#FF8108] shadow-sm transition-all cursor-pointer"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="p-10 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* MÉTRICAS */}
          <div className="lg:col-span-7 space-y-10">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={<DollarSign size={16} />}
                label="Inversión Total"
                value={`$${detail?.total?.toFixed(2) || "0.00"}`}
              />
              <MetricCard
                icon={<Clock size={16} />}
                label="Tiempo Proceso"
                value={`${processTime} min`}
              />
            </div>

            {/* 👤 SECCIÓN RESPONSABLE ACTUALIZADA CON FOTO */}
            <div className="flex items-center justify-between p-6 rounded-4xl border-2 border-dashed border-gray-100 bg-gray-50/30">
              <div className="flex items-center gap-4">
                {/* Contenedor de Imagen de Perfil */}
                <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-xl overflow-hidden border-4 border-white shrink-0">
                  {/* Validamos foto desde el detalle extendido o la orden básica */}
                  {detail?.fotoPerfilMesero || order.waiterPhoto ? (
                    <img
                      src={detail?.fotoPerfilMesero || order.waiterPhoto}
                      alt={detail?.empleado || order.waiter}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <User size={24} strokeWidth={3} />
                  )}
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">
                    Responsable de Orden
                  </p>
                  <p className="text-lg font-black text-gray-800 uppercase italic tracking-tight">
                    {detail?.empleado || order.waiter}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-[#FF8108] uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8108] animate-pulse" />
                    Comensal: {detail?.comensal || "General"}
                  </div>
                </div>
              </div>
              <CheckCircle2 className="text-emerald-500 opacity-20" size={36} />
            </div>
          </div>

          {/* TIMELINE REAL */}
          <div className="lg:col-span-5">
            <div className="bg-gray-50/30 p-8 rounded-4xl border border-gray-100 h-full min-h-[300px]">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-2">
                <History size={16} className="text-[#FF8108]" /> Trazabilidad
              </h4>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <RefreshCw
                    size={40}
                    className="animate-spin text-[#FF8108]"
                  />
                  <p className="text-[10px] font-black uppercase mt-4">
                    Cargando historial...
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-[7px] w-0.5 bg-linear-to-b from-[#FF8108] to-gray-100" />
                  <div className="space-y-10">
                    {detail?.historialEstados?.map(
                      (step: any, index: number) => {
                        const isLast =
                          index === detail.historialEstados.length - 1;
                        return (
                          <div
                            key={index}
                            className="relative pl-8 animate-in slide-in-from-left-4"
                          >
                            <div
                              className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-white shadow-md z-10 ${
                                isLast
                                  ? "bg-[#FF8108] ring-4 ring-orange-100 scale-110"
                                  : "bg-gray-300"
                              }`}
                            />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-[#FF8108] bg-white w-fit px-2 rounded-md border border-orange-50 mb-1">
                                {formatTimeAmPm(step.fechaHora)}
                              </span>
                              <p
                                className={`text-sm font-black uppercase ${
                                  isLast ? "text-gray-900" : "text-gray-400"
                                }`}
                              >
                                {step.estado}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value }: any) => (
  <div className="p-6 rounded-4xl bg-gray-50 border border-gray-100 group transition-all hover:bg-white hover:border-[#FF8108]/30">
    <div className="flex items-center gap-2 text-gray-400 mb-2 group-hover:text-[#FF8108] transition-colors">
      <span className="opacity-70">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}
      </span>
    </div>
    <p className="text-3xl font-black text-gray-900 tabular-nums tracking-tighter">
      {value}
    </p>
  </div>
);
