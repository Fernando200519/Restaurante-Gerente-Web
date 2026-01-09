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
  lastCreatedId: number | null;

  crearMesa: (data: { zonaId: number }) => Promise<void>;
  actualizarMesa: (
    id: number,
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
  refreshAll: (showLoading?: boolean) => Promise<void>;
}

const MesasContext = createContext<MesasContextProps | undefined>(undefined);

export const MesasProvider = ({ children }: { children: React.ReactNode }) => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCreatedId, setLastCreatedId] = useState<number | null>(null);

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

  const crearMesa = async (data: { zonaId: number }) => {
    try {
      const nueva = await addMesa(data);

      let zonaNombre = String(nueva.zona || "");

      if (
        (!zonaNombre || zonaNombre.trim() === "Sin Zona") &&
        nueva.zonaId != null
      ) {
        const z = zonas.find((zz) => zz.id === nueva.zonaId);
        if (z) zonaNombre = z.nombre;
      }

      const enriquecida: Mesa = { ...nueva, zona: zonaNombre };
      setMesas((prev) => [...prev, enriquecida]);

      setLastCreatedId(nueva.id);
      setTimeout(() => setLastCreatedId(null), 5000);
    } catch (error) {
      console.error("Error real en crearMesa:", error);
      throw error;
    }
  };

  const actualizarMesa = async (
    id: number,
    zonaId: number | null,
    estadoMesa?: string
  ) => {
    setLoading(true);
    try {
      await editMesa(id, zonaId, estadoMesa);

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
      const mesaActual = mesas.find((m) => m.id === id);
      if (!mesaActual) throw new Error("Mesa no encontrada");

      let idZonaParaEnviar = mesaActual.zonaId;

      if (
        !idZonaParaEnviar &&
        mesaActual.zona &&
        mesaActual.zona !== "Sin Zona"
      ) {
        const nombreZonaBuscada = mesaActual.zona;

        const zonaEncontrada = zonas.find(
          (z) =>
            z.nombre.trim().toLowerCase() ===
            nombreZonaBuscada.trim().toLowerCase()
        );

        if (zonaEncontrada) {
          idZonaParaEnviar = zonaEncontrada.id;
        }
      }

      console.log(
        `Habilitando mesa ${id}. Zona ID recuperado: ${idZonaParaEnviar}`
      );

      setMesas((prev) =>
        prev.map((m) => (m.id === id ? { ...m, estado: "LIBRE" } : m))
      );

      await editMesa(id, idZonaParaEnviar, "Libre");

      await refreshAll();
    } catch (error) {
      console.error("Error al habilitar mesa:", error);
      refreshAll();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const desactivarMesa = async (id: number) => {
    setLoading(true);
    try {
      setMesas((prev) =>
        prev.map((m) => (m.id === id ? { ...m, estado: "INACTIVA" } : m))
      );
      await editMesa(id, undefined, "Inactiva");

      await refreshAll();
    } catch (error) {
      console.error("Error al desactivar mesa:", error);
      refreshAll();
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
      const zonaObj = zonas.find((z) => z.id === id);
      const nombreAnterior = zonaObj?.nombre;

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
      if (nombreAnterior && nombreAnterior !== nombre) {
        setMesas((prevMesas) =>
          prevMesas.map((m) => {
            if (m.zona === nombreAnterior) {
              return { ...m, zona: nombre };
            }
            return m;
          })
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarZona = async (id: number) => {
    const zonaTarget = zonas.find((z) => z.id === id);
    if (zonaTarget && zonaTarget.nombre.trim().toLowerCase() === "sin zona") {
      console.warn("⛔ Se bloqueó el intento de eliminar la zona 'Sin Zona'");
      return;
    }

    setLoading(true);
    try {
      await deleteZona(id);
      setZonas((prev) => prev.filter((z) => z.id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarZonaConMesas = async (id: number) => {
    setLoading(true);
    try {
      const zonaTarget = zonas.find((z) => z.id === id);
      if (!zonaTarget) return;

      const isSinZona = zonaTarget.nombre.trim().toLowerCase() === "sin zona";

      const mesasAfectadas = mesas.filter((m) => m.zona === zonaTarget.nombre);
      const idsMesas = mesasAfectadas.map((m) => m.id);

      setMesas((prev) => prev.filter((m) => !idsMesas.includes(m.id)));

      if (!isSinZona) {
        setZonas((prev) => prev.filter((z) => z.id !== id));
      }

      if (idsMesas.length > 0) {
        await deleteMesas(idsMesas);
      }

      if (!isSinZona) {
        await deleteZona(id);
      }

      await refreshAll();
    } catch (error) {
      console.error("Error eliminando zona y mesas:", error);
      refreshAll();
    } finally {
      setLoading(false);
    }
  };

  const toggleEstadoZona = async (zona: Zona) => {
    const nuevoEstadoZona = zona.estado === "Activa" ? "Inactiva" : "Activa";

    const estadoMesaBackend =
      nuevoEstadoZona === "Inactiva" ? "Inactiva" : "Libre";

    const estadoMesaFrontend =
      nuevoEstadoZona === "Inactiva" ? "INACTIVA" : "LIBRE";

    try {
      setZonas((prev) =>
        prev.map((z) => {
          if (z.id !== zona.id) return z;
          return { ...z, estado: nuevoEstadoZona };
        })
      );

      setMesas((prev) =>
        prev.map((m) => {
          if (m.zona === zona.nombre) {
            return { ...m, estado: estadoMesaFrontend };
          }
          return m;
        })
      );

      await editZona(zona.id, zona.nombre, nuevoEstadoZona);

      const mesasAfectadas = mesas.filter((m) => m.zona === zona.nombre);

      if (mesasAfectadas.length > 0) {
        const promesasDeActualizacion = mesasAfectadas.map((m) =>
          editMesa(m.id, undefined, estadoMesaBackend)
        );
        await Promise.all(promesasDeActualizacion);
      }

      await refreshAll();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      refreshAll();
    }
  };

  const refreshAll = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const [mesasData, zonasData] = await Promise.all([
        getMesas(),
        getZonas(),
      ]);
      setMesas(mesasData);
      setZonas(zonasData);
    } catch (error) {
      console.error("Error en refreshAll:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const moverMesasDeZonaContext = async (
    origenId: number,
    destinoId: number
  ) => {
    setLoading(true);
    try {
      const zonaOrigen = zonas.find((z) => z.id === origenId);
      const isSinZona = zonaOrigen?.nombre.trim().toLowerCase() === "sin zona";

      await moverMesasDeZona(origenId, destinoId);

      if (!isSinZona) {
        await deleteZona(origenId);
      }

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
      const zonaOrigen = zonas.find((z) => z.id === origenId);
      const isSinZona = zonaOrigen?.nombre.trim().toLowerCase() === "sin zona";

      await migrarMesasNuevaZona(origenId, nuevoNombre);

      if (!isSinZona) {
        await deleteZona(origenId);
      }

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
        refreshAll,
        lastCreatedId,
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
