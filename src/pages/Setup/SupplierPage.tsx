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

type Supplier = {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
};

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: 1,
      name: "Tech Distributors Ltd.",
      contactPerson: "John Doe",
      phone: "+1 234 567 890",
      email: "john@techdist.com",
      address: "123 Market Street, New York, USA",
    },
    {
      id: 2,
      name: "Global Supplies",
      contactPerson: "Jane Smith",
      phone: "+44 20 1234 5678",
      email: "jane@globalsupplies.com",
      address: "45 Oxford Street, London, UK",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Supplier>({
    id: 0,
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  });

  // ✅ Open dialog for Add or Edit
  const handleOpen = (supplier?: Supplier) => {
    if (supplier) {
      setForm({ ...supplier });
    } else {
      setForm({
        id: 0,
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
      });
    }
    setOpen(true);
  };

  // ✅ Save
  const handleSave = () => {
    if (!form.name || !form.contactPerson || !form.phone) {
      return alert("Name, Contact Person, and Phone are required!");
    }

    if (form.id) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === form.id ? { ...form } : s))
      );
    } else {
      const newId = suppliers.length
        ? Math.max(...suppliers.map((s) => s.id)) + 1
        : 1;
      setSuppliers((prev) => [...prev, { ...form, id: newId }]);
    }

    setOpen(false);
  };

  // ✅ Delete
  const handleDelete = (s: Supplier) => {
    if (!confirm(`Delete supplier ${s.name}?`)) return;
    setSuppliers((prev) => prev.filter((x) => x.id !== s.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers Management</h1>
        <Button
          onClick={() => handleOpen()}
          className="btn-bw-primary flex gap-1"
        >
          <Plus size={16} /> Add Supplier
        </Button>
      </div>

      {/* ✅ Supplier Table */}
      <DataTable
        data={suppliers}
        label="Supplier List"
        hiddenColumns={["id"]}
        rowsPerPage={10}
        printHead={[
          { label: "Name", value: "name" },
          { label: "Contact Person", value: "contactPerson" },
          { label: "Phone", value: "phone" },
          { label: "Email", value: "email" },
          { label: "Address", value: "address" },
        ]}
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
              {form.id ? "Edit Supplier" : "Add Supplier"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Supplier Name"
              className="border px-3 py-2 rounded w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Contact Person"
              className="border px-3 py-2 rounded w-full"
              value={form.contactPerson}
              onChange={(e) =>
                setForm({ ...form, contactPerson: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Phone"
              className="border px-3 py-2 rounded w-full"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="border px-3 py-2 rounded w-full"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <textarea
              placeholder="Address"
              className="border px-3 py-2 rounded w-full"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
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
  );
}
