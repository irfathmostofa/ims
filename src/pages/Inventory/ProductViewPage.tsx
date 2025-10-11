"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Barcode from "react-barcode";
import { printView } from "@/components/utils/print";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";
import Loader from "@/components/utils/loader";

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
  }, []);

  if (loading) return <Loader />;
  if (!product) return <p className="text-center py-10">No product found</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-lg text-gray-600">
            {product.categories?.[0]?.name} • {product.uom_name} (
            {product.uom_symbol})
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-gray-800">
            ${product.selling_price}
          </p>
          <p className="text-sm text-gray-500">Cost: ${product.cost_price}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Product Images */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Product Images
          </h2>
          {product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.images.map((img: any, idx: number) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={img.alt_text || `Product Image ${idx + 1}`}
                  className={`rounded-lg border object-cover w-full h-40 ${
                    img.is_primary ? "ring-2 ring-blue-500" : ""
                  }`}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No images available.</p>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="bg-white p-6 rounded-xl shadow-md border space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Product Details
          </h2>
          <p>
            <strong>Description:</strong> {product.description || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {product.status === "A" ? "Active" : "Inactive"}
          </p>
          <p>
            <strong>Variants:</strong>
          </p>
          {product.variants && product.variants.length > 0 ? (
            <ul className="list-disc list-inside ml-3">
              {product.variants.map((variant: any) => (
                <li key={variant.id}>
                  {variant.name} (+${variant.additional_price})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No variants</p>
          )}
        </div>
      </div>

      {/* Barcode Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Barcodes</h2>

        {product.barcodes && product.barcodes.length > 0 ? (
          <div className="space-y-6">
            {product.barcodes.map((bv: any, idx: number) => (
              <div key={idx} className="space-y-3">
                <h3 className="font-medium text-gray-700">
                  Variant:{" "}
                  {product.variants?.find((v: any) => v.id === bv.variant_id)
                    ?.name || `#${bv.variant_id}`}
                </h3>
                <div className="flex flex-wrap gap-6">
                  {bv.barcodes.map((b: any) => (
                    <div key={b.id} className="flex flex-col items-center">
                      <Barcode value={b.barcode} height={60} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No barcodes</p>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 border-t">
          <div>
            <label className="block font-medium">
              Number of Copies (per barcode):
            </label>
            <input
              type="number"
              min={1}
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              className="border rounded px-3 py-1 w-24"
            />
          </div>
          <button
            onClick={() =>
              setTimeout(() => {
                printView("barcodeArea");
              }, 500)
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Print All Barcodes
          </button>
        </div>
      </div>

      {/* Hidden Print Area */}
      <div id="barcodeArea" className="hidden px-2">
        <h1 className="text-xl font-bold mb-4">{product.name} - Barcodes</h1>
        {product.barcodes.map((bv: any, idx: number) => (
          <div key={idx} className="mb-6 px-2">
            <h2 className="font-medium mb-2">
              Variant:{" "}
              {product.variants?.find((v: any) => v.id === bv.variant_id)
                ?.name || `#${bv.variant_id}`}
            </h2>
            <div className="grid grid-cols-2 gap-4 ">
              {bv.barcodes.map((b: any) =>
                [...Array(copies)].map((_, cIdx) => (
                  <div key={`${b.id}-${cIdx}`} className="border">
                    <Barcode value={b.barcode} height={100} />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
