import { apiClient } from './config';
import type { Product, ProductFormData } from '../types/menu/types';

// Tipos para la API (formato que espera el backend)
// Nota: El backend documenta un posible campo formFile y suele esperar multipart/form-data
// Usaremos FormData para crear/actualizar productos, incluyendo opcionalmente una imagen.

interface UpdateProductRequest {
  nombre?: string;
  descripcion?: string;
  categoriaId?: number;
  precio?: number;
  estado?: string; // El backend espera "Activo" o "Inactivo" (string), no estadoId
}

interface ProductResponse {
  id: number | string;
  nombre: string;
  descripcion?: string | null;
  tipo?: string | null; // Campo adicional que devuelve la API
  categoryId?: number; // La API devuelve 'categoryId' no 'categoriaId'
  category?: string | null; // Puede venir el nombre de la categoría
  stateId?: number; // La API devuelve 'stateId' no 'estadoId'
  state?: string | null; // Puede venir el nombre del estado
  estado?: string | null; // La API también devuelve 'estado' como string ("Activo"/"Inactivo")
  precio?: number; // Puede no venir en la respuesta inicial
  imagenUrl?: string | null;
}

interface ProductFormDataResponse {
  categoriasProducto: Array<{ id: number; nombre: string }>;
  estadosProducto: Array<{ id: number; nombre: string }>;
}

// Mapeo de estados del frontend al formato del backend (string)
const mapStatusToEstado = (status: Product['status']): string => {
  const statusMap: Record<Product['status'], string> = {
    activo: 'Activo',      // El backend espera "Activo" con mayúscula inicial
    inactivo: 'Inactivo',  // El backend espera "Inactivo" con mayúscula inicial
  };
  return statusMap[status] || 'Activo'; // Por defecto "Activo"
};

// Mapeo de IDs de la API a estados del frontend
const mapEstadoIdToStatus = (stateId?: number, stateNombre?: string): Product['status'] => {
  // Si tenemos el nombre del estado, usarlo
  if (stateNombre) {
    const nombreLower = stateNombre.toLowerCase();
    if (nombreLower.includes('activo') && !nombreLower.includes('inactivo')) return 'activo';
    if (nombreLower.includes('inactivo')) return 'inactivo';
  }
  
  // Si no, usar el ID (la API usa stateId)
  if (stateId === 1) return 'activo';
  if (stateId === 2) return 'inactivo';
  
  // Por defecto
  return 'activo';
};

// Función para mapear ProductFormData al formato de la API
const buildMultipartPayload = (formData: ProductFormData, categoryIdAsNumber: number): FormData => {
  const fd = new FormData();
  fd.append('nombre', formData.name);
  // Si descripción está vacía, enviar string vacío para evitar nulls problemáticos
  fd.append('descripcion', formData.description ? formData.description : '');
  fd.append('categoriaId', String(categoryIdAsNumber));
  fd.append('precio', String(formData.price));
  fd.append('estado', mapStatusToEstado(formData.status));
  if (formData.imageFile) {
    fd.append('formFile', formData.imageFile);
  }
  // Si tenemos una URL de imagen, no podemos adjuntar archivo desde URL directamente.
  // El backend muestra 'formFile' como binario; se adjuntará solo si el cliente provee un File.
  // Aquí omitimos 'formFile' a menos que en el futuro el UI permita subir archivos.
  return fd;
};

// Función para mapear la respuesta de la API a Product
const mapAPIResponseToProduct = (
  product: ProductResponse,
  categories: Array<{ id: string; name: string }>,
  fallbackPrice?: number,
  fallbackStatus?: Product['status'] // Agregar fallback para el estado
): Product => {
  // Buscar el nombre de la categoría
  let categoryName: string | undefined;
  if (product.category) {
    categoryName = product.category;
  } else if (product.categoryId) {
    const category = categories.find((cat) => String(cat.id) === String(product.categoryId));
    categoryName = category?.name;
  }

  // Si la API no devuelve el precio, usar el fallback (precio enviado)
  const price = product.precio !== undefined && product.precio !== null ? product.precio : (fallbackPrice || 0);

  // Mapear el estado: priorizar 'estado' (string), luego 'state', luego 'stateId', finalmente fallback
  let status: Product['status'];
  if (product.estado) {
    // El backend devuelve "estado" como string ("Activo"/"Inactivo")
    const estadoLower = product.estado.toLowerCase();
    if (estadoLower.includes('inactivo')) {
      status = 'inactivo';
    } else if (estadoLower.includes('activo')) {
      status = 'activo';
    } else {
      status = fallbackStatus || 'activo';
    }
  } else if (product.stateId || product.state) {
    // Si no hay 'estado', usar 'stateId' o 'state' como fallback
    status = mapEstadoIdToStatus(product.stateId, product.state || undefined);
  } else {
    // Si no hay estado en la respuesta, usar el fallback (estado enviado)
    status = fallbackStatus || 'activo';
  }

  // Resolver campo de imagen con tolerancia a distintos nombres que pueda devolver el backend
  const possibleImage =
    (product as any).imagen ||
    (product as any).imageUrl ||
    product.imagenUrl ||
    (product as any).imagenURL ||
    (product as any).urlImagen ||
    (product as any).image_path ||
    (product as any).image ||
    (product as any).fotoUrl ||
    (product as any).foto ||
    (product as any).imagenPath ||
    undefined;

  return {
    id: String(product.id),
    name: product.nombre,
    description: product.descripcion || undefined,
    price: price,
    categoryId: product.categoryId ? String(product.categoryId) : '',
    categoryName: categoryName,
    status: status,
    imageUrl: possibleImage || undefined,
  };
};

// Servicios de API para productos
export const productsAPI = {
  // Obtener todos los productos
  getAll: async (categories: Array<{ id: string; name: string }>): Promise<Product[]> => {
    try {
      const response = await apiClient.get<ProductResponse[]>('/products');
      console.log('Respuesta completa de GET /products:', JSON.stringify(response.data, null, 2));
      return response.data.map((product) => mapAPIResponseToProduct(product, categories));
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  // Obtener datos del formulario (categorías y estados disponibles)
  getFormData: async (): Promise<ProductFormDataResponse> => {
    try {
      const response = await apiClient.get<ProductFormDataResponse>('/products/form-data');
      console.log('Datos del formulario:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos del formulario:', error);
      throw error;
    }
  },

  // Crear un nuevo producto
  create: async (formData: ProductFormData, categories: Array<{ id: string; name: string }>): Promise<Product> => {
    try {
      // Convertir categoryId de string a number
      const categoryIdAsNumber = parseInt(formData.categoryId, 10);
      if (isNaN(categoryIdAsNumber)) {
        throw new Error('ID de categoría inválido');
      }

      const multipart = buildMultipartPayload(formData, categoryIdAsNumber);
      console.log('Enviando a POST /products (multipart):', {
        nombre: formData.name,
        descripcion: formData.description || '',
        categoriaId: categoryIdAsNumber,
        precio: formData.price,
        estado: mapStatusToEstado(formData.status),
      });
      console.log('Precio enviado:', formData.price);
      
      const response = await apiClient.post<ProductResponse>('/products', multipart, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Respuesta completa de la API al crear:', JSON.stringify(response.data, null, 2));
      console.log('Precio en respuesta:', response.data.precio);
      
      // Si la API no devuelve el precio o el estado, usar los que enviamos como fallback
      const mappedProduct = mapAPIResponseToProduct(response.data, categories, formData.price, formData.status);
      console.log('Producto mapeado (usando fallback si es necesario):', mappedProduct);
      return mappedProduct;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  // Actualizar un producto
  update: async (
    id: string,
    formData: ProductFormData,
    categories: Array<{ id: string; name: string }>
  ): Promise<Product> => {
    try {
      // Convertir categoryId de string a number (si está vacío, no enviar categoriaId)
      let categoryIdAsNumber: number | undefined;
      if (formData.categoryId && formData.categoryId.trim() !== '') {
        categoryIdAsNumber = parseInt(formData.categoryId, 10);
        if (isNaN(categoryIdAsNumber)) {
          throw new Error('ID de categoría inválido');
        }
      }

      const fd = new FormData();
      fd.append('nombre', formData.name);
      fd.append('descripcion', formData.description ? formData.description : '');
      if (categoryIdAsNumber !== undefined) {
        fd.append('categoriaId', String(categoryIdAsNumber));
      }
      fd.append('precio', String(formData.price));
      fd.append('estado', mapStatusToEstado(formData.status));
      if (formData.imageFile) {
        fd.append('formFile', formData.imageFile);
      } else if (formData.removeImage) {
        // Si no hay nuevo archivo pero se marcó eliminar, enviar un campo para indicarlo
        fd.append('removeImage', 'true');
      }

      console.log('Enviando a PATCH /products/' + id + ' (multipart)');
      console.log('Precio enviado:', formData.price);
      const response = await apiClient.patch<ProductResponse>(`/products/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Respuesta completa de la API al actualizar:', JSON.stringify(response.data, null, 2));
      console.log('Precio en respuesta:', response.data.precio);
      
      // Si la respuesta está vacía o no tiene todos los datos, construir una respuesta completa
      // usando los datos enviados
      if (!response.data || Object.keys(response.data).length === 0) {
        console.log('La respuesta está vacía, construyendo producto desde los datos enviados');
        const productId = parseInt(id, 10);
        const fallbackProduct: ProductResponse = {
          id: isNaN(productId) ? id : productId,
          nombre: formData.name,
          descripcion: formData.description || null,
          categoriaId: categoryIdAsNumber,
          precio: formData.price,
          // El estado se mapea desde formData.status usando mapStatusToEstado
          // pero como ProductResponse no tiene estado, lo manejamos en el mapeo
        };
        return mapAPIResponseToProduct(fallbackProduct, categories, formData.price, formData.status);
      }
      
      // Si la API no devuelve el precio o el estado, usar los que enviamos como fallback
      return mapAPIResponseToProduct(response.data, categories, formData.price, formData.status);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },

  // Eliminar un producto
  delete: async (id: string): Promise<void> => {
    try {
      // Convertir el ID a número (int) como espera el backend
      const productId = parseInt(id, 10);
      if (isNaN(productId)) {
        throw new Error(`ID de producto inválido: ${id}`);
      }

      // La ruta es /products/{id}
      const endpoint = `/products/${productId}`;
      console.log('Intentando eliminar producto con ID:', productId, '(tipo: number)');
      console.log('Endpoint:', endpoint);
      console.log('URL completa:', `${apiClient.defaults.baseURL}${endpoint}`);

      await apiClient.delete(endpoint);
      console.log('Producto eliminado exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar producto:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Request URL:', error.config?.url);
      }
      throw error;
    }
  },
};

