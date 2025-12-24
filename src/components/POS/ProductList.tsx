"use client";

import { apiClient } from "@/hook/apiClient";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import Loader from "../utils/loader";

type Product = {
  product_id: number;
  variant_id: number;
  code: string;
  product_name: string;
  variant_name: string;
  display_name: string;
  description: string;
  selling_price: number;
  cost_price: number;
  additional_price: number;
  uom_symbol: string;
  uom_name: string;
  category_name: string;
  stock_qty: number;
  status: string;
  variant_status: string;
};

export default function ProductList({
  search,
  setSearch,
  category,
  setCategory,
  addToCart,
  update,
  setUpdate,
}: {
  search: string;
  update: number;
  setUpdate: (u: number) => void;
  setSearch: (s: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  addToCart: (product: { id: number; name: string; price: number }) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-pos-products`,
        {
          data: {
            category_id: category === "All" ? undefined : category,
            search: debouncedSearch.trim() || undefined,
          },
          method: "POST",
          tokenType: "jwt",
        }
      );
      setProducts(data.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, update]);

  const handleClearCategory = () => {
    setCategory("All");
    setUpdate(update + 1);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md flex flex-col flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-bw-900 font-bold text-lg">Products</h2>
          {category !== "All" && (
            <button
              onClick={handleClearCategory}
              className="text-xs bg-bw-200 text-bw-700 px-2 py-1 rounded hover:bg-bw-300 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 border border-bw-300 rounded-md w-48 text-sm focus:outline-none focus:ring-2 focus:ring-bw-500 text-bw-900"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-bw-400 hover:text-bw-600"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 ">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            {products.map((product) => (
              <div
                key={`${product.variant_id || product.product_id}`}
                className={`p-3 bg-white border rounded-lg flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-40 ${
                  Number(product.stock_qty) === 0
                    ? "border-bw-300 opacity-70"
                    : "border-bw-200 hover:border-bw-300"
                }`}
              >
                <div className="w-full">
                  <h3
                    className="text-bw-800 font-medium text-sm mb-1 line-clamp-2"
                    title={product.display_name}
                  >
                    {product.display_name}
                  </h3>

                  {product.code && (
                    <p className="text-bw-500 text-xs mb-1">
                      Code: {product.code}
                    </p>
                  )}

                  {product.category_name && (
                    <p
                      className="text-bw-600 text-xs mb-1 truncate"
                      title={product.category_name}
                    >
                      {product.category_name}
                    </p>
                  )}

                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-xs font-medium ${
                        Number(product.stock_qty) === 0
                          ? "text-red-600"
                          : Number(product.stock_qty) < 10
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      Stock: {product.stock_qty}
                    </span>
                    <span className="text-bw-900 font-semibold text-sm">
                      ৳ {Number(product.selling_price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  className={`mt-2 w-full py-2 rounded text-sm font-medium transition-colors ${
                    Number(product.stock_qty) === 0
                      ? "bg-bw-200 text-bw-500 cursor-not-allowed"
                      : "bg-bw-700 hover:bg-bw-800 text-white"
                  }`}
                  onClick={() =>
                    addToCart({
                      id: product.variant_id || product.product_id,
                      name: product.display_name,
                      price: product.selling_price,
                    })
                  }
                  disabled={Number(product.stock_qty) === 0}
                >
                  {Number(product.stock_qty) === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              </div>
            ))}

            {!loading && products.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center h-64 text-bw-500 p-4">
                <p className="text-lg font-medium mb-2">No products found</p>
                <p className="text-sm text-center">
                  {search || category !== "All"
                    ? "Try clearing filters or searching for something else"
                    : "No products available"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
