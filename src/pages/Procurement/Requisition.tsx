import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pen, Trash, Eye, Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

type RequisitionItem = {
  id: number;
  product_name: string;
  requested_qty: number;
  approved_qty?: number;
};

type Requisition = {
  id: number;
  code: string;
  from_branch: string;
  to_branch: string;
  date: string;
  status: string;
  items: RequisitionItem[];
};

export const Requisition = () => {
  const { user } = useAuthStore();
  const router = useNavigate();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [form, setForm] = useState<Requisition>({
    id: 0,
    code: "",
    from_branch: user?.branch_name || "Main Branch",
    to_branch: "",
    date: new Date().toISOString().slice(0, 10),
    status: "Pending",
    items: [],
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dummy data
  useEffect(() => {
    setRequisitions([
      {
        id: 1,
        code: "REQ-001",
        from_branch: "Dhaka Warehouse",
        to_branch: "Chittagong Branch",
        date: "2025-10-25",
        status: "Approved",
        items: [
          {
            id: 1,
            product_name: "Product A",
            requested_qty: 50,
            approved_qty: 40,
          },
          {
            id: 2,
            product_name: "Product B",
            requested_qty: 30,
            approved_qty: 30,
          },
        ],
      },
      {
        id: 2,
        code: "REQ-002",
        from_branch: "Dhaka Warehouse",
        to_branch: "Sylhet Branch",
        date: "2025-10-26",
        status: "Pending",
        items: [
          { id: 3, product_name: "Product C", requested_qty: 20 },
          { id: 4, product_name: "Product D", requested_qty: 15 },
        ],
      },
    ]);
  }, []);

  const handleOpen = (req?: Requisition) => {
    if (req) setForm(req);
    else
      setForm({
        id: 0,
        code: "",
        from_branch: user?.branch_name || "Main Branch",
        to_branch: "",
        date: new Date().toISOString().slice(0, 10),
        status: "Pending",
        items: [],
      });
    setOpen(true);
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1000);
  };

  const handleDelete = (req: Requisition) => {
    setRequisitions((prev) => prev.filter((r) => r.id !== req.id));
  };

  const handleApprove = (req: Requisition) => {
    setRequisitions((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: "Approved" } : r))
    );
  };

  const dummyProducts = [
    { id: 1, name: "Product A" },
    { id: 2, name: "Product B" },
    { id: 3, name: "Product C" },
  ];

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          product_name: dummyProducts[Math.floor(Math.random() * 3)].name,
          requested_qty: Math.floor(Math.random() * 50) + 1,
        },
      ],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Branch Requisition</h1>
        <Button
          onClick={() => handleOpen()}
          className="btn-bw-primary flex gap-1"
        >
          <Plus size={16} /> New Requisition
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={requisitions}
        label="Requisition List"
        rowsPerPage={10}
        showColumns={["code", "from_branch", "to_branch", "date", "status"]}
        printHead={[
          { label: "Code", value: "code" },
          { label: "From Branch", value: "from_branch" },
          { label: "To Branch", value: "to_branch" },
          { label: "Date", value: "date" },
          { label: "Status", value: "status" },
        ]}
        actions={[
          {
            label: <Eye size={16} />,
            onClick: (row) => router(`/procurement/requisition-view/${row.id}`),
          },
          {
            label: <Check size={16} />,
            onClick: (row) => {
              handleApprove(row), row.status === "Pending";
            },
          },
          { label: <Pen size={16} />, onClick: (row) => handleOpen(row) },
          { label: <Trash size={16} />, onClick: (row) => handleDelete(row) },
        ]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-2xl bg-gray-50">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Requisition" : "New Requisition"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="From Branch"
                value={form.from_branch}
                readOnly
                className="border px-3 py-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="To Branch"
                value={form.to_branch}
                onChange={(e) =>
                  setForm({ ...form, to_branch: e.target.value })
                }
                className="border px-3 py-2 rounded"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="border px-3 py-2 rounded"
              />
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Items</h2>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  + Add Item
                </Button>
              </div>

              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Product</th>
                    <th className="border p-2 text-center">Requested Qty</th>
                    <th className="border p-2 text-center">Approved Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-3 text-gray-500">
                        No items added yet
                      </td>
                    </tr>
                  ) : (
                    form.items.map((item) => (
                      <tr key={item.id}>
                        <td className="border p-2">{item.product_name}</td>
                        <td className="border p-2 text-center">
                          {item.requested_qty}
                        </td>
                        <td className="border p-2 text-center">
                          {item.approved_qty ?? "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3">
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

      {/* View Dialog */}
    </div>
  );
};
