import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/components/utils/formatter";

// Updated Types based on your API response
interface PaymentItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Payment {
  id: number;
  invoice_id: number;
  method: string;
  amount: string;
  payment_date: string;
  reference_no: string | null;
  invoice_code: string;
  invoice_type: string;
  party_name: string;
  party_phone: string;
  items: PaymentItem[];
}

interface PaymentFilters {
  status?: string;
  method?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export const OrderPayment = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1000);

  // Filters
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Filter form state
  const [filterForm, setFilterForm] = useState<PaymentFilters>({});

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
        filters: {
          ...filters,
          // Convert empty strings to undefined
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== "")
          ),
        },
      };

      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/get-payments`,
        {
          method: "POST",
          tokenType: "jwt",
          data: params,
        }
      );

      console.log("API Response:", result); // Debug log

      if (result.success) {
        // Check if data is nested or direct
        const data = result.data?.data || result.data || [];
        setPayments(data);
      } else {
        toast.error(result.message || "Failed to fetch payments");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPayments();
  }, [page, limit, filters]);

  // View payment details
  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  // Get status badge based on method or other criteria
  const getStatusBadge = (method: string) => {
    const styles = {
      CASH: "bg-green-100 text-green-800 border-green-200",
      CARD: "bg-blue-100 text-blue-800 border-blue-200",
      BKASH: "bg-purple-100 text-purple-800 border-purple-200",
      NAGAD: "bg-yellow-100 text-yellow-800 border-yellow-200",
      BANK: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          styles[method as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {method}
      </span>
    );
  };

  return (
    <>
      <div className="p-6">
        <Breadcrumbs
          labelOverrides={{
            orders: "Orders",
            all: "All Orders",
          }}
        />

        {/* Payments Table */}
        <DataTable
          data={payments}
          label="Payments List"
          rowsPerPage={10}
          loading={loading}
          showColumns={[
            "invoice_code",
            "party_name",
            "party_phone",
            "amount",
            "method",
            "payment_date",
          ]}
          columnFormats={{
            amount: (val) => formatCurrency(parseFloat(val as string)),
            method: (val) => getStatusBadge(val as string),
            payment_date: (val) => formatDate(val),
          }}
          actions={[
            {
              label: <Eye size={16} className="text-blue-600" />,
              onClick: (row) => handleViewDetails(row as Payment),
              title: "View Details",
            },
          ]}
        />

        {/* Payment Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-lg bg-amber-50">
            {selectedPayment && (
              <>
                <DialogHeader>
                  <DialogTitle>Payment Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Payment Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">
                        Invoice #{selectedPayment.invoice_code}
                      </h3>
                      {getStatusBadge(selectedPayment.method)}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">
                          {selectedPayment.party_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">
                          {selectedPayment.party_phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-bold text-xl text-green-600">
                        {formatCurrency(parseFloat(selectedPayment.amount))}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">{selectedPayment.method}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Reference No</p>
                        <p className="font-medium">
                          {selectedPayment.reference_no || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Payment Date</p>
                        <p className="font-medium">
                          {formatDate(selectedPayment.payment_date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Invoice Type</p>
                        <p className="font-medium">
                          {selectedPayment.invoice_type}
                        </p>
                      </div>
                    </div>

                    {/* Items Section */}
                    {selectedPayment.items &&
                      selectedPayment.items.length > 0 && (
                        <div className="pt-4">
                          <h4 className="font-medium mb-2">Items</h4>
                          <div className="border rounded overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="text-left p-2">Product</th>
                                  <th className="text-center p-2">Qty</th>
                                  <th className="text-center p-2">
                                    Unit Price
                                  </th>
                                  <th className="text-center p-2">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedPayment.items.map((item, index) => (
                                  <tr key={index} className="border-t">
                                    <td className="p-2">{item.product_name}</td>
                                    <td className="p-2 text-center">
                                      {item.quantity}
                                    </td>
                                    <td className="p-2 text-center">
                                      {formatCurrency(item.unit_price)}
                                    </td>
                                    <td className="p-2 text-center font-medium">
                                      {formatCurrency(item.total)}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="border-t bg-gray-50">
                                  <td
                                    colSpan={3}
                                    className="p-2 text-right font-medium"
                                  >
                                    Total:
                                  </td>
                                  <td className="p-2 text-center font-bold text-green-600">
                                    {formatCurrency(
                                      selectedPayment.items.reduce(
                                        (sum, item) => sum + item.total,
                                        0
                                      )
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
