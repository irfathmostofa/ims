"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { printView } from "../utils/print";

type CartItem = {
  id: number;
  name: string;
  price: string | number;
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
  paymentMethod,
  invoiceNumber = `INV-${Date.now().toString().slice(-8)}`,
}: InvoiceModalProps) {
  const date = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice =
      typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return sum + itemPrice * item.quantity;
  }, 0);
  const tax = 0; // Add tax calculation if needed
  const discount = 0; // Add discount if needed
  const finalTotal = subtotal + tax - discount;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl w-full bg-white no-print">
          <DialogHeader>
            <DialogTitle className="text-2xl">Invoice Receipt</DialogTitle>
          </DialogHeader>

          <div id="invoice-content" className="mt-4 text-bw-900">
            {/* Header Section */}
            <div className="mb-6 pb-4 border-b-2 border-bw-900">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-bw-900">
                    InventorySys
                  </h2>
                  <p className="text-sm text-bw-600 mt-1">
                    Point of Sale System
                  </p>
                  <p className="text-xs text-bw-500 mt-2">
                    123 Business Street
                    <br />
                    City, State 12345
                    <br />
                    Phone: (555) 123-4567
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{invoiceNumber}</p>
                  <p className="text-sm text-bw-600">{date}</p>
                </div>
              </div>
            </div>

            {/* Customer & Payment Info */}
            <div className="mb-6 grid grid-cols-2 gap-4 p-4 bg-bw-50 rounded-lg">
              <div>
                <p className="text-xs text-bw-500 uppercase font-semibold mb-1">
                  Bill To
                </p>
                <p className="font-medium text-bw-900">
                  {customerName || "Walk-in Customer"}
                </p>
              </div>
              <div>
                <p className="text-xs text-bw-500 uppercase font-semibold mb-1">
                  Payment Method
                </p>
                <p className="font-medium text-bw-900 capitalize">
                  {paymentMethod || "Cash"}
                </p>
              </div>
            </div>

            {/* Products Table */}
            <div className="mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-bw-900 bg-bw-100">
                    <th className="text-left py-3 px-2 font-semibold">#</th>
                    <th className="text-left py-3 px-2 font-semibold">Item</th>
                    <th className="text-center py-3 px-2 font-semibold">Qty</th>
                    <th className="text-right py-3 px-2 font-semibold">
                      Unit Price
                    </th>
                    <th className="text-right py-3 px-2 font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => {
                    const itemPrice =
                      typeof item.price === "string"
                        ? parseFloat(item.price)
                        : item.price;
                    const itemTotal = itemPrice * item.quantity;

                    return (
                      <tr key={item.id} className="border-b border-bw-200">
                        <td className="py-3 px-2 text-bw-600">{index + 1}</td>
                        <td className="py-3 px-2 font-medium">{item.name}</td>
                        <td className="text-center py-3 px-2">
                          {item.quantity}
                        </td>
                        <td className="text-right py-3 px-2">
                          ${itemPrice.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-2 font-semibold">
                          ${itemTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-bw-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-bw-600">Discount:</span>
                    <span className="font-medium text-green-600">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-bw-600">Tax:</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t-2 border-bw-900 mt-2">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold text-bw-900">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-bw-200">
              <p className="text-xs text-bw-500">
                Thank you for your business!
              </p>
              <p className="text-xs text-bw-400 mt-1">
                This is a computer-generated invoice
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => printView("invoice-content")}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
