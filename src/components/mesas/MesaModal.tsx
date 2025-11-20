// src/components/mesas/MesaModal.tsx
import React, { useEffect, useState } from "react";
import { Mesa, Platillo } from "../../types/mesa";
import { useMesasContext } from "../../context/MesasContext";
// Agregamos AlertTriangle para el ícono de advertencia
import { AlertTriangle } from "lucide-react";

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

const formatTime = (isoString?: string) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- COMPONENTE DE FILA DE PLATILLO ---
const PlatilloRow: React.FC<{ platillo: Platillo; comensalNombre: string }> = ({
  platillo,
  comensalNombre,
}) => {
  const [showTimeline, setShowTimeline] = useState(false);
  const isDelayed = platillo.requiereAtencion;

  const estadoColors: Record<string, string> = {
    TOMADO: "bg-blue-100 text-blue-800",
    EN_PREPARACION: "bg-yellow-100 text-yellow-800",
    LISTO: "bg-green-100 text-green-800",
    ENTREGADO: "bg-gray-100 text-gray-600",
    RETRASADO: "bg-red-100 text-red-800",
  };

  return (
    <div
      className={`border rounded-lg p-3 mb-3 bg-white shadow-sm transition-all ${
        isDelayed ? "border-red-300 bg-red-50" : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">{platillo.nombre}</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {comensalNombre}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            {platillo.estacion && <div>📍 Estación: {platillo.estacion}</div>}
            {platillo.notas && (
              <div className="text-orange-600 italic">📝 {platillo.notas}</div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="font-bold text-emerald-600">
            {formatCurrency(platillo.precio)}
          </div>
          <span
            className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
              estadoColors[platillo.estado] || "bg-gray-100"
            }`}
          >
            {platillo.estado.replace("_", " ")}
          </span>
        </div>
      </div>

      {isDelayed && (
        <div className="mt-2 flex items-center text-xs text-red-600 font-bold animate-pulse">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mr-1"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          ¡Requiere atención inmediata!
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="text-xs text-blue-500 hover:underline flex items-center gap-1"
        >
          {showTimeline ? "Ocultar historial" : "Ver flujo de tiempo"}
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transform transition ${
              showTimeline ? "rotate-180" : ""
            }`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {showTimeline && platillo.historial && (
          <div className="mt-3 ml-1 pl-3 border-l-2 border-blue-100 space-y-3">
            {platillo.historial.map((h, idx) => (
              <div key={idx} className="relative text-xs">
                <div className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-white"></div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">
                    {h.estado}
                  </span>
                  <span className="text-gray-400">
                    {formatTime(h.timestamp)}
                  </span>
                </div>
                {h.responsable && (
                  <div className="text-gray-500 italic">{h.responsable}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
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

  // ESTADO NUEVO: Controla el modal interno de borrar
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
    setShowDeleteConfirm(false); // Resetear al cambiar mesa
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

  // --- LÓGICA DE BORRADO (NUEVA) ---

  // Paso 1: Solicitar borrado (abre modal interno)
  const requestDelete = () => {
    if (!isEditable) return;
    setShowDeleteConfirm(true);
  };

  // Paso 2: Confirmar borrado (ejecuta acción)
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

  // --- DATOS ADAPTADOS ---
  const ordenActiva = localMesa.orden;
  const todosLosPlatillos =
    ordenActiva?.comensales.flatMap((comensal) =>
      comensal.platillos.map((platillo) => ({
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL PRINCIPAL */}
      <div className="bg-white rounded-xl overflow-hidden z-10 w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col relative">
        {/* HEADER */}
        <div className="bg-linear-to-r from-orange-600 to-orange-500 p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              {localMesa.nombre}
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-normal uppercase tracking-wider">
                {localMesa.estado}
              </span>
            </h3>
            <div className="text-sm mt-1 text-orange-100 flex gap-4">
              <span>
                👤 Mesero:{" "}
                <strong className="text-white">
                  {localMesa.meseroActual ?? ordenActiva?.mesero ?? "—"}
                </strong>
              </span>
              <span>
                ⏱ Tiempo:{" "}
                <strong className="text-white">{minutosAbierta} min</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl transition"
          >
            ✕
          </button>
        </div>

        {/* TABS */}
        <div className="border-b bg-gray-50 px-6 shrink-0">
          <nav className="flex gap-6">
            <button
              className={`py-3 text-sm font-medium border-b-2 transition ${
                activeTab === "DETALLES"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("DETALLES")}
            >
              Pedidos Activos ({todosLosPlatillos.length})
            </button>
            <button
              className={`py-3 text-sm font-medium border-b-2 transition ${
                activeTab === "EDITAR"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("EDITAR")}
            >
              Configuración
            </button>
          </nav>
        </div>

        {/* CONTENIDO */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          {activeTab === "DETALLES" && (
            <div className="space-y-1">
              {todosLosPlatillos.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-gray-300 mb-2 text-4xl">🍽️</div>
                  <p className="text-gray-500">No hay pedidos activos.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-end mb-4 px-1">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Desglose de cuenta
                    </h4>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        Total Acumulado
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        {formatCurrency(ordenActiva?.montoTotal)}
                      </div>
                    </div>
                  </div>

                  {todosLosPlatillos.map((p) => (
                    <PlatilloRow
                      key={p.id}
                      platillo={p}
                      comensalNombre={p.comensalNombre}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === "EDITAR" && (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              {!isEditable && (
                <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-700 rounded flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-bold">Modo de Solo Lectura</p>
                    <p className="text-sm">
                      No se puede editar una mesa mientras está ocupada.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Mesa
                  </label>
                  <input
                    disabled={!isEditable}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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

                <div className="pt-6 border-t flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>

                  {isEditable && (
                    <>
                      {/* BOTÓN "ELIMINAR" QUE DETONA EL MODAL INTERNO */}
                      <button
                        onClick={requestDelete}
                        disabled={loading}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Eliminar Mesa
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-md transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === MICRO-MODAL DE CONFIRMACIÓN (Overlay Interno) === */}
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
