import { apiClient } from "./config";
import type { Product, ProductFormData } from "../types/menu";

const mapAPIResponseToProduct = (item: any): Product => {
  const categoryId = String(item.categoryId || item.CategoriaId || "3");

  return {
    id: String(item.id || item.Id || ""),
    name: item.nombre || item.Nombre || "",
    description: item.descripcion || item.Descripcion || undefined,
    price: Number(item.precio || item.Precio || 0),
    categoryId,
    categoryName: item.categoryName || item.categoriaNombre || undefined,
    status:
      String(item.estado || "activo").toLowerCase() === "activo"
        ? "activo"
        : "inactivo",
    imageUrl: item.imagen || undefined,
    type: item.tipo || "Alimentos",
    complementos: (item.complementos || []).map((c: any) => ({
      id: String(c.id),
      nombre: c.nombre || "",
      precio: Number(c.precio || 0),
    })),
    ingredientes: (item.ingredientesOpcionales || []).map((i: any) => ({
      id: String(i.id),
      nombre: i.nombre || "",
    })),
  };
};

export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<any[]>("/products");
    return data.map(mapAPIResponseToProduct);
  },

  create: async (formData: ProductFormData): Promise<Product> => {
    const fd = new FormData();
    fd.append("Nombre", formData.name);
    fd.append("Descripcion", formData.description || "");
    fd.append("CategoriaId", formData.categoryId);
    fd.append("Precio", String(formData.price));
    fd.append("Estado", formData.status === "activo" ? "Activo" : "Inactivo");
    fd.append("Tipo", formData.type);

    fd.append(
      "PrecioIncluyeImpuestos",
      String(formData.precioIncluyeImpuestos)
    );

    const ivaValue = formData.precioIncluyeImpuestos ? "Tasa16" : "Exento";
    fd.append("TipoIva", ivaValue);

    fd.append(
      "ComplementosProducto",
      JSON.stringify(
        formData.complementos.map((c) => ({
          Nombre: c.nombre,
          Precio: c.precio,
        }))
      )
    );
    fd.append(
      "ExclusionesProducto",
      JSON.stringify(
        formData.ingredientes.map((i) => ({
          Nombre: i.nombre,
        }))
      )
    );

    if (formData.imageFile) fd.append("FormFile", formData.imageFile);
    console.log("🚀 Enviando FormData:");
    fd.forEach((value, key) => console.log(`${key}:`, value));

    const { data } = await apiClient.post("/products", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return mapAPIResponseToProduct(data);
  },

  update: async (id: string, formData: ProductFormData): Promise<Product> => {
    const fd = new FormData();

    const safeCategoryId = formData.categoryId.match(/^\d+$/)
      ? formData.categoryId
      : "3";

    const cambiarImgValue = formData.imageFile
      ? "true"
      : formData.removeImage
      ? "true"
      : "false";
    fd.append("CambiarImagen", cambiarImgValue);

    fd.append("Nombre", formData.name || "Sin Nombre");
    fd.append("Precio", String(formData.price || 0));
    fd.append("CategoriaId", safeCategoryId);
    fd.append("Descripcion", formData.description || "");
    fd.append("Estado", formData.status === "activo" ? "Activo" : "Inactivo");

    if (formData.imageFile) {
      fd.append("FormFile", formData.imageFile);
    }

    console.group(`🚀 Intentando PATCH Producto ID: ${id}`);
    fd.forEach((value, key) => {
      console.log(`${key}:`, value === "" ? "(vacío)" : value);
    });
    console.groupEnd();

    try {
      const { data } = await apiClient.patch(`/products/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return mapAPIResponseToProduct(data);
    } catch (error: any) {
      if (error.response) {
        console.error(
          "❌ Detalle del Error 500 del Servidor:",
          error.response.data
        );
      }
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  addOptions: async (productId: string, options: any) =>
    apiClient.post(`/products/${productId}/options`, options),

  updateComplement: async (
    productId: string,
    complementId: string,
    data: any
  ) =>
    apiClient.patch(
      `/products/${productId}/options/complements/${complementId}`,
      data
    ),

  updateIngredient: async (
    productId: string,
    ingredientId: string,
    data: any
  ) =>
    apiClient.patch(
      `/products/${productId}/options/ingredients/${ingredientId}`,
      data
    ),

  deleteOption: async (productId: string, optionId: string) =>
    apiClient.delete(`/products/${productId}/options/${optionId}`),
};
