import React, { useEffect, useState, useMemo } from "react";
import { useMesas } from "../../hooks/useMesas";
import { Zona } from "../../types/mesa";
import { ChevronDown, MapPin, X, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Props {
  visible: boolean;
  onClose: () => void;
  zonas: Zona[];
  zonaDefaultId?: number;
}

const MesaFormModal: React.FC<Props> = ({
  visible,
  onClose,
  zonas,
  zonaDefaultId,
}) => {
  const { crearMesa, mesas } = useMesas();
  const [zonaId, setZonaId] = useState<number | "">("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  const siguienteNumero = useMemo(() => {
    if (mesas.length === 0) return 1;
    const numeros = mesas.map((m) => {
      const num = parseInt(m.nombre.replace(/\D/g, ""), 10);
      return isNaN(num) ? 0 : num;
    });
    return Math.max(...numeros, 0) + 1;
  }, [mesas]);

  const nombreSugerido = `Mesa ${siguienteNumero}`;

  useEffect(() => {
    if (visible) {
      if (zonaDefaultId) {
        setZonaId(zonaDefaultId);
      } else if (zonas.length > 0) {
        const primeraActiva =
          zonas.find((z) => z.estado === "Activa") || zonas[0];
        setZonaId(primeraActiva.id);
      }
    }
  }, [visible, zonas, zonaDefaultId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (zonaId === "") return;

    setIsSubmitting(true);
    try {
      await crearMesa({ zonaId: Number(zonaId) });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF8108", "#22C55E", "#ffffff"],
      });

      toast.success("¡Mesa creada!", {
        description: `La nueva mesa se ha registrado exitosamente en el sistema.`,
        duration: 4000,
        style: {
          borderRadius: "20px",
          padding: "16px",
          border: "1px solid #E5E7EB",
        },
      });

      onClose();
    } catch (error) {
      toast.error("Error al crear", {
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop con Blur Industrial */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* 🚀 CAMBIO 1: Cambiamos 'overflow-hidden' por 'overflow-visible' */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl z-10 w-full max-w-md overflow-visible border border-gray-100 animate-in zoom-in-95 duration-300">
        {/* 🚀 CAMBIO 2: Añadimos 'rounded-t-[2.5rem]' para proteger el diseño del header */}
        <div className="p-6 bg-[#FF8108] text-white flex justify-between items-center rounded-t-[2.5rem]">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <PlusCircle size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl leading-none uppercase tracking-tight">
                Nueva Mesa
              </h3>
              <p className="text-[10px] font-bold text-orange-100 uppercase tracking-widest opacity-80">
                Configuración de Sala
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-black/10 hover:bg-black/20 p-2 rounded-full transition-all cursor-pointer active:scale-90"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* 🚀 CAMBIO 3: Añadimos 'rounded-b-[2.5rem]' al form */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 rounded-b-[2.5rem]"
        >
          {/* Campo Nombre Informativo */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Nombre de la mesa
            </label>
            <input
              type="text"
              value={nombreSugerido}
              disabled
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-gray-400 font-bold cursor-not-allowed select-none "
            />
          </div>

          {/* Selector de Zona Estilizado */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Ubicación / Zona
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full px-5 py-4 border-2 rounded-2xl flex justify-between items-center transition-all bg-gray-50 cursor-pointer 
                  ${
                    dropdownOpen
                      ? "border-[#FF8108] bg-white ring-4 ring-orange-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin
                    size={18}
                    className={zonaId ? "text-[#FF8108]" : "text-gray-300"}
                  />
                  <span
                    className={`font-bold ${
                      zonaId ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {zonas.find((z) => z.id === zonaId)?.nombre ||
                      "Selecciona un área"}
                  </span>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ✅ El Dropdown ahora se verá completo gracias al overflow-visible del padre */}
              {dropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                  {zonas.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 italic">
                      No hay zonas activas
                    </div>
                  ) : (
                    zonas.map((z) => (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => {
                          setZonaId(z.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-5 py-3 text-left text-sm font-bold transition-colors flex justify-between items-center cursor-pointer 
                          ${
                            zonaId === z.id
                              ? "bg-orange-50 text-[#FF8108]"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {z.nombre}
                        {zonaId === z.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF8108]" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={zonaId === "" || isSubmitting}
              className="flex-[1.5] bg-gray-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all disabled:bg-gray-200 disabled:text-gray-400"
            >
              {isSubmitting ? "Creando..." : "Confirmar Mesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MesaFormModal;
