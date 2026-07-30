"use client";

import { useState, useEffect } from "react";
import { Pen, Trash, Plus } from "lucide-react";
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

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_previous: boolean;
  has_next: boolean;
}

export default function StockRecordPage() {
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "adjust">("add");
  const [selectedStock, setSelectedStock] = useState<StockRecord | null>(null);

  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
    has_previous: false,
    has_next: false,
  });

  // Filter state — same shape as before, just no longer driven by a custom panel
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
            search: filters.search || undefined,
            page: parseInt(filters.page),
            limit: parseInt(filters.limit),
          },
        },
      );

      if (response.success) {
        setStockRecords(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        } else {
          const total = response.data.data?.length || 0;
          setPagination((prev) => ({
            ...prev,
            current_page: parseInt(filters.page),
            per_page: parseInt(filters.limit),
            total_items: total,
            total_pages: Math.max(
              1,
              Math.ceil(total / parseInt(filters.limit)),
            ),
          }));
        }
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
  }, [fetchBranches, fetchProducts]);

  useEffect(() => {
    fetchStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.limit,
    filters.branch_id,
    filters.product_variant_id,
    filters.search,
  ]);

  const handleOpenAdd = () => {
    setDialogType("add");
    setForm({ branch_id: 0, product_variant_id: 0, quantity: 0 });
    setSelectedStock(null);
    setDialogOpen(true);
  };

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
        },
      );

      if (response.success) {
        fetchStock();
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
        },
      );

      if (response.success) {
        fetchStock();
        alert("Stock removed successfully!");
      } else {
        throw new Error(response.message || "Failed to remove stock");
      }
    } catch (err: any) {
      console.error("Delete stock error:", err);
      alert(err.message || "Failed to remove stock");
    }
  };

  // NEW: fed to DataTable's onSearchChange — server-side search, so local
  // text filtering inside DataTable is skipped automatically.
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: "1" }));
  };

  // NEW: fed to DataTable's onFilterChange. `next` is a Record<string, string>
  // keyed by each filter's `key` — map it back onto your own filter state.
  const handleTableFilterChange = (next: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      branch_id: next.branch_id ?? "",
      product_variant_id: next.product_variant_id ?? "",
      page: "1",
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page: page.toString() }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
    }).format(value);
  };

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
            Total items: {pagination.total_items}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Items-per-page isn't a row filter, so it stays outside the
              DataTable `filters` prop — just a small standalone control */}
          <div className="flex items-center gap-2">
            <Label htmlFor="limit" className="text-sm whitespace-nowrap">
              Per page
            </Label>
            <select
              id="limit"
              value={filters.limit}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  limit: e.target.value,
                  page: "1",
                }))
              }
              className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <Button
            onClick={handleOpenAdd}
            className="btn-bw-primary text-white flex items-center gap-2"
          >
            <Plus size={16} /> Add Stock
          </Button>
        </div>
      </div>

      {/* DataTable — filters, search, and pagination all handled by the
          component itself now; no separate filter card needed. */}
      <DataTable
        data={stockRecords}
        label="Stock Records"
        loading={loading}
        rowKey="stock_id"
        showColumns={[
          { key: "branch_name", label: "Branch" },
          { key: "product_name", label: "Product" },
          { key: "variant_name", label: "Variant" },
          { key: "quantity", label: "Quantity" },
          { key: "selling_price", label: "Selling Price" },
          { key: "cost_price", label: "Cost Price" },
        ]}
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
        // NEW: replaces the hand-built filter card
        filters={[
          {
            key: "branch_id",
            label: "Branch",
            type: "select",
            options: branches.map((b: Branch) => ({
              label: b.name,
              value: b.id,
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
        ]}
        onFilterChange={handleTableFilterChange}
        onSearchChange={handleSearchChange}
        filtersTitle="Filters"
        // Server-side pagination
        pagination
        page={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.per_page}
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
