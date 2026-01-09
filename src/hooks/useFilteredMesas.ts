import { useMemo, useState } from "react";
import { useMesas } from "./useMesas";

export const useFilteredMesas = () => {
  const { mesas, zonas } = useMesas();
  const [zonaSeleccionada, setZonaSeleccionada] = useState("Todas");

  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string | null>(
    null
  );

  // 1️⃣ Capa 1: Filtrar mesas por la Zona activa
  const mesasDeLaZona = useMemo(() => {
    let result = mesas.map((m) => ({
      ...m,
      nombreZona:
        m.zona || zonas.find((z) => z.id === m.zonaId)?.nombre || "Sin Zona",
    }));

    if (zonaSeleccionada !== "Todas") {
      result = result.filter((m) => m.nombreZona === zonaSeleccionada);
    } else {
      const disabledIds = zonas
        .filter((z) => z.estado === "Inactiva")
        .map((z) => z.id);
      result = result.filter(
        (m) => m.zonaId === null || !disabledIds.includes(m.zonaId)
      );
    }
    return result;
  }, [mesas, zonas, zonaSeleccionada]);

  const stats = useMemo(
    () => ({
      total: mesasDeLaZona.length,
      libres: mesasDeLaZona.filter((m) => m.estado === "LIBRE").length,
      ocupadas: mesasDeLaZona.filter((m) => m.estado === "OCUPADA").length,
      esperando: mesasDeLaZona.filter((m) => m.estado === "ESPERANDO_PAGO")
        .length,
      grupos: mesasDeLaZona.filter((m) => m.estado === "AGRUPADA").length,
    }),
    [mesasDeLaZona]
  );

  // 3️⃣ Capa 3: Filtrar para el Grid (Zona + Estado)
  const filteredData = useMemo(() => {
    let result = [...mesasDeLaZona];

    if (estadoSeleccionado) {
      result = result.filter((m) => m.estado === estadoSeleccionado);
    }

    return result.sort((a, b) => {
      const alertDiff =
        (b.orden?.totalAlertas || 0) - (a.orden?.totalAlertas || 0);
      if (alertDiff !== 0) return alertDiff;
      return a.nombre.localeCompare(b.nombre, undefined, { numeric: true });
    });
  }, [mesasDeLaZona, estadoSeleccionado]);

  return {
    filteredData,
    zonaSeleccionada,
    setZonaSeleccionada,
    estadoSeleccionado,
    setEstadoSeleccionado,
    stats,
  };
};
