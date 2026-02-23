import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye, Search, Filter, ChevronDown, Calendar } from "lucide-react";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/components/utils/formatter";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// Updated Types based on your new API response
interface Customer {
  id: number;
  code: string;
  full_name: string;
  email: string;
  phone: string;
}

interface DeliveryAddress {
  id: number;
  label: string;
  address_line: string;
  city: string;
  area: string;
  postal_code: string;
  is_default: boolean;
}

interface DeliveryMethod {
  id: number;
  code: string;
  name: string;
}

interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  type: string;
  provider: string;
}

interface PaymentTransaction {
  id: number;
  transaction_id: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "COLLECTED";
  provider_response: any;
  paid_at: string | null;
  created_at: string;
}

interface LatestPayment {
  id: number;
  transaction_id: string;
  amount: number;
  status: string;
  paid_at: string | null;
}

interface OnlinePayment {
  id: number;
  order_code: string;
  total_amount: number;
  discount_amount: number;
  net_amount: number;
  is_cod: boolean;
  order_status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  payment_status: "UNPAID" | "PAID" | "REFUNDED";
  order_date: string;
  customer: Customer;
  delivery_address: DeliveryAddress | null;
  delivery_method: DeliveryMethod | null;
  payment_method: PaymentMethod | null;
  payment_transactions: PaymentTransaction[];
  latest_payment: LatestPayment | null;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: OnlinePayment[];
    pagination: {
      current_page: number;
      per_page: number;
      total_items: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
    summary: {
      total_orders: number;
      total_paid_amount: number;
      total_unpaid_amount: number;
      total_refunded_amount: number;
      paid_orders_count: number;
      unpaid_orders_count: number;
      cod_orders_count: number;
      online_payment_orders_count: number;
    };
  };
  message?: string;
}

interface PaymentFilters {
  customer_id?: string;
  payment_status?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

// Table column definition
interface Column {
  key: string;
  label: string;
  render?: (value: any, row: OnlinePayment) => React.ReactNode;
}

export const OrderPayment = () => {
  const [payments, setPayments] = useState<OnlinePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState<any>(null);

  // Filter states
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Date filter states for quick selection
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "custom" | ""
  >("");

  // Dialog states
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<OnlinePayment | null>(
    null,
  );

  // Table columns definition
  const columns: Column[] = [
    {
      key: "order_code",
      label: "Order Code",
      render: (value) => (
        <span className="font-medium text-blue-600">{value}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: Customer) => (
        <div>
          <div className="font-medium">{value?.full_name}</div>
          <div className="text-xs text-gray-500">{value?.phone}</div>
        </div>
      ),
    },
    {
      key: "net_amount",
      label: "Amount",
      render: (value) => (
        <div className="font-medium">{formatCurrency(value as number)}</div>
      ),
    },
    {
      key: "payment_status",
      label: "Payment Status",
      render: (value) => getPaymentStatusBadge(value as string),
    },
    {
      key: "payment_method",
      label: "Method",
      render: (_, row) => getPaymentMethodBadge(row.payment_method, row.is_cod),
    },
    {
      key: "order_date",
      label: "Order Date",
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span>{formatDate(value as string)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(row)}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <Eye size={16} />
        </Button>
      ),
    },
  ];

  // Fetch payments from new API
  const fetchPayments = async () => {
    try {
      setLoading(true);

      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/order/get-online-payment`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            page: page.toString(),
            limit: "10",
            ...filters,
            search: searchTerm || undefined,
          },
        },
      );

      if (result.success) {
        const responseData = result.data as ApiResponse["data"];
        setPayments(responseData.data || []);
        setTotalPages(responseData.pagination?.total_pages || 1);
        setTotalItems(responseData.pagination?.total_items || 0);
        setSummary(responseData.summary);
      } else {
        toast.error(result.message || "Failed to fetch payments");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchPayments();
  }, [page, filters]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchPayments();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle date range presets
  const handleDateRangePreset = (range: typeof dateRange) => {
    setDateRange(range);

    const today = new Date();
    let from_date = "";
    let to_date = "";

    switch (range) {
      case "today":
        from_date = today.toISOString().split("T")[0];
        to_date = today.toISOString().split("T")[0];
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        from_date = weekAgo.toISOString().split("T")[0];
        to_date = today.toISOString().split("T")[0];
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        from_date = monthAgo.toISOString().split("T")[0];
        to_date = today.toISOString().split("T")[0];
        break;
      default:
        // Don't change filters if custom or cleared
        if (range === "") {
          setFilters((prev) => ({
            ...prev,
            from_date: undefined,
            to_date: undefined,
          }));
        }
        return;
    }

    setFilters((prev) => ({
      ...prev,
      from_date,
      to_date,
    }));
    setPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPage(1); // Reset to first page on filter change

    // Reset date range preset if manually changing dates
    if (key === "from_date" || key === "to_date") {
      setDateRange("");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setDateRange("");
    setPage(1);
  };

  // View payment details
  const handleViewDetails = (payment: OnlinePayment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      PAID: "bg-green-100 text-green-800 border-green-200",
      UNPAID: "bg-yellow-100 text-yellow-800 border-yellow-200",
      REFUNDED: "bg-red-100 text-red-800 border-red-200",
      SUCCESS: "bg-green-100 text-green-800 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      FAILED: "bg-red-100 text-red-800 border-red-200",
      COLLECTED: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // Get order status badge
  const getOrderStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
      SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
      DELIVERED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // Get payment method badge
  const getPaymentMethodBadge = (
    method: PaymentMethod | null,
    isCod: boolean,
  ) => {
    if (isCod) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-200">
          COD
        </span>
      );
    }

    if (!method) return null;

    const styles = {
      CASH: "bg-green-100 text-green-800 border-green-200",
      CARD: "bg-blue-100 text-blue-800 border-blue-200",
      BANK: "bg-gray-100 text-gray-800 border-gray-200",
      MOBILE: "bg-purple-100 text-purple-800 border-purple-200",
      ONLINE: "bg-cyan-100 text-cyan-800 border-cyan-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          styles[method.type as keyof typeof styles] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {method.name}
      </span>
    );
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className={
            page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
          }
        />
      </PaginationItem>,
    );

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setPage(1)} className="cursor-pointer">
            1
          </PaginationLink>
        </PaginationItem>,
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={page === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setPage(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className={
            page === totalPages
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>,
    );

    return items;
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <Breadcrumbs
          labelOverrides={{
            orders: "Orders",
            all: "All Orders",
          }}
        />
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{summary.total_orders}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_paid_amount)}
              </p>
              <p className="text-xs text-gray-500">
                {summary.paid_orders_count} orders
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-500">Unpaid Amount</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(summary.total_unpaid_amount)}
              </p>
              <p className="text-xs text-gray-500">
                {summary.unpaid_orders_count} orders
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Payment Methods</p>
              <p className="text-2xl font-bold text-purple-600">
                {summary.online_payment_orders_count}
              </p>
              <p className="text-xs text-gray-500">
                Online | COD: {summary.cod_orders_count}
              </p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by order code, customer name/phone, transaction ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="min-w-[100px]"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide" : "Filters"}
            </Button>
            {(Object.keys(filters).length > 0 || searchTerm) && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
              {/* Date Range Filters */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Date Range</span>
                </div>

                {/* Date Presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Button
                    variant={dateRange === "today" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangePreset("today")}
                    className="text-xs"
                  >
                    Today
                  </Button>
                  <Button
                    variant={dateRange === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangePreset("week")}
                    className="text-xs"
                  >
                    Last 7 Days
                  </Button>
                  <Button
                    variant={dateRange === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangePreset("month")}
                    className="text-xs"
                  >
                    Last 30 Days
                  </Button>
                  {(filters.from_date || filters.to_date) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          from_date: undefined,
                          to_date: undefined,
                        }));
                        setDateRange("");
                      }}
                      className="text-xs text-red-600"
                    >
                      Clear Dates
                    </Button>
                  )}{" "}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 flex gap-2">
                      <label className="text-xs text-gray-500">From Date</label>
                      <Input
                        type="date"
                        value={filters.from_date || ""}
                        onChange={(e) =>
                          handleFilterChange("from_date", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1 flex gap-2">
                      <label className="text-xs text-gray-500">To Date</label>
                      <Input
                        type="date"
                        value={filters.to_date || ""}
                        onChange={(e) =>
                          handleFilterChange("to_date", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="">
                    <Select
                      value={filters.payment_status}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "payment_status",
                          value === "ALL" ? "" : value,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Payment Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Date Range */}
              </div>

              {/* Active Filters Summary */}
              {(filters.from_date ||
                filters.to_date ||
                filters.payment_status ||
                filters.customer_id) && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-1">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {filters.payment_status && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        Status: {filters.payment_status}
                      </span>
                    )}
                    {filters.from_date && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        From: {filters.from_date}
                      </span>
                    )}
                    {filters.to_date && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        To: {filters.to_date}
                      </span>
                    )}
                    {filters.customer_id && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        Customer ID: {filters.customer_id}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left font-medium text-gray-600"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3">
                          {column.render
                            ? column.render(
                                payment[column.key as keyof OnlinePayment],
                                payment,
                              )
                            : String(
                                payment[column.key as keyof OnlinePayment] ??
                                  "",
                              )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && payments.length > 0 && (
            <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * 10 + 1} to{" "}
                {Math.min(page * 10, totalItems)} of {totalItems} entries
              </div>
              <Pagination>
                <PaginationContent>{renderPaginationItems()}</PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* Payment Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedPayment && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Payment Details - #{selectedPayment.order_code}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">
                        Order Information
                      </h3>
                      <div className="flex gap-2">
                        {getPaymentStatusBadge(selectedPayment.payment_status)}
                        {getOrderStatusBadge(selectedPayment.order_status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium">
                          {formatCurrency(selectedPayment.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Discount</p>
                        <p className="font-medium">
                          {formatCurrency(selectedPayment.discount_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Net Amount</p>
                        <p className="font-bold text-green-600">
                          {formatCurrency(selectedPayment.net_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium">
                          {formatDate(selectedPayment.order_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h3 className="font-semibold text-lg mb-3">
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">
                          {selectedPayment.customer.full_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">
                          {selectedPayment.customer.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">
                          {selectedPayment.customer.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer Code</p>
                        <p className="font-medium">
                          {selectedPayment.customer.code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {selectedPayment.delivery_address && (
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <h3 className="font-semibold text-lg mb-3">
                        Delivery Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">
                            {selectedPayment.delivery_address.address_line}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">City</p>
                          <p className="font-medium">
                            {selectedPayment.delivery_address.city || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Area</p>
                          <p className="font-medium">
                            {selectedPayment.delivery_address.area || "N/A"}
                          </p>
                        </div>
                        {selectedPayment.delivery_method && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">
                              Delivery Method
                            </p>
                            <p className="font-medium">
                              {selectedPayment.delivery_method.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Transactions */}
                  {selectedPayment.payment_transactions.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <h3 className="font-semibold text-lg mb-3">
                        Payment Transactions
                      </h3>
                      <div className="space-y-3">
                        {selectedPayment.payment_transactions.map(
                          (transaction, index) => (
                            <div
                              key={index}
                              className="border rounded p-3 bg-white"
                            >
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Transaction ID
                                  </p>
                                  <p className="font-medium text-sm">
                                    {transaction.transaction_id}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Amount
                                  </p>
                                  <p className="font-medium text-sm">
                                    {formatCurrency(transaction.amount)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Status
                                  </p>
                                  <p className="text-sm">
                                    {getPaymentStatusBadge(transaction.status)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Paid At
                                  </p>
                                  <p className="text-sm">
                                    {transaction.paid_at
                                      ? formatDate(transaction.paid_at)
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
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
