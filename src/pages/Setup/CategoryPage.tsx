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
  slug: string;
  parent_id?: number | null;
  children?: Category[];
  image?: string | null;
  status?: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  updated_at: string | null;
};

// ✅ Helper: flatten nested categories for table & select
function flattenCategories(
  categories: Category[],
  parentPath = ""
): (Category & { Parent: string })[] {
  let result: (Category & { Parent: string })[] = [];

  for (const cat of categories) {
    const Parent = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
    result.push({ ...cat, Parent });

    if (cat.children && cat.children.length) {
      result = result.concat(flattenCategories(cat.children, Parent));
    }
  }

  return result;
}

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
    formatCreate: (data) => ({
      name: data.name,
      slug: data.slug,
      parent_id: data.parent_id,
    }),
    formatUpdate: (data) => ({
      code: data.code,
      name: data.name,
      slug: data.slug,
      parent_id: data.parent_id,
    }),
  });

  // ✅ Fetch categories
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

  // ✅ Edit category
  const handleEdit = (c: Category) => {
    setForm(c);
    setOpen(true);
  };

  // ✅ Delete category
  const handleDelete = async (c: Category) => {
    if (!confirm(`Delete Category "${c.name}"?`)) return;
    await remove(c.id!);
    setUpdate((prev) => prev + 1);
  };

  // ✅ Flattened categories for table & parent select
  const flattened = flattenCategories(categories);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Category Management</h1>

        {/* ✅ Add/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button className="btn-bw-primary flex gap-1">
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
              {/* Category Name */}
              <input
                type="text"
                placeholder="Category Name"
                className="border px-3 py-2 rounded w-full"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Slug (Optional)"
                className="border px-3 py-2 rounded w-full"
                value={form.slug || ""}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />

              {/* Parent Category */}
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
                {flattened.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.Parent} {/* shows hierarchy: Men > Clothing */}
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
        data={flattened}
        label="Category List"
        hiddenColumns={[
          "id",
          "parent_id",
          "children",
          "image",
          "status",
          "created_at",
          "created_by",
          "updated_by",
          "updated_at",
        ]}
        selectable
        rowsPerPage={10}
        printHead={[{ label: "Name", value: "Parent" }]} // show hierarchy
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
