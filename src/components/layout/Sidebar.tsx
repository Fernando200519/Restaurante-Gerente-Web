import React from "react";
import { Link, useLocation } from "react-router-dom";

interface MenuItem {
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const menu: MenuItem[] = [
    { label: "Empleados", path: "/employees" },
    { label: "Menú", path: "/menu" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64" style={{ background: '#FA9623' }}>
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center text-white font-bold text-xl">A</div>
        <div>
          <div className="font-bold text-lg text-white">RestaurApp</div>
        </div>
      </div>

      <nav className="mt-6 px-2 flex-1">
        <ul className="space-y-2">
          {menu.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg cursor-pointer transition-colors relative ${
                    active
                      ? "bg-white/20 text-white"
                      : "hover:bg-white/10 text-white"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r"></div>
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              className="w-full text-left px-4 py-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white"
              onClick={() => {
                // TODO: Implementar cierre de sesión
                console.log("Cerrar sesión");
              }}
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>

      <div className="px-6 py-6 mt-auto">
        <small className="text-white/80">v0.1 • Restaurante</small>
      </div>
    </aside>
  );
};

export default Sidebar;
