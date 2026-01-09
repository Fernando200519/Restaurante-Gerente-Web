import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  UtensilsCrossed,
  LayoutGrid,
  List,
  AlertCircle,
} from "lucide-react";
import MenuTabs from "../components/menu/MenuTabs";
import CategoryTable from "../components/menu/CategoryTable";
import ProductCard from "../components/menu/ProductCard";
import ProductTable from "../components/menu/ProductTable";
import ProductCardSkeleton from "../components/menu/ProductCardSkeleton";
import ProductTableSkeleton from "../components/menu/ProductTableSkeleton";
import CategoryModal from "../components/menu/CategoryModal";
import ProductModal from "../components/menu/ProductModal";
import DeleteCategoryModal from "../components/menu/DeleteCategoryModal";
import ProductFilters from "../components/menu/ProductFilters";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import { categoriesAPI } from "../api/categoriesApi";
import type { Category } from "../types/menu";
import { CategoryFormData } from "../types/menu";

const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const [activeTab, setActiveTab] = useState<"categories" | "products">(
    "categories"
  );
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const {
    categories,
    error: catError,
    saveCategory,
    deleteCategory,
    loadCategories,
  } = useCategories();

  const {
    products,
    rawProducts,
    loading,
    error: prodError,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    page,
    setPage,
    totalPages,
    saveProduct,
    deleteProduct,
    loadProducts,
  } = useProducts(categories);

  // 1. Asegúrate de que tu estado se llame así:
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // 2. La función handleSave corregida:
  const handleSave = async (data: CategoryFormData) => {
    try {
      // Usamos el hook de categories que ya tenemos
      await saveCategory(data, selectedCategory || undefined);
      setIsCatModalOpen(false); // ✅ Nombre correcto del estado
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadCategories(), loadProducts()]);
    };
    initializeData();
  }, [loadCategories, loadProducts]);

  const handleAddAction = () => {
    if (activeTab === "categories") {
      setSelectedCategory(null);
      setIsCatModalOpen(true);
    } else {
      setSelectedProduct(null);
      setIsProdModalOpen(true);
    }
  };

  const handleEditCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setIsCatModalOpen(true);
  };

  const handleEditProduct = (prod: any) => {
    setSelectedProduct(prod);
    setIsProdModalOpen(true);
  };

  const handleOpenDeleteModal = (cat: Category | string) => {
    const categoryObj =
      typeof cat === "string" ? categories.find((c) => c.id === cat) : cat;
    if (categoryObj) {
      setCategoryToDelete(categoryObj);
      setIsDelModalOpen(true);
    }
  };

  const onSaveCategory = async (data: any) => {
    await saveCategory(data, selectedCategory || undefined);
    setIsCatModalOpen(false);
  };

  const onSaveProduct = async (data: any) => {
    await saveProduct(data, selectedProduct || undefined);
    setIsProdModalOpen(false);
  };

  const filterCategories = useMemo((): Category[] => {
    const hasUncategorized = products.some((p) => p.categoryId === "3");
    if (hasUncategorized && !categories.find((c) => c.id === "3")) {
      const uncategorized: Category = {
        id: "3",
        name: "Sin categoría",
        status: "activo",
        type: "Alimentos",
      };
      return [...categories, uncategorized];
    }
    return categories;
  }, [categories, products]);

  return (
    /* ✅ w-full asegura que use el 100%, max-w-7xl o [1600px] da el límite premium */
    <main className="w-full max-w-full overflow-hidden">
      {/* ✅ Bloqueo de ancho */}
      {/* 🚨 ALERTAS DE ERROR */}
      {(catError || prodError) && (
        <div className="mb-8 p-5 bg-rose-50 border-l-4 border-rose-500 rounded-2xl flex items-center gap-4 text-rose-800 animate-in slide-in-from-top-4 duration-500 shadow-sm">
          <AlertCircle className="text-rose-500 shrink-0" size={24} />
          <p className="text-sm font-bold tracking-tight">
            {catError || prodError}
          </p>
        </div>
      )}
      {/* 🏢 HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            Gestión de Menú
          </h1>
        </div>

        <button
          onClick={handleAddAction}
          className="flex items-center justify-center gap-3 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer bg-[#FF8108]"
        >
          <Plus size={20} strokeWidth={4} />
          {activeTab === "categories" ? "Nueva Categoría" : "Nuevo Platillo"}
        </button>
      </div>
      {/* 🛠️ TOOLBAR: Forzamos el ancho al 100% del Layout */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 mb-10 w-full max-w-full overflow-hidden relative">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <MenuTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "products" && (
              <div className="flex items-center gap-4 w-full lg:w-auto min-w-0">
                <div className="relative flex-1 lg:w-80 group min-w-0">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF8108] transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscador inteligente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-[#FF8108] focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                  />
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-xl transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-[#FF8108] shadow-md"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <LayoutGrid size={22} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2.5 rounded-xl transition-all ${
                      viewMode === "table"
                        ? "bg-white text-[#FF8108] shadow-md"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List size={22} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ✅ FILTROS: Contenedor con scroll interno real */}
          {activeTab === "products" && (
            <div className="pt-2 border-t border-gray-50 w-full overflow-x-auto no-scrollbar">
              <ProductFilters
                categories={filterCategories}
                products={rawProducts}
                selectedCategoryId={categoryId}
                onCategoryChange={setCategoryId}
              />
            </div>
          )}
        </div>
      </div>
      {/* 🚀 CONTENIDO DINÁMICO */}
      <div className="w-full min-h-[400px] overflow-hidden">
        {/* ✅ Evita que la tabla o grid estiren el main */}
        {activeTab === "categories" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CategoryTable
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleOpenDeleteModal}
            />
          </div>
        ) : (
          <>
            {loading ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <ProductTableSkeleton />
              )
            ) : products.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-cascade"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <ProductCard
                        product={product}
                        onEdit={handleEditProduct}
                        onDelete={deleteProduct}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ProductTable
                    products={products}
                    onEdit={handleEditProduct}
                    onDelete={deleteProduct}
                  />
                </div>
              )
            ) : (
              <div className="bg-white rounded-[3rem] border-4 border-dashed border-gray-50 p-24 text-center">
                <UtensilsCrossed
                  className="text-[#FF8108] opacity-20 mx-auto mb-6"
                  size={64}
                />
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                  Sin resultados
                </h3>
                <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">
                  Prueba ajustando los filtros
                </p>
              </div>
            )}

            {/* 📑 PAGINACIÓN */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 mt-16 pb-10">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    setPage(page - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-8 py-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm disabled:opacity-30 hover:border-[#FF8108]/30 hover:text-[#FF8108] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                >
                  Anterior
                </button>
                <span className="text-gray-500 font-black text-xs uppercase tracking-widest">
                  Página <span className="text-gray-900">{page}</span> /{" "}
                  {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => {
                    setPage(page + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-8 py-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm disabled:opacity-30 hover:border-[#FF8108]/30 hover:text-[#FF8108] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* 📦 MODALES CENTRALIZADOS */}
      <CategoryModal
        key={selectedCategory?.id || "new-category"}
        isOpen={isCatModalOpen} // 🎯 Cambiado de isModalOpen a isCatModalOpen
        category={selectedCategory}
        categories={categories}
        onSave={handleSave}
        onClose={() => setIsCatModalOpen(false)} // 🎯 Cambiado de setIsModalOpen a setIsCatModalOpen
      />
      <DeleteCategoryModal
        isOpen={isDelModalOpen}
        onClose={() => setIsDelModalOpen(false)}
        category={categoryToDelete}
        categories={categories}
        productsCount={
          products.filter((p) => p.categoryId === categoryToDelete?.id).length
        }
        onDeleteWithoutCategory={() => deleteCategory(categoryToDelete?.id!)}
        onDeleteWithProducts={() =>
          categoriesAPI.deleteWithProducts(categoryToDelete?.id!)
        }
        onMoveProductsToExisting={(id) =>
          categoriesAPI.moveProducts(categoryToDelete?.id!, id)
        }
        onMoveProductsToNew={(name) =>
          categoriesAPI.migrateToNew(categoryToDelete?.id!, name)
        }
      />
      <ProductModal
        isOpen={isProdModalOpen}
        onClose={() => setIsProdModalOpen(false)}
        product={selectedProduct}
        categories={categories}
        onSave={onSaveProduct}
      />
    </main>
  );
};

export default MenuPage;
