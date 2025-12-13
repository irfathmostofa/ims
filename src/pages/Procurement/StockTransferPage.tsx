"use client";

import { useState, useEffect } from "react";
import { Search, X, Eye } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/hook/apiClient";
import { useQuickStore } from "@/store/quickStore";
import { formatCurrency, formatDate } from "@/components/utils/formatter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TransferItem {
  id: number;
  product_variant_id: number;
  quantity: number;
  product_name: string;
  variant_name: string;
  product_code: string;
  variant_code: string;
}

interface StockTransfer {
  id: number;
  code: string;
  from_branch_id: number;
  to_branch_id: number;
  from_branch_name: string;
  from_branch_code: string;
  to_branch_name: string;
  to_branch_code: string;
  transfer_date: string;
  type: string;
  reference_id: string;
  status: "PENDING" | "RECEIVED" | "CANCELLED";
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  items: TransferItem[];
  total_items: number;
  total_quantity: number;
}

interface Branch {
  id: number;
  name: string;
}

export default function StockTransferPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] =
    useState<StockTransfer | null>(null);
  const [transferType, setTransferType] = useState<"view" | "edit">("view");
console.log(transferType)
  // Filter state
  const [filters, setFilters] = useState({
    status: "",
    from_branch_id: "",
    to_branch_id: "",
    search: "",
    page: "1",
    limit: "10",
  });

  const { branches, fetchBranches } = useQuickStore();
  const handleOpenView = async (transfer: StockTransfer) => {
    setTransferType("view");
    setSelectedTransfer(transfer);
    setDetailsDialogOpen(true);
  };
  // Fetch transfers
  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/get-transfers`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            ...filters,
            page: parseInt(filters.page),
            limit: parseInt(filters.limit),
          },
        }
      );

      if (response.success) {
        setTransfers(response.data.data || []);
      }
    } catch (err: any) {
      console.error("Fetch transfers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchTransfers();
  }, [fetchBranches]);

  // Fetch transfers when filters change
  useEffect(() => {
    fetchTransfers();
  }, [
    filters.status,
    filters.from_branch_id,
    filters.to_branch_id,
    filters.search,
  ]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: "1", // Reset to first page when filters change
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      from_branch_id: "",
      to_branch_id: "",
      search: "",
      page: "1",
      limit: "10",
    });
  };

  // Format date

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      RECEIVED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          variants[status as keyof typeof variants] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transfer History</h1>
        <p className="text-gray-600 mt-1">View all inventory transfers</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by code or reference..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* From Branch Filter */}
          <div>
            <Label htmlFor="from_branch">From Branch</Label>
            <select
              id="from_branch"
              value={filters.from_branch_id}
              onChange={(e) =>
                handleFilterChange("from_branch_id", e.target.value)
              }
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All From Branches</option>
              {branches.map((branch: Branch) => (
                <option key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* To Branch Filter */}
          <div>
            <Label htmlFor="to_branch">To Branch</Label>
            <select
              id="to_branch"
              value={filters.to_branch_id}
              onChange={(e) =>
                handleFilterChange("to_branch_id", e.target.value)
              }
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All To Branches</option>
              {branches.map((branch: Branch) => (
                <option key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <X size={14} /> Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        data={transfers}
        label="Transfer History"
        loading={loading}
        rowsPerPage={parseInt(filters.limit)}
        showColumns={[
          { key: "code", label: "Code" },
          { key: "from_branch_name", label: "From Branch" },
          { key: "to_branch_name", label: "To Branch" },
          { key: "transfer_date", label: "Transfer Date" },
          { key: "status", label: "Status" },
          { key: "reference_id", label: "Reference" },
        ]}
        columnFormats={{
          transfer_date: (value: string) => formatDate(value),
          status: (value: string) => getStatusBadge(value),
        }}
        printHead={[
          { label: "Code", value: "code" },
          { label: "From Branch", value: "from_branch_name" },
          { label: "To Branch", value: "to_branch_name" },
          { label: "Transfer Date", value: "transfer_date" },

          { label: "Status", value: "status" },
          { label: "Reference", value: "reference_id" },
        ]}
        actions={[
          {
            label: <Eye size={16} />,
            onClick: handleOpenView,
            title: "View Details",
          },
        ]}
      />
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              Transfer Details - {selectedTransfer?.code}
            </DialogTitle>
            <DialogDescription>
              {selectedTransfer && getStatusBadge(selectedTransfer.status)}
            </DialogDescription>
          </DialogHeader>

          {selectedTransfer && (
            <div className="space-y-6">
              {/* Transfer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-500">From Branch</div>
                  <div className="font-semibold">
                    {selectedTransfer.from_branch_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedTransfer.from_branch_code}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-500">To Branch</div>
                  <div className="font-semibold">
                    {selectedTransfer.to_branch_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedTransfer.to_branch_code}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-500">Transfer Date</div>
                  <div className="font-semibold">
                    {formatDate(selectedTransfer.transfer_date)}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-500">Created By</div>
                  <div className="font-semibold">
                    {selectedTransfer.created_by_name || "N/A"}
                  </div>
                </div>

                {selectedTransfer.reference_id && (
                  <div className="p-3 bg-gray-50 rounded-md col-span-2">
                    <div className="text-sm text-gray-500">Reference ID</div>
                    <div className="font-semibold">
                      {selectedTransfer.reference_id}
                    </div>
                  </div>
                )}
              </div>

              {/* Transfer Items */}
              <div>
                <h3 className="font-semibold mb-2">
                  Transfer Items ({selectedTransfer.total_items})
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">
                          Product
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Variant
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Quantity
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Cost Price
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransfer.items.map((item: any, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">
                            <div className="font-medium">
                              {item.product_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.product_code}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>{item.variant_name}</div>
                            <div className="text-sm text-gray-500">
                              {item.variant_code}
                            </div>
                          </td>
                          <td className="p-3 font-bold">{item.quantity}</td>
                          <td className="p-3">
                            {formatCurrency(item.cost_price)}
                          </td>
                          <td className="p-3 font-bold">
                            {formatCurrency(item.total_value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td colSpan={2} className="p-3">
                          Total
                        </td>
                        <td className="p-3">
                          {selectedTransfer.total_quantity}
                        </td>
                        <td className="p-3"></td>
                        <td className="p-3">
                          {formatCurrency(
                            selectedTransfer.items.reduce(
                              (sum, item: any) => sum + item.total_value,
                              0
                            )
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Dates */}
              <div className="text-sm text-gray-500">
                <div>Created: {formatDate(selectedTransfer.created_at)}</div>
                {selectedTransfer.updated_at !==
                  selectedTransfer.created_at && (
                  <div>
                    Last Updated: {formatDate(selectedTransfer.updated_at)}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
