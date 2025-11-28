import React, { useEffect, useRef, useState } from "react";
import gearIcon from "../../assets/icons/settings-svgrepo-com.svg";

const GearMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-10 h-10 rounded-lg bg-primary hover:bg-primary/90 flex items-center justify-center"
        aria-label="Configuración"
      >
        <img src={gearIcon} alt="Configuración" className="w-5 h-5 text-white" />
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <ul className="divide-y">
            <li>
              <button className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-50 text-green-600">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="text-sm text-gray-700">Agregar nueva mesa</span>
              </button>
            </li>
            <li>
              <button className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-50 text-amber-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="text-sm text-gray-700">Editar mesa</span>
              </button>
            </li>
            <li>
              <button className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-600">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="text-sm text-gray-700">Eliminar mesa</span>
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default GearMenu;
