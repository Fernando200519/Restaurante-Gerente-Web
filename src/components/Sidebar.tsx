import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/mesas", label: "Mesas", icon: "/icons/table.svg" },
  { to: "/ordenes", label: "Órdenes", icon: "/icons/orders.svg" },
  { to: "/empleados", label: "Empleados", icon: "/icons/employes.svg" },
  { to: "/menu", label: "Menú", icon: "/icons/menu.svg" },
  { to: "/ventas", label: "Ventas", icon: "/icons/sales.svg" },
  { to: "/logout", label: "Cerrar sesión", icon: "/icons/logout.svg" },
];

const Sidebar: React.FC = () => {
  const handleLogoutClick = () => {
    alert("Aquí se abrirá el modal de Cerrar Sesión");
    // Lógica futura: setIsModalOpen(true);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-[#FA9623] h-screen fixed top-0 left-0">
      {/* Logo */}
      <div className="flex flex-col items-center gap-1 p-4 border-b border-b-[#FFFFFF]">
        <img src="/logo_white.svg" alt="Logo" className="h-10 w-10" />
        <div>
          <div className="text-white font-inter text-xl font-bold">
            Titulo del resturante
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1">
        <ul>
          {items.map((it) => (
            <li key={it.to}>
              {it.to === "/logout" ? (
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center font-semibold gap-4 py-5 px-6 transition-colors text-white hover:bg-orange-600/20 w-full cursor-pointer"
                >
                  <img src={it.icon} alt="" className="h-7 w-7" />
                  <span>{it.label}</span>
                </button>
              ) : (
                <NavLink
                  to={it.to}
                  className={({ isActive }) =>
                    `flex items-center font-semibold gap-4 py-5 px-6 transition-colors ${
                      isActive
                        ? "bg-[#D58224] text-[#FFFFFF] border-l-4"
                        : "text-white hover:bg-orange-600/20"
                    }`
                  }
                >
                  <img src={it.icon} alt="" className="h-7 w-7" />
                  <span>{it.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
