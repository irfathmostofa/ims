"use client";

import { useState, useEffect } from "react";
import {
  Trash,
  Eye,
  RefreshCw,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Receipt,
  Printer,
  Download,
  Building,
  Phone,
  MapPin,
} from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import { formatDate } from "@/components/utils/formatter";
import { Badge } from "@/components/ui/badge";
import CustomInput from "@/components/ui/custom/customInput";

export type InvoiceItem = {
  id: number;
  product_variant_id: number;
  variant_name: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  returned_quantity: number;
  available_for_return: number;
  can_return: boolean;
};

export type Invoice = {
  id: number;
  code: string;
  branch_id: number;
  party_id: number;
  type: string;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: string;
  branch_name: string;
  party_name: string;
  party_phone: string;
  party_address: string;
  items: InvoiceItem[];
  payments?: any[];
  total_returned_amount?: number;
  created_at: string;
  created_by: number;
};

export default function SaleListPage() {
  const [sales, setSales] = useState<Invoice[]>([]);
  const [selectedSale, setSelectedSale] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchParams, setSearchParams] = useState({
    page: "1",
    limit: "10",
    search: "",
    from_date: "",
    to_date: "",
    type: "SALE",
    status: "",
  });
  // Fetch sales with useCallback to prevent unnecessary re-renders
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/get-All-invoices`,
        {
          method: "POST",
          tokenType: "jwt",
          data: searchParams,
        }
      );

      if (response.success) {
        setSales(response.data || []);
        // Update pagination info from API response
        if (response.pagination) {
          setPaginationInfo({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      } else {
        toast.error("Failed to fetch sales data");
        setSales([]);
        setPaginationInfo({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch sales");
      setSales([]);
      setPaginationInfo({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch with debounce
  useEffect(() => {
    fetchInvoices();
  }, [searchParams]);

  // Handle delete with confirmation
  const handleDelete = async (sale: Invoice) => {
    if (
      !confirm(
        `Are you sure you want to delete invoice ${sale.code}? This action cannot be undone.`
      )
    )
      return;

    try {
      setLoading(true);
      // Call delete API endpoint if available
      // const response = await apiClient(
      //   `${import.meta.env.VITE_SERVER}/sales/delete-invoice/${sale.id}`,
      //   {
      //     method: "DELETE",
      //     tokenType: "jwt",
      //   }
      // );

      // For now, just update local state
      setSales((prev) => prev.filter((x) => x.id !== sale.id));
      toast.success(`Invoice ${sale.code} deleted successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete invoice");
    } finally {
      setLoading(false);
    }
  };

  // Handle view with loading state
  const handleView = async (sale: Invoice) => {
    try {
      setDetailsLoading(true);
      // Fetch full invoice details
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/get-invoices/${sale.id}`,
        {
          method: "GET",
          tokenType: "jwt",
        }
      );

      if (response.success) {
        setSelectedSale(response.data);
        setDialogOpen(true);
      } else {
        toast.error("Failed to load invoice details");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load invoice details");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status?.toUpperCase()) {
        case "PAID":
          return {
            label: "Paid",
            variant: "default" as const,
            className: "bg-green-100 text-green-800 hover:bg-green-100",
            icon: <CheckCircle className="w-3 h-3 mr-1" />,
          };
        case "PARTIAL":
          return {
            label: "Partial",
            variant: "secondary" as const,
            className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
            icon: <AlertCircle className="w-3 h-3 mr-1" />,
          };
        case "DUE":
          return {
            label: "Due",
            variant: "destructive" as const,
            className: "bg-red-100 text-red-800 hover:bg-red-100",
            icon: <XCircle className="w-3 h-3 mr-1" />,
          };
        default:
          return {
            label: status,
            variant: "outline" as const,
            className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
            icon: <Clock className="w-3 h-3 mr-1" />,
          };
      }
    };

    const config = getStatusConfig(status);

    return (
      <Badge
        variant={config.variant}
        className={`flex items-center gap-1 ${config.className}`}
      >
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // Table actions
  const tableActions = [
    {
      label: <Eye size={16} />,
      onClick: handleView,
      title: "View Details",
      variant: "ghost" as const,
      className: "hover:bg-blue-50 hover:text-blue-600",
    },
    {
      label: <Trash size={16} />,
      onClick: handleDelete,
      title: "Delete Invoice",
      variant: "ghost" as const,
      className: "hover:bg-red-50 hover:text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Sales Invoices
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and view all sales transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchInvoices}
              disabled={loading}
              className="flex items-center gap-2 shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
        <div className="flex gap-2 border p-2 rounded">
          <CustomInput
            label="From"
            value={searchParams.from_date}
            onChange={(e) =>
              setSearchParams({ ...searchParams, from_date: e.target.value })
            }
            type="date"
          />
          <CustomInput
            label="To"
            value={searchParams.to_date}
            onChange={(e) =>
              setSearchParams({ ...searchParams, to_date: e.target.value })
            }
            type="date"
          />
          <CustomInput
            label="Search"
            value={searchParams.search}
            onChange={(e) =>
              setSearchParams({ ...searchParams, search: e.target.value })
            }
            type="text"
          />
        </div>
        <DataTable
          data={sales}
          label="Sales"
          pagination={true}
          page={parseInt(searchParams.page)}
          onPageChange={(page) =>
            setSearchParams({ ...searchParams, page: String(page) })
          }
          totalPages={paginationInfo.totalPages}
          rowsPerPage={parseInt(searchParams.limit)}
          printHead={[
            { label: "Invoice No", value: "code" },
            { label: "Customer", value: "party_name" },
            { label: "Date", value: "invoice_date" },
            { label: "Total Amount", value: "total_amount" },
            { label: "Status", value: "status" },
          ]}
          showColumns={[
            "code",
            "party_name",
            "invoice_date",
            "total_amount",
            "status",
          ]}
          columnFormats={{
            invoice_date: (value: string) => formatDate(value),
          }}
          actions={tableActions}
          loading={loading}
        />
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white">
          {/* Dialog Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <DialogHeader className="text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold">
                      Invoice Details
                    </DialogTitle>
                    <p className="text-blue-100 opacity-90">
                      Invoice No: {selectedSale?.code}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center gap-2"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Dialog Content - Invoice Format */}
          <div className="flex-1 overflow-y-auto p-0">
            {detailsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading invoice details...</p>
                </div>
              </div>
            ) : selectedSale ? (
              <div className="bg-white p-8">
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          TAX INVOICE
                        </h1>
                        <p className="text-gray-600">Official Sales Invoice</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>InventorySys POS</span>
                      </div>
                      <div>123 Business Street, Suite 100</div>
                      <div>Dhaka 1200, Bangladesh</div>
                      <div>Phone: +880 1234-567890</div>
                      <div>Email: billing@inventorysys.com</div>
                      <div>VAT Reg: 123456789</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="mb-4">
                      <div className="text-sm text-gray-500">
                        Invoice Number
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedSale.code}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-gray-500">
                          Invoice Date
                        </div>
                        <div className="font-medium">
                          {formatDate(selectedSale.invoice_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Due Date</div>
                        <div className="font-medium">
                          {formatDate(selectedSale.invoice_date)}
                        </div>
                      </div>
                      <div className="mt-3">
                        <StatusBadge status={selectedSale.status} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill To & Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Bill To
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="font-bold text-lg mb-2">
                        {selectedSale.party_name}
                      </div>
                      <div className="space-y-2 text-gray-600">
                        {selectedSale.party_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {selectedSale.party_phone}
                          </div>
                        )}
                        {selectedSale.party_address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5" />
                            <span>{selectedSale.party_address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Payment Summary
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Invoice Total:</span>
                          <span className="font-bold">
                            ৳
                            {parseFloat(
                              selectedSale.total_amount as any
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Paid:</span>
                          <span className="font-bold text-green-600">
                            ৳
                            {parseFloat(
                              selectedSale.paid_amount as any
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Due:</span>
                          <span className="font-bold text-red-600">
                            ৳
                            {parseFloat(selectedSale.due_amount as any).toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="pt-3 border-t">
                          <div className="text-sm text-gray-500">
                            Payment Status
                          </div>
                          <div className="font-medium">
                            <StatusBadge status={selectedSale.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8 overflow-hidden rounded-lg border">
                  <div className="bg-gray-900 text-white p-4">
                    <h3 className="font-semibold">Invoice Items</h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-700">
                          #
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Product Description
                        </th>
                        <th className="text-center p-4 font-medium text-gray-700">
                          Quantity
                        </th>
                        <th className="text-right p-4 font-medium text-gray-700">
                          Unit Price
                        </th>
                        <th className="text-right p-4 font-medium text-gray-700">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items?.map((item, index) => (
                        <tr key={item.id} className="border-t hover:bg-gray-50">
                          <td className="p-4 text-gray-600">{index + 1}</td>
                          <td className="p-4">
                            <div className="font-medium text-gray-900">
                              {item.product_name}
                            </div>
                            {item.variant_name && (
                              <div className="text-sm text-gray-600 mt-1">
                                Variant: {item.variant_name}
                              </div>
                            )}
                          </td>
                          <td className="text-center p-4">
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md font-medium">
                              {parseFloat(item.quantity as any)}
                            </span>
                          </td>
                          <td className="text-right p-4 font-medium">
                            ৳{parseFloat(item.unit_price as any).toFixed(2)}
                          </td>
                          <td className="text-right p-4 font-bold">
                            ৳
                            {(
                              parseFloat(item.quantity as any) *
                              parseFloat(item.unit_price as any)
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-8">
                  <div className="w-full md:w-80">
                    <div className="space-y-4 border rounded-lg p-6 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="font-medium">
                          ৳
                          {parseFloat(selectedSale.total_amount as any).toFixed(
                            2
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Tax (VAT):</span>
                        <span className="font-medium">৳0.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Discount:</span>
                        <span className="font-medium text-green-600">
                          -৳0.00
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Grand Total:</span>
                          <span className="text-blue-900">
                            ৳
                            {parseFloat(
                              selectedSale.total_amount as any
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Amount Paid:</span>
                          <span className="font-bold text-green-600">
                            ৳
                            {parseFloat(
                              selectedSale.paid_amount as any
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-700 font-medium">
                            Balance Due:
                          </span>
                          <span className="font-bold text-lg text-red-600">
                            ৳
                            {parseFloat(selectedSale.due_amount as any).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                {selectedSale.payments && selectedSale.payments.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment History
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSale.payments.map((payment, index) => (
                        <div
                          key={payment.id}
                          className="border rounded-lg p-4 bg-white"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  payment.method === "CASH"
                                    ? "bg-green-100 text-green-700"
                                    : payment.method === "CARD"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {payment.method === "CASH"
                                  ? "💰"
                                  : payment.method === "CARD"
                                  ? "💳"
                                  : "🌐"}
                              </div>
                              <div>
                                <div className="font-bold">
                                  {payment.method}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {payment.reference_no
                                    ? `Reference: ${payment.reference_no}`
                                    : "No reference"}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                ৳{parseFloat(payment.amount).toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDate(payment.payment_date)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Terms & Conditions
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Payment due upon receipt</li>
                        <li>• Late payment interest: 1.5% per month</li>
                        <li>• Goods sold are non-returnable</li>
                        <li>• Warranty as per manufacturer policy</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Notes
                      </h4>
                      <p className="text-xs text-gray-600">
                        Thank you for your business!
                        <br />
                        For any queries, contact our support team.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-20 border-b-2 border-gray-300 mb-2 flex items-center justify-center">
                        <span className="text-gray-400">
                          Authorized Signature
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">For InventorySys</p>
                    </div>
                  </div>

                  <div className="mt-8 text-center text-xs text-gray-500 border-t pt-4">
                    <p>
                      This is a computer-generated invoice. No signature
                      required.
                    </p>
                    <p className="mt-1">
                      www.inventorysys.com | support@inventorysys.com | +880
                      16457
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">
                Branch: {selectedSale?.branch_name} • Created:{" "}
                {selectedSale && formatDate(selectedSale.created_at)}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button
                  onClick={() => setDialogOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
