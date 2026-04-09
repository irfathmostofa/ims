// CouponMgmt.tsx - Fixed to use POST methods everywhere
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/hook/apiClient";
import {
  Eye,
  Plus,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Percent,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/components/utils/formatter";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  applicable_to?: "all" | "specific_categories" | "specific_products";
}

interface CouponFormData {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applicable_to?: "all" | "specific_categories" | "specific_products";
}

export const CouponMgmt = () => {
  const [loader, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processingCouponId, setProcessingCouponId] = useState<number | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    min_purchase_amount: null,
    max_discount_amount: null,
    usage_limit: null,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    is_active: true,
    applicable_to: "all",
  });

  // Fetch coupons - Using POST method
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/coupon/get-all`,
        {
          method: "GET", // Using POST
          tokenType: "jwt",
        },
      );

      if (response.success) {
        const fetchedCoupons = response.data || [];
        setCoupons(fetchedCoupons);
        setFilteredCoupons(fetchedCoupons);
      } else {
        toast.error(response.message || "Failed to fetch coupons");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast.error(err.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  // Create coupon
  const handleCreateCoupon = async () => {
    try {
      setProcessingCouponId(-1);

      // Basic validation
      if (!formData.code.trim()) {
        toast.error("Coupon code is required");
        return;
      }

      if (!formData.description.trim()) {
        toast.error("Description is required");
        return;
      }

      if (formData.discount_value <= 0) {
        toast.error("Discount value must be greater than 0");
        return;
      }

      // Validate dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        toast.error("End date must be after start date");
        return;
      }

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/coupon/create`,
        {
          method: "POST",
          tokenType: "jwt",
          data: formData,
        },
      );

      console.log("Create response:", response);

      if (response.success) {
        toast.success("Coupon created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(response.message || "Failed to create coupon");
      }
    } catch (err: any) {
      console.error("Create error:", err);
      toast.error(err.message || "Failed to create coupon");
    } finally {
      setProcessingCouponId(null);
    }
  };

  // Update coupon - Using POST method
  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      setProcessingCouponId(selectedCoupon.id);

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/coupon/update`,
        {
          method: "POST", // Using POST
          tokenType: "jwt",
          data: {
            id: selectedCoupon.id,
            ...formData,
          },
        },
      );

      console.log("Update response:", response);

      if (response.success) {
        toast.success("Coupon updated successfully!");
        setShowEditModal(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(response.message || "Failed to update coupon");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update coupon");
    } finally {
      setProcessingCouponId(null);
    }
  };

  // Delete coupon - Using POST method
  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      setProcessingCouponId(selectedCoupon.id);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/coupon/delete`,
        {
          method: "POST", // Using POST
          tokenType: "jwt",
          data: { id: selectedCoupon.id },
        },
      );

      console.log("Delete response:", response);

      if (response.success) {
        toast.success(response.message || "Coupon deleted successfully!");
        setShowDeleteModal(false);
        setSelectedCoupon(null);
        fetchCoupons();
      } else {
        toast.error(response.message || "Failed to delete coupon");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete coupon");
    } finally {
      setProcessingCouponId(null);
    }
  };

  // Search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredCoupons(coupons);
      return;
    }

    const filtered = coupons.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(term.toLowerCase()) ||
        coupon.description.toLowerCase().includes(term.toLowerCase()),
    );
    setFilteredCoupons(filtered);
  };

  // Tab filtering
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    if (tab === "ALL") {
      setFilteredCoupons(coupons);
      return;
    }

    const now = new Date();
    const filtered = coupons.filter((coupon) => {
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);

      switch (tab) {
        case "ACTIVE":
          return coupon.is_active && now >= startDate && now <= endDate;
        case "INACTIVE":
          return !coupon.is_active;
        case "EXPIRED":
          return now > endDate;
        case "UPCOMING":
          return now < startDate;
        default:
          return true;
      }
    });

    setFilteredCoupons(filtered);
  };

  // Get status count
  const getStatusCount = (status: string) => {
    switch (status) {
      case "ALL":
        return coupons.length;
      case "ACTIVE":
        return coupons.filter(
          (c) =>
            c.is_active &&
            new Date() >= new Date(c.start_date) &&
            new Date() <= new Date(c.end_date),
        ).length;
      case "INACTIVE":
        return coupons.filter((c) => !c.is_active).length;
      case "EXPIRED":
        return coupons.filter((c) => new Date() > new Date(c.end_date)).length;
      case "UPCOMING":
        return coupons.filter((c) => new Date() < new Date(c.start_date))
          .length;
      default:
        return 0;
    }
  };

  // Copy coupon code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard!");
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      min_purchase_amount: null,
      max_discount_amount: null,
      usage_limit: null,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      is_active: true,
      applicable_to: "all",
    });
  };

  // Open edit modal
  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase_amount: coupon.min_purchase_amount,
      max_discount_amount: coupon.max_discount_amount,
      usage_limit: coupon.usage_limit,
      start_date: coupon.start_date.split("T")[0],
      end_date: coupon.end_date.split("T")[0],
      is_active: coupon.is_active,
      applicable_to: coupon.applicable_to || "all",
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowDeleteModal(true);
  };

  // Open quick view
  const openQuickView = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowQuickView(true);
  };

  // Generate random coupon code
  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "None";
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Get coupon status badge
  const getCouponStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);

    if (!coupon) {
      return (
        <Badge variant="default" className="text-xs">
          <XCircle size={12} className="mr-1" />
          Inactive
        </Badge>
      );
    }

    if (now < startDate) {
      return (
        <Badge variant="secondary" className="text-xs">
          <Calendar size={12} className="mr-1" />
          Upcoming
        </Badge>
      );
    }

    if (now > endDate) {
      return (
        <Badge variant="outline" className="text-xs">
          <Clock size={12} className="mr-1" />
          Expired
        </Badge>
      );
    }

    return (
      <Badge variant="success" className="text-xs">
        <CheckCircle size={12} className="mr-1" />
        Active
      </Badge>
    );
  };

  // Get discount display
  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}%`;
    }
    return formatCurrency(coupon.discount_value);
  };

  // Table actions
  const tableActions = [
    {
      label: <Eye size={16} />,
      className: "text-blue-600 hover:text-blue-800",
      title: "Quick View",
      onClick: (row: Coupon) => openQuickView(row),
    },
    {
      label: <Edit size={16} />,
      className: "text-yellow-600 hover:text-yellow-800",
      title: "Edit Coupon",
      onClick: (row: Coupon) => openEditModal(row),
    },
    {
      label: <Trash2 size={16} />,
      className: "text-red-600 hover:text-red-800",
      title: "Delete Coupon",
      onClick: (row: Coupon) => openDeleteModal(row),
    },
    {
      label: <Copy size={16} />,
      className: "text-purple-600 hover:text-purple-800",
      title: "Copy Code",
      onClick: (row: Coupon) => handleCopyCode(row.code),
    },
  ];

  // Fetch coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="p-6">
      <Breadcrumbs
        labelOverrides={{
          coupons: "Coupons",
          management: "Coupon Management",
        }}
      />

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Coupon Management</h1>
            <p className="text-gray-600">Create and manage discount coupons</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 btn-bw-primary"
            >
              <Plus size={16} />
              Create Coupon
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", "ACTIVE", "INACTIVE", "EXPIRED", "UPCOMING"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => handleTabChange(tab)}
              className={`text-sm  ${
                activeTab === tab ? "btn-bw-primary" : ""
              }`}
            >
              {tab}
              <span className="ml-2 bg-gray-50 text-gray-800 text-xs px-2 py-1 rounded-full">
                {getStatusCount(tab)}
              </span>
            </Button>
          ))}
        </div>

        {/* Coupons Table */}
        <DataTable<Coupon>
          data={filteredCoupons}
          label="Coupon List"
          rowsPerPage={10}
          loading={loader}
          showColumns={[
            { key: "code", label: "Coupon Code" },
            { key: "description", label: "Description" },
            { key: "discount_type", label: "Discount Type" },
            { key: "discount_value", label: "Discount Value" },
            { key: "usage_count", label: "Usage" },
            { key: "start_date", label: "Start Date" },
            { key: "end_date", label: "End Date" },
            { key: "is_active", label: "Status" },
          ]}
          columnFormats={{
            discount_type: (val: string) => (
              <Badge variant={val === "percentage" ? "secondary" : "default"}>
                {val === "percentage" ? (
                  <Percent size={12} className="mr-1" />
                ) : (
                  <Tag size={12} className="mr-1" />
                )}
                {val === "percentage" ? "Percentage" : "Fixed Amount"}
              </Badge>
            ),
            discount_value: (val: number, row: Coupon) => (
              <span className="font-semibold">
                {row.discount_type === "percentage"
                  ? `${val}%`
                  : formatCurrency(val)}
              </span>
            ),
            usage_count: (val: number, row: Coupon) => (
              <div>
                <span className="font-medium">{val}</span>
                {row.usage_limit && (
                  <span className="text-xs text-gray-500 ml-1">
                    / {row.usage_limit}
                  </span>
                )}
              </div>
            ),
            start_date: (val: string) => formatDate(val),
            end_date: (val: string) => formatDate(val),
            is_active: (row: Coupon) => getCouponStatusBadge(row),
            code: (val: string) => (
              <div className="font-mono font-bold text-blue-600">{val}</div>
            ),
          }}
          printHead={[
            { label: "Coupon Code", value: "code" },
            { label: "Description", value: "description" },
            { label: "Discount Type", value: "discount_type" },
            { label: "Discount Value", value: "discount_value" },
            { label: "Usage", value: "usage_count" },
            { label: "Start Date", value: "start_date" },
            { label: "End Date", value: "end_date" },
            { label: "Status", value: "is_active" },
          ]}
          actions={tableActions}
        />
      </div>

      {/* Create Coupon Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg bg-amber-50">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
          </DialogHeader>
          <CouponForm
            formData={formData}
            setFormData={setFormData}
            onGenerateCode={generateCouponCode}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={processingCouponId === -1}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCoupon}
              disabled={processingCouponId === -1}
            >
              {processingCouponId === -1 ? "Creating..." : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg bg-amber-50">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          <CouponForm
            formData={formData}
            setFormData={setFormData}
            onGenerateCode={generateCouponCode}
            isEditMode={true}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={!!processingCouponId}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCoupon}
              disabled={!!processingCouponId}
            >
              {processingCouponId ? "Updating..." : "Update Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md bg-amber-50">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete coupon{" "}
              <span className="font-bold">{selectedCoupon?.code}</span>? This
              action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={!!processingCouponId}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDeleteCoupon}
              disabled={!!processingCouponId}
            >
              {processingCouponId ? "Deleting..." : "Delete Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick View Modal */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="sm:max-w-lg bg-amber-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag size={20} />
              Coupon Details: {selectedCoupon?.code}
            </DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">
                    Coupon Code
                  </Label>
                  <div className="font-mono font-bold text-lg">
                    {selectedCoupon.code}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <div>{getCouponStatusBadge(selectedCoupon)}</div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">
                  Description
                </Label>
                <p>{selectedCoupon.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">
                    Discount Type
                  </Label>
                  <div>
                    {selectedCoupon.discount_type === "percentage"
                      ? "Percentage"
                      : "Fixed Amount"}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">
                    Discount Value
                  </Label>
                  <div className="font-semibold">
                    {getDiscountDisplay(selectedCoupon)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">
                    Min Purchase
                  </Label>
                  <div>
                    {formatCurrency(selectedCoupon.min_purchase_amount)}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">
                    Max Discount
                  </Label>
                  <div>
                    {formatCurrency(selectedCoupon.max_discount_amount)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">
                    Usage Limit
                  </Label>
                  <div>{selectedCoupon.usage_limit || "Unlimited"}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">
                    Used / Remaining
                  </Label>
                  <div>
                    {selectedCoupon.usage_count} /{" "}
                    {selectedCoupon.usage_limit
                      ? selectedCoupon.usage_limit - selectedCoupon.usage_count
                      : "∞"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">
                    Start Date
                  </Label>
                  <div>{formatDate(selectedCoupon.start_date)}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">
                    End Date
                  </Label>
                  <div>{formatDate(selectedCoupon.end_date)}</div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">
                  Created
                </Label>
                <div>{formatDate(selectedCoupon.created_at)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickView(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedCoupon) {
                  setShowQuickView(false);
                  handleCopyCode(selectedCoupon.code);
                }
              }}
              className="flex items-center gap-2"
            >
              <Copy size={16} />
              Copy Code
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedCoupon) {
                  setShowQuickView(false);
                  openEditModal(selectedCoupon);
                }
              }}
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Coupon Form Component
interface CouponFormProps {
  formData: CouponFormData;
  setFormData: (data: CouponFormData) => void;
  onGenerateCode: () => void;
  isEditMode?: boolean;
}

const CouponForm = ({
  formData,
  setFormData,
  onGenerateCode,
  isEditMode = false,
}: CouponFormProps) => {
  const handleChange = (
    field: keyof CouponFormData,
    value: string | number | boolean | null,
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Code */}
      <div className="space-y-2">
        <Label htmlFor="code">Coupon Code *</Label>
        <div className="flex gap-2">
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleChange("code", e.target.value)}
            placeholder="e.g., SUMMER2024"
            required
            className="flex-1"
          />
          {!isEditMode && (
            <Button type="button" variant="outline" onClick={onGenerateCode}>
              Generate
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="e.g., Summer sale discount"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Discount Type */}
        <div className="space-y-2">
          <Label htmlFor="discount_type">Discount Type *</Label>
          <Select
            value={formData.discount_type}
            onValueChange={(value: "percentage" | "fixed") =>
              handleChange("discount_type", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discount Value */}
        <div className="space-y-2">
          <Label htmlFor="discount_value">
            {formData.discount_type === "percentage"
              ? "Discount Percentage *"
              : "Discount Amount *"}
          </Label>
          <Input
            id="discount_value"
            type="number"
            min="0"
            step={formData.discount_type === "percentage" ? "0.1" : "1"}
            value={formData.discount_value}
            onChange={(e) =>
              handleChange("discount_value", parseFloat(e.target.value) || 0)
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Min Purchase Amount */}
        <div className="space-y-2">
          <Label htmlFor="min_purchase_amount">
            Minimum Purchase Amount (Optional)
          </Label>
          <Input
            id="min_purchase_amount"
            type="number"
            min="0"
            step="1"
            value={formData.min_purchase_amount || ""}
            onChange={(e) =>
              handleChange(
                "min_purchase_amount",
                e.target.value ? parseFloat(e.target.value) : null,
              )
            }
            placeholder="No minimum"
          />
        </div>

        {/* Max Discount Amount (for percentage only) */}
        {formData.discount_type === "percentage" && (
          <div className="space-y-2">
            <Label htmlFor="max_discount_amount">
              Maximum Discount Amount (Optional)
            </Label>
            <Input
              id="max_discount_amount"
              type="number"
              min="0"
              step="1"
              value={formData.max_discount_amount || ""}
              onChange={(e) =>
                handleChange(
                  "max_discount_amount",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              placeholder="No maximum"
            />
          </div>
        )}
      </div>

      {/* Usage Limit */}
      <div className="space-y-2">
        <Label htmlFor="usage_limit">Usage Limit (Optional)</Label>
        <Input
          id="usage_limit"
          type="number"
          min="1"
          step="1"
          value={formData.usage_limit || ""}
          onChange={(e) =>
            handleChange(
              "usage_limit",
              e.target.value ? parseInt(e.target.value) : null,
            )
          }
          placeholder="Unlimited"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange("start_date", e.target.value)}
            required
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
            required
            min={formData.start_date}
          />
        </div>
        {/* Applicable To */}
        <div className="space-y-2">
          <Label htmlFor="applicable_to">Applicable To</Label>
          <Select
            value={formData.applicable_to}
            onValueChange={(
              value: "all" | "specific_categories" | "specific_products",
            ) => handleChange("applicable_to", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select applicable scope" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="specific_categories">
                Specific Categories
              </SelectItem>
              <SelectItem value="specific_products">
                Specific Products
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Status */}
        <div className="space-y-2">
          <Label htmlFor="is_active">Active Status</Label>
          <Select
            value={formData.is_active ? "active" : "inactive"}
            onValueChange={(value) =>
              handleChange("is_active", value === "active")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
