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

type Account = {
  id: number;
  name: string;
  type: "Asset" | "Liability" | "Equity" | "Income" | "Expense";
  parentId?: number;
  code?: string;
};

export default function CoaPage() {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, name: "Cash", type: "Asset" },
    { id: 2, name: "Bank", type: "Asset" },
    { id: 3, name: "Sales", type: "Income" },
  ]);

  const [form, setForm] = useState<Partial<Account>>({});
  const [open, setOpen] = useState(false);

  // ✅ Add / Update Account
  const handleSave = () => {
    if (!form.name || !form.type) {
      alert("Account name and type are required");
      return;
    }

    if (form.id) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === form.id ? { ...a, ...form } : a))
      );
    } else {
      const newId = accounts.length
        ? Math.max(...accounts.map((a) => a.id)) + 1
        : 1;
      setAccounts((prev) => [...prev, { ...form, id: newId } as Account]);
    }

    setForm({});
    setOpen(false);
  };

  // ✅ Edit Account
  const handleEdit = (a: Account) => {
    setForm(a);
    setOpen(true);
  };

  // ✅ Delete Account
  const handleDelete = (a: Account) => {
    if (!confirm(`Delete account "${a.name}"?`)) return;
    setAccounts((prev) =>
      prev.filter((acc) => acc.id !== a.id && acc.parentId !== a.id)
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chart of Accounts (COA)</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Account
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Account" : "Add Account"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <input
                type="text"
                placeholder="Account Name"
                className="border px-3 py-2 rounded w-full"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                type="text"
                placeholder="Account Code"
                className="border px-3 py-2 rounded w-full"
                value={form.code || ""}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.type || ""}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as Account["type"] })
                }
              >
                <option value="">Select Type</option>
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.parentId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    parentId: Number(e.target.value) || undefined,
                  })
                }
              >
                <option value="">Select Parent Account (optional)</option>
                {accounts
                  .filter((a) => a.id !== form.id)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>

              <Button className="w-full btn-bw-primary" onClick={handleSave}>
                {form.id ? "Update" : "Add Account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ COA DataTable */}
      <DataTable
        data={accounts.map((a) => ({
          ...a,
          parentName: a.parentId
            ? accounts.find((p) => p.id === a.parentId)?.name
            : "",
        }))}
        label="Accounts List"
       
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
