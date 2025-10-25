"use client";

import { useState } from "react";
import { Eye, Trash, Play } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type HoldSale = {
  id: number;
  holdNo: string;
  customer: string;
  date: string;
  total: number;
  status: "On Hold" | "Pending";
};

export default function HoldSalesPage() {
  const [holds, setHolds] = useState<HoldSale[]>([
    {
      id: 1,
      holdNo: "HOLD-001",
      customer: "John Doe",
      date: "2025-09-14",
      total: 300,
      status: "On Hold",
    },
    {
      id: 2,
      holdNo: "HOLD-002",
      customer: "Jane Smith",
      date: "2025-09-13",
      total: 120,
      status: "Pending",
    },
  ]);

  const [selectedHold, setSelectedHold] = useState<HoldSale | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ✅ Delete
  const handleDelete = (hold: HoldSale) => {
    if (!confirm(`Delete hold ${hold.holdNo}?`)) return;
    setHolds((prev) => prev.filter((x) => x.id !== hold.id));
  };

  // ✅ View / Resume
  const handleView = (hold: HoldSale) => {
    setSelectedHold(hold);
    setDialogOpen(true);
  };

  const handleResume = (hold: HoldSale) => {
    alert(`Resuming Hold Sale: ${hold.holdNo}`);
    // You can redirect to POS page with hold data
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Hold Sales</h1>

      {/* DataTable */}
      <DataTable
        data={holds}
        label="Hold Sales"
      
        rowsPerPage={10}
        printHead={[
          { label: "Hold No", value: "holdNo" },
          { label: "Customer", value: "customer" },
          { label: "Date", value: "date" },
          { label: "Total", value: "total" },
          { label: "Status", value: "status" },
        ]}
        actions={[
          { label: <Eye size={16} />, onClick: handleView },
          { label: <Play size={16} />, onClick: handleResume },
          { label: <Trash size={16} />, onClick: handleDelete },
        ]}
      />

      {/* Dialog for View */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hold Sale Details</DialogTitle>
          </DialogHeader>

          {selectedHold && (
            <div className="space-y-3 mt-2">
              <p>
                <strong>Hold No:</strong> {selectedHold.holdNo}
              </p>
              <p>
                <strong>Customer:</strong> {selectedHold.customer}
              </p>
              <p>
                <strong>Date:</strong> {selectedHold.date}
              </p>
              <p>
                <strong>Total:</strong> ${selectedHold.total}
              </p>
              <p>
                <strong>Status:</strong> {selectedHold.status}
              </p>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button
              onClick={() => selectedHold && handleResume(selectedHold)}
              className="btn-bw-primary"
            >
              Resume
            </Button>
            <Button
              onClick={() => setDialogOpen(false)}
              className="btn-bw-secondary"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
