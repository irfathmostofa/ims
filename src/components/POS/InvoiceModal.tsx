"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { printView } from "../utils/print";
import { useEffect, useState } from "react";

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
  cart: CartItem[];
  total: number;
  paymentMethod: string;
  invoiceNumber: string;
};

export default function InvoiceModal({
  isOpen,
  setIsOpen,
  customerName,
  cart,
  total,
  paymentMethod,
  invoiceNumber,
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

  const handlePrint = () => {
    printView("invoice-content");
  };

  const handleDownload = () => {
    // Implement PDF download functionality here
    alert("PDF download functionality to be implemented");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Invoice Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2">
          <div
            id="invoice-content"
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-bw-900 pb-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-bw-900 mb-1">
                  InventorySys
                </h1>
                <p className="text-bw-600">Point of Sale System</p>
                <div className="mt-3 text-sm text-bw-500">
                  <p>123 Business Street</p>
                  <p>City, State 12345</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: info@inventorysys.com</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-bw-900 mb-2">INVOICE</h2>
                <p className="text-lg font-semibold text-bw-700">
                  {invoiceNumber}
                </p>
                <p className="text-bw-600 text-sm mt-1">Date: {invoiceDate}</p>
              </div>
            </div>

            {/* Customer & Payment Info */}
            <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-bw-50 rounded-lg">
              <div>
                <h3 className="text-sm font-semibold text-bw-500 uppercase mb-2">
                  Bill To
                </h3>
                <p className="font-medium text-bw-900 text-lg">
                  {customerName || "Walk-in Customer"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-bw-500 uppercase mb-2">
                  Payment Details
                </h3>
                <div className="space-y-1">
                  <p className="font-medium text-bw-900 capitalize">
                    Method: {paymentMethod || "Cash"}
                  </p>
                  <p className="font-medium text-bw-900">
                    Status: {total > 0 ? "Paid" : "Due"}
                  </p>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-bw-900 text-white">
                      <th className="text-left py-3 px-4 font-semibold">#</th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Description
                      </th>
                      <th className="text-center py-3 px-4 font-semibold">
                        Qty
                      </th>
                      <th className="text-right py-3 px-4 font-semibold">
                        Unit Price
                      </th>
                      <th className="text-right py-3 px-4 font-semibold">
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
                          className="border-b border-bw-200 hover:bg-bw-50"
                        >
                          <td className="py-3 px-4 text-bw-600">{index + 1}</td>
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className="text-center py-3 px-4">
                            {item.quantity}
                          </td>
                          <td className="text-right py-3 px-4">
                            ৳{item.price}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold">
                            ৳{itemTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-bw-600">Subtotal:</span>
                    <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-bw-600">Discount:</span>
                      <span className="font-medium text-green-600">
                        -৳{discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-bw-600">Tax:</span>
                      <span className="font-medium">৳{tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 border-t-2 border-bw-900 text-lg font-bold">
                    <span>TOTAL:</span>
                    <span className="text-bw-900">
                      ৳{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-bw-200 text-center">
              <p className="text-bw-500 mb-2">Thank you for your business!</p>
              <p className="text-xs text-bw-400">
                This is a computer-generated invoice. No signature required.
              </p>
              <div className="mt-4 text-sm text-bw-500">
                <p>For inquiries, contact: support@inventorysys.com</p>
                <p className="mt-1">Terms: Payment due upon receipt</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button
            variant="default"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
