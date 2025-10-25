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

type Account = { id: number; name: string };
type Party = { id: number; name: string }; // Customer or Supplier
type Transaction = {
  id: number;
  type: "Payment" | "Receipt";
  date: string;
  reference?: string;
  description?: string;
  amount: number;
  accountId: number;
  accountName?: string;
  partyId?: number;
  partyName?: string;
};

// Dummy data
const accounts: Account[] = [
  { id: 1, name: "Cash" },
  { id: 2, name: "Bank" },
];

const customers: Party[] = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
];

const suppliers: Party[] = [
  { id: 1, name: "ABC Suppliers" },
  { id: 2, name: "XYZ Traders" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Transaction>>({});

  // ✅ Save transaction
  const handleSave = () => {
    if (!form.date || !form.type || !form.amount || !form.accountId) {
      alert("Date, Type, Amount, and Account are required");
      return;
    }

    const account = accounts.find((a) => a.id === form.accountId);
    const party =
      form.type === "Receipt"
        ? customers.find((c) => c.id === form.partyId)
        : suppliers.find((s) => s.id === form.partyId);

    const newTransaction: Transaction = {
      ...form,
      id:
        form.id ||
        (transactions.length
          ? Math.max(...transactions.map((t) => t.id)) + 1
          : 1),
      accountName: account?.name,
      partyName: party?.name,
      amount: Number(form.amount),
    } as Transaction;

    if (form.id) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === form.id ? newTransaction : t))
      );
    } else {
      setTransactions((prev) => [...prev, newTransaction]);
    }

    setForm({});
    setOpen(false);
  };

  // ✅ Edit
  const handleEdit = (t: Transaction) => {
    setForm(t);
    setOpen(true);
  };

  // ✅ Delete
  const handleDelete = (t: Transaction) => {
    if (!confirm(`Delete transaction "${t.reference || t.id}"?`)) return;
    setTransactions((prev) => prev.filter((tr) => tr.id !== t.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transactions</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Transaction
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Transaction" : "Add Transaction"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <input
                type="date"
                className="border px-3 py-2 rounded w-full"
                value={form.date || ""}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.type || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as "Payment" | "Receipt",
                  })
                }
              >
                <option value="">Select Type</option>
                <option value="Payment">Payment</option>
                <option value="Receipt">Receipt</option>
              </select>

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.accountId || ""}
                onChange={(e) =>
                  setForm({ ...form, accountId: Number(e.target.value) })
                }
              >
                <option value="">Select Account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.partyId || ""}
                onChange={(e) =>
                  setForm({ ...form, partyId: Number(e.target.value) })
                }
              >
                <option value="">Select Party</option>
                {(form.type === "Receipt" ? customers : suppliers).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

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
                type="text"
                placeholder="Reference"
                className="border px-3 py-2 rounded w-full"
                value={form.reference || ""}
                onChange={(e) =>
                  setForm({ ...form, reference: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Description"
                className="border px-3 py-2 rounded w-full"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <Button className="w-full btn-bw-primary" onClick={handleSave}>
                {form.id ? "Update Transaction" : "Add Transaction"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Transactions Table */}
      <DataTable
        data={transactions}
        label="Transactions"
     
        selectable
        rowsPerPage={10}
        actions={[
          { label: <Pen size={16} />, onClick: (row) => handleEdit(row) },
          { label: <Trash size={16} />, onClick: (row) => handleDelete(row) },
        ]}
      />
    </div>
  );
}
