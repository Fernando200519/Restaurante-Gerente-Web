import { apiClient } from "./config";
import type { Employee, EmployeeFormData, Gender } from "../types/employee";

interface CreateUserRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: string;
  correo: string;
  tipo: string;
  telefono?: string;
}

interface UpdateUserRequest {
  correo?: string;
  telefono?: string;
}

interface UserResponse {
  id: number | string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  genero?: string | null;
  correo: string;
  telefono?: string | null;
  tipo?: string;
  fotoPerfil?: string | null;
}

const mapRoleToTipo = (role: Employee["role"]): string => {
  const roleMap: Record<Employee["role"], string> = {
    mesero: "Mesero",
    cocinero: "Cocina",
    cajero: "Cajero",
  };
  return roleMap[role] || "Mesero";
};

const mapGenderToGenero = (gender?: Gender): string | undefined => {
  if (!gender) return undefined;
  const genderMap: Record<Gender, string> = {
    masculino: "Masculino",
    femenino: "Femenino",
    otro: "Otro",
  };
  return genderMap[gender];
};

const cleanPhone = (phone?: string): string | undefined => {
  if (!phone) return undefined;
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length > 10) return cleaned.substring(0, 10);
  return undefined;
};

const mapFormDataToAPI = (formData: EmployeeFormData): CreateUserRequest => {
  const cleanedPhone = cleanPhone(formData.phone);

  const apellidoMaterno = formData.maternalLastName || "";
  const genero = mapGenderToGenero(formData.gender) || "Otro";

  return {
    nombre: formData.firstName,
    apellidoPaterno: formData.paternalLastName,
    apellidoMaterno: apellidoMaterno,
    genero: genero,
    correo: formData.username,
    tipo: mapRoleToTipo(formData.role),
    telefono: cleanedPhone,
  };
};

const mapTipoToRole = (tipo?: string): Employee["role"] => {
  if (!tipo) return "mesero";

  const tipoLower = tipo.toLowerCase();
  if (tipoLower.includes("mesero") || tipoLower === "mesero") return "mesero";
  if (tipoLower.includes("cocina") || tipoLower.includes("cocinero"))
    return "cocinero";
  if (tipoLower.includes("cajero") || tipoLower === "cajero") return "cajero";

  return "mesero";
};

const mapAPIResponseToEmployee = (user: UserResponse): Employee => {
  const nameParts = [
    user.nombre?.trim(),
    user.apellidoPaterno?.trim(),
    user.apellidoMaterno?.trim(),
  ].filter((part) => part && part.length > 0);

  const fullName = nameParts.length > 0 ? nameParts.join(" ") : "Sin nombre";

  return {
    id: String(user.id),
    name: fullName,
    username: user.correo || "",
    phone: user.telefono || "",
    role: mapTipoToRole(user.tipo),
    status: "activo",
    gender: (user.genero?.toLowerCase() as Employee["gender"]) || undefined,
    avatar: user.fotoPerfil || undefined,
  };
};

export const employeesAPI = {
  getAll: async (): Promise<Employee[]> => {
    try {
      const response = await apiClient.get<UserResponse[]>("/users");
      return response.data.map(mapAPIResponseToEmployee);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      throw error;
    }
  },

  create: async (formData: EmployeeFormData): Promise<Employee> => {
    try {
      const requestData = mapFormDataToAPI(formData);
      console.log(
        "Enviando a POST /users:",
        JSON.stringify(requestData, null, 2)
      );
      const response = await apiClient.post<UserResponse>(
        "/users",
        requestData
      );
      console.log(
        "Respuesta de la API:",
        JSON.stringify(response.data, null, 2)
      );
      return mapAPIResponseToEmployee(response.data);
    } catch (error: any) {
      console.error("Error al crear empleado:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },

  update: async (
    id: string,
    data: Partial<EmployeeFormData> & {
      username?: string;
      phone?: string;
      role?: Employee["role"];
    }
  ): Promise<Employee> => {
    try {
      const updateData: UpdateUserRequest = {};

      if (data.username !== undefined) {
        updateData.correo = data.username;
      }

      if (data.phone !== undefined) {
        const cleanedPhone = cleanPhone(data.phone);
        if (cleanedPhone) {
          updateData.telefono = cleanedPhone;
        } else if (data.phone === "" || data.phone.trim() === "") {
          updateData.telefono = undefined;
        }
      }

      console.log(
        "Enviando PATCH a /users/" + id + ":",
        JSON.stringify(updateData, null, 2)
      );
      const response = await apiClient.patch<UserResponse>(
        `/users/${id}`,
        updateData
      );
      console.log(
        "Respuesta de PATCH:",
        JSON.stringify(response.data, null, 2)
      );
      return mapAPIResponseToEmployee(response.data);
    } catch (error: any) {
      console.error("Error al actualizar empleado:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Request URL:", error.config?.url);
        console.error(
          "Request data:",
          JSON.stringify(error.config?.data, null, 2)
        );
      }
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      throw error;
    }
  },
};
