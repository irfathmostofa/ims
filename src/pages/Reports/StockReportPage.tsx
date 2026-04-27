"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/dataTable";
import { apiClient } from "@/hook/apiClient";

// Stock item interface matching the API response
interface StockItem {
  stock_id: number;
  quantity: string;
  branch_id: number;
  branch_name: string;
  branch_code: string;
  variant_id: number;
  variant_name: string;
  variant_code: string;
  product_id: number;
  product_name: string;
  product_code: string;
  selling_price: string;
  cost_price: string;
  primaryImage: string;
}

export default function StockReportPage() {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const fetchStockData = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/get-stock`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            page: page,
            limit: limit,
          },
        },
      );

      if (result.success) {
        setStockData(result.data.data);
        setPagination({
          currentPage: result.data.pagination.current_page,
          totalPages: result.data.pagination.total_pages,
          total: result.data.pagination.total,
          limit: result.data.pagination.limit || limit,
        });
      } else {
        console.error("API error:", result.message);
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(pagination.currentPage, pagination.limit);
  }, [pagination.currentPage]);

  // Column formats for custom rendering
  const columnFormats = {
    quantity: (value: string) => (
      <span className="font-semibold text-blue-600">
        {parseFloat(value || "0").toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
    selling_price: (value: string) => (
      <span className="text-green-600 font-medium">
        ৳{" "}
        {parseFloat(value || "0").toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
    cost_price: (value: string) => (
      <span className="text-gray-600">
        ৳{" "}
        {parseFloat(value || "0").toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
  };

  // Calculate summary statistics
  const totalQuantity = stockData.reduce(
    (sum, item) => sum + parseFloat(item.quantity || "0"),
    0,
  );

  const totalCostValue = stockData.reduce(
    (sum, item) =>
      sum +
      parseFloat(item.cost_price || "0") * parseFloat(item.quantity || "0"),
    0,
  );

  const totalSellingValue = stockData.reduce(
    (sum, item) =>
      sum +
      parseFloat(item.selling_price || "0") * parseFloat(item.quantity || "0"),
    0,
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Stock Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage inventory across all branches
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && stockData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Total Stock Items</div>
            <div className="text-2xl font-bold text-gray-800">
              {pagination.total}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Total Quantity</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalQuantity.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Total Value (Cost)</div>
            <div className="text-2xl font-bold text-gray-800">
              ৳{" "}
              {totalCostValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">
              Total Value (Selling)
            </div>
            <div className="text-2xl font-bold text-green-600">
              ৳{" "}
              {totalSellingValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div>
        <DataTable
          data={stockData}
          label="Stock List"
          showColumns={[
            { key: "product_code", label: "Product Code" },
            { key: "product_name", label: "Product Name" },
            { key: "variant_name", label: "Variant Name" },
            { key: "branch_name", label: "Branch Name" },
            { key: "quantity", label: "Stock Qty" },
            { key: "selling_price", label: "Selling Price" },
            { key: "cost_price", label: "Cost Price" },
            { key: "primaryImage", label: "Image" },
          ]}
          columnFormats={columnFormats}
          loading={loading}
          pagination
          rowsPerPage={pagination.limit}
          page={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          serial
        />
      </div>
    </div>
  );
}
