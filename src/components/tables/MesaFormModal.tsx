// src/components/tables/MesaFormModal.tsx
import React, { useEffect, useState } from "react";
import { useMesas } from "../../hooks/useMesas"; // ✅ Usamos el Hook nuevo
import { Zona } from "../../types/mesa";

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

      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-md overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {modeEdit ? (
              <>
                <svg
                  className="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  ></path>
                </svg>
                Editar Mesa
              </>
            ) : (
              <>Nueva Mesa</>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Campo Nombre (Automático/Readonly) */}
            <div>
              <label className="block text-base font-medium text-gray-500 mb-1">
                Nombre (Automático)
              </label>
              <div className="relative">
                <input
                  type="text"
                  // Si editamos, mostramos el nombre real. Si creamos, el sugerido.
                  value={
                    modeEdit && editMesaId
                      ? mesas.find((m) => m.id === editMesaId)?.nombre
                      : nombreSugerido
                  }
                  disabled
                  className="w-full pl-4 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-medium cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Campo Capacidad */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
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
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none bg-white"
                >
                  {predefined.map((n) => (
                    <option key={n} value={n}>
                      {n} personas
                    </option>
                  ))}
                  <option value="otro">Personalizada...</option>
                </select>
                {/* Icono Flecha */}
                <div className="absolute right-3 top-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Input condicional para 'otro' */}
              {capacidad === "otro" && (
                <div className="mt-3 animate-fadeIn">
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm"
                    placeholder="Ingresa el número exacto (Máx 32)"
                    value={otroValor}
                    min={1}
                    max={32}
                    onKeyDown={(e) =>
                      ["e", "E", "-", "+", "."].includes(e.key) &&
                      e.preventDefault()
                    }
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

            {/* Campo Zona */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Zona
              </label>
              <div className="relative">
                <select
                  value={zonaId ?? ""}
                  // Convertimos a número (ya que ahora Sin Zona tiene ID real)
                  onChange={(e) => setZonaId(Number(e.target.value))}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none bg-white"
                >
                  {zonasOrdenadas.length === 0 ? (
                    <option value="" disabled>
                      No hay zonas creadas
                    </option>
                  ) : (
                    // ✅ USAMOS LA LISTA ORDENADA AQUÍ
                    zonasOrdenadas.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.nombre}
                      </option>
                    ))
                  )}
                </select>

                {/* Icono de flecha (se mantiene igual) */}
                <div className="absolute right-3 top-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {zonasOrdenadas.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Necesitas crear una zona primero.
                </p>
              )}
            </div>
          </div>

          {/* Footer con botones */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 transition-colors shadow-sm cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={zonas.length === 0}
              className={`px-5 py-2 text-base font-medium text-white rounded-lg focus:ring-2 focus:ring-offset-1 focus:ring-[#FA9623] transition-all shadow-md hover:shadow-lg cursor-pointer ${
                zonas.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#FA9623] hover:bg-[#e88b1f]"
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
