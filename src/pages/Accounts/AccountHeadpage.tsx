"use client";

import { useEffect, useState } from "react";
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
import { useCrud } from "@/hook/crudHelper";
import { toast } from "sonner";
import CustomInput from "@/components/ui/custom/customInput";

type Account = {
  id: number;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
  parent_id?: number;
  code?: string;
  status: string;
};

export default function AccountHeadpage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState<Partial<Account>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);

  const { fetchAll, save, remove } = useCrud<Account>({
    listUrl: `${import.meta.env.VITE_SERVER}/accounts/account-heads`,
    createUrl: `${import.meta.env.VITE_SERVER}/accounts/account-head`,
    updateUrl: `${import.meta.env.VITE_SERVER}/accounts/update-account-head`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/accounts/delete-account-head`,
    formatCreate: (data) => ({
      name: data.name,
      type: data.type,
      parent_id: data.parent_id,
    }),
    formatUpdate: (data) => ({
      code: data.code,
      name: data.name,
      type: data.type,
      parent_id: data.parent_id,
    }),
  });

  // ✅ Fetch categories
  useEffect(() => {
    fetchAll(setAccounts, setLoading);
  }, [update]);

  // Function to get parent name by ID
  const getParentName = (parentId: number | undefined) => {
    if (!parentId) return "-";
    const parent = accounts.find((account) => account.id === parentId);
    return parent ? `${parent.name}` : "N/A";
  };

  const handleSave = async () => {
    setLoading(true);
    if (!form.name) {
      toast.error("Head name is required");
      return;
    }

    if (!form.type) {
      toast.error("Account type is required");
      return;
    }
    if (!confirm(`Are you Sure ?`)) return;
    await save(form, form.id);
    setForm({});
    setOpen(false);
    setUpdate(update + 1);
    setLoading(false);
  };

  const handleEdit = (c: Account) => {
    setForm({
      ...c,
      parent_id: c.parent_id || undefined,
    });
    setOpen(true);
  };

  const handleDelete = async (c: Account) => {
    if (!confirm(`Delete Account "${c.name}"? This action cannot be undone.`))
      return;
    await remove(c.id!);
    setUpdate((prev) => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Account Head</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your accounting heads and their hierarchy
          </p>
        </div>

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

            <div className="space-y-2 mt-2">
              <CustomInput
                label="Account Name *"
                type="text"
                placeholder="e.g., Cash, Accounts Payable, Sales Revenue"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Type *
                </label>
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={form.type || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as Account["type"],
                    })
                  }
                >
                  <option value="">Select Account Type</option>
                  <option value="ASSET">Asset</option>
                  <option value="LIABILITY">Liability</option>
                  <option value="EQUITY">Equity</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Parent Account (Optional)
                </label>
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={form.parent_id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      parent_id: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">None (Root Account)</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </option>
                  ))}
                </select>
                {form.parent_id && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected account will be a sub-account of the parent
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  className="w-full btn-bw-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : form.id
                    ? "Update Account"
                    : "Add Account"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={accounts}
        label="Accounts List"
        selectable
        loading={loading}
        rowsPerPage={20}
        showColumns={[
          {
            key: "code",
            label: "Code",
          },
          {
            key: "name",
            label: "Head",
          },
          {
            key: "type",
            label: "Type",
          },
          {
            key: "parent_id",
            label: "Parent Head",
          },
          {
            key: "status",
            label: "Status",
          },
        ]}
        columnFormats={{
          status: (value: string) => {
            const statusMap: Record<string, string> = {
              A: "Active",
              I: "Inactive",
            };
            return statusMap[value];
          },
          parent_id: (value: string) => {
            return getParentName(value ? Number(value) : undefined);
          },
        }}
        actions={[
          {
            label: <Pen size={16} />,
            onClick: (row) => handleEdit(row as Account),
          },
          {
            label: <Trash size={16} />,
            onClick: (row) => handleDelete(row as Account),
          },
        ]}
      />
    </div>
  );
}
