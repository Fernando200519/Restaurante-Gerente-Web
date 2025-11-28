// src/pages/MesasPage.tsx
import React, { useState, useMemo } from "react";
import { MesasProvider } from "../context/MesasContext";
import { useMesas } from "../hooks/useMesas";

// Importamos los componentes ya adaptados a IDs
import MesaFormModal from "../components/tables/MesaFormModal";
import MesaModal from "../components/tables/MesaModal";
import { MesaCard } from "../components/tables/MesaCard";
import ZonasModal from "../components/tables/ZonaModal";

const Inner = () => {
  // 1. Hook: Traemos datos y acciones del Backend
  const {
    mesas,
    zonas,
    loading,
    crearMesa,
    actualizarMesa,
    eliminarMesas,
    crearZona,
    actualizarZona,
    eliminarZona,
    eliminarZonaConMesas,
    toggleEstadoZona, // 👈 1. IMPORTANTE: Sácalo del hook aquí
  } = useMesas();

  // 2. Estados Locales de UI
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailMesaId, setDetailMesaId] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [zonasModalOpen, setZonasModalOpen] = useState(false);

  // 3. Selección de Zonas
  const [zonaSeleccionadaNombre, setZonaSeleccionadaNombre] =
    useState<string>("Todas");

  // --- LÓGICA VISUAL DE "SIN ZONA" ---
  // 1. Buscamos el objeto real de la base de datos
  const sinZonaObj = zonas.find(
    (z) => z.nombre.trim().toLowerCase() === "sin zona"
  );

  // 2. Verificamos si hay mesas "huerfanas" (con el ID de Sin Zona o null)
  const hayMesasSinZona = mesas.some(
    (m) => m.zonaId === sinZonaObj?.id || m.zonaId === null
  );

  // 3. Nombre exacto para usar en la UI (fallback a "Sin zona" si no ha cargado)
  const nombreSinZona = sinZonaObj?.nombre || "Sin zona";

  const getNombreZona = (id: number | null) => {
    return zonas.find((z) => z.id === id)?.nombre || "Cargando...";
  };

  // ✅ CORRECCIÓN 1: Calculamos los IDs deshabilitados basándonos en el Backend
  // (Esto reemplaza al useState anterior)
  const disabledZonesIds = useMemo(() => {
    return zonas.filter((z) => z.estado === "Inactiva").map((z) => z.id);
  }, [zonas]);

  // 4. Filtrado y Ordenamiento
  const mesasFiltradas = useMemo(() => {
    // A. Mapeamos mesas inyectando el nombre real
    let resultado = mesas.map((m) => ({
      ...m,
      nombreZona: getNombreZona(m.zonaId),
    }));

    // B. Filtrar por Tab seleccionado
    if (zonaSeleccionadaNombre !== "Todas") {
      resultado = resultado.filter(
        (m) => m.nombreZona === zonaSeleccionadaNombre
      );
    } else {
      // C. Lógica Especial para "Todas":

      // ID real de la zona "Sin Zona" (si existe en la lista descargada)
      // Asegúrate de usar el nombre exacto que viene del backend ("Sin Zona" o "Sin zona")
      const idSinZona = zonas.find(
        (z) => z.nombre === "Sin Zona" || z.nombre === "Sin zona"
      )?.id;

      resultado = resultado.filter((m) => {
        // 1. Si coincide con el ID de "Sin Zona", la mostramos siempre
        if (idSinZona && m.zonaId === idSinZona) return true;

        // 2. 🛡️ CORRECCIÓN DEL ERROR:
        // Si el ID es null (datos viejos o error), retornamos true para no romper el filtro.
        // Al hacer este if, TypeScript sabe que abajo m.zonaId ya solo puede ser number.
        if (m.zonaId === null) return true;

        // 3. Ahora sí, filtramos las zonas deshabilitadas
        return !disabledZonesIds.includes(m.zonaId);
      });
    }
    // D. Ordenamiento
    return resultado.sort((a, b) => {
      const alertA = a.orden?.totalAlertas || 0;
      const alertB = b.orden?.totalAlertas || 0;
      if (alertA !== alertB) return alertB - alertA;

      const numA = parseInt(a.nombre.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.nombre.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });
  }, [mesas, zonas, zonaSeleccionadaNombre, disabledZonesIds]);

  // 5. KPIs
  const total = mesasFiltradas.length;
  const libres = mesasFiltradas.filter((m) => m.estado === "LIBRE").length;
  const ocupadas = mesasFiltradas.filter((m) => m.estado === "OCUPADA").length;
  const esperando = mesasFiltradas.filter(
    (m) => m.estado === "ESPERANDO"
  ).length;
  const grupos = mesasFiltradas.filter((m) => m.estado === "AGRUPADA").length;

  const openDetail = (id: number) => {
    setDetailMesaId(id);
    setDetailVisible(true);
  };

  // --- GENERAR TABS ---
  const nombresZonasTabs = useMemo(() => {
    // A. Siempre empezamos con "Todas"
    const tabs = ["Todas"];

    // B. Solo agregamos "Sin Zona" si tiene mesas
    if (hayMesasSinZona) {
      tabs.push(nombreSinZona);
    }

    // C. Agregamos el resto de zonas (excluyendo "Sin Zona" para no duplicar)
    zonas.forEach((z) => {
      // Si no es la zona "Sin Zona", la agregamos
      if (z.id !== sinZonaObj?.id) {
        tabs.push(z.nombre);
      }
    });

    return tabs;
  }, [zonas, hayMesasSinZona, nombreSinZona, sinZonaObj]);

  // --- LÓGICA KPIs ---
  const zonaActualObj = zonas.find((z) => z.nombre === zonaSeleccionadaNombre);

  const isZonaDeshabilitada = zonaActualObj
    ? disabledZonesIds.includes(zonaActualObj.id)
    : false;

  // Condición:
  // 1. No estar en "Sin Zona"
  // 2. No estar en una zona deshabilitada
  // 3. (Opcional) Si quieres ocultarlos en "Todas", agrega: && zonaSeleccionadaNombre !== "Todas"
  const showKpis =
    zonaSeleccionadaNombre !== nombreSinZona && !isZonaDeshabilitada;

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Cargando restaurante...
      </div>
    );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-1 items-center min-w-0 space-x-2">
          {/* BTN ZONAS */}
          <button
            onClick={() => setZonasModalOpen(true)}
            className="shrink-0 p-2 hover:bg-gray-100 rounded-full transition text-gray-600 cursor-pointer"
            title="Gestionar zonas"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>

          {/* Lista de zonas (Tabs) */}
          <div className="flex flex-1 items-center gap-8 overflow-x-auto custom-scrollbar w-0 pr-4">
            {nombresZonasTabs.map((nombre) => {
              // Buscar ID para checar si está deshabilitada
              const zonaObj = zonas.find((z) => z.nombre === nombre);

              // "Todas" y "Sin Zona" nunca están deshabilitadas por ID
              const isDisabled = zonaObj
                ? disabledZonesIds.includes(zonaObj.id)
                : false;
              const isSelected = zonaSeleccionadaNombre === nombre;

              // --- CAMBIO 2: Lógica de visualización para Deshabilitados ---
              // Ya no hacemos "return null". Ahora aplicamos estilos condicionales.

              return (
                <button
                  key={nombre}
                  onClick={() => setZonaSeleccionadaNombre(nombre)}
                  className={`shrink-0 pb-1 text-[18px] font-bold transition 
                    ${
                      isSelected
                        ? "text-[#FA9623] border-b-2 border-[#FA9623] cursor-pointer"
                        : "text-gray-400 hover:text-gray-600 cursor-pointer"
                    }
                    ${
                      isDisabled
                        ? "opacity-40 grayscale cursor-context-menu"
                        : ""
                    } 
                  `}
                  // Opcional: Si quieres que NO se pueda dar click a lo deshabilitado, agrega: disabled={isDisabled}
                  // Pero tu requerimiento dice "hacerse más grises", usualmente se permite ver el historial.
                >
                  {nombre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Agregar Mesa */}
        <button
          onClick={() => setAddModalOpen(true)}
          className="shrink-0 px-4 py-2 bg-[#FA9623] text-[18px] text-white rounded-lg font-medium hover:bg-[#e68a1f] transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span className="text-xl">+</span> Agregar Mesa
        </button>
      </div>

      {/* KPIs (Ocultar si es Todas o Sin Zona según tu lógica antigua, o ajustar aquí) */}
      {showKpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard title="Total Mesas" value={total} color="text-gray-800" />
          <KpiCard title="Libres" value={libres} color="text-[#22C55E]" />
          <KpiCard title="Ocupadas" value={ocupadas} color="text-[#EF4444]" />
          <KpiCard title="Esperando" value={esperando} color="text-[#F59E0B]" />
          <KpiCard title="Grupos" value={grupos} color="text-[#A855F7]" />
          <KpiCard title="Reservadas" value="..." color="text-gray-800" />
        </div>
      )}

      {/* GRID Mesas */}
      <div className="rounded-2xl">
        {mesasFiltradas.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            No hay mesas aquí.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {mesasFiltradas.map((mesa) => (
              <div key={mesa.id} className="relative animate-fadeIn">
                <div
                  onClick={() => openDetail(mesa.id)}
                  className="cursor-pointer transition hover:scale-[1.02]"
                >
                  <MesaCard
                    mesa={{ ...mesa, zona: mesa.nombreZona }}
                    // 👇 CORRECCIÓN AQUÍ:
                    // Si zonaId existe (es número), revisamos si está en la lista.
                    // Si es null, devolvemos false (no puede estar deshabilitada).
                    zonaDeshabilitada={
                      mesa.zonaId !== null
                        ? disabledZonesIds.includes(mesa.zonaId)
                        : false
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALES CONECTADOS CORRECTAMENTE --- */}

      <MesaFormModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        zonas={zonas} // ✅ Pasamos OBJETOS
        zonaDefaultId={
          // Calculamos el ID basado en el nombre del Tab seleccionado
          zonaSeleccionadaNombre !== "Todas"
            ? zonas.find((z) => z.nombre === zonaSeleccionadaNombre)?.id
            : undefined
        }
        onSubmit={crearMesa}
      />

      {detailMesaId && (
        <MesaModal
          mesa={mesas.find((m) => m.id === detailMesaId) ?? null}
          visible={detailVisible}
          zonas={zonas} // ✅ Pasamos OBJETOS
          onClose={() => {
            setDetailVisible(false);
            setDetailMesaId(null);
          }}
        />
      )}

      <ZonasModal
        visible={zonasModalOpen}
        onClose={() => setZonasModalOpen(false)}
        zonas={zonas}
        crearZona={crearZona}
        actualizarZona={actualizarZona}
        eliminarZona={eliminarZona}
        eliminarZonaConMesas={eliminarZonaConMesas}
        // 👈 2. PÁSALO AQUÍ
        toggleEstadoZona={toggleEstadoZona}
      />
    </div>
  );
};

// Componente simple para KPI
const KpiCard = ({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
    <div className="text-[18px] text-gray-400 font-bold">{title}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
);

const MesasPageWrapper: React.FC = () => (
  <MesasProvider>
    <Inner />
  </MesasProvider>
);

export default MesasPageWrapper;
