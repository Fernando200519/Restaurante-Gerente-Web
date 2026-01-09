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
  CategoryType,
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

  // 🎯 CORRECCIÓN: Declaración del estado faltante
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [errors, setErrors] = useState<{ name?: string }>({});

  // 🎯 LÓGICA DE JERARQUÍA MEJORADA
  const hierarchicalOptions = useMemo(() => {
    const options: Array<{ id: string; name: string; depth: number }> = [];

    const flatten = (parentId: string | null, depth: number) => {
      const children = categories.filter(
        (c) =>
          c.type === formData.type &&
          (parentId === null ? !c.parentId : c.parentId === parentId)
      );

      children.forEach((child) => {
        // Evitamos que una categoría sea su propio padre o que sus hijos sean sus padres
        if (child.id !== category?.id) {
          options.push({ id: child.id, name: child.name, depth });
          // Limitamos a 2 niveles de profundidad para mantener orden
          if (depth < 2) flatten(child.id, depth + 1);
        }
      });
    };

    flatten(null, 0);
    return options;
  }, [categories, formData.type, category]);

  // 🔄 REFRESCO FORZADO DE DATOS
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
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, category]); // ✅ Se dispara al cambiar de categoría o abrir modal

  useEffect(() => {
    if (formData.parentId) {
      const parent = categories.find((c) => c.id === formData.parentId);
      if (parent && parent.type !== formData.type) {
        handleChange("parentId", null);
      }
    }
  }, [formData.type, categories]);

  const handleChange = (field: keyof CategoryFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "activo",
      type: "Alimentos",
      parentId: null,
    });
    setErrors({});
  };

  const handleDelete = () => {
    if (category && onDelete) {
      onDelete(category);
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    setIsDeleteConfirmOpen(false);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={category ? "Editar Categoría" : "Nueva Categoría"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección: Información Básica */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Tag size={16} className="text-orange-500" />
              Nombre de la Categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-orange-400/20 focus:bg-white outline-none transition-all ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Ej: Platos Fuertes, Cervezas Artesanales..."
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <AlignLeft size={16} className="text-orange-500" />
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400/20 focus:bg-white outline-none resize-none transition-all"
              placeholder="¿Qué incluye esta categoría? (opcional)"
            />
          </div>
        </div>

        {/* Sección: Configuración y Jerarquía */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector de Tipo */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              {formData.type === "Alimentos" ? (
                <Utensils size={16} />
              ) : (
                <GlassWater size={16} />
              )}
              Tipo de Menú
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                handleChange("type", e.target.value as CategoryType)
              }
              disabled={!!category}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/20 disabled:opacity-50 appearance-none cursor-pointer"
            >
              <option value="Alimentos">Alimentos</option>
              <option value="Bebidas">Bebidas</option>
            </select>
          </div>

          {/* 🎯 SELECTOR DE UBICACIÓN (DISEÑO MEJORADO) */}
          <div className="space-y-2 group">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 group-focus-within:text-orange-500 transition-colors">
              <Layers size={14} /> Ubicación (Padre)
            </label>
            <div className="relative">
              <select
                value={formData.parentId || ""}
                onChange={(e) =>
                  handleChange("parentId", e.target.value || null)
                }
                className="w-full pl-5 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white focus:border-orange-500/30 appearance-none cursor-pointer transition-all font-bold text-sm text-gray-700"
              >
                <option value="">Categoría Principal (Raíz)</option>
                {hierarchicalOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="py-2">
                    {/* ↳ Sangría visual según profundidad */}
                    {"\u00A0".repeat(opt.depth * 4)} {opt.depth > 0 ? "↳ " : ""}{" "}
                    {opt.name}
                  </option>
                ))}
              </select>
              {/* Icono de flecha personalizado */}
              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Estado de Disponibilidad */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <Activity size={16} className="text-orange-500" />
            Estado de la Categoría
          </label>
          <div className="flex gap-4">
            {["activo", "inactivo"].map((status) => (
              <label
                key={status}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.status === status
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={() => handleChange("status", status)}
                />
                <span className="capitalize font-bold">
                  {status === "activo" ? "Activa" : "Inactiva"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Acciones Finales */}
        <div
          className={`flex ${
            category && onDelete ? "justify-between" : "justify-end"
          } items-center pt-6 border-t border-gray-100`}
        >
          {category && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
            >
              Eliminar Categoría
            </button>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{ backgroundColor: "#FF8108" }}
            >
              {category ? "Guardar Cambios" : "Crear Ahora"}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default CategoryModal;
