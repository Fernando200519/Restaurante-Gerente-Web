import React from "react";
import profileImage from "../../assets/images/fernando.jpeg";

const Topbar: React.FC = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <header className="flex items-center justify-between bg-white px-6 py-3 shadow-sm sticky top-0 z-10">
      <div className="text-sm text-gray-600">{`${dateStr} | ${timeStr}`}</div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img 
            src={profileImage} 
            alt="Foto de perfil" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-sm text-gray-700">Bienvenido, Sr. Fernando</div>
      </div>
    </header>
  );
};

export default Topbar;
