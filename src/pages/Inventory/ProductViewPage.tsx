"use client";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Barcode from "react-barcode";
import { printView } from "@/components/utils/print";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";
import Loader from "@/components/utils/loader";
import { Package, Image as ImageIcon, Printer, Pencil } from "lucide-react";

export default function ProductViewPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [copies, setCopies] = useState(20);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/products/${id}`,
        { method: "GET", tokenType: "jwt" }
      );

      if (data.data) {
        setProduct(data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <Loader />;
  if (!product)
    return <p className="text-center py-10 text-gray-600">No product found</p>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b z-10 flex items-center justify-between py-4 px-2 rounded-t-lg">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 text-sm">
            {product.categories?.[0]?.name} • {product.uom_name} (
            {product.uom_symbol})
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/inventory/products/${product.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <button
            onClick={() =>
              setTimeout(() => {
                printView("barcodeArea");
              }, 500)
            }
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
          >
            <Printer className="w-4 h-4" /> Print Barcodes
          </button>
        </div>
      </div>

      {/* Product Summary Card */}
      <div className="bg-gradient-to-br from-gray-50 to-white border rounded-2xl shadow-sm p-6 grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <p className="text-gray-700 text-sm">Product Code</p>
          <h3 className="font-semibold text-lg">{product.code}</h3>

          <p className="text-gray-700 text-sm mt-3">Description</p>
          <p className="font-medium text-gray-900">
            {product.description || "No description"}
          </p>

          <p className="text-gray-700 text-sm mt-3">Status</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              product.status === "A"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.status === "A" ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex flex-col items-end justify-center text-right">
          <h2 className="text-4xl font-bold text-gray-900 mb-1">
            ${product.selling_price}
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Cost: ${product.cost_price} • Regular: $
            {product.regular_price || product.selling_price}
          </p>
          <div className="text-sm text-gray-700">
            Total Stock:{" "}
            <span className="font-semibold text-gray-900">
              {product.total_stock || 0} units
            </span>
          </div>
        </div>
      </div>

      {/* Variants Section */}
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
          <Package className="w-5 h-5 text-gray-600" />
          Variants ({product.variants?.length || 0})
        </h2>

        {product.variants && product.variants.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.variants.map((variant: any) => (
              <div
                key={variant.id}
                className="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {variant.name || `Variant #${variant.id}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Code: {variant.code}
                    </p>
                    <p className="text-sm text-gray-600">
                      Additional Price: +${variant.additional_price}
                    </p>
                    <p className="text-sm text-gray-600">
                      Stock: {variant.stock || 0} units
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      variant.status === "A"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {variant.status === "A" ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Images */}
                {variant.images?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                      <ImageIcon className="w-4 h-4" /> Images
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {variant.images.map((img: any, i: number) => (
                        <div
                          key={i}
                          className={`relative border rounded-lg overflow-hidden ${
                            img.is_primary ? "ring-2 ring-blue-500" : ""
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.alt_text || `Image ${i + 1}`}
                            className="h-20 w-full object-cover"
                          />
                          {img.is_primary && (
                            <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">
            No variants available
          </p>
        )}
      </div>

      {/* Print Setup */}
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Barcode Print Setup
        </h2>
        <p className="text-sm text-gray-500">
          Adjust print quantity and preview below before printing.
        </p>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-3 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Copies per Barcode:
            </label>
            <input
              type="number"
              min={1}
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => printView("barcodeArea")}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow"
          >
            Print All Barcodes
          </button>
        </div>
      </div>

      {/* Hidden Print Area */}
      {/* Hidden Print Area */}
      <div id="barcodeArea" className="hidden print_section print:block">
        <div className="p-4">
          {/* Optional Header */}
          <div className="text-center mb-6 border-b pb-3">
            <h1 className="text-2xl font-bold">
              {product.name} — Barcode Sheet
            </h1>
            <p className="text-sm text-gray-600">
              Printed on {new Date().toLocaleString()}
            </p>
          </div>

          {product.variants?.length > 0 ? (
            product.variants.map((variant: any) => (
              <div key={variant.id} className="mb-10 break-inside-avoid">
                <h2 className="text-sm font-semibold mb-2">
                  Variant: {variant.name || `#${variant.id}`}
                </h2>

                <div className="grid grid-cols-5 gap-4 justify-items-center">
                  {variant.barcodes?.length > 0 ? (
                    variant.barcodes.map((b: any) =>
                      [...Array(copies)].map((_, idx) => (
                        <div
                          key={`${b.id}-${idx}`}
                          className="label-card flex flex-col items-center justify-center text-center"
                        >
                          <Barcode
                            value={b.barcode}
                            height={60}
                            width={1.2}
                            fontSize={12}
                            margin={0}
                          />
                          <p className="text-xs font-medium mt-1 truncate w-full">
                            {variant.name?.length > 18
                              ? variant.name.slice(0, 18) + "…"
                              : variant.name}
                          </p>
                        </div>
                      ))
                    )
                  ) : (
                    <p className="text-gray-500 text-sm col-span-full">
                      No barcodes for this variant
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No variants available</p>
          )}
        </div>
      </div>
    </div>
  );
}
