// stores/companyStore.ts
import { apiClient } from "@/hook/apiClient";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Company {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  website: string;
  status: string;
  created_by: string | null;
  created_at: string;
}

interface CompanyStore {
  company: Company | null;
  fetchCompany: () => Promise<void>;
}

const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      company: null,

      fetchCompany: async () => {
        const data = await apiClient(
          `${import.meta.env.VITE_SERVER}/setup/get-companies`,
          {
            method: "GET",
            tokenType: "jwt",
          },
        );

        if (data.success && data.data.length > 0) {
          set({ company: data.data[0] });
        }
      },
    }),
    {
      name: "company-storage",
    },
  ),
);

// Auto-fetch when store is initialized
useCompanyStore.getState().fetchCompany();

export default useCompanyStore;
