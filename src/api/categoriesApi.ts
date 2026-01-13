import { apiClient } from "./config";
import type { Category, CategoryFormData, CategoryStatus } from "../types/menu";

const fromBackendStatus = (estado: string): CategoryStatus =>
  estado.toLowerCase() === "activa" ? "activo" : "inactivo";

export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<any[]>("/categories");

    return data.map((cat) => {
      const parentObj = data.find((item) => item.nombre === cat.categoriaPadre);

      return {
        id: String(cat.id),
        name: cat.nombre,
        description: cat.descripcion || undefined,
        status: cat.estado.toLowerCase() === "activa" ? "activo" : "inactivo",
        type: cat.tipo,
        parentName: cat.categoriaPadre,
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
    // 🎯 FIX: El backend de .NET a veces falla con PATCH si los tipos no son exactos.
    // Convertimos parentId a número estrictamente.
    const parentIdInt = formData.parentId
      ? parseInt(String(formData.parentId), 10)
      : 0;

    const body = {
      nombre: formData.name,
      descripcion: formData.description || null,
      estado: formData.status === "activo" ? "Activa" : "Inactiva",
      categoriaPadreId: parentIdInt,
    };

    console.log("📤 Enviando PATCH a categoría:", id, "Body:", body);

    try {
      const { data } = await apiClient.patch(`/categories/${id}`, body);
      return {
        id: String(data.id),
        name: data.nombre,
        description: data.descripcion || undefined,
        status: fromBackendStatus(data.estado),
        type: data.tipo,
        parentId: data.categoriaPadreId ? String(data.categoriaPadreId) : null,
      };
    } catch (error: any) {
      if (error.response?.status === 500) {
        const serverMsg = error.response.data?.message || error.response.data;
        console.error("❌ ERROR CRÍTICO DEL BACKEND:", serverMsg);
      }
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  deleteWithProducts: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}/with-products`);
  },

  moveProducts: async (id: string, targetCategoryId: string): Promise<void> => {
    console.group("🚀 Debug: Clasificación Masiva");
    console.log("Origen (id):", id);
    console.log("Destino (targetCategoryID):", targetCategoryId);
    console.groupEnd();

    try {
      await apiClient.post(
        `/categories/${id}/move-products`,
        {},
        {
          params: { targetCategoryID: targetCategoryId },
        }
      );

      if (String(id) === "3") {
        console.log(
          "✅ Productos movidos. Categoría de sistema (ID 3) conservada."
        );
        return;
      }

      console.log("🗑️ Borrando categoría origen vacía...");
      await apiClient.delete(`/categories/${id}`);
    } catch (error: any) {
      if (error.response) {
        console.error("❌ ERROR DETALLADO DEL SERVIDOR:", error.response.data);
      }
      throw error;
    }
  },

  migrateToNew: async (id: string, newName: string): Promise<void> => {
    await apiClient.post(
      `/categories/${id}/migrate-products`,
      {},
      {
        params: { newCategoryName: newName },
      }
    );
  },
};
