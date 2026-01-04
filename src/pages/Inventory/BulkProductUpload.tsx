"use client";

import React, { useState, useRef } from "react";
import { apiClient } from "@/hook/apiClient";
import { useAuthStore } from "@/store/authStore";

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
  row: number;
  product_name: string;
  uom_id: number | null;
  cost_price: number | string | null;
  selling_price: number | string | null;
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
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        ".csv",
        ".xlsx",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (
        !validTypes.some(
          (type) =>
            selectedFile.name.toLowerCase().endsWith(type) ||
            selectedFile.type.includes(type)
        )
      ) {
        alert("Invalid file type. Please upload a CSV or Excel file.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFile(null);
        return;
      }

      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size too large. Maximum size is 5MB.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setPreview([]);
      setErrors([]);
      setSuccessMessage(null);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = (await apiClient(
        `${import.meta.env.VITE_SERVER}/product/bulk/preview`,
        {
          method: "POST",
          tokenType: "jwt",
          data: formData,
          headers: {},
        }
      )) as PreviewResponse;

      setPreview(res.preview || []);
      setErrors(res.errors || []);

      if (res.errors && res.errors.length > 0) {
        alert(
          `Found ${res.errors.length} errors in the file. Please fix them before confirming.`
        );
      }
    } catch (err: any) {
      console.error("Preview error:", err);
      alert(
        err.message ||
          "Failed to preview file. Please check the format and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (preview.length === 0) {
      alert("No products to save");
      return;
    }

    if (errors.length > 0) {
      alert("Please fix all errors before confirming.");
      return;
    }

    setConfirmLoading(true);
    setSuccessMessage(null);

    // Group products by product_name AND uom_id (products can have same name but different UOM)
    const groupedProducts: Record<string, any> = {};

    preview.forEach((p) => {
      if (!p.uom_id) {
        alert(`Row ${p.row}: UOM ID is required`);
        return;
      }

      const key = `${p.product_name}-${p.uom_id}`;

      if (!groupedProducts[key]) {
        groupedProducts[key] = {
          name: p.product_name,
          uom_id: p.uom_id,
          cost_price: p.cost_price,
          selling_price: p.selling_price,
          category: p.category || "",
          userId: user?.id,
          status: "A",
          variants: [
            {
              name: p.variant.name,
              additional_price: p.variant.additional_price || 0,
              SKU: p.variant.SKU,
              weight: p.variant.weight,
              weight_unit: p.variant.weight_unit,
              images: p.variant.images || [],
              status: "A",
            },
          ],
        };
      } else {
        // Check if variant already exists (by name)
        const existingVariant = groupedProducts[key].variants.find(
          (v: Variant) => v.name === p.variant.name
        );

        if (!existingVariant) {
          groupedProducts[key].variants.push({
            name: p.variant.name,
            additional_price: p.variant.additional_price || 0,
            SKU: p.variant.SKU,
            weight: p.variant.weight,
            weight_unit: p.variant.weight_unit,
            images: p.variant.images || [],
            status: "A",
          });
        }
      }
    });

    const productsToSave = Object.values(groupedProducts);

    // Add categories to products that have them
    const productsWithCategories = productsToSave.map((product: any) => {
      if (product.category && product.category.trim() !== "") {
        return {
          ...product,
          categories: [{ name: product.category, is_primary: true }],
        };
      }
      return product;
    });

    try {
      const res = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/bulk/confirm`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { products: productsWithCategories },
        }
      );

      console.log("Confirm response:", res);

      if (res.success) {
        setSuccessMessage(
          `✅ Successfully created ${res.created_count} product(s). ${
            res.failed_count > 0
              ? `Failed to create ${res.failed_count} product(s). Check console for details.`
              : ""
          }`
        );

        // Show failed products if any
        if (res.failedProducts && res.failedProducts.length > 0) {
          console.error("Failed products:", res.failedProducts);
        }

        // Reset form
        setPreview([]);
        setErrors([]);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert("Failed to save products. Please try again.");
      }
    } catch (err: any) {
      console.error("Confirm error:", err);
      alert(err.message || "Failed to save products. Please try again.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Bulk Product Upload
      </h1>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc list-inside text-sm text-gray-600">
          <li>Upload a CSV or Excel file with product data</li>
          <li>
            Required columns: product_name, uom_id, cost_price, selling_price,
            variant_name
          </li>
          <li>
            Optional columns: category, additional_price, SKU, weight,
            weight_unit, images
          </li>
          <li>Max file size: 5MB</li>
        </ul>
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Select File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <div className="space-x-3 mb-6">
        <button
          onClick={handlePreview}
          disabled={loading || !file}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Preview"}
        </button>

        <button
          onClick={handleConfirm}
          disabled={confirmLoading || preview.length === 0 || errors.length > 0}
          className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {confirmLoading ? "Saving..." : "Confirm & Save"}
        </button>

        <button
          onClick={handleReset}
          className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
        >
          Reset
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="font-semibold text-red-800 mb-2">
            Errors ({errors.length}):
          </h2>
          <ul className="space-y-1 max-h-60 overflow-y-auto">
            {errors.map((e, i) => (
              <li key={i} className="text-sm text-red-700">
                <span className="font-medium">Row {e.row}:</span> {e.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {preview.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Preview ({preview.length} rows)
            </h2>
            <span className="text-sm text-gray-600">
              Showing {preview.length} of {preview.length} valid rows
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Row
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    UOM ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Cost Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Selling Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Variant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    +Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.row}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                      {p.product_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.category || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.uom_id || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.cost_price || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.selling_price || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.variant.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.variant.additional_price || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.variant.SKU || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.variant.weight
                        ? `${p.variant.weight} ${
                            p.variant.weight_unit || ""
                          }`.trim()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {p.variant.images && p.variant.images.length > 0
                        ? `${p.variant.images.length} image(s)`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
