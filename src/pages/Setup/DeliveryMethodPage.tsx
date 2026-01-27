// src/pages/delivery/DeliveryMethodPage.tsx
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

interface DeliveryMethod {
  id: number;
  code: string;
  name: string;
  api_base_url?: string;
  status: string;
  created_by?: number;
  created_at: string;
  [key: string]: any;
}

interface DeliveryMethodFormData {
  name: string;
  api_base_url?: string;
  api_key?: string;
  api_secret?: string;
  auth_token?: string;
  token_expiry?: string;
  status?: string;
}

export default function DeliveryMethodPage() {
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod | null>(
    null,
  );
  const [formData, setFormData] = useState<DeliveryMethodFormData>({
    name: "",
    api_base_url: "",
    api_key: "",
    api_secret: "",
    auth_token: "",
    token_expiry: "",
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

  // Fetch delivery methods
  const fetchDeliveryMethods = async () => {
    setLoading(true);
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/get-delivery-methods`,
        {
          method: "GET",
          tokenType: "jwt",
        },
      );
      setDeliveryMethods(response.data);
    } catch (error: any) {
      toast.error("Failed to fetch delivery methods", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryMethods();
  }, [pagination.page]);

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      api_base_url: "",
      api_key: "",
      api_secret: "",
      auth_token: "",
      token_expiry: "",
      status: "A",
    });
    setIsEditing(false);
    setSelectedMethod(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: DeliveryMethod) => {
    setFormData({
      name: row.name,
      api_base_url: row.api_base_url || "",
      api_key: row.api_key || "",
      api_secret: row.api_secret || "",
      auth_token: row.auth_token || "",
      token_expiry: row.token_expiry || "",
      status: row.status || "A",
    });
    setIsEditing(true);
    setSelectedMethod(row);
    setDialogOpen(true);
  };

  const handleDeleteClick = (row: DeliveryMethod) => {
    setSelectedMethod(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMethod) return;

    try {
      await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/delete-delivery-method`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { id: selectedMethod.id },
        },
      );
      toast.success("Delivery method deleted successfully");
      fetchDeliveryMethods();
      setDeleteDialogOpen(false);
      setSelectedMethod(null);
    } catch (error: any) {
      toast.error("Failed to delete delivery method", {
        description: error.message,
      });
    }
  };

  const handleView = (row: DeliveryMethod) => {
    // Navigate to detail view or open view dialog
    console.log("View delivery method:", row);
    // You can implement a detailed view modal here
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedMethod) {
        // Update existing
        await apiClient(
          `${import.meta.env.VITE_SERVER}/setup/update-delivery-method/${selectedMethod.id}`,
          {
            method: "POST",
            tokenType: "jwt",
            data: formData,
          },
        );
        toast.success("Delivery method updated successfully");
      } else {
        // Create new
        await apiClient(
          `${import.meta.env.VITE_SERVER}/setup/create-delivery-method`,
          {
            method: "POST",
            tokenType: "jwt",
            data: formData,
          },
        );
        toast.success("Delivery method created successfully");
      }
      setDialogOpen(false);
      fetchDeliveryMethods();
    } catch (error: any) {
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} delivery method`,
        {
          description: error.message,
        },
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Methods</h1>
          <p className="text-muted-foreground">
            Manage your delivery methods and their configurations
          </p>
        </div>
        <Button onClick={handleCreate} className="btn-bw-primary">
          Add Delivery Method
        </Button>
      </div>

      <DataTable
        data={deliveryMethods}
        label="Delivery Methods"
        pagination={true}
        page={pagination.page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.limit}
        loading={loading}
        showColumns={["code", "name", "api_base_url", "status", "created_at"]}
        printHead={[
          { label: "Code", value: "code" },
          { label: "Name", value: "name" },
          { label: "API URL", value: "api_base_url" },
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
          status: (val) => (val === "A" ? "Active" : "InActive"),
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-amber-50">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? "Edit Delivery Method"
                : "Create New Delivery Method"}
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
                placeholder="e.g., DHL Express, FedEx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                API Base URL
              </label>
              <input
                type="url"
                className="w-full p-2 border rounded"
                value={formData.api_base_url}
                onChange={(e) =>
                  setFormData({ ...formData, api_base_url: e.target.value })
                }
                placeholder="https://api.dhl.com/v3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  value={formData.api_key}
                  onChange={(e) =>
                    setFormData({ ...formData, api_key: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  API Secret
                </label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  value={formData.api_secret}
                  onChange={(e) =>
                    setFormData({ ...formData, api_secret: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Auth Token
                </label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  value={formData.auth_token}
                  onChange={(e) =>
                    setFormData({ ...formData, auth_token: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Token Expiry
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded"
                  value={formData.token_expiry}
                  onChange={(e) =>
                    setFormData({ ...formData, token_expiry: e.target.value })
                  }
                />
              </div>
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
        <DialogContent className="bg-amber-50 max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete delivery method{" "}
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
