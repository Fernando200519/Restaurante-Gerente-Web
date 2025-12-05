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
    estado?: "Activa" | "Inactiva" // 👈 AGREGAR EL ? AQUÍ
  ) => Promise<void>;
  eliminarZona: (id: number) => Promise<void>;
  // 👇 AGREGAR ESTA LÍNEA
  toggleEstadoZona: (zona: Zona) => Promise<void>;
  eliminarZonaConMesas: (id: number) => Promise<void>;
  desactivarMesa: (id: number) => Promise<void>;
  habilitarMesa: (id: number) => Promise<void>; // 👈 NUEVA
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
  const [loading, setLoading] = useState(true); // CARGA INICIAL UNIFICADA // -------------------------------

  // -------------------------------
  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        setLoading(true);
        // Promise.all dispara ambas peticiones en paralelo (más rápido)
        // y espera a que AMBAS terminen
        await Promise.all([
          getMesas().then(setMesas),
          getZonas().then(setZonas),
        ]);
      } catch (error) {
        console.error("Error inicializando la aplicación:", error);
        // Aquí podrías poner un estado de error global si quisieras
      } finally {
        setLoading(false);
      }
    };

    inicializarDatos();
  }, []);

  // -------------------------------
  // CREAR MESA
  // -------------------------------
  const crearMesa = async (data: { capacidad: number; zonaId: number }) => {
    const nueva = await addMesa(data);

    // Si el backend no incluye el nombre de la zona, intentamos rellenarlo
    // usando la lista local de `zonas` para que los filtros/tabs muestren
    // la mesa inmediatamente sin necesidad de recargar.
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

  // -------------------------------
  // EDITAR MESA
  // -------------------------------
  const actualizarMesa = async (
    id: number,
    capacidad: number,
    zonaId: number | null,
    estadoMesa?: string
  ) => {
    // Hacemos la operación de forma resiliente: intentamos el PATCH + GET,
    // pero si algo falla no propagamos la excepción al UI — en su lugar
    // aplicamos una actualización optimista para que el usuario vea el cambio
    // y lanzamos un refresh en background si la lectura falla.
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

      // Si no obtuvimos la mesa del servidor, aplicamos update optimista
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

      // Intentamos refrescar en segundo plano para sincronizar con servidor
      refreshAll().catch((e) => console.error("refreshAll failed:", e));
    } catch (error) {
      console.error("Error actualizando mesa (silenciado):", error);

      // Intento aplicar cambio optimista si es razonable
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

      // También intentamos un refresh en background
      refreshAll().catch((e) => console.error("refreshAll failed:", e));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // ELIMINAR MESAS (varias)
  // -------------------------------
  const eliminarMesas = async (ids: number[]) => {
    await deleteMesas(ids);
    setMesas((prev) => prev.filter((m) => !ids.includes(m.id)));
  };

  const habilitarMesa = async (id: number) => {
    setLoading(true);
    try {
      // ⚠️ AL BACKEND: Enviamos "Activa"
      await editMesa(id, undefined, undefined, "Activa");

      // ✅ AL FRONTEND: Usamos "LIBRE" (que es como tu front entiende "Activa")
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
      // ⚠️ AL BACKEND: Enviamos "Inactiva" (Tal cual lo pide la imagen)
      await editMesa(id, undefined, undefined, "Inactiva");

      // ✅ AL FRONTEND: Mantenemos "INACTIVA" (Para que funcionen tus estilos visuales)
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

  // -------------------------------
  // CRUD DE ZONAS
  // -------------------------------
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
    // ❌ 1. ELIMINAMOS setLoading(true) (Esto causaba el parpadeo)

    try {
      // ✅ 2. ACTUALIZACIÓN OPTIMISTA (Primero actualizamos la UI)
      // Actualizamos la pantalla ANTES de esperar al backend para que sea instantáneo
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

      // ✅ 3. LLAMADA A LA API (En segundo plano)
      const zonaRespuesta = await editZona(id, nombre, estado);

      // ✅ 4. RE-SINTONIZACIÓN (Opcional de seguridad)
      // Si el backend devolvió el objeto completo actualizado, lo usamos para asegurar que tenemos los datos reales del servidor.
      if (zonaRespuesta) {
        setZonas((prev) => prev.map((z) => (z.id === id ? zonaRespuesta : z)));
      }
    } catch (error) {
      console.error(error);
      // Aquí podrías poner un alert si falló
    }
    // ❌ 5. ELIMINAMOS EL FINALLY Y setLoading(false)
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

  // ✅ NUEVA FUNCIÓN: TOGGLE (CORREGIDA)
  const toggleEstadoZona = async (zona: Zona) => {
    // 1. Calculamos el estado contrario
    const nuevoEstado = zona.estado === "Activa" ? "Inactiva" : "Activa";

    try {
      // 2. Llamamos a la API
      const zonaRespuesta = await editZona(zona.id, zona.nombre, nuevoEstado);

      // 3. Actualizamos el estado local
      setZonas((prev) =>
        prev.map((z) => {
          // Si no es la zona que tocamos, la dejamos igual
          if (z.id !== zona.id) return z;

          // CASO A: El backend devolvió la zona actualizada (Perfecto)
          if (zonaRespuesta) return zonaRespuesta;

          // CASO B: El backend devolvió null (Actualizamos manualmente)
          return { ...z, estado: nuevoEstado };
        })
      );
    } catch (error) {
      console.error("Error al cambiar estado de zona:", error);
    }
  };

  // ✅ TU FUNCIÓN REFRESH (Cópiala aquí)
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

  // 2. Implementa las funciones en el Provider
  const moverMesasDeZonaContext = async (
    origenId: number,
    destinoId: number
  ) => {
    setLoading(true);
    try {
      await moverMesasDeZona(origenId, destinoId);
      // Recargamos todo para ver los cambios reflejados
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
        toggleEstadoZona, // 👈 AGREGAR AQUÍ
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
