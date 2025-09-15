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

type Customer = { id: number; name: string };
type Receivable = {
  id: number;
  customerId: number;
  customerName: string;
  description: string;
  amount: number;
  paid: number;
  date: string;
};

export default function ReceivablesPage() {
  const [customers] = useState<Customer[]>([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
  ]);

  const [receivables, setReceivables] = useState<Receivable[]>([
    {
      id: 1,
      customerId: 1,
      customerName: "John Doe",
      description: "Invoice #1001",
      amount: 500,
      paid: 200,
      date: "2025-09-15",
    },
  ]);

  const [form, setForm] = useState<Partial<Receivable>>({});
  const [open, setOpen] = useState(false);

  // ✅ Add / Update
  const handleSave = () => {
    if (!form.customerId || !form.amount || !form.description) {
      alert("Customer, amount, and description are required");
      return;
    }

    const customer = customers.find((c) => c.id === form.customerId);
    if (!customer) return;

    if (form.id) {
      setReceivables((prev) =>
        prev.map((r) =>
          r.id === form.id ? { ...r, ...form, customerName: customer.name } : r
        )
      );
    } else {
      const newId = receivables.length
        ? Math.max(...receivables.map((r) => r.id)) + 1
        : 1;
      setReceivables((prev) => [
        ...prev,
        {
          ...form,
          id: newId,
          customerName: customer.name,
          paid: form.paid || 0,
          date: form.date || new Date().toISOString().slice(0, 10),
        } as Receivable,
      ]);
    }

    setForm({});
    setOpen(false);
  };

  // ✅ Edit
  const handleEdit = (r: Receivable) => {
    setForm(r);
    setOpen(true);
  };

  // ✅ Delete
  const handleDelete = (r: Receivable) => {
    if (!confirm(`Delete receivable for ${r.customerName}?`)) return;
    setReceivables((prev) => prev.filter((item) => item.id !== r.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Receivables</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Receivable
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Receivable" : "Add Receivable"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <select
                className="border px-3 py-2 rounded w-full"
                value={form.customerId || ""}
                onChange={(e) =>
                  setForm({ ...form, customerId: Number(e.target.value) })
                }
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
                {form.id ? "Update" : "Add Receivable"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={receivables}
        label="Receivables List"
        hiddenColumns={["id", "customerId"]}
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
