import { apiClient } from "@/hook/apiClient";
import { create } from "zustand";

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
  product_id: number;
  variant_id: number;
  code: string;
  product_name: string;
  variant_name: string;
  display_name: string;
  description: string;
  selling_price: string;
  cost_price: string;
  additional_price: string;
  uom_symbol: string;
  uom_name: string;
  category_name: string;
  stock_qty: string;
  status: string;
  variant_status: string;
  branch_name?: string;
  branch_id?: number;
}

interface FetchProductsParams {
  category_id?: number;
  search?: string;
  branch_id?: number;
}

interface StoreState {
  branches: Branch[];
  categories: Category[];
  products: Product[];
  loading: boolean;

  fetchBranches: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProducts: (params?: FetchProductsParams) => Promise<void>;

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

  // Fetch Branches
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

      if (result.success) {
        set({ branches: result.data });
      } else {
        console.error("Failed to fetch branches:", result.message);
      }
    } catch (err: unknown) {
      console.error("Error fetching branches:", err);
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

      if (result.success) {
        set({ categories: result.data });
      } else {
        console.error("Failed to fetch categories:", result.message);
      }
    } catch (err: unknown) {
      console.error("Error fetching categories:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Fetch Products with optional parameters
  fetchProducts: async (params: FetchProductsParams = {}) => {
    try {
      set({ loading: true });

      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-pos-products`,
        {
          method: "POST",
          data: {
            category_id: params.category_id || null,
            search: params.search || null,
            branch_id: params.branch_id || null,
          },
          tokenType: "jwt",
        }
      );

      if (result.success) {
        set({ products: result.data });
      } else {
        console.error("Failed to fetch products:", result.message);
      }
    } catch (err: unknown) {
      console.error("Error fetching products:", err);
    } finally {
      set({ loading: false });
    }
  },
}));
