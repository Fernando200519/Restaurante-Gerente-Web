// src/context/MesasContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { Mesa, Zona } from "../types/mesa";
import {
  getMesas,
  addMesa,
  editMesa,
  deleteMesas,
  getMesaConOrdenes,
} from "../api/mesasApi";
import {
  getZonas,
  addZona,
  editZona,
  deleteZona,
  deleteZonaConMesas,
  moverMesasDeZona,
  migrarMesasNuevaZona,
} from "../api/zonaApi";

interface MesasContextProps {
  mesas: Mesa[];
  zonas: Zona[];
  loading: boolean;

  crearMesa: (data: { capacidad: number; zonaId: number }) => Promise<void>;
  actualizarMesa: (
    id: number,
    capacidad: number,
    zonaId: number | null,
    estadoMesa?: string
  ) => Promise<void>;
  eliminarMesas: (ids: number[]) => Promise<void>;
  crearZona: (nombre: string) => Promise<Zona>;
  actualizarZona: (
    id: number,
    nombre: string,
    estado?: "Activa" | "Inactiva"
  ) => Promise<void>;
  eliminarZona: (id: number) => Promise<void>;
  toggleEstadoZona: (zona: Zona) => Promise<void>;
  eliminarZonaConMesas: (id: number) => Promise<void>;
  desactivarMesa: (id: number) => Promise<void>;
  habilitarMesa: (id: number) => Promise<void>;
  moverMesasDeZonaContext: (
    origenId: number,
    destinoId: number
  ) => Promise<void>;
  migrarMesasNuevaZonaContext: (
    origenId: number,
    nuevoNombre: string
  ) => Promise<void>;
}

const MesasContext = createContext<MesasContextProps | undefined>(undefined);

export const MesasProvider = ({ children }: { children: React.ReactNode }) => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        setLoading(true);
        await Promise.all([
          getMesas().then(setMesas),
          getZonas().then(setZonas),
        ]);
      } catch (error) {
        console.error("Error inicializando la aplicación:", error);
      } finally {
        setLoading(false);
      }
    };

    inicializarDatos();
  }, []);
  const crearMesa = async (data: { capacidad: number; zonaId: number }) => {
    const nueva = await addMesa(data);

    let zonaNombre = nueva.zona;
    if (
      (!zonaNombre || zonaNombre.trim() === "Sin Zona") &&
      nueva.zonaId != null
    ) {
      const z = zonas.find((zz) => zz.id === nueva.zonaId);
      if (z) zonaNombre = z.nombre;
    }

    const enriquecida: Mesa = { ...nueva, zona: zonaNombre ?? nueva.zona };
    setMesas((prev) => [...prev, enriquecida]);
  };
  const actualizarMesa = async (
    id: number,
    capacidad: number,
    zonaId: number | null,
    estadoMesa?: string
  ) => {
    setLoading(true);
    try {
      await editMesa(id, capacidad, zonaId, estadoMesa);

      const mesaActualizada = await getMesaConOrdenes(id);
      if (mesaActualizada) {
        let enriquecida = mesaActualizada;
        if (
          (enriquecida.zona == null ||
            enriquecida.zona.trim() === "Sin Zona") &&
          enriquecida.zonaId != null
        ) {
          const z = zonas.find((zz) => zz.id === enriquecida.zonaId);
          if (z) enriquecida = { ...enriquecida, zona: z.nombre };
        }
        setMesas((prev) => prev.map((m) => (m.id === id ? enriquecida : m)));
        return;
      }

      setMesas((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const zonaNombreCalculada =
            zonaId === null
              ? "Sin Zona"
              : zonas.find((z) => z.id === zonaId)?.nombre || "Sin Zona";

          return {
            ...m,
            capacidad: capacidad ?? m.capacidad,
            zonaId: zonaId ?? m.zonaId,
            zona: zonaNombreCalculada,
          };
        })
      );

      refreshAll().catch((e) => console.error("refreshAll failed:", e));
    } catch (error) {
      console.error("Error actualizando mesa (silenciado):", error);

      setMesas((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                capacidad: capacidad ?? m.capacidad,
                zonaId: zonaId ?? m.zonaId,
                zona:
                  (zonaId != null &&
                    zonas.find((z) => z.id === zonaId)?.nombre) ||
                  m.zona,
              }
            : m
        )
      );

      refreshAll().catch((e) => console.error("refreshAll failed:", e));
    } finally {
      setLoading(false);
    }
  };

  const eliminarMesas = async (ids: number[]) => {
    await deleteMesas(ids);
    setMesas((prev) => prev.filter((m) => !ids.includes(m.id)));
  };

  const habilitarMesa = async (id: number) => {
    setLoading(true);
    try {
      await editMesa(id, undefined, undefined, "Activa");

      setMesas((prev) =>
        prev.map((m) => (m.id === id ? { ...m, estado: "LIBRE" } : m))
      );
    } catch (error) {
      console.error("Error al habilitar mesa:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const desactivarMesa = async (id: number) => {
    setLoading(true);
    try {
      await editMesa(id, undefined, undefined, "Inactiva");

      setMesas((prev) =>
        prev.map((m) => (m.id === id ? { ...m, estado: "INACTIVA" } : m))
      );
    } catch (error) {
      console.error("Error al desactivar mesa:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const crearZona = async (nombre: string): Promise<Zona> => {
    const nueva = await addZona(nombre);
    setZonas((prev) => [...prev, nueva]);
    return nueva;
  };

  const actualizarZona = async (
    id: number,
    nombre: string,
    estado?: "Activa" | "Inactiva"
  ) => {
    try {
      setZonas((prev) =>
        prev.map((z) => {
          if (z.id !== id) return z;
          return {
            ...z,
            nombre: nombre,
            estado: estado ?? z.estado,
          };
        })
      );

      const zonaRespuesta = await editZona(id, nombre, estado);
      if (zonaRespuesta) {
        setZonas((prev) => prev.map((z) => (z.id === id ? zonaRespuesta : z)));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarZona = async (id: number) => {
    await deleteZona(id);
    setZonas((prev) => prev.filter((z) => z.id !== id));
  };

  const eliminarZonaConMesas = async (id: number) => {
    await deleteZonaConMesas(id);
    setZonas((prev) => prev.filter((z) => z.id !== id));
    setMesas((prev) => prev.filter((m) => m.zonaId !== id));
  };

  const toggleEstadoZona = async (zona: Zona) => {
    const nuevoEstado = zona.estado === "Activa" ? "Inactiva" : "Activa";

    try {
      const zonaRespuesta = await editZona(zona.id, zona.nombre, nuevoEstado);

      setZonas((prev) =>
        prev.map((z) => {
          if (z.id !== zona.id) return z;
          if (zonaRespuesta) return zonaRespuesta;
          return { ...z, estado: nuevoEstado };
        })
      );
    } catch (error) {
      console.error("Error al cambiar estado de zona:", error);
    }
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      const [mesasData, zonasData] = await Promise.all([
        getMesas(),
        getZonas(),
      ]);
      setMesas(mesasData);
      setZonas(zonasData);
    } catch (error) {
      console.error("Error en refreshAll:", error);
    } finally {
      setLoading(false);
    }
  };
  const moverMesasDeZonaContext = async (
    origenId: number,
    destinoId: number
  ) => {
    setLoading(true);
    try {
      await moverMesasDeZona(origenId, destinoId);
      await refreshAll();
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const migrarMesasNuevaZonaContext = async (
    origenId: number,
    nuevoNombre: string
  ) => {
    setLoading(true);
    try {
      await migrarMesasNuevaZona(origenId, nuevoNombre);
      await refreshAll();
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MesasContext.Provider
      value={{
        mesas,
        zonas,
        loading,
        crearMesa,
        actualizarMesa,
        eliminarMesas,
        habilitarMesa,
        desactivarMesa,
        crearZona,
        actualizarZona,
        eliminarZona,
        eliminarZonaConMesas,
        toggleEstadoZona,
        moverMesasDeZonaContext,
        migrarMesasNuevaZonaContext,
      }}
    >
      {children}
    </MesasContext.Provider>
  );
};

export const useMesasContext = () => {
  const context = useContext(MesasContext);
  if (!context) {
    throw new Error("useMesasContext debe usarse dentro de un MesasProvider");
  }
  return context;
};
