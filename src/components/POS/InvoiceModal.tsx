"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { printView } from "../utils/print";
import { useEffect, useState } from "react";
import { convertNumberToWords } from "../utils/formatter";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type InvoiceModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  cart: CartItem[];
  total: number;
  paymentMethod: string;
  paymentType: string;
  paidAmount: number;
  invoiceNumber: string;
  handleClear: () => void;
};

export default function InvoiceModal({
  isOpen,
  setIsOpen,
  customerName,
  customerPhone,
  customerAddress,
  cart,
  total,
  paymentMethod,
  paymentType,
  paidAmount,
  invoiceNumber,
  handleClear,
}: InvoiceModalProps) {
  const [invoiceDate, setInvoiceDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setInvoiceDate(
        now.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
  }, [isOpen]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = 0; // Add tax calculation if needed
  const discount = 0; // Add discount if needed
  const finalTotal = subtotal + tax - discount;

  // Calculate actual payment status
  const getPaymentStatus = () => {
    if (paymentType === "paid" && paidAmount >= total) {
      return { status: "PAID", color: "bg-green-100 text-green-800" };
    } else if (paymentType === "partial" && paidAmount > 0) {
      return { status: "PARTIAL", color: "bg-amber-100 text-amber-800" };
    } else if (paymentType === "due") {
      return { status: "DUE", color: "bg-red-100 text-red-800" };
    } else {
      return { status: "UNKNOWN", color: "bg-gray-100 text-gray-800" };
    }
  };

  const paymentStatus = getPaymentStatus();

  // Format phone number
  const formatPhoneNumber = (phone: string) => {
    if (!phone || phone.trim() === "") return "Not Provided";
    return phone;
  };

  // Get customer type based on name
  const getCustomerType = () => {
    if (!customerName || customerName.trim() === "") return "Walk-in Customer";
    return "Registered Customer";
  };

  const handlePrint = () => {
    printView("invoice-content");
  };

  const handleDownload = () => {
    // Implement PDF download functionality here
    alert("PDF download functionality to be implemented");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white border-0 shadow-2xl">
        {/* Custom header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-bw-200 bg-bw-900">
          <DialogHeader className="p-0">
            <DialogTitle className="text-xl font-bold text-white">
              Invoice Receipt
            </DialogTitle>
          </DialogHeader>
          <button
            onClick={() => {
              handleClear();
              setIsOpen(false);
            }}
            className="p-1.5 rounded-md hover:bg-bw-700 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable content area with hidden scrollbar */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-6 md:p-8">
            <div
              id="invoice-content"
              className="bg-white p-6 md:p-8 rounded-lg border border-bw-200 shadow-sm"
            >
              {/* Header - Company Info */}
              <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-bw-800 pb-6 mb-8">
                <div className="mb-6 md:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-bw-900 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">IS</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-bw-900">
                        InventorySys
                      </h1>
                      <p className="text-bw-600 text-sm">
                        Professional POS Solution
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-bw-600">
                    <p>123 Business Avenue, Suite 100</p>
                    <p>Dhaka 1200, Bangladesh</p>
                    <p>Phone: +880 1234-567890</p>
                    <p>Email: sales@inventorysys.com</p>
                    <p>VAT Reg: 123456789</p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <div className="mb-4">
                    <h2 className="text-3xl font-bold text-bw-900 mb-2">
                      TAX INVOICE
                    </h2>
                    <div className="inline-block bg-bw-900 text-white px-4 py-1.5 rounded-md">
                      <p className="text-lg font-semibold">{invoiceNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-bw-600">
                      <span className="font-medium">Date:</span> {invoiceDate}
                    </p>
                    <p className="text-bw-600">
                      <span className="font-medium">Time:</span>{" "}
                      {new Date().toLocaleTimeString("en-US", { hour12: true })}
                    </p>
                    <p className="text-bw-600">
                      <span className="font-medium">Branch:</span> Main Store
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-5 bg-gradient-to-r from-bw-50 to-bw-100 rounded-lg border border-bw-200">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-5 bg-bw-900 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-bw-700 uppercase tracking-wider">
                      Billed To
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg text-bw-900">
                      {customerName || "Walk-in Customer"}
                    </p>
                    <div className="text-sm text-bw-600 space-y-1">
                      <p>Type: {getCustomerType()}</p>
                      <p>Phone: {formatPhoneNumber(customerPhone)}</p>
                      {customerAddress && (
                        <p className="truncate" title={customerAddress}>
                          Address: {customerAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-5 bg-bw-900 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-bw-700 uppercase tracking-wider">
                      Payment Details
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-bw-600">Method:</span>
                      <span className="font-semibold text-bw-900 capitalize">
                        {paymentMethod || "Cash"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-bw-600">Type:</span>
                      <span className="font-medium capitalize">
                        {paymentType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-bw-600">Paid Amount:</span>
                      <span className="font-semibold">
                        ৳{paidAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-bw-600">Status:</span>
                      <span
                        className={`font-semibold px-3 py-1 rounded-full text-sm ${paymentStatus.color}`}
                      >
                        {paymentStatus.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-8 overflow-hidden rounded-lg border border-bw-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-bw-900 text-white">
                        <th className="text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider">
                          #
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider">
                          Product Description
                        </th>
                        <th className="text-center py-4 px-6 font-semibold text-sm uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="text-right py-4 px-6 font-semibold text-sm uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="text-right py-4 px-6 font-semibold text-sm uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => {
                        const itemTotal = item.price * item.quantity;
                        return (
                          <tr
                            key={item.id}
                            className={`border-t border-bw-100 ${
                              index % 2 === 0 ? "bg-white" : "bg-bw-50"
                            }`}
                          >
                            <td className="py-3 px-6 text-bw-600 font-medium">
                              {index + 1}
                            </td>
                            <td className="py-3 px-6 font-medium text-bw-800">
                              {item.name}
                            </td>
                            <td className="text-center py-3 px-6">
                              <span className="inline-block bg-bw-100 text-bw-800 px-3 py-1 rounded-md font-medium">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="text-right py-3 px-6 font-medium">
                              ৳{item.price}
                            </td>
                            <td className="text-right py-3 px-6 font-semibold text-bw-900">
                              ৳{itemTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end">
                <div className="w-full md:w-96">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-bw-200">
                      <span className="text-bw-600">Subtotal:</span>
                      <span className="font-medium text-lg">
                        ৳{subtotal.toFixed(2)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-bw-200">
                        <span className="text-bw-600">Discount:</span>
                        <span className="font-medium text-green-600">
                          -৳{discount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {tax > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-bw-200">
                        <span className="text-bw-600">Tax (VAT):</span>
                        <span className="font-medium">৳{tax.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t-2 border-bw-900">
                      <span className="text-xl font-bold text-bw-900">
                        TOTAL AMOUNT
                      </span>
                      <span className="text-2xl font-bold text-bw-900">
                        ৳{finalTotal.toFixed(2)}
                      </span>
                    </div>

                    {paidAmount > 0 && (
                      <>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-bw-600">Amount Paid:</span>
                          <span className="font-medium text-green-600">
                            ৳{paidAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-bw-300 pt-3">
                          <span className="text-bw-600 font-medium">
                            Balance Due:
                          </span>
                          <span className="font-bold text-lg">
                            ৳{(finalTotal - paidAmount).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="text-sm text-bw-500 mt-2 text-right">
                      <p>Amount in words: {convertNumberToWords(finalTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-bw-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                  <div>
                    <h4 className="text-sm font-semibold text-bw-700 mb-2">
                      Customer Copy
                    </h4>
                    <p className="text-xs text-bw-500">
                      Please retain this copy for your records
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-bw-700 mb-2">
                      Terms & Conditions
                    </h4>
                    <p className="text-xs text-bw-500">
                      Goods sold are not returnable
                      <br />
                      Warranty as per manufacturer policy
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-bw-700 mb-2">
                      Authorized Signature
                    </h4>
                    <div className="mt-4 border-t border-bw-300 pt-2">
                      <p className="text-xs text-bw-500">For InventorySys</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-bw-200 text-center">
                  <p className="text-bw-600 mb-1">
                    Thank you for your business!
                  </p>
                  <p className="text-xs text-bw-400">
                    This is a computer-generated invoice. No signature required.
                  </p>
                  <div className="mt-3 text-xs text-bw-500">
                    <p>
                      For any queries, contact: support@inventorysys.com |
                      Hotline: 16457
                    </p>
                    <p className="mt-1">
                      www.inventorysys.com | © {new Date().getFullYear()}{" "}
                      InventorySys. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t border-bw-200 bg-bw-50 gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2 border-bw-300 hover:bg-bw-100"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button
            variant="default"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-bw-900 hover:bg-bw-800"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              handleClear();
              setIsOpen(false);
            }}
            className="bg-white hover:bg-bw-100"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
