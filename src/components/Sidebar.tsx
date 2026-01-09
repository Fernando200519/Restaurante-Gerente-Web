import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, AlertTriangle, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const items = [
  { to: "/mesas", label: "Mesas", icon: "/sidebar/table.svg" },
  { to: "/ordenes", label: "Órdenes", icon: "/sidebar/orders.svg" },
  { to: "/employees", label: "Empleados", icon: "/sidebar/employees.svg" },
  { to: "/menu", label: "Menú", icon: "/sidebar/menu.svg" },
  { to: "/ventas", label: "Ventas", icon: "/sidebar/sales.svg" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { logoutUser } = useAuth();

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLogout = () => {
    logoutUser();
    toast.success("Sesión terminada exitosamente");
    setShowConfirmLogout(false);
  };

  return (
    <>
      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`hidden lg:flex flex-col h-screen fixed top-0 left-0 transition-all duration-300 ease-in-out bg-[#FF8108] ${
          isCollapsed ? "w-20" : "w-64"
        } 2xl:w-64 shadow-2xl z-50 overflow-hidden border-r border-white/10`}
      >
        {/* BRANDING SECTION */}
        <div className="flex items-center p-5 h-[88px] border-b border-white/20 bg-black/5">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl shadow-inner">
              <img
                src="../../public/login/mesa_libre_blanco_icon.png"
                alt="Logo"
                className="h-8 w-8 min-w-8"
              />
            </div>
            <div
              className={`transition-all duration-300 ${
                isCollapsed ? "opacity-0 scale-95" : "opacity-100 scale-100"
              } 2xl:opacity-100`}
            >
              <h1 className="font-black text-white text-lg tracking-tight leading-none uppercase">
                Mesa Libre
              </h1>
              <span className="text-[10px] font-bold text-orange-100 uppercase tracking-widest opacity-80">
                Software de Gestión
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 mt-8 px-3">
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  className={({ isActive }) =>
                    `flex items-center gap-4 py-3.5 px-4 rounded-2xl font-bold transition-all duration-200 text-white group ${
                      isActive
                        ? "bg-white/20 shadow-lg shadow-black/5"
                        : "hover:bg-white/10"
                    }`
                  }
                >
                  <img
                    src={it.icon}
                    alt=""
                    className="h-6 w-6 min-w-6 invert brightness-0 group-hover:scale-110 transition-transform"
                  />
                  <span
                    className={`transition-all duration-300 ${
                      isCollapsed
                        ? "opacity-0 translate-x-4"
                        : "opacity-100 translate-x-0"
                    } 2xl:opacity-100`}
                  >
                    {it.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* FOOTER / LOGOUT */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => setShowConfirmLogout(true)}
            className="flex items-center gap-4 w-full py-4 px-4 rounded-2xl font-bold text-white hover:bg-red-500/20 transition-all group cursor-pointer"
          >
            <LogOut size={24} className="min-w-6 transition-transform" />
            <span
              className={`transition-all duration-300 ${
                isCollapsed
                  ? "opacity-0 translate-x-4"
                  : "opacity-100 translate-x-0"
              } 2xl:opacity-100`}
            >
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>

      {/* 🚀 MODAL DE CONFIRMACIÓN PREMIUM */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop con desenfoque profundo */}
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] animate-in fade-in duration-300"
            onClick={() => setShowConfirmLogout(false)}
          />

          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Cabecera de Alerta */}
            <div className="bg-rose-500 p-8 flex flex-col items-center text-white relative">
              <div className="bg-white/20 p-4 rounded-3xl mb-4 shadow-inner">
                <AlertTriangle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                Cerrar Sesión
              </h3>
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="absolute top-6 right-6 hover:bg-black/10 p-2 rounded-xl transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-8 text-center">
              <p className="text-gray-500 font-bold text-sm leading-relaxed">
                ¿Estás seguro de que deseas salir del sistema? Tendrás que
                ingresar tus credenciales de nuevo.
              </p>
            </div>

            {/* Acciones */}
            <div className="p-8 pt-0 flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 active:scale-95 cursor-pointer"
              >
                Sí, Cerrar Sesión
              </button>
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all cursor-pointer"
              >
                Mantener Activa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
