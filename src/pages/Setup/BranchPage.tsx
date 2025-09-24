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
import { Input } from "@/components/ui/input";

type Branch = {
  id?: number;
  companyId: number;
  name: string;
  type: string;
  phone: string;
  address: string;
};

export default function BranchesPage({ companyId }: { companyId: number }) {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: 1,
      companyId,
      name: "Main Branch",
      type: "Head Office",
      phone: "123456789",
      address: "123 Main St",
    },
    {
      id: 2,
      companyId,
      name: "Branch 2",
      type: "Retail",
      phone: "987654321",
      address: "456 Market St",
    },
  ]);

  const [form, setForm] = useState<Partial<Branch>>({});
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (!form.name) {
      alert("Branch name is required");
      return;
    }

    if (form.id) {
      setBranches((prev) =>
        prev.map((b) => (b.id === form.id ? ({ ...b, ...form } as Branch) : b))
      );
    } else {
      const newId = branches.length
        ? Math.max(...branches.map((b) => b.id || 0)) + 1
        : 1;
      setBranches((prev) => [
        ...prev,
        { ...form, id: newId, companyId } as Branch,
      ]);
    }

    setForm({});
    setOpen(false);
  };

  const handleEdit = (b: Branch) => {
    setForm(b);
    setOpen(true);
  };

  const handleDelete = (b: Branch) => {
    if (!confirm(`Delete branch "${b.name}"?`)) return;
    setBranches((prev) => prev.filter((branch) => branch.id !== b.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Branches</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Branch
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Branch" : "Add Branch"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <Input
                placeholder="Branch Name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Type"
                value={form.type || ""}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <Button className="w-full btn-bw-primary" onClick={handleSave}>
                {form.id ? "Update" : "Add Branch"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={branches}
        label="Branches List"
        hiddenColumns={["companyId", "id"]}
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
