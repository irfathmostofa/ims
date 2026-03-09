import { apiClient } from "@/hook/apiClient";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Types
export interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: "A" | "I";
  company_id?: number;
  type?: string;
  created_at?: string;
}

export interface Customer {
  id: number;
  code?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type?: "CUSTOMER" | "SUPPLIER";
  credit_limit?: number;
  loyalty_points?: number;
  status?: "A" | "I";
  created_at?: string;
}

export interface Category {
  id: number;
  code?: string;
  name: string;
  slug?: string;
  parent_id?: number | null;
  children?: Category[];
  image?: string;
  status?: "A" | "I";
  created_at?: string;
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
  category_id?: number;
  stock_qty: string;
  status: string;
  variant_status: string;
  branch_name?: string;
  branch_id?: number;
  sku?: string;
  weight?: number;
  weight_unit?: string;
  images?: Array<{ url: string; is_primary: boolean }>;
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

interface FetchProductsParams {
  category_id?: number | null;
  search?: string | null;
  branch_id?: number | null;
  limit?: number;
  offset?: number;
  status?: "A" | "I" | null;
}

interface FetchPartyParams {
  type?: "CUSTOMER" | "SUPPLIER" | null;
  limit?: number | null;
  search?: string | null;
  status?: "A" | "I" | null;
  branch_id?: number | null;
}

interface StoreState {
  // Data
  branches: Branch[];
  party: Customer[]; // Renamed from Party to party (convention)
  categories: Category[];
  products: Product[];

  // UI State
  loading: boolean;
  error: string | null;
  activeBranch: Branch | null;

  // Pagination/Search state (optional)
  productTotalCount?: number;
  partyTotalCount?: number;

  // Actions
  fetchBranches: () => Promise<void>;
  fetchParty: (params?: FetchPartyParams) => Promise<void>;
  fetchCategories: (params?: { parent_id?: number }) => Promise<void>;
  fetchProducts: (params?: FetchProductsParams) => Promise<void>;

  // Setters
  setBranches: (data: Branch[]) => void;
  setParty: (data: Customer[]) => void;
  setCategories: (data: Category[]) => void;
  setProducts: (data: Product[]) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  setActiveBranch: (branch: Branch | null) => void;
  switchBranch: (branchId: number | null) => void;

  // Clear functions
  clearProducts: () => void;
  clearParty: () => void;
}

export const useQuickStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      branches: [],
      party: [], // Renamed
      categories: [],
      products: [],
      loading: false,
      error: null,
      activeBranch: null,
      productTotalCount: 0,
      partyTotalCount: 0,

      // Setters
      setBranches: (data) => set({ branches: data }),
      setParty: (data) => set({ party: data }),
      setCategories: (data) => set({ categories: data }),
      setProducts: (data) => set({ products: data }),
      setLoading: (value) =>
        set({ loading: value, error: value ? null : get().error }),
      setError: (error) => set({ error }),
      setActiveBranch: (branch) => set({ activeBranch: branch }),

      // Clear functions
      clearProducts: () => set({ products: [] }),
      clearParty: () => set({ party: [] }),

      // Switch branch
      switchBranch: (branchId: number | null) => {
        const state = get();
        if (branchId === null) {
          set({ activeBranch: null });
          localStorage.removeItem("activeBranchId");
          // Clear branch-specific data when switching to "All Branches"
          state.clearProducts();
          state.clearParty();
        } else {
          const branch = state.branches.find((b) => b.id === branchId) || null;
          set({ activeBranch: branch });
          localStorage.setItem("activeBranchId", branchId.toString());
          // Clear branch-specific data to trigger refetch with new branch
          state.clearProducts();
          state.clearParty();
        }
      },

      // Fetch Branches
      fetchBranches: async () => {
        try {
          set({ loading: true, error: null });

          const result = await apiClient<ApiResponse<Branch[]>>(
            `${import.meta.env.VITE_SERVER}/setup/get-branches`,
            {
              method: "GET",
              tokenType: "jwt",
            },
          );

          if (result.success && Array.isArray(result.data)) {
            set({ branches: result.data });

            // Try to get active branch from localStorage
            const savedBranchId = localStorage.getItem("activeBranchId");
            if (
              savedBranchId &&
              savedBranchId !== "null" &&
              result.data.length > 0
            ) {
              const savedBranch = result.data.find(
                (b) => b.id === parseInt(savedBranchId),
              );
              if (savedBranch) {
                set({ activeBranch: savedBranch });
              } else if (result.data.length > 0) {
                // If saved branch not found, set first as active
                set({ activeBranch: result.data[0] });
                localStorage.setItem(
                  "activeBranchId",
                  result.data[0].id.toString(),
                );
              }
            } else if (result.data.length > 0) {
              // If no saved branch, set first one as active
              set({ activeBranch: result.data[0] });
              localStorage.setItem(
                "activeBranchId",
                result.data[0].id.toString(),
              );
            }
          } else {
            const errorMsg = result.message || "Failed to fetch branches";
            console.error("Failed to fetch branches:", errorMsg);
            set({ error: errorMsg });
          }
        } catch (err: unknown) {
          const errorMsg =
            err instanceof Error ? err.message : "Error fetching branches";
          console.error("Error fetching branches:", err);
          set({ error: errorMsg });
        } finally {
          set({ loading: false });
        }
      },

      // Fetch Categories
      fetchCategories: async (params = {}) => {
        try {
          set({ loading: true, error: null });

          const result = await apiClient<ApiResponse<Category[]>>(
            `${import.meta.env.VITE_SERVER}/product/get-product-cat`,
            {
              method: "POST", // Changed to POST to support params
              tokenType: "jwt",
              data: {
                parent_id: params.parent_id || null,
              },
            },
          );

          if (result.success && Array.isArray(result.data)) {
            set({ categories: result.data });
          } else {
            const errorMsg = result.message || "Failed to fetch categories";
            console.error("Failed to fetch categories:", errorMsg);
            set({ error: errorMsg });
          }
        } catch (err: unknown) {
          const errorMsg =
            err instanceof Error ? err.message : "Error fetching categories";
          console.error("Error fetching categories:", err);
          set({ error: errorMsg });
        } finally {
          set({ loading: false });
        }
      },

      // Fetch Party - Fixed with search parameter
      fetchParty: async (params: FetchPartyParams = {}) => {
        try {
          set({ loading: true, error: null });

          const result = await apiClient<ApiResponse<Customer[]>>(
            `${import.meta.env.VITE_SERVER}/party/get-party`,
            {
              method: "POST",
              tokenType: "jwt",
              data: {
                type: params.type || null,
                limit: params.limit || null,
                search: params.search || null, // Fixed: Added search parameter
                status: params.status || null,
                branch_id: params.branch_id || get().activeBranch?.id || null, // Use active branch if not specified
              },
            },
          );

          if (result.success && Array.isArray(result.data)) {
            set({ party: result.data });
            // If your API returns total count, set it here
            // set({ partyTotalCount: result.totalCount });
          } else {
            const errorMsg = result.message || "Failed to fetch party";
            console.error("Failed to fetch party:", errorMsg);
            set({ error: errorMsg });
          }
        } catch (err: unknown) {
          const errorMsg =
            err instanceof Error ? err.message : "Error fetching party";
          console.error("Error fetching party:", err);
          set({ error: errorMsg });
        } finally {
          set({ loading: false });
        }
      },

      // Fetch Products with optional parameters
      fetchProducts: async (params: FetchProductsParams = {}) => {
        try {
          set({ loading: true, error: null });

          const result = await apiClient<ApiResponse<Product[]>>(
            `${import.meta.env.VITE_SERVER}/product/get-pos-products`,
            {
              method: "POST",
              data: {
                category_id: params.category_id || null,
                search: params.search || null,
                branch_id: params.branch_id || get().activeBranch?.id || null, // Use active branch if not specified
                limit: params.limit || null,
                offset: params.offset || null,
                status: params.status || null,
              },
              tokenType: "jwt",
            },
          );

          if (result.success && Array.isArray(result.data)) {
            set({ products: result.data });
            // If your API returns total count, set it here
            // set({ productTotalCount: result.totalCount });
          } else {
            const errorMsg = result.message || "Failed to fetch products";
            console.error("Failed to fetch products:", errorMsg);
            set({ error: errorMsg });
          }
        } catch (err: unknown) {
          const errorMsg =
            err instanceof Error ? err.message : "Error fetching products";
          console.error("Error fetching products:", err);
          set({ error: errorMsg });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "quick-store", // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        branches: state.branches,
        activeBranch: state.activeBranch,
        // Don't persist products, party, categories as they should be fresh
      }),
    },
  ),
);
