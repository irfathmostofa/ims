import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Pen,
  Trash,
  Eye,
  Check,
  Search,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useQuickStore } from "@/store/quickStore";
import { apiClient } from "@/hook/apiClient";
import { formatDate } from "@/components/utils/formatter";

interface Product {
  product_id: number;
  variant_id: number;
  code: string;
  product_name: string;
  variant_name: string;
  display_name: string;
  description: string;
  selling_price: string;
  cost_price: string;
  additional_price: string;
  uom_symbol: string;
  uom_name: string;
  category_name: string;
  stock_qty: string;
  status: string;
  variant_status: string;
  branch_name?: string;
  branch_id?: number;
}

interface RequisitionItem {
  id: number;
  requisition_id: number;
  product_variant_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  variant_name: string;
  variant_code: string;
  requested_qty: number;
  approved_qty?: number;
  selling_price: string;
}

interface Requisition {
  id: number;
  code: string;
  from_branch_id: number;
  from_branch: string;
  from_branch_name: string;
  from_branch_code: string;
  to_branch_id: number;
  to_branch: string;
  to_branch_name: string;
  to_branch_code: string;
  requisition_date: string;
  remarks?: string;
  status: string;
  created_by: number;
  created_by_name: string;
  approve_by?: number;
  items: RequisitionItem[];
}

interface Branch {
  id: number;
  name: string;
}

interface AuthUser {
  branch_name?: string;
  branch_id?: number;
  id?: number;
}

interface CreateRequisitionRequest {
  from_branch_id: number;
  to_branch_id: number;
  requisition_date: string;
  remarks?: string;
  items: {
    product_variant_id: number;
    requested_qty: number;
  }[];
}

interface ApproveRequisitionRequest {
  id: string;
  transfer_date: string;
  approved_items: Array<{
    requisition_item_id: number;
    product_variant_id: number;
    requested_qty: number;
    approved_qty: number;
    remarks: string;
  }>;
  remarks?: string;
}

export const Requisition = () => {
  const router = useNavigate();

  const { user } = useAuthStore();
  const { branches, products, fetchProducts, fetchBranches } = useQuickStore();
  const [update, setUpdate] = useState(0);

  // Requisition List
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loadingRequisitions, setLoadingRequisitions] = useState(false);
  
  // Form State
  const [form, setForm] = useState<Requisition>({
    id: 0,
    code: "",
    from_branch_id: (user as AuthUser)?.branch_id || 0,
    from_branch: (user as AuthUser)?.branch_name || "",
    from_branch_name: (user as AuthUser)?.branch_name || "",
    from_branch_code: "",
    to_branch_id: 0,
    to_branch: "",
    to_branch_name: "",
    to_branch_code: "",
    requisition_date: new Date().toISOString().slice(0, 10),
    status: "Pending",
    created_by: (user as AuthUser)?.id || 0,
    created_by_name: "",
    items: [],
  });

  const [remarks, setRemarks] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Approve modal state
  const [approveOpen, setApproveOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] =
    useState<Requisition | null>(null);
  const [approvedItems, setApprovedItems] = useState<{ [key: number]: number }>(
    {}
  );
  const [approveRemarks, setApproveRemarks] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);

  // Selected products state for the new design
  const [selectedProducts, setSelectedProducts] = useState<{
    [key: string]: number;
  }>({});

  // Stock validation state
  const [stockErrors, setStockErrors] = useState<{ [key: string]: string }>({});

  // Use proper type casting
  const typedBranches = branches as unknown as Branch[];
  const typedProducts = products as unknown as Product[];

  // Load API data
  useEffect(() => {
    fetchBranches();
    if (form.from_branch_id) {
      fetchProducts({ branch_id: form.from_branch_id });
    }
    fetchRequisitions();
  }, [fetchBranches, fetchProducts, update, form.from_branch_id]);

  // Filter products based on search
  const filteredProducts = typedProducts.filter((product: Product) => {
    const search = searchTerm.toLowerCase();
    return (
      product.product_name.toLowerCase().includes(search) ||
      product.code.toLowerCase().includes(search) ||
      product.display_name.toLowerCase().includes(search)
    );
  });

  // Fetch all requisitions
  const fetchRequisitions = async () => {
    setLoadingRequisitions(true);
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/get-all-requisition`,
        {
          method: "GET",
          tokenType: "jwt",
        }
      );

      if (response.success) {
        setRequisitions(response.data);
      }
    } catch (err: any) {
      console.error("Fetch requisitions error:", err);
    } finally {
      setLoadingRequisitions(false);
    }
  };

  // Validate stock before saving
  const validateStock = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    Object.entries(selectedProducts).forEach(([key, requestedQty]) => {
      if (requestedQty > 0) {
        const [product_id, variant_id] = key.split("-").map(Number);
        const product = typedProducts.find(
          (p) => p.product_id === product_id && p.variant_id === variant_id
        );

        if (product) {
          const availableStock = parseFloat(product.stock_qty) || 0;
          if (requestedQty > availableStock) {
            errors[key] = `Only ${availableStock} available in stock`;
            isValid = false;
          }
        }
      }
    });

    setStockErrors(errors);
    return isValid;
  };

  // OPEN FORM
  const handleOpen = (req?: Requisition) => {
    if (req) {
      setForm(req);
      setRemarks(req.remarks || "");
      // Convert existing items to selectedProducts format
      const selected: { [key: string]: number } = {};
      req.items.forEach((item) => {
        const key = `${item.product_id}-${item.product_variant_id}`;
        selected[key] = item.requested_qty;
      });
      setSelectedProducts(selected);
    } else {
      setForm({
        id: 0,
        code: "",
        from_branch_id: (user as AuthUser)?.branch_id || 0,
        from_branch: (user as AuthUser)?.branch_name || "",
        from_branch_name: (user as AuthUser)?.branch_name || "",
        from_branch_code: "",
        to_branch_id: 0,
        to_branch: "",
        to_branch_name: "",
        to_branch_code: "",
        requisition_date: new Date().toISOString().slice(0, 10),
        status: "Pending",
        created_by: (user as AuthUser)?.id || 0,
        created_by_name: "",
        items: [],
      });
      setRemarks("");
      setSelectedProducts({});
      setStockErrors({});
    }
    setOpen(true);
  };

  // OPEN APPROVE MODAL
  const handleOpenApprove = (req: Requisition) => {
    setSelectedRequisition(req);
    setApproveRemarks("");

    // Initialize approved quantities with requested quantities
    const initialApproved: { [key: number]: number } = {};
    req.items.forEach((item) => {
      initialApproved[item.id] = item.requested_qty;
    });
    setApprovedItems(initialApproved);

    setApproveOpen(true);
  };

  // Handle product selection and quantity change
  const handleProductSelection = (product: Product, quantity: number) => {
    const key = `${product.product_id}-${product.variant_id}`;

    if (quantity > 0) {
      // Add or update product with quantity
      setSelectedProducts((prev) => ({
        ...prev,
        [key]: quantity,
      }));

      // Validate stock when quantity changes
      const availableStock = parseFloat(product.stock_qty) || 0;
      if (quantity > availableStock) {
        setStockErrors((prev) => ({
          ...prev,
          [key]: `Only ${availableStock} available in stock`,
        }));
      } else {
        setStockErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    } else {
      // Remove product if quantity is 0 or negative
      const newSelected = { ...selectedProducts };
      delete newSelected[key];
      setSelectedProducts(newSelected);

      // Remove any stock error for this product
      setStockErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (product: Product, checked: boolean) => {
    const key = `${product.product_id}-${product.variant_id}`;

    if (checked) {
      // Add product with default quantity 1
      setSelectedProducts((prev) => ({
        ...prev,
        [key]: 1,
      }));

      // Validate stock
      const availableStock = parseFloat(product.stock_qty) || 0;
      if (1 > availableStock) {
        setStockErrors((prev) => ({
          ...prev,
          [key]: `Only ${availableStock} available in stock`,
        }));
      }
    } else {
      // Remove product
      const newSelected = { ...selectedProducts };
      delete newSelected[key];
      setSelectedProducts(newSelected);

      // Remove stock error
      setStockErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Handle quantity input change
  const handleQuantityChange = (product: Product, quantity: string) => {
    const qty = parseInt(quantity) || 0;
    handleProductSelection(product, qty);
  };

  // Convert selected products to requisition items
  const getRequisitionItems = (): RequisitionItem[] => {
    return Object.entries(selectedProducts)
      .filter(([_, quantity]) => quantity > 0)
      .map(([key, quantity]) => {
        const [product_id, variant_id] = key.split("-").map(Number);
        const product = typedProducts.find(
          (p) => p.product_id === product_id && p.variant_id === variant_id
        );

        return {
          id: Date.now() + Math.random(),
          requisition_id: 0,
          product_variant_id: variant_id,
          product_id: product_id,
          product_name: product?.product_name || "",
          product_code: product?.code || "",
          variant_name: product?.variant_name || "",
          variant_code: product?.code || "",
          requested_qty: quantity,
          selling_price: product?.selling_price || "0",
        };
      });
  };

  // SAVE REQUISITION
  const handleSave = async () => {
    // Validate stock before saving
    if (!validateStock()) {
      alert("Please adjust quantities to match available stock before saving.");
      return;
    }

    setLoading(true);

    try {
      const requisitionItems = getRequisitionItems();

      // Prepare data for API
      const requisitionData: CreateRequisitionRequest = {
        from_branch_id: form.from_branch_id,
        to_branch_id: form.to_branch_id,
        requisition_date: form.requisition_date,
        remarks: remarks,
        items: requisitionItems.map((item) => ({
          product_variant_id: item.product_variant_id,
          requested_qty: item.requested_qty,
        })),
      };

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/create-requisition`,
        {
          method: "POST",
          tokenType: "jwt",
          data: requisitionData,
        }
      );

      if (response.success) {
        setUpdate(update + 1);
        await fetchRequisitions();
        setOpen(false);
        setSelectedProducts({});
        setStockErrors({});
        alert("Requisition created successfully!");
      } else {
        throw new Error(
          response.data.message || "Failed to create requisition"
        );
      }
    } catch (err: any) {
      console.error("Create requisition error:", err);
      alert(err.message || "Failed to create requisition");
    } finally {
      setLoading(false);
    }
  };

  // APPROVE REQUISITION
  const handleApprove = async () => {
    if (!selectedRequisition) return;

    setApproveLoading(true);

    try {
      const approvedItemsData = selectedRequisition.items
        .filter((item) => approvedItems[item.id] > 0)
        .map((item) => ({
          requisition_item_id: item.id,
          product_variant_id: item.product_variant_id,
          requested_qty: item.requested_qty,
          approved_qty: approvedItems[item.id],
          remarks: approveRemarks,
        }));

      if (approvedItemsData.length === 0) {
        throw new Error("Please approve at least one item");
      }

      const approveData: ApproveRequisitionRequest = {
        id: selectedRequisition.id.toString(),
        transfer_date: new Date().toISOString().slice(0, 10),
        approved_items: approvedItemsData,
        remarks: approveRemarks,
      };

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/approve-requisition`,
        {
          method: "POST",
          tokenType: "jwt",
          data: approveData,
        }
      );

      if (response.success) {
        setUpdate(update + 1);
        await fetchRequisitions();
        setApproveOpen(false);
        setSelectedRequisition(null);
        setApprovedItems({});
        setApproveRemarks("");
        alert("Requisition approved and transferred successfully!");
      } else {
        throw new Error(response.message || "Failed to approve requisition");
      }
    } catch (err: any) {
      console.error("Approve requisition error:", err);
      alert(err.message || "Failed to approve requisition");
    } finally {
      setApproveLoading(false);
    }
  };

  const handleDelete = async (req: Requisition) => {
    if (confirm("Are you sure you want to delete this requisition?")) {
      try {
        setRequisitions((prev) => prev.filter((r) => r.id !== req.id));
        alert("Requisition deleted successfully!");
      } catch (err: any) {
        console.error("Delete requisition error:", err);
        alert("Failed to delete requisition");
      }
    }
  };

  // Handle branch selection
  const handleFromBranchChange = (branchName: string) => {
    const branch = typedBranches.find((b: Branch) => b.name === branchName);
    if (branch) {
      setForm((prev) => ({
        ...prev,
        from_branch: branchName,
        from_branch_name: branchName,
        from_branch_id: branch.id,
      }));
      // Refresh products for the selected branch
      fetchProducts({ branch_id: branch.id });
      // Clear selected products when branch changes
      setSelectedProducts({});
      setStockErrors({});
    }
  };

  const handleToBranchChange = (branchName: string) => {
    const branch = typedBranches.find((b: Branch) => b.name === branchName);
    if (branch) {
      setForm((prev) => ({
        ...prev,
        to_branch: branchName,
        to_branch_name: branchName,
        to_branch_id: branch.id,
      }));
    }
  };

  // Handle approved quantity change
  const handleApprovedQuantityChange = (itemId: number, quantity: string) => {
    const qty = parseInt(quantity) || 0;
    setApprovedItems((prev) => ({
      ...prev,
      [itemId]: qty,
    }));
  };

  // Check if product is selected
  const isProductSelected = (product: Product): boolean => {
    const key = `${product.product_id}-${product.variant_id}`;
    return selectedProducts[key] > 0;
  };

  // Get selected quantity for product
  const getSelectedQuantity = (product: Product): number => {
    const key = `${product.product_id}-${product.variant_id}`;
    return selectedProducts[key] || 0;
  };

  // Get selected items count
  const selectedItemsCount = Object.values(selectedProducts).filter(
    (qty) => qty > 0
  ).length;

  // Check if there are stock errors
  const hasStockErrors = Object.keys(stockErrors).length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Branch Requisition</h1>
        <Button
          onClick={() => handleOpen()}
          className="btn-bw-primary flex gap-1"
        >
          <Plus size={16} /> New Requisition
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={requisitions}
        label="Requisition List"
        rowsPerPage={10}
        loading={loadingRequisitions}
        showColumns={[
          "code",
          "from_branch_name",
          "to_branch_name",
          "requisition_date",
          "status",
        ]}
        columnFormats={{
          requisition_date: (val) => formatDate(val),
        }}
        actions={[
          {
            label: <Eye size={16} />,
            onClick: (row: Requisition) =>
              router(`/procurement/requisition-view/${row.id}`),
            title: "View Details",
          },
          {
            label: <Check size={16} />,
            onClick: (row: Requisition) => handleOpenApprove(row),
            title: "Approve",
            hide: (row: Requisition) =>
              row.status === "COMPLETED" ||
              row.status === "CANCELLED" ||
              row.status === "APPROVED",
          },
          {
            label: <Pen size={16} />,
            onClick: (row: Requisition) => handleOpen(row),
            title: "Edit",
            hide: (row: Requisition) => row.status !== "Pending",
          },
          {
            label: <Trash size={16} />,
            onClick: (row: Requisition) => handleDelete(row),
            title: "Delete",
            hide: (row: Requisition) => row.status !== "Pending",
          },
        ]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-6xl bg-gray-50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Requisition" : "New Requisition"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Branch Select */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={form.from_branch}
                onChange={(e) => handleFromBranchChange(e.target.value)}
                className="border px-3 py-2 rounded"
                disabled={!!form.id}
              >
                <option value="">Select From Branch</option>
                {typedBranches.map((b: Branch) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={form.to_branch}
                onChange={(e) => handleToBranchChange(e.target.value)}
                className="border px-3 py-2 rounded"
                disabled={!!form.id}
              >
                <option value="">Select To Branch</option>
                {typedBranches.map((b: Branch) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={form.requisition_date}
                onChange={(e) =>
                  setForm({ ...form, requisition_date: e.target.value })
                }
                className="border px-3 py-2 rounded"
                disabled={!!form.id}
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium mb-2">Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="border px-3 py-2 rounded w-full"
                rows={3}
                placeholder="Add any remarks here..."
              />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search products by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Items Summary */}
            {selectedItemsCount > 0 && (
              <div
                className={`border rounded-lg p-3 ${
                  hasStockErrors
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <p
                  className={`font-medium flex items-center gap-2 ${
                    hasStockErrors ? "text-red-800" : "text-blue-800"
                  }`}
                >
                  {hasStockErrors && <AlertCircle size={16} />}
                  {selectedItemsCount} product
                  {selectedItemsCount !== 1 ? "s" : ""} selected for requisition
                  {hasStockErrors && " - Please fix stock issues"}
                </p>
              </div>
            )}

            {/* Products List */}
            <div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Select</th>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-center">Variant</th>
                      <th className="p-3 text-center">Code</th>
                      <th className="p-3 text-center">Available Stock</th>
                      <th className="p-3 text-center">Requested Qty</th>
                      <th className="p-3 text-center">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center p-6 text-gray-500"
                        >
                          {typedProducts.length === 0
                            ? "No products available"
                            : "No products found"}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => {
                        const isSelected = isProductSelected(product);
                        const selectedQty = getSelectedQuantity(product);
                        const key = `${product.product_id}-${product.variant_id}`;
                        const stockError = stockErrors[key];
                        const availableStock =
                          parseFloat(product.stock_qty) || 0;

                        return (
                          <tr
                            key={`${product.product_id}-${
                              product.variant_id ?? index
                            }`}
                            className={`border-t ${
                              isSelected
                                ? stockError
                                  ? "bg-red-50"
                                  : "bg-blue-50"
                                : ""
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    product,
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4"
                              />
                            </td>
                            <td className="p-3">
                              <div>
                                <div className="font-medium">
                                  {product.product_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {product.category_name}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {product.variant_name}
                              </span>
                            </td>
                            <td className="p-3 text-center text-gray-600">
                              {product.code}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  availableStock > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {availableStock}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <Input
                                  type="number"
                                  value={isSelected ? selectedQty : 0}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      product,
                                      e.target.value
                                    )
                                  }
                                  className={`border py-1 w-20 text-center rounded ${
                                    stockError
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  min="0"
                                  max={availableStock}
                                  disabled={!isSelected}
                                />
                                {stockError && (
                                  <div className="text-red-600 text-xs flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    {stockError}
                                  </div>
                                )}
                              </div>
                            </td>{" "}
                            <td className="p-3 text-center">
                              <input
                                type="text"
                                className="border px-2 py-1 w-full rounded"
                                placeholder="Add remarks..."
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation Messages */}
            {selectedItemsCount === 0 && (
              <div className="text-yellow-600 text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                ⚠️ Please select at least one product for the requisition.
              </div>
            )}

            {hasStockErrors && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} />
                Some products have insufficient stock. Please adjust quantities
                before saving.
              </div>
            )}

            {form.from_branch_id === form.to_branch_id &&
              form.to_branch_id !== 0 && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
                  ⚠️ From branch and to branch cannot be the same.
                </div>
              )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="btn-bw-primary"
                disabled={
                  loading ||
                  selectedItemsCount === 0 ||
                  !form.from_branch_id ||
                  !form.to_branch_id ||
                  form.from_branch_id === form.to_branch_id ||
                  hasStockErrors
                }
              >
                {loading ? "Saving..." : form.id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Requisition Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="!max-w-4xl bg-gray-50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approve Requisition</DialogTitle>
          </DialogHeader>

          {selectedRequisition && (
            <div className="space-y-4">
              {/* Requisition Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
                <div>
                  <label className="font-medium">Requisition Code:</label>
                  <p>{selectedRequisition.code}</p>
                </div>
                <div>
                  <label className="font-medium">From Branch:</label>
                  <p>{selectedRequisition.from_branch_name}</p>
                </div>
                <div>
                  <label className="font-medium">To Branch:</label>
                  <p>{selectedRequisition.to_branch_name}</p>
                </div>
                <div>
                  <label className="font-medium">Date:</label>
                  <p>{selectedRequisition.requisition_date}</p>
                </div>
              </div>

              {/* Items to Approve */}
              <div>
                <h3 className="font-semibold mb-3">Approve Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-center">Variant</th>
                        <th className="p-3 text-center">Requested Qty</th>
                        <th className="p-3 text-center">Approved Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequisition.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">
                                {item.product_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.product_code}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {item.variant_name}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {item.requested_qty}
                          </td>
                          <td className="p-3 text-center">
                            <Input
                              type="number"
                              value={approvedItems[item.id] || 0}
                              onChange={(e) =>
                                handleApprovedQuantityChange(
                                  item.id,
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 py-1 w-20 text-center rounded"
                              min="0"
                              max={item.requested_qty}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Approve Remarks */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Approval Remarks
                </label>
                <textarea
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                  rows={3}
                  placeholder="Add approval remarks here..."
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" onClick={() => setApproveOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={
                    approveLoading ||
                    Object.values(approvedItems).filter((qty) => qty > 0)
                      .length === 0
                  }
                >
                  {approveLoading ? "Approving..." : "Approve & Transfer"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
