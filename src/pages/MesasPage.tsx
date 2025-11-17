import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useMesasContext, MesasProvider } from "../context/MesasContext";
import MesaFormModal from "../components/MesaFormModal";
import MesaDeleteModal from "../components/MesaDeleteModal";
import MesaModal from "../components/MesaModal";
import { MesaCard } from "../components/MesaCard";
import ZonasModal from "../components/ZonaModal";

const Inner = () => {
  const { mesas, loading, mode, selectedIds, toggleSelect, refresh } =
    useMesasContext();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailMesa, setDetailMesa] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Zonas (ahora dinámicas)
  const [zonas, setZonas] = useState<string[]>(["Todas", "Sin zona"]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>("Todas");
  const [zonasModalOpen, setZonasModalOpen] = useState(false);

  // Reconstruir lista de zonas a partir de mesas cada vez que cambien
  useEffect(() => {
    const fromMesas = Array.from(
      new Set(
        mesas
          .map((m) => (m.zona && m.zona.trim() !== "" ? m.zona : "Sin zona"))
          .filter(Boolean)
      )
    );

    // Asegurarse que "Sin zona" esté presente y "Todas" al inicio
    const unique = [
      "Todas",
      "Sin zona",
      ...fromMesas.filter((z) => z !== "Sin zona"),
    ];

    setZonas(unique);
    // Si la zona seleccionada ya no existe, volver a "Todas"
    if (!unique.includes(zonaSeleccionada)) setZonaSeleccionada("Todas");
  }, [mesas]); // eslint-disable-line

  // Filtrar mesas según zonaSeleccionada
  const mesasFiltradas = (
    zonaSeleccionada === "Todas"
      ? mesas
      : mesas.filter(
          (m) =>
            (m.zona && m.zona.trim() !== "" ? m.zona : "Sin zona") ===
            zonaSeleccionada
        )
  ).sort((a, b) => {
    const numA = parseInt(a.nombre.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.nombre.replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  // Estadísticas basadas en mesasFiltradas (dinámicas por zona)
  const total = mesasFiltradas.length;
  const libres = mesasFiltradas.filter((m) => m.estado === "LIBRE").length;
  const ocupadas = mesasFiltradas.filter((m) => m.estado === "OCUPADA").length;
  const esperando = mesasFiltradas.filter(
    (m) => m.estado === "ESPERANDO"
  ).length;
  const agrupadas = mesasFiltradas.filter(
    (m) => m.estado === "AGRUPADA"
  ).length;

  const openDetail = (id: number) => {
    setDetailMesa(id);
    setDetailVisible(true);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Zonas + acciones */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center min-w-0 space-x-2">
            {/* Botón gestionar zonas */}
            <button
              onClick={() => setZonasModalOpen(true)}
              className="flex-shrink-0 mr-4 ml-1"
              title="Gestionar zonas"
            >
              <img
                src="/icons/edit.svg"
                alt="Editar zonas"
                className="h-6 w-6 fill-current text-gray-600"
              />
            </button>

            <div className="flex flex-1 items-center gap-6 overflow-x-auto custom-scrollbar w-0 pr-4">
              {zonas.map((zona) => (
                <button
                  key={zona}
                  onClick={() => setZonaSeleccionada(zona)}
                  className={`flex-shrink-0 pb-1 text-lg font-medium transition ${
                    zonaSeleccionada === zona
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {zona}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex-shrink-0 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition ml-2"
            title="Agregar mesa"
          >
            + Agregar Mesa
          </button>
        </div>

        {/* Estadísticas (dinámicas por zona) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-base text-gray-500">TOTAL MESAS</div>
            <div className="text-2xl font-bold text-gray-800">{total}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-base text-gray-500">LIBRES</div>
            <div className="text-2xl font-bold text-green-600">{libres}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-base text-gray-500">OCUPADAS</div>
            <div className="text-2xl font-bold text-red-600">{ocupadas}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-base text-gray-500">ESPERANDO CUENTA</div>
            <div className="text-2xl font-bold text-yellow-600">
              {esperando}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">GRUPOS</div>
            <div className="text-2xl font-bold text-purple-600">
              {agrupadas}
            </div>
          </div>
        </div>

        {/* Grid mesas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {mesasFiltradas.map((mesa) => (
              <div key={mesa.id} className="relative">
                {mode === "DELETE" && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(mesa.id)}
                    onChange={() => toggleSelect(mesa.id)}
                    className="absolute top-2 left-2 z-20 w-5 h-5"
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

      <MesaDeleteModal
        visible={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      />

      <MesaModal
        mesa={mesas.find((m) => m.id === detailMesa) ?? null}
        visible={detailVisible}
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
