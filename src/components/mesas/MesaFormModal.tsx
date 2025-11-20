// src/components/mesas/MesaFormModal.tsx
import React, { useEffect, useState } from "react";
import { useMesasContext } from "../../context/MesasContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  editMesaId?: number | null;
  zonas: string[];
  zonaDefault: string;
}

const predefined = [2, 4, 6, 8];

const MesaFormModal: React.FC<Props> = ({
  visible,
  onClose,
  editMesaId = null,
  zonas,
  zonaDefault,
}) => {
  const { addMesa, mesas, updateMesa } = useMesasContext();

  const [capacidad, setCapacidad] = useState<number | "otro">(4);
  const [otroValor, setOtroValor] = useState<number | "">("");
  const [zona, setZona] = useState(zonaDefault);

  const [modeEdit, setModeEdit] = useState(false);

  // Bloquear scroll
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  // Cálculo del nombre autogenerado
  const siguienteNumero = Math.max(...mesas.map((m) => m.id), 0) + 1;
  const nombreSugerido = `Mesa ${siguienteNumero}`;

  useEffect(() => {
    if (editMesaId) {
      const mesa = mesas.find((m) => m.id === editMesaId);
      if (mesa) {
        setModeEdit(true);
        // capacidad
        if (predefined.includes(mesa.capacidad)) {
          setCapacidad(mesa.capacidad);
          setOtroValor("");
        } else {
          setCapacidad("otro");
          setOtroValor(mesa.capacidad);
        }
        // zona
        setZona(mesa.zona || "Sin zona");
      }
    } else {
      setModeEdit(false);
      setCapacidad(4);
      setOtroValor("");
      setZona(zonaDefault);
    }
  }, [editMesaId, mesas, visible, zonas, zonaDefault]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalCapacidad =
      capacidad === "otro" ? Number(otroValor) : (capacidad as number);

    if (finalCapacidad > 100) finalCapacidad = 100;
    if (!finalCapacidad || finalCapacidad <= 0)
      return alert("Ingresa una capacidad válida (Mínimo 1)");

    if (modeEdit && editMesaId) {
      // Nota: updateMesa ahora acepta nombre, pero mantenemos el existente si no lo cambiamos
      // Si quisieras permitir editar nombre, tendrías que agregar un state para 'nombre'
      await updateMesa(editMesaId, finalCapacidad, zona);
    } else {
      await addMesa({
        nombre: nombreSugerido,
        capacidad: finalCapacidad,
        zona,
      });
    }
    onClose();
  };

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
            <div>
              <label className="block text-base font-medium text-gray-500 mb-1">
                Nombre Asignado
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nombreSugerido}
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
                <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"></div>
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
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="Ingresa el número exacto (Máx 100)"
                    value={otroValor}
                    min={1}
                    max={100}
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
                      if (val > 100) val = 100;
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
                <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"></div>
                <select
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none bg-white"
                >
                  {zonas.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
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
              className="px-5 py-2 text-base font-medium text-white bg-[#FA9623] rounded-lg hover:bg-[#e88b1f] focus:ring-2 focus:ring-offset-1 focus:ring-[#FA9623] transition-all shadow-md hover:shadow-lg cursor-pointer"
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
