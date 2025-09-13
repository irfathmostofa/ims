"use client";

import { useState } from "react";
import { Pen, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";

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

  const [form, setForm] = useState<{
    id?: number;
    name: string;
    parentId: number | null;
  }>({
    id: undefined,
    name: "",
    parentId: null,
  });

  // ✅ Add / Update
  const handleSave = () => {
    if (form.id) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === form.id
            ? { ...c, name: form.name, parentId: form.parentId }
            : c
        )
      );
    } else {
      const newId = Math.max(...categories.map((c) => c.id)) + 1;
      setCategories((prev) => [
        ...prev,
        { id: newId, name: form.name, parentId: form.parentId },
      ]);
    }
    setForm({ id: undefined, name: "", parentId: null });
  };

  // ✅ Edit
  const handleEdit = (cat: Category) => {
    setForm({ id: cat.id, name: cat.name, parentId: cat.parentId ?? null });
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
      <h1 className="text-2xl font-bold">Category Management</h1>

      {/* ✅ Category Form */}
      <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
        <h2 className="text-lg font-semibold">
          {form.id ? "Edit Category" : "Add Category"}
        </h2>
        <div className="flex flex-col md:flex-row gap-3">
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
          <Button onClick={handleSave} className="btn-bw-primary">
            {form.id ? "Update" : "Add"}
          </Button>
        </div>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={formatted}
        label="Category List"
        hiddenColumns={["id", "parentId"]}
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
      <div id="Category List" className="hidden">
        <h1 className="text-xl font-bold mb-2">Category List</h1>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Parent Category</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="border p-2">{c.name}</td>
                <td className="border p-2">
                  {categories.find((p) => p.id === c.parentId)?.name ||
                    "No Parent"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
