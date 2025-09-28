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
import { toast } from "sonner";
import { useCrud } from "@/hook/crudHelper";

type Role = {
  id: number;
  code?: string;
  name: string;
  description?: string;
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState<Partial<Role>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);

  // ✅ Reusable CRUD hook
  const { fetchAll, save, remove } = useCrud<Role>({
    listUrl: `${import.meta.env.VITE_SERVER}/setup/get-roles`,
    createUrl: `${import.meta.env.VITE_SERVER}/setup/roles`,
    updateUrl: `${import.meta.env.VITE_SERVER}/setup/update-roles`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/setup/delete-roles`,

    // transform payload if needed
    formatCreate: (data) => ({
      name: data.name,
      description: data.description,
    }),
    formatUpdate: (data) => ({
      code: data.code,
      name: data.name,
      description: data.description,
    }),
  });

  // ✅ Fetch roles
  useEffect(() => {
    fetchAll(setRoles, setLoading);
  }, [update]);

  // ✅ Save Role (Create / Update)
  const handleSave = async () => {
    if (!form.name) {
      toast.error("Role name is required");
      return;
    }

    await save(form, form.id); 
    setForm({});
    setOpen(false);
    setUpdate((prev) => prev + 1); 
  };

  // ✅ Edit role
  const handleEdit = (r: Role) => {
    setForm(r);
    setOpen(true);
  };

  // ✅ Delete role
  const handleDelete = async (r: Role) => {
    if (!confirm(`Delete role "${r.name}"?`)) return;
    await remove(r.id!);
    setUpdate((prev) => prev + 1);
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

              <Button
                className="w-full btn-bw-primary"
                onClick={handleSave}
                disabled={loading}
              >
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
