// src/pages/MesasPage.tsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useMesasContext, MesasProvider } from "../context/MesasContext";
import MesaFormModal from "../components/mesas/MesaFormModal";
import MesaModal from "../components/mesas/MesaModal";
import { MesaCard } from "../components/mesas/MesaCard";
import ZonasModal from "../components/mesas/ZonaModal";

const Inner = () => {
  const { mesas, loading, mode, selectedIds, toggleSelect, refresh } =
    useMesasContext();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailMesa, setDetailMesa] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Zonas (dinámicas)
  const [zonas, setZonas] = useState<string[]>(["Todas", "Sin zona"]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>("Todas");
  const [zonasModalOpen, setZonasModalOpen] = useState(false);

  // --- LÓGICA DE ZONAS ---
  useEffect(() => {
    const zonasEncontradas = Array.from(
      new Set(
        mesas.map((m) => (m.zona && m.zona.trim() !== "" ? m.zona : "Sin zona"))
      )
    );

    setZonas((prev) => {
      const nuevas = [...prev];
      zonasEncontradas.forEach((z) => {
        if (!nuevas.includes(z)) nuevas.push(z);
      });
      const todas = nuevas.filter((z) => z !== "Todas" && z !== "Sin zona");
      return ["Todas", "Sin zona", ...todas];
    });

    if (!zonas.includes(zonaSeleccionada)) {
      setZonaSeleccionada("Todas");
    }
    // eslint-disable-next-line
  }, [mesas]);

  // --- FILTRADO Y ORDENAMIENTO ---
  const mesasFiltradas = (
    zonaSeleccionada === "Todas"
      ? mesas
      : mesas.filter(
          (m) =>
            (m.zona && m.zona.trim() !== "" ? m.zona : "Sin zona") ===
            zonaSeleccionada
        )
  ).sort((a, b) => {
    // 1. Prioridad: Mesas con alertas van primero
    const alertasA = a.orden?.totalAlertas || 0;
    const alertasB = b.orden?.totalAlertas || 0;
    if (alertasA !== alertasB) return alertasB - alertasA; // Mayor alerta primero

    // 2. Orden numérico por nombre (Mesa 1, Mesa 2...)
    const numA = parseInt(a.nombre.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.nombre.replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  // --- ESTADÍSTICAS (KPIs) ---
  const total = mesasFiltradas.length;
  const libres = mesasFiltradas.filter((m) => m.estado === "LIBRE").length;
  const ocupadas = mesasFiltradas.filter((m) => m.estado === "OCUPADA").length;
  // Buscamos mesas con alertas reales
  const conAlertas = mesasFiltradas.filter(
    (m) => (m.orden?.totalAlertas || 0) > 0
  ).length;
  const esperando = mesasFiltradas.filter(
    (m) => m.estado === "ESPERANDO"
  ).length;
  const grupos = mesasFiltradas.filter(
    (m) => m.estado === "AGRUPADA" && m.principal
  ).length;

  const openDetail = (id: number) => {
    setDetailMesa(id);
    setDetailVisible(true);
  };

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Header y Zonas */}
        <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-1 items-center min-w-0 space-x-2">
            <button
              onClick={() => setZonasModalOpen(true)}
              className="shrink-0 p-2 hover:bg-gray-100 rounded-full transition"
              title="Gestionar zonas"
            >
              {/* Icono Edit simple */}
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
                className="text-gray-600"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>

            <div className="flex flex-1 items-center gap-8 overflow-x-auto custom-scrollbar w-0 pr-4">
              {zonas.map((zona) => (
                <button
                  key={zona}
                  onClick={() => setZonaSeleccionada(zona)}
                  className={`shrink-0 pb-1 text-[18px] font-bold tracking-wide transition cursor-pointer ${
                    zonaSeleccionada === zona
                      ? "text-[#FA9623] border-b-2 border-[#FA9623]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {zona}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="shrink-0 px-4 py-2 bg-[#FA9623] text-base text-white rounded-lg font-medium hover:bg-[#e68a1f] transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            + Agregar Mesa
          </button>
        </div>

        {/* KPIs Superiores */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* KPI Total */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="text-base text-gray-400 font-bold">Total Mesas</div>
            <div className="text-2xl font-bold text-gray-800">{total}</div>
          </div>

          {/* KPI Libres */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="text-base text-gray-400 font-bold">Libres</div>
            <div className="text-2xl font-bold text-[#22C55E]">{libres}</div>
          </div>

          {/* KPI Ocupadas */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="text-base text-gray-400 font-bold">Ocupadas</div>
            <div className="text-2xl font-bold text-[#EF4444]">{ocupadas}</div>
          </div>

          {/* KPI Esperando */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="text-base text-gray-400 font-bold">
              Esperando Cuenta
            </div>
            <div className="text-2xl font-bold text-[#F59E0B]">{esperando}</div>
          </div>

          {/* KPI Grupos */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="text-base text-gray-400 font-bold">Grupos</div>
            <div className="text-2xl font-bold text-[#A855F7]">{grupos}</div>
          </div>

          {/* KPI Reservadas */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="text-base text-gray-400 font-bold">Reservadas</div>
            <div className="text-2xl font-bold text-gray-800">...</div>
          </div>
        </div>

        {/* Grid Mesas */}
        <div className="bg-gray-50/50 rounded-2xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {mesasFiltradas.map((mesa) => (
              <div key={mesa.id} className="relative group">
                {mode === "DELETE" && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(mesa.id)}
                    onChange={() => toggleSelect(mesa.id)}
                    className="absolute top-2 left-2 z-20 w-5 h-5 accent-red-500"
                  />
                )}

                <div
                  onClick={() =>
                    !(mesa.grupo && !mesa.principal) && openDetail(mesa.id)
                  }
                  className={
                    mesa.grupo && !mesa.principal
                      ? "pointer-events-none opacity-60"
                      : "cursor-pointer"
                  }
                >
                  {/* Aquí usamos el componente inteligente que ya sabe leer alertas y comensales */}
                  <MesaCard mesa={mesa} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modales */}
      <MesaFormModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        zonas={zonas.filter((z) => z !== "Todas")}
        zonaDefault={
          zonaSeleccionada === "Todas" || zonaSeleccionada === "Sin zona"
            ? "Sin zona"
            : zonaSeleccionada
        }
      />

      <MesaModal
        mesa={mesas.find((m) => m.id === detailMesa) ?? null}
        visible={detailVisible}
        zonas={zonas}
        onClose={() => {
          setDetailVisible(false);
          setDetailMesa(null);
          refresh();
        }}
      />

      <ZonasModal
        visible={zonasModalOpen}
        zonas={zonas}
        setZonas={setZonas}
        onClose={() => setZonasModalOpen(false)}
      />
    </Layout>
  );
};

const MesasPageWrapper: React.FC = () => (
  <MesasProvider>
    <Inner />
  </MesasProvider>
);

export default MesasPageWrapper;
