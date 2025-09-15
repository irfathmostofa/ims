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

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "9876543210",
      address: "456 Elm St",
    },
  ]);

  const [form, setForm] = useState<{
    id?: number;
    name: string;
    email: string;
    phone: string;
    address?: string;
  }>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [open, setOpen] = useState(false);

  // ✅ Add / Update
  const handleSave = () => {
    if (!form.name || !form.email || !form.phone) {
      alert("Name, Email, and Phone are required.");
      return;
    }

    if (form.id) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === form.id ? { ...c, ...form } : c))
      );
    } else {
      const newId = customers.length
        ? Math.max(...customers.map((c) => c.id)) + 1
        : 1;
      setCustomers((prev) => [...prev, { ...form, id: newId }]);
    }

    setForm({ name: "", email: "", phone: "", address: "" });
    setOpen(false); // close dialog
  };

  // ✅ Edit
  const handleEdit = (cust: Customer) => {
    setForm(cust);
    setOpen(true); // open dialog for edit
  };

  // ✅ Delete
  const handleDelete = (cust: Customer) => {
    if (!confirm(`Are you sure you want to delete ${cust.name}?`)) return;
    setCustomers((prev) => prev.filter((c) => c.id !== cust.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <h1 className="text-2xl font-bold">Customers</h1>

        {/* ✅ Add Customer Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Customer
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Customer" : "Add Customer"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <input
                type="text"
                placeholder="Name"
                className="border px-3 py-2 rounded w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="border px-3 py-2 rounded w-full"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone"
                className="border px-3 py-2 rounded w-full"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <textarea
                placeholder="Address"
                className="border px-3 py-2 rounded w-full"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <Button className="w-full btn-bw-primary" onClick={handleSave}>
                {form.id ? "Update" : "Add Customer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={customers}
        label="Customer List"
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
