"use client";

import { useState, useEffect } from "react";
import { Pen, Trash, Plus, Eye } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import { useCrud } from "@/hook/crudHelper";
import { useNavigate } from "react-router-dom";

type Customer = {
  id: number;
  code?: string;
  branch_id?: number;
  type?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  credit_limit?: number;
  loyalty_points?: number;
  status?: string;
  created_at?: string;
};

type Branch = {
  id: number;
  code: string;
  company_id: number;
  name: string;
  type: string;
  phone: string;
  address: string;
  created_by: string;
  created_at: string;
};

export default function CustomerPage() {
  const [customer, setCustomer] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [update, setUpdate] = useState(0);
  const navigate = useNavigate();
  // Load branches
  const fetchBranches = async () => {
    try {
      const branch = await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/get-branches`,
        { method: "GET", tokenType: "jwt" },
      );

      setBranches(branch.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch branches");
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // CRUD hook for Customer
  const { fetchAll, save, remove } = useCrud<Customer>({
    listUrl: `${import.meta.env.VITE_SERVER}/party/get-party`,
    listMethod: "POST",
    listPayload: { type: "CUSTOMER" },
    createUrl: `${import.meta.env.VITE_SERVER}/party/create-party`,
    updateUrl: `${import.meta.env.VITE_SERVER}/party/update-party`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/party/delete-party`,
    formatCreate: (data) => ({ ...data, type: "CUSTOMER" }),
    formatUpdate: (data) => ({ ...data, type: "CUSTOMER" }),
  });

  useEffect(() => {
    fetchAll(setCustomer, setLoading);
  }, [update]);

  //  Save (create/update)
  const handleSave = async () => {
    if (!form.name || !form.phone) {
      toast.error("Name and Phone are required");
      return;
    }

    await save(form, form.id);
    setForm({});
    setOpen(false);
    setUpdate((prev) => prev + 1);
  };

  // Edit
  const handleEdit = (s: Customer) => {
    setForm(s);
    setOpen(true);
  };

  // Delete
  const handleDelete = async (s: Customer) => {
    if (!confirm(`Delete Customer "${s.name}"?`)) return;
    await remove(s.id!);
    setUpdate((prev) => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        {/*  Add/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Customer" : "Add Customer"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Customer Name"
                className="border px-3 py-2 rounded w-full"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.branch_id || ""}
                onChange={(e) =>
                  setForm({ ...form, branch_id: Number(e.target.value) })
                }
              >
                <option value="">--Select Branch--</option>
                {branches.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Phone"
                className="border px-3 py-2 rounded w-full"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="border px-3 py-2 rounded w-full"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <textarea
                placeholder="Address"
                className="border px-3 py-2 rounded w-full"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="btn-bw-primary">
                {form.id ? "Update" : "Add"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customer Table */}
      <DataTable
        data={customer}
        label="Customer List"
        showColumns={["name", "phone", "email", "address"]}
        loading={loading}
        rowsPerPage={10}
        selectable
        printHead={[
          { label: "Name", value: "name" },
          { label: "Phone", value: "phone" },
          { label: "Email", value: "email" },
          { label: "Address", value: "address" },
        ]}
        actions={[
          {
            label: <Eye size={16} />,
            onClick: (row) => navigate(`/party/view/Customer/${row.id}`),
          },
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
