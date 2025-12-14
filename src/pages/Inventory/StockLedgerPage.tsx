"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/dataTable";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { apiClient } from "@/hook/apiClient";
import { useQuickStore } from "@/store/quickStore";
import { formatDate } from "@/components/utils/formatter";

interface StockAdjustment {
  id: number;
  branch_id: number;
  branch_name: string;
  branch_code: string;
  product_variant_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  variant_name: string;
  variant_code: string;
  quantity: number;
  absolute_quantity: number;
  transaction_type: "IN" | "OUT" | "NO CHANGE";
  type: string;
  direction: string;
  reference_id: string;
  notes: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  opening_balance?: number;
  closing_balance?: number;
  running_balance?: number;
  transaction_date?: string;
}

interface Branch {
  id: number;
  name: string;
}

interface Product {
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_name: string;
  display_name: string;
  stock_qty: string;
}

interface ApiResponse {
  data: StockAdjustment[];
  ledger_by_date: any[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
  };
  summary: {
    total_transactions: number;
    total_records: number;
    total_in: number;
    total_out: number;
    net_change: number;
  };
}

export default function StockLedgerPage() {
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState<StockAdjustment[]>([]);


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

  // Fetch stock ledger data
  const fetchStockLedger = async () => {
    setLoading(true);
    try {
      // Prepare request data
      const requestData: any = {
        page: filters.page,
        limit: filters.limit,
      };

      // Add filters only if they have values
      if (filters.branch_id) requestData.branch_id = filters.branch_id;
      if (filters.product_variant_id)
        requestData.product_variant_id = filters.product_variant_id;
      if (filters.fromDate) requestData.date_from = filters.fromDate;
      if (filters.toDate) requestData.date_to = filters.toDate;
      if (filters.search) requestData.search = filters.search;

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/stock/adjustments`,
        {
          method: "POST",
          tokenType: "jwt",
          data: requestData,
        }
      );

      if (response.success) {
        const data: ApiResponse = response.data;
        setLedgerData(data.data || []);
      }
    } catch (err: any) {
      console.error("Fetch stock ledger error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStockLedger();
  }, [filters]);
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  useEffect(() => {
    fetchBranches();
    fetchProducts();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Ledger</h1>
        <p className="text-gray-600 mt-1">
          Track all stock adjustments and movements
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search product or branch..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-full">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                className="w-full"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              />
            </div>
            <div className="w-full">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                className="w-full"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
              />
            </div>
          </div>
          {/* Branch Filter */}

          {/* Product Filter */}
          <div>
            <Label htmlFor="product">Product</Label>
            <select
              id="product"
              value={filters.product_variant_id}
              onChange={(e) =>
                handleFilterChange("product_variant_id", e.target.value)
              }
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Products</option>
              {products.map((product: Product) => (
                <option
                  key={product.variant_id}
                  value={product.variant_id.toString()}
                >
                  {product.display_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="branch">Branch</Label>
            <select
              id="branch"
              value={filters.branch_id}
              onChange={(e) => handleFilterChange("branch_id", e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Branches</option>
              {branches.map((branch: Branch) => (
                <option key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          {/* Date Range */}
        </div>
      </div>

      {/* DataTable */}

      <DataTable
        data={ledgerData}
        label="Stock Ledger"
        loading={loading}
        showColumns={[
          { key: "created_at", label: "Date" },
          { key: "branch_name", label: "Branch" },
          { key: "product_name", label: "Product" },
          { key: "quantity", label: "Quantity" },
          { key: "direction", label: "Direction" },
        ]}
        columnFormats={{
          created_at: (val) => formatDate(val),
        }}
        printHead={[
          { label: "Date", value: "created_at" },
          { label: "Branch", value: "branch_name" },
          { label: "Product", value: "product_name" },
          { label: "Quantity", value: "quantity" },
          { label: "Direction", value: "direction" },
          { label: "Type", value: "type" },
        ]}
        actions={[]}
      />
    </div>
  );
}
