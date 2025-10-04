"use client";

import { apiClient } from "@/hook/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "../utils/loader";

export default function ProductCategory({
  category,
  setCategory,
}: {
  category: string;
  setCategory: (cat: string) => void;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-product-cat`,
        { method: "GET", tokenType: "jwt" }
      );

      setCategories(data.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-bw-50 px-2 pb-2 rounded-md shadow-md ">
      {loading && <Loader />}
      <h2 className="text-bw-900 font-bold mb-2 text-center">Categories</h2>
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              category === cat.id
                ? "bg-bw-700 text-bw-50"
                : "bg-bw-100 text-bw-900 hover:bg-bw-200"
            }`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
