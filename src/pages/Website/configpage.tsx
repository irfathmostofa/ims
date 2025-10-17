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
import { useCrud } from "@/hook/crudHelper";
import { Textarea } from "@/components/ui/textarea";

type Setup = {
  id?: number;
  code?: string;
  key_name: string;
  value: string;
  group_name?: string;
  status?: string;
  created_by_name?: string;
  created_by?: string;
  updated_by_name?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
};

export default function ConfigPage() {
  const [records, setRecords] = useState<Setup[]>([]);
  const [form, setForm] = useState<Partial<Setup>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);

  // Reusable CRUD hook
  const { fetchAll, save, remove } = useCrud<Setup>({
    listUrl: `${import.meta.env.VITE_SERVER}/setup/get-setup-data`,
    createUrl: `${import.meta.env.VITE_SERVER}/setup/create-setup`,
    updateUrl: `${import.meta.env.VITE_SERVER}/setup/update-setup-data`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/setup/delete-setup-data`,

    formatCreate: (data) => ({
      key_name: data.key_name,
      value: data.value,
      group_name: data.group_name,
    }),
    formatUpdate: (data) => ({
      id: data.id,
      code: data.code,
      key_name: data.key_name,
      value: data.value,
      group_name: data.group_name,
    }),
  });

  // Fetch setup records
  useEffect(() => {
    fetchAll(setRecords, setLoading);
  }, [update]);

  // Save Setup (Create / Update)
  const handleSave = async () => {
    if (!form.key_name || !form.value) {
      toast.error("Key name and Value are required");
      return;
    }

    await save(form, form.id);
    setForm({});
    setOpen(false);
    setUpdate((prev) => prev + 1);
  };

  // Edit
  const handleEdit = (r: Setup) => {
    setForm(r);
    setOpen(true);
  };

  // Delete
  const handleDelete = async (r: Setup) => {
    if (!confirm(`Delete setup "${r.key_name}"?`)) return;
    await remove(r.id!);
    setUpdate((prev) => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Setup Configuration</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Setup
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Setup" : "Add Setup"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                placeholder="Key Name"
                value={form.key_name || ""}
                onChange={(e) => setForm({ ...form, key_name: e.target.value })}
              />
              <Input
                placeholder="Value"
                value={form.value || ""}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />

              {/* Group Select */}
              <select
                onChange={(e) =>
                  setForm({ ...form, group_name: e.target.value })
                }
                value={form.group_name || ""}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">-- Select Group --</option>
                <option value="System">System</option>
                <option value="Website">Website</option>
                <option value="Inventory">Inventory</option>
                <option value="LandingPage">Landing Page</option>
                <option value="Theme">Theme</option>
                <option value="FAQ">FAQ</option>
                <option value="UOM">UOM</option>
              </select>

              <Button onClick={handleSave} className="w-full btn-bw-primary">
                {form.id ? "Update" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
      <DataTable
        data={records}
        label="Setup Data"
        hiddenColumns={[
          "id",
          "created_by",
          "created_by_name",
          "created_at",
          "updated_at",
          "updated_by",
          "updated_by_name",
        ]}
        selectable
        rowsPerPage={10}
        loading={loading}
        actions={[
          { label: <Pen size={16} />, onClick: handleEdit },
          { label: <Trash size={16} />, onClick: handleDelete },
        ]}
      />
    </div>
  );
}
