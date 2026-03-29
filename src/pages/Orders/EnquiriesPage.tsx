"use client";

import { Eye, Trash, Phone, MessageCircle } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { apiClient } from "@/hook/apiClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type EnquiryStatus = "pending" | "read" | "replied" | "closed";

type ProductInfo = {
  id: number;
  name: string;
  code: string;
  slug: string;
  selling_price: string | number;
  regular_price: string | number;
  image: string | null;
  sku: string;
  category?: { id: number; name: string; slug: string } | null;
};

type Enquiry = {
  id: number;
  product_id: number;
  productName: string;
  product_sku: string;
  name: string;
  phone: string;
  email: string | null;
  quantity: number;
  message: string;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
  product: ProductInfo;
};

type Pagination = {
  currentPage: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  read: "bg-blue-100 text-blue-800",
  replied: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

function EnquiryDetailModal({
  enquiry,
  onClose,
  onStatusChange,
}: {
  enquiry: Enquiry | null;
  onClose: () => void;
  onStatusChange: (id: number, status: EnquiryStatus) => void;
}) {
  if (!enquiry) return null;

  const whatsappUrl = `https://wa.me/${enquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hi ${enquiry.name}, regarding your enquiry about "${enquiry.productName}" (SKU: ${enquiry.product_sku || enquiry.product?.sku || ""})`,
  )}`;

  return (
    <Dialog open={!!enquiry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>Enquiry #{enquiry.id}</span>
            <StatusBadge status={enquiry.status} />
          </DialogTitle>
          <DialogDescription>
            Received {new Date(enquiry.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Product */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            {enquiry.product?.image && (
              <img
                src={enquiry.product.image}
                alt={enquiry.productName}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                Product
              </p>
              <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                {enquiry.productName}
              </p>

              {enquiry.product?.selling_price && (
                <p className="text-sm font-bold text-primary mt-0.5">
                  ৳{Number(enquiry.product.selling_price).toLocaleString()}
                </p>
              )}
              {enquiry.product?.category && (
                <p className="text-xs text-gray-400">
                  {enquiry.product.category.name}
                </p>
              )}
            </div>
          </div>

          {/* Customer details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Customer
              </p>
              <p className="font-semibold text-gray-900">{enquiry.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Quantity
              </p>
              <p className="font-semibold text-gray-900">{enquiry.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Phone
              </p>
              <p className="font-semibold text-gray-900">{enquiry.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Email
              </p>
              <p className="font-semibold text-gray-900">
                {enquiry.email || "—"}
              </p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Message
            </p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100 whitespace-pre-wrap">
              {enquiry.message}
            </p>
          </div>

          {/* Status update */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Update Status
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                ["pending", "read", "replied", "closed"] as EnquiryStatus[]
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(enquiry.id, s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
                    enquiry.status === s
                      ? `${STATUS_STYLES[s]} border-transparent`
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Contact actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <a
              href={`tel:${enquiry.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EnquiriesPage() {
  const [loader, setLoading] = useState(false);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-product-enquiries`,
        {
          method: "POST",
          data: {
            page,
            limit: 10,
          },
          tokenType: "jwt",
        },
      );
      setEnquiries(data.data.enquiries || []);
      setPagination(
        data.data.pagination || {
          currentPage: page,
          limit: 10,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteEnquiry = async (e: Enquiry) => {
    if (!confirm(`Delete enquiry from "${e.name}"?`)) return;
    try {
      setLoading(true);
      const result = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/delete-product-enquiries`,
        { method: "POST", data: { id: e.id }, tokenType: "jwt" },
      );
      toast.success(result.message || "Enquiry deleted");
      if (selected?.id === e.id) setSelected(null);
      const isLastOnPage = enquiries.length === 1 && currentPage > 1;
      if (isLastOnPage) setCurrentPage((p) => p - 1);
      else fetchData(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete enquiry");
    } finally {
      setLoading(false);
    }
  };

  // ── Status update ─────────────────────────────────────────────────────────
  const updateStatus = async (id: number, status: EnquiryStatus) => {
    try {
      await apiClient(
        `${import.meta.env.VITE_SERVER}/product/update-product-enquiry-status`,
        { method: "POST", data: { id, status }, tokenType: "jwt" },
      );
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e)),
      );
      setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // ── Table data ────────────────────────────────────────────────────────────
  const tableData = enquiries.map((e) => ({
    ...e,
    productImage: e.product?.image ?? null,
    productName: e.product.name,
    productSku: e.product?.sku || e.product_sku || "—",
  }));

  return (
    <div className="p-6">
      <Breadcrumbs labelOverrides={{ enquiries: "Product Enquiries" }} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
        <h1 className="text-2xl font-bold text-bw-900">Product Enquiries</h1>
      </div>

      <DataTable
        data={tableData}
        label="Enquiries List"
        selectable
        showColumns={[
          { key: "productImage", label: "Product" },
          { key: "productName", label: "Product Name" },
          { key: "name", label: "Customer" },
          { key: "phone", label: "Phone" },
          { key: "quantity", label: "Qty" },
          { key: "status", label: "Status" },
          { key: "created_at", label: "Date" },
        ]}
        columnFormats={{
          status: (value: EnquiryStatus) => <StatusBadge status={value} />,
          created_at: (value: string) =>
            new Date(value).toLocaleDateString("en-BD", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          productImage: (value: string | null) =>
            value ? (
              <img
                src={value}
                alt="product"
                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                —
              </div>
            ),
        }}
        rowsPerPage={pagination.limit}
        loading={loader}
        pagination
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setCurrentPage}
        printHead={[
          { label: "Product", value: "productName" },
          { label: "Customer", value: "name" },
          { label: "Phone", value: "phone" },
          { label: "Qty", value: "quantity" },
          { label: "Status", value: "status" },
          { label: "Date", value: "created_at" },
        ]}
        actions={[
          {
            label: <Eye size={16} className="inline" />,
            title: "View Details",
            onClick: (row) => setSelected(row as Enquiry),
          },
          {
            label: <Phone size={16} className="inline" />,
            title: "Call",
            onClick: (row) => window.open(`tel:${row.phone}`),
          },
          {
            label: <MessageCircle size={16} className="inline" />,
            title: "WhatsApp",
            onClick: (row) => {
              const url = `https://wa.me/${String(row.phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Hi ${row.name}, regarding your enquiry about "${row.productName}"`,
              )}`;
              window.open(url, "_blank");
            },
          },
          {
            label: <Trash size={16} className="inline" />,
            title: "Delete",
            onClick: (row) => deleteEnquiry(row as Enquiry),
          },
        ]}
      />

      {/* Detail modal */}
      <EnquiryDetailModal
        enquiry={selected}
        onClose={() => setSelected(null)}
        onStatusChange={updateStatus}
      />
    </div>
  );
}
