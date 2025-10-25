import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DataTable } from "@/components/ui/dataTable";
import { apiClient } from "@/hook/apiClient";
import { Eye, Pen, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_status: string;
  payment_status: string;
  delivery_method_name: string;
  payment_method_name: string;
  created_at: string;
  items: OrderItem[];
}
export const OrderList = () => {
  const router = useNavigate();
  const [loader, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/order/get-all-order`,
        {
          method: "POST",
          data: { page: 1, limit: 10 },
          tokenType: "jwt",
        }
      );

      setOrders(data.data.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData;
  }, []);

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
          <h1 className="text-2xl font-bold text-bw-900">All Orders</h1>
        </div>
        <DataTable
          data={orders}
          label="Order List"
          selectable
          rowsPerPage={10}
          loading={loader}
       
          printHead={
            [
              // { label: "Code", value: "code" },
              // { label: "Product Name", value: "name" },
              // { label: "UOM", value: "uom_name" },
              // { label: "Cost Price", value: "cost_price" },
              // { label: "Selling Price", value: "selling_price" },
              // { label: "Stock", value: "total_stock" },
              // { label: "Status", value: "status" },
            ]
          }
          actions={[
            {
              label: <Eye size={16} className="inline" />,
              className: "",
              title: "View",
              onClick: (row) => router(`/inventory/products/${row.id}`),
            },
            {
              label: <Pen size={16} className="inline" />,
              className: "",
              title: "Edit",
              onClick: (row) => router(`/inventory/products/${row.id}/edit`),
            },
            {
              label: <Trash size={16} className="inline" />,
              onClick: (row) => row,
              title: "Delete",
            },
          ]}
        />
      </div>
    </>
  );
};
