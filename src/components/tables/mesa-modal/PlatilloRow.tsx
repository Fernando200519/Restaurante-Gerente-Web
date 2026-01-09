// src/components/tables/mesa-modal/PlatilloRow.tsx
import React from "react";
import {
  Clock,
  User,
  CheckCircle2,
  ClipboardList,
  ChefHat,
  XCircle,
} from "lucide-react";

type PlatilloEstado =
  | "Solicitado"
  | "EnPreparacion"
  | "En preparación"
  | "ListoParaEntregar"
  | "Listo para entregar"
  | "Entregado"
  | "Cancelado";

interface PlatilloRowProps {
  producto: string;
  cantidad: number;
  comensal?: string;
  estado: PlatilloEstado | string;
  total: number;
  fechaHora: string;
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; icon: any }
> = {
  solicitado: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    icon: ClipboardList,
  },
  enpreparacion: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
    icon: ChefHat,
  },
  listoparaentregar: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  entregado: {
    bg: "bg-gray-100",
    text: "text-gray-900",
    dot: "bg-gray-500",
    icon: CheckCircle2,
  },
  cancelado: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

export const PlatilloRow: React.FC<PlatilloRowProps> = ({
  producto,
  cantidad,
  comensal,
  estado,
  total,
  fechaHora,
}) => {
  // 🎯 NORMALIZACIÓN PRO: Minúsculas, sin espacios y SIN ACENTOS
  const statusKey = estado
    .toLowerCase()
    .trim()
    .replace(/\s/g, "")
    .normalize("NFD") // Separa la letra de su acento
    .replace(/[\u0300-\u036f]/g, ""); // Elimina los caracteres de acento

  // Ahora "En preparación" se convierte en "enpreparacion" y coincide con tu config
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.solicitado;
  const StatusIcon = config.icon;

  // Lógica de pulso para estados activos
  const isActive = [
    "solicitado",
    "enpreparacion",
    "listoparaentregar",
  ].includes(statusKey);

  const formatCurrency = (n: number) =>
    n.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    });

  const formatHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="group flex items-center justify-between py-5 px-3 border-b border-gray-100 last:border-none hover:bg-white transition-all rounded-2xl">
      <div className="flex items-start gap-5">
        {/* Cantidad con estilo dark industrial */}
        <div className="flex items-center justify-center bg-gray-900 text-white w-9 h-9 rounded-xl font-black text-xs shadow-md shrink-0">
          {cantidad}x
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-black text-gray-900 uppercase tracking-tight italic">
            {producto}
          </span>

          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-lg">
              <User size={12} className="text-[#FF8108]" strokeWidth={3} />
              {comensal || "General"}
            </span>

            {/* ✅ Badge con color sincronizado: "En preparación" ahora será naranja */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-current font-black ${config.bg} ${config.text}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${config.dot} ${
                  isActive ? "animate-pulse shadow-[0_0_8px_currentColor]" : ""
                }`}
              />
              <StatusIcon size={10} strokeWidth={4} />
              <span className="text-[9px] uppercase tracking-widest">
                {estado}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Clock size={12} strokeWidth={3} />
          <span className="text-[10px] font-black tabular-nums">
            {formatHora(fechaHora)}
          </span>
        </div>
        <div className="text-base font-black text-gray-900 tabular-nums tracking-tighter">
          {formatCurrency(total)}
        </div>
      </div>
    </div>
  );
};
