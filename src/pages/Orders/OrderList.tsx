import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/components/utils/formatter";
import { apiClient } from "@/hook/apiClient";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  Send,
  Package,
  Truck,
  ShoppingBag,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type JSX } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  product_variant_id: number;
  product_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

interface Order {
  id: number;
  code: string;
  customer_id: number;
  delivery_address_id: number;
  delivery_method_id: number;
  payment_method_id: number;
  total_amount: string;
  discount_amount: string;
  net_amount: string;
  is_cod: boolean;
  order_status: string;
  payment_status: string;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method_name: string;
  payment_method_name: string;
  items: OrderItem[];
}

type OrderStatusTab =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

interface StatusConfig {
  color: string;
  icon: LucideIcon;
  label: string;
  tabColor: string;
  countColor: string;
  activeTabColor: string;
}

const statusConfigs: Record<OrderStatusTab, StatusConfig> = {
  ALL: {
    color: "bg-gray-100 text-gray-800",
    icon: ShoppingBag,
    label: "All Orders",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-gray-100 text-gray-800",
    activeTabColor: "bg-[#003333] text-white border-[#003333]",
  },
  PENDING: {
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: Clock,
    label: "Pending",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-yellow-50 text-yellow-700",
    activeTabColor: "bg-[#003333] text-white border-[#003333]",
  },
  CONFIRMED: {
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: CheckCircle,
    label: "Confirmed",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-blue-50 text-blue-700",
    activeTabColor: "bg-[#003333] text-white border-[#003333]",
  },
  PROCESSING: {
    color: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    icon: Package,
    label: "Processing",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-indigo-50 text-indigo-700",
    activeTabColor: "bg-[#003333] text-white border-[#003333]",
  },
  SHIPPED: {
    color: "bg-purple-50 text-purple-700 border border-purple-200",
    icon: Truck,
    label: "Shipped",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-purple-50 text-purple-700",
    activeTabColor: "bg-[#003333] text-white border-[#003333]",
  },
  DELIVERED: {
    color: "bg-green-50 text-green-700 border border-green-200",
    icon: CheckCircle,
    label: "Delivered",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-green-50 text-green-700",
    activeTabColor: "bg-[#003333] text-white border-[#003333]",
  },
  CANCELLED: {
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: XCircle,
    label: "Cancelled",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-red-50 text-red-700",
    activeTabColor: "bg-[#003333] text-white border-[#003333]",
  },
  REFUNDED: {
    color: "bg-gray-100 text-gray-700 border border-gray-300",
    icon: AlertCircle,
    label: "Refunded",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-gray-100 text-gray-700",
    activeTabColor: "bg-[#003333] text-white border-[#003333]",
  },
};

interface StatusCounts {
  ALL: number;
  PENDING: number;
  CONFIRMED: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELLED: number;
  REFUNDED: number;
}

interface OrderTableProps {
  orders: Order[];
  loader: boolean;
  handleQuickView: (order: Order) => void;
  handleUpdateOrderStatus: (orderId: number, status: string) => Promise<void>;
  processingOrderId: number | null;
  router: (path: string) => void;
  getOrderStatusBadge: (status: string) => JSX.Element;
  getPaymentStatusBadge: (status: string) => JSX.Element;
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number) => string;
  status?: OrderStatusTab;
}

const OrderTable = ({
  orders,
  loader,
  handleQuickView,
  handleUpdateOrderStatus,
  processingOrderId,
  router,
  getOrderStatusBadge,
  getPaymentStatusBadge,
  formatDate,
  formatCurrency,
  status,
}: OrderTableProps) => {
  // Create actions configuration that DataTable expects
  const tableActions = [
    {
      label: <Eye size={16} />,
      className: "text-green-600 hover:text-green-800",
      title: "Quick View",
      onClick: (row: Order) => handleQuickView(row),
    },
    {
      label: <Check size={16} />,
      className: "text-yellow-600 hover:text-yellow-800",
      title: "Accept Order",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) => row.order_status !== "PENDING",
      onClick: (row: Order) => handleUpdateOrderStatus(row.id, "CONFIRMED"),
    },
    {
      label: <XCircle size={16} />,
      className: "text-red-600 hover:text-red-800",
      title: "Cancel Order (Pending)",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) => row.order_status !== "PENDING",
      onClick: (row: Order) => handleUpdateOrderStatus(row.id, "CANCELLED"),
    },
    {
      label: <Package size={16} />,
      className: "text-indigo-600 hover:text-indigo-800",
      title: "Start Processing",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) => row.order_status !== "CONFIRMED",
      onClick: (row: Order) => handleUpdateOrderStatus(row.id, "PROCESSING"),
    },
    {
      label: <Send size={16} />,
      className: "text-purple-600 hover:text-purple-800",
      title: "Ship Order (Confirmed)",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) => row.order_status !== "CONFIRMED",
      onClick: (row: Order) => handleUpdateOrderStatus(row.id, "SHIPPED"),
    },
    {
      label: <XCircle size={16} />,
      className: "text-red-600 hover:text-red-800",
      title: "Cancel Order (Confirmed)",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) => row.order_status !== "CONFIRMED",
      onClick: (row: Order) => handleUpdateOrderStatus(row.id, "CANCELLED"),
    },
    {
      label: <Send size={16} />,
      className: "text-purple-600 hover:text-purple-800",
      title: "Ship Order (Processing)",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) => row.order_status !== "PROCESSING",
      onClick: (row: Order) => handleUpdateOrderStatus(row.id, "SHIPPED"),
    },
    {
      label: <XCircle size={16} />,
      className: "text-red-600 hover:text-red-800",
      title: "Cancel Order (Processing)",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) => row.order_status !== "PROCESSING",
      onClick: (row: Order) => handleUpdateOrderStatus(row.id, "CANCELLED"),
    },
    // SHIPPED order actions
    {
      label: <CheckCircle size={16} />,
      className: "text-green-600 hover:text-green-800",
      title: "Mark as Delivered",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) => row.order_status !== "SHIPPED",
      onClick: (row: Order) => handleUpdateOrderStatus(row.id, "DELIVERED"),
    },
    // DELIVERED order actions
    {
      label: <AlertCircle size={16} />,
      className: "text-gray-600 hover:text-gray-800",
      title: "Refund Order",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) => row.order_status !== "DELIVERED",
      onClick: (row: Order) => handleUpdateOrderStatus(row.id, "REFUNDED"),
    },
  ];

  return (
    <div>
      <DataTable<Order>
        data={orders}
        label={`${statusConfigs[status || "ALL"].label} List`}
        rowsPerPage={10}
        loading={loader}
        showColumns={[
          { key: "code", label: "Order #" },
          { key: "customer_name", label: "Customer" },
          { key: "customer_phone", label: "Phone Number" },
          { key: "net_amount", label: "Total Amount" },
          { key: "order_status", label: "Status" },
          { key: "payment_status", label: "Payment" },
          { key: "created_at", label: "Order Date" },
        ]}
        columnFormats={{
          order_status: (row: Order) => getOrderStatusBadge(row.order_status),
          payment_status: (row: Order) =>
            getPaymentStatusBadge(row.payment_status),
          created_at: (val: string) => formatDate(val),
          customer_name: (val: string, row: Order) => (
            <div>
              <div className="font-medium">{val}</div>
              <div className="text-xs text-gray-500">{row.customer_email}</div>
            </div>
          ),
          net_amount: (val: string) => formatCurrency(parseFloat(val)),
        }}
        printHead={[
          { label: "Order Code", value: "code" },
          { label: "Customer", value: "customer_name" },
          { label: "Phone", value: "customer_phone" },
          { label: "Amount", value: "net_amount" },
          { label: "Status", value: "order_status" },
          { label: "Payment", value: "payment_status" },
          { label: "Date", value: "created_at" },
        ]}
        actions={tableActions}
      />
    </div>
  );
};

interface StatusTabTriggerProps {
  status: OrderStatusTab;
  config: StatusConfig;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const StatusTabTrigger = ({
  status,
  config,
  count,
  isActive,
  onClick,
}: StatusTabTriggerProps) => {
  const Icon = config.icon;

  return (
    <TabsTrigger
      value={status}
      className={`relative px-4 py-2 rounded-lg border transition-all duration-200 ${
        isActive
          ? config.activeTabColor + " font-semibold shadow-sm"
          : "text-gray-700 hover:text-black hover:bg-gray-50 border-gray-200"
      }`}
      onClick={onClick}
    >
      <Icon size={16} className="mr-2" />
      {config.label}
      {count > 0 && (
        <span
          className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? "bg-white text-black" : config.countColor
          }`}
        >
          {count}
        </span>
      )}
    </TabsTrigger>
  );
};

export const OrderList = () => {
  const router = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loader, setLoading] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(
    null
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [activeTab, setActiveTab] = useState<OrderStatusTab>(
    (searchParams.get("status")?.toUpperCase() as OrderStatusTab) || "ALL"
  );

  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    ALL: 0,
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    REFUNDED: 0,
  });

  const fetchData = async (page = 1, status?: OrderStatusTab) => {
    try {
      setLoading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/order/get-all-order`,
        {
          method: "POST",
          data: {
            page,
            limit: 100,
            ...(status && status !== "ALL" && { status }),
          },
          tokenType: "jwt",
        }
      );

      if (response.success) {
        const fetchedOrders = response.data || [];

        if (status) {
          // Filter for specific tab
          setOrders(fetchedOrders);
        } else {
          // Get all orders for counting
          setAllOrders(fetchedOrders);
          setOrders(fetchedOrders);
          calculateStatusCounts(fetchedOrders);
        }

        setPagination(
          response.pagination || {
            page,
            limit: 100,
            total: 0,
            totalPages: 1,
          }
        );
      } else {
        toast.error(response.message || "Failed to fetch orders");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };
  console.log(orders);
  const calculateStatusCounts = (ordersList: Order[]) => {
    const counts: StatusCounts = {
      ALL: ordersList.length,
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    };

    ordersList.forEach((order) => {
      const status = order.order_status as keyof StatusCounts;
      if (status in counts) {
        counts[status] += 1;
      }
    });

    setStatusCounts(counts);
  };

  const handleTabChange = (tab: OrderStatusTab) => {
    setActiveTab(tab);
    const newSearchParams = new URLSearchParams(searchParams);
    if (tab === "ALL") {
      newSearchParams.delete("status");
    } else {
      newSearchParams.set("status", tab.toLowerCase());
    }
    setSearchParams(newSearchParams);

    if (tab === "ALL") {
      setOrders(allOrders);
    } else {
      const filteredOrders = allOrders.filter(
        (order) => order.order_status === tab
      );
      setOrders(filteredOrders);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  useEffect(() => {
    const status = searchParams.get("status")?.toUpperCase();
    if (status && status in statusConfigs) {
      setActiveTab(status as OrderStatusTab);
    }
  }, [searchParams]);

  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: string
  ) => {
    try {
      setProcessingOrderId(orderId);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/order/update-order-status`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            id: orderId,
            order_status: newStatus,
          },
        }
      );

      if (response.success) {
        const statusMessages = {
          CONFIRMED: "Order accepted successfully!",
          PROCESSING: "Order marked as processing!",
          SHIPPED: "Order shipped successfully!",
          DELIVERED: "Order marked as delivered!",
          CANCELLED: "Order cancelled successfully!",
          REFUNDED: "Order refunded successfully!",
        };

        toast.success(
          statusMessages[newStatus as keyof typeof statusMessages] ||
            "Order status updated successfully!"
        );

        // Refresh orders list
        fetchData(1);

        // Navigate to logistics page only for CONFIRMED status
        if (newStatus === "CONFIRMED") {
          router(`/order/logistics/${orderId}`);
        }
      } else {
        toast.error(response.message || "Failed to update order status");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update order status");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const validStatus = (Object.keys(statusConfigs) as OrderStatusTab[]).find(
      (key) => key === status
    );

    const config = validStatus
      ? statusConfigs[validStatus]
      : statusConfigs.PENDING;
    const StatusIcon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <StatusIcon size={12} />
        {config.label}
      </div>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const config = {
      UNPAID: { color: "bg-red-100 text-red-800", label: "Unpaid" },
      PAID: { color: "bg-green-100 text-green-800", label: "Paid" },
      PARTIAL: { color: "bg-yellow-100 text-yellow-800", label: "Partial" },
      REFUNDED: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
    };

    const statusConfig = config[status as keyof typeof config] || config.UNPAID;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  const handleQuickView = (order: Order) => {
    setSelectedOrder(order);
    setShowQuickView(true);
  };

  // Get status-specific actions for Quick View Dialog
  const getQuickViewActions = (order: Order) => {
    switch (order.order_status) {
      case "PENDING":
        return (
          <Button
            onClick={() => {
              setShowQuickView(false);
              handleUpdateOrderStatus(order.id, "CONFIRMED");
            }}
            className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Check size={16} className="mr-2" />
            Accept Order
          </Button>
        );

      case "CONFIRMED":
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => {
                setShowQuickView(false);
                handleUpdateOrderStatus(order.id, "PROCESSING");
              }}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Package size={16} className="mr-2" />
              Start Processing
            </Button>
            <Button
              onClick={() => {
                setShowQuickView(false);
                handleUpdateOrderStatus(order.id, "SHIPPED");
              }}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send size={16} className="mr-2" />
              Ship Order
            </Button>
          </div>
        );

      case "PROCESSING":
        return (
          <Button
            onClick={() => {
              setShowQuickView(false);
              handleUpdateOrderStatus(order.id, "SHIPPED");
            }}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Send size={16} className="mr-2" />
            Ship Order
          </Button>
        );

      case "SHIPPED":
        return (
          <Button
            onClick={() => {
              setShowQuickView(false);
              handleUpdateOrderStatus(order.id, "DELIVERED");
            }}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle size={16} className="mr-2" />
            Mark as Delivered
          </Button>
        );

      case "DELIVERED":
        return (
          <Button
            onClick={() => {
              setShowQuickView(false);
              handleUpdateOrderStatus(order.id, "REFUNDED");
            }}
            className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white"
          >
            <AlertCircle size={16} className="mr-2" />
            Refund Order
          </Button>
        );

      default:
        return null;
    }
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-bw-900">Orders</h1>
        </div>
        <div className="mb-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => handleTabChange(value as OrderStatusTab)}
          >
            <TabsList className="flex flex-wrap h-auto p-1 gap-2 bg-white">
              {(Object.keys(statusConfigs) as OrderStatusTab[]).map(
                (status) => (
                  <StatusTabTrigger
                    key={status}
                    status={status}
                    config={statusConfigs[status]}
                    count={statusCounts[status]}
                    isActive={activeTab === status}
                    onClick={() => handleTabChange(status)}
                  />
                )
              )}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="ALL" className="m-0">
                <OrderTable
                  orders={orders}
                  loader={loader}
                  handleQuickView={handleQuickView}
                  handleUpdateOrderStatus={handleUpdateOrderStatus}
                  processingOrderId={processingOrderId}
                  router={router}
                  getOrderStatusBadge={getOrderStatusBadge}
                  getPaymentStatusBadge={getPaymentStatusBadge}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                  status="ALL"
                />
              </TabsContent>

              {(
                [
                  "PENDING",
                  "CONFIRMED",
                  "PROCESSING",
                  "SHIPPED",
                  "DELIVERED",
                  "CANCELLED",
                  "REFUNDED",
                ] as OrderStatusTab[]
              ).map((status) => (
                <TabsContent key={status} value={status} className="m-0">
                  <OrderTable
                    orders={orders.filter(
                      (order) => order.order_status === status
                    )}
                    loader={loader}
                    handleQuickView={handleQuickView}
                    handleUpdateOrderStatus={handleUpdateOrderStatus}
                    processingOrderId={processingOrderId}
                    router={router}
                    getOrderStatusBadge={getOrderStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    status={status}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Quick View Dialog */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye size={20} />
              Order Quick View: #{selectedOrder?.code}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-500">
                    Customer Information
                  </h4>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.customer_email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.customer_phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-500">
                    Order Details
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Date:</span>{" "}
                      {formatDate(selectedOrder.created_at)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Delivery:</span>{" "}
                      {selectedOrder.delivery_method_name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Payment:</span>{" "}
                      {selectedOrder.payment_method_name}
                      {selectedOrder.is_cod && " (COD)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-500">
                    Order Status
                  </h4>
                  <div>{getOrderStatusBadge(selectedOrder.order_status)}</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-500">
                    Payment Status
                  </h4>
                  <div>
                    {getPaymentStatusBadge(selectedOrder.payment_status)}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-500">
                  Order Items ({selectedOrder.items.length})
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div>
                                <p className="font-medium text-sm">
                                  {item.product_name}
                                </p>
                                {item.variant_name && (
                                  <p className="text-xs text-gray-500">
                                    Variant: {item.variant_name}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              {formatCurrency(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Totals */}
              <div className="space-y-2 border-t pt-4">
                <h4 className="font-semibold text-sm text-gray-500">
                  Order Summary
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>
                      {formatCurrency(parseFloat(selectedOrder.total_amount))}
                    </span>
                  </div>
                  {parseFloat(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount:</span>
                      <span>
                        -
                        {formatCurrency(
                          parseFloat(selectedOrder.discount_amount)
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Net Amount:</span>
                    <span>
                      {formatCurrency(parseFloat(selectedOrder.net_amount))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowQuickView(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQuickView(false);
                    router(`/order/${selectedOrder.id}`);
                  }}
                  className="w-full sm:w-auto"
                >
                  View Full Details
                </Button>
                {getQuickViewActions(selectedOrder)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
