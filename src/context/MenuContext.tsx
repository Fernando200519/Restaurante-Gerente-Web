import React, { createContext, useContext } from "react";
import { Category, Product } from "../types/menu";

interface MenuContextState {
  activeTab: "categories" | "products";
  setActiveTab: (tab: "categories" | "products") => void;

  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;

  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;

  loading: boolean;
  error: string | null;
}

export const MenuContext = createContext<MenuContextState | null>(null);

export const useMenuContext = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenuContext must be used inside MenuProvider");
  return ctx;
};
