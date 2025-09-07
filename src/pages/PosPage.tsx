"use client";

import Cart from "@/components/POS/Cart";
import CustomerInfo from "@/components/POS/CustomerInfo";
import InvoiceModal from "@/components/POS/InvoiceModal";
import ProductCategory from "@/components/POS/ProductCategory";
import ProductList from "@/components/POS/ProductList";
import { useState } from "react";

// Dummy categories
const categories = ["All", "Electronics", "Accessories", "Furniture"];

export default function POSPage() {
  const [cart, setCart] = useState<
    { id: number; name: string; price: number; quantity: number }[]
  >([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [invoiceOpen, setInvoiceOpen] = useState(false);

  // Cart operations
  const addToCart = (product: { id: number; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const adjustQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Actions
  const handleSave = () => {
    if (!customerName) {
      alert("Please enter customer name");
      return;
    }
    // Open invoice modal instead of alert
    setInvoiceOpen(true);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the cart?")) {
      setCart([]);
      setCustomerName("");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full w-full">
      {/* Left: Customer + Category + Products */}
      <div className="w-full md:w-30 flex flex-col gap-1">
        <ProductCategory
          categories={categories}
          category={category}
          setCategory={setCategory}
        />
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <CustomerInfo
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerAddress={customerAddress}
          setCustomerAddress={setCustomerAddress}
        />

        <ProductList
          search={search}
          setSearch={setSearch}
          category={category}
          addToCart={addToCart}
        />
      </div>

      {/* Right: Cart */}
      <Cart
        cart={cart}
        adjustQuantity={adjustQuantity}
        removeFromCart={removeFromCart}
        total={total}
        handleSave={handleSave}
        handleClear={handleClear}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceOpen}
        setIsOpen={setInvoiceOpen}
        customerName={customerName}
        cart={cart}
        total={total}
        paymentMethod="Cash"
      />
    </div>
  );
}
