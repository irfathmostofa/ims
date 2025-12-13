"use client";

import { useState, useEffect } from "react";
import { Pen, Trash, Plus, Search, Filter, X } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/hook/apiClient";
import { useQuickStore } from "@/store/quickStore";

interface StockRecord {
  stock_id: number;
  quantity: number;
  branch_id: number;
  branch_name: string;
  branch_code: string;
  variant_id: number;
  variant_name: string;
  variant_code: string;
  product_id: number;
  product_name: string;
  product_code: string;
  selling_price: number;
  regular_price: number;
  cost_price: number;
  product_description?: string;
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

interface StockRequest {
  branch_id: number;
  product_variant_id: number;
  quantity: number;
}

export default function StockRecordPage() {
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "adjust">("add");
  const [selectedStock, setSelectedStock] = useState<StockRecord | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    branch_id: "",
    product_variant_id: "",
    search: "",
    page: "1",
    limit: "10",
  });

  const { branches, products, fetchBranches, fetchProducts } = useQuickStore();

  const [form, setForm] = useState<StockRequest>({
    branch_id: 0,
    product_variant_id: 0,
    quantity: 0,
  });

  // Fetch stock records with pagination and filters
  const fetchStock = async () => {
    setLoading(true);
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/get-stock`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            branch_id: filters.branch_id ? parseInt(filters.branch_id) : null,
            product_variant_id: filters.product_variant_id
              ? parseInt(filters.product_variant_id)
              : null,
          },
        }
      );

      if (response.success) {
        setStockRecords(response.data.data || []);
      }
    } catch (err: any) {
      console.error("Fetch stock transfers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchProducts();
    fetchStock();
  }, [fetchBranches, fetchProducts]);

  // Fetch stock when filters change
  useEffect(() => {
    fetchStock();
  }, [filters.branch_id, filters.product_variant_id]);

  // Open Add Dialog
  const handleOpenAdd = () => {
    setDialogType("add");
    setForm({ branch_id: 0, product_variant_id: 0, quantity: 0 });
    setSelectedStock(null);
    setDialogOpen(true);
  };

  // Open Adjust Dialog
  const handleOpenAdjust = (record: StockRecord) => {
    setDialogType("adjust");
    setForm({
      branch_id: record.branch_id,
      product_variant_id: record.variant_id,
      quantity: 0,
    });
    setSelectedStock(record);
    setDialogOpen(true);
  };

  // Save Stock
  const handleSave = async () => {
    if (!form.branch_id || !form.product_variant_id || form.quantity === 0) {
      return alert("Please fill all fields correctly");
    }

    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/stock`,
        {
          method: "POST",
          tokenType: "jwt",
          data: form,
        }
      );

      if (response.success) {
        fetchStock(); // Refresh stock data
        setDialogOpen(false);
        alert("Stock updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update stock");
      }
    } catch (err: any) {
      console.error("Stock update error:", err);
      alert(err.message || "Failed to update stock");
    }
  };

  // Delete Stock (set to zero)
  const handleDelete = async (record: StockRecord) => {
    if (!confirm(`Remove all stock for ${record.product_name}?`)) return;

    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/stock`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            branch_id: record.branch_id,
            product_variant_id: record.variant_id,
            quantity: -record.quantity,
          },
        }
      );

      if (response.success) {
        fetchStock(); // Refresh stock data
        alert("Stock removed successfully!");
      } else {
        throw new Error(response.message || "Failed to remove stock");
      }
    } catch (err: any) {
      console.error("Delete stock error:", err);
      alert(err.message || "Failed to remove stock");
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: "1", // Reset to first page when filters change
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      branch_id: "",
      product_variant_id: "",
      search: "",
      page: "1",
      limit: "10",
    });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
    }).format(value);
  };

  // Format quantity display
  const formatQuantity = (quantity: number) => {
    return (
      <span
        className={`font-bold px-2 py-1 rounded ${
          quantity > 10
            ? "bg-green-100 text-green-800"
            : quantity > 0
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {quantity}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Record</h1>
          <p className="text-gray-600 mt-1">
            Total items: {stockRecords.length}
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus size={16} /> Add Stock
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Filter size={18} /> Filters
          </h2>
          <Button
            onClick={clearFilters}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <X size={14} /> Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search products..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchStock();
                  }
                }}
              />
            </div>
          </div>

          {/* Branch Filter */}
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
                  key={`${product.product_id}-${product.variant_id}`}
                  value={product.variant_id.toString()}
                >
                  {product.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Items per page */}
          <div>
            <Label htmlFor="limit">Items per page</Label>
            <select
              id="limit"
              value={filters.limit}
              onChange={(e) => handleFilterChange("limit", e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 items</option>
              <option value="20">20 items</option>
              <option value="50">50 items</option>
              <option value="100">100 items</option>
            </select>
          </div>
        </div>

        {/* Active filters */}
        {(filters.branch_id ||
          filters.product_variant_id ||
          filters.search) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.branch_id && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                Branch:{" "}
                {
                  branches.find((b) => b.id === parseInt(filters.branch_id))
                    ?.name
                }
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("branch_id", "")}
                />
              </span>
            )}
            {filters.product_variant_id && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                Product:{" "}
                {
                  products.find(
                    (p) => p.variant_id === parseInt(filters.product_variant_id)
                  )?.display_name
                }
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("product_variant_id", "")}
                />
              </span>
            )}
            {filters.search && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                Search: "{filters.search}"
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("search", "")}
                />
              </span>
            )}
          </div>
        )}
      </div>

      {/* DataTable */}

      <DataTable
        data={stockRecords}
        label="Stock Records"
        loading={loading}
        showColumns={[
          { key: "branch_name", label: "Branch" },
          { key: "product_name", label: "Product" },
          { key: "variant_name", label: "Variant" },
          { key: "quantity", label: "Quantity" },
          { key: "selling_price", label: "Selling Price" },
          { key: "cost_price", label: "Cost Price" },
        ]}
        rowsPerPage={parseInt(filters.limit)}
        columnFormats={{
          quantity: (val) => formatQuantity(val),
          selling_price: (val) => formatCurrency(val),
          cost_price: (val) => formatCurrency(val),
        }}
        printHead={[
          { label: "Branch", value: "branch_name" },
          { label: "Product", value: "product_name" },
          { label: "Variant", value: "variant_name" },
          { label: "Quantity", value: "quantity" },
          { label: "Selling Price", value: "selling_price" },
          { label: "Cost Price", value: "cost_price" },
        ]}
        actions={[
          {
            label: <Pen size={16} />,
            onClick: handleOpenAdjust,
            title: "Adjust Stock",
          },
          {
            label: <Trash size={16} />,
            onClick: handleDelete,
            title: "Remove Stock",
            className: "text-red-600 hover:text-red-800",
          },
        ]}
      />

      {/* Dialog for Add/Adjust Stock */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "add"
                ? "Add New Stock"
                : `Adjust Stock for ${selectedStock?.product_name}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {dialogType === "add" && (
              <>
                <div>
                  <Label htmlFor="dialog-branch">Branch</Label>
                  <select
                    id="dialog-branch"
                    value={form.branch_id}
                    onChange={(e) =>
                      setForm({ ...form, branch_id: Number(e.target.value) })
                    }
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">Select Branch</option>
                    {branches.map((branch: Branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="dialog-product">Product</Label>
                  <select
                    id="dialog-product"
                    value={form.product_variant_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        product_variant_id: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">Select Product</option>
                    {products.map((product: Product) => (
                      <option
                        key={`${product.product_id}-${product.variant_id}`}
                        value={product.variant_id}
                      >
                        {product.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="quantity">
                {dialogType === "add" ? "Quantity to Add" : "Adjustment Amount"}
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder={
                  dialogType === "add"
                    ? "Enter quantity"
                    : "Enter adjustment (+ to add, - to remove)"
                }
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) })
                }
              />
              {dialogType === "adjust" && selectedStock && (
                <p className="text-sm text-gray-500 mt-1">
                  Current stock:{" "}
                  <span className="font-semibold">
                    {selectedStock.quantity}
                  </span>
                  {form.quantity !== 0 && (
                    <span className="ml-2">
                      → New total:{" "}
                      <span className="font-semibold">
                        {selectedStock.quantity + form.quantity}
                      </span>
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                !form.branch_id ||
                !form.product_variant_id ||
                form.quantity === 0
              }
            >
              {dialogType === "add" ? "Add Stock" : "Adjust Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
