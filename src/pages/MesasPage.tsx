// src/pages/MesasPage.tsx
import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useMesasContext, MesasProvider } from "../context/MesasContext";
import MesaConfigMenu from "../components/MesaConfigMenu";
import MesaFormModal from "../components/MesaFormModal";
import MesaDeleteModal from "../components/MesaDeleteModal";
import MesaModal from "../components/MesaModal";
import { MesaCard } from "../components/MesaCard";

const Inner = () => {
  const {
    mesas,
    loading,
    mode,
    selectedIds,
    toggleSelect,
    setMode,
    deleteSelected,
  } = useMesasContext();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editMesaId, setEditMesaId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [detailMesa, setDetailMesa] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const total = mesas.length;
  const libres = mesas.filter((m) => m.estado === "LIBRE").length;
  const ocupadas = mesas.filter((m) => m.estado === "OCUPADA").length;
  const esperando = mesas.filter((m) => m.estado === "ESPERANDO").length;
  const agrupadas = mesas.filter((m) => m.estado === "AGRUPADA").length;

  const openForEdit = (id: number) => {
    setEditMesaId(id);
    setAddModalOpen(true);
  };

  const openDetail = async (id: number) => {
    setDetailMesa(id);
    setDetailVisible(true);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold">Mesas</h2>
        </div>

        <div className="flex items-center gap-3">
          {mode === "DELETE" && selectedIds.length > 0 && (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Eliminar seleccionadas ({selectedIds.length})
            </button>
          )}

          <MesaConfigMenu />
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">TOTAL MESAS</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">LIBRES</div>
          <div className="text-2xl font-bold text-green-600">{libres}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">OCUPADAS</div>
          <div className="text-2xl font-bold text-red-600">{ocupadas}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">ESPERANDO CUENTA</div>
          <div className="text-2xl font-bold text-yellow-600">{esperando}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">GRUPOS</div>
          <div className="text-2xl font-bold text-purple-600">{agrupadas}</div>
        </div>
      </div>

      {/* Grid de mesas */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {mesas.map((mesa) => (
            <div key={mesa.id} className="relative">
              {/* Checkbox en modo eliminar */}
              {mode === "DELETE" && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(mesa.id)}
                  onChange={() => toggleSelect(mesa.id)}
                  className="absolute top-2 left-2 z-20 w-5 h-5"
                />
              )}

              {/* Botón editar en modo edición */}
              {mode === "EDIT" && (
                <button
                  onClick={() => openForEdit(mesa.id)}
                  className="absolute top-2 right-2 z-20 bg-white border rounded px-2 py-1 text-xs font-medium shadow-sm"
                >
                  Editar
                </button>
              )}

              <div onClick={() => openDetail(mesa.id)}>
                <MesaCard mesa={mesa} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modales */}
      <MesaFormModal
        visible={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditMesaId(null);
        }}
        editMesaId={editMesaId}
      />
      <MesaFormModal
        visible={!!editMesaId && addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditMesaId(null);
        }}
        editMesaId={editMesaId}
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
        }}
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
