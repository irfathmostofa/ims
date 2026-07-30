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
    limit: "10",
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
        `${import.meta.env.VITE_SERVER}/inventory/stock/adjustment-report`,
        {
          method: "POST",
          tokenType: "jwt",
          data: requestData,
        },
      );
      console.log(response);
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

      {/* DataTable */}
      <DataTable
        data={ledgerData}
        label="Stock Ledger"
        loading={loading}
        serial
        serialLabel="SL"
        onSearchChange={(v) => handleFilterChange("search", v)}
        filters={[
          {
            key: "branch_id",
            label: "Branch",
            type: "select",
            options: branches.map((b: Branch) => ({
              label: b.name,
              value: b.id.toString(),
            })),
          },
          {
            key: "product_variant_id",
            label: "Product",
            type: "select",
            options: products.map((p: Product) => ({
              label: p.display_name,
              value: p.variant_id,
            })),
          },
          { key: "fromDate", label: "From", type: "date", group: "Date Range" },
          { key: "toDate", label: "To", type: "date", group: "Date Range" },
        ]}
        onFilterChange={(next) => {
          setFilters((prev) => ({
            ...prev,
            branch_id: next.branch_id ?? "",
            product_variant_id: next.product_variant_id ?? "",
            fromDate: next.fromDate ?? "",
            toDate: next.toDate ?? "",
            page: "1",
          }));
        }}
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
        selectable
        pagination
        page={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.per_page}
        onRowsPerPageChange={(newLimit) => {
          // 👈 FIX: This must be a function
          setFilters((prev) => ({
            ...prev,
            limit: newLimit.toString(),
            page: "1", // Reset to page 1 when changing rows per page
          }));
        }}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />
    </div>
  );
}
