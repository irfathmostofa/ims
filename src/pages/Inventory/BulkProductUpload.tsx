"use client";

import React, { useState } from "react";
import { apiClient } from "@/hook/apiClient";

type Variant = {
  name: string;
  additional_price: number;
  SKU?: string;
  weight?: number;
  weight_unit?: string;
  is_replaceable?: boolean;
  status?: string;
  images?: { url: string }[];
};

type ProductPreview = {
  product_name: string;
  uom_id: number;
  cost_price: number;
  selling_price: number;
  category: string;
  variant: Variant;
};

type PreviewResponse = {
  preview: ProductPreview[];
  errors: { row: number; error: string }[];
  total: number;
  valid: number;
};

export default function BulkProductUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ProductPreview[]>([]);
  const [errors, setErrors] = useState<{ row: number; error: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handlePreview = async () => {
    if (!file) return alert("Please select a file");
    setLoading(true);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = (await apiClient(
        `${import.meta.env.VITE_SERVER}/product/bulk/preview`,
        { method: "POST", tokenType: "jwt", data: formData }
      )) as PreviewResponse;

      setPreview(res.preview);
      setErrors(res.errors);
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (preview.length === 0) return alert("No products to save");

    setLoading(true);
    setSuccessMessage(null);

    const groupedProducts: Record<string, any> = {};

    preview.forEach((p) => {
      if (!groupedProducts[p.product_name]) {
        groupedProducts[p.product_name] = {
          name: p.product_name,
          uom_id: p.uom_id || 1, // add product-level fields
          cost_price: p.cost_price || 0,
          selling_price: p.selling_price || 0,
          categories: [{ name: p.category }],
          variants: [p.variant],
        };
      } else {
        groupedProducts[p.product_name].variants.push(p.variant);
      }
    });

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/product/bulk/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ products: Object.values(groupedProducts) }),
        }
      );

      const data = await res.json();
      console.log(data);
      if (data.success) {
        setSuccessMessage(
          `Created: ${data.created_count}, Failed: ${data.failed_count}`
        );
        setPreview([]);
        setErrors([]);
        setFile(null);
      } else {
        alert("Failed to save products");
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Bulk Product Upload</h1>

      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileChange}
        className="mb-4"
      />

      <div className="space-x-2 mb-4">
        <button
          onClick={handlePreview}
          disabled={loading || !file}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Preview
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || preview.length === 0 || errors.length > 0}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Confirm & Save
        </button>
      </div>

      {loading && <p>Processing...</p>}

      {errors.length > 0 && (
        <div className="mb-4 p-2 bg-red-100 rounded">
          <h2 className="font-semibold">Errors:</h2>
          <ul className="list-disc list-inside">
            {errors.map((e, i) => (
              <li key={i}>
                Row {e.row}: {e.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 rounded">{successMessage}</div>
      )}

      {preview.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Product Name</th>
                <th className="border px-2 py-1">Category</th>
                <th className="border px-2 py-1">Variant Name</th>
                <th className="border px-2 py-1">Additional Price</th>
                <th className="border px-2 py-1">SKU</th>
                <th className="border px-2 py-1">Weight</th>
                <th className="border px-2 py-1">Weight Unit</th>
                <th className="border px-2 py-1">Replaceable</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Images</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((p, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{p.product_name}</td>
                  <td className="border px-2 py-1">{p.category}</td>
                  <td className="border px-2 py-1">{p.variant.name}</td>
                  <td className="border px-2 py-1">
                    {p.variant.additional_price}
                  </td>
                  <td className="border px-2 py-1">{p.variant.SKU || "-"}</td>
                  <td className="border px-2 py-1">
                    {p.variant.weight || "-"}
                  </td>
                  <td className="border px-2 py-1">
                    {p.variant.weight_unit || "-"}
                  </td>
                  <td className="border px-2 py-1">
                    {p.variant.is_replaceable ? "Yes" : "No"}
                  </td>
                  <td className="border px-2 py-1">
                    {p.variant.status || "A"}
                  </td>
                  <td className="border px-2 py-1">
                    {p.variant.images?.map((img) => img.url).join(", ") || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
