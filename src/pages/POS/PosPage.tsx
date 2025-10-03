"use client";

import Cart from "@/components/POS/Cart";
import CustomerInfo from "@/components/POS/CustomerInfo";
import InvoiceModal from "@/components/POS/InvoiceModal";
import ProductCategory from "@/components/POS/ProductCategory";

import ProductList from "@/components/POS/ProductList";
import { apiClient } from "@/hook/apiClient";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { toast } from "sonner";

export default function POSPage() {
  const [cart, setCart] = useState<
    { id: number; name: string; price: number; quantity: number }[]
  >([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customerId, setCustomerId] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [Loading, setLoading] = useState(false);
  const { user } = useAuthStore();

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
  // Confirmed clear (used by "Clear / New" buttons)
  const handleClear = () => {
    if (confirm("Are you sure you want to clear the cart?")) {
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setSearch("");
      setCategory("All");
    }
  };

  // Clear without confirmation (used by Cart after a successful save)
  const clearNoConfirm = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setSearch("");
    setCategory("All");
  };
  const cartClear = () => {
    setCart([]);
    setSearch("");
    setCategory("All");
  };

  const handlePay = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!user?.branch_id) {
      toast.error("Branch information is missing");
      return;
    }

    const invoiceItems = cart.map((item) => ({
      product_variant_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      discount: 0,
    }));

    // Correct formData structure
    const formData = {
      branch_id: user.branch_id,
      party_id: customerId || null, // null if no customer selected
      type: "SALE" as const,
      invoice_date: new Date().toISOString().split("T")[0],
      items: invoiceItems,
      payments: [
        // Array of payments
        {
          method: paymentMethod,
          amount: total,
          reference_no: null,
        },
      ],
    };

    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/create-invoices`, 
        {
          method: "POST",
          tokenType: "jwt",
          data: formData,
        }
      );

      toast.success(data.message || "Invoice created successfully");
      clearNoConfirm(); // Clear cart after success
      setInvoiceOpen(true);
    } catch (err: any) {
      console.error("Invoice creation error:", err);
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full w-full">
      {/* Left: Category column */}
      <div className="w-full md:w-30 flex flex-col gap-1">
        <ProductCategory category={category} setCategory={setCategory} />
      </div>

      {/* Center: Customer + Products */}
      <div className="flex-1 flex flex-col gap-4">
        <CustomerInfo
          customerId={customerId}
          setCustomerId={setCustomerId}
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

      {/* Right: Cart (now manages saved carts locally) */}
      <Cart
        cart={cart}
        setCart={setCart}
        adjustQuantity={adjustQuantity}
        removeFromCart={removeFromCart}
        total={total}
        handleClear={handleClear} // confirmed clear
        clearAfterSave={clearNoConfirm} // clear without confirm after save
        handlePay={handlePay}
        cartClear={cartClear}
        // pass customer info/setters so restore can fill them
        customerName={customerName}
        customerPhone={customerPhone}
        customerAddress={customerAddress}
        setCustomerName={setCustomerName}
        setCustomerPhone={setCustomerPhone}
        setCustomerAddress={setCustomerAddress}
        setPaymentMethod={setPaymentMethod}
        paymentMethod={paymentMethod}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceOpen}
        setIsOpen={setInvoiceOpen}
        customerName={customerName}
        cart={cart}
        total={total}
        paymentMethod={paymentMethod}
      />
    </div>
  );
}
