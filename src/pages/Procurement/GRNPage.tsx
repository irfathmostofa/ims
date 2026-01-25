"use client";

import { useState, useEffect } from "react";
import { Pen, Trash, Plus, Eye, Download } from "lucide-react";
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
import { DialogDescription } from "@radix-ui/react-dialog";
import { printView } from "@/components/utils/print";

type GRNItem = {
  id: number;
  product_variant_id: number;
  product_variant_code: string;
  product_variant_name: string;
  product_id: number;
  product_code: string;
  product_name: string;
  ordered_quantity: number;
  received_quantity: number;
  discrepancy: number;
  notes: string | null;
};

type GRN = {
  id: number;
  purchase_order_id: number;
  code: string;
  received_date: string;
  received_by: number;
  status: string;
  notes: string | null;
  created_at: string;
  received_by_name: string;
  items: GRNItem[];
};

type PurchaseOrderItem = {
  id: number;
  product_variant_name: string;
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
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    poNumber: 0,
    grnDate: "",
    status: "PENDING",
    notes: "",
    items: [] as Array<{
      po_item_id: number;
      product: string;
      orderedQty: number;
      receivedQty: number;
      leftToReceive: number;
      unit_price?: number;
      notes?: string | null;
    }>,
  });
  const [loading, setLoading] = useState(false);

  // Fetch POs and GRNs
  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const [poRes, grnRes] = await Promise.all([
        apiClient(`${import.meta.env.VITE_SERVER}/po/get-purchase-orders`, {
          method: "POST",
          tokenType: "jwt",
          data: { page, limit: 1000000000000000 },
        }),
        apiClient(`${import.meta.env.VITE_SERVER}/po/grns`, {
          method: "POST",
          tokenType: "jwt",
          data: { page, limit: pagination.limit },
        }),
      ]);

      setPurchaseOrders(poRes.data.data || []);

      if (grnRes.success) {
        const apiData = grnRes as any;
        setGrns(apiData.data.data || []);
        setPagination(
          apiData.data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 1,
            has_next: false,
            has_prev: false,
          },
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  // Open dialog
  const handleOpen = (grn?: GRN) => {
    if (grn) {
      // Edit existing GRN
      setForm({
        id: grn.id,
        poNumber: grn.purchase_order_id,
        grnDate: formatDateForInput(grn.received_date),
        status: grn.status,
        notes: grn.notes || "",
        items: grn.items.map((item) => ({
          po_item_id: item.id,
          product: `${item.product_name} - ${item.product_variant_name}`,
          orderedQty: item.ordered_quantity,
          receivedQty: item.received_quantity,
          leftToReceive: item.ordered_quantity - item.received_quantity,
          unit_price: 0, // You'll need to add this to your API response
          notes: item.notes,
        })),
      });
    } else {
      // New GRN
      setForm({
        id: 0,
        poNumber: 0,
        grnDate: formatDateForInput(new Date().toISOString()),
        status: "PENDING",
        notes: "",
        items: [],
      });
    }
    setOpen(true);
  };

  // Load PO items and calculate left to receive
  const handlePOChange = (poId: number) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return setForm({ ...form, poNumber: 0, items: [] });

    const items = po.items.map((i) => ({
      po_item_id: i.id,
      product:
        `${i.product_name} (${i.product_variant_name})` ||
        `Variant #${i.product_variant_id}`,
      orderedQty: i.quantity,
      receivedQty: 0,
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
          : i,
      ),
    }));
  };

  // Save GRN
  const handleSave = async () => {
    if (!form.poNumber || !form.grnDate || !form.items.length) {
      return toast.error("Please fill all required fields");
    }

    setLoading(true);

    try {
      const payload = {
        purchase_order_id: form.poNumber,
        received_by: user?.id,
        received_date: form.grnDate,
        status: form.status,
        notes: form.notes || null,
        items: form.items
          .filter((i) => i.receivedQty > 0)
          .map((i) => ({
            po_item_id: i.po_item_id,
            received_quantity: i.receivedQty,
            unit_price: i.unit_price || 0,
            notes: i.notes || null,
          })),
      };
      console.log(payload);
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
        fetchData(pagination.page); // Refresh current page
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
    if (!confirm(`Delete GRN ${grn.code}?`)) return;
    try {
      const res = await apiClient(
        `${import.meta.env.VITE_SERVER}/po/delete-grn/${grn.id}`,
        {
          method: "DELETE",
          tokenType: "jwt",
        },
      );
      if (res.success) {
        toast.success("GRN deleted successfully");
        fetchData(pagination.page); // Refresh current page
      } else toast.error(res.message || "Failed to delete GRN");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete GRN");
    }
  };
  const handleView = (grn: GRN) => {
    setSelectedGRN(grn);
    setViewOpen(true);
  };
  // Format status for display
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "Pending",
      RECEIVED: "Received",
      PARTIALLY_RECEIVED: "Partially Received",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return statusMap[status] || status;
  };
  const calculateTotals = (items: GRNItem[]) => {
    return {
      ordered: items.reduce((sum, item) => sum + item.ordered_quantity, 0),
      received: items.reduce((sum, item) => sum + item.received_quantity, 0),
      discrepancy: items.reduce((sum, item) => sum + item.discrepancy, 0),
    };
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
        pagination={true}
        page={pagination.page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.limit}
        loading={loading}
        showColumns={[
          "code",
          "received_date",
          "received_by_name",
          "status",
          "notes",
          "created_at",
        ]}
        printHead={[
          { label: "GRN Code", value: "code" },
          { label: "Received Date", value: "received_date" },
          { label: "Received By", value: "received_by_name" },
          { label: "Status", value: "status" },
        ]}
        actions={[
          { label: <Eye size={16} />, onClick: (row) => handleView(row) },
          { label: <Pen size={16} />, onClick: (row) => handleOpen(row) },
          { label: <Trash size={16} />, onClick: (row) => handleDelete(row) },
        ]}
        columnFormats={{
          received_date: (val) => formatDate(val),
          created_at: (val) => formatDate(val),
          status: (val) => formatStatus(val as string),
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-3xl bg-amber-50">
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
                    {po.code} - {po.supplier_name}
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
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="PENDING">Pending</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="RECEIVED">Received</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="border px-3 py-2 rounded w-full"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Optional notes..."
              />
            </div>

            {/* GRN Items */}
            <div>
              <h2 className="font-semibold mb-2">Items</h2>
              <div className="border rounded">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Product</th>
                      <th className="border p-2 text-center">Ordered Qty</th>
                      <th className="border p-2 text-center">
                        Left to Receive
                      </th>
                      <th className="border p-2 text-center">Receive Now</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.length > 0 ? (
                      form.items.map((item) => (
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
                              className="border px-2 py-1 rounded w-full text-center"
                              value={item.receivedQty}
                              onChange={(e) =>
                                handleItemChange(
                                  item.po_item_id,
                                  Number(e.target.value),
                                )
                              }
                              min={0}
                              max={item.leftToReceive}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="border p-4 text-center text-gray-500"
                        >
                          Select a purchase order to load items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="btn-bw-primary"
                disabled={loading || form.items.length === 0 || !form.poNumber}
              >
                {loading ? "Saving..." : form.id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="!max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">GRN Details</DialogTitle>
            <DialogDescription>
              Goods Received Note: {selectedGRN?.code}
            </DialogDescription>
          </DialogHeader>

          {selectedGRN && (
            <div className="space-y-6" id="printGRN">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-40">GRN Number:</span>
                    <span>{selectedGRN.code}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Purchase Order:</span>
                    <span>PO-{selectedGRN.purchase_order_id}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        selectedGRN.status === "RECEIVED"
                          ? "bg-green-100 text-green-800"
                          : selectedGRN.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedGRN.status === "PARTIALLY_RECEIVED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {formatStatus(selectedGRN.status)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-40">Received Date:</span>
                    <span>{formatDate(selectedGRN.received_date)}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Received By:</span>
                    <span>{selectedGRN.received_by_name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Created Date:</span>
                    <span>{formatDate(selectedGRN.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedGRN.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Notes:</h3>
                  <p className="text-gray-700">{selectedGRN.notes}</p>
                </div>
              )}

              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Product Code</th>
                      <th className="p-3 text-left">Product Name</th>
                      <th className="p-3 text-left">Variant</th>
                      <th className="p-3 text-center">Ordered Qty</th>
                      <th className="p-3 text-center">Received Qty</th>
                      <th className="p-3 text-center">Discrepancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGRN.items.map((item, index) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{item.product_code}</td>
                        <td className="p-3">{item.product_name}</td>
                        <td className="p-3">{item.product_variant_name}</td>
                        <td className="p-3 text-center">
                          {item.ordered_quantity}
                        </td>
                        <td className="p-3 text-center">
                          {item.received_quantity}
                        </td>
                        <td
                          className={`p-3 text-center font-semibold ${
                            item.discrepancy > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.discrepancy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan={4} className="p-3 text-right">
                        Totals:
                      </td>
                      <td className="p-3 text-center">
                        {calculateTotals(selectedGRN.items).ordered}
                      </td>
                      <td className="p-3 text-center">
                        {calculateTotals(selectedGRN.items).received}
                      </td>
                      <td className="p-3 text-center">
                        {calculateTotals(selectedGRN.items).discrepancy}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    printView("printGRN");
                  }}
                  className="flex gap-2"
                >
                  <Download size={16} />
                  Download/Print
                </Button>
                <Button onClick={() => setViewOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
