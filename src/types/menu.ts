export type CategoryStatus = "activo" | "inactivo";
export type CategoryType = "Alimentos" | "Bebidas";

export type Category = {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  type: CategoryType;
  parentName?: string;
  parentId?: string | null;
};

export type CategoryFormData = {
  name: string;
  description?: string;
  status: CategoryStatus;
  type: CategoryType;
  parentId?: string | null;
};
export type ProductStatus = "activo" | "inactivo";
export type ProductType = "Alimento" | "Bebida";

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  status: ProductStatus;
  imageUrl?: string;
  type: ProductType;
  complementos: Array<{ id: string; nombre: string; precio: number }>;
  ingredientes: Array<{ id: string; nombre: string }>;
};

export type ProductFormData = {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  status: ProductStatus;
  type: ProductType;
  imageUrl?: string;
  imageFile?: File;
  removeImage?: boolean;
  complementos: Array<{ id?: string; nombre: string; precio: number }>;
  ingredientes: Array<{ id?: string; nombre: string }>;
  tipoIva: "Exento" | "Tasa0" | "Tasa16";
  precioIncluyeImpuestos: boolean;
};
