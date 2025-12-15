"use client";

import { apiClient } from "@/hook/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "../utils/loader";

type Category = {
  id: number;
  name: string;
};

export default function ProductCategory({
  category,
  setCategory,
}: {
  category: string;
  setCategory: (cat: string) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-product-cat`,
        { method: "GET", tokenType: "jwt" }
      );

      // Add "All Categories" option
      const allCategories = [
        { id: 0, name: "All Categories" },
        ...(data.data || []),
      ];
      setCategories(allCategories);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch categories");
      // Fallback to just "All Categories"
      setCategories([{ id: 0, name: "All Categories" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryClick = (cat: Category) => {
    setCategory(cat.id === 0 ? "All" : cat.id.toString());
  };

  return (
    <div className="bg-white p-3 rounded-md shadow-md h-full">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      ) : (
        <>
          <h2 className="text-bw-900 font-bold text-lg mb-3 pb-2 border-b border-bw-200">
            Categories
          </h2>
          <div className="flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all text-left ${
                  (cat.id === 0 && category === "All") ||
                  (cat.id !== 0 && category === cat.id.toString())
                    ? "bg-bw-700 text-white shadow-sm"
                    : "bg-bw-100 text-bw-900 hover:bg-bw-200"
                }`}
                onClick={() => handleCategoryClick(cat)}
                title={cat.name}
              >
                <span className="truncate block">{cat.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
