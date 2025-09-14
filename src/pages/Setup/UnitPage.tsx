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

type UOM = {
  id: number;
  name: string;
  symbol: string;
};

export default function UnitPage() {
  const [units, setUnits] = useState<UOM[]>([
    { id: 1, name: "Kilogram", symbol: "kg" },
    { id: 2, name: "Gram", symbol: "g" },
    { id: 3, name: "Liter", symbol: "L" },
    { id: 4, name: "Piece", symbol: "pc" },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<UOM>({
    id: 0,
    name: "",
    symbol: "",
  });

  // ✅ Open dialog for Add/Edit
  const handleOpen = (u?: UOM) => {
    if (u) {
      setForm({ id: u.id, name: u.name, symbol: u.symbol });
    } else {
      setForm({ id: 0, name: "", symbol: "" });
    }
    setOpen(true);
  };

  // ✅ Save
  const handleSave = () => {
    if (!form.name || !form.symbol) {
      return alert("Please fill all fields");
    }

    if (form.id) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === form.id ? { ...u, name: form.name, symbol: form.symbol } : u
        )
      );
    } else {
      const newId = units.length ? Math.max(...units.map((u) => u.id)) + 1 : 1;
      setUnits((prev) => [
        ...prev,
        { id: newId, name: form.name, symbol: form.symbol },
      ]);
    }
    setOpen(false);
  };

  // ✅ Delete
  const handleDelete = (u: UOM) => {
    if (!confirm(`Delete ${u.name}?`)) return;
    setUnits((prev) => prev.filter((x) => x.id !== u.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Unit of Measurement (UOM)</h1>
        <Button
          onClick={() => handleOpen()}
          className="btn-bw-primary flex gap-1"
        >
          <Plus size={16} /> Add Unit
        </Button>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={units}
        label="Unit List"
        hiddenColumns={["id"]}
        rowsPerPage={10}
        printHead={[
          { label: "Name", value: "name" },
          { label: "Symbol", value: "symbol" },
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
            <DialogTitle>{form.id ? "Edit Unit" : "Add Unit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Unit Name (e.g. Kilogram)"
              className="border px-3 py-2 rounded w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Symbol (e.g. kg)"
              className="border px-3 py-2 rounded w-full"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
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
