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
import { Plus, Pen, Trash, Eye, Check, Search } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useQuickStore } from "@/store/quickStore";
import { apiClient } from "@/hook/apiClient";

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
}

interface RequisitionItem {
  id: number;
  product_variant_id: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_name: string;
  display_name: string;
  requested_qty: number;
  approved_qty?: number;
}

interface Requisition {
  id: number;
  code: string;
  from_branch_id: number;
  from_branch: string;
  to_branch_id: number;
  to_branch: string;
  requisition_date: string;
  remarks?: string;
  status: string;
  items: RequisitionItem[];
}

interface Branch {
  id: number;
  name: string;
}

interface AuthUser {
  branch_name?: string;
  branch_id?: number;
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

export const Requisition = () => {
  const router = useNavigate();

  const { user } = useAuthStore();
  const { branches, products, fetchProducts, fetchBranches } = useQuickStore();

  // Load API data
  useEffect(() => {
    fetchBranches();
    fetchProducts();
  }, [fetchBranches, fetchProducts]);

  // Requisition List
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);

  // Form State
  const [form, setForm] = useState<Requisition>({
    id: 0,
    code: "",
    from_branch_id: (user as AuthUser)?.branch_id || 0,
    from_branch: (user as AuthUser)?.branch_name || "",
    to_branch_id: 0,
    to_branch: "",
    requisition_date: new Date().toISOString().slice(0, 10),
    status: "Pending",
    items: [],
  });

  const [remarks, setRemarks] = useState("");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Product selection modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // Use proper type casting
  const typedBranches = branches as unknown as Branch[];
  const typedProducts = products as unknown as Product[];

  // Filter products based on search
  const filteredProducts = typedProducts.filter((product: Product) => {
    const search = searchTerm.toLowerCase();
    return (
      product.product_name.toLowerCase().includes(search) ||
      product.code.toLowerCase().includes(search) ||
      product.display_name.toLowerCase().includes(search)
    );
  });

  // OPEN FORM
  const handleOpen = (req?: Requisition) => {
    if (req) {
      setForm(req);
      setRemarks(req.remarks || "");
    } else {
      setForm({
        id: 0,
        code: "",
        from_branch_id: (user as AuthUser)?.branch_id || 0,
        from_branch: (user as AuthUser)?.branch_name || "",
        to_branch_id: 0,
        to_branch: "",
        requisition_date: new Date().toISOString().slice(0, 10),
        status: "Pending",
        items: [],
      });
      setRemarks("");
    }
    setOpen(true);
  };

  // SAVE REQUISITION
  const handleSave = async () => {
    setLoading(true);

    try {
      // Prepare data for API
      const requisitionData: CreateRequisitionRequest = {
        from_branch_id: form.from_branch_id,
        to_branch_id: form.to_branch_id,
        requisition_date: form.requisition_date,
        remarks: remarks,
        items: form.items.map((item) => ({
          product_variant_id: item.product_variant_id,
          requested_qty: item.requested_qty,
        })),
      };
      console.log(requisitionData);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/create-requisition`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { requisitionData },
        }
      );
      console.log(response);
      if (response.data.success) {
        // Add the new requisition to the list
        setRequisitions((prev) => [...prev, response.data.data]);
        setOpen(false);
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

  const handleDelete = async (req: Requisition) => {
    if (confirm("Are you sure you want to delete this requisition?")) {
      try {
        // Add your delete API call here if needed
        setRequisitions((prev) => prev.filter((r) => r.id !== req.id));
      } catch (err: any) {
        console.error("Delete requisition error:", err);
        alert("Failed to delete requisition");
      }
    }
  };

  const handleApprove = async (req: Requisition) => {
    if (confirm("Are you sure you want to approve this requisition?")) {
      try {
        // Add your approve API call here if needed
        setRequisitions((prev) =>
          prev.map((r) => (r.id === req.id ? { ...r, status: "Approved" } : r))
        );
      } catch (err: any) {
        console.error("Approve requisition error:", err);
        alert("Failed to approve requisition");
      }
    }
  };

  // ADD ITEM
  const handleAddItem = () => {
    if (typedProducts.length === 0) return;

    const newItem: RequisitionItem = {
      id: Date.now(),
      product_variant_id: 0,
      product_id: 0,
      variant_id: 0,
      product_name: "",
      variant_name: "",
      display_name: "",
      requested_qty: 1,
    };

    setForm((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Open product selection for the new item
    setSelectedItemId(newItem.id);
    setShowProductModal(true);
  };

  // UPDATE ITEM
  const updateItem = (
    id: number,
    key: keyof RequisitionItem,
    value: unknown
  ) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  // SELECT PRODUCT FROM LIST
  const handleSelectProduct = (product: Product) => {
    if (selectedItemId) {
      updateItem(selectedItemId, "product_variant_id", product.variant_id);
      updateItem(selectedItemId, "product_id", product.product_id);
      updateItem(selectedItemId, "variant_id", product.variant_id);
      updateItem(selectedItemId, "product_name", product.product_name);
      updateItem(selectedItemId, "variant_name", product.variant_name);
      updateItem(selectedItemId, "display_name", product.display_name);
    }
    setShowProductModal(false);
    setSelectedItemId(null);
    setSearchTerm("");
  };

  // REMOVE ITEM
  const handleRemoveItem = (itemId: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  // EDIT ITEM PRODUCT
  const handleEditItemProduct = (itemId: number) => {
    setSelectedItemId(itemId);
    setShowProductModal(true);
  };

  // Get product by ID
  const getProductById = (productId: number): Product | undefined => {
    return typedProducts.find((p: Product) => p.product_id === productId);
  };

  // Handle branch selection
  const handleFromBranchChange = (branchName: string) => {
    const branch = typedBranches.find((b: Branch) => b.name === branchName);
    setForm((prev) => ({
      ...prev,
      from_branch: branchName,
      from_branch_id: branch?.id || 0,
    }));
  };

  const handleToBranchChange = (branchName: string) => {
    const branch = typedBranches.find((b: Branch) => b.name === branchName);
    setForm((prev) => ({
      ...prev,
      to_branch: branchName,
      to_branch_id: branch?.id || 0,
    }));
  };

  // Render product row
  const renderProductRow = (product: Product) => (
    <tr
      key={`${product.product_id}-${product.variant_id}`}
      className="border-t hover:bg-gray-50"
    >
      <td className="p-3">
        <div className="font-medium">{product.product_name}</div>
        <div className="text-xs text-gray-500">{product.category_name}</div>
      </td>
      <td className="p-3 text-center">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {product.variant_name}
        </span>
      </td>
      <td className="p-3 text-center text-gray-600">{product.code}</td>
      <td className="p-3 text-center">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            parseFloat(product.stock_qty) > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {product.stock_qty}
        </span>
      </td>
      <td className="p-3 text-center text-green-600 font-medium">
        ৳{product.selling_price}
      </td>
      <td className="p-3 text-center">
        <Button
          size="sm"
          onClick={() => handleSelectProduct(product)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Select
        </Button>
      </td>
    </tr>
  );

  // Render item row
  const renderItemRow = (item: RequisitionItem) => {
    const product = getProductById(item.product_id);
    return (
      <tr key={item.id} className="border-t hover:bg-gray-50">
        <td className="p-3">
          {item.product_variant_id ? (
            <div>
              <div className="font-medium">{item.display_name}</div>
              <div className="text-sm text-gray-500">Code: {product?.code}</div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditItemProduct(item.id)}
              className="w-full justify-start"
            >
              <Plus size={14} className="mr-2" />
              Select Product
            </Button>
          )}
        </td>
        <td className="p-3 text-center">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {item.variant_name || "N/A"}
          </span>
        </td>
        <td className="p-3 text-center">
          <input
            type="number"
            value={item.requested_qty}
            onChange={(e) =>
              updateItem(item.id, "requested_qty", Number(e.target.value))
            }
            className="border w-20 text-center rounded px-2 py-1"
            min="1"
            disabled={!!form.id}
          />
        </td>
        <td className="p-3 text-center">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              product && parseFloat(product.stock_qty) >= item.requested_qty
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product ? product.stock_qty : "0"}
          </span>
        </td>
        <td className="p-3 text-center">
          <div className="flex justify-center gap-1">
            {!item.product_variant_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditItemProduct(item.id)}
              >
                <Pen size={14} />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveItem(item.id)}
              disabled={!!form.id}
            >
              <Trash size={14} />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

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
        showColumns={[
          "code",
          "from_branch",
          "to_branch",
          "requisition_date",
          "status",
        ]}
        actions={[
          {
            label: <Eye size={16} />,
            onClick: (row: Requisition) =>
              router(`/procurement/requisition-view/${row.id}`),
          },
          {
            label: <Check size={16} />,
            onClick: (row: Requisition) => handleApprove(row),
          },
          {
            label: <Pen size={16} />,
            onClick: (row: Requisition) => handleOpen(row),
          },
          {
            label: <Trash size={16} />,
            onClick: (row: Requisition) => handleDelete(row),
          },
        ]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-4xl bg-gray-50 max-h-[90vh] overflow-y-auto">
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

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Items</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={!!form.id}
                >
                  + Add Item
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-center">Variant</th>
                      <th className="p-3 text-center">Requested Qty</th>
                      <th className="p-3 text-center">Stock</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center p-6 text-gray-500"
                        >
                          No items added yet. Click "Add Item" to start.
                        </td>
                      </tr>
                    ) : (
                      form.items.map(renderItemRow)
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation */}
            {form.items.some((item) => item.product_variant_id === 0) && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
                ⚠️ Please select products for all items before saving.
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
                  form.items.length === 0 ||
                  form.items.some((item) => item.product_variant_id === 0) ||
                  !form.from_branch_id ||
                  !form.to_branch_id ||
                  form.from_branch_id === form.to_branch_id
                }
              >
                {loading ? "Saving..." : form.id ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Selection Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="!max-w-3xl bg-white max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Product</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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

            {/* Product List */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-center">Variant</th>
                      <th className="p-3 text-center">Code</th>
                      <th className="p-3 text-center">Stock</th>
                      <th className="p-3 text-center">Price</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center p-6 text-gray-500"
                        >
                          No products found
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(renderProductRow)
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
