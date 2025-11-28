import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import BaseModal from '../ui/BaseModal';
import type { Product, ProductFormData, ProductStatus, Category } from '../../types/menu/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSave: (data: ProductFormData) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, categories, onSave }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    status: 'activo',
    imageFile: undefined,
    removeImage: false,
  });

  const [errors, setErrors] = useState<{ name?: string; price?: string; categoryId?: string; imageFile?: string }>({});

  useEffect(() => {
    if (product && isOpen) {
      console.log('ProductModal: Cargando producto:', product);
      console.log('ProductModal: categoryId del producto:', product.categoryId);
      console.log('ProductModal: Categorías disponibles:', categories);
      console.log('ProductModal: Categorías activas:', categories.filter((cat) => cat.status === 'activo'));
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        categoryId: product.categoryId || '',
        status: product.status,
        imageFile: undefined,
        removeImage: false,
      });
      // Si el producto tiene imagen en el servidor, preparar vista previa
      setPreviewUrl(product.imageUrl || null);
      setErrors({});
    } else if (isOpen) {
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: '', // Dejar vacío para que el usuario seleccione una categoría
        status: 'activo',
        imageFile: undefined,
        removeImage: false,
      });
      setPreviewUrl(null);
      setErrors({});
    }
  }, [product, isOpen, categories]);

  // Efecto para forzar estado inactivo si la categoría está inactiva
  useEffect(() => {
    if (formData.categoryId) {
      const selectedCategory = categories.find((cat) => cat.id === formData.categoryId);
      if (selectedCategory && selectedCategory.status === 'inactivo' && formData.status === 'activo') {
        // Si la categoría está inactiva y el producto está activo, forzar a inactivo
        setFormData((prev) => ({ ...prev, status: 'inactivo' }));
      }
    }
  }, [formData.categoryId, formData.status, categories]);

  const handleChange = (field: keyof ProductFormData, value: string | number | File | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; price?: string; categoryId?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio';
    }
    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Debe seleccionar una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    // Limpiar preview URL antes de cerrar
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: categories.length > 0 ? categories[0].id : '',
      status: 'activo',
      imageFile: undefined,
      removeImage: false,
    });
    setErrors({});
    onClose();
  };

  // Upload UI state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onFileSelected = async (file?: File) => {
    if (!file) return;
    // Aceptar solo imágenes
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, imageFile: 'Solo se permiten imágenes' }));
      return;
    }
    // Comprimir la imagen en cliente a ~500KB máx
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        initialQuality: 0.7,
      } as any;
      console.log('[ProductModal] Archivo original:', {
        nombre: file.name,
        tipo: file.type,
        tamañoKB: Math.round(file.size / 1024),
      });
      const compressedFile = await imageCompression(file, options);
      console.log('[ProductModal] Archivo comprimido:', {
        nombre: compressedFile.name,
        tipo: compressedFile.type,
        tamañoKB: Math.round(compressedFile.size / 1024),
        ratio: (compressedFile.size / file.size).toFixed(2),
      });
      // Limpiar error previo
      setErrors((prev) => ({ ...prev, imageFile: undefined }));
      handleChange('imageFile', compressedFile);
      // Al seleccionar nueva imagen, cancelar removeImage si estaba activo
      setFormData((prev) => ({ ...prev, removeImage: false }));
      // Crear vista previa con el archivo comprimido
      const url = URL.createObjectURL(compressedFile);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Error al comprimir imagen:', err);
      // En caso de fallo, usar el archivo original pero avisar si supera límite grande
      if (file.size > MAX_SIZE_BYTES) {
        setErrors((prev) => ({ ...prev, imageFile: 'La imagen fue subida sin compresión y supera 5MB. Intente otra imagen.' }));
      }
      console.log('[ProductModal] Usando archivo original (sin compresión):', {
        nombre: file.name,
        tipo: file.type,
        tamañoKB: Math.round(file.size / 1024),
      });
      handleChange('imageFile', file);
      // Al seleccionar nueva imagen, cancelar removeImage si estaba activo
      setFormData((prev) => ({ ...prev, removeImage: false }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    handleChange('imageFile', undefined);
    // Marcar que se debe eliminar la imagen del servidor
    setFormData((prev) => ({ ...prev, removeImage: true }));
    // Resetear el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  useEffect(() => {
    // Limpiar URL de preview al cerrar o cambiar archivo
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={product ? 'Editar producto' : 'Nuevo producto'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ingrese el nombre del producto"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Ingrese una descripción del producto (opcional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione una categoría</option>
              {categories
                .filter((category) => {
                  // Mostrar categorías activas siempre
                  if (category.status === 'activo') return true;
                  // Si el producto ya tiene esta categoría seleccionada, mostrarla aunque esté inactiva (para edición)
                  if (formData.categoryId && category.id === formData.categoryId) return true;
                  return false;
                })
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} {category.status === 'inactivo' ? '(Inactiva)' : ''}
                  </option>
                ))}
            </select>
            {categories.filter((cat) => cat.status === 'activo').length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                No hay categorías activas disponibles. Por favor, active una categoría primero.
              </p>
            )}
            {formData.categoryId && categories.find((cat) => cat.id === formData.categoryId)?.status === 'inactivo' && !product && (
              <p className="mt-1 text-sm text-red-500">
                No se pueden agregar productos a categorías inactivas. Por favor, active la categoría primero.
              </p>
            )}
            {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
              Precio <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="price"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Imagen del producto (opcional)
          </label>
          
          {!formData.imageFile && !previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? 'border-primary bg-amber-50' : 'border-gray-300'}`}
            >
              <p className="text-sm text-gray-600">Arrastra una imagen aquí</p>
              <p className="text-sm text-gray-400 my-1">o</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Elegir archivo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFileSelected(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div className="relative border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                aria-label="Eliminar imagen"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="text-sm text-gray-700 mb-3 font-medium">
                {formData.imageFile ? (
                  <>Seleccionado: {formData.imageFile.name}</>
                ) : (
                  <>Imagen actual</>
                )}
              </div>
              {previewUrl && (
                <img src={previewUrl} alt="Vista previa" className="mx-auto max-h-48 rounded border" />
              )}
            </div>
          )}
          
          {errors.imageFile && (
            <p className="mt-2 text-sm text-red-500">{errors.imageFile}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
            Estado
          </label>
          {(() => {
            // Verificar si la categoría seleccionada está inactiva
            const selectedCategory = categories.find((cat) => cat.id === formData.categoryId);
            const isCategoryInactive = selectedCategory && selectedCategory.status === 'inactivo';
            
            return (
              <>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => {
                    // Si la categoría está inactiva, no permitir cambiar a activo
                    if (isCategoryInactive && e.target.value === 'activo') {
                      return; // No hacer nada si intenta cambiar a activo
                    }
                    handleChange('status', e.target.value as ProductStatus);
                  }}
                  disabled={isCategoryInactive}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    isCategoryInactive ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
                {isCategoryInactive && (
                  <p className="mt-1 text-sm text-yellow-600">
                    La categoría de este producto está inactiva. Los productos de categorías inactivas no pueden estar activos. Por favor, active la categoría primero si desea activar este producto.
                  </p>
                )}
              </>
            );
          })()}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: '#FF8108' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FA9623'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF8108'}
          >
            {product ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ProductModal;

