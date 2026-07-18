"use client";

import React, { useState, useRef } from "react";
import { apiClient } from "@/hook/apiClient";
import { useAuthStore } from "@/store/authStore";

type RowIssue = {
  row_index: number;
  field: string;
  message: string;
};

type CategoryStatus = {
  name: string;
  status: "existing" | "new";
};

type BulkRow = {
  row_group: string;
  product_name: string;
  brand_name: string;
  uom_name: string;
  cost_price: string;
  selling_price: string;
  regular_price: string;
  description?: string;
  category_names?: string;
  variant_name: string;
  weight?: string;
  weight_unit?: string;
  is_replaceable?: string;
  additional_price?: string;
  image_url?: string;
  is_primary_image?: string;
};

type GroupPreview = {
  row_group: string;
  product_name: string;
  row_count: number;
  status: "valid" | "error";
  issues: RowIssue[];
  brand_status: "existing" | "new" | "unknown";
  uom_status: "existing" | "new" | "unknown";
  category_status: CategoryStatus[];
  rows: BulkRow[];
};

type PreviewResponse = {
  data: {
    total_groups: number;
    valid_groups: number;
    error_groups: number;
    groups: GroupPreview[];
  };
  message?: string;
};

type GroupResult = {
  row_group: string;
  product_name: string;
  status: "success" | "failed";
  product_id?: number;
  error?: string;
};

type ConfirmResponse = {
  data: {
    total: number;
    success: number;
    failed: number;
    results: GroupResult[];
  };
  message?: string;
};

export default function BulkProductUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [groups, setGroups] = useState<GroupPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmFailures, setConfirmFailures] = useState<GroupResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  const validGroups = groups.filter((g) => g.status === "valid");
  const errorGroups = groups.filter((g) => g.status === "error");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validExtensions = [".csv", ".xlsx", ".xls"];
    const hasValidExtension = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext),
    );

    if (!hasValidExtension) {
      alert(
        "Invalid file type. Please upload a CSV or Excel (.xlsx/.xls) file.",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size too large. Maximum size is 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setGroups([]);
    setSuccessMessage(null);
    setErrorMessage(null);
    setConfirmFailures([]);
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

      const receivedGroups = res.data?.groups || [];
      setGroups(receivedGroups);

      const errorCount = res.data?.error_groups || 0;
      const validCount = res.data?.valid_groups || 0;

      if (errorCount > 0) {
        alert(
          `Found issues in ${errorCount} product(s). Fix them in your file and re-upload, or confirm to import only the ${validCount} valid product(s).`,
        );
      } else {
        alert(`✅ File is valid! ${validCount} product(s) ready to import.`);
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
    if (validGroups.length === 0) {
      alert("No valid products to save");
      return;
    }

    setConfirmLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setConfirmFailures([]);

    const payloadGroups = validGroups.map((g) => ({
      row_group: g.row_group,
      rows: g.rows,
    }));

    try {
      const res = (await apiClient(
        `${import.meta.env.VITE_SERVER}/product/bulk/confirm`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { groups: payloadGroups },
        },
      )) as ConfirmResponse;

      const { success, failed, total, results } = res.data;

      setSuccessMessage(
        `✅ Successfully created ${success} of ${total} product(s).${
          failed > 0 ? ` ⚠️ ${failed} failed — see details below.` : ""
        }`,
      );

      const failures = results.filter((r) => r.status === "failed");
      if (failures.length > 0) {
        console.error("Failed products:", failures);
        setConfirmFailures(failures);
      }

      // Clear only what succeeded is implicit — reset the whole form since
      // the file/rows have already been submitted
      setGroups([]);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Confirm error:", err);
      alert(err.message || "Failed to save products. Please try again.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setGroups([]);
    setSuccessMessage(null);
    setErrorMessage(null);
    setConfirmFailures([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadSampleCSV = () => {
    const csvContent = `row_group,product_name,brand_name,uom_name,cost_price,selling_price,regular_price,description,category_names,variant_name,weight,weight_unit,is_replaceable,additional_price,image_url,is_primary_image
1,Basmati Rice,Bashundhara Rice,Kilogram,80,120,130,Premium long grain rice,Rice,Grocery,1kg Pack,1,kg,false,0,https://example.com/rice-1kg.jpg,true
1,Basmati Rice,Bashundhara Rice,Kilogram,80,220,240,Premium long grain rice,Rice,Grocery,5kg Pack,5,kg,false,100,https://example.com/rice-5kg.jpg,true
2,Cooking Oil,Rupchanda,Liter,150,190,200,Refined sunflower oil,Grocery,1L Bottle,1,l,false,0,https://example.com/oil-1l.jpg,true`;

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
            <strong>row_group:</strong> any repeatable value grouping rows that
            belong to the same product (e.g. multiple variants of one product
            share the same row_group)
          </li>
          <li>
            <strong>Required columns:</strong> row_group, product_name,
            brand_name, uom_name, variant_name, cost_price, selling_price,
            regular_price
          </li>
          <li>
            <strong>Optional columns:</strong> description, category_names,
            weight, weight_unit, is_replaceable, additional_price, image_url,
            is_primary_image
          </li>
          <li>
            <strong>brand_name / uom_name / category_names:</strong> just type
            the name — matching existing records are reused, new names are
            created automatically
          </li>
          <li>
            <strong>category_names:</strong> comma-separated for multiple
            categories (e.g. "Rice,Grocery")
          </li>
          <li>
            Product code, variant code, SKU, and barcode are generated
            automatically — do not include them in the file
          </li>
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
          accept=".csv,.xlsx,.xls"
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
          disabled={confirmLoading || validGroups.length === 0}
          className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {confirmLoading
            ? "Saving..."
            : `Confirm & Save (${validGroups.length})`}
        </button>

        <button
          onClick={handleReset}
          className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
        >
          Reset
        </button>
      </div>

      {errorGroups.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="font-semibold text-red-800 mb-2">
            Products with issues ({errorGroups.length}) — these will be skipped
            on Confirm:
          </h2>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {errorGroups.map((g) => (
              <li key={g.row_group} className="text-sm text-red-700">
                <span className="font-medium">
                  {g.product_name || "(missing name)"} (row_group {g.row_group}
                  ):
                </span>
                <ul className="list-disc list-inside ml-4">
                  {g.issues.map((issue, i) => (
                    <li key={i}>
                      Row {issue.row_index + 1} — {issue.field}: {issue.message}
                    </li>
                  ))}
                </ul>
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

      {confirmFailures.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium mb-2">
            Some products failed during save:
          </p>
          <ul className="text-sm text-yellow-800 space-y-1">
            {confirmFailures.map((f, i) => (
              <li key={i}>
                {f.product_name} (row_group {f.row_group}): {f.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Preview ({groups.length} product{groups.length !== 1 ? "s" : ""})
            </h2>
            <span className="text-sm text-gray-600">
              {validGroups.length} valid · {errorGroups.length} with issues
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Variants
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    UOM
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Categories
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issues
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groups.map((g) => (
                  <tr
                    key={g.row_group}
                    className={
                      g.status === "error" ? "bg-red-50" : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-4 py-3 text-sm border-r">
                      {g.status === "valid" ? (
                        <span className="text-green-600 font-medium">
                          ✓ Valid
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          ✗ Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                      {g.product_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {g.row_count}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {g.brand_status !== "unknown" && (
                        <span
                          className={
                            g.brand_status === "new"
                              ? "text-amber-600"
                              : "text-gray-500"
                          }
                        >
                          {g.brand_status === "new" ? "new" : "existing"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {g.uom_status !== "unknown" && (
                        <span
                          className={
                            g.uom_status === "new"
                              ? "text-amber-600"
                              : "text-gray-500"
                          }
                        >
                          {g.uom_status === "new" ? "new" : "existing"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 border-r">
                      {g.category_status.length > 0
                        ? g.category_status
                            .map(
                              (c) =>
                                `${c.name}${c.status === "new" ? " (new)" : ""}`,
                            )
                            .join(", ")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      {g.issues.length > 0
                        ? g.issues.map((i) => i.message).join("; ")
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
