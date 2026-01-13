import { useState, useMemo, useEffect, useCallback } from "react";
import { productsAPI } from "../api/productsApi";
import { Product, ProductFormData, Category } from "../types/menu";

export const useProducts = (categories: Category[]) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (err) {
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  }, []);

  const enrichedProducts = useMemo(() => {
    return products.map((product) => {
      const category = categories.find((cat) => cat.id === product.categoryId);
      return {
        ...product,
        categoryName: category
          ? category.name
          : product.categoryName || "Sin Categoría",
      };
    });
  }, [products, categories]);

  const saveProduct = async (formData: ProductFormData, product?: Product) => {
    try {
      setLoading(true);
      let resultProduct;

      if (product) {
        resultProduct = await productsAPI.update(product.id, formData);

        const productId = product.id;

        const nuevosComps = formData.complementos.filter((c) => !c.id);
        const nuevosIngs = formData.ingredientes.filter((i) => !i.id);

        if (nuevosComps.length > 0 || nuevosIngs.length > 0) {
          await productsAPI.addOptions(productId, {
            complementosProducto: nuevosComps.map((c) => ({
              nombre: c.nombre,
              precio: c.precio,
            })),
            exclusionesProducto: nuevosIngs.map((i) => ({ nombre: i.nombre })),
          });
        }

        const compsEliminados = product.complementos.filter(
          (oldC) =>
            !formData.complementos.find(
              (newC) => String(newC.id) === String(oldC.id)
            )
        );
        const ingsEliminados = product.ingredientes.filter(
          (oldI) =>
            !formData.ingredientes.find(
              (newI) => String(newI.id) === String(oldI.id)
            )
        );

        for (const c of compsEliminados)
          await productsAPI.deleteOption(productId, String(c.id));
        for (const i of ingsEliminados)
          await productsAPI.deleteOption(productId, String(i.id));

        const compsEditados = formData.complementos.filter((c) => c.id);
        for (const c of compsEditados) {
          if (c.id) {
            await productsAPI.updateComplement(productId, c.id, {
              nombre: c.nombre,
              precio: c.precio,
            });
          }
        }

        const ingsEditados = formData.ingredientes.filter((i) => i.id);
        for (const i of ingsEditados) {
          if (i.id) {
            await productsAPI.updateIngredient(productId, i.id, {
              nombre: i.nombre,
            });
          }
        }
      } else {
        resultProduct = await productsAPI.create(formData);
      }

      await loadProducts();
      return resultProduct;
    } catch (err) {
      setError("Error al guardar el producto y sus opciones");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await productsAPI.delete(id);
      await loadProducts();
    } catch (err) {
      setError("No se pudo eliminar el producto");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let data = [...enrichedProducts];

    if (categoryId) {
      data = data.filter((p) => p.categoryId === categoryId);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    return data;
  }, [enrichedProducts, search, categoryId]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page, itemsPerPage]);

  return {
    products: paginatedProducts,
    rawProducts: enrichedProducts,
    allProductsCount: filteredProducts.length,
    loading,
    error,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    page,
    setPage,
    totalPages,
    loadProducts,
    saveProduct,
    deleteProduct,
    setProducts,
  };
};
