import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import MenuTabs from '../../components/menu/MenuTabs';
import AddCategoryButton from '../../components/menu/AddCategoryButton';
import AddProductButton from '../../components/menu/AddProductButton';
import CategoryTable from '../../components/menu/CategoryTable';
import CategoryModal from '../../components/menu/CategoryModal';
import ProductCard from '../../components/menu/ProductCard';
import ProductFilters from '../../components/menu/ProductFilters';
import ProductTable from '../../components/menu/ProductTable';
import ProductCardSkeleton from '../../components/menu/ProductCardSkeleton';
import ProductTableSkeleton from '../../components/menu/ProductTableSkeleton';
import ProductModal from '../../components/menu/ProductModal';
import SearchBar from '../../components/employees/SearchBar';
import ConfirmModal from '../../components/ui/ConfirmModal';
import DeleteCategoryModal from '../../components/menu/DeleteCategoryModal';
import { categoriesAPI } from '../../api/categories';
import { productsAPI } from '../../api/products';
import type { Category, CategoryFormData, Product, ProductFormData } from '../../types/menu/types';

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Postres', status: 'activo' },
  { id: '2', name: 'Bebidas', status: 'activo' },
  { id: '3', name: 'Hamburguesas', status: 'activo' },
  { id: '4', name: 'Complementos', status: 'activo' },
];

const mockProducts: Product[] = [
  { id: '1', name: 'Pastel de chocolate', categoryId: '1', categoryName: 'Postres', price: 89.00, status: 'activo' },
  { id: '2', name: 'Malteada de chocolate', categoryId: '2', categoryName: 'Bebidas', price: 89.00, status: 'activo' },
  { id: '3', name: 'Coca-Cola en lata', categoryId: '2', categoryName: 'Bebidas', price: 89.00, status: 'activo' },
  { id: '4', name: 'Hamburguesa especial', categoryId: '3', categoryName: 'Hamburguesas', price: 99.00, status: 'activo' },
  { id: '5', name: 'Cheesecake', categoryId: '1', categoryName: 'Postres', price: 89.00, status: 'activo' },
  { id: '6', name: 'Crepa de avena', categoryId: '1', categoryName: 'Postres', price: 89.00, status: 'activo' },
  { id: '7', name: 'Guacamole', categoryId: '4', categoryName: 'Complementos', price: 89.00, status: 'activo' },
];

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDeleteWithProducts, setCategoryToDeleteWithProducts] = useState<Category | null>(null);
  const [isActivateProductsConfirmOpen, setIsActivateProductsConfirmOpen] = useState(false);
  const [pendingCategoryUpdate, setPendingCategoryUpdate] = useState<{ formData: CategoryFormData; updatedCategory: Category; selectedCategory: Category } | null>(null);
  const [isConfirmingActivateProducts, setIsConfirmingActivateProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Debe alinear con el grid
  // Vista: grid o lista
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, []);

  // Cargar productos cuando se cambia a la pestaña de productos
  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    }
  }, [activeTab]); // Cargar productos siempre que se cambie a la pestaña, independientemente de si hay categorías

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('Error al cargar las categorías. Por favor, intenta de nuevo.');
      // En caso de error, usar datos mock como fallback
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      setError(null);
      const data = await productsAPI.getAll(categories);
      setProducts(data);
    } catch (err: any) {
      console.error('Error al cargar productos:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar los productos. Por favor, intenta de nuevo.';
      setError(errorMessage);
      // En caso de error, usar datos mock como fallback
      setProducts(mockProducts);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (formData: CategoryFormData) => {
    try {
      setError(null);
      if (selectedCategory) {
        // Editar categoría existente
        const updatedCategory = await categoriesAPI.update(selectedCategory.id, formData);
        
        // Si la categoría se está poniendo inactiva, también poner inactivos todos sus productos
        if (formData.status === 'inactivo' && selectedCategory.status === 'activo') {
          // Buscar todos los productos de esta categoría
          const productsInCategory = products.filter((prod) => prod.categoryId === selectedCategory.id && prod.status === 'activo');
          
          // Actualizar cada producto a inactivo
          if (productsInCategory.length > 0) {
            console.log(`Actualizando ${productsInCategory.length} producto(s) a inactivo porque la categoría se puso inactiva`);
            const updatePromises = productsInCategory.map(async (product) => {
              try {
                // Crear un ProductFormData con el estado inactivo pero manteniendo los demás datos
                const productFormData: ProductFormData = {
                  name: product.name,
                  description: product.description || '',
                  price: product.price,
                  categoryId: product.categoryId,
                  status: 'inactivo', // Cambiar a inactivo
                  imageUrl: product.imageUrl || '',
                };
                await productsAPI.update(product.id, productFormData, categories);
              } catch (err) {
                console.error(`Error al actualizar producto ${product.id} a inactivo:`, err);
                // Continuar con los demás productos aunque uno falle
              }
            });
            
            // Esperar a que se actualicen todos los productos
            await Promise.all(updatePromises);
            
            // Recargar productos para reflejar los cambios
            await loadProducts();
          }
        }
        
        // Si la categoría se está poniendo activa, preguntar si también activar todos los productos
        if (formData.status === 'activo' && selectedCategory.status === 'inactivo') {
          // Buscar todos los productos inactivos de esta categoría
          const inactiveProductsInCategory = products.filter((prod) => prod.categoryId === selectedCategory.id && prod.status === 'inactivo');
          
          if (inactiveProductsInCategory.length > 0) {
            // Guardar los datos pendientes y mostrar el modal de confirmación
            setPendingCategoryUpdate({ formData, updatedCategory, selectedCategory });
            setIsActivateProductsConfirmOpen(true);
            return; // Salir aquí, el modal manejará la continuación
          }
        }
        
        // Actualizar la categoría en el estado local
        // Preservar todos los datos del formulario y usar los datos de la respuesta si están disponibles
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === selectedCategory.id
              ? {
                  ...cat, // Preservar datos existentes
                  ...updatedCategory, // Sobrescribir con datos de la respuesta
                  name: formData.name, // Asegurar que el nombre del formulario se use
                  // Usar la descripción del formulario (lo que el usuario escribió o dejó)
                  // Si está vacía después de trim, usar undefined; si tiene valor, usar ese valor
                  description: formData.description && formData.description.trim() !== '' 
                    ? formData.description.trim() 
                    : undefined,
                  status: formData.status, // Usar el estado enviado
                }
              : cat
          )
        );
      } else {
        // Crear nueva categoría
        const newCategory = await categoriesAPI.create(formData);
        // Agregar la categoría al estado local con el estado correcto
        setCategories((prev) => [...prev, { 
          ...newCategory, 
          name: formData.name, // Asegurar que el nombre del formulario se use
          description: formData.description || undefined,
          status: formData.status 
        }]);
      }
      // No recargar desde el servidor porque el backend devuelve estados incorrectos
      // En su lugar, confiamos en el estado que enviamos
      setIsCategoryModalOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setError('Error al guardar la categoría. Por favor, intenta de nuevo.');
      // Si hay error, recargar desde el servidor
      await loadCategories();
    }
  };

  const handleConfirmActivateProducts = async () => {
    console.log('handleConfirmActivateProducts llamado');
    console.log('pendingCategoryUpdate:', pendingCategoryUpdate);
    
    if (!pendingCategoryUpdate || !pendingCategoryUpdate.selectedCategory) {
      console.log('No hay pendingCategoryUpdate o selectedCategory, saliendo');
      setIsActivateProductsConfirmOpen(false);
      setPendingCategoryUpdate(null);
      return;
    }
    
    setIsConfirmingActivateProducts(true);
    
    try {
      setError(null);
      const { formData, updatedCategory, selectedCategory } = pendingCategoryUpdate;
      console.log('Iniciando activación de productos...');
      console.log('selectedCategory desde pendingCategoryUpdate:', selectedCategory);
      
      // Buscar todos los productos inactivos de esta categoría
      const inactiveProductsInCategory = products.filter((prod) => prod.categoryId === selectedCategory.id && prod.status === 'inactivo');
      
      if (inactiveProductsInCategory.length > 0) {
        console.log(`Activando ${inactiveProductsInCategory.length} producto(s) porque la categoría se activó`);
        const updatePromises = inactiveProductsInCategory.map(async (product) => {
          try {
            // Crear un ProductFormData con el estado activo pero manteniendo los demás datos
            const productFormData: ProductFormData = {
              name: product.name,
              description: product.description || '',
              price: product.price,
              categoryId: product.categoryId,
              status: 'activo', // Cambiar a activo
              imageUrl: product.imageUrl || '',
            };
            await productsAPI.update(product.id, productFormData, categories);
          } catch (err) {
            console.error(`Error al actualizar producto ${product.id} a activo:`, err);
            // Continuar con los demás productos aunque uno falle
          }
        });
        
        // Esperar a que se actualicen todos los productos
        await Promise.all(updatePromises);
        
        // Recargar productos para reflejar los cambios
        await loadProducts();
      }
      
      // Actualizar la categoría en el estado local
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategory.id
            ? {
                ...cat,
                ...updatedCategory,
                name: formData.name,
                description: formData.description || undefined,
                status: formData.status,
              }
            : cat
        )
      );
      
      setIsCategoryModalOpen(false);
      setSelectedCategory(null);
      setIsActivateProductsConfirmOpen(false);
      setPendingCategoryUpdate(null);
      setIsConfirmingActivateProducts(false);
    } catch (err) {
      console.error('Error al activar productos:', err);
      setError('Error al activar los productos. Por favor, intenta de nuevo.');
      setIsActivateProductsConfirmOpen(false);
      setPendingCategoryUpdate(null);
      setIsConfirmingActivateProducts(false);
    }
  };

  const handleCloseActivateProducts = () => {
    console.log('handleCloseActivateProducts llamado');
    console.log('isConfirmingActivateProducts:', isConfirmingActivateProducts);
    console.log('pendingCategoryUpdate:', pendingCategoryUpdate);
    
    // Si ya se está confirmando, no ejecutar la lógica de cancelar
    if (isConfirmingActivateProducts) {
      console.log('Ya se está confirmando, solo cerrando modal');
      setIsActivateProductsConfirmOpen(false);
      setPendingCategoryUpdate(null);
      setIsConfirmingActivateProducts(false);
      return;
    }
    
    // Si hay una actualización pendiente, ejecutar la lógica de cancelar (solo actualizar categoría)
    if (pendingCategoryUpdate && pendingCategoryUpdate.selectedCategory) {
      console.log('Ejecutando lógica de cancelar (solo actualizar categoría)');
      const { formData, updatedCategory, selectedCategory } = pendingCategoryUpdate;
      
      // Solo actualizar la categoría sin activar los productos
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategory.id
            ? {
                ...cat,
                ...updatedCategory,
                name: formData.name,
                description: formData.description || undefined,
                status: formData.status,
              }
            : cat
        )
      );
      
      setIsCategoryModalOpen(false);
      setSelectedCategory(null);
    }
    
    // Cerrar el modal y limpiar el estado pendiente
    setIsActivateProductsConfirmOpen(false);
    setPendingCategoryUpdate(null);
    setIsConfirmingActivateProducts(false);
  };

  const handleCancelActivateProducts = () => {
    // Esta función es la misma que handleCloseActivateProducts
    // Se mantiene por claridad del código, pero ambos hacen lo mismo
    handleCloseActivateProducts();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setError(null);
      
      // Buscar la categoría
      const category = categories.find((cat) => cat.id === categoryId);
      if (!category) {
        setError('Categoría no encontrada.');
        return;
      }
      
      // Asegurarse de que los productos estén cargados antes de verificar
      if (products.length === 0 && !productsLoading) {
        console.log('Cargando productos para verificar si la categoría tiene productos...');
        await loadProducts();
      }
      
      // Verificar si la categoría tiene productos
      const productsInCategory = products.filter((prod) => prod.categoryId === categoryId);
      console.log(`Categoría ${category.name} tiene ${productsInCategory.length} producto(s)`);
      console.log('Productos en la categoría:', productsInCategory);
      
      if (productsInCategory.length === 0) {
        // Si no tiene productos, eliminar directamente
        console.log('No hay productos, eliminando categoría directamente');
        await categoriesAPI.delete(categoryId);
        await loadCategories();
        // Cerrar el modal de categoría si está abierto
        setIsCategoryModalOpen(false);
        setSelectedCategory(null);
      } else {
        // Si tiene productos, mostrar el modal con opciones
        console.log('Hay productos, mostrando modal con opciones');
        // Cerrar primero el modal de categoría
        setIsCategoryModalOpen(false);
        setSelectedCategory(null);
        // Luego mostrar el modal de eliminación con opciones
        setCategoryToDeleteWithProducts(category);
        setIsDeleteCategoryModalOpen(true);
      }
    } catch (err: any) {
      console.error('Error al eliminar categoría:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar la categoría. Por favor, intenta de nuevo.';
      setError(errorMessage);
    }
  };

  // Opción 1: Eliminar categoría y todos sus productos (usando endpoint /with-products)
  const handleDeleteCategoryWithProducts = async () => {
    if (!categoryToDeleteWithProducts) return;
    
    try {
      setError(null);
      const categoryId = categoryToDeleteWithProducts.id;
      
      // Usar el nuevo endpoint que elimina la categoría y todos sus productos en una sola operación
      await categoriesAPI.deleteWithProducts(categoryId);
      
      // Recargar datos
      await loadCategories();
      await loadProducts();
      
      setIsDeleteCategoryModalOpen(false);
      setCategoryToDeleteWithProducts(null);
    } catch (err: any) {
      console.error('Error al eliminar categoría con productos:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar la categoría y productos. Por favor, intenta de nuevo.';
      setError(errorMessage);
    }
  };

  // Opción 2: Mover productos a otra categoría
  const handleMoveProductsToCategory = async (targetCategoryId: string) => {
    if (!categoryToDeleteWithProducts) return;
    
    try {
      setError(null);
      const categoryId = categoryToDeleteWithProducts.id;
      
      // Buscar todos los productos de esta categoría
      const productsInCategory = products.filter((prod) => prod.categoryId === categoryId);
      
      // Mover cada producto a la nueva categoría
      if (productsInCategory.length > 0) {
        console.log(`Moviendo ${productsInCategory.length} producto(s) a la categoría ${targetCategoryId}`);
        const updatePromises = productsInCategory.map(async (product) => {
          try {
            const productFormData: ProductFormData = {
              name: product.name,
              description: product.description || '',
              price: product.price,
              categoryId: targetCategoryId, // Nueva categoría
              status: product.status,
              imageUrl: product.imageUrl || '',
            };
            await productsAPI.update(product.id, productFormData, categories);
          } catch (err) {
            console.error(`Error al mover producto ${product.id}:`, err);
            // Continuar con los demás productos aunque uno falle
          }
        });
        
        await Promise.all(updatePromises);
        await loadProducts(); // Recargar productos
      }
      
      // Eliminar la categoría
      await categoriesAPI.delete(categoryId);
      await loadCategories();
      
      setIsDeleteCategoryModalOpen(false);
      setCategoryToDeleteWithProducts(null);
    } catch (err: any) {
      console.error('Error al mover productos y eliminar categoría:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al mover productos y eliminar categoría. Por favor, intenta de nuevo.';
      setError(errorMessage);
    }
  };

  // Opción 2b: Crear nueva categoría y mover productos
  const handleCreateCategoryAndMoveProducts = async (newCategoryName: string) => {
    if (!categoryToDeleteWithProducts) return;
    
    try {
      setError(null);
      const categoryId = categoryToDeleteWithProducts.id;
      
      // Crear la nueva categoría
      const newCategoryFormData: CategoryFormData = {
        name: newCategoryName,
        description: '',
        status: 'activo',
      };
      
      const newCategory = await categoriesAPI.create(newCategoryFormData);
      await loadCategories(); // Recargar categorías para tener la nueva
      
      // Mover productos a la nueva categoría
      await handleMoveProductsToCategory(newCategory.id);
    } catch (err: any) {
      console.error('Error al crear categoría y mover productos:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al crear categoría y mover productos. Por favor, intenta de nuevo.';
      setError(errorMessage);
    }
  };

  // Opción 3: Eliminar categoría pero dejar productos sin categoría
  const handleDeleteCategoryWithoutCategory = async () => {
    if (!categoryToDeleteWithProducts) return;
    
    try {
      setError(null);
      const categoryId = categoryToDeleteWithProducts.id;
      
      // Buscar todos los productos de esta categoría
      const productsInCategory = products.filter((prod) => prod.categoryId === categoryId);
      
      // Actualizar cada producto para que no tenga categoría (categoryId vacío o null)
      // Nota: Necesitamos verificar cómo el backend maneja productos sin categoría
      // Por ahora, vamos a intentar enviar categoryId como string vacío o necesitamos una categoría especial
      // Depende de cómo el backend maneje esto. Por ahora, dejaremos los productos con categoryId vacío
      
      if (productsInCategory.length > 0) {
        console.log(`Dejando ${productsInCategory.length} producto(s) sin categoría`);
        // Nota: Si el backend no permite categoryId vacío, necesitaremos crear una categoría especial "Sin categoría"
        // Por ahora, asumimos que podemos enviar categoryId como string vacío o el backend tiene una categoría especial
        
        // Intentar actualizar productos sin categoría
        // Si el backend requiere una categoría, podríamos necesitar crear una categoría "Sin categoría" primero
        const updatePromises = productsInCategory.map(async (product) => {
          try {
            // Intentar con categoryId vacío - si el backend no lo acepta, necesitaremos otra solución
            const productFormData: ProductFormData = {
              name: product.name,
              description: product.description || '',
              price: product.price,
              categoryId: '', // Sin categoría - esto puede necesitar ajuste según el backend
              status: product.status,
              imageUrl: product.imageUrl || '',
            };
            await productsAPI.update(product.id, productFormData, categories);
          } catch (err) {
            console.error(`Error al actualizar producto ${product.id} sin categoría:`, err);
            // Continuar con los demás productos aunque uno falle
          }
        });
        
        await Promise.all(updatePromises);
        await loadProducts(); // Recargar productos
      }
      
      // Eliminar la categoría
      await categoriesAPI.delete(categoryId);
      await loadCategories();
      
      setIsDeleteCategoryModalOpen(false);
      setCategoryToDeleteWithProducts(null);
    } catch (err: any) {
      console.error('Error al eliminar categoría dejando productos sin categoría:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar categoría. Por favor, intenta de nuevo.';
      setError(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setError(null);
      if (productToDelete) {
        // Llamar a la API para eliminar el producto del backend
        await productsAPI.delete(productToDelete);
        // Recargar la lista completa desde el servidor para asegurar sincronización
        await loadProducts();
        setProductToDelete(null);
        setIsDeleteConfirmOpen(false);
      }
    } catch (err: any) {
      console.error('Error al eliminar:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar. Por favor, intenta de nuevo.';
      setError(errorMessage);
    }
  };

  // Funciones para productos
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (formData: ProductFormData) => {
    try {
      setError(null);
      const category = categories.find((cat) => cat.id === formData.categoryId);
      
      // Validar que la categoría esté activa antes de crear un nuevo producto
      if (!selectedProduct && category && category.status === 'inactivo') {
        setError('No se pueden agregar productos a categorías inactivas. Por favor, active la categoría primero.');
        return;
      }
      
      // Si la categoría está inactiva, forzar el estado del producto a inactivo
      const finalFormData: ProductFormData = {
        ...formData,
        status: category && category.status === 'inactivo' ? 'inactivo' : formData.status,
      };
      
      if (selectedProduct) {
        // Editar producto existente
        const updatedProduct = await productsAPI.update(selectedProduct.id, finalFormData, categories);
        // Actualizar el producto en el estado local, preservando datos existentes y usando fallbacks
        setProducts((prev) =>
          prev.map((prod) =>
            prod.id === selectedProduct.id
              ? {
                  ...prod, // Preservar todos los datos existentes del producto
                  ...updatedProduct, // Sobrescribir con los datos de la respuesta
                  name: updatedProduct.name || formData.name || prod.name, // Fallback: respuesta > formData > existente
                  price: updatedProduct.price || formData.price || prod.price, // Fallback: respuesta > formData > existente
                  description: updatedProduct.description || formData.description || prod.description, // Fallback
                  categoryId: updatedProduct.categoryId || formData.categoryId || prod.categoryId, // Fallback
                  categoryName: category?.name || updatedProduct.categoryName || prod.categoryName, // Fallback
                  status: finalFormData.status || updatedProduct.status || prod.status, // Usar finalFormData.status (puede estar forzado a inactivo si la categoría está inactiva)
                }
              : prod
          )
        );
      } else {
        // Crear nuevo producto
        await productsAPI.create(finalFormData, categories);
        // Recargar la lista completa desde el servidor para evitar duplicaciones
        await loadProducts();
      }
      
      setIsProductModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError('Error al guardar el producto. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteConfirmOpen(true);
  };

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtrar por categoría
    if (selectedCategoryFilter) {
      filtered = filtered.filter((prod) => prod.categoryId === selectedCategoryFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (prod) =>
          prod.name.toLowerCase().includes(term) ||
          prod.description?.toLowerCase().includes(term) ||
          prod.categoryName?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [products, selectedCategoryFilter, searchTerm]);

  // Resetear a la primera página cuando cambie el buscador o la categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryFilter]);

  // Calcular productos para la página actual (sobre la lista ya filtrada)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentProducts = filteredProducts.slice(firstIndex, lastIndex);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Si por eliminación la página actual se queda sin elementos, retroceder una página de forma segura
  useEffect(() => {
    // Evitar bucles: solo ajustar si la página actual es mayor a las páginas disponibles
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (currentPage > 1 && currentProducts.length === 0 && filteredProducts.length > 0) {
      // Caso específico: hay productos en total, pero la página actual quedó vacía
      setCurrentPage((p) => Math.max(1, p - 1));
    }
  }, [filteredProducts.length, currentProducts.length, totalPages, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-6">
          <div className="max-w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold text-gray-800">Gestión de menú</h1>
              {activeTab === 'categories' && (
                <AddCategoryButton onClick={handleAddCategory} />
              )}
              {activeTab === 'products' && (
                <AddProductButton onClick={handleAddProduct} />
              )}
            </div>

            {/* Tabs */}
            <MenuTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Mensaje de error */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Content based on active tab */}
            {activeTab === 'categories' && (
              <>
                {loading ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p className="text-gray-500">Cargando categorías...</p>
                  </div>
                ) : (
                  <CategoryTable
                    categories={categories}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                )}
              </>
            )}

            {activeTab === 'products' && (
              <>
                {productsLoading ? (
                  <>
                    {/* Barra de búsqueda (deshabilitada durante carga) */}
                    <div className="mb-4 opacity-50 pointer-events-none">
                      <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar productos..."
                      />
                    </div>

                    {/* Filtros y View Switcher (deshabilitados durante carga) */}
                    <div className="flex items-center justify-between mb-6 opacity-50 pointer-events-none">
                      <ProductFilters
                        categories={categories}
                        selectedCategoryId={selectedCategoryFilter}
                        onCategoryChange={setSelectedCategoryFilter}
                      />

                      {/* View Switcher */}
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                          type="button"
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'grid'
                              ? 'bg-white text-orange-600 shadow-sm'
                              : 'text-gray-500'
                          }`}
                          title="Vista Grid"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'list'
                              ? 'bg-white text-orange-600 shadow-sm'
                              : 'text-gray-500'
                          }`}
                          title="Vista Lista"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Skeletons según viewMode */}
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <ProductCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : (
                      <ProductTableSkeleton />
                    )}
                  </>
                ) : (
                  <>
                    {/* Barra de búsqueda */}
                    <div className="mb-4">
                      <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar productos..."
                      />
                    </div>

                    {/* Filtros y View Switcher */}
                    <div className="flex items-center justify-between mb-6">
                      <ProductFilters
                        categories={categories}
                        selectedCategoryId={selectedCategoryFilter}
                        onCategoryChange={setSelectedCategoryFilter}
                      />

                      {/* View Switcher */}
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'grid'
                              ? 'bg-white text-orange-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          title="Vista Grid"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'list'
                              ? 'bg-white text-orange-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          title="Vista Lista"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Productos (Grid o Tabla) */}
                    {filteredProducts.length === 0 ? (
                      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                        <p className="text-lg">No se encontraron productos</p>
                      </div>
                    ) : (
                      <>
                        {viewMode === 'grid' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                            {currentProducts.map((product) => (
                              <ProductCard
                                key={product.id}
                                product={product}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteProduct}
                              />
                            ))}
                          </div>
                        ) : (
                          <ProductTable
                            products={currentProducts}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                          />
                        )}

                        {/* Controles de paginación */}
                        <div className="mt-6 flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={() => canGoPrev && setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={!canGoPrev}
                            className={
                              `px-4 py-2 rounded-md font-medium ` +
                              (canGoPrev
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                            }
                          >
                            Anterior
                          </button>

                          <span className="text-sm text-gray-600">
                            Página {Math.min(currentPage, totalPages)} de {totalPages}
                          </span>

                          <button
                            type="button"
                            onClick={() => canGoNext && setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={!canGoNext}
                            className={
                              `px-4 py-2 rounded-md font-medium ` +
                              (canGoNext
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                            }
                          >
                            Siguiente
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal para categorías */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      {/* Modal para productos */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        categories={categories}
        onSave={handleSaveProduct}
      />

      {/* Modal de confirmación para activar productos al activar categoría */}
      <ConfirmModal
        isOpen={isActivateProductsConfirmOpen}
        onClose={handleCloseActivateProducts}
        onConfirm={handleConfirmActivateProducts}
        title="Activar productos"
        message={
          pendingCategoryUpdate && pendingCategoryUpdate.selectedCategory
            ? `¿Desea activar también todos los productos inactivos de la categoría "${pendingCategoryUpdate.selectedCategory.name}"? Esto activará ${products.filter((prod) => prod.categoryId === pendingCategoryUpdate.selectedCategory.id && prod.status === 'inactivo').length} producto(s).`
            : '¿Desea activar también todos los productos inactivos de esta categoría?'
        }
        confirmText="Sí, activar todos"
        cancelText="No, mantener estados actuales"
        confirmColor="green"
      />

      {/* Modal de confirmación para eliminar productos */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setCategoryToDelete(null);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message={`¿Está seguro de que desea eliminar ${categoryToDelete ? 'esta categoría' : 'este producto'}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColor="red"
      />

      {/* Modal para eliminar categoría: única opción "Sin categoría" mapeada a DELETE */}
      <DeleteCategoryModal
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setCategoryToDeleteWithProducts(null);
        }}
        category={categoryToDeleteWithProducts}
        productsCount={categoryToDeleteWithProducts ? products.filter((prod) => prod.categoryId === categoryToDeleteWithProducts.id).length : 0}
        onDeleteWithoutCategory={handleDeleteCategoryWithoutCategory}
        onDeleteWithProducts={handleDeleteCategoryWithProducts}
      />
    </div>
  );
};

export default Menu;

