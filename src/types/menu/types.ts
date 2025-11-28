export type CategoryStatus = 'activo' | 'inactivo';

export type Category = {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
};

export type ProductStatus = 'activo' | 'inactivo';

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  status: ProductStatus;
  imageUrl?: string; // URL opcional si el backend la genera
};

export type CategoryFormData = {
  name: string;
  description?: string;
  status: CategoryStatus;
};

export type ProductFormData = {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  status: ProductStatus;
  imageFile?: File; // Archivo de imagen a subir (formFile)
  removeImage?: boolean; // Indica si se debe eliminar la imagen existente
};

