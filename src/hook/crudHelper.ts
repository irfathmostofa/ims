import { toast } from "sonner";
import { apiClient } from "./apiClient";

type CrudOptions<T> = {
  listUrl: string;
  listMethod?: "GET" | "POST"; // new
  listPayload?: any; // default payload
  createUrl: string;
  updateUrl: string;
  deleteUrl: string;
  formatCreate?: (data: Partial<T>) => any;
  formatUpdate?: (data: Partial<T>) => any;
};

export function useCrud<T>({
  listUrl,
  listMethod = "GET",
  listPayload,
  createUrl,
  updateUrl,
  deleteUrl,
  formatCreate,
  formatUpdate,
}: CrudOptions<T>) {
  const fetchAll = async (
    setData: (data: T[]) => void,
    setLoading?: (val: boolean) => void,
    payload?: any // override default payload if needed
  ) => {
    try {
      setLoading?.(true);
      const res = await apiClient(listUrl, {
        method: listMethod,
        tokenType: "jwt",
        ...(listMethod === "POST" ? { data: payload || listPayload } : {}),
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
      const res = await apiClient(deleteUrl, {
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
