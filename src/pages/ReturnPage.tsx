"use client";

import InvoiceProductList from "@/components/Return/InvoiceProductList";
import InvoiceSelector from "@/components/Return/InvoiceSelector";
import ReturnCart from "@/components/Return/ReturnCart";
import ReturnCustomerInfo from "@/components/Return/ReturnCustomerInfo";
import ReturnInvoiceModal from "@/components/Return/ReturnInvoiceModal";
import { useState } from "react";

// Dummy invoices
const invoices = [
  {
    id: "INV-1001",
    customer: {
      name: "Alice Johnson",
      phone: "1234567890",
      address: "New York, USA",
    },
    products: [
      { id: 1, name: "Laptop", price: 1200, qty: 1 },
      { id: 2, name: "Mouse", price: 50, qty: 2 },
    ],
    date: "2025-10-01",
  },
  {
    id: "INV-1002",
    customer: {
      name: "Bob Smith",
      phone: "9876543210",
      address: "California, USA",
    },
    products: [
      { id: 3, name: "Keyboard", price: 70, qty: 1 },
      { id: 4, name: "Headphones", price: 150, qty: 1 },
    ],
    date: "2025-09-01",
  },
];

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
            <ReturnCustomerInfo customer={selectedInvoice.customer} />
            <InvoiceProductList
              products={selectedInvoice.products}
              addToReturnCart={addToReturnCart}
            />
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
