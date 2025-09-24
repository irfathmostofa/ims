"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";

type Branch = {
  id?: number;
  company_id: number;
  name: string;
  type: string;
  phone: string;
  address: string;
  created_by: string;
  created_at: string;
};

type Props = { companyId: number };

export default function BranchesPage({ companyId }: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState<Partial<Branch>>({});
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(0);
  const [loading, setLoading] = useState(false);

  const apiUrl = `${import.meta.env.VITE_SERVER}/setup/branches`;

  // ✅ Fetch branches
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await apiClient(apiUrl, { method: "GET", tokenType: "jwt" });

      setBranches(data.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [update]);

  // ✅ Add / Update branch
  const handleSave = async () => {
    if (!form.name) {
      toast.error("Branch name is required");
      return;
    }

    try {
      setLoading(true);
      let data;
      if (form.id) {
        // Update branch
        data = await apiClient(`${apiUrl}/${form.id}`, {
          method: "PUT",
          data: form,
          tokenType: "jwt",
        });
      } else {
        // Add branch
        data = await apiClient(apiUrl, {
          method: "POST",
          data: { ...form, companyId },
          tokenType: "jwt",
        });
      }

      toast.success(data.message || "Branch saved successfully!");
      setForm({});
      setOpen(false);
      setUpdate(update + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save branch");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit branch
  const handleEdit = (b: Branch) => {
    setForm(b);
    console.log(b);
    setOpen(true);
  };

  // ✅ Delete branch
  const handleDelete = async (b: Branch) => {
    if (!confirm(`Delete branch "${b.name}"?`)) return;

    try {
      setLoading(true);
      const data = await apiClient(`${apiUrl}/${b.id}`, {
        method: "DELETE",
        tokenType: "barrier",
      });
      toast.success(data.message || "Branch deleted!");
      setUpdate(update + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete branch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Branches</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Branch
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Branch" : "Add Branch"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <Input
                placeholder="Branch Name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Type"
                value={form.type || ""}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <Button
                className="w-full btn-bw-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {form.id ? "Update" : "Add Branch"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={branches}
        label="Branches List"
        hiddenColumns={["company_id", "id", "created_by", "created_at"]}
        selectable
        rowsPerPage={10}
        loading={loading}
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
