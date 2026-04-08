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
import { formatStatus } from "@/components/utils/formatter";
import ImageUploader2 from "@/hook/ImageUploader2";
import { useQuickStore } from "@/store/quickStore";

type User = {
  id: number;
  code?: string;
  branch_id: number;
  username: string;
  phone: string;
  address?: string;
  image?: string | null;
  password_hash?: string;
  role_id: number;
  created_at: string;
  status: "A" | "I";
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<Partial<User>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);
  const { branches, fetchRoles, roles } = useQuickStore();
  useEffect(() => {
    fetchRoles();
  }, []);

  // CRUD hook for Users
  const { fetchAll, save, remove } = useCrud<User>({
    listUrl: `${import.meta.env.VITE_SERVER}/users/get-user`,
    createUrl: `${import.meta.env.VITE_SERVER}/users/create-user`,
    updateUrl: `${import.meta.env.VITE_SERVER}/users/update-user`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/users/delete-user`,
    formatCreate: (data) => ({
      username: data.username,
      phone: data.phone,
      branch_id: data.branch_id,
      address: data.address,
      password_hash: data.password_hash,
      role_id: data.role_id,
      image: data.image,
    }),
    formatUpdate: (data) => ({
      id: data.id,
      username: data.username,
      phone: data.phone,
      branch_id: data.branch_id,
      role_id: data.role_id,
      image: data.image,
      status: data.status,
    }),
  });

  // Load users
  useEffect(() => {
    fetchAll(setUsers, setLoading);
  }, [update]);

  // Save User
  const handleSave = async () => {
    if (!form.username || !form.role_id || !form.branch_id) {
      toast.error("Username, role, and branch are required!");
      return;
    }

    await save(form, form.id);
    setForm({});
    setOpen(false);
    setUpdate((prev) => prev + 1);
  };

  // Edit User
  const handleEdit = (u: User) => {
    setForm(u);
    setOpen(true);
  };

  // Delete User
  const handleDelete = async (u: User) => {
    if (!confirm(`Delete user "${u.username}"?`)) return;
    await remove(u.id!);
    setUpdate((prev) => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add User
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit User" : "Add User"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <input
                type="text"
                placeholder="Full Name"
                className="border px-3 py-2 rounded w-full"
                value={form.username || ""}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />

              <input
                type="text"
                placeholder="Phone"
                className="border px-3 py-2 rounded w-full"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                type="text"
                placeholder="address"
                className="border px-3 py-2 rounded w-full"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <input
                type="password"
                placeholder="password"
                className="border px-3 py-2 rounded w-full"
                value={form.password_hash || ""}
                onChange={(e) =>
                  setForm({ ...form, password_hash: e.target.value })
                }
              />

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.branch_id || ""}
                onChange={(e) =>
                  setForm({ ...form, branch_id: Number(e.target.value) })
                }
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.role_id || ""}
                onChange={(e) =>
                  setForm({ ...form, role_id: Number(e.target.value) })
                }
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="space-y-2">
                <ImageUploader2
                  initialImage={form.image}
                  onUploadComplete={(url) => {
                    setForm({ ...form, image: url });
                  }}
                  onRemove={() => {
                    setForm({ ...form, image: null });
                  }}
                  showPreview={true}
                  buttonText="Choose Image"
                />
              </div>

              <Button className="w-full btn-bw-primary" onClick={handleSave}>
                {form.id ? "Update" : "Add User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={users}
        label="Users List"
        showColumns={[
          "code",
          "branch_id",
          "username",
          "phone",
          "address",
          "status",
          "image",
        ]}
        columnFormats={{
          status: (val) => formatStatus(val),
        }}
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
