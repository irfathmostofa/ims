"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/ui/dataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";
import { apiClient } from "@/hook/apiClient";
import { useQuickStore } from "@/store/quickStore";
import { formatDate } from "@/components/utils/formatter";

interface StockLedgerEntry {
  date: string;
  product_variant_id: number;
  product_name: string;
  product_code: string;
  variant_name: string;
  variant_code: string;
  branch_id: number;
  branch_name: string;
  branch_code: string;
  daily_total_in: number;
  daily_total_out: number;
  daily_net_change: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: StockLedgerEntry[];
    pagination: {
      current_page: number;
      per_page: number;
      total_items: number;
      total_pages: number;
      has_previous: boolean;
      has_next: boolean;
    };
    summary: {
      total_records: number;
      total_in: number;
      total_out: number;
      net_change: number;
    };
  };
  message: string;
}

interface Branch {
  id: number;
  name: string;
  code: string;
}

interface Product {
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_name: string;
  display_name: string;
  stock_qty: string;
}

export default function StockLedgerPage() {
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState<StockLedgerEntry[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 0,
    has_previous: false,
    has_next: false,
  });

  const { branches, products, fetchBranches, fetchProducts } = useQuickStore();

  const [filters, setFilters] = useState({
    branch_id: "",
    product_variant_id: "",
    fromDate: "",
    toDate: "",
    search: "",
    page: "1",
    limit: "20",
  });

  const [showFilters, setShowFilters] = useState(true);

  // Fetch stock ledger data
  const fetchStockLedger = async () => {
    setLoading(true);
    try {
      const requestData: any = {
        page: parseInt(filters.page),
        limit: parseInt(filters.limit),
      };

      // Add filters only if they have values
      if (filters.branch_id)
        requestData.branch_id = parseInt(filters.branch_id);
      if (filters.product_variant_id)
        requestData.product_variant_id = parseInt(filters.product_variant_id);
      if (filters.fromDate) requestData.date_from = filters.fromDate;
      if (filters.toDate) requestData.date_to = filters.toDate;
      if (filters.search) requestData.search = filters.search;

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/stock/adjustments-report`,
        {
          method: "POST",
          tokenType: "jwt",
          data: requestData,
        },
      );

      if (response.success) {
        const apiResponse = response.data as ApiResponse["data"];
        setLedgerData(apiResponse.data || []);
        setPagination(apiResponse.pagination);
      }
    } catch (err: any) {
      console.error("Fetch stock ledger error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockLedger();
  }, [
    filters.page,
    filters.limit,
    filters.branch_id,
    filters.product_variant_id,
    filters.fromDate,
    filters.toDate,
    filters.search,
  ]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: "1", // Reset to first page when filter changes
    }));
  };

  const clearFilters = () => {
    setFilters({
      branch_id: "",
      product_variant_id: "",
      fromDate: "",
      toDate: "",
      search: "",
      page: "1",
      limit: "20",
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page: page.toString(),
    }));
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.branch_id) count++;
    if (filters.product_variant_id) count++;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  useEffect(() => {
    fetchBranches();
    fetchProducts();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
      {/* Filters Toggle Button for Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full bg-white border rounded-lg p-3 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </div>
          {showFilters ? (
            <X className="w-4 h-4" />
          ) : (
            <Filter className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Filters */}
      <div
        className={`bg-white rounded-lg border shadow-sm transition-all duration-300 ${
          showFilters ? "block" : "hidden md:block"
        }`}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Filters</h2>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-sm font-medium">
                Search
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Product or branch..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            {/* Branch Filter */}
            <div>
              <Label htmlFor="branch" className="text-sm font-medium">
                Branch
              </Label>
              <select
                id="branch"
                value={filters.branch_id}
                onChange={(e) =>
                  handleFilterChange("branch_id", e.target.value)
                }
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Branches</option>
                {branches.map((branch: Branch) => (
                  <option key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Filter */}
            <div>
              <Label htmlFor="product" className="text-sm font-medium">
                Product
              </Label>
              <select
                id="product"
                value={filters.product_variant_id}
                onChange={(e) =>
                  handleFilterChange("product_variant_id", e.target.value)
                }
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Products</option>
                {products.map((product: Product) => (
                  <option key={product.variant_id} value={product.variant_id}>
                    {product.display_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="date"
                    placeholder="From"
                    value={filters.fromDate}
                    onChange={(e) =>
                      handleFilterChange("fromDate", e.target.value)
                    }
                    className="text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    placeholder="To"
                    value={filters.toDate}
                    onChange={(e) =>
                      handleFilterChange("toDate", e.target.value)
                    }
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={ledgerData}
        label="Stock Ledger"
        loading={loading}
        serial
        serialLabel="SL"
        showColumns={[
          { key: "date", label: "Date" },
          { key: "branch_name", label: "Branch" },
          { key: "product_name", label: "Product" },
          { key: "variant_name", label: "Variant" },
          { key: "daily_total_in", label: "IN" },
          { key: "daily_total_out", label: "OUT" },
          { key: "daily_net_change", label: "Net Change" },
        ]}
        columnFormats={{
          date: (val) => formatDate(val),
          daily_total_in: (val) => (
            <span className="text-green-600 font-medium">{val || 0}</span>
          ),
          daily_total_out: (val) => (
            <span className="text-red-600 font-medium">{val || 0}</span>
          ),
          daily_net_change: (val) => (
            <span
              className={`font-semibold ${
                val > 0
                  ? "text-green-600"
                  : val < 0
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {val > 0 ? `+${val}` : val}
            </span>
          ),
        }}
        printHead={[
          { label: "Date", value: "date" },
          { label: "Branch", value: "branch_name" },
          { label: "Product", value: "product_name" },
          { label: "Variant", value: "variant_name" },
          { label: "IN", value: "daily_total_in" },
          { label: "OUT", value: "daily_total_out" },
          { label: "Net Change", value: "daily_net_change" },
        ]}
        actions={[]}
        pagination={true}
        page={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.per_page}
      />
    </div>
  );
}
