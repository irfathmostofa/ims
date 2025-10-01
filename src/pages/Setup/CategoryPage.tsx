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

type Category = {
  id: number;
  code: string;
  name: string;
  parent_id?: number | null;
  image?: string | null;
  status?: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  updated_at: string | null;
};

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Category>>({});
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);

  // ✅ Reusable CRUD hook
  const { fetchAll, save, remove } = useCrud<Category>({
    listUrl: `${import.meta.env.VITE_SERVER}/product/get-product-cat`,
    createUrl: `${import.meta.env.VITE_SERVER}/product/create-product-cat`,
    updateUrl: `${import.meta.env.VITE_SERVER}/product/update-product-cat`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/product/delete-product-cat`,

    // transform payload if needed
    formatCreate: (data) => ({
      name: data.name,
      parent_id: data.parent_id,
    }),
    formatUpdate: (data) => ({
      code: data.code,
      name: data.name,
      parent_id: data.parent_id,
    }),
  });
  // ✅ Fetch
  useEffect(() => {
    fetchAll(setCategories, setLoading);
  }, [update]);

  // ✅ Save (Create / Update)
  const handleSave = async () => {
    if (!form.name) {
      toast.error("Category name is required");
      return;
    }

    await save(form, form.id);
    setForm({});
    setOpen(false);
    setUpdate((prev) => prev + 1);
  };

  // ✅ Edit role
  const handleEdit = (c: Category) => {
    setForm(c);
    setOpen(true);
  };

  // ✅ Delete role
  const handleDelete = async (c: Category) => {
    if (!confirm(`Delete Category "${c.name}"?`)) return;
    await remove(c.id!);
    setUpdate((prev) => prev + 1);
  };

  // ✅ Format for display (flatten parent → child names)
  const formatted = categories.map((c) => {
    let Parent = c.name;
    let parent = categories.find((p) => p.id === c.parent_id);
    while (parent) {
      Parent = parent.name + " > " + Parent;
      parent = categories.find((p) => p.id === parent?.parent_id);
    }
    return { ...c, Parent };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Category Management</h1>
        {/* ✅ Add/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button
              // onClick={() => handleOpen()}
              className="btn-bw-primary flex gap-1"
            >
              <Plus size={16} /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Category" : "Add Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Category Name"
                className="border px-3 py-2 rounded w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <select
                className="border px-3 py-2 rounded w-full"
                value={form.parent_id ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    parent_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                <option value="">No Parent</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
        data={formatted}
        label="Category List"
        hiddenColumns={[
          "id",
          "parent_id",
          "image",
          "status",
          "created_at",
          "created_by",
          "updated_by",
          "updated_at",
        ]}
        selectable
        rowsPerPage={10}
        printHead={[{ label: "Name", value: "name" }]}
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
