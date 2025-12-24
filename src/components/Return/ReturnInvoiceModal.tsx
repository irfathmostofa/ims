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

export default function ReturnInvoiceModal({
  isOpen,
  setIsOpen,
  invoice,
  invoiceDetails,
  cart,
  totalRefund,
  handleClear,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  invoice: any;
  invoiceDetails: any;
  cart: any[];
  totalRefund: number;
  handleClear: () => void;
}) {
  if (!invoice) return null;

  const handlePrint = () => {
    printView("return-invoice-content");
  };

  const handleClose = () => {
    handleClear();
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-green-600">
            Return Processed Successfully
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4" id="return-invoice-content">
          <div className="border-b pb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">Return Receipt</h3>
                <p className="text-sm text-gray-600">
                  Original Invoice: {invoice.code}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Customer Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>{" "}
                {invoiceDetails?.party_name || "N/A"}
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>{" "}
                {invoiceDetails?.party_phone || "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Returned Items</h4>
            <div className="border rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Product</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-right p-2">Price</th>
                    <th className="text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{item.name}</td>
                      <td className="text-center p-2">{item.quantity}</td>
                      <td className="text-right p-2">
                        ৳{item.price.toFixed(2)}
                      </td>
                      <td className="text-right p-2 font-medium">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total Refund Amount:</span>
              <span className="text-xl font-bold text-red-600">
                ৳{totalRefund.toFixed(2)}
              </span>
            </div>

            {invoiceDetails && (
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Original Invoice Total:</span>
                  <span>
                    ৳{parseFloat(invoiceDetails.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span>
                    ৳{parseFloat(invoiceDetails.paid_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 font-medium">
                  <span>New Balance Due:</span>
                  <span className="text-red-600">
                    ৳
                    {(
                      parseFloat(invoiceDetails.due_amount || 0) + totalRefund
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated return receipt.</p>
            <p className="mt-1">Please retain this copy for your records.</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
