import React, { useEffect, useState } from "react";
import { useMesasContext } from "../context/MesasContext";

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

  // Cálculo del nombre autogenerado con numeración global (por id)
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

        // zona (si no existe en el listado, usar "Sin zona")
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

    // Doble seguridad antes de guardar
    if (finalCapacidad > 100) finalCapacidad = 100;

    if (!finalCapacidad || finalCapacidad <= 0)
      return alert("Ingresa una capacidad válida (Mínimo 1)");

    if (modeEdit && editMesaId) {
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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">
          {modeEdit ? "Editar Mesa" : "Agregar Mesa"}
        </h3>

        {/* Nombre autogenerado */}
        {!modeEdit && (
          <>
            <label className="block mb-1 font-semibold">Nombre</label>
            <input
              type="text"
              value={nombreSugerido}
              disabled
              className="w-full p-2 bg-gray-100 border rounded mb-3"
            />
          </>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Capacidad</label>
          <select
            value={capacidad}
            onChange={(e) =>
              setCapacidad(
                e.target.value === "otro" ? "otro" : Number(e.target.value)
              )
            }
            className="w-full border rounded p-2 mb-3"
          >
            {predefined.map((n) => (
              <option key={n} value={n}>
                {n} personas
              </option>
            ))}
            <option value="otro">Otro</option>
          </select>

          {/* 👇 AQUÍ ESTÁ LA LÓGICA DE RESTRICCIÓN A 100 */}
          {capacidad === "otro" && (
            <input
              type="number"
              className="w-full border rounded p-2 mb-3"
              placeholder="Máximo 100 personas"
              value={otroValor}
              min={1}
              max={100}
              // Evita que escriban caracteres no numéricos como 'e', '-', '.'
              onKeyDown={(e) => {
                if (["e", "E", "-", "+", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                // Lógica de "Tope Inteligente"
                const valStr = e.target.value;

                // Permitir borrar todo (string vacío)
                if (valStr === "") {
                  setOtroValor("");
                  return;
                }

                let val = parseInt(valStr, 10);

                // Si se pasan de 100, forzamos a 100
                if (val > 100) val = 100;
                // Si es menor a 1, forzamos a 1
                if (val < 1) val = 1;

                setOtroValor(val);
              }}
            />
          )}

          {/* Selector zona - usa las zonas pasadas desde MesasPage */}
          <label className="block mb-2">Zona</label>
          <select
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="w-full border rounded p-2 mb-3"
          >
            {zonas.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded"
            >
              {modeEdit ? "Actualizar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MesaFormModal;
