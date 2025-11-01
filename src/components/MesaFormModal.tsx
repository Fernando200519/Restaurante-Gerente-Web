// src/components/MesaFormModal.tsx
import React, { useEffect, useState } from "react";
import { useMesasContext } from "../context/MesasContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  editMesaId?: number | null;
}

const predefined = [2, 4, 6, 8];

const MesaFormModal: React.FC<Props> = ({
  visible,
  onClose,
  editMesaId = null,
}) => {
  const { addMesa, mesas, updateMesa } = useMesasContext();
  const [capacidad, setCapacidad] = useState<number | "otro">(4);
  const [otroValor, setOtroValor] = useState<number | "">("");
  const [modeEdit, setModeEdit] = useState(false);

  useEffect(() => {
    if (editMesaId) {
      const mesa = mesas.find((m) => m.id === editMesaId);
      if (mesa) {
        setModeEdit(true);
        if (predefined.includes(mesa.capacidad)) setCapacidad(mesa.capacidad);
        else {
          setCapacidad("otro");
          setOtroValor(mesa.capacidad);
        }
      }
    } else {
      setModeEdit(false);
      setCapacidad(4);
      setOtroValor("");
    }
  }, [editMesaId, mesas, visible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const final =
      capacidad === "otro" ? Number(otroValor) : (capacidad as number);
    if (!final || final <= 0) return alert("Ingresa una capacidad válida");
    if (modeEdit && editMesaId) {
      await updateMesa(editMesaId, final);
    } else {
      await addMesa(final);
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

          {capacidad === "otro" && (
            <input
              type="number"
              className="w-full border rounded p-2 mb-3"
              placeholder="Ingresa la cantidad"
              value={otroValor}
              onChange={(e) => setOtroValor(Number(e.target.value))}
            />
          )}

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
