import React, { useMemo } from "react";
import { PlatilloRow } from "./PlatilloRow";
import { Order, OrderItem } from "../../../types/order";
import { Users, Clock, User, DollarSign, UtensilsCrossed } from "lucide-react";

interface Props {
  orderData: Order | null;
  loading: boolean;
}

export const MesaDetailsTab: React.FC<Props> = ({ orderData, loading }) => {
  const groupedItems = useMemo(() => {
    const items = orderData?.items ?? [];
    return items.reduce((acc: Record<string, OrderItem[]>, item) => {
      const comensal = item.comensal || "General";
      if (!acc[comensal]) acc[comensal] = [];
      acc[comensal].push(item);
      return acc;
    }, {});
  }, [orderData]);

  const formatCurrency = (n: number) =>
    n.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-[#FF8108] rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Cargando Comanda...
        </p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-gray-100 p-16 text-center animate-in fade-in">
        <UtensilsCrossed size={48} className="mx-auto text-gray-200 mb-6" />
        <p className="text-gray-400 font-bold uppercase text-[12px] tracking-[0.3em]">
          Mesa Libre sin Comanda Activa
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ✅ CORRECCIÓN: Usamos totalComensales en lugar de guestName */}
        <InfoCard
          icon={<Users size={20} />}
          label="Comensales"
          value={`${orderData.totalComensales ?? 0} Personas`}
          color="text-blue-600"
        />

        <InfoCard
          icon={<User size={20} />}
          label="Mesero"
          value={orderData.waiter}
          color="text-purple-600"
        />

        <div className="md:col-span-2">
          {/* La hora ya te aparece bien (8:38 AM) gracias al ajuste anterior en el API */}
          <InfoCard
            icon={<Clock size={20} />}
            label="Apertura de Cuenta"
            value={`${orderData.date} a las ${orderData.time}`}
            color="text-[#FF8108]"
          />
        </div>
      </div>

      {/* 📋 LISTA POR COMENSAL */}
      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">
          Detalle por Persona
        </h4>

        {Object.entries(groupedItems).map(([comensal, items]) => (
          <div
            key={comensal}
            className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm"
          >
            <div className="bg-gray-50/80 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-gray-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF8108]" />
                {comensal}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <PlatilloRow
                  key={item.id}
                  producto={item.name}
                  cantidad={1}
                  comensal={item.comensal}
                  estado={item.status}
                  total={item.price}
                  fechaHora={item.fechaHoraInicioEstado ?? ""}
                />
              ))}
            </div>
            <div className="px-6 py-3 bg-white text-right border-t border-gray-50">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-3">
                Subtotal Persona:
              </span>
              <span className="text-sm font-black text-gray-900 tabular-nums">
                {formatCurrency(
                  items.reduce((sum, i) => sum + (i.price ?? 0), 0)
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 💰 TOTAL ACUMULADO */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 flex justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400/80 mb-1">
            Cierre de Cuenta
          </p>
          <h3 className="text-white font-black text-xl uppercase italic">
            Total Acumulado
          </h3>
        </div>
        <div className="text-right relative z-10">
          <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
            {formatCurrency(orderData.price)}
          </span>
        </div>
        <DollarSign
          className="absolute -left-4 -bottom-4 text-white/5"
          size={120}
        />
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-2xl bg-gray-50 ${color}`}>{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="text-sm font-black text-gray-900 uppercase truncate">
        {value}
      </p>
    </div>
  </div>
);
