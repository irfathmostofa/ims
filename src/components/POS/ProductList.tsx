"use client";

import { apiClient } from "@/hook/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "../utils/loader";

export default function ProductList({
  search,
  setSearch,
  category,
  addToCart,
}: {
  search: string;
  setSearch: (s: string) => void;
  category: string;
  addToCart: (product: { id: number; name: string; price: number }) => void;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-pos-products`,

        {
          data: { category, search },
          method: "POST",
          tokenType: "jwt",
        }
      );
      setProducts(data.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch Product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  return (
    <div className="bg-bw-50 p-2 rounded-md shadow-md flex flex-col flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-bw-900 font-bold text-lg">Products</h2>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-2 py-1 border border-bw-400 rounded-md w-40 text-sm focus:outline-none focus:ring-2 focus:ring-bw-700 text-bw-900"
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 flex-1">
        {loading && <Loader />}
        {products.map((product) => (
          <div
            key={product.variant_id}
            title={product.name}
            className="p-2 bg-bw-100 border border-bw-primary rounded-md flex flex-col justify-between items-start hover:shadow-md transition h-36 truncate"
          >
            <h3 className="text-bw-800 font-medium text-sm">{product.name}</h3>
            <p className="text-bw-700 text-xs">Category: {product.category}</p>
            <p className="text-bw-700 text-xs">Stock: {product.stock_qty}</p>
            <p className="text-bw-700 text-sm mt-1">
              BDT {product.selling_price}
            </p>
            <button
              className="mt-2 btn-bw-primary text-sm px-2 py-1 self-stretch text-center"
              onClick={() =>
                addToCart({
                  id: product.variant_id,
                  name: product.name,
                  price: product.selling_price,
                })
              }
              disabled={Number(product.stock_qty) === 0}
            >
              {product.stock_qty === 0 ? "Out of Stock" : "Add"}
            </button>
          </div>
        ))}
        {!loading && products.length === 0 && (
          <p className="text-bw-500 col-span-full text-center mt-4">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}
