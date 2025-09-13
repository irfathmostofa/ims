"use client";

import InvoiceProductList from "@/components/Return/InvoiceProductList";
import InvoiceSelector from "@/components/Return/InvoiceSelector";
import ReturnCart from "@/components/Return/ReturnCart";
import ReturnCustomerInfo from "@/components/Return/ReturnCustomerInfo";
import ReturnInvoiceModal from "@/components/Return/ReturnInvoiceModal";
import { useState } from "react";

// Dummy invoices
const invoices = Array.from({ length: 100 }, (_, i) => ({
  id: `INV-10${i + 1}`,
  customer: {
    name: `Md Irfath Chowdhury Joy ${i + 1}`,
    phone: `555000${i + 1}`,
    address: `City ${i + 1}, Country`,
  },
  products: [
    {
      id: 100 + i * 2,
      name: `Product ${i * 2 + 1}`,
      price: 100 + i,
      qty: (i % 3) + 1,
    },
    {
      id: 101 + i * 2,
      name: `Product ${i * 2 + 2}`,
      price: 150 + i,
      qty: (i % 2) + 1,
    },
    {
      id: 102 + i * 2,
      name: `Product ${i * 2 + 3}`,
      price: 190 + i,
      qty: (i % 2) + 1,
    },
  ],
  date: `2025-08-${((i % 30) + 1).toString().padStart(2, "0")}`,
}));

export default function ReturnPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [returnCart, setReturnCart] = useState<any[]>([]);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const addToReturnCart = (product: any) => {
    setReturnCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: Math.min(item.qty + 1, product.qty) }
            : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const adjustQuantity = (id: number, delta: number) => {
    setReturnCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setReturnCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalRefund = returnCart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const handleConfirmReturn = () => {
    if (!selectedInvoice) {
      alert("Please select an invoice first.");
      return;
    }
    if (returnCart.length === 0) {
      alert("No items selected for return.");
      return;
    }
    setInvoiceOpen(true);
  };

  const handleClear = () => {
    setReturnCart([]);
    setSelectedInvoice(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full w-full">
      {/* Left: Customer + Invoice Selector + Products */}
      <div className="flex-1 flex flex-col gap-4">
        <InvoiceSelector
          invoices={invoices}
          selectedInvoice={selectedInvoice}
          setSelectedInvoice={setSelectedInvoice}
        />
        {selectedInvoice && (
          <>
            <div className="flex gap-2">
              <ReturnCustomerInfo customer={selectedInvoice.customer} />
              <InvoiceProductList
                products={selectedInvoice.products}
                addToReturnCart={addToReturnCart}
              />
            </div>
          </>
        )}
      </div>

      {/* Right: Return Cart */}
      <ReturnCart
        cart={returnCart}
        adjustQuantity={adjustQuantity}
        removeFromCart={removeFromCart}
        totalRefund={totalRefund}
        handleConfirmReturn={handleConfirmReturn}
        handleClear={handleClear}
      />

      {/* Return Invoice Modal */}
      <ReturnInvoiceModal
        isOpen={invoiceOpen}
        setIsOpen={setInvoiceOpen}
        invoice={selectedInvoice}
        cart={returnCart}
        totalRefund={totalRefund}
      />
    </div>
  );
}
