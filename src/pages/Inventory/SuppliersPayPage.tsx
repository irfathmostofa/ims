"use client";

import { useState } from "react";
import { Pen, Plus, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// type Supplier = {
//   id: number;
//   name: string;
//   email?: string;
//   phone?: string;
//   address?: string;
// };

type Payable = {
  id: number;
  supplierId: number;
  supplierName: string;
  description: string;
  amount: number;
  paid: number;
  date: string;
};

export default function SuppliersPayPage() {
  const suppliers = [
    {
      id: 1,
      name: "ABC Supplies",
      email: "abc@example.com",
      phone: "1234567890",
    },
    {
      id: 2,
      name: "XYZ Traders",
      email: "xyz@example.com",
      phone: "9876543210",
    },
  ];

  const [payables, setPayables] = useState<Payable[]>([
    {
      id: 1,
      supplierId: 1,
      supplierName: "ABC Supplies",
      description: "Purchase #1001",
      amount: 1000,
      paid: 500,
      date: "2025-09-15",
    },
  ]);

  const [form, setForm] = useState<Partial<Payable>>({});
  const [open, setOpen] = useState(false);

  // ✅ Add / Update Payable
  const handleSave = () => {
    if (!form.supplierId || !form.amount || !form.description) {
      alert("Supplier, amount, and description are required");
      return;
    }

    const supplier = suppliers.find((s) => s.id === form.supplierId);
    if (!supplier) return;

    if (form.id) {
      setPayables((prev) =>
        prev.map((p) =>
          p.id === form.id ? { ...p, ...form, supplierName: supplier.name } : p
        )
      );
    } else {
      const newId = payables.length
        ? Math.max(...payables.map((p) => p.id)) + 1
        : 1;
      setPayables((prev) => [
        ...prev,
        {
          ...form,
          id: newId,
          supplierName: supplier.name,
          paid: form.paid || 0,
          date: form.date || new Date().toISOString().slice(0, 10),
        } as Payable,
      ]);
    }

    setForm({});
    setOpen(false);
  };

  // ✅ Edit Payable
  const handleEdit = (p: Payable) => {
    setForm(p);
    setOpen(true);
  };

  // ✅ Delete Payable
  const handleDelete = (p: Payable) => {
    if (!confirm(`Delete payable for ${p.supplierName}?`)) return;
    setPayables((prev) => prev.filter((item) => item.id !== p.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Suppliers / Payables</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Payable
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Payable" : "Add Payable"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <select
                className="border px-3 py-2 rounded w-full"
                value={form.supplierId || ""}
                onChange={(e) =>
                  setForm({ ...form, supplierId: Number(e.target.value) })
                }
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Description"
                className="border px-3 py-2 rounded w-full"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Amount"
                className="border px-3 py-2 rounded w-full"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
              />

              <input
                type="number"
                placeholder="Paid"
                className="border px-3 py-2 rounded w-full"
                value={form.paid || 0}
                onChange={(e) =>
                  setForm({ ...form, paid: Number(e.target.value) })
                }
              />

              <input
                type="date"
                className="border px-3 py-2 rounded w-full"
                value={form.date || new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />

              <Button className="w-full btn-bw-primary" onClick={handleSave}>
                {form.id ? "Update" : "Add Payable"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={payables}
        label="Payables List"
        hiddenColumns={["id", "supplierId"]}
        selectable
        rowsPerPage={10}
        actions={[
          {
            label: <Pen size={16} />,
            onClick: (row) => handleEdit(row),
          },
          {
            label: <Trash size={16} />,
            onClick: (row) => handleDelete(row),
          },
        ]}
      />
    </div>
  );
}
