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
      // 1. Actualización Optimista (Para que se vea instantáneo)
      setMesas((prev) =>
        prev.map((m) => (m.id === id ? { ...m, estado: "LIBRE" } : m))
      );

      // 2. CORRECCIÓN: Enviar "Libre" al backend (según tu Swagger UpdateTableDTO)
      // Antes enviabas "Activa", lo cual el backend rechazaba silenciosamente.
      await editMesa(id, undefined, undefined, "Libre");

      // 3. Sincronizar para asegurar
      await refreshAll();
    } catch (error) {
      console.error("Error al habilitar mesa:", error);
      // Si falla, revertimos los cambios recargando
      refreshAll();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const desactivarMesa = async (id: number) => {
    setLoading(true);
    try {
      // 1. Actualización Optimista
      setMesas((prev) =>
        prev.map((m) => (m.id === id ? { ...m, estado: "INACTIVA" } : m))
      );

      // 2. Enviar "Inactiva" al backend
      await editMesa(id, undefined, undefined, "Inactiva");

      // 3. Sincronizar
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

      // Opcional: Si quieres estar 100% seguro de que el backend y frontend están sincronizados:
      // await refreshAll();
    } catch (error) {
      console.error(error);
      // Si falla, podrías recargar todo para deshacer el cambio optimista
      // refreshAll();
    }
  };

  const eliminarZona = async (id: number) => {
    await deleteZona(id);
    setZonas((prev) => prev.filter((z) => z.id !== id));
  };

  // src/context/MesasContext.tsx

  const eliminarZonaConMesas = async (id: number) => {
    setLoading(true);
    try {
      // 1. Identificar la zona y sus mesas
      const zonaTarget = zonas.find((z) => z.id === id);
      if (!zonaTarget) return;

      const isSinZona = zonaTarget.nombre.trim().toLowerCase() === "sin zona";

      // Buscamos las mesas que pertenecen a esta zona por nombre
      const mesasAfectadas = mesas.filter((m) => m.zona === zonaTarget.nombre);
      const idsMesas = mesasAfectadas.map((m) => m.id);

      // 2. Actualización Optimista (Visual inmediata)
      // A) Quitamos las mesas de la vista
      setMesas((prev) => prev.filter((m) => !idsMesas.includes(m.id)));

      // B) Quitamos la zona de la vista (SOLO SI NO ES "SIN ZONA")
      if (!isSinZona) {
        setZonas((prev) => prev.filter((z) => z.id !== id));
      }

      // 3. Peticiones al Backend
      // A) Primero eliminamos las mesas (para evitar conflictos de FK si existieran)
      if (idsMesas.length > 0) {
        await deleteMesas(idsMesas);
      }

      // B) Luego eliminamos la zona (SOLO SI NO ES "SIN ZONA")
      if (!isSinZona) {
        await deleteZona(id);
      }

      // 4. Sincronización final
      await refreshAll();
    } catch (error) {
      console.error("Error eliminando zona y mesas:", error);
      refreshAll(); // Revertir si falla
    } finally {
      setLoading(false);
    }
  };

  const toggleEstadoZona = async (zona: Zona) => {
    // Estado de la Zona (suele ser tipo oración: "Activa" / "Inactiva")
    const nuevoEstadoZona = zona.estado === "Activa" ? "Inactiva" : "Activa";

    // CORRECCIÓN AQUÍ:
    // El estado de la Mesa debe ser MAYÚSCULAS para cumplir con la interfaz TypeScript
    // Cambio "Inactiva" por "INACTIVA" y "Libre" por "LIBRE"
    const nuevoEstadoMesa =
      nuevoEstadoZona === "Inactiva" ? "INACTIVA" : "LIBRE";

    try {
      // 1. ACTUALIZACIÓN OPTIMISTA (VISUAL INSTANTÁNEA)

      // A) Actualizamos la Zona
      setZonas((prev) =>
        prev.map((z) => {
          if (z.id !== zona.id) return z;
          return { ...z, estado: nuevoEstadoZona };
        })
      );

      // B) Actualizamos las Mesas
      setMesas((prev) =>
        prev.map((m) => {
          if (m.zona === zona.nombre) {
            // Ahora sí asignamos el tipo correcto ("INACTIVA" o "LIBRE")
            return { ...m, estado: nuevoEstadoMesa };
          }
          return m;
        })
      );

      // -------------------------------------------------------------
      // 2. PETICIONES AL SERVIDOR (EN SEGUNDO PLANO)
      // -------------------------------------------------------------

      // Actualizar Zona en Backend
      await editZona(zona.id, zona.nombre, nuevoEstadoZona);

      // Actualizar Mesas en Backend
      const mesasAfectadas = mesas.filter((m) => m.zona === zona.nombre);

      if (mesasAfectadas.length > 0) {
        const promesasDeActualizacion = mesasAfectadas.map((m) =>
          editMesa(m.id, undefined, undefined, nuevoEstadoMesa)
        );
        await Promise.all(promesasDeActualizacion);
      }

      // 3. Sincronización final silenciosa
      // Opcional: Si quieres asegurar que todo esté bien, pero podrías omitirlo
      // si confías en que el optimismo funcionó.
      // Si decides dejarlo, asegúrate que refreshAll no active un loading spinner global.
      await refreshAll();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      // Si falla, revertimos recargando todo
      refreshAll();
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
  // Opción A: Mover a zona existente (incluye "Sin zona")
  const moverMesasDeZonaContext = async (
    origenId: number,
    destinoId: number
  ) => {
    setLoading(true);
    try {
      // 1. Mover las mesas en el backend
      await moverMesasDeZona(origenId, destinoId);

      // 2. Eliminar la zona vieja (ya que quedó vacía)
      await deleteZona(origenId);

      // 3. Refrescar todo
      await refreshAll();
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Opción B: Mover a nueva zona (Migración)
  const migrarMesasNuevaZonaContext = async (
    origenId: number,
    nuevoNombre: string
  ) => {
    setLoading(true);
    try {
      // 1. Crear zona y mover mesas (Backend)
      await migrarMesasNuevaZona(origenId, nuevoNombre);

      // 2. Eliminar la zona vieja
      await deleteZona(origenId);

      // 3. Refrescar todo
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
