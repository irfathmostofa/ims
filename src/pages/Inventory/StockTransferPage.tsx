"use client";

import { useState } from "react";
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

type StockTransfer = {
  id: number;
  fromBranch: string;
  toBranch: string;
  product: string;
  quantity: number;
  date: string;
};

export default function StockTransferPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([
    {
      id: 1,
      fromBranch: "Main Branch",
      toBranch: "Warehouse",
      product: "Laptop",
      quantity: 5,
      date: "2025-09-14",
    },
    {
      id: 2,
      fromBranch: "Warehouse",
      toBranch: "Main Branch",
      product: "Phone",
      quantity: 10,
      date: "2025-09-12",
    },
  ]);

  const [form, setForm] = useState<StockTransfer>({
    id: 0,
    fromBranch: "",
    toBranch: "",
    product: "",
    quantity: 0,
    date: new Date().toISOString().split("T")[0],
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  // ✅ Add / Update Transfer
  const handleSave = () => {
    if (
      !form.fromBranch ||
      !form.toBranch ||
      !form.product ||
      form.quantity <= 0
    ) {
      return alert("Please fill all fields correctly");
    }

    if (form.id) {
      setTransfers((prev) =>
        prev.map((t) => (t.id === form.id ? { ...form } : t))
      );
    } else {
      const newId = transfers.length
        ? Math.max(...transfers.map((t) => t.id)) + 1
        : 1;
      setTransfers((prev) => [...prev, { ...form, id: newId }]);
    }

    setForm({
      id: 0,
      fromBranch: "",
      toBranch: "",
      product: "",
      quantity: 0,
      date: new Date().toISOString().split("T")[0],
    });
    setDialogOpen(false);
  };

  // ✅ Edit
  const handleEdit = (t: StockTransfer) => {
    setForm({ ...t });
    setDialogOpen(true);
  };

  // ✅ Delete
  const handleDelete = (t: StockTransfer) => {
    if (!confirm(`Delete transfer of ${t.product}?`)) return;
    setTransfers((prev) => prev.filter((x) => x.id !== t.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">Stock Transfer</h1>

        {/* Add Transfer Button */}
        <Button
          onClick={() => setDialogOpen(true)}
          className="btn-bw-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Transfer
        </Button>
      </div>
      {/* DataTable */}
      <DataTable
        data={transfers}
        label="Stock Transfers"
        hiddenColumns={["id"]}
        rowsPerPage={10}
        printHead={[
          { label: "From Branch", value: "fromBranch" },
          { label: "To Branch", value: "toBranch" },
          { label: "Product", value: "product" },
          { label: "Quantity", value: "quantity" },
          { label: "Date", value: "date" },
        ]}
        actions={[
          { label: <Pen size={16} />, onClick: handleEdit },
          { label: <Trash size={16} />, onClick: handleDelete },
        ]}
      />

      {/* Dialog for Add / Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-amber-50">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Transfer" : "Add Transfer"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <input
              type="text"
              placeholder="From Branch"
              className="border px-3 py-2 rounded w-full"
              value={form.fromBranch}
              onChange={(e) => setForm({ ...form, fromBranch: e.target.value })}
            />
            <input
              type="text"
              placeholder="To Branch"
              className="border px-3 py-2 rounded w-full"
              value={form.toBranch}
              onChange={(e) => setForm({ ...form, toBranch: e.target.value })}
            />
            <input
              type="text"
              placeholder="Product"
              className="border px-3 py-2 rounded w-full"
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              className="border px-3 py-2 rounded w-full"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
            />
            <input
              type="date"
              className="border px-3 py-2 rounded w-full"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="btn-bw-primary">
              {form.id ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
