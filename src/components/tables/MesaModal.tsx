import React, { useEffect, useState } from "react";
import { Mesa, Platillo, Zona } from "../../types/mesa";
import { useMesas } from "../../hooks/useMesas"; // ✅ Hook nuevo
// Agregamos los iconos que faltaban en tu import
import {
  AlertTriangle,
  Clock,
  Trash2,
  Check,
  X,
  Ban,
  Power,
} from "lucide-react";

interface Props {
  mesa: Mesa | null;
  visible: boolean;
  onClose: () => void;
  zonas: Zona[]; // ✅ Recibe objetos reales
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

// --- COMPONENTE DE FILA DE PLATILLO (TU DISEÑO EXACTO) ---
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
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold tracking-wider border ${
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
            <AlertTriangle size={14} className="text-red-600" />
          </div>
          <span className="text-xs font-bold text-red-700 tracking-wide">
            Requiere atención inmediata
          </span>
        </div>
      )}
    </div>
  );
};

const MesaModal: React.FC<Props> = ({ mesa, visible, onClose, zonas = [] }) => {
  // ✅ Usamos las funciones del Hook
  const { actualizarMesa, eliminarMesas, desactivarMesa, habilitarMesa } =
    useMesas();

  const [activeTab, setActiveTab] = useState<"DETALLES" | "EDITAR">("DETALLES");
  const [localMesa, setLocalMesa] = useState<Mesa | null>(mesa);

  // Estados de formulario
  const [nombre, setNombre] = useState("");
  const [capacidad, setCapacidad] = useState<number | "otro">(4);
  const [otroValor, setOtroValor] = useState<number | "">("");

  // ✅ Usamos ID en lugar de nombre de zona
  const [zonaId, setZonaId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 👇 NUEVO ESTADO
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showEnableConfirm, setShowEnableConfirm] = useState(false);

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
    setZonaId(mesa.zonaId);

    if (mesa.capacidad && predefined.includes(mesa.capacidad)) {
      setCapacidad(mesa.capacidad);
      setOtroValor("");
    } else {
      setCapacidad("otro");
      setOtroValor(mesa.capacidad ?? "");
    }

    // Si la mesa está INACTIVA, nos vamos directo a EDITAR (UX improvement)
    if (mesa.estado === "INACTIVA" || mesa.estado === "DESACTIVADA") {
      setActiveTab("EDITAR");
    } else {
      setActiveTab("DETALLES");
    }

    setShowDeleteConfirm(false);
  }, [mesa]);

  if (!visible || !localMesa) return null;

  // --- 1. LÓGICA CORREGIDA DE ESTADOS ---
  const isInactive =
    localMesa.estado === "INACTIVA" || localMesa.estado === "DESACTIVADA";
  const isOccupied = ["OCUPADA", "ESPERANDO", "AGRUPADA"].includes(
    localMesa.estado
  );

  // Es editable si está LIBRE o si está INACTIVA (para poder corregirla antes de activar)
  const isEditable = localMesa.estado === "LIBRE" || isInactive;

  // Helper para mostrar el nombre de la zona en el Header
  // Nota: Si zonaId es null, devuelve "Sin Zona"
  const nombreZonaActual =
    localMesa.zonaId === null
      ? "Sin Zona"
      : zonas.find((z) => z.id === localMesa.zonaId)?.nombre || "Sin Zona";

  // --- GUARDAR EDICIÓN ---
  const handleSave = async () => {
    if (!isEditable) return;

    // ⚠️ CORRECCIÓN 1: Eliminamos la validación que impedía guardar zonaId null
    // if (zonaId === null) return alert("Selecciona una zona válida"); <- ESTO SE BORRA

    setLoading(true);
    try {
      const finalCapacidad =
        capacidad === "otro" ? Number(otroValor) : (capacidad as number);

      // ✅ Enviamos los datos correctos al backend (ID, capacidad, zonaId)
      await actualizarMesa(localMesa.id, finalCapacidad, zonaId);
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error al guardar la mesa");
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
      // ✅ Borrado por Array de IDs
      await eliminarMesas([localMesa.id]);
      onClose();
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // --- 1. ABRIR MODAL (Reemplaza tu función handleDesactivar actual con esto) ---
  const handleDesactivar = () => {
    // Ya no usamos window.confirm, solo abrimos el modal
    setShowDisableConfirm(true);
  };

  // --- 2. EJECUTAR ACCIÓN (Nueva función) ---
  const confirmDisable = async () => {
    setLoading(true);
    try {
      await desactivarMesa(localMesa.id);
      onClose(); // Cerramos todo el modal principal
    } catch (e) {
      console.error(e);
      // Aquí podrías usar un toast, pero por ahora dejamos el alert de error técnico
      alert("Error al desactivar.");
    } finally {
      setLoading(false);
      setShowDisableConfirm(false);
    }
  };
  // --- 1. ABRIR MODAL (Modifica tu handleReactivar actual) ---
  const handleReactivar = () => {
    setShowEnableConfirm(true);
  };

  // --- 2. EJECUTAR ACCIÓN (Nueva función) ---
  const confirmReactivar = async () => {
    setLoading(true);
    try {
      await habilitarMesa(localMesa.id);
      onClose(); // Cerramos el modal principal
    } catch (e) {
      console.error(e);
      alert("Error al reactivar mesa");
    } finally {
      setLoading(false);
      setShowEnableConfirm(false);
    }
  };

  // --- DATOS ADAPTADOS ---
  const ordenActiva = localMesa.orden;
  const todosLosPlatillos =
    ordenActiva?.platillos?.map((p) => ({
      ...p,
      comensalNombre: "Comensal", // Ajustar según tu estructura real
    })) || [];

  const minutosAbierta = ordenActiva
    ? Math.max(0, Math.floor(Math.random() * 60)) // Placeholder
    : 0;

  // 1. ORDENAR ZONAS: "Sin zona" primero, luego el resto
  const zonasOrdenadas = [...zonas].sort((a, b) => {
    const nombreA = a.nombre.trim().toLowerCase();
    const nombreB = b.nombre.trim().toLowerCase();

    if (nombreA === "sin zona") return -1; // A va primero
    if (nombreB === "sin zona") return 1; // B va primero
    return 0; // El resto mantiene su orden original (o usa a.nombre.localeCompare(b.nombre) para alfabético)
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* MODAL PRINCIPAL */}
      <div className="bg-white rounded-xl overflow-hidden z-10 w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="bg-linear-to-r from-[#FA9623] to-[#FA9623] p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              {localMesa.nombre}
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-normal tracking-wider">
                {localMesa.estado}
              </span>
            </h3>
            <div className="text-base mt-1 text-orange-100 flex gap-4">
              <span>
                Zona: <strong className="text-white">{nombreZonaActual}</strong>
              </span>
              {!isInactive && localMesa.estado !== "LIBRE" && (
                <span>
                  Tiempo:{" "}
                  <strong className="text-white">{minutosAbierta} min</strong>
                </span>
              )}
              <span>
                Capacidad:{" "}
                <strong className="text-white">
                  {localMesa.capacidad} personas
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
        <div className="bg-gray-50 px-6 shrink-0 border-b border-gray-200">
          <nav className="flex gap-6">
            <button
              className={`py-3 text-base font-medium border-b-2 transition cursor-pointer ${
                activeTab === "DETALLES"
                  ? "border-[#FA9623] text-[#FA9623]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("DETALLES")}
            >
              Pedidos ({todosLosPlatillos.length})
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
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 flex flex-col min-h-0">
          {activeTab === "DETALLES" && (
            <>
              <div className="flex-1 overflow-y-auto pb-20">
                {todosLosPlatillos.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 text-[18px]">
                      No hay pedidos pendientes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 tracking-wider mb-2">
                      Ordenes activas
                    </h4>
                    {todosLosPlatillos.map((p: any, idx: number) => (
                      <PlatilloRow
                        key={p.id || idx}
                        platillo={p}
                        comensalNombre={p.comensalNombre}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* FOOTER TOTAL */}
              {todosLosPlatillos.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 pr-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-end items-center z-10">
                  <div className="flex flex-col items-end">
                    <span className="text-base text-gray-400 font-medium">
                      Total Acumulado
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(ordenActiva?.total)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "EDITAR" && (
            <div className="flex flex-col h-full">
              {/* --- ALERTA CORREGIDA: Solo si está OCUPADA (no inactiva) --- */}
              {isOccupied && (
                <div className="mb-6 mx-1 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3 shadow-sm">
                  <div className="p-2 bg-amber-100 rounded-lg shrink-0 text-amber-600">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="py-1">
                    <h4 className="font-bold text-sm mb-0.5">Mesa Ocupada</h4>
                    <p className="text-sm opacity-90 leading-relaxed">
                      No puedes editar ni eliminar esta mesa mientras tenga una
                      orden activa.
                    </p>
                  </div>
                </div>
              )}

              {/* --- ALERTA INFORMATIVA SI ESTÁ INACTIVA --- */}
              {isInactive && (
                <div className="mb-6 mx-1 p-4 bg-gray-100 border border-gray-200 text-gray-600 rounded-xl flex items-start gap-3 shadow-sm">
                  <div className="py-1">
                    <p className="text-base opacity-90">
                      Esta mesa no aparece disponible para los meseros.
                    </p>
                  </div>
                </div>
              )}

              {/* --- FORMULARIO --- */}
              <div className="flex-1 space-y-6 overflow-y-auto px-1 py-2">
                {/* Nombre (Read Only) */}
                <div className="group">
                  <label className="block text-base font-medium text-gray-600 mb-2">
                    Identificador
                  </label>
                  <div className="relative">
                    <input
                      disabled={true}
                      value={nombre}
                      className="w-full bg-gray-50 text-gray-600 font-semibold border border-gray-200 rounded-xl px-4 py-3 focus:outline-none cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Capacidad */}
                  <div>
                    <label className="block text-base font-medium text-gray-600 mb-2">
                      Capacidad
                    </label>
                    <div className="relative">
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
                        className="w-full appearance-none bg-white border border-gray-300 text-gray-600 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-[#FA9623]/20 focus:border-[#FA9623] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 font-medium cursor-pointer"
                      >
                        {predefined.map((n) => (
                          <option key={n} value={n}>
                            {n} personas
                          </option>
                        ))}
                        <option value="otro">Personalizado...</option>
                      </select>
                      {/* Icono de flecha custom */}
                      <div className="absolute right-4 top-3.5 pointer-events-none text-gray-600">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Zona */}
                  <div>
                    <label className="block text-base font-semibold text-gray-600 mb-2 ml-1">
                      Zona Asignada
                    </label>
                    <div className="relative">
                      <select
                        disabled={!isEditable}
                        value={zonaId ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setZonaId(val === "" ? null : Number(val));
                        }}
                        className="w-full appearance-none bg-white border border-gray-300 text-gray-700 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-[#FA9623]/20 focus:border-[#FA9623] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 font-medium"
                      >
                        {/* 👇 APLICAMOS EL ORDENAMIENTO AQUÍ MISMO 👇 */}
                        {[...zonas]
                          .sort((a, b) => {
                            const nA = a.nombre.toLowerCase();
                            const nB = b.nombre.toLowerCase();
                            if (nA === "sin zona") return -1;
                            if (nB === "sin zona") return 1;
                            return 0;
                          })
                          .map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.nombre}
                            </option>
                          ))}
                      </select>
                      <div className="absolute right-4 top-3.5 pointer-events-none text-gray-600">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input condicional para 'otro' */}
                {capacidad === "otro" && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                    <label className="block text-sm font-bold text-orange-700 mb-2 ml-1">
                      Capacidad Manual (Máx 32)
                    </label>
                    <input
                      type="number"
                      disabled={!isEditable}
                      className="w-full bg-white border border-orange-200 rounded-xl px-4 py-3 text-gray-800 font-bold focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all placeholder:font-normal"
                      placeholder="Ej. 15"
                      value={otroValor}
                      min={1}
                      max={32}
                      onKeyDown={(e) =>
                        ["e", "E", "-", "+", "."].includes(e.key) &&
                        e.preventDefault()
                      }
                      onChange={(e) => {
                        const valStr = e.target.value;
                        if (valStr === "") {
                          setOtroValor("");
                          return;
                        }
                        let val = parseInt(valStr, 10);
                        if (isNaN(val)) return;
                        if (val > 32) val = 32;
                        if (val < 1) val = 1;
                        setOtroValor(val);
                      }}
                      autoFocus
                    />
                    <p className="text-sm text-orange-600 mt-2 ml-1">
                      Ingresa un número entre 1 y 32 personas.
                    </p>
                  </div>
                )}
              </div>

              {/* --- FOOTER DE ACCIONES --- */}
              <div className="mt-auto pt-6 border-t border-gray-100">
                {isEditable ? (
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* Botón de eliminar (Izquierda para seguridad) */}
                    <button
                      type="button"
                      onClick={requestDelete}
                      disabled={loading}
                      className="group flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl font-semibold cursor-pointer"
                    >
                      <Trash2 size={22} />
                      <span className="sm:hidden">Eliminar Mesa</span>
                    </button>

                    {/* Grupo de acciones (Derecha) */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* --- BOTÓN DINÁMICO (DESACTIVAR vs REACTIVAR) --- */}
                      {isInactive ? (
                        // ESTADO: REACTIVAR
                        <button
                          type="button"
                          onClick={handleReactivar}
                          disabled={loading}
                          className="flex-1 sm:flex-none px-5 py-3 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Habilitar Mesa</span>
                        </button>
                      ) : (
                        // ESTADO: DESACTIVAR
                        <button
                          type="button"
                          onClick={handleDesactivar}
                          disabled={loading}
                          className="flex-1 sm:flex-none px-5 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Desactivar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 sm:flex-none px-6 py-3 bg-[#FA9623] hover:bg-[#e68a1f] text-white rounded-xl font-bold hover:shadow-orange-300 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Guardar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cerrar Panel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 👇👇👇 ESTO ES LO QUE TE FALTABA AGREGAR 👇👇👇 */}
        {/* MICRO-MODAL DE CONFIRMACIÓN */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px] p-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-xl border border-red-100 w-full max-w-sm animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Eliminar Mesa?
                </h4>

                <p className="text-base text-gray-500 mb-6">
                  Estás a punto de eliminar <strong>{localMesa.nombre}</strong>.
                  Esta acción es permanente y no se puede deshacer.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 active:scale-95 cursor-pointer"
                  >
                    Sí, Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* 👆👆👆 FIN DE LO QUE FALTABA 👆👆👆 */}

        {/* ... (Tu código existente de showDeleteConfirm) ... */}

        {/* 👇👇👇 NUEVO MODAL DE DESACTIVAR 👇👇👇 */}
        {showDisableConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px] p-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Desactivar Mesa?
                </h4>

                <p className="text-base text-gray-500 mb-6">
                  La mesa <strong>{localMesa.nombre}</strong> dejará de estar
                  disponible para asignar clientes, pero no se eliminará.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDisableConfirm(false)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDisable}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? "..." : "Sí, Desactivar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* 👆👆👆 FIN DEL NUEVO MODAL 👆👆👆 */}

        {/* ... (Tus otros modales de confirmación) ... */}

        {/* 👇👇👇 NUEVO MODAL DE HABILITAR 👇👇👇 */}
        {showEnableConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px] p-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl shadow-2xl border border-emerald-100 w-full max-w-sm animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Habilitar Mesa?
                </h4>

                <p className="text-base text-gray-500 mb-6">
                  La mesa <strong>{localMesa.nombre}</strong> volverá a estar
                  disponible como "Libre" para recibir clientes.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowEnableConfirm(false)}
                    className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmReactivar}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? "..." : "Sí, Habilitar"}
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
