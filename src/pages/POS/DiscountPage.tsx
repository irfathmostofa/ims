"use client";

import { useState } from "react";
import { Pen, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Discount = {
  id: number;
  name: string;
  type: "Percentage" | "Fixed";
  value: number;
  description?: string;
};

export default function DiscountPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([
    { id: 1, name: "New Year Sale", type: "Percentage", value: 10 },
    { id: 2, name: "VIP Discount", type: "Fixed", value: 50 },
  ]);

  const [form, setForm] = useState<Discount>({
    id: 0,
    name: "",
    type: "Percentage",
    value: 0,
    description: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  // ✅ Save / Update
  const handleSave = () => {
    if (!form.name || !form.value) return alert("Please fill all fields");

    if (form.id) {
      setDiscounts((prev) =>
        prev.map((d) => (d.id === form.id ? { ...d, ...form } : d))
      );
    } else {
      const newId = discounts.length
        ? Math.max(...discounts.map((d) => d.id)) + 1
        : 1;
      setDiscounts((prev) => [...prev, { ...form, id: newId }]);
    }

    setForm({ id: 0, name: "", type: "Percentage", value: 0, description: "" });
    setDialogOpen(false);
  };

  // ✅ Edit
  const handleEdit = (d: Discount) => {
    setForm(d);
    setDialogOpen(true);
  };

  // ✅ Delete
  const handleDelete = (d: Discount) => {
    if (!confirm(`Delete discount ${d.name}?`)) return;
    setDiscounts((prev) => prev.filter((x) => x.id !== d.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        {" "}
        <h1 className="text-2xl font-bold">Discount Management</h1>
        <Button
          className="btn-bw-primary"
          onClick={() => {
            setForm({
              id: 0,
              name: "",
              type: "Percentage",
              value: 0,
              description: "",
            });
            setDialogOpen(true);
          }}
        >
          Add Discount
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        data={discounts}
        label="Discount List"
      
        rowsPerPage={10}
        printHead={[
          { label: "Name", value: "name" },
          { label: "Type", value: "type" },
          { label: "Value", value: "value" },
          { label: "Description", value: "description" },
        ]}
        actions={[
          { label: <Pen size={16} />, onClick: handleEdit },
          { label: <Trash size={16} />, onClick: handleDelete },
        ]}
      />

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-amber-50">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Discount" : "Add Discount"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <input
              type="text"
              placeholder="Discount Name"
              className="border px-3 py-2 rounded w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <select
              className="border px-3 py-2 rounded w-full"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as "Percentage" | "Fixed",
                })
              }
            >
              <option value="Percentage">Percentage</option>
              <option value="Fixed">Fixed</option>
            </select>

            <input
              type="number"
              placeholder="Value"
              className="border px-3 py-2 rounded w-full"
              value={form.value}
              onChange={(e) =>
                setForm({ ...form, value: Number(e.target.value) })
              }
            />

            <textarea
              placeholder="Description (optional)"
              className="border px-3 py-2 rounded w-full"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <DialogFooter className="flex justify-between mt-4">
            <Button className="btn-bw-primary" onClick={handleSave}>
              {form.id ? "Update" : "Add"}
            </Button>
            <Button
              className="btn-bw-secondary"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
