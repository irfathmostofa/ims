"use client";

import { useState } from "react";
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

type Role = {
  id: number;
  name: string;
  description?: string;
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: "Admin", description: "Full access" },
    { id: 2, name: "Manager", description: "Limited access to reports" },
  ]);

  const [form, setForm] = useState<Partial<Role>>({});
  const [open, setOpen] = useState(false);

  // ✅ Add / Update Role
  const handleSave = () => {
    if (!form.name) {
      alert("Role name is required");
      return;
    }

    if (form.id) {
      setRoles((prev) =>
        prev.map((r) => (r.id === form.id ? { ...r, ...form } : r))
      );
    } else {
      const newId = roles.length ? Math.max(...roles.map((r) => r.id)) + 1 : 1;
      setRoles((prev) => [...prev, { ...form, id: newId } as Role]);
    }

    setForm({});
    setOpen(false);
  };

  // ✅ Edit Role
  const handleEdit = (r: Role) => {
    setForm(r);
    setOpen(true);
  };

  // ✅ Delete Role
  const handleDelete = (r: Role) => {
    if (!confirm(`Delete role "${r.name}"?`)) return;
    setRoles((prev) => prev.filter((role) => role.id !== r.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Roles</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Role
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Role" : "Add Role"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <input
                type="text"
                placeholder="Role Name"
                className="border px-3 py-2 rounded w-full"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <textarea
                placeholder="Description"
                className="border px-3 py-2 rounded w-full"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <Button className="w-full btn-bw-primary" onClick={handleSave}>
                {form.id ? "Update" : "Add Role"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={roles}
        label="Roles List"
        hiddenColumns={["id"]}
        selectable
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
    </div>
  );
}
