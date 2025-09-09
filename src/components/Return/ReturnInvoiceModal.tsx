"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ReturnInvoiceModal({
  isOpen,
  setIsOpen,
  invoice,
  cart,
  totalRefund,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  invoice: any;
  cart: any[];
  totalRefund: number;
}) {
  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Return Invoice</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-2">
          <p>Invoice ID: {invoice.id}</p>
          <p>Customer: {invoice.customer.name}</p>
          <p>Phone: {invoice.customer.phone}</p>
          <p>Address: {invoice.customer.address}</p>
          <hr />
          <h3 className="font-bold">Returned Items</h3>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.qty}
              </span>
              <span>${item.price * item.qty}</span>
            </div>
          ))}
          <hr />
          <p className="font-bold text-red-600">
            Refund Amount: ${totalRefund}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
