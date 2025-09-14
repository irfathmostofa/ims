"use client";

import { useState } from "react";
import { Eye, Pen, Trash, Plus, X } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PurchaseOrderItem = {
  id: number;
  product: string;
  qty: number;
  price: number;
};

type PurchaseOrder = {
  id: number;
  supplier: string;
  date: string;
  status: "Pending" | "Received" | "Cancelled";
  items: PurchaseOrderItem[];
  total: number;
};

export default function PurchaseOrderPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([
    {
      id: 1,
      supplier: "ABC Suppliers",
      date: "2025-09-14",
      status: "Pending",
      items: [
        { id: 1, product: "Laptop", qty: 2, price: 600 },
        { id: 2, product: "Mouse", qty: 5, price: 20 },
      ],
      total: 1300,
    },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PurchaseOrder>({
    id: 0,
    supplier: "",
    date: "",
    status: "Pending",
    items: [],
    total: 0,
  });

  // ✅ Open Dialog
  const handleOpen = (po?: PurchaseOrder) => {
    if (po) {
      setForm(po);
    } else {
      setForm({
        id: 0,
        supplier: "",
        date: "",
        status: "Pending",
        items: [],
        total: 0,
      });
    }
    setOpen(true);
  };

  // ✅ Add Item
  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), product: "", qty: 1, price: 0 }],
    }));
  };

  // ✅ Update Item
  const handleItemChange = (
    id: number,
    field: keyof PurchaseOrderItem,
    value: string | number
  ) => {
    setForm((prev) => {
      const items = prev.items.map((i) =>
        i.id === id ? { ...i, [field]: value } : i
      );
      const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
      return { ...prev, items, total };
    });
  };

  // ✅ Remove Item
  const handleRemoveItem = (id: number) => {
    setForm((prev) => {
      const items = prev.items.filter((i) => i.id !== id);
      const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
      return { ...prev, items, total };
    });
  };

  // ✅ Save Order
  const handleSave = () => {
    if (!form.supplier || !form.date || !form.items.length) {
      return alert("Please fill all required fields and add at least one item");
    }

    if (form.id) {
      setOrders((prev) => prev.map((o) => (o.id === form.id ? form : o)));
    } else {
      const newId = orders.length
        ? Math.max(...orders.map((o) => o.id)) + 1
        : 1;
      setOrders((prev) => [...prev, { ...form, id: newId }]);
    }
    setOpen(false);
  };

  // ✅ Delete
  const handleDelete = (po: PurchaseOrder) => {
    if (!confirm(`Delete Purchase Order #${po.id}?`)) return;
    setOrders((prev) => prev.filter((o) => o.id !== po.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Button
          onClick={() => handleOpen()}
          className="btn-bw-primary flex gap-1"
        >
          <Plus size={16} /> New Purchase Order
        </Button>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={orders}
        label="Purchase Orders List"
        hiddenColumns={["id", "items"]}
        rowsPerPage={10}
        printHead={[
          { label: "Supplier", value: "supplier" },
          { label: "Date", value: "date" },
          { label: "Status", value: "status" },
          { label: "Total", value: "total" },
        ]}
        actions={[
          {
            label: <Eye size={16} />,
            onClick: (row) =>
              alert(
                `PO #${row.id}\nSupplier: ${row.supplier}\nItems: ${row.items.length}`
              ),
          },
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
        <DialogContent className=" bg-amber-50 ">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Purchase Order" : "New Purchase Order"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* PO Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Supplier Name"
                className="border px-3 py-2 rounded w-full"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              />
              <input
                type="date"
                className="border px-3 py-2 rounded w-full"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <select
                className="border px-3 py-2 rounded w-full"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as PurchaseOrder["status"],
                  })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* PO Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Items</h2>
                <Button size="sm" onClick={handleAddItem} className="border">
                  <Plus size={14} className="mr-1" /> Add Item
                </Button>
              </div>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Product</th>
                    <th className="border p-2">Qty</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Subtotal</th>
                    <th className="border p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-2">
                        <input
                          type="text"
                          placeholder="Product Name"
                          className="border px-2 py-1 rounded w-full"
                          value={item.product}
                          onChange={(e) =>
                            handleItemChange(item.id, "product", e.target.value)
                          }
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          className="border px-2 py-1 rounded w-full"
                          value={item.qty}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "qty",
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          className="border px-2 py-1 rounded w-full"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "price",
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td className="border p-2 text-right">
                        {item.qty * item.price}
                      </td>
                      <td className="border p-2 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end font-bold text-lg">
              Total: ${form.total}
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
