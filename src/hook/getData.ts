// hook/getData.ts
import { apiClient } from "@/hook/apiClient";

export async function getData<T>(url: string): Promise<T[]> {
  try {
    const res = await apiClient(url, { method: "GET", tokenType: "jwt" });
    return res.data || [];
  } catch (err: any) {
    console.error(err);
    return [];
  }
}
