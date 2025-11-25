// src/components/mesas/MesaModal.tsx
import React, { useEffect, useState } from "react";
import { Mesa, Platillo } from "../../types/mesa";
import { useMesasContext } from "../../context/MesasContext";
// Agregamos Clock para el tiempo
import { AlertTriangle, Clock } from "lucide-react";

interface Props {
  mesa: Mesa | null;
  visible: boolean;
  onClose: () => void;
  zonas?: string[];
}

const predefined = [2, 4, 6, 8];

// Helpers de formato
const formatCurrency = (n?: number) =>
  n == null
    ? "$0.00"
    : n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
      });

// --- COMPONENTE DE FILA DE PLATILLO ---
const PlatilloRow: React.FC<{ platillo: Platillo; comensalNombre: string }> = ({
  platillo,
  comensalNombre,
}) => {
  const isDelayed = platillo.requiereAtencion;

  // Calculamos el tiempo en el estado actual
  const tiempoEnEstado = (() => {
    if (!platillo.tiempoRegistrado) return 0;
    const inicio = new Date(platillo.tiempoRegistrado).getTime();
    const ahora = Date.now();
    return Math.max(0, Math.floor((ahora - inicio) / 60000));
  })();

  const estadoStyles: Record<string, string> = {
    TOMADO: "bg-blue-100 text-blue-700 border-blue-200",
    EN_PREPARACION: "bg-yellow-100 text-yellow-700 border-yellow-200",
    LISTO: "bg-green-100 text-green-700 border-green-200",
    ENTREGADO: "bg-gray-100 text-gray-600 border-gray-200",
    RETRASADO: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div
      className={`relative flex flex-col bg-white border rounded-xl shadow-sm transition-all duration-200 overflow-hidden group ${
        isDelayed
          ? "border-red-300 shadow-red-100 ring-1 ring-red-100"
          : "border-gray-200 hover:border-gray-300 mb-3"
      }`}
    >
      {/* Contenido Principal */}
      <div className="p-4 flex justify-between items-start gap-4">
        {/* IZQUIERDA: Info del Platillo */}
        <div className="flex flex-col justify-start items-start gap-1.5">
          {/* Nombre Grande */}
          <span className="text-xl font-bold text-gray-800">
            {platillo.nombre}
          </span>

          {/* Badge Comensal (Sutil) */}
          <div className="flex items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[14px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
              {comensalNombre}
            </span>
          </div>
        </div>

        {/* DERECHA: Metadatos (Alineados a la derecha) */}
        <div className="flex flex-col items-end gap-1.5">
          {/* Precio */}
          <div className="text-xl font-bold text-emerald-600 tracking-tight">
            {formatCurrency(platillo.precio)}
          </div>

          {/* Estado Badge */}
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
              estadoStyles[platillo.estado] ||
              "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            {platillo.estado.replace("_", " ")}
          </span>

          {/* Tiempo (Con ícono) */}
          <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
            <Clock size={12} />
            <span>Hace {tiempoEnEstado} min</span>
          </div>
        </div>
      </div>

      {/* FOOTER DE ALERTA (Solo si es necesario) */}
      {isDelayed && (
        <div className="bg-red-50 px-4 py-2 flex items-center gap-2 border-t border-red-100">
          <div className="bg-red-100 p-1 rounded-full animate-pulse">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-red-600"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
            Requiere atención inmediata
          </span>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (MODAL) ---
const MesaModal: React.FC<Props> = ({ mesa, visible, onClose, zonas = [] }) => {
  const { updateMesa, deleteMesa, openMesaById } = useMesasContext();

  const [activeTab, setActiveTab] = useState<"DETALLES" | "EDITAR">("DETALLES");
  const [localMesa, setLocalMesa] = useState<Mesa | null>(mesa);

  // Estados de formulario
  const [nombre, setNombre] = useState(mesa?.nombre ?? "");
  const [capacidad, setCapacidad] = useState<number | "otro">(4);
  const [otroValor, setOtroValor] = useState<number | "">("");
  const [zona, setZona] = useState(mesa?.zona ?? "Sin zona");
  const [loading, setLoading] = useState(false);

  // Modal interno de borrar
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (visible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  useEffect(() => {
    if (!mesa) return;
    setLocalMesa(mesa);
    setNombre(mesa.nombre);
    setZona(mesa.zona ?? "Sin zona");

    if (mesa.capacidad && predefined.includes(mesa.capacidad)) {
      setCapacidad(mesa.capacidad);
      setOtroValor("");
    } else {
      setCapacidad("otro");
      setOtroValor(mesa.capacidad ?? "");
    }
    setActiveTab("DETALLES");
    setShowDeleteConfirm(false);
  }, [mesa]);

  useEffect(() => {
    (async () => {
      if (!mesa) return;
      const fresh = await openMesaById(mesa.id);
      if (fresh) setLocalMesa(fresh);
    })();
  }, [mesa, openMesaById]);

  if (!visible || !localMesa) return null;

  const isEditable = localMesa.estado === "LIBRE";

  // --- GUARDAR EDICIÓN ---
  const handleSave = async () => {
    if (!isEditable) return;
    setLoading(true);
    try {
      const finalCapacidad =
        capacidad === "otro" ? Number(otroValor) : (capacidad as number);
      await updateMesa(localMesa.id, finalCapacidad, zona, nombre);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE BORRADO ---
  const requestDelete = () => {
    if (!isEditable) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await deleteMesa(localMesa.id);
      onClose();
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // --- DATOS ADAPTADOS Y FILTRADOS ---
  const ordenActiva = localMesa.orden;
  const todosLosPlatillos =
    ordenActiva?.comensales.flatMap((comensal) =>
      comensal.platillos
        .filter((p) => p.estado !== "ENTREGADO" && p.estado !== "CANCELADO")
        .map((platillo) => ({
          ...platillo,
          comensalNombre: comensal.nombre,
        }))
    ) || [];

  const minutosAbierta = ordenActiva?.startedAt
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(ordenActiva.startedAt).getTime()) / 60000
        )
      )
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* MODAL PRINCIPAL */}
      <div className="bg-white rounded-xl overflow-hidden z-10 w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col relative">
        {/* HEADER */}
        <div className="bg-linear-to-r from-[#FA9623] to-[#FA9623] p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              {localMesa.nombre}
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-normal uppercase tracking-wider">
                {localMesa.estado}
              </span>
            </h3>
            <div className="text-base mt-1 text-orange-100 flex gap-4">
              <span>
                Mesero:{" "}
                <strong className="text-white">
                  {localMesa.meseroActual ?? ordenActiva?.mesero ?? "—"}
                </strong>
              </span>
              <span>
                Tiempo:{" "}
                <strong className="text-white">{minutosAbierta} min</strong>
              </span>
              <span>
                Comensales:{" "}
                <strong className="text-white">
                  {ordenActiva?.comensales?.length || 0}/{localMesa.capacidad}
                </strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* TABS */}
        <div className=" bg-gray-50 px-6 shrink-0">
          <nav className="flex gap-6">
            <button
              className={`py-3 text-base font-medium border-b-2 transition cursor-pointer ${
                activeTab === "DETALLES"
                  ? "border-[#FA9623] text-[#FA9623]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("DETALLES")}
            >
              Pedidos Activos ({todosLosPlatillos.length})
            </button>
            <button
              className={`py-3 text-base font-medium border-b-2 transition cursor-pointer ${
                activeTab === "EDITAR"
                  ? "border-[#FA9623] text-[#FA9623]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("EDITAR")}
            >
              Configuración
            </button>
          </nav>
        </div>

        {/* CONTENIDO */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 flex flex-col">
          {activeTab === "DETALLES" && (
            <>
              {/* Lista de Platillos con Scroll */}
              <div className="flex-1 overflow-y-auto pb-20">
                {" "}
                {/* pb-20 para dar espacio al footer fijo */}
                {todosLosPlatillos.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 text-[18px]">
                      No hay pedidos pendientes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Ordenes activas
                    </h4>
                    {todosLosPlatillos.map((p) => (
                      <PlatilloRow
                        key={p.id}
                        platillo={p}
                        comensalNombre={p.comensalNombre}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* --- FOOTER FIJO (Total Acumulado) --- */}
              {todosLosPlatillos.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 pr-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-end items-center z-10">
                  <div className="flex flex-col items-end">
                    <span className="text-base text-gray-400 font-medium">
                      Total Acumulado
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(ordenActiva?.montoTotal)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "EDITAR" && (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              {!isEditable && (
                <div className="mb-6 p-4 bg-amber-50 text-amber-700 rounded flex items-start gap-3">
                  <div>
                    <p className="text-sm">
                      No se puede editar una mesa mientras está ocupada.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Nombre de la Mesa
                  </label>
                  <input
                    disabled={isEditable}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Capacidad
                    </label>
                    <select
                      disabled={!isEditable}
                      value={capacidad}
                      onChange={(e) =>
                        setCapacidad(
                          e.target.value === "otro"
                            ? "otro"
                            : Number(e.target.value)
                        )
                      }
                      className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                    >
                      {predefined.map((n) => (
                        <option key={n} value={n}>
                          {n} personas
                        </option>
                      ))}
                      <option value="otro">Personalizado...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Zona
                    </label>
                    <select
                      disabled={!isEditable}
                      value={zona}
                      onChange={(e) => setZona(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                    >
                      {zonas.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {capacidad === "otro" && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Capacidad Personalizada
                    </label>
                    <input
                      disabled={!isEditable}
                      type="number"
                      value={otroValor}
                      placeholder="Ej. 12"
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setOtroValor(isNaN(val) ? "" : val);
                      }}
                      className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                    />
                  </div>
                )}

                {/* Footer de Edición */}
                <div className="pt-6 border-t border-gray-100 mt-auto">
                  {isEditable ? (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <button
                          type="button"
                          onClick={onClose}
                          className="text-gray-500 text-base font-medium hover:text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors cursor-pointer"
                        >
                          Desactivar Mesa
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={requestDelete}
                          disabled={loading}
                          className="px-4 py-2 text-red-600 bg-red-50 border border-transparent rounded-lg font-medium hover:bg-red-100 hover:border-red-200 transition-all cursor-pointer"
                        >
                          Eliminar
                        </button>

                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={loading}
                          className="px-6 py-2 text-white bg-[#FA9623] rounded-lg font-bold shadow-md hover:bg-[#e88b1f] hover:shadow-lg transform active:scale-95 transition-all cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end"></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MICRO-MODAL DE CONFIRMACIÓN */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl shadow-2xl border border-red-100 w-full max-w-sm animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Eliminar Mesa?
                </h4>

                <p className="text-sm text-gray-500 mb-6">
                  Estás a punto de eliminar <strong>{localMesa.nombre}</strong>.
                  Esta acción es permanente y no se puede deshacer.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-lg transition-transform active:scale-95"
                  >
                    Sí, Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MesaModal;
