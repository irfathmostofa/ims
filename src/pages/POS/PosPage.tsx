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

// Define cart item type
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

// Define types for Cart component props
type PaymentType = "paid" | "partial" | "due";
type PaymentMethod = "cash" | "card" | "online" | "";

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [invoiceId, setInvoiceId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentType, setPaymentType] = useState<PaymentType>("paid");
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);
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
  const handleClear = () => {
    if (
      cart.length > 0 &&
      confirm("Are you sure you want to clear the cart?")
    ) {
      clearNoConfirm();
    }
  };

  const clearNoConfirm = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerId(null);
    setSearch("");
    setCategory("All");
    setPaymentMethod("cash");
    setPaymentType("paid");
    setPartialAmount("");
  };

  const cartClear = () => {
    setCart([]);
  };

  const addCustomer = async (): Promise<number | null> => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return null;
    }

    const formData = {
      name: customerName.trim(),
      branch_id: user?.branch?.id,
      phone: customerPhone.trim(),
      address: customerAddress.trim(),
      type: "CUSTOMER",
    };

    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/party/create-party`,
        {
          method: "POST",
          tokenType: "jwt",
          data: formData,
        }
      );

      toast.success(data.message || "Customer created successfully");
      return data.data?.id || null;
    } catch (err: any) {
      toast.error(err.message || "Failed to create customer");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!user?.branch?.id) {
      toast.error("Branch information is missing");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      setLoading(true);

      let finalCustomerId = customerId;
      let finalPaymentAmount = total;

      // Calculate payment amount based on payment type
      if (paymentType === "partial") {
        const partial = parseFloat(partialAmount);
        if (isNaN(partial) || partial <= 0 || partial > total) {
          toast.error("Invalid partial amount");
          setLoading(false);
          return;
        }
        finalPaymentAmount = partial;
      } else if (paymentType === "due") {
        finalPaymentAmount = 0;
      }

      // If no customer ID, create customer first
      if (!finalCustomerId) {
        const newCustomerId = await addCustomer();
        if (!newCustomerId) {
          setLoading(false);
          return;
        }
        finalCustomerId = newCustomerId;
      }

      // Create invoice
      const invoiceItems = cart.map((item) => ({
        product_variant_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        discount: 0,
      }));

      const formData = {
        branch_id: user?.branch?.id,
        party_id: finalCustomerId,
        type: "SALE" as const,
        invoice_date: new Date().toISOString().split("T")[0],
        items: invoiceItems,
        payments: [
          {
            method: (paymentMethod || "cash").toUpperCase() as
              | "CASH"
              | "CARD"
              | "ONLINE",
            amount: finalPaymentAmount,
            reference_no: null,
          },
        ],
      };

      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/sales/create-invoices`,
        {
          method: "POST",
          tokenType: "jwt",
          data: formData,
        }
      );
      setInvoiceId(data.data?.code || data.data?.id || `INV-${Date.now()}`);
      toast.success(data.message || "Invoice created successfully");
      setInvoiceOpen(true);
      setUpdate(update + 1);
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
      <div className="w-full md:w-48 flex flex-col gap-2">
        <ProductCategory category={category} setCategory={setCategory} />
      </div>
      {/* Center: Customer + Products */}
      <div className="flex-1 flex flex-col gap-2">
        <CustomerInfo
          customerId={customerId || 0}
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
          update={update}
          setUpdate={setUpdate}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          addToCart={addToCart}
        />
      </div>

      {/* Right: Cart */}
      <Cart
        loading={loading}
        cart={cart}
        setCart={setCart}
        adjustQuantity={adjustQuantity}
        removeFromCart={removeFromCart}
        total={total}
        handleClear={handleClear}
        clearAfterSave={clearNoConfirm}
        handlePay={handlePay}
        cartClear={cartClear}
        customerName={customerName}
        customerPhone={customerPhone}
        customerAddress={customerAddress}
        setCustomerName={setCustomerName}
        setCustomerPhone={setCustomerPhone}
        setCustomerAddress={setCustomerAddress}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        partialAmount={partialAmount}
        setPartialAmount={setPartialAmount}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceOpen}
        setIsOpen={setInvoiceOpen}
        customerName={customerName}
        customerPhone={customerPhone}
        customerAddress={customerAddress}
        cart={cart}
        total={total}
        paymentMethod={paymentMethod}
        paymentType={paymentType}
        paidAmount={
          paymentType === "partial"
            ? parseFloat(partialAmount || "0")
            : paymentType === "paid"
            ? total
            : 0
        }
        invoiceNumber={invoiceId}
        handleClear={clearNoConfirm}
      />
    </div>
  );
}
