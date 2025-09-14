"use client";

import { useState } from "react";
import { Eye, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type ReturnItem = {
  id: number;
  returnNo: string;
  customer: string;
  date: string;
  total: number;
  status: "Processed" | "Pending" | "Cancelled";
};

export default function ReturnsListPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([
    {
      id: 1,
      returnNo: "RET-001",
      customer: "John Doe",
      date: "2025-09-14",
      total: 200,
      status: "Processed",
    },
    {
      id: 2,
      returnNo: "RET-002",
      customer: "Jane Smith",
      date: "2025-09-13",
      total: 150,
      status: "Pending",
    },
  ]);

  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ✅ Delete
  const handleDelete = (item: ReturnItem) => {
    if (!confirm(`Delete return ${item.returnNo}?`)) return;
    setReturns((prev) => prev.filter((x) => x.id !== item.id));
  };

  // ✅ View
  const handleView = (item: ReturnItem) => {
    setSelectedReturn(item);
    setDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Returns List</h1>

      {/* DataTable */}
      <DataTable
        data={returns}
        label="Returns"
        hiddenColumns={["id"]}
        rowsPerPage={10}
        printHead={[
          { label: "Return No", value: "returnNo" },
          { label: "Customer", value: "customer" },
          { label: "Date", value: "date" },
          { label: "Total", value: "total" },
          { label: "Status", value: "status" },
        ]}
        actions={[
          { label: <Eye size={16} />, onClick: handleView },
          { label: <Trash size={16} />, onClick: handleDelete },
        ]}
      />

      {/* Dialog for View */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-amber-50">
          <DialogHeader>
            <DialogTitle>Return Details</DialogTitle>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-3 mt-2">
              <p>
                <strong>Return No:</strong> {selectedReturn.returnNo}
              </p>
              <p>
                <strong>Customer:</strong> {selectedReturn.customer}
              </p>
              <p>
                <strong>Date:</strong> {selectedReturn.date}
              </p>
              <p>
                <strong>Total:</strong> ${selectedReturn.total}
              </p>
              <p>
                <strong>Status:</strong> {selectedReturn.status}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setDialogOpen(false)}
              className="btn-bw-primary"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
