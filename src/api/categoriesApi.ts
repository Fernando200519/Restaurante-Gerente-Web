import { apiClient } from "./config";
import type { Category, CategoryFormData, CategoryStatus } from "../types/menu";

const fromBackendStatus = (estado: string): CategoryStatus =>
  estado.toLowerCase() === "activa" ? "activo" : "inactivo";

export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<any[]>("/categories");

    return data.map((cat) => {
      // 🎯 BUSCAMOS EL ID DEL PADRE:
      // Si 'categoriaPadre' es un nombre (ej: "Con Alcohol"), buscamos en la lista
      // qué categoría tiene ese nombre para obtener su ID real.
      const parentObj = data.find((item) => item.nombre === cat.categoriaPadre);

      return {
        id: String(cat.id),
        name: cat.nombre,
        description: cat.descripcion || undefined,
        status: cat.estado.toLowerCase() === "activa" ? "activo" : "inactivo",
        type: cat.tipo,
        parentName: cat.categoriaPadre,
        // ✅ Ahora parentId tendrá el ID vinculado (ej: "20") y no null
        parentId: parentObj ? String(parentObj.id) : null,
      };
    });
  },

  create: async (formData: CategoryFormData): Promise<Category> => {
    const body = {
      nombre: formData.name,
      descripcion: formData.description || null,
      estado: formData.status === "activo" ? "Activa" : "Inactiva",
      tipo: formData.type,
      categoriaPadreId: formData.parentId
        ? parseInt(formData.parentId, 10)
        : null,
    };
    const { data } = await apiClient.post("/categories", body);
    return {
      id: String(data.id),
      name: data.nombre,
      description: data.descripcion || undefined,
      status: fromBackendStatus(data.estado),
      type: data.tipo,
      parentId: data.categoriaPadreId ? String(data.categoriaPadreId) : null,
    };
  },

  update: async (id: string, formData: CategoryFormData): Promise<Category> => {
    const body = {
      nombre: formData.name,
      descripcion: formData.description || null,
      estado: formData.status === "activo" ? "Activa" : "Inactiva",
      categoriaPadreId: formData.parentId
        ? parseInt(formData.parentId, 10)
        : null,
    };
    const { data } = await apiClient.patch(`/categories/${id}`, body);
    return {
      id: String(data.id),
      name: data.nombre,
      description: data.descripcion || undefined,
      status: fromBackendStatus(data.estado),
      type: data.tipo,
      parentId: data.categoriaPadreId ? String(data.categoriaPadreId) : null,
    };
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  deleteWithProducts: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}/with-products`);
  },

  moveProducts: async (id: string, targetCategoryId: string): Promise<void> => {
    await apiClient.post(
      `/categories/${id}/move-products?targetCategoryID=${targetCategoryId}`
    );
    await apiClient.delete(`/categories/${id}`);
  },

  migrateToNew: async (id: string, newName: string): Promise<void> => {
    await apiClient.post(
      `/categories/${id}/migrate-products?newCategoryName=${encodeURIComponent(
        newName
      )}`
    );
  },
};
