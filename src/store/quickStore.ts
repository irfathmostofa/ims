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

export interface Roles {
  id: number;
  code?: string;
  name: string;
  description?: string;
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

// Enhanced API Response Types with pagination
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

interface PaginatedApiResponse<T> extends ApiResponse<T> {
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
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
  party: Customer[];
  categories: Category[];
  roles: Roles[];
  products: Product[];

  // UI State
  loading: boolean;
  error: string | null;
  activeBranch: Branch | null;
  isSwitchingBranch: boolean; // New: Track branch switching state

  // Pagination/Search state
  productTotalCount: number;
  partyTotalCount: number;
  productCurrentPage: number;
  partyCurrentPage: number;

  // Abort controllers for cleanup
  abortControllers: Map<string, AbortController>;

  // Actions
  fetchBranches: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchParty: (params?: FetchPartyParams) => Promise<void>;
  fetchCategories: (params?: { parent_id?: number }) => Promise<void>;
  fetchProducts: (params?: FetchProductsParams) => Promise<void>;

  // Setters
  setBranches: (data: Branch[]) => void;
  setParty: (data: Customer[]) => void;
  setCategories: (data: Category[]) => void;
  setRoles: (data: Roles[]) => void;
  setProducts: (data: Product[]) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  setActiveBranch: (branch: Branch | null) => void;
  setProductTotalCount: (count: number) => void;
  setPartyTotalCount: (count: number) => void;

  // Branch management
  switchBranch: (branchId: number | null) => Promise<void>;

  // Refresh functions
  refreshProducts: () => Promise<void>;
  refreshParty: () => Promise<void>;

  // Clear functions
  clearProducts: () => void;
  clearParty: () => void;
  clearAllData: () => void;

  // Cancel ongoing requests
  cancelPendingRequests: () => void;
}

export const useQuickStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      branches: [],
      party: [],
      categories: [],
      roles: [],
      products: [],
      loading: false,
      error: null,
      activeBranch: null,
      isSwitchingBranch: false,
      productTotalCount: 0,
      partyTotalCount: 0,
      productCurrentPage: 0,
      partyCurrentPage: 0,
      abortControllers: new Map(),

      // Setters
      setBranches: (data) => set({ branches: data }),
      setParty: (data) => set({ party: data }),
      setCategories: (data) => set({ categories: data }),
      setRoles: (data) => set({ roles: data }),
      setProducts: (data) => set({ products: data }),
      setLoading: (value) =>
        set({ loading: value, error: value ? null : get().error }),
      setError: (error) => set({ error }),
      setActiveBranch: (branch) => set({ activeBranch: branch }),
      setProductTotalCount: (count) => set({ productTotalCount: count }),
      setPartyTotalCount: (count) => set({ partyTotalCount: count }),

      // Clear functions
      clearProducts: () => set({ products: [], productTotalCount: 0 }),
      clearParty: () => set({ party: [], partyTotalCount: 0 }),
      clearAllData: () => {
        set({
          products: [],
          party: [],
          categories: [],
          productTotalCount: 0,
          partyTotalCount: 0,
        });
        get().cancelPendingRequests();
      },

      // Cancel all pending requests
      cancelPendingRequests: () => {
        const { abortControllers } = get();
        abortControllers.forEach((controller, key) => {
          controller.abort();
          abortControllers.delete(key);
        });
      },

      // Refresh products with current branch
      refreshProducts: async () => {
        const { activeBranch, fetchProducts } = get();
        if (activeBranch) {
          await fetchProducts({ branch_id: activeBranch.id });
        } else {
          await fetchProducts({ branch_id: null });
        }
      },

      // Refresh party with current branch
      refreshParty: async () => {
        const { activeBranch, fetchParty } = get();
        await fetchParty({ branch_id: activeBranch?.id || null });
      },

      // Switch branch with validation
      switchBranch: async (branchId: number | null) => {
        const { branches, activeBranch, cancelPendingRequests } = get();

        // Prevent unnecessary switches
        if (branchId === activeBranch?.id) return;

        // Validate branch exists if branchId provided
        if (branchId !== null && !branches.find((b) => b.id === branchId)) {
          console.warn(`Branch ${branchId} not found`);
          set({ error: `Branch ${branchId} not found` });
          return;
        }

        // Cancel any ongoing requests
        cancelPendingRequests();

        set({ isSwitchingBranch: true, loading: true });

        try {
          if (branchId === null) {
            set({ activeBranch: null });
            localStorage.removeItem("activeBranchId");
          } else {
            const branch = branches.find((b) => b.id === branchId) || null;
            set({ activeBranch: branch });
            localStorage.setItem("activeBranchId", branchId.toString());
          }

          // Clear branch-specific data to trigger refetch with new branch
          get().clearProducts();
          get().clearParty();
        } catch (error) {
          console.error("Error switching branch:", error);
          set({ error: "Failed to switch branch" });
        } finally {
          set({ isSwitchingBranch: false, loading: false });
        }
      },

      // Fetch Branches
      fetchBranches: async () => {
        const controller = new AbortController();
        get().abortControllers.set("branches", controller);

        try {
          set({ loading: true, error: null });

          const result = await apiClient<ApiResponse<Branch[]>>(
            `${import.meta.env.VITE_SERVER}/setup/get-branches`,
            {
              method: "GET",
              tokenType: "jwt",
              signal: controller.signal, // If apiClient supports abort signal
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
          if (err instanceof Error && err.name === "AbortError") {
            console.log("Branches fetch aborted");
            return;
          }
          const errorMsg =
            err instanceof Error ? err.message : "Error fetching branches";
          console.error("Error fetching branches:", err);
          set({ error: errorMsg });
        } finally {
          set({ loading: false });
          get().abortControllers.delete("branches");
        }
      },

      // Fetch Categories
      fetchCategories: async () => {
        const controller = new AbortController();
        get().abortControllers.set("categories", controller);

        try {
          set({ loading: true, error: null });

          const result = await apiClient<ApiResponse<Category[]>>(
            `${import.meta.env.VITE_SERVER}/product/get-product-cat`,
            {
              method: "GET",
              signal: controller.signal,
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
          if (err instanceof Error && err.name === "AbortError") {
            console.log("Categories fetch aborted");
            return;
          }
          const errorMsg =
            err instanceof Error ? err.message : "Error fetching categories";
          console.error("Error fetching categories:", err);
          set({ error: errorMsg });
        } finally {
          set({ loading: false });
          get().abortControllers.delete("categories");
        }
      },

      // Fetch Roles - FIXED type
      fetchRoles: async () => {
        const controller = new AbortController();
        get().abortControllers.set("roles", controller);

        try {
          set({ loading: true, error: null });

          // FIXED: Changed from Category[] to Roles[]
          const result = await apiClient<ApiResponse<Roles[]>>(
            `${import.meta.env.VITE_SERVER}/setup/get-roles`,
            {
              method: "GET",
              signal: controller.signal,
            },
          );
          if (result.success) {
            set({ roles: result.data });
          } else {
            const errorMsg = result.message || "Failed to fetch Roles";
            console.error("Failed to fetch Roles:", errorMsg);
            set({ error: errorMsg });
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") {
            console.log("Roles fetch aborted");
            return;
          }
          const errorMsg =
            err instanceof Error ? err.message : "Error fetching roles";
          console.error("Error fetching roles:", err);
          set({ error: errorMsg });
        } finally {
          set({ loading: false });
          get().abortControllers.delete("roles");
        }
      },

      // Fetch Party - Enhanced with pagination
      fetchParty: async (params: FetchPartyParams = {}) => {
        const controller = new AbortController();
        const requestId = `party-${Date.now()}`;
        get().abortControllers.set(requestId, controller);

        try {
          set({ loading: true, error: null });

          const result = await apiClient<PaginatedApiResponse<Customer[]>>(
            `${import.meta.env.VITE_SERVER}/party/get-party`,
            {
              method: "POST",
              tokenType: "jwt",
              data: {
                type: params.type || null,
                limit: params.limit || null,
                search: params.search || null,
                status: params.status || null,
                branch_id: params.branch_id || get().activeBranch?.id || null,
              },
              signal: controller.signal,
            },
          );

          if (result.success && Array.isArray(result.data)) {
            set({
              party: result.data,
              partyTotalCount: result.totalCount || result.data.length,
            });
          } else {
            const errorMsg = result.message || "Failed to fetch party";
            console.error("Failed to fetch party:", errorMsg);
            set({ error: errorMsg });
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") {
            console.log("Party fetch aborted");
            return;
          }
          const errorMsg =
            err instanceof Error ? err.message : "Error fetching party";
          console.error("Error fetching party:", err);
          set({ error: errorMsg });
        } finally {
          set({ loading: false });
          get().abortControllers.delete(requestId);
        }
      },

      // Fetch Products - Enhanced with pagination
      fetchProducts: async (params: FetchProductsParams = {}) => {
        const controller = new AbortController();
        const requestId = `products-${Date.now()}`;
        get().abortControllers.set(requestId, controller);

        try {
          set({ loading: true, error: null });

          const result = await apiClient<PaginatedApiResponse<Product[]>>(
            `${import.meta.env.VITE_SERVER}/product/get-pos-products`,
            {
              method: "POST",
              data: {
                category_id: params.category_id || null,
                search: params.search || null,
                branch_id: params.branch_id || get().activeBranch?.id || null,
                limit: params.limit || null,
                offset: params.offset || null,
                status: params.status || null,
              },
              tokenType: "jwt",
              signal: controller.signal,
            },
          );

          if (result.success && Array.isArray(result.data)) {
            set({
              products: result.data,
              productTotalCount: result.totalCount || result.data.length,
            });
          } else {
            const errorMsg = result.message || "Failed to fetch products";
            console.error("Failed to fetch products:", errorMsg);
            set({ error: errorMsg });
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") {
            console.log("Products fetch aborted");
            return;
          }
          const errorMsg =
            err instanceof Error ? err.message : "Error fetching products";
          console.error("Error fetching products:", err);
          set({ error: errorMsg });
        } finally {
          set({ loading: false });
          get().abortControllers.delete(requestId);
        }
      },
    }),
    {
      name: "quick-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        branches: state.branches,
        activeBranch: state.activeBranch,
        roles: state.roles, // Added roles to persistence since they don't change often
      }),
      // Handle rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Store rehydrated successfully");
          // Optional: Validate rehydrated data
          if (
            state.activeBranch &&
            !state.branches.find((b) => b.id === state.activeBranch?.id)
          ) {
            console.warn("Rehydrated branch not found in branches list");
            state.activeBranch = null;
            localStorage.removeItem("activeBranchId");
          }
        }
      },
    },
  ),
);

// Optional: Custom hook for branch-aware data fetching
export const useBranchData = () => {
  const {
    activeBranch,
    fetchProducts,
    fetchParty,
    refreshProducts,
    refreshParty,
  } = useQuickStore();

  return {
    fetchProductsForCurrentBranch: (
      params?: Omit<FetchProductsParams, "branch_id">,
    ) => fetchProducts({ ...params, branch_id: activeBranch?.id }),
    fetchPartyForCurrentBranch: (
      params?: Omit<FetchPartyParams, "branch_id">,
    ) => fetchParty({ ...params, branch_id: activeBranch?.id }),
    refreshProductsForCurrentBranch: refreshProducts,
    refreshPartyForCurrentBranch: refreshParty,
    currentBranch: activeBranch,
  };
};
