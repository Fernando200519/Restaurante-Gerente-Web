// src/components/tables/MesaFormModal.tsx
import React, { useEffect, useState } from "react";
import { useMesas } from "../../hooks/useMesas"; // ✅ Usamos el Hook nuevo
import { Zona } from "../../types/mesa";
import { ChevronDown, MapPin, X } from "lucide-react";

interface Props {
  visible: boolean;
  onClose: () => void;
  editMesaId?: number | null;

  // 👇 Recibimos objetos Zona reales
  zonas: Zona[];
  // 👇 ID de la zona por defecto (o undefined si es 'Todas')
  zonaDefaultId?: number;

  // Opcional: si queremos pasar la función desde fuera,
  // aunque podemos sacarla del hook también.
  onSubmit?: (data: { capacidad: number; zonaId: number }) => Promise<void>;
}

const predefined = [2, 4, 6, 8];

const MesaFormModal: React.FC<Props> = ({
  visible,
  onClose,
  editMesaId = null,
  zonas,
  zonaDefaultId,
}) => {
  // Traemos las acciones y datos del hook
  const { crearMesa, actualizarMesa, mesas } = useMesas();

  const [capacidad, setCapacidad] = useState<number | "otro">(4);
  const [otroValor, setOtroValor] = useState<number | "">("");

  // Estado para el ID de la zona (number)
  const [zonaId, setZonaId] = useState<number | "">("");

  const [modeEdit, setModeEdit] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Bloquear scroll al abrir
  useEffect(() => {
    if (visible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  // Cálculo visual del nombre sugerido (Solo cosmético, el backend decide el final)
  // Buscamos el ID más alto y sumamos 1, o usamos 1 si no hay mesas.
  const siguienteNumero =
    mesas.length > 0
      ? Math.max(
          ...mesas.map((m) => {
            // Intentar extraer número del nombre "Mesa 10" -> 10
            const num = parseInt(m.nombre.replace(/\D/g, ""), 10);
            return isNaN(num) ? 0 : num;
          }),
          0
        ) + 1
      : 1;

  const nombreSugerido = `Mesa ${siguienteNumero}`;

  // --- EFECTO: Cargar datos al abrir o cambiar modo ---
  useEffect(() => {
    if (visible) {
      if (editMesaId) {
        // MODO EDICIÓN
        const mesa = mesas.find((m) => m.id === editMesaId);
        if (mesa) {
          setModeEdit(true);

          // Cargar Capacidad
          // TypeScript puede quejarse si mesa.capacidad es null, así que protegemos
          if (mesa.capacidad && predefined.includes(mesa.capacidad)) {
            setCapacidad(mesa.capacidad);
            setOtroValor("");
          } else {
            setCapacidad("otro");
            // ✅ CORRECCIÓN 1: Si es null, pasamos ""
            setOtroValor(mesa.capacidad ?? "");
          }

          // Cargar Zona ID
          // ✅ CORRECCIÓN 2: Convertimos el null de la BD en "" para el Select del Form
          setZonaId(mesa.zonaId ?? "");
        }
      } else {
        // MODO CREACIÓN
        setModeEdit(false);
        setCapacidad(4);
        setOtroValor("");

        // Si hay un default válido (estamos en un tab de zona), lo usamos.
        if (zonaDefaultId) {
          setZonaId(zonaDefaultId);
        } else if (zonas.length > 0) {
          // Preseleccionar la primera zona si existe
          setZonaId(zonas[0].id);
        } else {
          // Si no hay zonas, vacio ("")
          setZonaId("");
        }
      }
    }
  }, [editMesaId, mesas, visible, zonas, zonaDefaultId]);

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar Capacidad
    let finalCapacidad =
      capacidad === "otro" ? Number(otroValor) : (capacidad as number);
    if (finalCapacidad > 100) finalCapacidad = 100;
    if (!finalCapacidad || finalCapacidad <= 0) {
      alert("Ingresa una capacidad válida (Mínimo 1)");
      return;
    }

    // 2. Validar Zona
    if (zonaId === "" || zonaId === undefined) {
      alert("Debes seleccionar una zona válida.");
      return;
    }
    const finalZonaId = Number(zonaId);

    try {
      if (modeEdit && editMesaId) {
        // EDITAR
        // Nota: Mantenemos el estado actual si no lo cambiamos (o podríamos pasarlo si el modal lo gestionara)
        await actualizarMesa(editMesaId, finalCapacidad, finalZonaId);
      } else {
        // CREAR
        await crearMesa({
          capacidad: finalCapacidad,
          zonaId: finalZonaId,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error guardando mesa:", error);
      alert("Ocurrió un error al guardar la mesa.");
    }
  };

  // 1. ORDENAR ZONAS: "Sin zona" primero, luego el resto
  const zonasOrdenadas = [...zonas].sort((a, b) => {
    const nombreA = a.nombre.trim().toLowerCase();
    const nombreB = b.nombre.trim().toLowerCase();

    if (nombreA === "sin zona") return -1; // A va primero
    if (nombreB === "sin zona") return 1; // B va primero
    return 0; // El resto mantiene su orden original (o usa a.nombre.localeCompare(b.nombre) para alfabético)
  });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop con Blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* CORRECCIÓN 1: Quitamos 'overflow-hidden' para que el dropdown pueda salir.
          Agregamos 'overflow-visible' explícitamente.
      */}
      <div className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-md overflow-visible transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        {/* CORRECCIÓN 2: Agregamos 'rounded-t-2xl' al header 
            para mantener la estética sin usar overflow-hidden 
        */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {modeEdit ? (
              <>
                <span className="text-[#FA9623]">✏️</span> Editar Mesa
              </>
            ) : (
              <>Nueva Mesa</>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer hover:bg-gray-200 rounded-full p-1"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Campo Nombre (Automático) */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">
                Nombre (Automático)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={
                    modeEdit && editMesaId
                      ? mesas.find((m) => m.id === editMesaId)?.nombre
                      : nombreSugerido
                  }
                  disabled
                  className="w-full pl-4 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-bold cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Campo Capacidad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Capacidad de personas
              </label>
              <div className="relative">
                <select
                  value={capacidad}
                  onChange={(e) =>
                    setCapacidad(
                      e.target.value === "otro"
                        ? "otro"
                        : Number(e.target.value)
                    )
                  }
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FA9623]/20 focus:border-[#FA9623] outline-none transition-all appearance-none bg-white text-gray-800 font-medium"
                >
                  {predefined.map((n) => (
                    <option key={n} value={n}>
                      {n} personas
                    </option>
                  ))}
                  <option value="otro">Personalizada...</option>
                </select>

                <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                  <ChevronDown size={18} />
                </div>
              </div>

              {capacidad === "otro" && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-[#FA9623]/20 focus:border-[#FA9623] outline-none transition-all text-sm font-medium"
                    placeholder="Ingresa el número exacto (Máx 32)"
                    value={otroValor}
                    min={1}
                    max={32}
                    onChange={(e) => {
                      const valStr = e.target.value;
                      if (valStr === "") {
                        setOtroValor("");
                        return;
                      }
                      let val = parseInt(valStr, 10);
                      if (val > 32) val = 32;
                      if (val < 1) val = 1;
                      setOtroValor(val);
                    }}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* ----------------------------------------------------------------------- */}
            {/* CAMPO ZONA (DISEÑO RESTAURADO Y FLOTANTE) */}
            {/* ----------------------------------------------------------------------- */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                Asignar Zona
              </label>

              {/* 'relative' es necesario para que el dropdown se posicione respecto a este div */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none 
                             bg-white text-gray-800 transition text-left flex justify-between items-center 
                             hover:border-[#FA9623] focus:ring-2 focus:ring-[#FA9623]/20
                             ${
                               dropdownOpen
                                 ? "border-[#FA9623] ring-2 ring-[#FA9623]/20"
                                 : ""
                             }`}
                >
                  <span
                    className={
                      zonaId ? "text-gray-900 font-medium" : "text-gray-500"
                    }
                  >
                    {zonasOrdenadas.find((z) => z.id === zonaId)?.nombre ||
                      "Selecciona una zona..."}
                  </span>

                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* DROPDOWN FLOTANTE 
                    z-50 asegura que flote sobre cualquier otro elemento del modal.
                */}
                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {zonasOrdenadas.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center italic">
                        No hay zonas disponibles.
                      </div>
                    ) : (
                      zonasOrdenadas.map((z) => (
                        <div
                          key={z.id}
                          onClick={() => {
                            setZonaId(z.id);
                            setDropdownOpen(false);
                          }}
                          className={`px-4 py-2.5 cursor-pointer transition text-sm flex items-center justify-between
                            ${
                              zonaId === z.id
                                ? "bg-[#FFF8F0] text-[#FA9623] font-bold"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                          {z.nombre}

                          {zonaId === z.id && (
                            <span className="w-2 h-2 rounded-full bg-[#FA9623]" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {zonasOrdenadas.length === 0 && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                  ⚠️ Necesitas crear una zona primero en el gestor de zonas.
                </p>
              )}
            </div>
          </div>

          {/* CORRECCIÓN 3: Agregamos 'rounded-b-2xl' al footer 
              para mantener la estética inferior.
          */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={zonas.length === 0}
              className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2
              ${
                zonas.length === 0
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-[#FA9623] hover:bg-[#e88b1f] active:scale-[0.98]"
              }`}
            >
              {modeEdit ? "Guardar Cambios" : "Crear Mesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MesaFormModal;
