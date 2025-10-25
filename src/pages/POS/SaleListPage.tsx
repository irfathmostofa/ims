"use client";

import { useState } from "react";
import { Trash, Eye } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Sale = {
  id: number;
  invoiceNo: string;
  customer: string;
  date: string;
  total: number;
  status: "Paid" | "Pending" | "Cancelled";
};

export default function SaleListPage() {
  const [sales, setSales] = useState<Sale[]>([
    {
      id: 1,
      invoiceNo: "INV-001",
      customer: "John Doe",
      date: "2025-09-14",
      total: 1200,
      status: "Paid",
    },
    {
      id: 2,
      invoiceNo: "INV-002",
      customer: "Jane Smith",
      date: "2025-09-13",
      total: 850,
      status: "Pending",
    },
  ]);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ✅ Delete
  const handleDelete = (sale: Sale) => {
    if (!confirm(`Delete invoice ${sale.invoiceNo}?`)) return;
    setSales((prev) => prev.filter((x) => x.id !== sale.id));
  };

  // ✅ View / Edit
  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sale List</h1>

      {/* DataTable */}
      <DataTable
        data={sales}
        label="Sales"
   
        rowsPerPage={10}
        printHead={[
          { label: "Invoice No", value: "invoiceNo" },
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

      {/* Dialog for View / Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-amber-50">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-3 mt-2">
              <p>
                <strong>Invoice No:</strong> {selectedSale.invoiceNo}
              </p>
              <p>
                <strong>Customer:</strong> {selectedSale.customer}
              </p>
              <p>
                <strong>Date:</strong> {selectedSale.date}
              </p>
              <p>
                <strong>Total:</strong> ${selectedSale.total}
              </p>
              <p>
                <strong>Status:</strong> {selectedSale.status}
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
