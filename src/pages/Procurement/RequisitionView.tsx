import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Package,
  Building,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { printView } from "@/components/utils/print";
import { apiClient } from "@/hook/apiClient";

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
  remarks?: string;
}

interface Requisition {
  id: number;
  code: string;
  from_branch_id: number;
  from_branch_name: string;
  from_branch_code: string;
  to_branch_id: number;
  to_branch_name: string;
  to_branch_code: string;
  requisition_date: string;
  status: string;
  remarks?: string;
  created_by: number;
  created_by_name: string;
  approve_by?: number;
  approved_by_name?: string;
  created_at: string;
  updated_at: string;
  items: RequisitionItem[];
}

export const RequisitionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approvedItems, setApprovedItems] = useState<{ [key: number]: number }>(
    {}
  );

  useEffect(() => {
    fetchRequisitionDetails();
  }, [id]);

  const fetchRequisitionDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/get-all-requisition`,
        {
          method: "GET",
          tokenType: "jwt",
        }
      );

      if (response.success) {
        const requisitions = response.data;
        const foundRequisition = requisitions.find(
          (req: Requisition) => req.id.toString() === id
        );

        if (foundRequisition) {
          setRequisition(foundRequisition);
          const initialApproved: { [key: number]: number } = {};
          foundRequisition.items.forEach((item: any) => {
            initialApproved[item.id] = item.requested_qty;
          });
          setApprovedItems(initialApproved);
        } else {
          throw new Error("Requisition not found");
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch requisition");
      }
    } catch (err: any) {
      console.error("Fetch requisition error:", err);
      alert(err.message || "Failed to fetch requisition details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovedQtyChange = (itemId: number, value: string) => {
    const qty = parseInt(value) || 0;
    const item = requisition?.items.find((item) => item.id === itemId);

    if (item && qty >= 0 && qty <= item.requested_qty) {
      setApprovedItems((prev) => ({
        ...prev,
        [itemId]: qty,
      }));
    }
  };

  const handleApprove = async () => {
    if (!requisition) return;

    setApproving(true);
    try {
      const approvedItemsData = requisition.items
        .filter((item) => approvedItems[item.id] > 0)
        .map((item) => ({
          requisition_item_id: item.id,
          product_variant_id: item.product_variant_id,
          requested_qty: item.requested_qty,
          approved_qty: approvedItems[item.id],
          remarks: "",
        }));

      if (approvedItemsData.length === 0) {
        throw new Error("Please approve at least one item");
      }

      const approveData = {
        id: requisition.id.toString(),
        transfer_date: new Date().toISOString().slice(0, 10),
        approved_items: approvedItemsData,
        remarks: "Approved via system",
      };

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/inventory/approve-requisition`,
        {
          method: "POST",
          tokenType: "jwt",
          data: approveData,
        }
      );

      if (response.data.success) {
        alert("Requisition approved and transferred successfully!");
        await fetchRequisitionDetails();
      } else {
        throw new Error(
          response.data.message || "Failed to approve requisition"
        );
      }
    } catch (err: any) {
      console.error("Approve requisition error:", err);
      alert(err.message || "Failed to approve requisition");
    } finally {
      setApproving(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "APPROVED":
        return {
          color: "text-green-600 bg-green-50 border-green-200",
          icon: CheckCircle,
          label: status === "COMPLETED" ? "Completed" : "Approved",
        };
      case "CANCELLED":
      case "REJECTED":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          icon: XCircle,
          label: status === "CANCELLED" ? "Cancelled" : "Rejected",
        };
      case "PENDING":
        return {
          color: "text-orange-600 bg-orange-50 border-orange-200",
          icon: Clock,
          label: "Pending",
        };
      default:
        return {
          color: "text-gray-600 bg-gray-50 border-gray-200",
          icon: Clock,
          label: status,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateTotalValue = () => {
    if (!requisition) return 0;
    return requisition.items.reduce((total, item) => {
      const price = parseFloat(item.selling_price) || 0;
      return total + item.requested_qty * price;
    }, 0);
  };

  const calculateApprovedValue = () => {
    if (!requisition) return 0;
    return requisition.items.reduce((total, item) => {
      const price = parseFloat(item.selling_price) || 0;
      const approvedQty = approvedItems[item.id] || 0;
      return total + approvedQty * price;
    }, 0);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="w-8 h-8 border-3 border-bw-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 text-md mb-3">Requisition not found</div>
        <Button onClick={() => navigate(-1)} className="btn-bw-primary text-sm">
          <ArrowLeft size={16} className="mr-1" /> Go Back
        </Button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(requisition.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-4 space-y-4 print:p-0 print:bg-white">
      {/* Header */}
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100 h-8 px-3 text-sm"
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Requisition Details
              </h1>
            </div>
          </div>

          <div className="flex gap-2">
            {requisition.status === "PENDING" && (
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white px-4 h-8 text-sm"
                disabled={approving}
              >
                {approving ? "Processing..." : "Approve"}
              </Button>
            )}
            <Button
              className="btn-bw-primary h-8 px-3 text-sm"
              onClick={() => printView("printArea")}
            >
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section
        id="printArea"
        className="bg-white border rounded-lg print:border-none print:shadow-none"
      >
        <div className="p-6 text-sm print:p-4">
          {/* Document Header */}
          <div className="text-center border-b pb-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Requisition Form
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-gray-500 text-xs">
              <span className="flex items-center gap-1">
                <FileText size={12} />
                Doc: {requisition.code}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(requisition.requisition_date)}
              </span>
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${statusConfig.color}`}
              >
                <StatusIcon size={12} />
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="border rounded p-3">
              <p className="text-gray-500 text-xs mb-1">From Branch</p>
              <p className="font-semibold text-sm">
                {requisition.from_branch_name}
              </p>
              <p className="text-gray-400 text-xs">
                {requisition.from_branch_code}
              </p>
            </div>
            <div className="border rounded p-3">
              <p className="text-gray-500 text-xs mb-1">To Branch</p>
              <p className="font-semibold text-sm">
                {requisition.to_branch_name}
              </p>
              <p className="text-gray-400 text-xs">
                {requisition.to_branch_code}
              </p>
            </div>
            <div className="border rounded p-3">
              <p className="text-gray-500 text-xs mb-1">Requested By</p>
              <p className="font-semibold text-sm">
                {requisition.created_by_name}
              </p>
              <p className="text-gray-400 text-xs">
                {formatDate(requisition.created_at)}
              </p>
            </div>
            <div className="border rounded p-3">
              <p className="text-gray-500 text-xs mb-1">Total Value</p>
              <p className="font-semibold text-sm">
                ৳{calculateTotalValue().toFixed(2)}
              </p>
              {requisition.status === "PENDING" && (
                <p className="text-green-600 text-xs">
                  ৳{calculateApprovedValue().toFixed(2)} approved
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-1 text-sm">
              <Package size={16} />
              Items ({requisition.items.length})
            </h3>
            <div className="border rounded overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left font-medium">
                      Product
                    </th>
                    <th className="border p-2 text-center font-medium">
                      Variant
                    </th>
                    <th className="border p-2 text-center font-medium">
                      Price
                    </th>
                    <th className="border p-2 text-center font-medium">
                      Req Qty
                    </th>
                    <th className="border p-2 text-center font-medium">
                      App Qty
                    </th>
                    <th className="border p-2 text-center font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requisition.items.map((item, index) => {
                    const approvedQty = approvedItems[item.id] || 0;
                    const price = parseFloat(item.selling_price) || 0;
                    const lineTotal = approvedQty * price;

                    return (
                      <tr
                        key={item.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border p-2">
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.product_name}
                            </div>
                            <div className="text-gray-400">
                              {item.product_code}
                            </div>
                          </div>
                        </td>
                        <td className="border p-2 text-center">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {item.variant_name}
                          </span>
                        </td>
                        <td className="border p-2 text-center font-mono">
                          ৳{price.toFixed(2)}
                        </td>
                        <td className="border p-2 text-center font-medium">
                          {item.requested_qty}
                        </td>
                        <td className="border p-2 text-center">
                          {requisition.status === "PENDING" ? (
                            <input
                              type="number"
                              min={0}
                              max={item.requested_qty}
                              value={approvedQty}
                              onChange={(e) =>
                                handleApprovedQtyChange(item.id, e.target.value)
                              }
                              className="w-16 border rounded px-1.5 py-0.5 text-center text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-500 print:hidden"
                            />
                          ) : (
                            <span
                              className={`font-medium ${
                                item.approved_qty === item.requested_qty
                                  ? "text-green-600"
                                  : item.approved_qty && item.approved_qty > 0
                                  ? "text-orange-600"
                                  : "text-red-600"
                              }`}
                            >
                              {item.approved_qty ?? "—"}
                            </span>
                          )}
                        </td>
                        <td className="border p-2 text-center font-mono font-medium">
                          ৳{lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td
                      colSpan={5}
                      className="border p-2 text-right font-medium"
                    >
                      Approved Total:
                    </td>
                    <td className="border p-2 text-center font-mono font-bold text-green-600">
                      ৳{calculateApprovedValue().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {requisition.remarks && (
              <div className="md:col-span-3 border-t pt-3">
                <p className="text-gray-500 font-medium mb-1">Remarks</p>
                <p className="text-gray-700">{requisition.remarks}</p>
              </div>
            )}
            <div className="text-center">
              <div className="border-t border-gray-300 mt-6 mb-2"></div>
              <p className="font-medium text-gray-700">Requested By</p>
              <p className="text-gray-500">{requisition.created_by_name}</p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-300 mt-6 mb-2"></div>
              <p className="font-medium text-gray-700">Approved By</p>
              <p className="text-gray-500">
                {requisition.approved_by_name || "—"}
              </p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-300 mt-6 mb-2"></div>
              <p className="font-medium text-gray-700">Received By</p>
              <p className="text-gray-500">—</p>
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-size: 12px;
            }
            th, td {
              border-color: #ddd !important;
              padding: 4px 6px !important;
            }
            .bg-gray-50, .bg-gray-100 {
              background-color: #f9fafb !important;
            }
          }
        `}
      </style>
    </div>
  );
};
