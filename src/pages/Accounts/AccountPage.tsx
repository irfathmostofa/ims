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
import { useAuthStore } from "@/store/authStore";
import { useQuickStore } from "@/store/quickStore";
import CustomInput from "@/components/ui/custom/customInput";

type AccountType = {
  id: number;
  name: string;
  type: string;
  parent_id?: number;
  code?: string;
  status: string;
};

type Account = {
  id?: number;
  branch_id: number;
  head_id: number;
  code: string;
  name: string;
  account_no: string;
  opening_balance: number;
  opening_balance_type: "DEBIT" | "CREDIT";
  status: "A" | "I";
  head_name?: string; // For display
  branch_name?: string; // For display
};

export default function AccountPage() {
  const { user } = useAuthStore();
  const { branches, fetchBranches } = useQuickStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountHeads, setAccountHeads] = useState<AccountType[]>([]);
  const [form, setForm] = useState<Partial<Account>>({
    status: "A",
    opening_balance_type: "DEBIT",
    opening_balance: 0,
    branch_id: user?.branch.id || 1,
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);

  // Fetch account heads
  const fetchAccountHeads = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER}/accounts/account-heads`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAccountHeads(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching account heads:", error);
    }
  };

  const { fetchAll, save, remove } = useCrud<Account>({
    listUrl: `${import.meta.env.VITE_SERVER}/accounts/get-accounts`,
    createUrl: `${import.meta.env.VITE_SERVER}/accounts/account`,
    updateUrl: `${import.meta.env.VITE_SERVER}/accounts/update-account`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/accounts/delete-account`,
    formatCreate: (data) => ({
      branch_id: data.branch_id,
      head_id: data.head_id,
      code: data.code,
      name: data.name,
      account_no: data.account_no,
      opening_balance: data.opening_balance || 0,
      opening_balance_type: data.opening_balance_type || "DEBIT",
      status: data.status || "A",
    }),
    formatUpdate: (data) => ({
      branch_id: data.branch_id,
      head_id: data.head_id,
      code: data.code,
      name: data.name,
      account_no: data.account_no,
      opening_balance: data.opening_balance || 0,
      opening_balance_type: data.opening_balance_type || "DEBIT",
      status: data.status || "A",
    }),
  });

  useEffect(() => {
    fetchAll(setAccounts, setLoading);
    fetchAccountHeads();
    fetchBranches();
  }, [update]);

  // Function to get head name by ID
  const getHeadName = (headId: number | undefined) => {
    if (!headId) return "-";
    const head = accountHeads.find((head) => head.id === headId);
    return head ? `${head.name}` : "N/A";
  };

  // Function to get branch name by ID
  const getBranchName = (branchId: number | undefined) => {
    if (!branchId) return "-";
    const branch = branches.find((branch) => branch.id === branchId);
    return branch ? `${branch.name}` : "N/A";
  };

  // Format balance with type
  const formatBalance = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);

    return `${formatted} ${type === "DR" ? "Dr" : "Cr"}`;
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Account name is required");
      return;
    }

    if (!form.head_id) {
      toast.error("Account head is required");
      return;
    }

    if (!form.account_no) {
      toast.error("Account number is required");
      return;
    }

    if (!form.branch_id) {
      toast.error("Branch is required");
      return;
    }

    if (form.opening_balance === undefined) {
      toast.error("Opening balance is required");
      return;
    }

    if (form.opening_balance < 0) {
      toast.error("Opening balance cannot be negative");
      return;
    }

    if (!form.opening_balance_type) {
      toast.error("Opening balance type is required");
      return;
    }

    if (!confirm(`Are you sure?`)) return;

    try {
      await save(form, form.id);
      setForm({
        status: "A",
        opening_balance_type: "DEBIT",
        opening_balance: 0,
        branch_id: user?.branch.id || 1,
      });
      setOpen(false);
      setUpdate(update + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to save account");
    }
  };

  const handleEdit = (account: Account) => {
    setForm({
      ...account,
      opening_balance: account.opening_balance || 0,
      opening_balance_type: account.opening_balance_type || "DEBIT",
      status: account.status || "A",
    });
    setOpen(true);
  };

  const handleDelete = async (account: Account) => {
    if (
      !confirm(
        `Delete Account "${account.name}"? This action cannot be undone.`
      )
    )
      return;
    try {
      await remove(account.id!);
      setUpdate((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  // Reset form when opening dialog for new account
  const handleOpenDialog = () => {
    if (!form.id) {
      setForm({
        status: "A",
        opening_balance_type: "DEBIT",
        opening_balance: 0,
        branch_id: user?.branch.id || 1,
      });
    }
    setOpen(true);
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your accounting accounts with opening balances
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2 btn-bw-primary"
              onClick={handleOpenDialog}
            >
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
              <CustomInput
                label="Account Name *"
                type="text"
                placeholder="e.g., Cash Account, Bank Account"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <CustomInput
                label="Account Number *"
                type="text"
                placeholder="e.g., SB-001, CA-001"
                value={form.account_no || ""}
                onChange={(e) =>
                  setForm({ ...form, account_no: e.target.value })
                }
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Branch *
                </label>
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={form.branch_id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      branch_id: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Head *
                </label>
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={form.head_id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      head_id: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">Select Account Head</option>
                  {accountHeads.map((head) => (
                    <option key={head.id} value={head.id}>
                      {head.name} ({head.code || "No Code"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Opening Balance *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="border px-3 py-1 rounded w-full"
                    value={form.opening_balance || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        opening_balance: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Balance Type *
                  </label>
                  <select
                    className="border px-3 py-2 rounded w-full"
                    value={form.opening_balance_type || "DEBIT"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        opening_balance_type: e.target.value as
                          | "DEBIT"
                          | "CREDIT",
                      })
                    }
                  >
                    <option value="DR">Debit (Dr)</option>
                    <option value="CR">Credit (Cr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={form.status || "A"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "A" | "I",
                    })
                  }
                >
                  <option value="A">Active</option>
                  <option value="I">Inactive</option>
                </select>
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
            label: "Account Name",
          },
          {
            key: "account_no",
            label: "Account No",
          },
          {
            key: "branch_id",
            label: "Branch",
          },
          {
            key: "head_id",
            label: "Account Head",
          },
          {
            key: "opening_balance",
            label: "Opening Balance",
          },
          {
            key: "status",
            label: "Status",
          },
        ]}
        columnFormats={{
          branch_id: (value: number | undefined) => getBranchName(value),
          head_id: (value: number | undefined) => getHeadName(value),
          opening_balance: (value: number | undefined, row: Account) =>
            formatBalance(value || 0, row.opening_balance_type || "DEBIT"),
          status: (value: string) => {
            const statusMap: Record<string, string> = {
              A: "Active",
              I: "Inactive",
            };
            return statusMap[value] || value;
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
