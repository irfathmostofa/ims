"use client";

import { useState, useEffect } from "react";
import { Pen, Trash, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import { formatDate, formatDateForInput } from "@/components/utils/formatter";
import { useAuthStore } from "@/store/authStore";

type GRNItem = {
  po_item_id: number;
  product: string;
  orderedQty: number;
  receivedQty: number;
  leftToReceive: number;
  unit_price?: number;
  notes?: string | null;
};

type GRN = {
  id: number;
  poNumber: number;
  code?: string;
  received_by?: string;
  notes?: string;
  grnDate: string;
  received_date?: string;
  created_at?: string;
  status: "Pending" | "Received" | "Partially Received";
  items: GRNItem[];
};

type PurchaseOrderItem = {
  id: number;
  product_variant_id: number;
  quantity: number;
  received_quantity: number;
  product_name?: string;
  unit_price: number;
};

type PurchaseOrder = {
  id: number;
  code: string;
  supplier_name: string;
  items: PurchaseOrderItem[];
};

export default function GRNPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const { user } = useAuthStore();
  const [grns, setGrns] = useState<GRN[]>([]);
  const [update, setUpdate] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GRN>({
    id: 0,
    poNumber: 0,
    grnDate: "",
    status: "Pending",
    items: [],
  });
  const [loading, setLoading] = useState(false);

  // Fetch POs and GRNs
  const fetchData = async () => {
    try {
      setLoading(true);
      const [poRes, grnRes] = await Promise.all([
        apiClient(`${import.meta.env.VITE_SERVER}/po/purchase-orders`, {
          method: "GET",
          tokenType: "jwt",
        }),
        apiClient(`${import.meta.env.VITE_SERVER}/po/grns`, {
          method: "GET",
          tokenType: "jwt",
        }),
      ]);
      setPurchaseOrders(poRes.data || []);
      setGrns(grnRes.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [update]);

  // Open dialog
  const handleOpen = (grn?: GRN) => {
    if (grn) {
      // Edit existing GRN
      setForm({
        ...grn,
        grnDate: formatDateForInput(grn.grnDate),
      });
    } else {
      // New GRN
      setForm({
        id: 0,
        poNumber: 0,
        grnDate: formatDateForInput(new Date().toISOString()),
        status: "Pending",
        items: [],
      });
    }
    setOpen(true);
  };

  // Load PO items and calculate left to receive
  const handlePOChange = (poId: number) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return setForm({ ...form, poNumber: 0, items: [] });
    const items: GRNItem[] = po.items.map((i) => ({
      po_item_id: i.id,
      product: i.product_name || `Variant #${i.product_variant_id}`,
      orderedQty: i.quantity,
      receivedQty: 0, // user input now
      leftToReceive: i.quantity - (i.received_quantity || 0),
      unit_price: i.unit_price,
      notes: null,
    }));

    setForm({ ...form, poNumber: poId, items });
  };

  // Handle item quantity input
  const handleItemChange = (po_item_id: number, value: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.po_item_id === po_item_id
          ? { ...i, receivedQty: Math.min(Math.max(0, value), i.leftToReceive) }
          : i
      ),
    }));
  };

  // Save GRN
  const handleSave = async () => {
    if (!form.poNumber || !form.grnDate || !form.items.length) {
      return toast.error("Please fill all required fields");
    }
    console.log(form);
    setLoading(true);

    try {
      const payload = {
        purchase_order_id: form.poNumber,
        received_by: user?.id,
        grn_date: form.grnDate,
        items: form.items
          .filter((i) => i.receivedQty > 0)
          .map((i) => ({
            po_item_id: i.po_item_id,
            received_quantity: i.receivedQty,
            unit_price: i.unit_price,
            notes: i.notes || null,
          })),
      };

      const url = form.id
        ? `${import.meta.env.VITE_SERVER}/po/update-grn/${form.id}`
        : `${import.meta.env.VITE_SERVER}/po/grn`;

      const response = await apiClient(url, {
        method: "POST",
        tokenType: "jwt",
        data: payload,
      });

      if (response.success) {
        toast.success(response.message || "GRN saved successfully");
        setOpen(false);
        setUpdate(update + 1);
      } else {
        toast.error(response.message || "Failed to save GRN");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save GRN");
    } finally {
      setLoading(false);
    }
  };

  // Delete GRN
  const handleDelete = async (grn: GRN) => {
    if (!confirm(`Delete GRN #${grn.id}?`)) return;
    try {
      const res = await apiClient(
        `${import.meta.env.VITE_SERVER}/po/delete-grn`,
        {
          method: "POST",
          data: { id: grn.id },
          tokenType: "jwt",
        }
      );
      if (res.success) {
        toast.success("GRN deleted successfully");
        fetchData();
      } else toast.error(res.message || "Failed to delete GRN");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete GRN");
    }
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

      <DataTable
        data={grns}
        label="GRN List"
        rowsPerPage={10}
        loading={loading}
        showColumns={[
          "code",
          "received_date",
          "created_at",
          "received_by",
          "notes",
          "status",
        ]}
        printHead={[
          { label: "PO Number", value: "poNumber" },
          { label: "Date", value: "grnDate" },
          { label: "Status", value: "status" },
        ]}
        actions={[
          { label: <Pen size={16} />, onClick: (row) => handleOpen(row) },
          { label: <Trash size={16} />, onClick: (row) => handleDelete(row) },
        ]}
        columnFormats={{
          grnDate: (val) => formatDateForInput(val),
          received_date: (val) => formatDate(val),
          created_at: (val) => formatDate(val),
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-2xl bg-amber-50">
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
                disabled={!!form.id}
              >
                <option value={0}>Select Purchase Order</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    # {po.code} - {po.supplier_name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="border px-3 py-2 rounded w-full"
                value={formatDateForInput(form.grnDate)}
                onChange={(e) => setForm({ ...form, grnDate: e.target.value })}
              />

              <select
                className="border px-3 py-2 rounded w-full"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as GRN["status"] })
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
                    <th className="border p-2">Left to Receive</th>
                    <th className="border p-2">Receive Now</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item) => (
                    <tr key={item.po_item_id}>
                      <td className="border p-2">{item.product}</td>
                      <td className="border p-2 text-center">
                        {item.orderedQty}
                      </td>
                      <td className="border p-2 text-center">
                        {item.leftToReceive}
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          className="border px-2 py-1 rounded w-full"
                          value={item.receivedQty}
                          onChange={(e) =>
                            handleItemChange(
                              item.po_item_id,
                              Number(e.target.value)
                            )
                          }
                          min={0}
                          max={item.leftToReceive}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="btn-bw-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : form.id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
