"use client";

import { apiClient } from "@/hook/apiClient";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import Loader from "../utils/loader";
import { ImageOff } from "lucide-react";

type Category = {
  id: number;
  name: string;
};

type ProductImage = {
  id: number;
  url: string;
  alt_text: string;
  is_primary: boolean;
  variant_id: number;
};

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
  images: ProductImage[] | null;
};

function getPrimaryImage(
  images: ProductImage[] | null,
  variantId: number,
): string | null {
  if (!images || images.length === 0) return null;
  const variantPrimary = images.find(
    (i) => i.variant_id === variantId && i.is_primary,
  );
  if (variantPrimary) return variantPrimary.url;
  const variantAny = images.find((i) => i.variant_id === variantId);
  if (variantAny) return variantAny.url;
  return images[0]?.url ?? null;
}

function ProductImage({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="w-full h-28 bg-bw-100 rounded-md flex items-center justify-center mb-2">
        <ImageOff size={28} className="text-bw-300" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className="w-full h-28 object-cover rounded-md mb-2 bg-bw-100"
    />
  );
}

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch categories once — absorbed from ProductCategory component
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await apiClient(
          `${import.meta.env.VITE_SERVER}/product/get-product-cat`,
          { method: "GET", tokenType: "jwt" },
        );
        setCategories([{ id: 0, name: "All" }, ...(data.data || [])]);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch categories");
        setCategories([{ id: 0, name: "All" }]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-pos-products`,
        {
          data: {
            category_id: category === "All" ? undefined : category,
            search: debouncedSearch.trim() || undefined,
          },
          method: "POST",
          tokenType: "jwt",
        },
      );
      setProducts(data.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [category, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, update]);

  return (
    <div className="bg-white rounded-md shadow-md flex flex-col flex-1 overflow-hidden">
      {/* ── Header row: title + search ───────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <h2 className="text-bw-900 font-bold text-lg shrink-0">Products</h2>

        {/* Search — pushed to the right */}
        <div className="relative ml-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 border border-bw-300 rounded-md w-48 text-sm focus:outline-none focus:ring-2 focus:ring-bw-500 text-bw-900 pr-7"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-bw-400 hover:text-bw-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Category pill strip ───────────────────────────────────────── */}
      <div className="px-4 pb-3">
        {loadingCategories ? (
          <div className="flex gap-2">
            {[80, 96, 64, 88, 72].map((w) => (
              <div
                key={w}
                className="h-7 rounded-full bg-bw-100 animate-pulse shrink-0"
                style={{ width: w }}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex gap-1.5 overflow-x-auto pb-0.5"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d4d4d4 transparent",
            }}
          >
            {categories.map((cat) => {
              const isActive =
                (cat.id === 0 && category === "All") ||
                (cat.id !== 0 && category === cat.id.toString());
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setCategory(cat.id === 0 ? "All" : cat.id.toString())
                  }
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                    isActive
                      ? "bg-bw-800 text-white border-bw-800"
                      : "bg-white text-bw-700 border-bw-200 hover:bg-bw-100 hover:border-bw-300"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Product grid ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loadingProducts ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-bw-500">
            <p className="text-lg font-medium mb-1">No products found</p>
            <p className="text-sm text-center">
              {search || category !== "All"
                ? "Try clearing filters or searching for something else"
                : "No products available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((product) => {
              const imageUrl = getPrimaryImage(
                product.images,
                product.variant_id || product.product_id,
              );
              const outOfStock = Number(product.stock_qty) === 0;

              return (
                <div
                  key={`${product.variant_id || product.product_id}`}
                  className={`p-3 bg-white border rounded-lg flex flex-col hover:shadow-md transition-all duration-200 ${
                    outOfStock
                      ? "border-bw-300 opacity-70"
                      : "border-bw-200 hover:border-bw-300"
                  }`}
                >
                  {/* Image with stock badge */}
                  <div className="relative">
                    <ProductImage src={imageUrl} alt={product.display_name} />
                    <span
                      className={`absolute top-1 right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        outOfStock
                          ? "bg-red-100 text-red-700"
                          : Number(product.stock_qty) < 10
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {outOfStock ? "Out" : product.stock_qty}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3
                      className="text-bw-800 font-medium text-sm mb-0.5 line-clamp-2 leading-tight"
                      title={product.display_name}
                    >
                      {product.display_name}
                    </h3>
                    {product.code && (
                      <p className="text-bw-400 text-xs mb-0.5">
                        #{product.code}
                      </p>
                    )}
                    {product.category_name && (
                      <p
                        className="text-bw-500 text-xs mb-1 truncate"
                        title={product.category_name}
                      >
                        {product.category_name}
                      </p>
                    )}
                    <p className="text-bw-900 font-semibold text-sm">
                      ৳ {Number(product.selling_price).toFixed(2)}
                    </p>
                  </div>

                  <button
                    className={`mt-2 w-full py-1.5 rounded text-sm font-medium transition-colors ${
                      outOfStock
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
                    disabled={outOfStock}
                  >
                    {outOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
