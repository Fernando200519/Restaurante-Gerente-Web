import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  DollarSign,
  Upload,
  Leaf,
  X,
  Plus,
  ListPlus,
  Trash2,
  Check,
  Percent,
  Info,
} from "lucide-react";
import BaseModal from "../ui/BaseModal";

import confetti from "canvas-confetti";
import type { Product, ProductFormData, Category } from "../../types/menu";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSave: (data: ProductFormData) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onSave,
}) => {
  const initialFormState: ProductFormData = {
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    status: "activo",
    type: "Alimento",
    imageUrl: "",
    imageFile: undefined,
    removeImage: false,
    complementos: [],
    ingredientes: [],
    tipoIva: "Tasa16",
    precioIncluyeImpuestos: true,
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormState);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingCompIndex, setEditingCompIndex] = useState<number | null>(null);
  const [editingIngIndex, setEditingIngIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [newComp, setNewComp] = useState({ nombre: "", precio: 0 });
  const [newIng, setNewIng] = useState("");

  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  const leafCategories = useMemo(() => {
    return categories.filter(
      (c) => !categories.some((child) => child.parentName === c.name)
    );
  }, [categories]);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        ...initialFormState,
        ...product,
        description: product.description || "",
        tipoIva: (product as any).tipoIva || "Tasa16",
        precioIncluyeImpuestos: (product as any).precioIncluyeImpuestos ?? true,
      });
      setPreviewUrl(product.imageUrl || null);
    } else if (isOpen) {
      resetForm();
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (formData.categoryId) {
      const selected = categories.find((c) => c.id === formData.categoryId);
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          type: selected.type === "Bebidas" ? "Bebida" : "Alimento",
        }));
      }
    }
  }, [formData.categoryId, categories]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      status: "activo",
      type: "Alimento",
      imageUrl: "",
      imageFile: undefined,
      removeImage: false,
      complementos: [],
      ingredientes: [],
      tipoIva: "Tasa16",
      precioIncluyeImpuestos: true,
    });
    setPreviewUrl(null);
    setErrors({});
  };

  const handleAddOrUpdateComp = () => {
    if (newComp.nombre.trim()) {
      const updatedComps = [...formData.complementos];
      if (editingCompIndex !== null) {
        updatedComps[editingCompIndex] = {
          ...updatedComps[editingCompIndex],
          nombre: newComp.nombre,
          precio: newComp.precio,
        };
        setEditingCompIndex(null);
      } else {
        updatedComps.push({ ...newComp });
      }
      setFormData({ ...formData, complementos: updatedComps });
      setNewComp({ nombre: "", precio: 0 });
    }
  };

  const handleAddOrUpdateIng = () => {
    if (newIng.trim()) {
      const updatedIngs = [...formData.ingredientes];

      if (editingIngIndex !== null) {
        updatedIngs[editingIngIndex] = {
          ...updatedIngs[editingIngIndex],
          nombre: newIng,
        };
        setEditingIngIndex(null);
      } else {
        updatedIngs.push({ nombre: newIng });
      }

      setFormData({ ...formData, ingredientes: updatedIngs });
      setNewIng("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Obligatorio";
    if (!formData.categoryId) newErrors.category = "Selecciona una categoría";

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    try {
      await onSave(formData);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF8108", "#22C55E", "#ffffff"],
      });

      onClose();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Actualizar Producto" : "Nuevo Platillo"}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-8 animate-in fade-in duration-300"
      >
        {/* 📸 SECCIÓN: IMAGEN */}
        <div className="relative group rounded-[2.5rem] border-2 border-dashed border-gray-200 bg-gray-50/50 h-56 overflow-hidden transition-all hover:border-[#FF8108]/50 shrink-0">
          {previewUrl ? (
            <div className="relative h-full w-full">
              <img
                src={previewUrl}
                className="h-full w-full object-cover"
                alt="Preview"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white rounded-2xl text-gray-700 shadow-xl hover:scale-110 transition-transform"
                >
                  <Upload size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setFormData((p) => ({
                      ...p,
                      removeImage: true,
                      imageFile: undefined,
                    }));
                  }}
                  className="p-3 bg-red-500 rounded-2xl text-white shadow-xl hover:scale-110 transition-transform"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="h-full flex flex-col items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-orange-100 p-4 rounded-3xl text-[#FF8108] mb-3 group-hover:scale-110 transition-transform">
                <Upload size={28} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 text-center px-4">
                Arrastra o selecciona la foto del platillo
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPreviewUrl(URL.createObjectURL(file));
                setFormData((p) => ({
                  ...p,
                  imageFile: file,
                  removeImage: false,
                }));
              }
            }}
          />
        </div>

        {/* 📑 SECCIÓN: DATOS GENERALES */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Nombre Comercial
            </label>
            <input
              className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl font-bold focus:bg-white focus:border-[#FF8108] transition-all outline-none ${
                errors.name ? "border-red-200" : "border-gray-100"
              }`}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* 📂 SELECTOR DE CATEGORÍA REDISEÑADO (Adiós al select feo) */}
          <div className="md:col-span-3 space-y-2 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Categoría Final
            </label>
            <button
              type="button"
              onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              className={`w-full px-5 py-4 border-2 rounded-2xl flex justify-between items-center transition-all bg-gray-50 cursor-pointer
                ${
                  catDropdownOpen
                    ? "border-[#FF8108] bg-white ring-4 ring-orange-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
            >
              <span
                className={`font-bold ${
                  formData.categoryId ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {leafCategories.find((c) => c.id === formData.categoryId)
                  ?.name || "Seleccionar..."}
              </span>
              <Plus
                size={18}
                className={`text-gray-400 transition-transform ${
                  catDropdownOpen ? "rotate-45" : ""
                }`}
              />
            </button>

            {catDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 animate-in zoom-in-95 duration-200">
                {leafCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, categoryId: c.id });
                      setCatDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-bold rounded-xl transition-colors cursor-pointer
                      ${
                        formData.categoryId === c.id
                          ? "bg-orange-50 text-[#FF8108]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {c.name}
                    <span className="block text-[8px] opacity-40 uppercase tracking-tighter">
                      Hija de: {c.parentName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 📝 NUEVA SECCIÓN: DESCRIPCIÓN DEL PRODUCTO */}
        <div className="md:col-span-6 space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Descripción del Platillo
          </label>
          <textarea
            placeholder="Ej: Jugosa carne de res acompañada de papas fritas y ensalada fresca..."
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-medium text-sm focus:bg-white focus:border-[#FF8108] transition-all outline-none min-h-[100px] resize-none"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <p className="text-[9px] text-gray-400 italic ml-1">
            Esta descripción se mostrará en el menú digital para los comensales.
          </p>
        </div>

        {/* 📊 SECCIÓN: PRECIO E IMPUESTOS (VERSIÓN SIMPLIFICADA) */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
          <Percent
            className="absolute -right-4 -bottom-4 text-white/5"
            size={140}
          />

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#FF8108] p-2 rounded-xl">
              <DollarSign size={20} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em]">
              Configuración de Venta
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* COLUMNA 1: PRECIO */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Precio al Público
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF8108] font-black text-xl">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full pl-12 pr-6 py-5 bg-white/10 border-2 border-white/10 rounded-2xl font-black text-2xl tabular-nums outline-none focus:border-[#FF8108] focus:bg-white/20 transition-all"
                  placeholder="0.00"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* COLUMNA 2: SWITCH DE IMPUESTOS */}
            <div className="flex flex-col justify-center space-y-3 bg-white/5 p-6 rounded-3xl border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Grava Impuestos (IVA)
                  </label>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">
                    {formData.precioIncluyeImpuestos
                      ? "Tasa General 16% Aplicada"
                      : "Producto Exento / Sin IVA"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((f) => ({
                      ...f,
                      precioIncluyeImpuestos: !f.precioIncluyeImpuestos,
                      // Al desactivar, enviamos null según el acuerdo con el back
                      tipoIva: !f.precioIncluyeImpuestos
                        ? "Tasa16"
                        : (null as any),
                    }))
                  }
                  className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                    formData.precioIncluyeImpuestos
                      ? "bg-[#FF8108] shadow-[0_0_15px_rgba(255,129,8,0.3)]"
                      : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                      formData.precioIncluyeImpuestos ? "left-8" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🛠️ SECCIÓN: COMPLEMENTOS (MIXED EDITION UI) */}
        <div
          className={`space-y-4 p-6 rounded-[2.5rem] border-2 transition-colors ${
            editingCompIndex !== null
              ? "bg-orange-50 border-[#FF8108]/30"
              : "bg-orange-50/20 border-orange-100/30"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ListPlus size={18} className="text-[#FF8108]" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                {editingCompIndex !== null
                  ? "Editando Complemento"
                  : "Complementos y Adicionales"}
              </h4>
            </div>
            {editingCompIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingCompIndex(null);
                  setNewComp({ nombre: "", precio: 0 });
                }}
                className="text-[9px] font-black text-[#FF8108] uppercase underline"
              >
                Cancelar Edición
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <input
              placeholder="Nombre"
              className="flex-2 px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-[#FF8108]"
              value={newComp.nombre}
              onChange={(e) =>
                setNewComp({ ...newComp, nombre: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="$"
              className="flex-1 px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-black outline-none focus:border-[#FF8108]"
              value={newComp.precio || ""}
              onChange={(e) =>
                setNewComp({
                  ...newComp,
                  precio: parseFloat(e.target.value) || 0,
                })
              }
            />
            <button
              type="button"
              onClick={handleAddOrUpdateComp}
              className={`px-5 text-white rounded-2xl transition-all shadow-lg active:scale-95 ${
                editingCompIndex !== null
                  ? "bg-emerald-500 shadow-emerald-100"
                  : "bg-[#FF8108] shadow-orange-200"
              }`}
            >
              {editingCompIndex !== null ? (
                <Check size={24} strokeWidth={3} />
              ) : (
                <Plus size={24} strokeWidth={3} />
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.complementos.map((c, i) => (
              <div
                key={i}
                onClick={() => {
                  setNewComp({ nombre: c.nombre, precio: c.precio });
                  setEditingCompIndex(i);
                }}
                className={`flex items-center gap-3 border-2 px-4 py-2 rounded-2xl cursor-pointer transition-all animate-in zoom-in-95
                ${
                  editingCompIndex === i
                    ? "bg-white border-[#FF8108] shadow-md scale-105"
                    : "bg-white border-orange-100/50 hover:border-orange-300"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-gray-800 uppercase">
                    {c.nombre}
                  </span>
                  <span className="text-[10px] font-black text-[#FF8108]">
                    ${c.precio}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({
                      ...formData,
                      complementos: formData.complementos.filter(
                        (_, idx) => idx !== i
                      ),
                    });
                  }}
                  className="text-gray-300 hover:text-red-500"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 🍃 SECCIÓN: PREFERENCIAS (INGREDIENTES / EXCLUSIONES) */}
        <div
          className={`space-y-4 p-6 rounded-[2.5rem] border-2 transition-colors ${
            editingIngIndex !== null
              ? "bg-emerald-50/50 border-emerald-500/30"
              : "bg-gray-50 border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Leaf size={18} className="text-emerald-500" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                {editingIngIndex !== null
                  ? "Editando Preferencia"
                  : "Preferencias de Cliente (Exclusiones)"}
              </h4>
            </div>
            {editingIngIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingIngIndex(null);
                  setNewIng("");
                }}
                className="text-[9px] font-black text-emerald-600 uppercase underline cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <input
              placeholder="Ej: Sin Cebolla / Salsa aparte"
              className="flex-1 px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-400 transition-all"
              value={newIng}
              onChange={(e) => setNewIng(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(), handleAddOrUpdateIng())
              }
            />
            <button
              type="button"
              onClick={handleAddOrUpdateIng}
              className={`px-5 text-white rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer ${
                editingIngIndex !== null
                  ? "bg-emerald-500 shadow-emerald-100"
                  : "bg-gray-900 shadow-gray-200"
              }`}
            >
              {editingIngIndex !== null ? (
                <Check size={24} strokeWidth={3} />
              ) : (
                <Plus size={24} strokeWidth={3} />
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.ingredientes.map((ing, i) => (
              <div
                key={i}
                onClick={() => {
                  setNewIng(ing.nombre);
                  setEditingIngIndex(i);
                }}
                className={`flex items-center gap-3 border-2 px-4 py-2 rounded-2xl cursor-pointer transition-all animate-in zoom-in-95
          ${
            editingIngIndex === i
              ? "bg-white border-emerald-500 shadow-md scale-105"
              : "bg-white border-gray-100 hover:border-emerald-200"
          }`}
              >
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                  {ing.nombre}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({
                      ...formData,
                      ingredientes: formData.ingredientes.filter(
                        (_, idx) => idx !== i
                      ),
                    });
                  }}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ⚡ ACCIONES FINALES */}
        <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-10 py-4 bg-[#FF8108] text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-100 hover:bg-[#e67407] hover:-translate-y-1 transition-all cursor-pointer"
          >
            {product ? "Actualizar Registro" : "Publicar en Menú"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ProductModal;
