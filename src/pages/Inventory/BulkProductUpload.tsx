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
  images?: { url: string; alt_text?: string; is_primary?: boolean }[];
};

type ProductPreview = {
  row: number;
  product_name: string;
  uom_name: string;
  cost_price: number | string | null;
  regular_price: number | string | null; // Added regular_price
  selling_price: number | string | null;
  category: string;
  stock_quantity?: number;
  variant: Variant;
};

type PreviewResponse = {
  preview: ProductPreview[];
  errors: { row: number; error: string }[];
  total: number;
  valid: number;
  message?: string;
};

type ConfirmResponse = {
  success: boolean;
  message: string;
  created_count: number;
  failed_count: number;
  createdProducts: any[];
  failedProducts: { product: string; error: string; row?: number }[];
};

export default function BulkProductUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ProductPreview[]>([]);
  const [errors, setErrors] = useState<{ row: number; error: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [branchCode, setBranchCode] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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
            selectedFile.type.includes(type),
        )
      ) {
        alert("Invalid file type. Please upload a CSV or Excel file.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFile(null);
        return;
      }

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
      setErrorMessage(null);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

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
        },
      )) as PreviewResponse;

      setPreview(res.preview || []);
      setErrors(res.errors || []);

      if (res.errors && res.errors.length > 0) {
        alert(
          `Found ${res.errors.length} errors in the file. Please fix them before confirming.`,
        );
      } else {
        alert(`✅ File is valid! ${res.valid} rows ready to import.`);
      }
    } catch (err: any) {
      console.error("Preview error:", err);
      alert(
        err.message ||
          "Failed to preview file. Please check the format and try again.",
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

    if (!branchCode && !user?.branch_code) {
      const useDefault = confirm(
        "No branch specified. Do you want to use the default branch?",
      );
      if (!useDefault) {
        return;
      }
    }

    setConfirmLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const productsToSave = preview.map((p) => ({
      product_name: p.product_name,
      variant_name: p.variant.name,
      category: p.category || "",
      uom_name: p.uom_name,
      cost_price: p.cost_price,
      regular_price: p.regular_price, // Added regular_price
      selling_price: p.selling_price,
      stock_quantity: p.stock_quantity || 0,
      additional_price: p.variant.additional_price || 0,
      SKU: p.variant.SKU || "",
      weight: p.variant.weight,
      weight_unit: p.variant.weight_unit,
      images: p.variant.images || [],
      row: p.row,
    }));

    try {
      const res = (await apiClient(
        `${import.meta.env.VITE_SERVER}/product/bulk/confirm`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            products: productsToSave,
            branch_code: branchCode || user?.branch_code,
          },
        },
      )) as ConfirmResponse;

      console.log("Confirm response:", res);

      if (res.success) {
        setSuccessMessage(
          `✅ Successfully created ${res.created_count} product(s). ${
            res.failed_count > 0
              ? `⚠️ Failed to create ${res.failed_count} product(s). Check console for details.`
              : ""
          }`,
        );

        if (res.failedProducts && res.failedProducts.length > 0) {
          console.error("Failed products:", res.failedProducts);
          setErrorMessage(
            `Failed products: ${res.failedProducts
              .map((fp) => `${fp.product} (Row ${fp.row}): ${fp.error}`)
              .join("; ")}`,
          );
        }

        setPreview([]);
        setErrors([]);
        setFile(null);
        setBranchCode("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert(res.message || "Failed to save products. Please try again.");
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
    setErrorMessage(null);
    setBranchCode("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `product_name,variant_name,category,uom,cost_price,regular_price,selling_price,stock_quantity,additional_price,SKU,weight,weight_unit,images
Wireless Mouse,Bluetooth 5.0,Electronics,PCS,15.50,25.00,29.99,100,0,MOUSE-001,0.15,KG,https://example.com/mouse1.jpg
Gaming Keyboard,Mechanical RGB,Electronics,PCS,45.00,75.00,89.99,50,0,KB-001,1.20,KG,
USB Cable,Type-C 2m,Accessories,PCS,2.50,5.00,9.99,500,0,CABLE-001,0.05,KG,
Laptop Bag,15.6 inch,Accessories,PCS,12.00,20.00,29.99,75,0,BAG-001,0.80,KG,https://example.com/bag1.jpg`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_products.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Bulk Product Upload
      </h1>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Upload a CSV or Excel file with product data</li>
          <li>
            <strong>Required columns:</strong> product_name, variant_name, uom,
            cost_price, regular_price, selling_price
          </li>
          <li>
            <strong>Optional columns:</strong> category, stock_quantity,
            additional_price, SKU, weight, weight_unit, images
          </li>
          <li>
            <strong>Price definitions:</strong>
            <ul className="list-circle ml-6 mt-1">
              <li>cost_price: Purchase cost of the product</li>
              <li>regular_price: MRP / Regular price of the product</li>
              <li>selling_price: Actual selling price (after discount)</li>
            </ul>
          </li>
          <li>
            <strong>UOM values:</strong> PCS, KG, Liter, Meter (case-insensitive
            - "KG", "kg", "Kg" all work)
          </li>
          <li>Categories are auto-created if they don't exist</li>
          <li>Max file size: 5MB</li>
          <li>
            <button
              onClick={downloadSampleCSV}
              className="text-blue-600 hover:text-blue-800 underline text-sm mt-2"
            >
              📥 Download Sample CSV
            </button>
          </li>
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
          {loading ? (
            <>
              <svg
                className="inline animate-spin h-4 w-4 mr-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : (
            "Preview"
          )}
        </button>

        <button
          onClick={handleConfirm}
          disabled={confirmLoading || preview.length === 0 || errors.length > 0}
          className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {confirmLoading ? (
            <>
              <svg
                className="inline animate-spin h-4 w-4 mr-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            "Confirm & Save"
          )}
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

      {errorMessage && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">{errorMessage}</p>
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
                    UOM
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Cost Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Regular Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Selling Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Stock Qty
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
                      {p.uom_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      ${parseFloat(p.cost_price as string).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      ${parseFloat(p.regular_price as string).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      ${parseFloat(p.selling_price as string).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.stock_quantity || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.variant.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      ${p.variant.additional_price || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {p.variant.SKU || "-"}
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
