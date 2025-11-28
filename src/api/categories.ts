import { apiClient } from './config';
import type { Category, CategoryFormData } from '../types/menu/types';

// Tipos para la API (formato que espera el backend)
interface CreateCategoryRequest {
  nombre: string;
  descripcion?: string;
  estado: string;
}

interface UpdateCategoryRequest {
  nombre?: string;
  descripcion?: string | null; // permitir null para backend
  estado?: string;
}

interface CategoryResponse {
  id: number | string;
  nombre: string;
  descripcion?: string | null;
  estado?: string | null | number; // Puede ser string, null, undefined, o número
  activa?: boolean; // La API puede devolver 'activa' como booleano en lugar de 'estado'
}

// Función para mapear el status del frontend al estado del backend
const mapStatusToEstado = (status: Category['status']): string => {
  // El backend espera "Activa" o "Inactiva" (femenino, con mayúscula inicial)
  const statusMap: Record<Category['status'], string> = {
    activo: 'Activa',
    inactivo: 'Inactiva',
  };
  return statusMap[status] || 'Activa';
};

// Función para mapear CategoryFormData al formato de la API
const mapFormDataToAPI = (formData: CategoryFormData): CreateCategoryRequest => {
  const requestData = {
    nombre: formData.name,
    descripcion: formData.description || undefined,
    estado: mapStatusToEstado(formData.status), // Mapear a "Activa" o "Inactiva"
  };
  console.log('Datos enviados a la API:', requestData);
  return requestData;
};

// Función para mapear el estado de la API al formato del frontend
const mapEstadoToStatus = (estado?: string | null | number): Category['status'] => {
  // Si es null, undefined, o vacío, devolver 'activo' por defecto
  if (!estado && estado !== 0) return 'activo';
  
  // Convertir a string si es un número u otro tipo
  const estadoStr = String(estado).toLowerCase().trim();
  
  // El backend devuelve "Activa" o "Inactiva" (femenino)
  // Verificar primero 'inactiva' para evitar que se convierta en 'activo' por defecto
  if (estadoStr === 'inactiva' || estadoStr === 'inactivo' || estadoStr === 'inactive' || estadoStr === 'false' || estadoStr === '0') return 'inactivo';
  if (estadoStr === 'activa' || estadoStr === 'activo' || estadoStr === 'active' || estadoStr === 'true' || estadoStr === '1') return 'activo';
  
  // Si no coincide con ninguno, devolver 'activo' por defecto
  return 'activo';
};

// Función para mapear la respuesta de la API a Category
const mapAPIResponseToCategory = (category: CategoryResponse, fallbackStatus?: Category['status']): Category => {
  // La API puede devolver 'activa' (booleano) o 'estado' (string)
  // Priorizar 'activa' si existe, luego 'estado', y finalmente el fallback
  // Incluir null porque category.estado puede ser null; no incluir boolean
  let estadoToMap: string | number | null | undefined;
  
  if (category.activa !== undefined) {
    // Si viene 'activa' como booleano, convertir a string
    estadoToMap = category.activa ? 'activo' : 'inactivo';
    console.log('API devolvió "activa" (booleano):', category.activa, '-> Convertido a:', estadoToMap);
  } else if (category.estado !== undefined) {
    estadoToMap = category.estado;
    console.log('API devolvió "estado" (string):', category.estado);
  } else if (fallbackStatus) {
    estadoToMap = fallbackStatus;
    console.log('Usando fallbackStatus:', fallbackStatus);
  } else {
    estadoToMap = 'activo'; // Por defecto
    console.log('Usando valor por defecto: activo');
  }
  
  const mappedStatus = mapEstadoToStatus(estadoToMap);
  console.log('Estado final mapeado:', mappedStatus);
  
  return {
    id: String(category.id), // Convertir a string si viene como número
    name: category.nombre,
    description: category.descripcion || undefined,
    status: mappedStatus, // Mapear estado correctamente
  };
};

// Servicios de API para categorías
export const categoriesAPI = {
  // Obtener todas las categorías
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<CategoryResponse[]>('/categories');
      console.log('Respuesta completa de GET /categories:', JSON.stringify(response.data, null, 2));
      if (response.data.length > 0) {
        console.log('Primera categoría recibida:', response.data[0]);
        console.log('Campos de la primera categoría:', Object.keys(response.data[0]));
      }
      // Evitar que Array.map intente pasar index como segundo argumento
      return response.data.map((cat) => mapAPIResponseToCategory(cat));
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  // Crear una nueva categoría
  create: async (formData: CategoryFormData): Promise<Category> => {
    try {
      const requestData = mapFormDataToAPI(formData);
      console.log('Enviando a POST /categories:', JSON.stringify(requestData, null, 2));
      const response = await apiClient.post<CategoryResponse>('/categories', requestData);
      console.log('Respuesta completa de la API al crear:', JSON.stringify(response.data, null, 2));
      console.log('Estado enviado:', requestData.estado);
      console.log('activa en respuesta:', response.data.activa);
      console.log('estado en respuesta:', response.data.estado);
      
      // Si la API no devuelve el estado correcto, usar el que enviamos como fallback
      // Esto es importante porque el backend puede no devolver el estado correctamente
      const mappedCategory = mapAPIResponseToCategory(response.data, formData.status);
      console.log('Categoría mapeada (usando fallback si es necesario):', mappedCategory);
      return mappedCategory;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  },

  // Actualizar una categoría
  update: async (id: string, data: CategoryFormData): Promise<Category> => {
    try {
      // Convertir el ID a número (int) como espera el backend
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        throw new Error(`ID de categoría inválido: ${id}`);
      }

      const updateData: UpdateCategoryRequest = {
        nombre: data.name,
        // Enviar descripción: si está vacía o es undefined, enviar null para que el backend la actualice
        // Si tiene valor, enviar el valor
        descripcion: data.description && data.description.trim() !== '' ? data.description.trim() : null,
        estado: mapStatusToEstado(data.status), // Mapear a "Activa" o "Inactiva"
      };

      // La ruta es /categories/{id} (ya no está duplicada)
      const endpoint = `/categories/${categoryId}`;
      console.log('Intentando actualizar categoría con ID:', categoryId, '(tipo: number)');
      console.log('Endpoint:', endpoint);
      console.log('Datos a actualizar:', JSON.stringify(updateData, null, 2));
      console.log('URL completa:', `${apiClient.defaults.baseURL}${endpoint}`);

      const response = await apiClient.patch<CategoryResponse>(endpoint, updateData);
      console.log('Respuesta de PATCH exitosa:', response.status);
      console.log('Datos de respuesta:', JSON.stringify(response.data, null, 2));
      
      // Si la respuesta está vacía o no tiene todos los datos, construir una respuesta completa
      // usando los datos enviados
      if (!response.data || Object.keys(response.data).length === 0) {
        console.log('La respuesta está vacía, construyendo categoría desde los datos enviados');
        const fallbackCategory: CategoryResponse = {
          id: categoryId,
          nombre: data.name,
          descripcion: data.description && data.description.trim() !== '' ? data.description.trim() : null,
          estado: mapStatusToEstado(data.status),
        };
        return mapAPIResponseToCategory(fallbackCategory, data.status);
      }
      
      // Si la API no devuelve el estado, usar el que enviamos como fallback
      // También asegurar que la descripción se preserve si la respuesta no la incluye
      const mappedCategory = mapAPIResponseToCategory(response.data, data.status);
      // Si la respuesta no incluye la descripción, usar la que enviamos en el formulario
      // Esto es importante porque el backend puede no devolver la descripción en el PATCH
      if (response.data.descripcion === undefined || response.data.descripcion === null) {
        // Si enviamos una descripción (no vacía), usar esa
        if (data.description && data.description.trim() !== '') {
          mappedCategory.description = data.description.trim();
        } else {
          // Si enviamos descripción vacía o no enviamos, usar undefined
          mappedCategory.description = undefined;
        }
      }
      // Si la respuesta sí incluye la descripción, el mapeo ya la usó correctamente
      return mappedCategory;
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Request URL:', error.config?.url);
      }
      throw error;
    }
  },

  // Eliminar una categoría
  delete: async (id: string): Promise<void> => {
    try {
      // Convertir el ID a número (int) como espera el backend
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        throw new Error(`ID de categoría inválido: ${id}`);
      }
      
      // La ruta es /categories/{id} (ya no está duplicada)
      const endpoint = `/categories/${categoryId}`;
      console.log('Intentando eliminar categoría con ID:', categoryId, '(tipo: number)');
      console.log('Endpoint:', endpoint);
      console.log('URL completa:', `${apiClient.defaults.baseURL}${endpoint}`);
      
      const response = await apiClient.delete(endpoint);
      console.log('Respuesta de DELETE exitosa:', response.status, response.data);
      // Algunas APIs devuelven 204 No Content, otras 200 OK
      return;
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);
      // Log más detallado del error
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Request URL:', error.config?.url);
        console.error('Request method:', error.config?.method);
      } else if (error.request) {
        console.error('Request:', error.request);
        console.error('Request URL:', error.request.responseURL);
      }
      throw error;
    }
  },

  // Eliminar una categoría y todos sus productos
  deleteWithProducts: async (id: string): Promise<void> => {
    try {
      // Convertir el ID a número (int) como espera el backend
      const categoryId = parseInt(id, 10);
      if (isNaN(categoryId)) {
        throw new Error(`ID de categoría inválido: ${id}`);
      }
      
      const endpoint = `/categories/${categoryId}/with-products`;
      console.log('Intentando eliminar categoría con productos, ID:', categoryId);
      console.log('Endpoint:', endpoint);
      console.log('URL completa:', `${apiClient.defaults.baseURL}${endpoint}`);
      
      const response = await apiClient.delete(endpoint);
      console.log('Respuesta de DELETE with-products exitosa:', response.status, response.data);
      return;
    } catch (error: any) {
      console.error('Error al eliminar categoría con productos:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Request URL:', error.config?.url);
      }
      throw error;
    }
  },
};


