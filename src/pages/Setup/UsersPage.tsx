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
};

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roleId: number;
  roleName?: string;
  status: "Active" | "Inactive";
};

export default function UsersPage() {
  // ✅ Dummy roles (replace with API/fetch later)
  const [roles] = useState<Role[]>([
    { id: 1, name: "Admin" },
    { id: 2, name: "Manager" },
    { id: 3, name: "Staff" },
  ]);

  // ✅ Users state
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      roleId: 1,
      roleName: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      roleId: 2,
      roleName: "Manager",
      status: "Inactive",
    },
  ]);

  const [form, setForm] = useState<Partial<User>>({});
  const [open, setOpen] = useState(false);

  // ✅ Add / Update User
  const handleSave = () => {
    if (!form.name || !form.email || !form.roleId) {
      alert("Name, email, and role are required");
      return;
    }

    const role = roles.find((r) => r.id === form.roleId);
    if (!role) return;

    if (form.id) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === form.id ? { ...u, ...form, roleName: role.name } : u
        )
      );
    } else {
      const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      setUsers((prev) => [
        ...prev,
        {
          ...form,
          id: newId,
          roleName: role.name,
          status: form.status || "Active",
        } as User,
      ]);
    }

    setForm({});
    setOpen(false);
  };

  // ✅ Edit User
  const handleEdit = (u: User) => {
    setForm(u);
    setOpen(true);
  };

  // ✅ Delete User
  const handleDelete = (u: User) => {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    setUsers((prev) => prev.filter((user) => user.id !== u.id));
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
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                type="email"
                placeholder="Email"
                className="border px-3 py-2 rounded w-full"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                type="text"
                placeholder="Phone"
                className="border px-3 py-2 rounded w-full"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.roleId || ""}
                onChange={(e) =>
                  setForm({ ...form, roleId: Number(e.target.value) })
                }
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.status || "Active"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as "Active" | "Inactive",
                  })
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <Button className="w-full btn-bw-primary" onClick={handleSave}>
                {form.id ? "Update" : "Add User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Users DataTable */}
      <DataTable
        data={users}
        label="Users List"
        hiddenColumns={["id", "roleId"]}
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
