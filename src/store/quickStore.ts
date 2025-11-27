import { apiClient } from "@/hook/apiClient";
import { create } from "zustand";

// Your custom API client type
interface ApiClientOptions {
  method?: string;
  tokenType?: "jwt" | "none";
  body?: any;
}

declare const toast: { error: (msg: string) => void };

// Types
export interface Branch {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
}

interface StoreState {
  branches: Branch[];
  categories: Category[];
  products: Product[];
  loading: boolean;

  fetchBranches: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProducts: () => Promise<void>;

  setBranches: (data: Branch[]) => void;
  setCategories: (data: Category[]) => void;
  setProducts: (data: Product[]) => void;
  setLoading: (value: boolean) => void;
}

export const useQuickStore = create<StoreState>((set) => ({
  branches: [],
  categories: [],
  products: [],
  loading: false,

  // Setters
  setBranches: (data) => set({ branches: data }),
  setCategories: (data) => set({ categories: data }),
  setProducts: (data) => set({ products: data }),
  setLoading: (value) => set({ loading: value }),

  // Fetch Branches (TypeScript safe)
  fetchBranches: async () => {
    try {
      set({ loading: true });

      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/get-branches`,
        {
          method: "GET",
          tokenType: "jwt",
        }
      );

      set({ branches: result.data });
    } catch (err: unknown) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  // Fetch Categories
  fetchCategories: async () => {
    try {
      set({ loading: true });

      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/get-categories`,
        {
          method: "GET",
          tokenType: "jwt",
        }
      );

      set({ categories: result.data });
    } catch (err: unknown) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  // Fetch Products
  fetchProducts: async () => {
    try {
      set({ loading: true });

      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-pos-products`,
        {
          method: "POST",
          data: { category_id: null, search: null },
          tokenType: "jwt",
        }
      );

      set({ products: result.data });
    } catch (err: unknown) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },
}));
