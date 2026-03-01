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
  weight?: number;
  weight_unit?: string;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
    code: string;
    is_primary: boolean;
  }>;
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
  tracking_id?: string;
  address_line?: string;
  area?: string;
  city?: string;
  postal_code?: string;
  label?: string;
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
  handleCreateParcel: (order: Order) => Promise<void>;
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
  handleCreateParcel,
  processingOrderId,
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
      label: <Package size={16} />,
      className: "text-blue-600 hover:text-blue-800",
      title: "Create Parcel",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) =>
        row.order_status !== "CONFIRMED" || !!row.tracking_id,
      onClick: (row: Order) => handleCreateParcel(row),
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
    {
      label: <CheckCircle size={16} />,
      className: "text-green-600 hover:text-green-800",
      title: "Mark as Delivered",
      disabled: (row: Order) => processingOrderId === row.id,
      hide: (row: Order) => row.order_status !== "SHIPPED",
      onClick: (row: Order) => handleUpdateOrderStatus(row.id, "DELIVERED"),
    },
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
          { key: "tracking_id", label: "Tracking ID" },
          { key: "created_at", label: "Order Date" },
        ]}
        columnFormats={{
          created_at: (val: string) => formatDate(val),
          customer_name: (val: string, row: Order) => (
            <div>
              <div className="font-medium">{val}</div>
              <div className="text-xs text-gray-500">{row.customer_email}</div>
            </div>
          ),
          net_amount: (val: string) => formatCurrency(parseFloat(val)),
          tracking_id: (val: string) => (
            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
              {val || "-"}
            </span>
          ),
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
          ? config.activeTabColor + "shadow-sm"
          : "text-black hover:text-black hover:bg-gray-50 border-gray-400"
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
    null,
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatusTab>(
    (searchParams.get("status")?.toUpperCase() as OrderStatusTab) || "ALL",
  );

  // Get Redx configuration from environment variables
  const REDX_BASE_URL = import.meta.env.VITE_REDX_BASE_URL;
  const REDX_TOKEN = import.meta.env.VITE_REDX_TOKEN;

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
        },
      );
      if (response.success) {
        const fetchedOrders = response.data || [];

        if (status) {
          setOrders(fetchedOrders);
        } else {
          setAllOrders(fetchedOrders);
          setOrders(fetchedOrders);
          calculateStatusCounts(fetchedOrders);
        }
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
        (order) => order.order_status === tab,
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

  const createParcel = async (order: Order) => {
    try {
      setProcessingOrderId(order.id);

      if (!REDX_BASE_URL || !REDX_TOKEN) {
        toast.error(
          "Redx configuration is missing. Please check environment variables.",
        );
        return null;
      }

      // Step 1: Get area ID using postal code
      let areaId = 1; // Default fallback
      try {
        const areasResponse = await fetch(
          `${REDX_BASE_URL}/areas?post_code=${order.postal_code}`,
          {
            method: "GET",
            headers: {
              "API-ACCESS-TOKEN": `Bearer ${REDX_TOKEN}`,
              "Content-Type": "application/json",
            },
          },
        );

        const areasData = await areasResponse.json();

        if (areasResponse.ok && areasData.areas && areasData.areas.length > 0) {
          // Try to find matching area by name
          const matchingArea = areasData.areas.find(
            (area: any) =>
              area.name.toLowerCase() === order.area?.toLowerCase(),
          );

          // Use matching area or first area in the list
          areaId = matchingArea?.id || areasData.areas[0].id;

          console.log("Found area:", { areaId, areas: areasData.areas });
        } else {
          console.warn("No areas found for postal code:", order.postal_code);
        }
      } catch (error) {
        console.error("Error fetching areas:", error);
      }

      // Step 2: Get pickup store ID
      let pickupStoreId = 1; // Default fallback
      try {
        const storesResponse = await fetch(`${REDX_BASE_URL}/pickup/stores`, {
          method: "GET",
          headers: {
            "API-ACCESS-TOKEN": `Bearer ${REDX_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        const storesData = await storesResponse.json();

        if (
          storesResponse.ok &&
          storesData.pickup_stores &&
          storesData.pickup_stores.length > 0
        ) {
          // Use the first available pickup store
          pickupStoreId = storesData.pickup_stores[0].id;
          console.log("Using pickup store:", storesData.pickup_stores[0]);
        } else {
          console.warn("No pickup stores found");
        }
      } catch (error) {
        console.error("Error fetching pickup stores:", error);
      }

      // Calculate total weight from items (convert from grams to kg)
      const totalWeight = order.items.reduce((sum, item) => {
        const weightInKg = item.weight ? item.weight / 1000 : 0.5;
        return sum + weightInKg * item.quantity;
      }, 0);

      // Prepare parcel details items with category from product categories
      const parcelDetailsItems = order.items.map((item) => ({
        name: item.product_name,
        category: item.categories?.[0]?.name || "General",
        value: item.unit_price,
      }));

      // Prepare the parcel data according to Redx API specification
      const parcelData = {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_area: order.area || "Chittagong",
        delivery_area_id: areaId,
        customer_address:
          order.address_line ||
          `${order.area || ""}, ${order.city || ""}, ${order.postal_code || ""}`.trim(),
        merchant_invoice_id: order.code,
        cash_collection_amount: order.is_cod
          ? parseFloat(order.net_amount).toString()
          : "0",
        parcel_weight: Math.max(totalWeight, 0.5), // Minimum 0.5kg
        instruction: "Handle with care",
        value: parseFloat(order.net_amount).toString(),
        is_closed_box: false, // Changed from "No" to false (boolean)
        pickup_store_id: pickupStoreId,
        parcel_details_json: parcelDetailsItems,
      };

      console.log("Sending parcel data to Redx:", parcelData);

      const response = await fetch(`${REDX_BASE_URL}/parcel`, {
        method: "POST",
        headers: {
          "API-ACCESS-TOKEN": `Bearer ${REDX_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parcelData),
      });

      const data = await response.json();
      console.log("Redx API Response:", data);

      if (!response.ok) {
        // Log validation errors if any
        if (data.validation_errors) {
          console.error("Validation errors:", data.validation_errors);
          throw new Error(
            data.validation_errors
              .map((e: any) => Object.values(e)[0])
              .join(", "),
          );
        }
        throw new Error(data.message || "Failed to create parcel");
      }

      // Update order with tracking ID in your database
      if (data.tracking_id) {
        const updateResponse = await apiClient(
          `${import.meta.env.VITE_SERVER}/order/update-delivery-status`,
          {
            method: "POST",
            tokenType: "jwt",
            data: {
              id: order.id,
              tracking_id: data.tracking_id,
              delivery_status: "ASSIGNED",
              courier_response: data,
            },
          },
        );

        if (updateResponse.success) {
          toast.success(
            `Parcel created successfully! Tracking ID: ${data.tracking_id}`,
          );

          // Refresh orders to show tracking ID
          await fetchData(1);
        } else {
          toast.error("Failed to update order with tracking ID");
        }
      }

      return data.tracking_id;
    } catch (error: any) {
      console.error("Parcel creation error:", error);
      toast.error(error.message || "Failed to create parcel");
      return null;
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleCreateParcel = async (order: Order) => {
    await createParcel(order);
  };

  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: string,
  ) => {
    try {
      setProcessingOrderId(orderId);

      const currentOrder = allOrders.find((o) => o.id === orderId);

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/order/update-order-status`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            id: orderId,
            order_status: newStatus,
          },
        },
      );

      if (response.success) {
        const statusMessages: Record<string, string> = {
          CONFIRMED: "Order accepted successfully!",
          PROCESSING: "Order marked as processing!",
          SHIPPED: "Order shipped successfully!",
          DELIVERED: "Order marked as delivered!",
          CANCELLED: "Order cancelled successfully!",
          REFUNDED: "Order refunded successfully!",
        };

        toast.success(
          statusMessages[newStatus] || "Order status updated successfully!",
        );

        // Refresh orders list first
        await fetchData(1);

        // Create parcel when order is confirmed and delivery method is Redx
        if (newStatus === "CONFIRMED" && currentOrder) {
          if (currentOrder.delivery_method_name?.toLowerCase() === "redx") {
            await createParcel(currentOrder);
          } else {
            toast.info("Parcel creation skipped: Not a Redx delivery");
          }
        }
      } else {
        toast.error(response.message || "Failed to update order status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const validStatus = (Object.keys(statusConfigs) as OrderStatusTab[]).find(
      (key) => key === status,
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
            {!order.tracking_id &&
              order.delivery_method_name?.toLowerCase() === "redx" && (
                <Button
                  onClick={async () => {
                    setShowQuickView(false);
                    await createParcel(order);
                  }}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Package size={16} className="mr-2" />
                  Create Parcel
                </Button>
              )}
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
            <TabsList className="flex flex-wrap h-auto p-1 gap-2 ">
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
                ),
              )}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="ALL" className="m-0">
                <OrderTable
                  orders={orders}
                  loader={loader}
                  handleQuickView={handleQuickView}
                  handleUpdateOrderStatus={handleUpdateOrderStatus}
                  handleCreateParcel={handleCreateParcel}
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
                      (order) => order.order_status === status,
                    )}
                    loader={loader}
                    handleQuickView={handleQuickView}
                    handleUpdateOrderStatus={handleUpdateOrderStatus}
                    handleCreateParcel={handleCreateParcel}
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
              Order Quick View: #{selectedOrder?.code}
              {selectedOrder?.tracking_id && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Tracking: {selectedOrder.tracking_id}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-black">
                    Customer Information
                  </h4>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-black">
                      {selectedOrder.customer_email}
                    </p>
                    <p className="text-sm text-black">
                      {selectedOrder.customer_phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-black">
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
                  <h4 className="font-semibold text-sm text-black">
                    Order Status
                  </h4>
                  <div>{getOrderStatusBadge(selectedOrder.order_status)}</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-black">
                    Payment Status
                  </h4>
                  <div>
                    {getPaymentStatusBadge(selectedOrder.payment_status)}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-black">
                  Delivery Address
                </h4>
                <p className="text-sm">
                  {selectedOrder.address_line ||
                    `${selectedOrder.area || ""}, ${selectedOrder.city || ""}, ${selectedOrder.postal_code || ""}`}
                </p>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-black">
                  Order Items ({selectedOrder.items.length})
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
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
                                  <p className="text-xs text-black">
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
              <div className="space-y-2 ">
                <h4 className="font-semibold text-sm text-black">
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
                          parseFloat(selectedOrder.discount_amount),
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
              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
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
