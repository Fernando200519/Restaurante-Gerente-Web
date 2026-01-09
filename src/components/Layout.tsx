import React, { useState } from "react";
import Sidebar from "./Sidebar";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const handleMouseEnter = () => {
    if (window.innerWidth < 1536) setIsSidebarCollapsed(false);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 1536) setIsSidebarCollapsed(true);
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FA] overflow-x-hidden">
      {/* ✅ Evita rebotes globales */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {/* 🚀 EL CAMBIO ESTÁ AQUÍ: Añadimos 'min-w-0' y 'relative' */}
      <div
        className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out relative ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        } 2xl:ml-64`}
      >
        <main className="p-6 lg:p-10 animate-in fade-in duration-500 w-full">
          {/* ✅ w-full y max-w-full para asegurar que el contenido no se escape */}
          <div className="max-w-[1600px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
