// utils/crudHelper.ts
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";

type CrudOptions<T> = {
  listUrl: string;
  createUrl: string;
  updateUrl: string; // must accept /:id
  deleteUrl: string; // must accept /:id
  formatCreate?: (data: Partial<T>) => any; // ✅ transform before create
  formatUpdate?: (data: Partial<T>) => any; // ✅ transform before update
};

export function useCrud<T>({
  listUrl,
  createUrl,
  updateUrl,
  deleteUrl,
  formatCreate,
  formatUpdate,
}: CrudOptions<T>) {
  const fetchAll = async (
    setData: (data: T[]) => void,
    setLoading?: (val: boolean) => void
  ) => {
    try {
      setLoading?.(true);
      const res = await apiClient(listUrl, {
        method: "GET",
        tokenType: "jwt",
      });
      setData(res.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch data");
    } finally {
      setLoading?.(false);
    }
  };

  const save = async (data: Partial<T>, id?: number) => {
    try {
      let res;
      if (id) {
        const payload = formatUpdate ? formatUpdate(data) : data;
        res = await apiClient(`${updateUrl}/${id}`, {
          method: "POST",
          data: payload,
          tokenType: "jwt",
        });
        toast.success(res.message || "Updated successfully!");
      } else {
        const payload = formatCreate ? formatCreate(data) : data;
        res = await apiClient(createUrl, {
          method: "POST",
          data: payload,
          tokenType: "jwt",
        });
        toast.success(res.message || "Created successfully!");
      }
      return res;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Save failed");
    }
  };

  const remove = async (id: number) => {
    try {
      const res = await apiClient(`${deleteUrl}`, {
        method: "POST",
        data: { id },
        tokenType: "jwt",
      });
      toast.success(res.message || "Deleted successfully!");
      return res;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    }
  };

  return { fetchAll, save, remove };
}
