// src/hooks/useMesas.ts
import { useMesasContext } from "../context/MesasContext";

export const useMesas = () => {
  const ctx = useMesasContext();

  return {
    // Estados
    mesas: ctx.mesas,
    zonas: ctx.zonas,
    loading: ctx.loading,

    // Acciones Mesas
    crearMesa: ctx.crearMesa,
    actualizarMesa: ctx.actualizarMesa,
    eliminarMesas: ctx.eliminarMesas,
    habilitarMesa: ctx.habilitarMesa,
    desactivarMesa: ctx.desactivarMesa,

    // Acciones Zonas
    crearZona: ctx.crearZona,
    actualizarZona: ctx.actualizarZona,
    eliminarZona: ctx.eliminarZona,
    eliminarZonaConMesas: ctx.eliminarZonaConMesas,
    toggleEstadoZona: ctx.toggleEstadoZona, // 👈 Agregamos el toggle aquí
    moverMesasDeZonaContext: ctx.moverMesasDeZonaContext,
    migrarMesasNuevaZonaContext: ctx.migrarMesasNuevaZonaContext,
  };
};
