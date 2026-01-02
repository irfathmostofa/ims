"use client";

import { useState, useEffect } from "react";
import { Eye, Pen, Trash, Plus, X } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import {
  formatCurrency,
  formatDate,
  formatDateForInput,
} from "@/components/utils/formatter";
import { printView } from "@/components/utils/print";

type PurchaseOrderItem = {
  id?: number;
  product_variant_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  notes?: string;
};

type PurchaseOrder = {
  id?: number;
  code?: string;
  branch_id: number;
  supplier_id: number;
  supplier_name?: string;
  supplier_email?: string;
  supplier_address?: string;
  order_date: string;
  expected_date?: string;
  delivery_date?: string;
  status: "PENDING" | "RECEIVED" | "CANCELLED";
  items: PurchaseOrderItem[];
  total_amount?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_items?: number;
  total_quantity?: number;
  total_received?: number;
  notes?: string;
  date?: string;
};

type Supplier = {
  id: number;
  name: string;
};

type ProductVariant = {
  product_id: number;
  variant_id: number;
  display_name: string;
  product_name: string;
  variant_name: string;
  cost_price: number;
  stock_qty: number;
  uom_symbol: string;
};

export default function PurchaseOrderPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const { user } = useAuthStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PurchaseOrder | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [searchTerms, setSearchTerms] = useState<{ [key: number]: string }>({});
  const [showDropdown, setShowDropdown] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });
  const [form, setForm] = useState<PurchaseOrder>({
    branch_id: 1,
    supplier_id: 0,
    order_date: new Date().toISOString().split("T")[0],
    status: "PENDING",
    items: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [party, product] = await Promise.all([
        apiClient(`${import.meta.env.VITE_SERVER}/party/get-party`, {
          method: "POST",
          tokenType: "jwt",
          data: { type: "SUPPLIER" },
        }),

        apiClient(`${import.meta.env.VITE_SERVER}/product/get-pos-products`, {
          method: "POST",
          data: { category_id: null, search: null },
          tokenType: "jwt",
        }),
      ]);

      setSuppliers(party.data || []);

      setProducts(product.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  const fetchOrdersForPage = async (page: number) => {
    try {
      setLoading(true);
      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/po/get-purchase-orders`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { limit: pagination.limit, page },
        }
      );
      const order = result as any;
      setOrders(order.data.data || []);
      setPagination(
        order.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        }
      );

      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching orders for page:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersForPage(1);
  }, []);
  const handlePageChange = (newPage: number) => {
    fetchOrdersForPage(newPage);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const getFilteredProducts = (index: number) => {
    const search = searchTerms[index] || "";
    if (!search.trim()) return products;

    return products.filter(
      (p) =>
        p.display_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.product_name + " " + (p.variant_name || ""))
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  };

  const handleOpen = (po?: PurchaseOrder) => {
    console.log(po);
    if (po) {
      setForm(po);
    } else {
      setForm({
        branch_id: 1,
        supplier_id: 0,
        order_date: new Date().toISOString().split("T")[0],
        status: "PENDING",
        items: [],
      });
    }
    setSearchTerms({});
    setShowDropdown({});
    setOpen(true);
  };
  const handleOpenDetails = (po: PurchaseOrder) => {
    setSelectedRow(po);
    setOpenDetails(true);
  };
  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_variant_id: 0,
          quantity: 1,
          unit_price: 0,
          discount: 0,
          tax_rate: 0,
        },
      ],
    }));
  };

  const handleProductSelect = (index: number, variantId: number) => {
    const product = products.find((p) => p.variant_id === variantId);
    if (product) {
      setForm((prev) => {
        const items = [...prev.items];
        items[index] = {
          ...items[index],
          product_variant_id: variantId,
          unit_price: product.cost_price,
        };
        return { ...prev, items };
      });
      setSearchTerms((prev) => ({ ...prev, [index]: product.display_name }));
      setShowDropdown((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderItem,
    value: string | number
  ) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleRemoveItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    const newSearchTerms = { ...searchTerms };
    delete newSearchTerms[index];
    setSearchTerms(newSearchTerms);
  };

  const calculateItemTotal = (item: PurchaseOrderItem) => {
    const subtotal = item.quantity * item.unit_price - item.discount;
    const tax = (subtotal * item.tax_rate) / 100;
    return subtotal + tax;
  };

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const handleSave = async () => {
    if (!form.supplier_id || !form.order_date || !form.items.length) {
      toast.error("Please fill all required fields and add at least one item");
      return;
    }

    for (const item of form.items) {
      if (
        !item.product_variant_id ||
        item.quantity <= 0 ||
        item.unit_price <= 0
      ) {
        toast.error("Please fill all item details correctly");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        branch_id: user?.branch.id,
        supplier_id: form.supplier_id,
        order_date: form.order_date,
        expected_date: form.expected_date || null,
        delivery_date: form.delivery_date || null,
        status: form.status,
        notes: form.notes || null,
        items: form.items.map((item) => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount,
          tax_rate: item.tax_rate,
          notes: item.notes || null,
        })),
      };

      const url = form.id
        ? `${import.meta.env.VITE_SERVER}/po/update-purchase-orders/${form.id}`
        : `${import.meta.env.VITE_SERVER}/po/purchase-orders`;

      const response = await apiClient(url, {
        method: "POST", // use POST for both create and update
        tokenType: "jwt",
        data: payload,
      });

      if (response.success) {
        toast.success(response.message || "Purchase order saved successfully");
        setOpen(false);
        fetchData();
      } else {
        toast.error(response.message || "Failed to save purchase order");
      }
    } catch (error: any) {
      console.error("Error saving order:", error);
      toast.error(error.message || "Failed to save purchase order");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (po: PurchaseOrder) => {
    if (!confirm(`Delete Purchase Order ${po.code || `#${po.id}`}?`)) return;

    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/po/delete-purchase-orders`,
        {
          method: "POST",
          data: { id: po.id },
          tokenType: "jwt",
        }
      );

      if (response.success) {
        toast.success("Purchase order deleted successfully");
        fetchData();
      } else {
        toast.error(response.message || "Failed to delete purchase order");
      }
    } catch (error: any) {
      console.error("Error deleting order:", error);
      toast.error(error.message || "Failed to delete purchase order");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Button
          onClick={() => handleOpen()}
          className="btn-bw-primary flex gap-1"
        >
          <Plus size={16} /> New Purchase Order
        </Button>
      </div>

      <DataTable
        data={orders}
        label="Purchase Orders List"
        loading={loading}
        pagination={true}
        page={pagination.page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.limit}
        showColumns={[
          "code",
          "supplier_name",
          "order_date",
          "delivery_date",
          "total_items",
          "total_quantity",
          "total_received",
          "status",
          "total_amount",
        ]}
        printHead={[
          { label: "PO Code", value: "code" },
          { label: "Supplier", value: "supplier_name" },
          { label: "Order Date", value: "order_date" },
          { label: "Status", value: "status" },
          { label: "Total", value: "total_amount" },
        ]}
        columnFormats={{
          order_date: (val) => formatDate(val),
          delivery_date: (val) => formatDate(val),
          total_amount: (val) => formatCurrency(val),
        }}
        actions={[
          {
            label: <Eye size={16} />,
            onClick: (row) => handleOpenDetails(row),
          },
          {
            label: <Pen size={16} />,
            onClick: (row) => handleOpen(row),
          },
          {
            label: <Trash size={16} />,
            onClick: (row) => handleDelete(row),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-amber-50 !max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {form.id
                ? `Edit Purchase Order ${form.code}`
                : "New Purchase Order"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Supplier *
                </label>
                <select
                  className="border px-2 py-1.5 rounded w-full text-sm"
                  value={form.supplier_id}
                  onChange={(e) =>
                    setForm({ ...form, supplier_id: Number(e.target.value) })
                  }
                >
                  <option value={0}>Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Order Date *
                </label>
                <input
                  type="date"
                  className="border px-2 py-1.5 rounded w-full text-sm"
                  value={formatDateForInput(form.order_date)}
                  onChange={(e) =>
                    setForm({ ...form, order_date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Expected Date
                </label>
                <input
                  type="date"
                  className="border px-2 py-1.5 rounded w-full text-sm"
                  value={formatDateForInput(form.expected_date)}
                  onChange={(e) =>
                    setForm({ ...form, expected_date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Status</label>
                <select
                  className="border px-2 py-1.5 rounded w-full text-sm"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as PurchaseOrder["status"],
                    })
                  }
                >
                  <option value="PENDING">Pending</option>
                  <option value="RECEIVED">Received</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  className="border px-2 py-1.5 rounded w-full text-sm"
                  value={form.notes || ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-sm">Items *</h2>
                <Button
                  size="sm"
                  onClick={handleAddItem}
                  className="border h-7 text-xs"
                >
                  <Plus size={12} className="mr-1" /> Add Item
                </Button>
              </div>
              <div className="overflow-x-auto border rounded ">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-1.5 text-left">Product *</th>
                      <th className="border p-1.5 text-center w-16">Qty</th>
                      <th className="border p-1.5 text-right w-20">Price</th>
                      <th className="border p-1.5 text-right w-20">Discount</th>
                      <th className="border p-1.5 text-center w-16">Tax %</th>
                      <th className="border p-1.5 text-right w-20">Total</th>
                      <th className="border p-1.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, index) => (
                      <tr key={index}>
                        {/* Product Selection */}
                        <td className="border p-1">
                          <div className="">
                            <input
                              type="text"
                              className="border px-2 py-1 rounded w-full text-xs pr-6"
                              placeholder="Search product..."
                              value={
                                searchTerms[index] ??
                                products.find(
                                  (p) =>
                                    p.variant_id === item.product_variant_id
                                )?.display_name ??
                                ""
                              }
                              onChange={(e) => {
                                setSearchTerms((prev) => ({
                                  ...prev,
                                  [index]: e.target.value,
                                }));
                                setShowDropdown((prev) => ({
                                  ...prev,
                                  [index]: true,
                                }));
                              }}
                              onFocus={() =>
                                setShowDropdown((prev) => ({
                                  ...prev,
                                  [index]: true,
                                }))
                              }
                              onBlur={() =>
                                setTimeout(() => {
                                  setShowDropdown((prev) => ({
                                    ...prev,
                                    [index]: false,
                                  }));
                                }, 150)
                              }
                            />

                            {/* Dropdown */}
                            {showDropdown[index] && (
                              <div className="absolute z-[1000] w-full max-h-28 overflow-y-auto bg-white border rounded-md shadow-lg mt-1">
                                {getFilteredProducts(index).length > 0 ? (
                                  getFilteredProducts(index).map((p) => (
                                    <div
                                      key={p.variant_id}
                                      className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer text-xs"
                                      onMouseDown={() =>
                                        handleProductSelect(index, p.variant_id)
                                      } // <- use onMouseDown
                                    >
                                      <div className="font-medium">
                                        {p.display_name}
                                      </div>
                                      <div className="text-gray-500 text-[10px]">
                                        ${formatCurrency(p.cost_price)} • Stock:{" "}
                                        {p.stock_qty} {p.uom_symbol}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-2 py-2 text-gray-500 text-xs">
                                    No products found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="border p-1">
                          <input
                            type="number"
                            min="1"
                            className="border px-1 py-1 rounded w-full text-xs text-center"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="border p-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="border px-1 py-1 rounded w-full text-xs text-right"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "unit_price",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        {/* Discount */}
                        <td className="border p-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="border px-1 py-1 rounded w-full text-xs text-right"
                            value={item.discount}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "discount",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        {/* Tax */}
                        <td className="border p-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            className="border px-1 py-1 rounded w-full text-xs text-center"
                            value={item.tax_rate}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "tax_rate",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        {/* Total */}
                        <td className="border p-1 text-right font-medium">
                          ${calculateItemTotal(item).toFixed(2)}
                        </td>

                        {/* Remove Item */}
                        <td className="border p-1 text-center">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <div className="text-xs text-gray-600">
                {form.items.length} item(s)
              </div>
              <div className="font-bold text-base">
                Total: ${calculateTotal().toFixed(2)}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="btn-bw-primary h-8 text-xs"
              >
                {loading ? "Saving..." : form.id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <div className="p-6" id="printDetails">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold">PURCHASE ORDER</h2>
                <p className="text-gray-600 mt-1">
                  PO Number:{" "}
                  <span className="font-semibold">
                    {selectedRow?.code || selectedRow?.id}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-lg font-bold">{selectedRow?.status}</div>
              </div>
            </div>

            {selectedRow && (
              <div className="space-y-8">
                {/* Supplier and Order Info */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-lg mb-3 border-b pb-2">
                      SUPPLIER
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-gray-600 text-sm">
                          Supplier Name
                        </div>
                        <div className="font-semibold">
                          {selectedRow.supplier_name || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-sm">
                          PO Reference
                        </div>
                        <div className="font-semibold">
                          {selectedRow.code || `#${selectedRow.id}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3 border-b pb-2">
                      ORDER DATES
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-semibold">
                          {formatDate(selectedRow.order_date)}
                        </span>
                      </div>
                      {selectedRow.expected_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Date:</span>
                          <span className="font-semibold">
                            {formatDate(selectedRow.expected_date)}
                          </span>
                        </div>
                      )}
                      {selectedRow.delivery_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Date:</span>
                          <span className="font-semibold">
                            {formatDate(selectedRow.delivery_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border rounded-lg">
                  <div className="border-b bg-gray-50 p-4">
                    <h3 className="font-bold">ORDER ITEMS</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      Total Items: {selectedRow.items?.length || 0} | Total
                      Quantity:{" "}
                      {selectedRow.total_quantity ||
                        selectedRow.items?.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        ) ||
                        0}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-semibold">
                            Product
                          </th>
                          <th className="text-center p-3 font-semibold">
                            Quantity
                          </th>
                          <th className="text-right p-3 font-semibold">
                            Unit Price
                          </th>
                          <th className="text-right p-3 font-semibold">
                            Discount
                          </th>
                          <th className="text-center p-3 font-semibold">
                            Tax %
                          </th>
                          <th className="text-right p-3 font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRow.items && selectedRow.items.length > 0 ? (
                          selectedRow.items.map((item, index) => {
                            const itemTotal = calculateItemTotal(item);
                            const product = products.find(
                              (p) => p.variant_id === item.product_variant_id
                            );
                            const productName = product
                              ? product.display_name
                              : item.product_name
                              ? item.product_name
                              : `Product #${item.product_variant_id}`;

                            return (
                              <tr
                                key={index}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="p-3">
                                  <div className="font-medium">
                                    {productName}
                                  </div>
                                  {item.notes && (
                                    <div className="text-sm text-gray-500 italic mt-1">
                                      Note: {item.notes}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  {item.quantity}
                                </td>
                                <td className="p-3 text-right">
                                  {formatCurrency(item.unit_price)}
                                </td>
                                <td className="p-3 text-right">
                                  {item.discount > 0
                                    ? `-${formatCurrency(item.discount)}`
                                    : "-"}
                                </td>
                                <td className="p-3 text-center">
                                  {item.tax_rate}%
                                </td>
                                <td className="p-3 text-right font-semibold">
                                  {formatCurrency(itemTotal)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="p-6 text-center text-gray-500"
                            >
                              No items in this order
                            </td>
                          </tr>
                        )}
                      </tbody>

                      {selectedRow.items && selectedRow.items.length > 0 && (
                        <tfoot className="bg-gray-50">
                          {/* Subtotal */}
                          <tr>
                            <td
                              colSpan={4}
                              className="p-3 text-right font-medium"
                            >
                              Subtotal:
                            </td>
                            <td
                              colSpan={2}
                              className="p-3 text-right font-semibold"
                            >
                              {formatCurrency(
                                selectedRow.items.reduce(
                                  (total, item) =>
                                    total +
                                    (item.quantity * item.unit_price -
                                      item.discount),
                                  0
                                )
                              )}
                            </td>
                          </tr>

                          {/* Tax */}
                          {selectedRow.tax_amount &&
                            selectedRow.tax_amount > 0 && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="p-3 text-right font-medium"
                                >
                                  Tax:
                                </td>
                                <td
                                  colSpan={2}
                                  className="p-3 text-right font-semibold"
                                >
                                  {formatCurrency(selectedRow.tax_amount)}
                                </td>
                              </tr>
                            )}

                          {/* Discount */}
                          {selectedRow.discount_amount &&
                            selectedRow.discount_amount > 0 && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="p-3 text-right font-medium"
                                >
                                  Discount:
                                </td>
                                <td
                                  colSpan={2}
                                  className="p-3 text-right font-semibold"
                                >
                                  -{formatCurrency(selectedRow.discount_amount)}
                                </td>
                              </tr>
                            )}

                          {/* Grand Total */}
                          <tr className="border-t-2 border-black">
                            <td
                              colSpan={4}
                              className="p-3 text-right text-lg font-bold"
                            >
                              GRAND TOTAL:
                            </td>
                            <td colSpan={2} className="p-3 text-right">
                              <div className="text-xl font-bold">
                                {formatCurrency(
                                  selectedRow.total_amount ||
                                    selectedRow.items.reduce(
                                      (total, item) =>
                                        total + calculateItemTotal(item),
                                      0
                                    )
                                )}
                              </div>
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* Order Notes */}
                {selectedRow.notes && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-bold mb-2">ORDER NOTES</h3>
                    <p className="text-gray-700">{selectedRow.notes}</p>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenDetails(false)}
                    className="h-9"
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => printView("printDetails")}
                    className="h-9 border-gray-300"
                  >
                    Print
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
