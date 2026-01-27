// src/pages/payment/PaymentMethodPage.tsx
import { useState, useEffect } from "react";
import { Eye, Pen, Trash } from "lucide-react";
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
import { formatDate } from "@/components/utils/formatter";
import { useAuthStore } from "@/store/authStore";

interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  created_by?: number;
  created_at: string;
  [key: string]: any;
}

interface PaymentMethodFormData {
  name: string;
  type: string;
  provider: string;
  status?: string;
}

export default function PaymentMethodPage() {
  const { user } = useAuthStore();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    name: "",
    type: "online",
    provider: "",
    status: "A",
  });
  const [isEditing, setIsEditing] = useState(false);
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_pages: 1,
    total: 0,
  });

  // Payment types and providers
  const paymentTypes = [
    { value: "ONLINE", label: "Online Payment" },
    { value: "CASH", label: "Cash" },
    { value: "CARD", label: "Credit/Debit Card" },
    { value: "BANK", label: "Bank Transfer" },
    { value: "MOBILE", label: "Mobile Money" },
    { value: "COD", label: "Case on Delivery" },
  ];

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/get-payment-methods`,
        {
          method: "GET",
          tokenType: "jwt",
        },
      );
      setPaymentMethods(response.data);
    } catch (error: any) {
      toast.error("Failed to fetch payment methods", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [pagination.page]);

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      type: "online",
      provider: "",
      status: "A",
    });
    setIsEditing(false);
    setSelectedMethod(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: PaymentMethod) => {
    setFormData({
      name: row.name,
      type: row.type,
      provider: row.provider,
      status: row.status || "active",
    });
    setIsEditing(true);
    setSelectedMethod(row);
    setDialogOpen(true);
  };

  const handleDeleteClick = (row: PaymentMethod) => {
    setSelectedMethod(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMethod) return;

    try {
      await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/delete-payment-method`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { id: selectedMethod.id },
        },
      );
      toast.success("Payment method deleted successfully");
      fetchPaymentMethods();
      setDeleteDialogOpen(false);
      setSelectedMethod(null);
    } catch (error: any) {
      toast.error("Failed to delete payment method", {
        description: error.message,
      });
    }
  };

  const handleView = (row: PaymentMethod) => {
    // Navigate to detail view or open view dialog
    console.log("View payment method:", row);
    // You can implement a detailed view modal here
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedMethod) {
        // Update existing
        await apiClient(
          `${import.meta.env.VITE_SERVER}/setup/update-payment-method/${selectedMethod.id}`,
          {
            method: "POST",
            tokenType: "jwt",
            data: formData,
          },
        );
        toast.success("Payment method updated successfully");
      } else {
        // Create new - add user ID for created_by
        const dataWithUser = {
          ...formData,
          created_by: user?.id,
        };
        await apiClient(
          `${import.meta.env.VITE_SERVER}/setup/create-payment-method`,
          {
            method: "POST",
            tokenType: "jwt",
            data: dataWithUser,
          },
        );
        toast.success("Payment method created successfully");
      }
      setDialogOpen(false);
      fetchPaymentMethods();
    } catch (error: any) {
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} payment method`,
        {
          description: error.message,
        },
      );
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string; variant: string }> = {
      active: { label: "Active", variant: "success" },
      inactive: { label: "Inactive", variant: "secondary" },
    };
    const mapped = statusMap[status.toLowerCase()] || {
      label: status,
      variant: "default",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs bg-${mapped.variant}/10 text-${mapped.variant}`}
      >
        {mapped.label}
      </span>
    );
  };

  const formatType = (type: string) => {
    const typeMap: Record<string, string> = {
      online: "Online",
      cash: "Cash",
      card: "Card",
      bank_transfer: "Bank Transfer",
      mobile_money: "Mobile Money",
    };
    return typeMap[type] || type;
  };

  const formatProvider = (provider: string) => {
    const providerMap: Record<string, string> = {
      stripe: "Stripe",
      paypal: "PayPal",
      razorpay: "Razorpay",
      flutterwave: "Flutterwave",
      manual: "Manual",
      custom: "Custom",
    };
    return providerMap[provider] || provider;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your payment methods and providers
          </p>
        </div>
        <Button onClick={handleCreate} className="btn-bw-primary">
          Add Payment Method
        </Button>
      </div>

      <DataTable
        data={paymentMethods}
        label="Payment Methods"
        pagination={true}
        page={pagination.page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.limit}
        loading={loading}
        showColumns={[
          "code",
          "name",
          "type",
          "provider",
          "status",
          "created_at",
        ]}
        printHead={[
          { label: "Code", value: "code" },
          { label: "Name", value: "name" },
          { label: "Type", value: "type" },
          { label: "Provider", value: "provider" },
          { label: "Status", value: "status" },
          { label: "Created At", value: "created_at" },
        ]}
        actions={[
          { label: <Eye size={16} />, onClick: (row) => handleView(row) },
          { label: <Pen size={16} />, onClick: (row) => handleEdit(row) },
          {
            label: <Trash size={16} />,
            onClick: (row) => handleDeleteClick(row),
          },
        ]}
        columnFormats={{
          created_at: (val) => formatDate(val),
          status: (val) => formatStatus(val as string),
          type: (val) => formatType(val as string),
          provider: (val) => formatProvider(val as string),
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-amber-50">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Payment Method" : "Create New Payment Method"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Credit Card, PayPal, M-Pesa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="">Select type</option>
                {paymentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {" "}
                Provider *
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value })
                }
                placeholder="e.g., Stripe, PayPal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="A">Active</option>
                <option value="I">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="btn-bw-primary">
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-amber-50  max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete payment method{" "}
              <span className="font-semibold">{selectedMethod?.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="btn-bw-primary"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
