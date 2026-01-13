import React, { useState, useEffect, useMemo } from "react";
import {
  Tag,
  Layers,
  AlignLeft,
  Activity,
  AlertCircle,
  Utensils,
  GlassWater,
  ChevronDown,
} from "lucide-react";
import BaseModal from "../ui/BaseModal";
import type {
  Category,
  CategoryFormData,
  CategoryStatus,
} from "../../types/menu";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  categories: Category[];
  onSave: (data: CategoryFormData) => void;
  onDelete?: (category: Category) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  categories,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    status: "activo",
    type: "Alimentos",
    parentId: null,
  });

  const [isParentSelectOpen, setIsParentSelectOpen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const TYPE_OPTIONS = [
    { value: "Alimentos", label: "Alimentos", icon: <Utensils size={14} /> },
    { value: "Bebidas", label: "Bebidas", icon: <GlassWater size={14} /> },
  ];

  const hierarchicalOptions = useMemo(() => {
    const options: Array<{ id: string | number; name: string; depth: number }> =
      [];

    const flatten = (parentId: string | number | null, depth: number) => {
      const children = categories.filter(
        (c) =>
          c.type === formData.type &&
          (parentId === null
            ? !c.parentId
            : String(c.parentId) === String(parentId))
      );

      children.forEach((child) => {
        if (String(child.id) !== String(category?.id)) {
          options.push({ id: child.id, name: child.name, depth });
          if (depth < 2) flatten(child.id, depth + 1);
        }
      });
    };

    flatten(null, 0);
    return options;
  }, [categories, formData.type, category]);

  const currentParent = hierarchicalOptions.find(
    (opt) => String(opt.id) === String(formData.parentId)
  );

  const displayParentName = currentParent
    ? currentParent.name
    : "Categoría Principal (Raíz)";

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name || "",
          description: category.description || "",
          status: category.status || "activo",
          type: category.type || "Alimentos",
          parentId: category.parentId || null,
        });
      } else {
        setFormData({
          name: "",
          description: "",
          status: "activo",
          type: "Alimentos",
          parentId: null,
        });
      }
      setErrors({});
    }
  }, [isOpen, category]);

  const handleChange = (field: keyof CategoryFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors])
      setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: "El nombre es obligatorio" });
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error al procesar categoría en el modal");
    }
  };

  const inputBase =
    "w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none transition-all font-bold text-sm text-gray-700 focus:bg-white focus:ring-4 focus:ring-orange-500/10 shadow-inner placeholder:text-gray-300";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Configurar Categoría" : "Nueva Categoría"}
    >
      <form onSubmit={handleSubmit} className="space-y-8 pt-4">
        {/* 📝 SECCIÓN: IDENTIDAD */}
        <div className="space-y-5">
          <div className="group">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] mb-2 ml-1">
              <Tag size={14} className="text-[#FF8108]" /> Nombre de la
              Categoría
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none transition-all font-bold text-sm text-gray-700 focus:bg-white focus:ring-4 focus:ring-orange-500/10 shadow-inner ${
                errors.name ? "border-rose-200 bg-rose-50/30" : ""
              }`}
              placeholder="Ej: Platos Fuertes, Bebidas Premium..."
            />
            {errors.name && (
              <p className="mt-2 text-[10px] font-black text-rose-500 flex items-center gap-1 ml-1 uppercase">
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>

          <div className="group">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] mb-2 ml-1">
              <AlignLeft size={14} className="text-[#FF8108]" /> Descripción
              Breve
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
              className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none transition-all font-bold text-sm text-gray-700 focus:bg-white focus:ring-4 focus:ring-orange-500/10 shadow-inner resize-none"
              placeholder="¿Qué platillos define esta categoría?"
            />
          </div>
        </div>

        {/* 🌲 SECCIÓN: ESTRUCTURA Y TIPO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group relative">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] mb-2 ml-1">
              {formData.type === "Alimentos" ? (
                <Utensils size={14} className="text-[#FF8108]" />
              ) : (
                <GlassWater size={14} className="text-[#FF8108]" />
              )}
              Tipo de Menú
            </label>

            <div className="relative">
              {/* 🎯 TRIGGER PERSONALIZADO */}
              <button
                type="button"
                onClick={() => !category && setIsTypeOpen(!isTypeOpen)}
                disabled={!!category}
                className={`${inputBase} flex items-center justify-between transition-all ${
                  !!category
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-transparent"
                    : isTypeOpen
                    ? "border-[#FF8108] bg-white ring-4 ring-orange-50"
                    : "border-transparent hover:border-gray-100 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{formData.type}</span>
                </div>
                {!category && (
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-300 ${
                      isTypeOpen ? "rotate-180 text-[#FF8108]" : ""
                    }`}
                  />
                )}
              </button>

              {/* 📋 LISTA DE TIPOS (Solo si no es edición) */}
              {isTypeOpen && !category && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTypeOpen(false)}
                  />

                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-4xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <ul className="py-2">
                      <li className="px-6 py-3 text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 mb-1">
                        Naturaleza del Menú
                      </li>

                      {TYPE_OPTIONS.map((opt) => (
                        <li key={opt.value}>
                          <button
                            type="button"
                            onClick={() => {
                              handleChange("type", opt.value);
                              setIsTypeOpen(false);
                            }}
                            className={`w-full text-left px-6 py-4 text-sm font-bold transition-all flex items-center justify-between group cursor-pointer ${
                              formData.type === opt.value
                                ? "bg-orange-50 text-[#FF8108]"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-xl transition-all ${
                                  formData.type === opt.value
                                    ? "bg-[#FF8108] text-white shadow-sm"
                                    : "bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-[#FF8108]"
                                }`}
                              >
                                {opt.icon}
                              </div>
                              {opt.label}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="group relative">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] mb-2 ml-1">
              <Layers size={14} /> Ubicación (Jerarquía)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsParentSelectOpen(!isParentSelectOpen)}
                className={`w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border-2 transition-all rounded-2xl outline-none cursor-pointer ${
                  isParentSelectOpen
                    ? "border-[#FF8108] bg-white ring-4 ring-orange-50"
                    : "border-transparent"
                }`}
              >
                <span className="text-sm font-bold text-gray-700 truncate max-w-[120px]">
                  {displayParentName}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${
                    isParentSelectOpen ? "rotate-180 text-[#FF8108]" : ""
                  }`}
                />
              </button>

              {isParentSelectOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-100 rounded-4xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <ul className="max-h-60 overflow-y-auto no-scrollbar py-2">
                    <div className="bg-gray-50 my-1 mx-4" />
                    {hierarchicalOptions.map((opt) => (
                      <li key={opt.id}>
                        <button
                          type="button"
                          onClick={() => {
                            handleChange("parentId", opt.id);
                            setIsParentSelectOpen(false);
                          }}
                          style={{
                            paddingLeft: `${opt.depth * 1.5 + 1.25}rem`,
                          }}
                          className={`w-full text-left py-3 pr-5 text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            String(formData.parentId) === String(opt.id)
                              ? "bg-orange-50 text-[#FF8108]"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {opt.depth > 0 && (
                            <span className="text-gray-300">↳</span>
                          )}
                          {opt.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ⚡ ESTADO DE DISPONIBILIDAD */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] mb-3 ml-1">
            <Activity size={14} /> Visibilidad en Comandera
          </label>
          <div className="flex gap-4">
            {(["activo", "inactivo"] as CategoryStatus[]).map((status) => (
              <label
                key={status}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  formData.status === status
                    ? "border-[#FF8108] bg-orange-50 text-[#FF8108] shadow-sm"
                    : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  checked={formData.status === status}
                  onChange={() => handleChange("status", status)}
                />
                <div
                  className={`w-2 h-2 rounded-full ${
                    formData.status === status
                      ? "bg-[#FF8108] animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                <span className="font-black text-[11px] uppercase tracking-widest">
                  {status === "activo" ? "Activa" : "Inactiva"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 🛠️ FOOTER */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-4">
          {category && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(category)}
              className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Eliminar Categoría
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 bg-gray-100 text-gray-500 font-black text-[11px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-10 py-3.5 bg-[#FF8108] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {category ? "Actualizar" : "Crear Categoría"}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default CategoryModal;
