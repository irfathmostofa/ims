"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
};

export default function InvoiceModal({
  isOpen,
  setIsOpen,
  customerName,
  cart,
  total,
  paymentMethod,
}: InvoiceModalProps) {
  const date = new Date().toLocaleString();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg w-full bg-bw-50">
        <DialogHeader>
          <DialogTitle>Invoice</DialogTitle>
        </DialogHeader>

        <div className="mt-2 text-bw-900">
          {/* Shop Info */}
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold">InventorySys</h2>
            <p className="text-sm text-bw-700">{date}</p>
          </div>

          {/* Customer & Payment Info */}
          <div className="mb-4 flex justify-between text-sm text-bw-800">
            <div>
              <p>
                <strong>Customer:</strong> {customerName || "Walk-in"}
              </p>
            </div>
            <div>
              <p>
                <strong>Payment:</strong> {paymentMethod || "Cash"}
              </p>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-bw-200">
                  <th className="text-left py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="border-b border-bw-200">
                    <td className="py-1">{item.name}</td>
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-right py-1">${item.price}</td>
                    <td className="text-right py-1">
                      ${item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end text-lg font-bold">
            <p>Total: ${total}</p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button className="w-full" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
