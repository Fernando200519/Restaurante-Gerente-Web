import React, { useState } from "react";
import Sidebar from "../Sidebar";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // A) Anular lógica de hover en 2xl
  // Estas funciones ahora comprueban el ancho antes de actualizar el estado.
  const handleMouseEnter = () => {
    if (window.innerWidth < 1536) {
      setIsSidebarCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 1536) {
      setIsSidebarCollapsed(true);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3F4F6]">
      {/* Sidebar controlado desde Layout */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Contenido principal con margen dinámico */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        } 2xl:ml-64`}
      >
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
