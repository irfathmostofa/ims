"use client";

import { useEffect, useState } from "react";
import { Pen, Trash, Plus } from "lucide-react";
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

type UOM = {
  id: number;
  code: string;
  name: string;
  symbol: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
};

export default function UnitPage() {
  const [units, setUnits] = useState<UOM[]>([]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<UOM>>({});
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);
  // ✅ Reusable CRUD hook
  const { fetchAll, save, remove } = useCrud<UOM>({
    listUrl: `${import.meta.env.VITE_SERVER}/product/get-uom`,
    createUrl: `${import.meta.env.VITE_SERVER}/product/create-uom`,
    updateUrl: `${import.meta.env.VITE_SERVER}/product/update-uom`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/product/delete-uom`,

    // transform payload if needed
    formatCreate: (data) => ({
      name: data.name,
      symbol: data.symbol,
      description: data.description,
    }),
    formatUpdate: (data) => ({
      code: data.code,
      name: data.name,
      symbol: data.symbol,
      description: data.description,
    }),
  });
  // ✅ Fetch roles
  useEffect(() => {
    fetchAll(setUnits, setLoading);
  }, [update]);

  // ✅ Save Role (Create / Update)
  const handleSave = async () => {
    if (!form.name) {
      toast.error("Unit name is required");
      return;
    }

    await save(form, form.id);
    setForm({});
    setOpen(false);
    setUpdate((prev) => prev + 1);
  };

  // ✅ Edit role
  const handleEdit = (r: UOM) => {
    setForm(r);
    setOpen(true);
  };

  // ✅ Delete role
  const handleDelete = async (r: UOM) => {
    if (!confirm(`Delete Unit "${r.name}"?`)) return;
    await remove(r.id!);
    setUpdate((prev) => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Unit of Measurement (UOM)</h1>
        {/* ✅ Add/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Unit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-amber-50">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Unit" : "Add Unit"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Unit Name (e.g. Kilogram)"
                className="border px-3 py-2 rounded w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Symbol (e.g. kg)"
                className="border px-3 py-2 rounded w-full"
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              />
              <textarea
                placeholder="description"
                className="border px-3 py-2 rounded w-full"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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

      {/* ✅ Data Table */}
      <DataTable
        data={units}
        label="Unit List"
        hiddenColumns={[
          "id",
          "created_by",
          "created_at",
          "updated_by",
          "updated_at",
        ]}
        rowsPerPage={10}
        printHead={[
          { label: "Name", value: "name" },
          { label: "Symbol", value: "symbol" },
          { label: "Description", value: "description" },
        ]}
        loading={loading}
        actions={[
          {
            label: <Pen size={16} />,
            onClick: handleEdit,
          },
          {
            label: <Trash size={16} />,
            onClick: handleDelete,
          },
        ]}
      />
    </div>
  );
}
