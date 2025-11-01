// src/components/MesaConfigMenu.tsx
import React, { useState, useRef, useEffect } from "react";
import { useMesasContext } from "../context/MesasContext";
import MesaFormModal from "./MesaFormModal";
import MesaDeleteModal from "./MesaDeleteModal";

const MesaConfigMenu: React.FC = () => {
  const { setMode, mode, selectedIds } = useMesasContext();
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="p-2 rounded-md bg-white border shadow hover:shadow-md"
        title="Configuración"
      >
        <img src="/icons/gear.svg" alt="Config" className="h-6 w-6" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-40">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              setShowAddModal(true);
              setOpen(false);
            }}
          >
            Agregar Mesa
          </button>

          <button
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
              mode === "EDIT" ? "font-semibold" : ""
            }`}
            onClick={() => {
              setMode(mode === "EDIT" ? "NORMAL" : "EDIT");
              setOpen(false);
            }}
          >
            {mode === "EDIT" ? "Salir Modo Edición" : "Editar Mesa"}
          </button>

          <button
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
              mode === "DELETE" ? "font-semibold" : ""
            }`}
            onClick={() => {
              setMode(mode === "DELETE" ? "NORMAL" : "DELETE");
              setOpen(false);
            }}
          >
            {mode === "DELETE" ? "Salir Modo Eliminación" : "Eliminar Mesa"}
          </button>
        </div>
      )}

      <MesaFormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <MesaDeleteModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default MesaConfigMenu;
