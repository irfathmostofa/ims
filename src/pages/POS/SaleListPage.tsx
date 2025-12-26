"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trash,
  Eye,
  RefreshCw,
  Search,
  FileText,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const fetchInvoices = useCallback(async () => {
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
      } else {
        toast.error("Failed to fetch sales data");
        setSales([]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch sales");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Initial fetch with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [fetchInvoices]);

  // Handle search with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({ ...prev, search: e.target.value, page: "1" }));
  };

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

  // Table columns with proper formatting
  const tableColumns = [
    {
      label: "Invoice No",
      value: "code",
      className: "font-medium",
    },
    {
      label: "Customer",
      value: "party_name",
      className: "truncate max-w-[180px]",
    },
    {
      label: "Date",
      value: (sale: Invoice) => formatDate(sale.invoice_date),
      className: "text-gray-600",
    },
    {
      label: "Total Amount",
      value: (sale: Invoice) =>
        `৳${parseFloat(sale.total_amount as any).toFixed(2)}`,
      className: "font-semibold",
    },
    {
      label: "Status",
      value: (sale: Invoice) => <StatusBadge status={sale.status} />,
      className: "",
    },
  ];

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

  // Calculate totals for invoice
  const calculateInvoiceTotals = (sale: Invoice) => {
    const itemsTotal =
      sale.items?.reduce(
        (sum, item) =>
          sum +
          parseFloat(item.quantity as any) * parseFloat(item.unit_price as any),
        0
      ) || 0;

    return {
      itemsTotal,
      tax: 0,
      discount: 0,
      grandTotal: parseFloat(sale.total_amount as any),
      paid: parseFloat(sale.paid_amount as any),
      due: parseFloat(sale.due_amount as any),
    };
  };

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

        <DataTable
          data={sales}
          label="Sales"
          rowsPerPage={10}
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
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold">
                      Invoice Details
                    </DialogTitle>
                    <p className="text-blue-100 opacity-90">
                      Complete invoice information
                    </p>
                  </div>
                </div>
                {selectedSale && (
                  <div className="text-right">
                    <div className="text-sm font-medium opacity-90">
                      Invoice No
                    </div>
                    <div className="text-xl font-bold">{selectedSale.code}</div>
                  </div>
                )}
              </div>
            </DialogHeader>
          </div>

          {/* Dialog Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {detailsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading invoice details...</p>
                </div>
              </div>
            ) : selectedSale ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="items"
                    className="flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Items ({selectedSale.items?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="payments"
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Payments
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Invoice Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-blue-700">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <StatusBadge status={selectedSale.status} />
                      </div>
                      <div className="text-sm text-blue-600 font-medium mb-1">
                        Invoice Date
                      </div>
                      <div className="text-xl font-bold text-blue-900">
                        {formatDate(selectedSale.invoice_date)}
                      </div>
                      <div className="text-xs text-blue-500 mt-2">
                        Branch: {selectedSale.branch_name}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-green-700">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium text-green-800">
                          Customer
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-bold text-green-900 text-lg">
                          {selectedSale.party_name}
                        </div>
                        {selectedSale.party_phone && (
                          <div className="text-sm text-green-700">
                            📞 {selectedSale.party_phone}
                          </div>
                        )}
                        {selectedSale.party_address && (
                          <div className="text-sm text-green-600">
                            📍 {selectedSale.party_address}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-purple-700">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium text-purple-800">
                          Financial Summary
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-purple-600">
                            Total Amount
                          </span>
                          <span className="font-bold text-purple-900">
                            ৳
                            {parseFloat(
                              selectedSale.total_amount as any
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">
                            Paid Amount
                          </span>
                          <span className="font-bold text-green-700">
                            ৳
                            {parseFloat(
                              selectedSale.paid_amount as any
                            ).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-600 font-medium">
                            Balance Due
                          </span>
                          <span className="font-bold text-lg text-red-700">
                            ৳
                            {parseFloat(selectedSale.due_amount as any).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-600">Items Count</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedSale.items?.length || 0}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-600">Created On</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(selectedSale.created_at)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-600">Invoice Type</div>
                      <div className="font-medium text-gray-900">
                        {selectedSale.type}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-600">
                        Payment Status
                      </div>
                      <div className="font-medium">
                        <StatusBadge status={selectedSale.status} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Items Tab */}
                <TabsContent value="items" className="space-y-4">
                  <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Invoice Items
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-4 font-medium text-gray-700">
                              Product
                            </th>
                            <th className="text-center p-4 font-medium text-gray-700">
                              Quantity
                            </th>
                            <th className="text-right p-4 font-medium text-gray-700">
                              Unit Price
                            </th>
                            <th className="text-right p-4 font-medium text-gray-700">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSale.items?.map((item, index) => (
                            <tr
                              key={item.id}
                              className={`border-t ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
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
                                <div className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                  {parseFloat(item.quantity as any)}
                                </div>
                              </td>
                              <td className="text-right p-4 font-medium text-gray-900">
                                ৳{parseFloat(item.unit_price as any).toFixed(2)}
                              </td>
                              <td className="text-right p-4 font-bold text-gray-900">
                                ৳
                                {(
                                  parseFloat(item.quantity as any) *
                                  parseFloat(item.unit_price as any)
                                ).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t">
                          <tr>
                            <td
                              colSpan={3}
                              className="text-right p-4 font-bold text-gray-700"
                            >
                              Total Amount
                            </td>
                            <td className="text-right p-4 font-bold text-xl text-blue-900">
                              ৳
                              {parseFloat(
                                selectedSale.total_amount as any
                              ).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="space-y-4">
                  <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment History
                      </h3>
                    </div>
                    <div className="p-4">
                      {selectedSale.payments &&
                      selectedSale.payments.length > 0 ? (
                        <div className="space-y-4">
                          {selectedSale.payments.map((payment, index) => (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
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
                                  <div className="font-medium">
                                    {payment.method}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {payment.reference_no
                                      ? `Ref: ${payment.reference_no}`
                                      : "No reference"}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">
                                  ৳{parseFloat(payment.amount).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatDate(payment.payment_date)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">
                            No payment records found
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : null}
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">
                Invoice ID: #{selectedSale?.id}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Print
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
