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

type GRNItem = {
  id: number;
  product: string;
  orderedQty: number;
  receivedQty: number;
};

type GRN = {
  id: number;
  poNumber: number;
  grnDate: string;
  items: GRNItem[];
  status: "Pending" | "Received" | "Partially Received";
};

type PurchaseOrder = {
  id: number;
  supplier: string;
  items: { id: number; product: string; qty: number }[];
};

export default function GRNPage() {
  // Sample POs
  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 1,
      supplier: "ABC Suppliers",
      items: [
        { id: 1, product: "Laptop", qty: 2 },
        { id: 2, product: "Mouse", qty: 5 },
      ],
    },
    {
      id: 2,
      supplier: "XYZ Traders",
      items: [{ id: 3, product: "Keyboard", qty: 10 }],
    },
  ]);

  const [grns, setGrns] = useState<GRN[]>([
    {
      id: 1,
      poNumber: 1,
      grnDate: "2025-09-14",
      status: "Pending",
      items: [
        { id: 1, product: "Laptop", orderedQty: 2, receivedQty: 0 },
        { id: 2, product: "Mouse", orderedQty: 5, receivedQty: 0 },
      ],
    },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GRN>({
    id: 0,
    poNumber: 0,
    grnDate: "",
    status: "Pending",
    items: [],
  });

  // ✅ Open Dialog
  const handleOpen = (grn?: GRN) => {
    if (grn) {
      setForm(grn);
    } else {
      setForm({
        id: 0,
        poNumber: 0,
        grnDate: "",
        status: "Pending",
        items: [],
      });
    }
    setOpen(true);
  };

  // ✅ When PO selected, populate items
  const handlePOChange = (poId: number) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      const items = po.items.map((i) => ({
        ...i,
        receivedQty: 0,
        id: i.id,
        orderedQty: i.qty,
      }));
      setForm({ ...form, poNumber: poId, items });
    } else {
      setForm({ ...form, poNumber: 0, items: [] });
    }
  };

  // ✅ Update item received quantity
  const handleItemChange = (id: number, value: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === id ? { ...i, receivedQty: value } : i
      ),
    }));
  };

  // ✅ Save GRN
  const handleSave = () => {
    if (!form.poNumber || !form.grnDate || !form.items.length) {
      return alert("Please fill all required fields");
    }

    if (form.id) {
      setGrns((prev) => prev.map((g) => (g.id === form.id ? form : g)));
    } else {
      const newId = grns.length ? Math.max(...grns.map((g) => g.id)) + 1 : 1;
      setGrns((prev) => [...prev, { ...form, id: newId }]);
    }
    setOpen(false);
  };

  // ✅ Delete GRN
  const handleDelete = (grn: GRN) => {
    if (!confirm(`Delete GRN #${grn.id}?`)) return;
    setGrns((prev) => prev.filter((g) => g.id !== grn.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Goods Received Notes (GRN)</h1>
        <Button
          onClick={() => handleOpen()}
          className="btn-bw-primary flex gap-1"
        >
          <Plus size={16} /> New GRN
        </Button>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={grns}
        label="GRN List"
        hiddenColumns={["id", "items"]}
        rowsPerPage={10}
        printHead={[
          { label: "PO Number", value: "poNumber" },
          { label: "Date", value: "grnDate" },
          { label: "Status", value: "status" },
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

      {/* ✅ GRN Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-amber-50">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit GRN" : "New GRN"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* GRN Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                className="border px-3 py-2 rounded w-full"
                value={form.poNumber}
                onChange={(e) => handlePOChange(Number(e.target.value))}
              >
                <option value={0}>Select Purchase Order</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    #{po.id} - {po.supplier}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="border px-3 py-2 rounded w-full"
                value={form.grnDate}
                onChange={(e) => setForm({ ...form, grnDate: e.target.value })}
              />
              <select
                className="border px-3 py-2 rounded w-full"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as GRN["status"],
                  })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Partially Received">Partially Received</option>
                <option value="Received">Received</option>
              </select>
            </div>

            {/* GRN Items */}
            <div>
              <h2 className="font-semibold mb-2">Items</h2>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Product</th>
                    <th className="border p-2">Ordered Qty</th>
                    <th className="border p-2">Received Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-2">{item.product}</td>
                      <td className="border p-2 text-center">
                        {item.orderedQty}
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          className="border px-2 py-1 rounded w-full"
                          value={item.receivedQty}
                          onChange={(e) =>
                            handleItemChange(item.id, Number(e.target.value))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="btn-bw-primary">
                {form.id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
