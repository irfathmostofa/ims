"use client";

import { useState, useEffect } from "react";
import { Eye, DollarSign, Printer, Search, Filter } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import { formatDate } from "@/components/utils/formatter";
import { printView } from "@/components/utils/print";

interface Invoice {
  id: number;
  code: string;
  branch_id: number;
  branch_name?: string;
  party_id: number;
  party_name?: string;
  type: "PURCHASE" | "SALES";
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
  created_at: string;
  items?: InvoiceItem[];
}

interface InvoiceItem {
  id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export default function SuppliersPayPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Payment form
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: "1",
        limit: "100",
        type: "PURCHASE",
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      };

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/get-All-invoices`,
        {
          method: "POST",
          tokenType: "jwt",
          data: params,
        }
      );

      if (response.success) {
        setInvoices(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch invoices");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast.error(err.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredInvoices = invoices.filter((invoice) => {
    // Search filter
    if (
      searchTerm &&
      !invoice.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !invoice.party_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (selectedStatus !== "all" && invoice.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  // Make payment
  const handleMakePayment = async () => {
    if (!selectedInvoice) return;

    try {
      const newPaidAmount = selectedInvoice.paid_amount + paymentAmount;
      const newStatus =
        newPaidAmount >= selectedInvoice.total_amount ? "PAID" : "PARTIAL";

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/update-invoices/${
          selectedInvoice.id
        }`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            branch_id: selectedInvoice.branch_id,
            party_id: selectedInvoice.party_id,
            invoice_date: selectedInvoice.invoice_date,
            items: selectedInvoice.items || [],
            paid_amount: newPaidAmount,
            status: newStatus,
          },
        }
      );

      if (response.success) {
        toast.success("Payment recorded successfully");
        setOpenPaymentDialog(false);
        setPaymentAmount(0);
        fetchInvoices(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to record payment");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to record payment");
    }
  };

  // Open view dialog
  const openView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenViewDialog(true);
  };

  // Open payment dialog
  const openPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    const remaining = invoice.total_amount - invoice.paid_amount;
    setPaymentAmount(remaining);
    setOpenPaymentDialog(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="success">Paid</Badge>;
      case "PARTIAL":
        return <Badge variant="warning">Partial</Badge>;
      case "PENDING":
        return <Badge variant="destructive">Pending</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate remaining amount
  const getRemainingAmount = (invoice: Invoice) => {
    return invoice.total_amount - invoice.paid_amount;
  };

  // Table actions
  const tableActions = [
    {
      label: <Eye size={16} />,
      className: "text-blue-600 hover:text-blue-800",
      title: "View Details",
      onClick: (row: Invoice) => openView(row),
    },
    {
      label: <Printer size={16} />,
      className: "text-purple-600 hover:text-purple-800",
      title: "Print",
      onClick: (row: Invoice) => {
        setSelectedInvoice(row);
        setTimeout(() => printView("invoice-print-view"), 100);
      },
    },
    {
      label: (
        <p className="px-2 py-1 bg-emerald-400 text-amber-50 rounded cursor-pointer">
          Pay
        </p>
      ),
      className: "text-green-600 hover:text-green-800",
      title: "Pay",
      onClick: (row: Invoice) =>
        getRemainingAmount(row) > 0 && openPayment(row),
      disabled: (row: Invoice) => getRemainingAmount(row) <= 0,
    },
  ];

  // Initialize
  useEffect(() => {
    fetchInvoices();
  }, [selectedStatus]);

  // Render formatted invoice details
  const renderInvoiceDetails = (invoice: Invoice) => (
    <>
      {/* Hidden print section */}
      <div id="invoice-print-view" className="hidden">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
            <p className="text-gray-600">Invoice #{invoice.code}</p>
          </div>

          {/* Company & Supplier Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Company Details
              </h3>
              <div className="space-y-1 text-gray-600">
                <p className="font-medium">Your Company Name</p>
                <p>123 Business Street</p>
                <p>City, Country</p>
                <p>Phone: 0123456789</p>
                <p>Email: info@company.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Supplier Details
              </h3>
              <div className="space-y-1 text-gray-600">
                <p className="font-medium">{invoice.party_name || "N/A"}</p>
                <p>Invoice Date: {formatDate(invoice.invoice_date)}</p>
                <p>Invoice #: {invoice.code}</p>
                <p>Status: {invoice.status}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Invoice Items
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Item
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Unit Price
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Discount
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-3 px-4 text-gray-700">
                        {item.product_name || `Item ${index + 1}`}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formatCurrency(item.discount)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {formatCurrency(
                          item.quantity * item.unit_price - item.discount
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="max-w-xs ml-auto space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.total_amount)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Paid:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.paid_amount)}
                </span>
              </div>
              <div className="flex justify-between text-gray-800 font-bold text-lg pt-3 border-t">
                <span>Balance Due:</span>
                <span
                  className={
                    getRemainingAmount(invoice) > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {formatCurrency(getRemainingAmount(invoice))}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
            <p className="mt-2">
              For any queries, please contact: info@company.com
            </p>
          </div>
        </div>
      </div>

      {/* Visible details */}
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">INVOICE DETAILS</h2>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-gray-600">#{invoice.code}</span>
            {getStatusBadge(invoice.status)}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Supplier Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-32 text-gray-600">Supplier:</span>
                <span className="font-semibold">
                  {invoice.party_name || "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600">Invoice Date:</span>
                <span>{formatDate(invoice.invoice_date)}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600">Invoice #:</span>
                <span className="font-mono font-bold">{invoice.code}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(invoice.total_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(invoice.paid_amount)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-semibold">Balance Due:</span>
                <span
                  className={`font-bold text-xl ${
                    getRemainingAmount(invoice) > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {formatCurrency(getRemainingAmount(invoice))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        {invoice.items && invoice.items.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Invoice Items
            </h3>
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-left font-semibold text-gray-700">
                        Item Description
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-700">
                        Qty
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-700">
                        Unit Price
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-700">
                        Discount
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-700">
                        Line Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100 transition-colors`}
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-800">
                            {item.product_name || `Item ${index + 1}`}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-700 font-medium">
                            {item.quantity}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-700">
                            {formatCurrency(item.unit_price)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-red-600">
                            {formatCurrency(item.discount)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-800">
                            {formatCurrency(
                              item.quantity * item.unit_price - item.discount
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t">
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 px-6 text-right font-semibold text-gray-700"
                      >
                        Grand Total:
                      </td>
                      <td className="py-4 px-6 font-bold text-xl text-gray-800">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Notes (if any) */}
        <div className="bg-gray-50 p-5 rounded-xl">
          <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
          <p className="text-gray-600">
            {getRemainingAmount(invoice) > 0
              ? `Payment of ${formatCurrency(
                  getRemainingAmount(invoice)
                )} is pending. Please make payment to clear this invoice.`
              : "This invoice has been fully paid. Thank you for your payment."}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Suppliers Payables</h1>
          <p className="text-gray-600">Manage supplier invoices and payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by invoice code or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchInvoices} variant="outline">
          <Filter size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Invoices Table */}
      <DataTable<Invoice>
        data={filteredInvoices}
        label="Supplier Invoices"
        rowsPerPage={10}
        loading={loading}
        showColumns={[
          { key: "code", label: "Invoice Code" },
          { key: "party_name", label: "Supplier" },
          { key: "invoice_date", label: "Date" },
          { key: "total_amount", label: "Total Amount" },
          { key: "paid_amount", label: "Paid Amount" },
          { key: "status", label: "Status" },
        ]}
        columnFormats={{
          invoice_date: (val: string) => formatDate(val),
          total_amount: (val: number) => (
            <span className="font-semibold">{formatCurrency(val)}</span>
          ),
          paid_amount: (val: number) => (
            <span className="text-green-600">{formatCurrency(val)}</span>
          ),
          status: (val: string) => getStatusBadge(val),
        }}
        actions={tableActions}
      />

      {/* View Invoice Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Invoice Details</DialogTitle>
          </DialogHeader>

          {selectedInvoice && renderInvoiceDetails(selectedInvoice)}

          <DialogFooter className="flex gap-2 sticky bottom-0 bg-white pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => printView("invoice-print-view")}
            >
              <Printer size={16} className="mr-2" />
              Print Invoice
            </Button>
            {selectedInvoice && getRemainingAmount(selectedInvoice) > 0 && (
              <Button
                onClick={() => {
                  setOpenViewDialog(false);
                  openPayment(selectedInvoice);
                }}
              >
                <DollarSign size={16} className="mr-2" />
                Make Payment
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setOpenViewDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
        <DialogContent className="sm:max-w-md bg-amber-50">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice:</span>
                    <span className="font-bold">{selectedInvoice.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supplier:</span>
                    <span>{selectedInvoice.party_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedInvoice.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Already Paid:</span>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(selectedInvoice.paid_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-bold text-gray-700">Due Amount:</span>
                    <span className="font-bold text-xl text-red-600">
                      {formatCurrency(getRemainingAmount(selectedInvoice))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border">
                <Label htmlFor="amount" className="block mb-2 font-medium">
                  Payment Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  max={getRemainingAmount(selectedInvoice)}
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(parseFloat(e.target.value) || 0)
                  }
                  className="text-lg py-3"
                />
                <div className="text-sm text-gray-500 mt-2">
                  Maximum payable:{" "}
                  <span className="font-semibold">
                    {formatCurrency(getRemainingAmount(selectedInvoice))}
                  </span>
                </div>
              </div>

              {paymentAmount > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    Payment Summary
                  </div>
                  <div className="space-y-2 text-blue-700">
                    <div className="flex justify-between">
                      <span>Current Paid:</span>
                      <span>
                        {formatCurrency(selectedInvoice.paid_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Payment:</span>
                      <span className="font-semibold">
                        {formatCurrency(paymentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span>New Paid Total:</span>
                      <span className="font-bold">
                        {formatCurrency(
                          selectedInvoice.paid_amount + paymentAmount
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Status:</span>
                      <span
                        className={`font-bold ${
                          selectedInvoice.paid_amount + paymentAmount >=
                          selectedInvoice.total_amount
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {selectedInvoice.paid_amount + paymentAmount >=
                        selectedInvoice.total_amount
                          ? "PAID"
                          : "PARTIAL"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenPaymentDialog(false);
                setPaymentAmount(0);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMakePayment}
              disabled={!paymentAmount || paymentAmount <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}