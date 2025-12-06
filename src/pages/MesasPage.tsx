// src/pages/MesasPage.tsx
import React, { useState, useMemo } from "react";
import { MesasProvider } from "../context/MesasContext";
import { useMesas } from "../hooks/useMesas";
import MesaFormModal from "../components/tables/MesaFormModal";
import MesaModal from "../components/tables/mesa-modal/MesaModal";
import { MesaCard } from "../components/tables/MesaCard";
import ZonasModal from "../components/tables/zona-modal/ZonaModal";

const Inner = () => {
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
    toggleEstadoZona,
  } = useMesas();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailMesaId, setDetailMesaId] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [zonasModalOpen, setZonasModalOpen] = useState(false);

  const [zonaSeleccionadaNombre, setZonaSeleccionadaNombre] =
    useState<string>("Todas");

  const sinZonaObj = zonas.find(
    (z) => z.nombre.trim().toLowerCase() === "sin zona"
  );

  // CORRECCIÓN: Ahora solo comprobamos si alguna mesa tiene el nombre de zona "Sin Zona".
  // Este nombre se asigna en adaptMesa si la mesa no tiene zona.
  const hayMesasSinZona = mesas.some(
    (m) => m.zona && m.zona.trim().toLowerCase() === "sin zona"
  );

  const nombreSinZona = sinZonaObj?.nombre || "Sin Zona";

  const getNombreZona = (mesaZona: string | undefined, id: number | null) => {
    // Si el campo 'mesaZona' ya tiene un valor (que vino del backend via adaptMesa), lo usamos.
    if (mesaZona && mesaZona.trim().toLowerCase() !== "sin zona") {
      return mesaZona;
    }

    // Si zonaId es null o undefined, o la zona no se encuentra, usamos el nombre estandarizado 'Sin Zona'.
    // Esto es un fallback, pero no debería activarse si el backend ya envió el nombre.
    return zonas.find((z) => z.id === id)?.nombre || nombreSinZona;
  };

  const disabledZonesIds = useMemo(() => {
    return zonas.filter((z) => z.estado === "Inactiva").map((z) => z.id);
  }, [zonas]);

  // -------------------------------------------------------------
  // 🧹 CÓDIGO CORREGIDO: mesasFiltradas SIN LÓGICA ERRÓNEA
  // -------------------------------------------------------------
  const mesasFiltradas = useMemo(() => {
    let resultado = mesas.map((m) => ({
      ...m,
      nombreZona: getNombreZona(m.zona, m.zonaId),
    }));

    if (zonaSeleccionadaNombre !== "Todas") {
      resultado = resultado.filter(
        (m) => m.nombreZona === zonaSeleccionadaNombre
      );
    } else {
      // Filtrar mesas inactivas SOLO cuando "Todas" está seleccionada
      const idSinZona = zonas.find(
        (z) => z.nombre === "Sin Zona" || z.nombre === "Sin zona"
      )?.id;

      resultado = resultado.filter((m) => {
        if (idSinZona && m.zonaId === idSinZona) return true;
        if (m.zonaId === null) return true;

        return !disabledZonesIds.includes(m.zonaId);
      });
    }

    return resultado.sort((a, b) => {
      const alertA = a.orden?.totalAlertas || 0;
      const alertB = b.orden?.totalAlertas || 0;
      if (alertA !== alertB) return alertB - alertA;

      const numA = parseInt(a.nombre.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.nombre.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });
  }, [mesas, zonas, zonaSeleccionadaNombre, disabledZonesIds]);
  // -------------------------------------------------------------

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

  const nombresZonasTabs = useMemo(() => {
    const tabs = ["Todas"];
    if (hayMesasSinZona) {
      tabs.push(nombreSinZona);
    }

    zonas.forEach((z) => {
      const nombreLower = z.nombre.trim().toLowerCase();
      if (nombreLower === "sin zona") return;
      tabs.push(z.nombre);
    });

    return tabs;
  }, [zonas, hayMesasSinZona, nombreSinZona, sinZonaObj]);

  const zonaActualObj = zonas.find((z) => z.nombre === zonaSeleccionadaNombre);

  const isZonaDeshabilitada = zonaActualObj
    ? disabledZonesIds.includes(zonaActualObj.id)
    : false;

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
              const zonaObj = zonas.find((z) => z.nombre === nombre);

              const isDisabled = zonaObj
                ? disabledZonesIds.includes(zonaObj.id)
                : false;
              const isSelected = zonaSeleccionadaNombre === nombre;

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
            {mesasFiltradas.map((mesa) => {
              // ************ CORRECCIÓN: Buscamos el estado de la zona por NOMBRE ************
              // Como mesa.zonaId viene null, buscamos en el array 'zonas' usando el nombre de la mesa.
              const zonaObj = zonas.find((z) => z.nombre === mesa.nombreZona);
              const estaDeshabilitada = zonaObj?.estado === "Inactiva";
              // ******************************************************************************

              return (
                <div key={mesa.id} className="relative animate-fadeIn">
                  <div
                    onClick={() => openDetail(mesa.id)}
                    className="cursor-pointer transition hover:scale-[1.02]"
                  >
                    <MesaCard
                      mesa={{ ...mesa, zona: mesa.nombreZona }}
                      // Pasamos el valor calculado arriba
                      zonaDeshabilitada={estaDeshabilitada}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MesaFormModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        zonas={zonas}
        zonaDefaultId={
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
          zonas={zonas}
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
        toggleEstadoZona={toggleEstadoZona}
      />
    </div>
  );
};

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
