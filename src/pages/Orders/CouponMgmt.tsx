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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type JSX } from "react";
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

type CouponStatus = "ALL" | "ACTIVE" | "INACTIVE" | "EXPIRED" | "UPCOMING";

interface StatusConfig {
  color: string;
  icon: LucideIcon;
  label: string;
  tabColor: string;
  countColor: string;
  activeTabColor: string;
}

const statusConfigs: Record<CouponStatus, StatusConfig> = {
  ALL: {
    color: "bg-gray-100 text-gray-800",
    icon: Tag,
    label: "All Coupons",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-gray-100 text-gray-800",
    activeTabColor: "bg-black text-white border-black",
  },
  ACTIVE: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Active",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-green-100 text-green-800",
    activeTabColor: "bg-black text-white border-black",
  },
  INACTIVE: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    label: "Inactive",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-red-100 text-red-800",
    activeTabColor: "bg-black text-white border-black",
  },
  EXPIRED: {
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
    label: "Expired",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-gray-100 text-gray-800",
    activeTabColor: "bg-black text-white border-black",
  },
  UPCOMING: {
    color: "bg-blue-100 text-blue-800",
    icon: Calendar,
    label: "Upcoming",
    tabColor: "text-gray-700 hover:text-black",
    countColor: "bg-blue-100 text-blue-800",
    activeTabColor: "bg-black text-white border-black",
  },
};

interface StatusCounts {
  ALL: number;
  ACTIVE: number;
  INACTIVE: number;
  EXPIRED: number;
  UPCOMING: number;
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
    null
  );

  const [activeTab, setActiveTab] = useState<CouponStatus>("ALL");
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    ALL: 0,
    ACTIVE: 0,
    INACTIVE: 0,
    EXPIRED: 0,
    UPCOMING: 0,
  });

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

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/coupon/get-all`,
        {
          method: "GET",
          tokenType: "jwt",
        }
      );

      if (response.success) {
        const fetchedCoupons = response.data || [];
        setCoupons(fetchedCoupons);
        setFilteredCoupons(fetchedCoupons);
        calculateStatusCounts(fetchedCoupons);
      } else {
        toast.error(response.message || "Failed to fetch coupons");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  // Calculate status counts
  const calculateStatusCounts = (couponsList: Coupon[]) => {
    const counts: StatusCounts = {
      ALL: couponsList.length,
      ACTIVE: 0,
      INACTIVE: 0,
      EXPIRED: 0,
      UPCOMING: 0,
    };

    const now = new Date();

    couponsList.forEach((coupon) => {
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);

      if (!coupon.is_active) {
        counts.INACTIVE++;
      } else if (now < startDate) {
        counts.UPCOMING++;
      } else if (now > endDate) {
        counts.EXPIRED++;
      } else {
        counts.ACTIVE++;
      }
    });

    setStatusCounts(counts);
  };

  // Filter coupons based on active tab
  const filterCouponsByStatus = (status: CouponStatus) => {
    if (status === "ALL") {
      setFilteredCoupons(coupons);
      return;
    }

    const now = new Date();
    const filtered = coupons.filter((coupon) => {
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);

      switch (status) {
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

  // Handle tab change
  const handleTabChange = (tab: CouponStatus) => {
    setActiveTab(tab);
    filterCouponsByStatus(tab);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      filterCouponsByStatus(activeTab);
      return;
    }

    const filtered = filteredCoupons.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(term.toLowerCase()) ||
        coupon.description.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCoupons(filtered);
  };

  // Create coupon
  const handleCreateCoupon = async () => {
    try {
      setProcessingCouponId(-1); // Use -1 for create operation
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/coupon/create`,
        {
          method: "POST",
          tokenType: "jwt",
          data: formData,
        }
      );

      if (response.success) {
        toast.success("Coupon created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(response.message || "Failed to create coupon");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create coupon");
    } finally {
      setProcessingCouponId(null);
    }
  };

  // Update coupon
  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      setProcessingCouponId(selectedCoupon.id);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/coupon/update/${selectedCoupon.id}`,
        {
          method: "PUT",
          tokenType: "jwt",
          data: formData,
        }
      );

      if (response.success) {
        toast.success("Coupon updated successfully!");
        setShowEditModal(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(response.message || "Failed to update coupon");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update coupon");
    } finally {
      setProcessingCouponId(null);
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      setProcessingCouponId(selectedCoupon.id);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/coupon/delete/${selectedCoupon.id}`,
        {
          method: "DELETE",
          tokenType: "jwt",
        }
      );

      if (response.success) {
        toast.success("Coupon deleted successfully!");
        setShowDeleteModal(false);
        setSelectedCoupon(null);
        fetchCoupons();
      } else {
        toast.error(response.message || "Failed to delete coupon");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete coupon");
    } finally {
      setProcessingCouponId(null);
    }
  };

  // Toggle coupon status
  const handleToggleStatus = async (
    couponId: number,
    currentStatus: boolean
  ) => {
    try {
      setProcessingCouponId(couponId);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/coupon/toggle-status/${couponId}`,
        {
          method: "PUT",
          tokenType: "jwt",
          data: { is_active: !currentStatus },
        }
      );

      if (response.success) {
        toast.success(
          `Coupon ${!currentStatus ? "activated" : "deactivated"} successfully!`
        );
        fetchCoupons();
      } else {
        toast.error(response.message || "Failed to update coupon status");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update coupon status");
    } finally {
      setProcessingCouponId(null);
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

    if (!coupon.is_active) {
      return (
        <Badge variant="destructive" className="text-xs">
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

  // Status tab trigger component
  const StatusTabTrigger = ({
    status,
    config,
    count,
    isActive,
    onClick,
  }: {
    status: CouponStatus;
    config: StatusConfig;
    count: number;
    isActive: boolean;
    onClick: () => void;
  }) => {
    const Icon = config.icon;

    return (
      <button
        type="button"
        className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 ${
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
      </button>
    );
  };

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
          <Button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Create Coupon
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.ALL}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.ACTIVE}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.INACTIVE}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statusCounts.UPCOMING}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {statusCounts.EXPIRED}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <Input
                  placeholder="Search coupons by code or description..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(statusConfigs) as CouponStatus[]).map(
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
              </div>
            </div>
          </CardContent>
        </Card>

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
            is_active: (val: boolean, row: Coupon) => getCouponStatusBadge(row),
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
        <DialogContent className="sm:max-w-lg">
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
              Create Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg">
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
              Update Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
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
              variant="destructive"
              onClick={handleDeleteCoupon}
              disabled={!!processingCouponId}
            >
              Delete Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick View Modal */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="sm:max-w-lg">
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
    value: string | number | boolean | null
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
                e.target.value ? parseFloat(e.target.value) : null
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
                  e.target.value ? parseFloat(e.target.value) : null
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
              e.target.value ? parseInt(e.target.value) : null
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
      </div>

      {/* Applicable To */}
      <div className="space-y-2">
        <Label htmlFor="applicable_to">Applicable To</Label>
        <Select
          value={formData.applicable_to}
          onValueChange={(
            value: "all" | "specific_categories" | "specific_products"
          ) => handleChange("applicable_to", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select applicable scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="specific_categories">
              Specific Categories
            </SelectItem>
            <SelectItem value="specific_products">Specific Products</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">Active Status</Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleChange("is_active", checked)}
        />
      </div>
    </div>
  );
};
