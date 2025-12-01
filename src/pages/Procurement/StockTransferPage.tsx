"use client";

import { useState, useEffect } from "react";
import { Pen, Trash, Plus, Minus } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiClient } from "@/hook/apiClient";
import { useQuickStore } from "@/store/quickStore";

interface StockTransfer {
  id: number;
  branch_id: number;
  branch_name: string;
  product_variant_id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  created_at: string;
  updated_at: string;
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

export default function StockTransferPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "adjust">("add");

  const { branches, products, fetchBranches, fetchProducts } = useQuickStore();

  const [form, setForm] = useState<StockRequest>({
    branch_id: 0,
    product_variant_id: 0,
    quantity: 0,
  });

  // Fetch stock transfers
  const fetchStockTransfers = async () => {
    setLoading(true);
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/stock`,
        {
          method: "GET",
          tokenType: "jwt",
        }
      );

      if (response.success) {
        setTransfers(response.data || []);
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
    fetchStockTransfers();
  }, [fetchBranches, fetchProducts]);

  // Open Add Dialog
  const handleOpenAdd = () => {
    setDialogType("add");
    setForm({ branch_id: 0, product_variant_id: 0, quantity: 0 });
    setDialogOpen(true);
  };

  // Open Adjust Dialog
  const handleOpenAdjust = (transfer: StockTransfer) => {
    setDialogType("adjust");
    setForm({
      branch_id: transfer.branch_id,
      product_variant_id: transfer.product_variant_id,
      quantity: 0, // Start with 0 for adjustment
    });
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
        await fetchStockTransfers();
        setForm({ branch_id: 0, product_variant_id: 0, quantity: 0 });
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
  const handleDelete = async (transfer: StockTransfer) => {
    if (!confirm(`Remove all stock for ${transfer.product_name}?`)) return;

    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/stock`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            branch_id: transfer.branch_id,
            product_variant_id: transfer.product_variant_id,
            quantity: -transfer.quantity,
          },
        }
      );

      if (response.success) {
        await fetchStockTransfers();
        alert("Stock removed successfully!");
      } else {
        throw new Error(response.message || "Failed to remove stock");
      }
    } catch (err: any) {
      console.error("Delete stock error:", err);
      alert(err.message || "Failed to remove stock");
    }
  };

  const getProductDisplayName = (transfer: StockTransfer) => {
    return transfer.variant_name
      ? `${transfer.product_name} (${transfer.variant_name})`
      : transfer.product_name;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">Stock Management</h1>

        <div className="flex gap-2">
          <Button
            onClick={handleOpenAdd}
            className="btn-bw-primary flex items-center gap-2"
          >
            <Plus size={16} /> Add Stock
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={transfers}
        label="Stock Records"
        loading={loading}
        rowsPerPage={10}
        columnFormats={{
          product_name: (row) => getProductDisplayName(row),
          updated_at: (val) => formatDate(val),
          quantity: (val) => (
            <span
              className={`font-semibold ${
                val > 0
                  ? "text-green-600"
                  : val < 0
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {val}
            </span>
          ),
        }}
        printHead={[
          { label: "Branch", value: "branch_name" },
          { label: "Product", value: "product_name" },
          { label: "Variant", value: "variant_name" },
          { label: "Quantity", value: "quantity" },
          { label: "Last Updated", value: "updated_at" },
        ]}
        actions={[
          {
            label: <Plus size={16} />,
            onClick: handleOpenAdjust,
            title: "Adjust Stock",
          },
          {
            label: <Trash size={16} />,
            onClick: handleDelete,
            title: "Remove Stock",
          },
        ]}
      />

      {/* Dialog for Add/Adjust Stock */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-50">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "add" ? "Add Stock" : "Adjust Stock"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <select
              value={form.branch_id}
              onChange={(e) =>
                setForm({ ...form, branch_id: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded w-full"
            >
              <option value={0}>Select Branch</option>
              {branches.map((branch: Branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <select
              value={form.product_variant_id}
              onChange={(e) =>
                setForm({ ...form, product_variant_id: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded w-full"
            >
              <option value={0}>Select Product</option>
              {products.map((product: Product) => (
                <option
                  key={`${product.product_id}-${product.variant_id}`}
                  value={product.variant_id}
                >
                  {product.display_name}
                </option>
              ))}
            </select>

            <div>
              <input
                type="number"
                placeholder={
                  dialogType === "add" ? "Quantity to add" : "Adjustment amount"
                }
                className="border px-3 py-2 rounded w-full"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {dialogType === "add"
                  ? "Enter positive quantity to add stock"
                  : "Positive to add, negative to remove stock"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSave}
              className="btn-bw-primary"
              disabled={
                !form.branch_id ||
                !form.product_variant_id ||
                form.quantity === 0
              }
            >
              {dialogType === "add" ? "Add" : "Adjust"} Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
