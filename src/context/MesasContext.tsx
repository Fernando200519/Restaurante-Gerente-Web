import React, { createContext, useContext, useEffect, useState } from "react";
import { Mesa } from "../types/mesa";
import * as api from "../api/mesasApi";

type Mode = "NORMAL" | "EDIT" | "DELETE";

interface NuevaMesaData {
  nombre: string;
  capacidad: number;
  zona: string;
}

interface MesasContextType {
  mesas: Mesa[];
  loading: boolean;
  mode: Mode;
  selectedIds: number[];
  refresh: () => Promise<void>;
  setMode: (m: Mode) => void;
  toggleSelect: (id: number) => void;

  addMesa: (data: NuevaMesaData) => Promise<void>;
  updateMesa: (id: number, capacidad: number, zona: string) => Promise<void>;

  deleteSelected: () => Promise<void>;
  deleteMesa: (id: number) => Promise<void>;
  openMesaById: (id: number) => Promise<Mesa | null>;
}

const MesasContext = createContext<MesasContextType | undefined>(undefined);

export const useMesasContext = () => {
  const ctx = useContext(MesasContext);
  if (!ctx)
    throw new Error("useMesasContext must be used inside MesasProvider");
  return ctx;
};

export const MesasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<Mode>("NORMAL");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await api.getMesas();
      setMesas(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addMesa = async (data: NuevaMesaData) => {
    const nueva = await api.addMesa(data);
    setMesas((p) => [...p, nueva]);
  };

  const updateMesa = async (id: number, capacidad: number, zona: string) => {
    const updated = await api.editMesa(id, capacidad, zona);
    if (updated) setMesas((p) => p.map((m) => (m.id === id ? updated : m)));
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    await api.deleteMesas(selectedIds);
    setMesas((p) => p.filter((m) => !selectedIds.includes(m.id)));
    setSelectedIds([]);
    setMode("NORMAL");
  };

  const deleteMesa = async (id: number) => {
    await api.deleteMesas([id]);
    setMesas((p) => p.filter((m) => m.id !== id));
  };

  const openMesaById = async (id: number) => {
    return await api.getMesaConOrdenes(id);
  };

  return (
    <MesasContext.Provider
      value={{
        mesas,
        loading,
        mode,
        selectedIds,
        refresh,
        setMode,
        toggleSelect,
        addMesa,
        updateMesa,
        deleteSelected,
        deleteMesa,
        openMesaById,
      }}
    >
      {children}
    </MesasContext.Provider>
  );
};
