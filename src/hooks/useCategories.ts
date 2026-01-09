import { useState, useEffect, useCallback } from "react";
import { categoriesAPI } from "../api/categoriesApi";
import { Category, CategoryFormData } from "../types/menu";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err) {
      setError("Error al cargar las categorías. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCategory = async (
    formData: CategoryFormData,
    category?: Category
  ) => {
    try {
      setLoading(true);
      let result;
      if (category) {
        result = await categoriesAPI.update(category.id, formData);
      } else {
        result = await categoriesAPI.create(formData);
      }
      await loadCategories();
      return result;
    } catch (err) {
      setError("No se pudo guardar la categoría.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      await categoriesAPI.delete(id);
      await loadCategories();
    } catch (err) {
      setError("Error al eliminar la categoría.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    loadCategories,
    saveCategory,
    deleteCategory,
    setCategories,
  };
};
