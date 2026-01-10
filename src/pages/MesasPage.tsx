import React, { useState, useEffect } from "react";
import { MesasProvider } from "../context/MesasContext";
import { useMesas } from "../hooks/useMesas";
import { useFilteredMesas } from "../hooks/useFilteredMesas";
import MesaFormModal from "../components/tables/MesaFormModal";
import MesaModal from "../components/tables/mesa-modal/MesaModal";
import { MesaCard } from "../components/tables/MesaCard";
import ZonasModal from "../components/tables/zona-modal/ZonaModal";
import { Settings2, Plus } from "lucide-react";

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
    refreshAll,
    lastCreatedId,
  } = useMesas();

  const {
    filteredData,
    zonaSeleccionada,
    setZonaSeleccionada,
    stats,
    estadoSeleccionado,
    setEstadoSeleccionado,
  } = useFilteredMesas();

  const [modals, setModals] = useState({
    add: false,
    zonas: false,
    detailId: null as number | null,
    detailVisible: false,
  });

  const hasOrphanTables = mesas.some(
    (m) => m.zona?.toLowerCase() === "sin zona"
  );

  const visibleZonas = zonas.filter((z) => {
    const isSinZona = z.nombre.toLowerCase() === "sin zona";
    if (!isSinZona) return true;

    return mesas.some(
      (m) => m.zonaId === z.id || m.zona?.toLowerCase() === "sin zona"
    );
  });

  // 🚀 LÓGICA DE AUTO-SCROLL
  useEffect(() => {
    if (lastCreatedId) {
      // Esperamos un momento mínimo a que el DOM se renderice
      const timer = setTimeout(() => {
        const element = document.getElementById(
          `mesa-container-${lastCreatedId}`
        );
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center", // Centra la mesa en la pantalla para mejor visibilidad
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [lastCreatedId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!modals.detailId) refreshAll(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshAll, modals.detailId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-400 font-bold text-xl">
          Cargando restaurante...
        </div>
      </div>
    );

  const handleToggleFilter = (estado: string | null) => {
    if (estado === null) {
      setEstadoSeleccionado(null);
    } else {
      setEstadoSeleccionado(estadoSeleccionado === estado ? null : estado);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* 🛠️ HEADER / TOOLBAR */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        {/* 🚀 CORRECCIÓN: Quitamos 'overflow-hidden' de este div para que el badge no se corte */}
        <div className="flex flex-1 items-center gap-4">
          {/* BOTÓN CONFIGURACIÓN CON ALERTA */}
          <button
            onClick={() => setModals((m) => ({ ...m, zonas: true }))}
            className="relative p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group z-10"
            title="Gestionar zonas"
          >
            {/* 🔄 LÍNEA DE ROTACIÓN: 'group-hover:rotate-45' hace que rote al poner el mouse en el botón */}
            <Settings2 size={20} className=" ease-in-out" />

            {/* 🔴 Badge de Alerta Pro */}
            {hasOrphanTables && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white shadow-md"></span>
              </span>
            )}
          </button>

          {/* nav con su propio scroll y overflow si es necesario */}
          <nav className="flex flex-1 items-center gap-6 overflow-x-auto no-scrollbar border-l pl-4 border-gray-100">
            {["Todas", ...visibleZonas.map((z) => z.nombre)].map((nombre) => (
              <button
                key={nombre}
                onClick={() => setZonaSeleccionada(nombre)}
                className={`text-sm font-black whitespace-nowrap transition-all pb-2 border-b-2 cursor-pointer ${
                  zonaSeleccionada === nombre
                    ? "text-[#FF8108] border-[#FF8108]"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                {nombre}
              </button>
            ))}
          </nav>
        </div>

        {/* Botón Agregar Mesa */}
        <button
          onClick={() => setModals((m) => ({ ...m, add: true }))}
          className="bg-[#FF8108] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus size={22} strokeWidth={3} /> Agregar Mesa
        </button>
      </header>

      {/* 📊 PANEL DE ESTADOS (KPIs) */}
      {zonaSeleccionada.toLowerCase() !== "sin zona" && (
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <KpiCard
            title="Total"
            value={stats.total}
            color="bg-gray-900"
            borderColor="border-gray-900"
            isActive={estadoSeleccionado === null}
            onClick={() => handleToggleFilter(null)}
          />
          <KpiCard
            title="Libres"
            value={stats.libres}
            color="bg-emerald-500"
            borderColor="border-emerald-500"
            isActive={estadoSeleccionado === "LIBRE"}
            onClick={() => handleToggleFilter("LIBRE")}
          />
          <KpiCard
            title="Ocupadas"
            value={stats.ocupadas}
            color="bg-red-500"
            borderColor="border-red-500"
            isActive={estadoSeleccionado === "OCUPADA"}
            onClick={() => handleToggleFilter("OCUPADA")}
          />
          <KpiCard
            title="Por Cobrar"
            value={stats.esperando || 0}
            color="bg-yellow-500"
            borderColor="border-yellow-500"
            isActive={estadoSeleccionado === "ESPERANDO_PAGO"}
            onClick={() => handleToggleFilter("ESPERANDO_PAGO")}
          />
          <KpiCard
            title="Por Liberar"
            value={stats.porLiberar || 0}
            color="bg-sky-400"
            borderColor="border-sky-400"
            isActive={estadoSeleccionado === "POR_LIBERAR"}
            onClick={() => handleToggleFilter("POR_LIBERAR")}
          />
        </section>
      )}

      {/* GRID DE MESAS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-medium italic">
            No hay mesas disponibles en esta sección.
          </div>
        ) : (
          filteredData.map((mesa) => {
            const isNew = mesa.id === lastCreatedId;
            return (
              <div
                key={mesa.id}
                id={`mesa-container-${mesa.id}`}
                onClick={() =>
                  setModals((m) => ({
                    ...m,
                    detailId: mesa.id,
                    detailVisible: true,
                  }))
                }
                className={`cursor-pointer transition-all ${
                  isNew ? "animate-new-table z-10 scale-105" : ""
                }`}
              >
                <MesaCard
                  mesa={mesa}
                  isNew={isNew}
                  zonaDeshabilitada={
                    zonas.find((z) => z.id === mesa.zonaId)?.estado ===
                    "Inactiva"
                  }
                />
              </div>
            );
          })
        )}
      </section>

      {/* 📦 MODALES */}
      <MesaFormModal
        visible={modals.add}
        onClose={() => setModals((m) => ({ ...m, add: false }))}
        zonas={zonas}
        zonaDefaultId={zonas.find((z) => z.nombre === zonaSeleccionada)?.id}
      />

      {modals.detailId && (
        <MesaModal
          mesa={filteredData.find((m) => m.id === modals.detailId) ?? null}
          visible={modals.detailVisible}
          zonas={zonas}
          onClose={() =>
            setModals((m) => ({ ...m, detailVisible: false, detailId: null }))
          }
        />
      )}

      <ZonasModal
        visible={modals.zonas}
        onClose={() => setModals((m) => ({ ...m, zonas: false }))}
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
  borderColor,
  isActive,
  onClick,
}: {
  title: string;
  value: number;
  color: string;
  borderColor: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`relative bg-white p-5 rounded-3xl border-2 transition-all duration-300 flex items-center gap-4 cursor-pointer text-left w-full group
      ${
        isActive
          ? `${borderColor} shadow-xl shadow-gray-100 scale-[1.03] z-10`
          : "border-transparent shadow-sm hover:border-gray-100 hover:-translate-y-1"
      }`}
  >
    {/* Indicador lateral que se ensancha al estar activo */}
    <div
      className={`transition-all duration-300 rounded-full ${color} ${
        isActive ? "w-2.5 h-12" : "w-1.5 h-8 opacity-40"
      }`}
    />

    <div className="flex flex-col">
      <p
        className={`text-[10px] uppercase tracking-[0.15em] font-black transition-colors ${
          isActive ? "text-gray-900" : "text-gray-400"
        }`}
      >
        {title}
      </p>
      <p
        className={`text-3xl font-black tabular-nums tracking-tighter transition-colors ${
          isActive ? "text-gray-900" : "text-gray-700"
        }`}
      >
        {value}
      </p>
    </div>
  </button>
);

const MesasPageWrapper: React.FC = () => (
  <MesasProvider>
    <Inner />
  </MesasProvider>
);

export default MesasPageWrapper;
