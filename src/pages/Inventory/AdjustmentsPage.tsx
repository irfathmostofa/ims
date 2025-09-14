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

type Adjustment = {
  id: number;
  branch: string;
  product: string;
  type: "Increase" | "Decrease";
  quantity: number;
  date: string;
  notes?: string;
};

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([
    {
      id: 1,
      branch: "Main Branch",
      product: "Laptop",
      type: "Increase",
      quantity: 5,
      date: "2025-09-14",
      notes: "Stock correction",
    },
    {
      id: 2,
      branch: "Warehouse",
      product: "Phone",
      type: "Decrease",
      quantity: 2,
      date: "2025-09-12",
      notes: "Damaged items",
    },
  ]);

  const [form, setForm] = useState<Adjustment>({
    id: 0,
    branch: "",
    product: "",
    type: "Increase",
    quantity: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  // ✅ Add / Update Adjustment
  const handleSave = () => {
    if (!form.branch || !form.product || form.quantity <= 0) {
      return alert("Please fill all required fields correctly");
    }

    if (form.id) {
      setAdjustments((prev) =>
        prev.map((a) => (a.id === form.id ? { ...form } : a))
      );
    } else {
      const newId = adjustments.length
        ? Math.max(...adjustments.map((a) => a.id)) + 1
        : 1;
      setAdjustments((prev) => [...prev, { ...form, id: newId }]);
    }

    setForm({
      id: 0,
      branch: "",
      product: "",
      type: "Increase",
      quantity: 0,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setDialogOpen(false);
  };

  // ✅ Edit
  const handleEdit = (a: Adjustment) => {
    setForm({ ...a });
    setDialogOpen(true);
  };

  // ✅ Delete
  const handleDelete = (a: Adjustment) => {
    if (!confirm(`Delete adjustment for ${a.product}?`)) return;
    setAdjustments((prev) => prev.filter((x) => x.id !== a.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock Adjustments</h1>

        {/* Add Adjustment Button */}
        <Button
          onClick={() => setDialogOpen(true)}
          className="btn-bw-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Adjustment
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        data={adjustments}
        label="Stock Adjustments"
        hiddenColumns={["id"]}
        rowsPerPage={10}
        printHead={[
          { label: "Branch", value: "branch" },
          { label: "Product", value: "product" },
          { label: "Type", value: "type" },
          { label: "Quantity", value: "quantity" },
          { label: "Date", value: "date" },
          { label: "Notes", value: "notes" },
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
              {form.id ? "Edit Adjustment" : "Add Adjustment"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <input
              type="text"
              placeholder="Branch"
              className="border px-3 py-2 rounded w-full"
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
            />
            <input
              type="text"
              placeholder="Product"
              className="border px-3 py-2 rounded w-full"
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
            />
            <select
              className="border px-3 py-2 rounded w-full"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as "Increase" | "Decrease",
                })
              }
            >
              <option value="Increase">Increase</option>
              <option value="Decrease">Decrease</option>
            </select>
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
            <textarea
              placeholder="Notes (optional)"
              className="border px-3 py-2 rounded w-full"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
