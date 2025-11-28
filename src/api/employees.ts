import { apiClient } from './config';
import type { Employee, EmployeeFormData, Gender } from '../types/employees/types';

// Tipos para la API (formato que espera el backend)
interface CreateUserRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string; // Requerido según el schema
  genero: string; // Requerido: "Masculino", "Femenino", "Otro"
  correo: string;
  tipo: string; // Requerido: "Mesero", "Cocina", "Cajero", "Gerente", "Administrador"
  telefono?: string; // Opcional, exactamente 10 caracteres si se proporciona
}

// El UpdateUserDTO del backend solo acepta estos campos:
interface UpdateUserRequest {
  correo?: string; // nullable: true
  telefono?: string; // nullable: true, maxLength: 10
  // NOTA: contraseña fue removida según requerimientos del usuario
}

interface UserResponse {
  id: number | string; // La API puede devolver número o string
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  genero?: string | null;
  correo: string;
  telefono?: string | null;
  tipo?: string; // Campo que devuelve la API (ej: "Mesero", "Cocinero", "Cajero")
  // Agregar otros campos que devuelva la API si los hay
}

// Función para mapear el role del frontend al tipo del backend
const mapRoleToTipo = (role: Employee['role']): string => {
  const roleMap: Record<Employee['role'], string> = {
    mesero: 'Mesero',
    cocinero: 'Cocina', // El backend usa "Cocina" no "Cocinero"
    cajero: 'Cajero',
  };
  return roleMap[role] || 'Mesero';
};

// Función para mapear el gender del frontend al genero del backend
const mapGenderToGenero = (gender?: Gender): string | undefined => {
  if (!gender) return undefined;
  const genderMap: Record<Gender, string> = {
    masculino: 'Masculino',
    femenino: 'Femenino',
    otro: 'Otro',
  };
  return genderMap[gender];
};

// Función para limpiar y validar el teléfono (debe tener exactamente 10 caracteres)
const cleanPhone = (phone?: string): string | undefined => {
  if (!phone) return undefined;
  // Remover espacios, guiones y otros caracteres
  const cleaned = phone.replace(/\D/g, '');
  // Si tiene exactamente 10 dígitos, devolverlo
  if (cleaned.length === 10) return cleaned;
  // Si tiene más de 10, tomar los primeros 10
  if (cleaned.length > 10) return cleaned.substring(0, 10);
  // Si tiene menos de 10, devolver undefined (no cumple con la validación)
  return undefined;
};

// Función para mapear EmployeeFormData al formato de la API
const mapFormDataToAPI = (formData: EmployeeFormData): CreateUserRequest => {
  const cleanedPhone = cleanPhone(formData.phone);
  
  // El backend requiere apellidoMaterno y genero, así que usamos valores por defecto si no vienen
  const apellidoMaterno = formData.maternalLastName || '';
  const genero = mapGenderToGenero(formData.gender) || 'Otro'; // Por defecto "Otro" si no se especifica
  
  return {
    nombre: formData.firstName,
    apellidoPaterno: formData.paternalLastName,
    apellidoMaterno: apellidoMaterno,
    genero: genero,
    correo: formData.username, // username ahora es el email
    tipo: mapRoleToTipo(formData.role), // Mapear role a tipo con mayúscula inicial
    telefono: cleanedPhone,
  };
};

// Función para mapear el tipo de la API al role del frontend
const mapTipoToRole = (tipo?: string): Employee['role'] => {
  if (!tipo) return 'mesero'; // Por defecto
  
  const tipoLower = tipo.toLowerCase();
  if (tipoLower.includes('mesero') || tipoLower === 'mesero') return 'mesero';
  if (tipoLower.includes('cocina') || tipoLower.includes('cocinero')) return 'cocinero'; // El backend usa "Cocina"
  if (tipoLower.includes('cajero') || tipoLower === 'cajero') return 'cajero';
  
  return 'mesero'; // Por defecto si no coincide
};

// Función para mapear la respuesta de la API a Employee
const mapAPIResponseToEmployee = (user: UserResponse): Employee => {
  // Construir el nombre completo, manejando null y valores vacíos
  const nameParts = [
    user.nombre?.trim(),
    user.apellidoPaterno?.trim(),
    user.apellidoMaterno?.trim(),
  ].filter((part) => part && part.length > 0); // Filtrar null, undefined y strings vacíos
  
  const fullName = nameParts.length > 0 ? nameParts.join(' ') : 'Sin nombre';

  return {
    id: String(user.id), // Convertir a string si viene como número
    name: fullName,
    username: user.correo || '', // El correo se guarda en username
    phone: user.telefono || '', // Mapear teléfono de la API (manejar null)
    role: mapTipoToRole(user.tipo), // Mapear tipo de la API al role
    status: 'activo', // Por defecto, ajustar según lo que devuelva la API
    gender: (user.genero as Employee['gender']) || undefined, // Mapear género de la API
  };
};

// Servicios de API para empleados
export const employeesAPI = {
  // Obtener todos los empleados
  getAll: async (): Promise<Employee[]> => {
    try {
      const response = await apiClient.get<UserResponse[]>('/users');
      return response.data.map(mapAPIResponseToEmployee);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      throw error;
    }
  },

  // Crear un nuevo empleado
  create: async (formData: EmployeeFormData): Promise<Employee> => {
    try {
      const requestData = mapFormDataToAPI(formData);
      console.log('Enviando a POST /users:', JSON.stringify(requestData, null, 2));
      const response = await apiClient.post<UserResponse>('/users', requestData);
      console.log('Respuesta de la API:', JSON.stringify(response.data, null, 2));
      return mapAPIResponseToEmployee(response.data);
    } catch (error: any) {
      console.error('Error al crear empleado:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },

  // Actualizar un empleado
  // El backend solo acepta correo y telefono en el PATCH
  update: async (
    id: string,
    data: Partial<EmployeeFormData> & { username?: string; phone?: string; role?: Employee['role'] }
  ): Promise<Employee> => {
    try {
      const updateData: UpdateUserRequest = {};
      
      // Solo enviar correo si se está actualizando
      if (data.username !== undefined) {
        updateData.correo = data.username;
      }
      
      // Solo enviar telefono si se está actualizando y es válido
      if (data.phone !== undefined) {
        const cleanedPhone = cleanPhone(data.phone);
        // Si el teléfono está vacío o no es válido, enviar null/undefined para eliminarlo
        if (cleanedPhone) {
          updateData.telefono = cleanedPhone;
        } else if (data.phone === '' || data.phone.trim() === '') {
          // Si el usuario borró el teléfono, enviar null (el backend lo acepta como nullable)
          updateData.telefono = undefined;
        }
      }

      console.log('Enviando PATCH a /users/' + id + ':', JSON.stringify(updateData, null, 2));
      const response = await apiClient.patch<UserResponse>(`/users/${id}`, updateData);
      console.log('Respuesta de PATCH:', JSON.stringify(response.data, null, 2));
      return mapAPIResponseToEmployee(response.data);
    } catch (error: any) {
      console.error('Error al actualizar empleado:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Request URL:', error.config?.url);
        console.error('Request data:', JSON.stringify(error.config?.data, null, 2));
      }
      throw error;
    }
  },

  // Eliminar un empleado
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      throw error;
    }
  },
};

