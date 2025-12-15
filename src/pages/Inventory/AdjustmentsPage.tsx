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

interface Adjustment {
  id: number;
  branch_id: number;
  branch_name: string;
  branch_code: string;
  product_variant_id: number;
  product_name: string;
  product_code: string;
  variant_name: string;
  variant_code: string;
  type: "ADJUSTMENT" | "PURCHASE" | "SALE" | "TRANSFER" | "RETURN";
  reference_id: string;
  quantity: number;
  direction: "IN" | "OUT";
  created_at: string;
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

interface AdjustmentForm {
  id?: number;
  branch_id: number;
  product_variant_id: number;
  type: "ADJUSTMENT";
  reference_id: string;
  quantity: number;
  direction: "IN" | "OUT";
}

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<Adjustment | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    branch_id: "",
    product_variant_id: "",
    direction: "",
    search: "",
    page: "1",
    limit: "10",
  });

  const { branches, products, fetchBranches, fetchProducts } = useQuickStore();

  const [form, setForm] = useState<AdjustmentForm>({
    branch_id: 0,
    product_variant_id: 0,
    type: "ADJUSTMENT",
    reference_id: "",
    quantity: 0,
    direction: "IN",
  });

  // Fetch adjustments from API
  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      // First, let's fetch from stock/adjustments API
      const requestData: any = {
        page: filters.page,
        limit: filters.limit,
        type: "ADJUSTMENT",
      };

      // Add filters only if they have values
      if (filters.branch_id) requestData.branch_id = filters.branch_id;
      if (filters.product_variant_id)
        requestData.product_variant_id = filters.product_variant_id;
      if (filters.direction) requestData.direction = filters.direction;
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
        // Assuming the API returns data in response.data.data
        setAdjustments(response.data.data || response.data || []);
      }
    } catch (err: any) {
      console.error("Fetch adjustments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchProducts();
  }, [fetchBranches, fetchProducts]);

  // Fetch when filters change
  useEffect(() => {
    fetchAdjustments();
  }, [filters]);

  // Open Add Dialog
  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedAdjustment(null);
    setForm({
      branch_id: 0,
      product_variant_id: 0,
      type: "ADJUSTMENT",
      reference_id: "",
      quantity: 0,
      direction: "IN",
    });
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleEdit = (adjustment: Adjustment) => {
    setIsEditing(true);
    setSelectedAdjustment(adjustment);
    setForm({
      id: adjustment.id,
      branch_id: adjustment.branch_id,
      product_variant_id: adjustment.product_variant_id,
      type: "ADJUSTMENT",
      reference_id: adjustment.reference_id || "",
      quantity: Math.abs(adjustment.quantity), // Get absolute value
      direction:
        adjustment.direction || (adjustment.quantity > 0 ? "IN" : "OUT"),
    });
    setDialogOpen(true);
  };

  // Save Adjustment (Create/Update)
  const handleSave = async () => {
    // Validation
    if (!form.branch_id || !form.product_variant_id || form.quantity <= 0) {
      return alert("Please fill all required fields correctly");
    }

    try {
      if (isEditing && selectedAdjustment) {
        // Note: Since we're updating a stock transaction, we might need to reverse and re-apply
        // For simplicity, we'll create a new adjustment and optionally delete the old one
        alert(
          "Editing adjustments might require special handling. Creating new adjustment instead."
        );
      }

      // Create new stock transaction
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/create-stock/transaction`,
        {
          method: "POST",
          tokenType: "jwt",
          data: form,
        }
      );

      if (response.success) {
        await fetchAdjustments();
        setDialogOpen(false);
        alert("Stock adjustment recorded successfully!");

        // Reset form
        setForm({
          branch_id: 0,
          product_variant_id: 0,
          type: "ADJUSTMENT",
          reference_id: "",
          quantity: 0,
          direction: "IN",
        });
      } else {
        throw new Error(response.message || "Failed to record adjustment");
      }
    } catch (err: any) {
      console.error("Save adjustment error:", err);
      alert(err.message || "Failed to record adjustment");
    }
  };

  // Delete Adjustment
  const handleDelete = async (adjustment: Adjustment) => {
    if (!confirm(`Delete adjustment for ${adjustment.product_name}?`)) return;

    try {
      alert(
        "Deleting stock adjustments requires special handling to reverse inventory changes."
      );

      // If you have a delete API endpoint, you could use:
      // const response = await apiClient(
      //   `${import.meta.env.VITE_SERVER}/inventory/stock/transactions/${adjustment.id}`,
      //   {
      //     method: "DELETE",
      //     tokenType: "jwt",
      //   }
      // );

      // For now, let's just show a message
      // await fetchAdjustments();
    } catch (err: any) {
      console.error("Delete adjustment error:", err);
      alert(err.message || "Failed to delete adjustment");
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
      direction: "",
      search: "",
      page: "1",
      limit: "10",
    });
  };

  // Apply filters
  

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Stock Adjustments
          </h1>
          <p className="text-gray-600 mt-1">Manage inventory adjustments</p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="btn-bw-primary  flex items-center gap-2"
        >
          <Plus size={16} /> Add Adjustment
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
                placeholder="Search product or branch..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
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
                  key={product.variant_id}
                  value={product.variant_id.toString()}
                >
                  {product.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Direction Filter */}
          <div>
            <Label htmlFor="direction">Direction</Label>
            <select
              id="direction"
              value={filters.direction}
              onChange={(e) => handleFilterChange("direction", e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Directions</option>
              <option value="IN">IN (Increase)</option>
              <option value="OUT">OUT (Decrease)</option>
            </select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={adjustments}
        label="Stock Adjustments"
        loading={loading}
        showColumns={[
          { key: "created_at", label: "Date & Time" },
          { key: "branch_name", label: "Branch" },
          { key: "product_name", label: "Product" },
          { key: "variant_name", label: "Variant" },
          { key: "quantity", label: "Quantity" },
          { key: "direction", label: "Direction" },
        ]}
        columnFormats={{
          created_at: (val) => formatDate(val),
          direction: (val) => (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                val === "IN"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {val}
            </span>
          ),
          reference_id: (val) =>
            val || <span className="text-gray-400">-</span>,
        }}
        printHead={[
          { label: "Date", value: "created_at" },
          { label: "Branch", value: "branch_name" },
          { label: "Product", value: "product_name" },
          { label: "Quantity", value: "quantity" },
          { label: "Direction", value: "direction" },
          { label: "Reference", value: "reference_id" },
          { label: "Type", value: "type" },
        ]}
        actions={[
          {
            label: <Pen size={16} />,
            onClick: handleEdit,
            title: "Edit Adjustment",
          },
          {
            label: <Trash size={16} />,
            onClick: handleDelete,
            title: "Delete Adjustment",
            className: "text-red-600 hover:text-red-800",
          },
        ]}
      />

      {/* Dialog for Add/Edit Adjustment */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-50">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Stock Adjustment" : "Add Stock Adjustment"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Branch Selection */}
            <div>
              <Label htmlFor="branch">Branch *</Label>
              <select
                id="branch"
                value={form.branch_id}
                onChange={(e) =>
                  setForm({ ...form, branch_id: Number(e.target.value) })
                }
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="0">Select Branch</option>
                {branches.map((branch: Branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            <div>
              <Label htmlFor="product">Product *</Label>
              <select
                id="product"
                value={form.product_variant_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    product_variant_id: Number(e.target.value),
                  })
                }
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="0">Select Product</option>
                {products.map((product: Product) => (
                  <option key={product.variant_id} value={product.variant_id}>
                    {product.display_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Direction Selection */}
            <div>
              <Label htmlFor="direction">Adjustment Type *</Label>
              <select
                id="direction"
                value={form.direction}
                onChange={(e) =>
                  setForm({
                    ...form,
                    direction: e.target.value as "IN" | "OUT",
                  })
                }
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="IN">Increase Stock (IN)</option>
                <option value="OUT">Decrease Stock (OUT)</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter quantity"
                className="w-full"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) })
                }
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Positive number required
              </p>
            </div>

            {/* Reference ID */}
            <div>
              <Label htmlFor="reference_id">Reference ID (Optional)</Label>
              <Input
                id="reference_id"
                type="text"
                placeholder="e.g., ADJ-001, Manual-Correction"
                className="w-full"
                value={form.reference_id}
                onChange={(e) =>
                  setForm({ ...form, reference_id: e.target.value })
                }
              />
            </div>

            {/* Notes about the adjustment */}
            {isEditing && selectedAdjustment && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Editing stock adjustments may require
                  reversing the original transaction. Consider creating a new
                  adjustment instead.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                !form.branch_id ||
                !form.product_variant_id ||
                form.quantity <= 0
              }
            >
              {isEditing ? "Update Adjustment" : "Add Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
