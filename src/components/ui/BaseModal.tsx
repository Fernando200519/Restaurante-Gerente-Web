// src/components/ui/BaseModal.tsx
import React, { useEffect } from "react";
import { X } from "lucide-react"; // ✅ Consistencia con el set de Lucide

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string; // 🆕 Propiedad opcional para mayor versatilidad
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-3xl", //
}) => {
  // 🔐 GESTIÓN DE SCROLL LOCK
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 🌫️ BACKDROP PREMIUM (Fondo con desenfoque) */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* 📦 CONTENEDOR PRINCIPAL */}
      <div
        className={`bg-white w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-[3rem] shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 border border-white/20`}
      >
        {/* 🏢 HEADER INSTITUCIONAL */}
        <div className="bg-[#FF8108] px-10 py-7 flex justify-between items-center shrink-0 shadow-lg relative z-20">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase ">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[#FF8108] transition-all transform hover:rotate-90 active:scale-90 cursor-pointer border border-white/20"
            aria-label="Cerrar modal"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* 📋 CONTENIDO CON SCROLL PERSONALIZADO */}
        <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <div className="animate-in slide-in-from-bottom-4 delay-150 duration-500">
            {children}
          </div>
        </div>

        {/* 🎨 DECORACIÓN INFERIOR SUTIL */}
        <div className="h-2 bg-gray-50 shrink-0" />
      </div>
    </div>
  );
};

export default BaseModal;
