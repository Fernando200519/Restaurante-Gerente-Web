import { useMesasContext } from "../context/MesasContext";

export const useMesas = () => {
  const ctx = useMesasContext();

  return {
    mesas: ctx.mesas,
    zonas: ctx.zonas,
    loading: ctx.loading,
    lastCreatedId: ctx.lastCreatedId,
    crearMesa: ctx.crearMesa,
    actualizarMesa: ctx.actualizarMesa,
    eliminarMesas: ctx.eliminarMesas,
    habilitarMesa: ctx.habilitarMesa,
    desactivarMesa: ctx.desactivarMesa,
    crearZona: ctx.crearZona,
    actualizarZona: ctx.actualizarZona,
    eliminarZona: ctx.eliminarZona,
    eliminarZonaConMesas: ctx.eliminarZonaConMesas,
    toggleEstadoZona: ctx.toggleEstadoZona,
    moverMesasDeZonaContext: ctx.moverMesasDeZonaContext,
    refreshAll: ctx.refreshAll,
    migrarMesasNuevaZonaContext: ctx.migrarMesasNuevaZonaContext,
  };
};
