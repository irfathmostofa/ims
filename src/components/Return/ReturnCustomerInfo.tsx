"use client";

import { User, Phone, MapPin, FileText, Calendar } from "lucide-react";

export default function ReturnCustomerInfo({
  customer,
  invoice,
}: {
  customer: any;
  invoice: any;
}) {
  if (!customer && !invoice) return null;
  console.log(customer);
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PARTIAL":
        return "bg-amber-100 text-amber-800";
      case "DUE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border ">
      <h2 className="text-gray-900 font-bold mb-4">
        Invoice & Customer Information
      </h2>
      <div className="space-y-4 ">
        {/* Invoice Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gray-500" />
            <span className="text-sm text-gray-500">Invoice</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Invoice No</div>
              <div className="font-medium text-sm">
                {invoice?.code || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Date</div>
              <div className="font-medium text-sm">
                {formatDate(invoice?.invoice_date || customer?.invoice_date)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div
                className={`font-medium text-xs px-2 py-1 rounded-full inline-block ${getStatusColor(
                  invoice?.status || customer?.status
                )}`}
              >
                {invoice?.status || customer?.status || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Type</div>
              <div className="font-medium text-sm">
                {invoice?.type || customer?.type || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            <span className="text-sm text-gray-500">Customer</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-500">Name</div>
              <div className="font-medium">{customer?.party_name || "N/A"}</div>
            </div>
            {customer?.party_phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-500" />
                <span className="font-medium">{customer.party_phone}</span>
              </div>
            )}
            {customer?.party_address && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-500 mt-0.5" />
                <span className="font-medium text-sm">
                  {customer.party_address}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Amount Information */}
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm text-gray-500">Amounts</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Total Amount</div>
              <div className="font-medium text-green-600">
                ৳
                {parseFloat(
                  customer?.total_amount || invoice?.total_amount || 0
                ).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Paid Amount</div>
              <div className="font-medium text-green-600">
                ৳
                {parseFloat(
                  customer?.paid_amount || invoice?.paid_amount || 0
                ).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Due Amount</div>
              <div className="font-medium text-red-600">
                ৳
                {parseFloat(
                  customer?.due_amount || invoice?.due_amount || 0
                ).toFixed(2)}
              </div>
            </div>
            {customer?.total_returned_amount > 0 && (
              <div>
                <div className="text-xs text-gray-500">Returned Amount</div>
                <div className="font-medium text-blue-600">
                  ৳{parseFloat(customer?.total_returned_amount || 0).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
