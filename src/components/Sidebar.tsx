import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/mesas", label: "Mesas", icon: "/sidebar/table.svg" },
  { to: "/ordenes", label: "Órdenes", icon: "/sidebar/orders.svg" },
  {
    to: "/empleados",
    label: "Empleados",
    icon: "/sidebar/employes.svg",
  },
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
  const handleLogoutClick = () => {
    alert("Aquí se abrirá el modal de Cerrar Sesión");
  };

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen fixed top-0 left-0 transition-all duration-300 bg-[#FA9623] ${
        isCollapsed ? "w-20" : "w-64"
      } 2xl:w-64 
      shadow-lg 2xl:shadow-xl z-50 overflow-hidden`} // C) Sombra aumentada
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between p-5 h-[88px] border-b border-white/30">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <img
            src="/logo_white.svg"
            alt="Logo"
            className="h-10 w-10 min-w-[40px]"
          />
          <div
            className={`transition-opacity duration-300 text-white ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            } 2xl:opacity-100 2xl:w-auto`}
          >
            {/* B) Textos aumentados */}
            <h1 className="font-bold text-lg 2xl:text-xl leading-tight">
              Mesa Libre
            </h1>
            <p className="text-sm 2xl:text-base opacity-80">Restaurante</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 mt-6 overflow-y-auto overflow-x-hidden">
        <ul>
          {items.map((it) => (
            <li key={it.to}>
              <NavLink
                to={it.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 py-3 px-5 mx-2 rounded-lg mb-2 font-medium transition-colors duration-200 text-white whitespace-nowrap ${
                    isActive ? "bg-white/25" : "hover:bg-white/15"
                  }`
                }
              >
                {/* B) Iconos aumentados (y su min-w) */}
                <img
                  src={it.icon}
                  alt=""
                  className="h-6 w-6 min-w-[24px] 2xl:h-7 2xl:w-7 2xl:min-w-[28px]"
                />
                <span
                  className={`transition-opacity duration-300 ${
                    isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto ml-2"
                  } 2xl:opacity-100 2xl:w-auto 2xl:ml-2`}
                >
                  {it.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-white/30">
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-4 py-3 px-5 mx-2 rounded-lg my-3 font-medium transition-colors text-white w-[90%] whitespace-nowrap hover:bg-white/15 cursor-pointer"
        >
          {/* B) Iconos aumentados (y su min-w) */}
          <img
            src="/sidebar/logout.svg"
            alt=""
            className="h-6 w-6 min-w-[24px] 2xl:h-7 2xl:w-7 2xl:min-w-[28px]"
          />
          <span
            className={`transition-opacity duration-300 ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto ml-2"
            } 2xl:opacity-100 2xl:w-auto 2xl:ml-2`}
          >
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
