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
  DialogFooter,
} from "@/components/ui/dialog";

type Branch = {
  id: number;
  name: string;
  location: string;
};

export default function BranchPage() {
  const [branches, setBranches] = useState<Branch[]>([
    { id: 1, name: "Main Branch", location: "New York" },
    { id: 2, name: "Warehouse", location: "Los Angeles" },
  ]);

  const [form, setForm] = useState<Branch>({
    id: 0,
    name: "",
    location: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  // ✅ Add / Update
  const handleSave = () => {
    if (!form.name || !form.location) return alert("Please fill all fields");

    if (form.id) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === form.id
            ? { ...b, name: form.name, location: form.location }
            : b
        )
      );
    } else {
      const newId = branches.length
        ? Math.max(...branches.map((b) => b.id)) + 1
        : 1;
      setBranches((prev) => [
        ...prev,
        { id: newId, name: form.name, location: form.location },
      ]);
    }

    setForm({ id: 0, name: "", location: "" });
    setDialogOpen(false);
  };

  // ✅ Edit
  const handleEdit = (b: Branch) => {
    setForm({ ...b });
    setDialogOpen(true);
  };

  // ✅ Delete
  const handleDelete = (b: Branch) => {
    if (!confirm(`Delete ${b.name}?`)) return;
    setBranches((prev) => prev.filter((x) => x.id !== b.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branches Management</h1>
        <Button
          onClick={() => setDialogOpen(true)}
          className="btn-bw-primary flex gap-1"
        >
          <Plus size={16} /> Add Branch
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={branches}
        label="Branches List"
        hiddenColumns={["id"]}
        rowsPerPage={10}
        printHead={[
          { label: "Branch Name", value: "name" },
          { label: "Location", value: "location" },
        ]}
        actions={[
          { label: <Pen size={16} />, onClick: handleEdit },
          { label: <Trash size={16} />, onClick: handleDelete },
        ]}
      />

      {/* ✅ Dialog for Add / Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-amber-50">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Branch" : "Add Branch"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <input
              type="text"
              placeholder="Branch Name"
              className="border px-3 py-2 rounded w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Location"
              className="border px-3 py-2 rounded w-full"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="btn-bw-primary">
              {form.id ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
