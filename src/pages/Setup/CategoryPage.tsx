"use client";

import { useState } from "react";
import { Pen, Trash, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Category = {
  id: number;
  name: string;
  parentId?: number | null;
};

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Electronics", parentId: null },
    { id: 2, name: "Laptops", parentId: 1 },
    { id: 3, name: "Phones", parentId: 1 },
    { id: 4, name: "Gaming Laptops", parentId: 2 },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    id?: number;
    name: string;
    parentId: number | null;
  }>({
    id: undefined,
    name: "",
    parentId: null,
  });

  // ✅ Open dialog for Add/Edit
  const handleOpen = (cat?: Category) => {
    if (cat) {
      setForm({
        id: cat.id,
        name: cat.name,
        parentId: cat.parentId ?? null,
      });
    } else {
      setForm({ id: undefined, name: "", parentId: null });
    }
    setOpen(true);
  };

  // ✅ Save
  const handleSave = () => {
    if (!form.name) {
      return alert("Category name is required!");
    }

    if (form.id) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === form.id
            ? { ...c, name: form.name, parentId: form.parentId }
            : c
        )
      );
    } else {
      const newId = categories.length
        ? Math.max(...categories.map((c) => c.id)) + 1
        : 1;
      setCategories((prev) => [
        ...prev,
        { id: newId, name: form.name, parentId: form.parentId },
      ]);
    }
    setOpen(false);
  };

  // ✅ Delete
  const handleDelete = (cat: Category) => {
    if (!confirm(`Delete ${cat.name}?`)) return;
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
  };

  // ✅ Format for display (flatten parent → child names)
  const formatted = categories.map((c) => {
    let fullName = c.name;
    let parent = categories.find((p) => p.id === c.parentId);
    while (parent) {
      fullName = parent.name + " > " + fullName;
      parent = categories.find((p) => p.id === parent?.parentId);
    }
    return { ...c, fullName };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Button
          onClick={() => handleOpen()}
          className="btn-bw-primary flex gap-1"
        >
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={formatted}
        label="Category List"
        hiddenColumns={["id", "parentId"]}
        rowsPerPage={10}
        printHead={[{ label: "Name", value: "name" }]}
        actions={[
          {
            label: <Pen size={16} />,
            onClick: (row) => handleOpen(row),
          },
          {
            label: <Trash size={16} />,
            onClick: (row) => handleDelete(row),
          },
        ]}
      />

      {/* ✅ Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
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
              value={form.parentId ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  parentId: e.target.value ? Number(e.target.value) : null,
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
  );
}
